import {
  CreateGymRequestSchema,
  ToggleGymStatusRequestSchema,
  UpdateLicenseRequestSchema,
  UpdateGymFeaturesRequestSchema,
  AdminUserUpdateRequestSchema,
  UpdateLicenseLimitsRequestSchema,
  PlatformCommunicationsConfigSchema,
  TestSmtpRequestSchema,
  TopUpCreditsRequestSchema,
} from '@gymtech/shared';
import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { paramId, auditSaas, requireSuperAdmin } from '../lib/route-helpers';
import { AdminRepository } from '../repositories/admin.repository';
import { LicenseRepository } from '../repositories/license.repository';
import { AuditService } from '../services/audit.service';
import { EmailService } from '../services/email.service';

export function registerAdminRoutes(router: NativeRouter): void {
  // List all gyms
  router.get('/api/admin/gyms', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;
    const adminRepo = new AdminRepository(ctx.env.DB);
    return json({ gyms: await adminRepo.listGyms() });
  });

  // Platform Metrics
  router.get('/api/admin/metrics', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;
    const adminRepo = new AdminRepository(ctx.env.DB);
    return json(await adminRepo.getPlatformMetrics());
  });

  // List all licenses
  router.get('/api/admin/licenses', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;
    const licenseRepo = new LicenseRepository(ctx.env.DB, 0);
    return json({ licenses: await licenseRepo.listAll() });
  });

  // Update License
  router.patch('/api/admin/licenses', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateLicenseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid license payload', 400);
    }
    const licenseRepo = new LicenseRepository(ctx.env.DB, 0);
    const before = await licenseRepo.findByGymId(parsed.data.gymId);
    await licenseRepo.updateByGym(parsed.data.gymId, {
      name: parsed.data.name,
      price_paise: parsed.data.pricePaise,
      max_members: parsed.data.maxMembers,
      max_owners: parsed.data.maxOwners,
      max_managers: parsed.data.maxManagers,
      max_staff_total: parsed.data.maxStaffTotal,
      max_sms: parsed.data.maxSms,
      max_whatsapp: parsed.data.maxWhatsapp,
      max_email: parsed.data.maxEmail,
      features: parsed.data.features,
      expires_at: parsed.data.expiresAt,
      status: parsed.data.status,
    });
    const after = await licenseRepo.findByGymId(parsed.data.gymId);

    const audit = new AuditService(ctx.env.DB);
    await audit.recordSaasEvent({
      actorAdminId: ctx.user!.id,
      affectedGymId: parsed.data.gymId,
      action: 'license.update',
      entityType: 'license',
      entityId: after?.id ?? null,
      beforeState: before,
      afterState: after,
    });

    return json(after);
  });

  // Provision new gym with owner and license
  router.post('/api/admin/gyms', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    const body = await req.json().catch(() => ({}));
    const parsed = CreateGymRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid gym data', 400);
    }

    const adminRepo = new AdminRepository(ctx.env.DB);
    try {
      const result = await adminRepo.createGymWithOwner({
        gymName: parsed.data.gymName,
        slug: parsed.data.slug,
        gymPhone: parsed.data.gymPhone,
        city: parsed.data.city,
        ownerName: parsed.data.ownerName,
        ownerEmail: parsed.data.ownerEmail,
        ownerPhone: parsed.data.ownerPhone,
        ownerPasswordPlain: parsed.data.ownerPassword,
        licenseName: parsed.data.licenseName,
        licenseCode: parsed.data.licenseCode,
        pricePaise: parsed.data.pricePaise,
        billingPeriod: parsed.data.billingPeriod,
        maxMembers: parsed.data.maxMembers,
        maxOwners: parsed.data.maxOwners,
        maxManagers: parsed.data.maxManagers,
        maxStaffTotal: parsed.data.maxStaffTotal,
        features: parsed.data.features,
        durationDays: parsed.data.durationDays,
      });

      const audit = new AuditService(ctx.env.DB);
      await audit.recordSaasEvent({
        actorAdminId: ctx.user!.id,
        affectedGymId: result.gymId,
        action: 'gym.create',
        entityType: 'gym',
        entityId: result.gymId,
        afterState: { slug: parsed.data.slug, ownerEmail: parsed.data.ownerEmail },
      });

      return json(result, 201);
    } catch (e: any) {
      return errorResponse(e.message, 400);
    }
  });

  // Toggle Gym Status (ACTIVE / SUSPENDED)
  router.post('/api/admin/gyms/:id/status', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = ToggleGymStatusRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid status payload', 400);
    }

    const adminRepo = new AdminRepository(ctx.env.DB);
    const before = await ctx.env.DB.prepare(`SELECT * FROM gyms WHERE id = ?`).bind(id).first();
    await adminRepo.toggleGymStatus(id, parsed.data.status);
    const after = await ctx.env.DB.prepare(`SELECT * FROM gyms WHERE id = ?`).bind(id).first();

    const audit = new AuditService(ctx.env.DB);
    await audit.recordSaasEvent({
      actorAdminId: ctx.user!.id,
      affectedGymId: id,
      action: 'gym.status',
      entityType: 'gym',
      entityId: id,
      beforeState: { status: before?.status },
      afterState: { status: parsed.data.status },
    });

    return json({ success: true, gymId: id, status: parsed.data.status });
  });

  // Get gym features
  router.get('/api/admin/gyms/:id/features', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const adminRepo = new AdminRepository(ctx.env.DB);
    const features = await adminRepo.getGymFeatures(id);
    return json({ features });
  });

  // Update gym features
  router.put('/api/admin/gyms/:id/features', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateGymFeaturesRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid features payload', 400);
    }

    const adminRepo = new AdminRepository(ctx.env.DB);
    const before = await adminRepo.getGymFeatures(id);
    await adminRepo.updateGymFeatures(id, parsed.data.features);
    const after = await adminRepo.getGymFeatures(id);

    await auditSaas(ctx, 'gym.features_update', id, 'gym_features', id, { before, after, req });

    return json({ success: true, features: after });
  });

  // List gym users
  router.get('/api/admin/gyms/:id/users', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const adminRepo = new AdminRepository(ctx.env.DB);
    const users = await adminRepo.listGymUsers(id);
    return json({ users });
  });

  // Update gym user (role, status, password)
  router.put('/api/admin/users/:id', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = AdminUserUpdateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid user update payload', 400);
    }

    const adminRepo = new AdminRepository(ctx.env.DB);
    const before = await ctx.env.DB.prepare(`SELECT id, gym_id, name, email, phone, role, status FROM users WHERE id = ?`).bind(id).first();
    if (!before) return errorResponse('User not found', 404);

    await adminRepo.updateGymUser(id, {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
      status: parsed.data.status,
      passwordPlain: parsed.data.password,
    });

    const after = await ctx.env.DB.prepare(`SELECT id, gym_id, name, email, phone, role, status FROM users WHERE id = ?`).bind(id).first();
    await auditSaas(ctx, 'user.admin_update', (before as any).gym_id, 'user', id, { before, after, req });

    return json({ success: true, user: after });
  });

  // Update License Limits
  router.put('/api/admin/gyms/:id/license-limits', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let id: number;
    try { id = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateLicenseLimitsRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid license limits payload', 400);
    }

    const adminRepo = new AdminRepository(ctx.env.DB);
    const before = await ctx.env.DB.prepare(`SELECT * FROM licenses WHERE gym_id = ?`).bind(id).first();
    await adminRepo.updateLicenseLimits(id, parsed.data);
    const after = await ctx.env.DB.prepare(`SELECT * FROM licenses WHERE gym_id = ?`).bind(id).first();

    await auditSaas(ctx, 'gym.license_limits_update', id, 'license', (after as any)?.id ?? null, { before, after, req });

    return json({ success: true, license: after });
  });

  // Platform-wide SaaS Audit Logs
  router.get('/api/admin/audit-logs', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    const limit = parseInt(ctx.query.get('limit') || '50', 10);
    const offset = parseInt(ctx.query.get('offset') || '0', 10);
    const action = ctx.query.get('action') || undefined;
    const affectedGymId = ctx.query.get('affectedGymId') ? parseInt(ctx.query.get('affectedGymId')!, 10) : undefined;

    const auditService = new AuditService(ctx.env.DB);
    const res = await auditService.listSaasEvents({ limit, offset, action, affectedGymId });
    return json(res);
  });

  // Get Platform Gateway Settings
  router.get('/api/admin/communications', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    try {
      const row = await ctx.env.DB
        .prepare(`SELECT value_json FROM platform_settings WHERE key = 'communications'`)
        .first<{ value_json: string }>();
      const config = row?.value_json ? JSON.parse(row.value_json) : {
        smtp: { enabled: false, provider: 'CUSTOM', host: '', port: 587, secure: false, username: '', password: '', fromName: '', fromEmail: '' },
        smsGateway: { enabled: false, provider: 'FAST2SMS', apiKey: '', senderId: 'GYMTC' },
        whatsappGateway: { enabled: false, provider: 'META_CLOUD_API', accessToken: '', phoneNumberId: '', businessAccountId: '' },
      };
      return json({ config });
    } catch (e: any) {
      return errorResponse(e.message || 'Failed to load gateway config', 500);
    }
  });

  // Update Platform Gateway Settings
  router.put('/api/admin/communications', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    const body = await req.json().catch(() => ({}));
    const parsed = PlatformCommunicationsConfigSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid gateway config', 400);
    }

    await ctx.env.DB
      .prepare(`INSERT INTO platform_settings (key, value_json, updated_at) VALUES ('communications', ?, unixepoch())
                ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = unixepoch()`)
      .bind(JSON.stringify(parsed.data))
      .run();

    const audit = new AuditService(ctx.env.DB);
    await audit.recordSaasEvent({
      actorAdminId: ctx.user!.id,
      affectedGymId: null,
      action: 'communications.update',
      entityType: 'platform_settings',
      entityId: null,
      afterState: { configUpdated: true },
    });

    return json({ success: true, config: parsed.data });
  });

  // Test Platform SMTP Relay
  router.post('/api/admin/communications/test-smtp', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    const body = await req.json().catch(() => ({}));
    const parsed = TestSmtpRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid SMTP test payload', 400);
    }
    const { smtp, testRecipient } = parsed.data;
    const emailService = new EmailService(ctx.env);
    const result = await emailService.sendTestSmtpEmail({
      to: testRecipient,
      gymName: 'GymTech Platform Central',
      smtpHost: smtp.host || 'smtp.custom-relay.net',
      smtpPort: smtp.port || 587,
      provider: smtp.provider,
    });
    return json(result);
  });

  // Top Up Gym SMS or WhatsApp Credits
  router.post('/api/admin/gyms/:id/top-up-credits', async (req, ctx) => {
    const adminErr = await requireSuperAdmin(req, ctx);
    if (adminErr) return adminErr;

    let gymId: number;
    try { gymId = paramId(ctx); } catch (e: any) { return errorResponse(e.message, 400); }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = TopUpCreditsRequestSchema.safeParse({ ...body, gymId });
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid top-up payload', 400);
    }

    const licenseRepo = new LicenseRepository(ctx.env.DB, 0);
    await licenseRepo.topUpCredits(gymId, parsed.data.channel, parsed.data.credits);
    const updatedLicense = await licenseRepo.findByGymId(gymId);

    const audit = new AuditService(ctx.env.DB);
    await audit.recordSaasEvent({
      actorAdminId: ctx.user!.id,
      affectedGymId: gymId,
      action: `credits.topup.${parsed.data.channel}`,
      entityType: 'license',
      entityId: updatedLicense?.id ?? null,
      afterState: { channel: parsed.data.channel, added: parsed.data.credits },
    });

    return json({ success: true, license: updatedLicense });
  });
}
