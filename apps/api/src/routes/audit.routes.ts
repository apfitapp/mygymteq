import type { NativeRouter } from '../router/router';
import { json } from '../lib/response';
import { requireGym, requireRole } from '../lib/tenant';
import { AuditService } from '../services/audit.service';

export function registerAuditRoutes(router: NativeRouter): void {
  // Gym Owner audit log trail
  router.get('/api/audit-logs', async (req, ctx) => {
    const tenant = await requireGym(req, ctx);
    if (tenant instanceof Response) return tenant;

    const roleErr = requireRole(ctx, ['OWNER']);
    if (roleErr) return roleErr;

    const limit = parseInt(ctx.query.get('limit') || '50', 10);
    const offset = parseInt(ctx.query.get('offset') || '0', 10);
    const action = ctx.query.get('action') || undefined;
    const entityType = ctx.query.get('entityType') || undefined;

    const auditService = new AuditService(ctx.env.DB);
    const res = await auditService.listGymEvents(ctx.gymId!, { limit, offset, action, entityType });
    return json(res);
  });
}
