/**
 * Tenant & Authorization Guard.
 *
 * Enforces:
 *   1. Authentication & user active status.
 *   2. Gym tenant boundary (isolation via gym_id).
 *   3. Gym active status and non-expired license.
 *   4. Role permissions (SUPER_ADMIN, OWNER, MANAGER).
 *   5. Per-gym dynamic feature access gating (403 FEATURE_DISABLED).
 */

import type { Env, RequestContext } from '../router/router';
import { errorResponse } from './response';
import { verifySessionToken, payloadToSessionUser } from './session';
import type { Gym, License, GymFeatureKey, UserRole } from '@gymtech/shared';
import { GYM_FEATURES } from '@gymtech/shared';

export interface TenantResolution {
  gym: Gym;
  license: License;
  enabledFeatures: GymFeatureKey[];
}

export async function requireGym(
  req: Request,
  ctx: RequestContext
): Promise<Response | TenantResolution> {
  const authErr = await requireAuth(req, ctx);
  if (authErr) return authErr;

  if (!ctx.gymId) {
    return errorResponse('User is not assigned to a gym tenant', 403);
  }

  // Try the cache first (already resolved earlier in the request).
  if ((ctx as any)._tenant) {
    return (ctx as any)._tenant as TenantResolution;
  }

  // 1. Verify Gym existence, active status, and not deleted
  const gym = await ctx.env.DB
    .prepare(`SELECT * FROM gyms WHERE id = ? AND deleted_at IS NULL`)
    .bind(ctx.gymId)
    .first<Gym>();

  if (!gym) {
    return errorResponse('Gym tenant not found or has been archived', 404);
  }
  if (gym.status !== 'ACTIVE') {
    return errorResponse(
      `This gym tenant is currently ${gym.status}. Please contact platform administration.`,
      403
    );
  }

  // 2. Verify License existence, active status, and non-expired
  const license = await ctx.env.DB
    .prepare(`SELECT * FROM licenses WHERE gym_id = ?`)
    .bind(ctx.gymId)
    .first<License>();

  if (!license) {
    return errorResponse('No license is configured for this gym', 403);
  }
  if (license.status !== 'ACTIVE') {
    return errorResponse(
      `Gym license is ${license.status}. Subscription must be active to access this endpoint.`,
      403
    );
  }
  if (license.expires_at < Math.floor(Date.now() / 1000)) {
    return errorResponse('Gym license has expired. Please renew your commercial subscription.', 403);
  }

  // 3. Resolve Dynamic Feature Access for this gym
  const featureRows = await ctx.env.DB
    .prepare(`SELECT feature_key FROM gym_features WHERE gym_id = ? AND is_enabled = 1`)
    .bind(ctx.gymId)
    .all<{ feature_key: string }>();

  const enabledFeatures: GymFeatureKey[] =
    featureRows.results && featureRows.results.length > 0
      ? (featureRows.results.map((r) => r.feature_key as GymFeatureKey))
      : [...GYM_FEATURES];

  const fullGym: Gym = {
    ...gym,
    enabled_features: enabledFeatures,
  };

  const out: TenantResolution = { gym: fullGym, license, enabledFeatures };
  (ctx as any)._tenant = out;
  return out;
}

export async function requireAuth(
  req: Request,
  ctx: RequestContext
): Promise<Response | null> {
  if (ctx.user && ctx.gymId !== undefined) return null;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header', 401);
  }

  const token = authHeader.substring(7);
  const session = await verifySessionToken(token, ctx.env.JWT_SECRET);
  if (!session) {
    return errorResponse('Invalid or expired session token', 401);
  }

  // If gym user, check that user record is still ACTIVE and not soft-deleted
  if (session.gymId !== null) {
    const dbUser = await ctx.env.DB
      .prepare(`SELECT status, deleted_at FROM users WHERE id = ? AND gym_id = ?`)
      .bind(session.id, session.gymId)
      .first<{ status: string; deleted_at: number | null }>();

    if (!dbUser || dbUser.deleted_at !== null) {
      return errorResponse('User account has been archived or deleted', 401);
    }
    if (dbUser.status === 'DISABLED') {
      return errorResponse('User account is currently disabled by administrator', 403);
    }
  }

  ctx.user = payloadToSessionUser(session);
  ctx.gymId = session.gymId ?? undefined;
  return null;
}

/**
 * Feature gate middleware.
 * Verifies that the tenant gym has this specific feature enabled.
 * Returns 403 FEATURE_DISABLED if the feature is turned off.
 */
export async function requireFeature(
  req: Request,
  ctx: RequestContext,
  featureKey: GymFeatureKey
): Promise<Response | null> {
  const tenantRes = await requireGym(req, ctx);
  if (tenantRes instanceof Response) return tenantRes;

  if (!tenantRes.enabledFeatures.includes(featureKey)) {
    return errorResponse(
      `Feature "${featureKey}" is disabled for this gym by platform administration.`,
      403,
      'FEATURE_DISABLED'
    );
  }
  return null;
}

/**
 * Role authorization guard.
 * Verifies that the user's role is in the allowed roles list.
 * SUPER_ADMIN (PLATFORM_ADMIN) always passes.
 */
export function requireRole(
  ctx: RequestContext,
  allowedRoles: UserRole[]
): Response | null {
  if (!ctx.user) {
    return errorResponse('Authentication required', 401);
  }
  if (ctx.user.role === 'PLATFORM_ADMIN') {
    return null;
  }
  if (!allowedRoles.includes(ctx.user.role)) {
    return errorResponse(
      `Access denied. Role "${ctx.user.role}" does not have permission for this action.`,
      403,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
  return null;
}
