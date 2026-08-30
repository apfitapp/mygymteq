import type { RequestContext } from '../router/router';
import { extractClientInfo, AuditService } from '../services/audit.service';
import { requireAuth, requireGym } from './tenant';
import { hasAllowedRole } from './session';
import { errorResponse } from './response';

/** Resolve `ctx.params.id` (string) to a numeric id. */
export function paramId(ctx: RequestContext): number {
  const id = parseInt(ctx.params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid id parameter');
  }
  return id;
}

export async function auditGym(
  ctx: RequestContext,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: { before?: unknown; after?: unknown; metadata?: unknown; req?: Request }
) {
  try {
    const client = details?.req ? extractClientInfo(details.req) : { ip: '127.0.0.1', userAgent: 'System' };
    const auditService = new AuditService(ctx.env.DB);
    await auditService.recordGymEvent({
      gymId: ctx.gymId!,
      actorUserId: ctx.user?.id ?? null,
      actorRole: ctx.user?.role ?? null,
      action,
      entityType,
      entityId,
      beforeState: details?.before,
      afterState: details?.after,
      ip: client.ip,
      userAgent: client.userAgent,
      metadata: details?.metadata,
    });
  } catch (e) {
    console.warn('auditGym failed:', (e as Error).message);
  }
}

export async function auditSaas(
  ctx: RequestContext,
  action: string,
  affectedGymId: number | null,
  entityType?: string,
  entityId?: number | null,
  details?: { before?: unknown; after?: unknown; metadata?: unknown; req?: Request }
) {
  try {
    const client = details?.req ? extractClientInfo(details.req) : { ip: '127.0.0.1', userAgent: 'System' };
    const auditService = new AuditService(ctx.env.DB);
    await auditService.recordSaasEvent({
      actorAdminId: ctx.user?.id ?? 0,
      affectedGymId,
      action,
      entityType,
      entityId,
      beforeState: details?.before,
      afterState: details?.after,
      ip: client.ip,
      userAgent: client.userAgent,
      metadata: details?.metadata,
    });
  } catch (e) {
    console.warn('auditSaas failed:', (e as Error).message);
  }
}

export async function requireRoles(
  req: Request,
  ctx: RequestContext,
  roles: string[]
): Promise<Response | null> {
  const tenantResult = await requireGym(req, ctx);
  if (tenantResult instanceof Response) return tenantResult;
  if (!hasAllowedRole(ctx.user?.role, roles)) {
    return errorResponse('You do not have permission to perform this action', 403);
  }
  return null;
}

export async function requireSuperAdmin(req: Request, ctx: RequestContext): Promise<Response | null> {
  const authErr = await requireAuth(req, ctx);
  if (authErr) return authErr;
  const isPlatformAdmin = ctx.user?.role === 'PLATFORM_ADMIN' || (ctx.user?.role as string) === 'SUPER_ADMIN';
  if (!isPlatformAdmin) {
    return errorResponse('Platform Super Admin privileges required', 403);
  }
  return null;
}
