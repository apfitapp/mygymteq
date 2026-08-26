import { createMiddleware } from 'hono/factory';
import { Bindings, Variables } from '../env';
import { Permission, Role, hasPermission } from '@gym/shared';

export function requireRole(allowedRoles: Role[]) {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({
        success: false,
        error: `Forbidden: Role '${user.role}' is not authorized to access this resource`,
      }, 403);
    }

    await next();
  });
}

export function requirePermission(permission: Permission) {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    if (!hasPermission(user.role, permission)) {
      return c.json({
        success: false,
        error: `Forbidden: Insufficient permissions (${permission})`,
      }, 403);
    }

    await next();
  });
}
