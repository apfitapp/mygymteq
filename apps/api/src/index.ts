import { NativeRouter, type Env } from './router/router';
import { json } from './lib/response';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerDashboardRoutes } from './routes/dashboard.routes';
import { registerMemberRoutes } from './routes/members.routes';
import { registerAttendanceRoutes } from './routes/attendance.routes';
import { registerPaymentRoutes } from './routes/payments.routes';
import { registerPlanRoutes } from './routes/plans.routes';
import { registerStaffRoutes } from './routes/staff.routes';
import { registerSettingsRoutes } from './routes/settings.routes';
import { registerPtRoutes } from './routes/pt.routes';
import { registerReportRoutes } from './routes/reports.routes';
import { registerMediaRoutes } from './routes/media.routes';
import { registerAdminRoutes } from './routes/admin.routes';
import { registerAuditRoutes } from './routes/audit.routes';

const router = new NativeRouter();

// Health Checks
router.get('/', () => json({ name: 'Gym SaaS API', status: 'online', runtime: 'Cloudflare Workers' }));
router.get('/api/health', () => json({ status: 'ok', service: 'gym-saas-api' }));

// Domain Route Registrations
registerAuthRoutes(router);
registerDashboardRoutes(router);
registerMemberRoutes(router);
registerAttendanceRoutes(router);
registerPaymentRoutes(router);
registerPlanRoutes(router);
registerStaffRoutes(router);
registerSettingsRoutes(router);
registerPtRoutes(router);
registerReportRoutes(router);
registerMediaRoutes(router);
registerAdminRoutes(router);
registerAuditRoutes(router);

// Cloudflare Workers Fetch Handler
export default {
  async fetch(req: Request, env: Env, executionCtx: ExecutionContext): Promise<Response> {
    return await router.handle(req, env, executionCtx);
  },
};
