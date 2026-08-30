import { CreateStaffRequestSchema } from '@gymtech/shared';
import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { requireGym, requireFeature, requireRole } from '../lib/tenant';
import { paramId, auditGym } from '../lib/route-helpers';
import { hashPassword } from '../lib/session';
import { UserRepository } from '../repositories/user.repository';
import { LicenseService } from '../services/license.service';

export function registerStaffRoutes(router: NativeRouter): void {
  // List gym staff
  router.get('/api/staff', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'staff');
    if (featErr) return featErr;

    const userRepo = new UserRepository(ctx.env.DB);
    return json({ staff: await userRepo.listGymStaff(ctx.gymId!) });
  });

  // Create staff account
  router.post('/api/staff', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'staff');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    const body = await req.json().catch(() => ({}));
    const parsed = CreateStaffRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid staff payload', 400);
    }

    const userRepo = new UserRepository(ctx.env.DB);
    const existing = await userRepo.findByEmail(parsed.data.email);
    if (existing) return errorResponse('A user with this email already exists', 409);

    const licenseService = new LicenseService(ctx.env.DB, ctx.gymId!);
    if (parsed.data.role === 'MANAGER') {
      const limitCheck = await licenseService.checkManagerLimit();
      if (!limitCheck.allowed) return errorResponse(limitCheck.reason || 'Manager limit reached', 403);
    } else {
      const limitCheck = await licenseService.checkStaffLimit();
      if (!limitCheck.allowed) return errorResponse(limitCheck.reason || 'Staff limit reached', 403);
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const id = await userRepo.create({
      gym_id: ctx.gymId!,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password_hash: passwordHash,
      role: parsed.data.role,
      permissions: JSON.stringify(parsed.data.permissions ?? []),
      status: 'ACTIVE',
    });

    await auditGym(ctx, 'staff.create', 'user', id, { after: { role: parsed.data.role, email: parsed.data.email }, req });

    const created = await userRepo.findById(id);
    return json(created, 201);
  });

  // Archive staff
  router.delete('/api/staff/:id', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'staff');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    if (ctx.user?.id === id) {
      return errorResponse('You cannot archive your own user account', 400);
    }

    const userRepo = new UserRepository(ctx.env.DB);
    const before = await userRepo.findById(id);
    if (!before || before.gym_id !== ctx.gymId!) {
      return errorResponse('Staff member not found in this gym', 404);
    }

    await userRepo.softDelete(id, ctx.gymId!);
    await auditGym(ctx, 'staff.soft_delete', 'user', id, { before, req });

    return json({ success: true, message: 'Staff member archived successfully.' });
  });

  // Restore staff
  router.post('/api/staff/:id/restore', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'staff');
    if (featErr) return featErr;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const userRepo = new UserRepository(ctx.env.DB);
    const licenseService = new LicenseService(ctx.env.DB, ctx.gymId!);
    const limitCheck = await licenseService.checkStaffLimit();
    if (!limitCheck.allowed) {
      return errorResponse(`Cannot restore staff member: ${limitCheck.reason}`, 403);
    }

    const success = await userRepo.restore(id, ctx.gymId!);
    if (!success) return errorResponse('Staff member not found in archive', 404);

    await auditGym(ctx, 'staff.restore', 'user', id, { req });
    return json({ success: true, message: 'Staff member restored successfully.' });
  });
}
