import {
  CreateMemberRequestSchema,
  UpdateMemberRequestSchema,
  BulkImportMembersRequestSchema,
  RenewMembershipRequestSchema,
  FreezeMemberRequestSchema,
} from '@gymtech/shared';
import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { requireGym, requireFeature, requireRole } from '../lib/tenant';
import { paramId, auditGym, requireRoles } from '../lib/route-helpers';
import { calculateFreezeExtension } from '../lib/calculations';
import { MemberRepository } from '../repositories/member.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { MemberService } from '../services/member.service';
import { LicenseService } from '../services/license.service';
import { EmailService } from '../services/email.service';
import { AuditService } from '../services/audit.service';

export function registerMemberRoutes(router: NativeRouter): void {
  // List members
  router.get('/api/members', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const search = ctx.query.get('search') || undefined;
    const status = ctx.query.get('status') || undefined;
    const limit = parseInt(ctx.query.get('limit') || '100', 10);
    const offset = parseInt(ctx.query.get('offset') || '0', 10);

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const members = await memberRepo.list({ search, status, limit, offset });
    return json({ members });
  });

  // Create member
  router.post('/api/members', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const body = await req.json().catch(() => ({}));
    const parsed = CreateMemberRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid member data', 400);
    }

    const memberService = new MemberService(ctx.env.DB, ctx.gymId!, ctx.user!.id, tenant.gym.name);
    try {
      const result = await memberService.createMemberWithPlan({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        email: parsed.data.email && parsed.data.email.length > 0 ? parsed.data.email : undefined,
        gender: parsed.data.gender,
        dateOfBirth: parsed.data.dateOfBirth
          ? Math.floor(new Date(parsed.data.dateOfBirth).getTime() / 1000)
          : undefined,
        joinedDate: parsed.data.joinedDate
          ? Math.floor(new Date(parsed.data.joinedDate).getTime() / 1000)
          : undefined,
        photoUrl: parsed.data.photoUrl,
        faceEmbedding: parsed.data.faceEmbedding,
        address: parsed.data.address,
        city: parsed.data.city,
        pincode: parsed.data.pincode,
        emergencyContactName: parsed.data.emergencyContactName,
        emergencyContactPhone: parsed.data.emergencyContactPhone,
        healthNotes: parsed.data.healthNotes,
        planId: parsed.data.planId,
        discountPaise: parsed.data.discountPaise,
        initialPaymentPaise: parsed.data.initialPaymentPaise,
        paymentMode: parsed.data.paymentMode,
        referenceId: parsed.data.referenceId,
      });

      if (parsed.data.email) {
        try {
          const emailService = new EmailService(ctx.env);
          await emailService.sendWelcomeEmail({
            to: parsed.data.email,
            name: `${result.member.first_name} ${result.member.last_name || ''}`.trim(),
            gymName: tenant.gym.name,
            memberCode: result.member.member_code,
            planName: result.membership?.membership_plan_id ? String(result.membership.membership_plan_id) : 'Active Membership',
          });
        } catch (e: any) {
          console.warn('Welcome email failed:', e.message);
        }
      }

      return json(result, 201);
    } catch (e: any) {
      return errorResponse(e.message, 400);
    }
  });

  // Bulk Import
  router.post('/api/members/bulk-import', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const body = await req.json().catch(() => ({}));
    const parsed = BulkImportMembersRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid bulk import payload', 400);
    }

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const result = await memberRepo.bulkCreateMembers(
      parsed.data.members,
      ctx.user!.id,
      parsed.data.defaultPlanId
    );
    return json({
      success: true,
      totalProcessed: parsed.data.members.length,
      importedCount: result.importedCount,
      skippedCount: result.skippedCount,
      errors: result.errors,
    }, 201);
  });

  // Get Member by ID
  router.get('/api/members/:id', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const memberService = new MemberService(ctx.env.DB, ctx.gymId!, ctx.user!.id, tenant.gym.name);
    try {
      return json(await memberService.getMemberDetails(id));
    } catch (e: any) {
      return errorResponse(e.message, 404);
    }
  });

  // Update Member
  router.put('/api/members/:id', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateMemberRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid update payload', 400);
    }

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const before = await memberRepo.findById(id);
    if (!before) return errorResponse('Member not found', 404);

    await memberRepo.update(id, {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      gender: parsed.data.gender,
      date_of_birth: parsed.data.dateOfBirth
        ? Math.floor(new Date(parsed.data.dateOfBirth).getTime() / 1000)
        : undefined,
      photo_url: parsed.data.photoUrl,
      face_embedding: parsed.data.faceEmbedding,
      address: parsed.data.address,
      emergency_contact_name: parsed.data.emergencyContactName,
      emergency_contact_phone: parsed.data.emergencyContactPhone,
      health_notes: parsed.data.healthNotes,
      status: parsed.data.status,
    });

    const after = await memberRepo.findById(id);
    await auditGym(ctx, 'member.update', 'member', id, { before, after, req });
    return json(after);
  });

  // Soft Delete Member
  router.delete('/api/members/:id', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'members');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER', 'MANAGER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const before = await memberRepo.findById(id);
    if (!before) return errorResponse('Member not found or already archived', 404);

    await memberRepo.softDelete(id);
    await auditGym(ctx, 'member.soft_delete', 'member', id, {
      before,
      after: { ...before, deleted_at: Math.floor(Date.now() / 1000), status: 'INACTIVE' },
      req,
    });

    return json({ success: true, message: 'Member archived successfully. Historical records preserved.' });
  });

  // Restore Member
  router.post('/api/members/:id/restore', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'members');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const licenseService = new LicenseService(ctx.env.DB, ctx.gymId!);
    const limitCheck = await licenseService.checkMemberLimit();
    if (!limitCheck.allowed) {
      return errorResponse(`Cannot restore member: ${limitCheck.reason}`, 403);
    }

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const success = await memberRepo.restore(id);
    if (!success) return errorResponse('Member not found in archive', 404);

    const restored = await memberRepo.findById(id);
    await auditGym(ctx, 'member.restore', 'member', id, { after: restored, req });

    return json({ success: true, member: restored, message: 'Member restored to active roster.' });
  });

  // Renew Membership
  router.post('/api/members/:id/renew', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'members');
    if (featErr) return featErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = RenewMembershipRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid renewal payload', 400);
    }

    const memberRepo = new MemberRepository(ctx.env.DB, ctx.gymId!);
    const member = await memberRepo.findById(id);
    if (!member || member.status === 'BLOCKED') {
      return errorResponse('Cannot renew membership for an archived or blocked member', 400);
    }

    const planRepo = new PlanRepository(ctx.env.DB, ctx.gymId!);
    const plan = await planRepo.findById(parsed.data.planId);
    if (!plan || plan.is_active !== 1) {
      return errorResponse('Selected plan is inactive or no longer available', 400);
    }

    const memberService = new MemberService(ctx.env.DB, ctx.gymId!, ctx.user!.id, tenant.gym.name);
    try {
      const result = await memberService.renewMembership({
        memberId: id,
        planId: parsed.data.planId,
        startDate: parsed.data.startDate
          ? Math.floor(new Date(parsed.data.startDate).getTime() / 1000)
          : undefined,
        discountPaise: parsed.data.discountPaise,
        paymentPaise: parsed.data.paymentPaise,
        paymentMode: parsed.data.paymentMode,
        referenceId: parsed.data.referenceId,
        notes: parsed.data.notes,
      });
      await auditGym(ctx, 'membership.renew', 'membership', result.membershipId, {
        after: { planId: parsed.data.planId, memberId: id },
        req,
      });
      return json(result);
    } catch (e: any) {
      return errorResponse(e.message, 400);
    }
  });

  // Freeze Membership
  router.post('/api/members/:id/freeze', async (req, ctx) => {
    const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = FreezeMemberRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid freeze payload', 400);
    }

    const member: any = await ctx.env.DB.prepare(
      `SELECT * FROM members WHERE id = ? AND gym_id = ? AND deleted_at IS NULL`
    ).bind(id, ctx.gymId!).first();
    if (!member) return errorResponse('Member not found', 404);
    if (member.status === 'FROZEN') return errorResponse('Membership is already frozen', 409);
    if (member.status === 'CANCELLED') return errorResponse('Cancelled memberships cannot be frozen', 409);

    const nowSec = Math.floor(Date.now() / 1000);
    const activeMs: any = await ctx.env.DB.prepare(`
      SELECT * FROM memberships
      WHERE member_id = ? AND gym_id = ? AND status = 'ACTIVE' AND end_date > ?
      ORDER BY end_date DESC LIMIT 1
    `).bind(id, ctx.gymId!, nowSec).first();
    if (!activeMs) {
      return errorResponse('Only members with an active membership can be frozen', 409);
    }

    await ctx.env.DB.batch([
      ctx.env.DB.prepare(
        `UPDATE members SET status = 'FROZEN', updated_at = unixepoch() WHERE id = ? AND gym_id = ?`
      ).bind(id, ctx.gymId!),
      ctx.env.DB.prepare(
        `UPDATE memberships SET status = 'FROZEN', frozen_at = ?, updated_at = unixepoch()
         WHERE id = ? AND gym_id = ?`
      ).bind(nowSec, activeMs.id, ctx.gymId!),
    ]);

    const audit = new AuditService(ctx.env.DB);
    await audit.recordGymEvent({
      gymId: ctx.gymId!,
      actorUserId: ctx.user!.id,
      actorRole: ctx.user!.role,
      action: 'member.freeze',
      entityType: 'member',
      entityId: id,
      metadata: { reason: parsed.data.reason },
    });

    return json({
      success: true,
      status: 'FROZEN',
      membershipId: activeMs.id,
      message: 'Membership paused. Remaining days are preserved and will be restored on reactivation.',
    });
  });

  // Unfreeze Membership
  router.post('/api/members/:id/unfreeze', async (req, ctx) => {
    const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const member: any = await ctx.env.DB.prepare(
      `SELECT * FROM members WHERE id = ? AND gym_id = ? AND deleted_at IS NULL`
    ).bind(id, ctx.gymId!).first();
    if (!member) return errorResponse('Member not found', 404);
    if (member.status !== 'FROZEN') return errorResponse('Membership is not currently frozen', 409);

    const nowSec = Math.floor(Date.now() / 1000);
    const frozenMs: any = await ctx.env.DB.prepare(`
      SELECT * FROM memberships
      WHERE member_id = ? AND gym_id = ? AND status = 'FROZEN'
      ORDER BY end_date DESC LIMIT 1
    `).bind(id, ctx.gymId!).first();

    let extendedTo: number | null = null;
    if (frozenMs) {
      const { extendedTo: newEndDate } = calculateFreezeExtension(
        frozenMs.end_date,
        frozenMs.frozen_at || nowSec,
        nowSec
      );
      extendedTo = newEndDate;
      await ctx.env.DB.prepare(`
        UPDATE memberships SET status = 'ACTIVE', end_date = ?, frozen_at = NULL, updated_at = unixepoch()
        WHERE id = ? AND gym_id = ?
      `).bind(extendedTo, frozenMs.id, ctx.gymId!).run();
    }
    await ctx.env.DB.prepare(
      `UPDATE members SET status = 'ACTIVE', updated_at = unixepoch() WHERE id = ? AND gym_id = ?`
    ).bind(id, ctx.gymId!).run();

    const audit = new AuditService(ctx.env.DB);
    await audit.recordGymEvent({
      gymId: ctx.gymId!,
      actorUserId: ctx.user!.id,
      actorRole: ctx.user!.role,
      action: 'member.unfreeze',
      entityType: 'member',
      entityId: id,
      metadata: { extendedTo },
    });

    return json({
      success: true,
      status: 'ACTIVE',
      membershipId: frozenMs?.id || null,
      extendedTo,
      message: extendedTo
        ? `Membership reactivated. New expiry: ${new Date(extendedTo * 1000).toLocaleDateString('en-IN')}.`
        : 'Member reactivated.',
    });
  });
}
