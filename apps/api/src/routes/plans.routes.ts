import { CreatePlanRequestSchema, GymMembershipPlan } from '@gymtech/shared';
import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { requireGym, requireFeature, requireRole } from '../lib/tenant';
import { paramId, auditGym } from '../lib/route-helpers';
import { PlanRepository } from '../repositories/plan.repository';

export function registerPlanRoutes(router: NativeRouter): void {
  // List plans
  router.get('/api/plans', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'plans');
    if (featErr) return featErr;

    const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
    const plans = await planRepo.listAll();
    return json({ plans });
  });

  // Create plan
  router.post('/api/plans', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'plans');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    const body = await req.json().catch(() => ({}));
    const parsed = CreatePlanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid plan payload', 400);
    }

    const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
    const id = await planRepo.create({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      duration_months: parsed.data.durationMonths,
      price_paise: parsed.data.pricePaise,
      admission_fee_paise: parsed.data.admissionFeePaise,
      tax_percentage: parsed.data.taxPercentage,
      is_active: 1,
      deleted_at: null,
    });

    const created = await planRepo.findById(id);
    await auditGym(ctx, 'plan.create', 'membership_plan', id, { after: created, req });
    return json(created, 201);
  });

  // Update plan
  router.put('/api/plans/:id', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'plans');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
    const before = await planRepo.findById(id);
    if (!before) return errorResponse('Plan not found', 404);

    await planRepo.update(id, body as Partial<GymMembershipPlan>);
    const after = await planRepo.findById(id);
    await auditGym(ctx, 'plan.update', 'membership_plan', id, { before, after, req });
    return json(after);
  });

  // Archive plan
  router.delete('/api/plans/:id', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'plans');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
    const before = await planRepo.findById(id);
    if (!before) return errorResponse('Plan not found or already archived', 404);

    await planRepo.softDelete(id);
    await auditGym(ctx, 'plan.soft_delete', 'membership_plan', id, { before, req });
    return json({ success: true, message: 'Plan archived successfully.' });
  });

  // Restore plan
  router.post('/api/plans/:id/restore', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'plans');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
    const success = await planRepo.restore(id);
    if (!success) return errorResponse('Plan not found in archive', 404);

    await auditGym(ctx, 'plan.restore', 'membership_plan', id, { req });
    return json({ success: true, message: 'Plan restored successfully.' });
  });
}
