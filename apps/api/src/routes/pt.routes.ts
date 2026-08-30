import { RecordPtCollectionRequestSchema, SettlePtCommissionRequestSchema } from '@gymtech/shared';
import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { requireGym, requireFeature } from '../lib/tenant';
import { paramId, requireRoles } from '../lib/route-helpers';
import { calculatePtCommission } from '../lib/calculations';
import { MemberRepository } from '../repositories/member.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { AuditService } from '../services/audit.service';

export function registerPtRoutes(router: NativeRouter): void {
  // List PT collections
  router.get('/api/pt/collections', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'pt_collections');
    if (featErr) return featErr;

    const isTrainer = ctx.user!.role === 'TRAINER';
    const trainerId = isTrainer ? ctx.user!.id : (ctx.query.get('trainerId') ? parseInt(ctx.query.get('trainerId')!, 10) : null);
    const limit = Math.min(parseInt(ctx.query.get('limit') || '100', 10), 500);

    let sql = `
      SELECT pt.*,
             m.first_name || ' ' || COALESCE(m.last_name, '') as member_name, m.member_code,
             u.name as trainer_name
      FROM pt_collections pt
      JOIN members m ON m.id = pt.member_id
      LEFT JOIN users u ON u.id = pt.trainer_id
      WHERE pt.gym_id = ?
    `;
    const binds: any[] = [ctx.gymId!];
    if (trainerId) {
      sql += ' AND pt.trainer_id = ?';
      binds.push(trainerId);
    }
    sql += ' ORDER BY pt.payment_date DESC LIMIT ?';
    binds.push(limit);

    const rows = await ctx.env.DB.prepare(sql).bind(...binds).all();
    return json({ collections: rows.results || [] });
  });

  // Get PT summary
  router.get('/api/pt/summary', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'pt_collections');
    if (featErr) return featErr;

    if (ctx.user?.role === 'MANAGER') {
      return json({
        totalCollected: 0,
        totalCommissionPending: 0,
        totalCommissionPaid: 0,
        byTrainer: [],
      });
    }

    const isTrainer = ctx.user!.role === 'TRAINER';

    const totalsSql = isTrainer
      ? `SELECT
           COALESCE(SUM(amount_paise), 0) as total_collected,
           COALESCE(SUM(CASE WHEN commission_status = 'PENDING' THEN commission_paise END), 0) as commission_pending,
           COALESCE(SUM(CASE WHEN commission_status = 'PAID' THEN commission_paise END), 0) as commission_paid
         FROM pt_collections WHERE gym_id = ? AND trainer_id = ?`
      : `SELECT
           COALESCE(SUM(amount_paise), 0) as total_collected,
           COALESCE(SUM(CASE WHEN commission_status = 'PENDING' THEN commission_paise END), 0) as commission_pending,
           COALESCE(SUM(CASE WHEN commission_status = 'PAID' THEN commission_paise END), 0) as commission_paid
         FROM pt_collections WHERE gym_id = ?`;
    const totalsStmt = isTrainer
      ? ctx.env.DB.prepare(totalsSql).bind(ctx.gymId!, ctx.user!.id)
      : ctx.env.DB.prepare(totalsSql).bind(ctx.gymId!);
    const totals: any = await totalsStmt.first();

    const byTrainerSql = `
      SELECT
        pt.trainer_id,
        COALESCE(u.name, 'Unknown Trainer') as trainer_name,
        COUNT(*) as collections,
        COALESCE(SUM(pt.amount_paise), 0) as collected,
        COALESCE(SUM(CASE WHEN pt.commission_status = 'PENDING' THEN pt.commission_paise END), 0) as commission_pending,
        COALESCE(SUM(CASE WHEN pt.commission_status = 'PAID' THEN pt.commission_paise END), 0) as commission_paid
      FROM pt_collections pt
      LEFT JOIN users u ON u.id = pt.trainer_id
      WHERE pt.gym_id = ?${isTrainer ? ' AND pt.trainer_id = ?' : ''}
      GROUP BY pt.trainer_id
      ORDER BY collected DESC
    `;
    const byTrainerStmt = isTrainer
      ? ctx.env.DB.prepare(byTrainerSql).bind(ctx.gymId!, ctx.user!.id)
      : ctx.env.DB.prepare(byTrainerSql).bind(ctx.gymId!);
    const byTrainer = await byTrainerStmt.all();

    return json({
      totalCollected: totals?.total_collected || 0,
      totalCommissionPending: totals?.commission_pending || 0,
      totalCommissionPaid: totals?.commission_paid || 0,
      byTrainer: byTrainer.results || [],
    });
  });

  // Record PT collection
  router.post('/api/pt/collections', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'pt_collections');
    if (featErr) return featErr;

    const body = await req.json().catch(() => ({}));
    const parsed = RecordPtCollectionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid PT collection payload', 400);
    }

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const member = await memberRepo.findById(parsed.data.memberId);
    if (!member) return errorResponse('Member not found', 404);

    const trainerId = ctx.user!.role === 'TRAINER' ? ctx.user!.id : parsed.data.trainerId;
    const trainer: any = await ctx.env.DB.prepare(
      `SELECT id, name FROM users WHERE id = ? AND gym_id = ? AND role IN ('TRAINER', 'OWNER', 'MANAGER') AND deleted_at IS NULL`
    ).bind(trainerId, ctx.gymId!).first();
    if (!trainer) return errorResponse('Trainer not found in this gym', 404);

    const commissionPaise = calculatePtCommission(parsed.data.amountPaise, parsed.data.commissionPercentage);
    const paymentDate = parsed.data.paymentDate
      ? Math.floor(new Date(parsed.data.paymentDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const paymentRepo = new PaymentRepository(ctx.env.DB, ctx.gymId!);
    const receiptNumber = await paymentRepo.getNextReceiptNumber();

    const res = await ctx.env.DB.prepare(`
      INSERT INTO pt_collections (
        gym_id, member_id, trainer_id, sessions, amount_paise,
        commission_percentage, commission_paise, commission_status,
        payment_mode, payment_date, receipt_number, notes, recorded_by_user_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, unixepoch(), unixepoch())
    `).bind(
      ctx.gymId!,
      parsed.data.memberId,
      trainerId,
      parsed.data.sessions,
      parsed.data.amountPaise,
      parsed.data.commissionPercentage,
      commissionPaise,
      parsed.data.paymentMode,
      paymentDate,
      receiptNumber,
      parsed.data.notes ?? null,
      ctx.user!.id
    ).run();

    const audit = new AuditService(ctx.env.DB);
    await audit.recordGymEvent({
      gymId: ctx.gymId!,
      actorUserId: ctx.user!.id,
      actorRole: ctx.user!.role,
      action: 'pt_collection.create',
      entityType: 'pt_collection',
      entityId: Number(res.meta?.last_row_id ?? 0),
      afterState: { amount_paise: parsed.data.amountPaise, commission_paise: commissionPaise },
    });

    return json({ id: Number(res.meta?.last_row_id ?? 0), receiptNumber, commissionPaise }, 201);
  });

  // Settle PT commission
  router.post('/api/pt/collections/:id/settle', async (req, ctx) => {
    const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = SettlePtCommissionRequestSchema.safeParse(body);
    if (!parsed.success) return errorResponse('Invalid settlement payload', 400);

    const existing: any = await ctx.env.DB.prepare(
      `SELECT id FROM pt_collections WHERE id = ? AND gym_id = ?`
    ).bind(id, ctx.gymId!).first();
    if (!existing) return errorResponse('PT collection not found', 404);

    await ctx.env.DB.prepare(
      `UPDATE pt_collections SET commission_status = ?, updated_at = unixepoch() WHERE id = ? AND gym_id = ?`
    ).bind(parsed.data.status, id, ctx.gymId!).run();

    const audit = new AuditService(ctx.env.DB);
    await audit.recordGymEvent({
      gymId: ctx.gymId!,
      actorUserId: ctx.user!.id,
      actorRole: ctx.user!.role,
      action: 'pt_collection.settle',
      entityType: 'pt_collection',
      entityId: id,
      afterState: { status: parsed.data.status },
    });

    return json({ success: true, id, status: parsed.data.status });
  });
}
