import {
  NotificationSettingsRequestSchema,
  SendNotificationRequestSchema,
  ChannelBalance,
  NotificationSettingsResponse,
} from '@gymtech/shared';
import type { NativeRouter } from '../router/router';
import { json, errorResponse } from '../lib/response';
import { requireGym } from '../lib/tenant';
import { requireRoles, auditGym } from '../lib/route-helpers';
import { extractClientInfo } from '../services/audit.service';
import { LicenseRepository } from '../repositories/license.repository';
import { LicenseService } from '../services/license.service';
import { NotificationService } from '../lib/notifications';

const DEFAULT_NOTIFICATION_SETTINGS = {
  reminderDays: 7,
  welcomeEnabled: true,
  receiptEnabled: true,
  expiryEnabled: true,
};

export function registerSettingsRoutes(router: NativeRouter): void {
  // Get notification settings and balances
  router.get('/api/settings/notifications', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;
    const saved = tenant.gym.notification_settings_json
      ? JSON.parse(tenant.gym.notification_settings_json)
      : {};

    const licenseRepo = new LicenseRepository(ctx.env.DB, ctx.gymId!);
    const license = await licenseRepo.findByGymId(ctx.gymId!);
    const maxSms = license?.max_sms ?? 0;
    const smsUsed = license?.sms_used ?? 0;
    const maxWhatsapp = license?.max_whatsapp ?? 0;
    const whatsappUsed = license?.whatsapp_used ?? 0;

    const smsBalance: ChannelBalance = {
      total: maxSms,
      used: smsUsed,
      remaining: Math.max(0, maxSms - smsUsed),
    };
    const whatsappBalance: ChannelBalance = {
      total: maxWhatsapp,
      used: whatsappUsed,
      remaining: Math.max(0, maxWhatsapp - whatsappUsed),
    };

    let emailServiceStatus: 'ACTIVE' | 'NOT_CONFIGURED' = 'NOT_CONFIGURED';
    let smsServiceStatus: 'ACTIVE' | 'NOT_CONFIGURED' = 'NOT_CONFIGURED';
    let whatsappServiceStatus: 'ACTIVE' | 'NOT_CONFIGURED' = 'NOT_CONFIGURED';

    try {
      const row = await ctx.env.DB
        .prepare(`SELECT value_json FROM platform_settings WHERE key = 'communications'`)
        .first<{ value_json: string }>();
      if (row?.value_json) {
        const comms = JSON.parse(row.value_json);
        if (comms?.smtp?.enabled) emailServiceStatus = 'ACTIVE';
        if (comms?.smsGateway?.enabled) smsServiceStatus = 'ACTIVE';
        if (comms?.whatsappGateway?.enabled) whatsappServiceStatus = 'ACTIVE';
      }
    } catch {
      // Defaults preserved if platform_settings is empty
    }

    const res: NotificationSettingsResponse = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...saved,
      smsBalance,
      whatsappBalance,
      emailServiceStatus,
      smsServiceStatus,
      whatsappServiceStatus,
    };
    return json(res);
  });

  // Update notification triggers
  router.put('/api/settings/notifications', async (req, ctx) => {
    const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER']);
    if (roleErr) return roleErr;

    const body = await req.json().catch(() => ({}));
    const parsed = NotificationSettingsRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid notification settings', 400);
    }
    await ctx.env.DB
      .prepare(`UPDATE gyms SET notification_settings_json = ?, updated_at = unixepoch() WHERE id = ?`)
      .bind(JSON.stringify(parsed.data), ctx.gymId!)
      .run();
    return json(parsed.data);
  });

  // Dispatch message and decrement quota
  router.post('/api/notifications/dispatch', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const roleErr = await requireRoles(req, ctx, ['OWNER', 'MANAGER', 'STAFF', 'TRAINER']);
    if (roleErr) return roleErr;

    const body = await req.json().catch(() => ({}));
    const parsed = SendNotificationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || 'Invalid dispatch payload', 400);
    }

    const { channel, recipientPhone, recipientName, type, params } = parsed.data;
    const licenseRepo = new LicenseRepository(ctx.env.DB, ctx.gymId!);
    const license = await licenseRepo.findByGymId(ctx.gymId!);

    if (!license) {
      return errorResponse('Gym license not found', 400);
    }

    const client = extractClientInfo(req);
    const licenseService = new LicenseService(ctx.env.DB, ctx.gymId!);

    if (channel === 'SMS') {
      const deduction = await licenseService.consumeCommunicationQuota({
        channel: 'SMS',
        credits: 1,
        recipientPhone,
        recipientName,
        messageType: type,
        dispatchedById: ctx.user?.id,
        ip: client.ip,
      });
      if (!deduction.success) {
        return errorResponse(deduction.error || 'Insufficient SMS balance. Please recharge credits.', 402);
      }

      await auditGym(ctx, 'communication.dispatch.sms', 'communication_log', null, {
        metadata: { recipientPhone, remaining: deduction.remainingCredits },
        req,
      });

      return json({
        success: true,
        channel: 'SMS',
        recipientPhone,
        remainingCredits: deduction.remainingCredits,
        message: `SMS dispatched successfully to ${recipientName}. 1 credit deducted.`,
      });
    } else if (channel === 'WHATSAPP') {
      const deduction = await licenseService.consumeCommunicationQuota({
        channel: 'WHATSAPP',
        credits: 1,
        recipientPhone,
        recipientName,
        messageType: type,
        dispatchedById: ctx.user?.id,
        ip: client.ip,
      });
      if (!deduction.success) {
        return errorResponse(deduction.error || 'Insufficient WhatsApp balance. Please recharge credits.', 402);
      }

      const notifService = new NotificationService(tenant.gym.name);
      const whatsappUrl = notifService.generateWhatsAppUrl({
        recipientPhone,
        recipientName,
        type: type === 'CUSTOM' ? 'WELCOME' : type,
        params: (params as Record<string, string | number>) || {},
      });

      await auditGym(ctx, 'communication.dispatch.whatsapp', 'communication_log', null, {
        metadata: { recipientPhone, remaining: deduction.remainingCredits },
        req,
      });

      return json({
        success: true,
        channel: 'WHATSAPP',
        recipientPhone,
        whatsappUrl,
        remainingCredits: deduction.remainingCredits,
        message: `WhatsApp message logged. 1 credit deducted.`,
      });
    }

    return errorResponse('Unsupported channel', 400);
  });
}
