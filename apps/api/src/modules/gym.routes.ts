import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import { gyms, branches, users } from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { hashPassword } from '../lib/crypto';
import { recordAuditLog } from '../lib/audit';
import {
  UpdateGymSettingsSchema,
  CreateBranchSchema,
  CreateStaffUserSchema,
} from '@gym/shared';

export const gymRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All routes require authentication and tenant context
gymRoutes.use('*', authMiddleware, tenantMiddleware);

// GET /api/gym/settings
gymRoutes.get('/settings', async (c) => {
  const gym = c.get('gym')!;
  const db = getDb(c.env.DB);

  const [gymData] = await db
    .select()
    .from(gyms)
    .where(and(eq(gyms.id, gym.id), isNull(gyms.deletedAt)))
    .limit(1);

  if (!gymData) {
    return c.json({ success: false, error: 'Gym not found' }, 404);
  }

  return c.json({ success: true, data: gymData });
});

// PUT /api/gym/settings
gymRoutes.put('/settings', requireRole(['SUPER_ADMIN', 'GYM_OWNER']), zValidator('json', UpdateGymSettingsSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  await db
    .update(gyms)
    .set({
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email ? input.email.trim() : null,
      address: input.address || null,
      city: input.city.trim(),
      state: input.state.trim(),
      pincode: input.pincode || null,
      gstin: input.gstin || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(gyms.id, gym.id));

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'GYM_SETTINGS_UPDATED',
    entityType: 'GYM',
    entityId: gym.id,
    newState: input,
  });

  return c.json({ success: true, message: 'Gym settings updated successfully' });
});

// GET /api/gym/branches
gymRoutes.get('/branches', async (c) => {
  const gym = c.get('gym')!;
  const db = getDb(c.env.DB);

  const branchList = await db
    .select()
    .from(branches)
    .where(and(eq(branches.gymId, gym.id), isNull(branches.deletedAt)))
    .orderBy(desc(branches.isPrimary), branches.name);

  return c.json({ success: true, data: branchList });
});

// POST /api/gym/branches
gymRoutes.post('/branches', requireRole(['SUPER_ADMIN', 'GYM_OWNER']), zValidator('json', CreateBranchSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  const branchId = `br_${crypto.randomUUID()}`;

  await db.insert(branches).values({
    id: branchId,
    gymId: gym.id,
    name: input.name.trim(),
    code: input.code.toUpperCase().trim(),
    phone: input.phone || null,
    address: input.address || null,
    isPrimary: input.isPrimary,
    isActive: true,
  });

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'BRANCH_CREATED',
    entityType: 'BRANCH',
    entityId: branchId,
    newState: input,
  });

  return c.json({ success: true, data: { id: branchId, ...input } }, 201);
});

// GET /api/gym/staff
gymRoutes.get('/staff', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER']), async (c) => {
  const gym = c.get('gym')!;
  const db = getDb(c.env.DB);

  const staffUsers = await db
    .select({
      id: users.id,
      gymId: users.gymId,
      branchId: users.branchId,
      branchName: branches.name,
      email: users.email,
      phone: users.phone,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .where(and(eq(users.gymId, gym.id), isNull(users.deletedAt)))
    .orderBy(desc(users.createdAt));

  return c.json({ success: true, data: staffUsers });
});

// POST /api/gym/staff
gymRoutes.post('/staff', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER']), zValidator('json', CreateStaffUserSchema), async (c) => {
  const gym = c.get('gym')!;
  const currentUser = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  const existingEmail = await db.select().from(users).where(eq(users.email, input.email.toLowerCase().trim())).limit(1);
  if (existingEmail.length > 0) {
    return c.json({ success: false, error: 'User with this email already exists' }, 409);
  }

  const staffId = `usr_${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(input.password);

  await db.insert(users).values({
    id: staffId,
    gymId: gym.id,
    branchId: input.branchId || null,
    email: input.email.toLowerCase().trim(),
    phone: input.phone.trim(),
    passwordHash,
    fullName: input.fullName.trim(),
    role: input.role,
    isActive: true,
  });

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: currentUser.id,
    action: 'STAFF_USER_CREATED',
    entityType: 'USER',
    entityId: staffId,
    newState: { email: input.email, fullName: input.fullName, role: input.role },
  });

  return c.json({
    success: true,
    data: {
      id: staffId,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
    },
  }, 201);
});
