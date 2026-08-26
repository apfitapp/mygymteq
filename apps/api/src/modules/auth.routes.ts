import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, isNull } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import { users, gyms, branches } from '../db/schema';
import { verifyPassword, signJwt } from '../lib/crypto';
import { authMiddleware } from '../middleware/auth.middleware';
import { LoginSchema } from '@gym/shared';

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// POST /api/auth/login
authRoutes.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const db = getDb(c.env.DB);

  const foundUsers = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase().trim()), isNull(users.deletedAt)))
    .limit(1);

  if (foundUsers.length === 0) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  const user = foundUsers[0];

  if (!user.isActive) {
    return c.json({ success: false, error: 'User account is deactivated' }, 403);
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  let gym = null;
  let gymBranches: typeof branches.$inferSelect[] = [];

  if (user.gymId) {
    const gymRows = await db
      .select()
      .from(gyms)
      .where(and(eq(gyms.id, user.gymId), isNull(gyms.deletedAt)))
      .limit(1);

    if (gymRows.length > 0) {
      gym = gymRows[0];
      if (gym.status === 'SUSPENDED' && user.role !== 'SUPER_ADMIN') {
        return c.json({ success: false, error: 'Gym account is suspended. Please contact support.' }, 403);
      }

      gymBranches = await db
        .select()
        .from(branches)
        .where(and(eq(branches.gymId, gym.id), isNull(branches.deletedAt)));
    }
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(users.id, user.id));

  // Generate JWT (12 hour expiration)
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const token = await signJwt(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      gymId: user.gymId,
      branchId: user.branchId,
      exp,
    },
    c.env.JWT_SECRET
  );

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        gymId: user.gymId,
        branchId: user.branchId,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      gym: gym ? {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        status: gym.status,
        logoR2Key: gym.logoR2Key,
        phone: gym.phone,
        email: gym.email,
        address: gym.address,
        city: gym.city,
        state: gym.state,
      } : null,
      branches: gymBranches.map((b) => ({
        id: b.id,
        gymId: b.gymId,
        name: b.name,
        code: b.code,
        isPrimary: b.isPrimary,
        isActive: b.isActive,
      })),
    },
  });
});

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user')!;
  const db = getDb(c.env.DB);

  const foundUsers = await db
    .select()
    .from(users)
    .where(and(eq(users.id, authUser.id), isNull(users.deletedAt)))
    .limit(1);

  if (foundUsers.length === 0) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const user = foundUsers[0];
  let gym = null;
  let gymBranches: typeof branches.$inferSelect[] = [];

  if (user.gymId) {
    const gymRows = await db
      .select()
      .from(gyms)
      .where(and(eq(gyms.id, user.gymId), isNull(gyms.deletedAt)))
      .limit(1);

    if (gymRows.length > 0) {
      gym = gymRows[0];
      gymBranches = await db
        .select()
        .from(branches)
        .where(and(eq(branches.gymId, gym.id), isNull(branches.deletedAt)));
    }
  }

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        gymId: user.gymId,
        branchId: user.branchId,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      gym: gym ? {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        status: gym.status,
        logoR2Key: gym.logoR2Key,
        phone: gym.phone,
        email: gym.email,
        address: gym.address,
        city: gym.city,
        state: gym.state,
      } : null,
      branches: gymBranches.map((b) => ({
        id: b.id,
        gymId: b.gymId,
        name: b.name,
        code: b.code,
        isPrimary: b.isPrimary,
        isActive: b.isActive,
      })),
    },
  });
});
