import type { NativeRouter } from '../router/router';
import { json } from '../lib/response';
import { requireGym, requireFeature } from '../lib/tenant';
import { DashboardService } from '../services/dashboard.service';

export function registerDashboardRoutes(router: NativeRouter): void {
  router.get('/api/dashboard', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const featErr = await requireFeature(req, ctx, 'dashboard');
    if (featErr) return featErr;

    const dashboardService = new DashboardService(ctx.env.DB, ctx.gymId!, tenant.gym.name);
    return json(await dashboardService.getMetrics(ctx.user?.role));
  });
}
