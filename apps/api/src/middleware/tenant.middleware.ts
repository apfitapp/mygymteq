import { createMiddleware } from 'hono/factory';
import { eq, and, isNull } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import { gyms } from '../db/schema';

export const tenantMiddleware = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized: User context missing' }, 401);
    }

    // Determine target gym from headers or host
    const host = c.req.header('host') || '';
    const headerGymSlug = c.req.header('x-gym-slug');
    const headerGymId = c.req.header('x-gym-id');

    let targetSlug = headerGymSlug;
    if (!targetSlug && host.includes('.')) {
      const parts = host.split('.');
      if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'admin' && parts[0] !== 'api') {
        targetSlug = parts[0];
      }
    }

    const db = getDb(c.env.DB);
    let targetGym;

    if (headerGymId) {
      const rows = await db.select().from(gyms).where(and(eq(gyms.id, headerGymId), isNull(gyms.deletedAt))).limit(1);
      targetGym = rows[0];
    } else if (targetSlug) {
      const rows = await db.select().from(gyms).where(and(eq(gyms.slug, targetSlug), isNull(gyms.deletedAt))).limit(1);
      targetGym = rows[0];
    } else if (user.gymId) {
      const rows = await db.select().from(gyms).where(and(eq(gyms.id, user.gymId), isNull(gyms.deletedAt))).limit(1);
      targetGym = rows[0];
    }

    if (!targetGym) {
      return c.json({ success: false, error: 'Tenant NotFound: Gym does not exist or has been deleted' }, 404);
    }

    // Check account status
    if (targetGym.status === 'SUSPENDED' && user.role !== 'SUPER_ADMIN') {
      return c.json({ success: false, error: 'Forbidden: Gym account is suspended. Contact SaaS support.' }, 403);
    }

    // Strict Cross-Tenant Access Enforcement
    if (user.role !== 'SUPER_ADMIN' && user.gymId !== targetGym.id) {
      console.warn(`[SECURITY ALERT] Cross-tenant access attempt by user ${user.id} (gym ${user.gymId}) to gym ${targetGym.id}`);
      return c.json({ success: false, error: 'Forbidden: Cross-tenant access denied' }, 403);
    }

    c.set('gym', {
      id: targetGym.id,
      name: targetGym.name,
      slug: targetGym.slug,
      status: targetGym.status,
    });

    const headerBranchId = c.req.header('x-branch-id') || user.branchId || undefined;
    if (headerBranchId) {
      c.set('branchId', headerBranchId);
    }

    await next();
  }
);
