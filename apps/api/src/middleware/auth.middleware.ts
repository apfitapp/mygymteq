import { createMiddleware } from 'hono/factory';
import { verifyJwt } from '../lib/crypto';
import { Bindings, Variables } from '../env';
import { AuthJwtPayload } from '@gym/shared';

export const authMiddleware = createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.substring(7);
    const secret = c.env.JWT_SECRET;
    const payload = await verifyJwt<AuthJwtPayload>(token, secret);

    if (!payload || !payload.sub) {
      return c.json({ success: false, error: 'Unauthorized: Invalid or expired token' }, 401);
    }

    c.set('user', {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      gymId: payload.gymId,
      branchId: payload.branchId,
    });

    await next();
  }
);
