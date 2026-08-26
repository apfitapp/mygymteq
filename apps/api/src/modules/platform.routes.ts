import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, sql, count, isNull, desc } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import {
  gyms,
  users,
  branches,
  platformPlans,
  gymSubscriptions,
  members,
  auditLogs,
  membershipPlans,
} from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { hashPassword } from '../lib/crypto';
import { recordAuditLog } from '../lib/audit';
import {
  CreateGymTenantSchema,
  UpdateGymStatusSchema,
  UpdateGymSubscriptionSchema,
  CreatePlatformPlanSchema,
} from '@gym/shared';

export const platformRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All platform routes require SUPER_ADMIN role
platformRoutes.use('*', authMiddleware, requireRole(['SUPER_ADMIN']));

// GET /api/platform/metrics
platformRoutes.get('/metrics', async (c) => {
  const db = getDb(c.env.DB);

  const [totalGymsRow] = await db.select({ val: count() }).from(gyms).where(isNull(gyms.deletedAt));
  const [activeGymsRow] = await db.select({ val: count() }).from(gyms).where(sql`${gyms.status} = 'ACTIVE' AND ${gyms.deletedAt} IS NULL`);
  const [trialGymsRow] = await db.select({ val: count() }).from(gyms).where(sql`${gyms.status} = 'TRIAL' AND ${gyms.deletedAt} IS NULL`);
  const [suspendedGymsRow] = await db.select({ val: count() }).from(gyms).where(sql`${gyms.status} = 'SUSPENDED' AND ${gyms.deletedAt} IS NULL`);
  const [totalMembersRow] = await db.select({ val: count() }).from(members).where(isNull(members.deletedAt));

  // Compute MRR from active subscriptions
  const activeSubs = await db
    .select({
      monthlyPriceInr: platformPlans.monthlyPriceInr,
    })
    .from(gymSubscriptions)
    .innerJoin(platformPlans, eq(gymSubscriptions.planId, platformPlans.id))
    .where(eq(gymSubscriptions.status, 'ACTIVE'));

  const mrrInr = activeSubs.reduce((acc, row) => acc + row.monthlyPriceInr, 0);

  return c.json({
    success: true,
    data: {
      totalGyms: totalGymsRow?.val || 0,
      activeGyms: activeGymsRow?.val || 0,
      trialGyms: trialGymsRow?.val || 0,
      suspendedGyms: suspendedGymsRow?.val || 0,
      totalMembersAcrossAllGyms: totalMembersRow?.val || 0,
      mrrInr,
      expiringSubscriptionsCount: 0,
    },
  });
});

// GET /api/platform/gyms
platformRoutes.get('/gyms', async (c) => {
  const db = getDb(c.env.DB);

  const allGyms = await db
    .select({
      id: gyms.id,
      name: gyms.name,
      slug: gyms.slug,
      phone: gyms.phone,
      email: gyms.email,
      city: gyms.city,
      state: gyms.state,
      status: gyms.status,
      createdAt: gyms.createdAt,
      planId: platformPlans.id,
      planName: platformPlans.name,
      subStatus: gymSubscriptions.status,
      currentPeriodEnd: gymSubscriptions.currentPeriodEnd,
    })
    .from(gyms)
    .leftJoin(gymSubscriptions, eq(gyms.id, gymSubscriptions.gymId))
    .leftJoin(platformPlans, eq(gymSubscriptions.planId, platformPlans.id))
    .where(isNull(gyms.deletedAt))
    .orderBy(desc(gyms.createdAt));

  // Get member count and owner info per gym
  const gymList = await Promise.all(
    allGyms.map(async (gym) => {
      const [memberCountRow] = await db
        .select({ val: count() })
        .from(members)
        .where(sql`${members.gymId} = ${gym.id} AND ${members.deletedAt} IS NULL`);

      const [owner] = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        })
        .from(users)
        .where(sql`${users.gymId} = ${gym.id} AND ${users.role} = 'GYM_OWNER'`)
        .limit(1);

      return {
        ...gym,
        memberCount: memberCountRow?.val || 0,
        owner: owner || null,
      };
    })
  );

  return c.json({ success: true, data: gymList });
});

// POST /api/platform/gyms (Create Gym Tenant + Owner + Primary Branch + Initial Subscription)
platformRoutes.post('/gyms', zValidator('json', CreateGymTenantSchema), async (c) => {
  const input = c.req.valid('json');
  const user = c.get('user')!;
  const db = getDb(c.env.DB);

  // 1. Validate slug uniqueness
  const existingSlug = await db.select().from(gyms).where(eq(gyms.slug, input.slug.toLowerCase().trim())).limit(1);
  if (existingSlug.length > 0) {
    return c.json({ success: false, error: 'A gym with this subdomain slug already exists' }, 409);
  }

  // 2. Validate owner email uniqueness
  const existingEmail = await db.select().from(users).where(eq(users.email, input.ownerEmail.toLowerCase().trim())).limit(1);
  if (existingEmail.length > 0) {
    return c.json({ success: false, error: 'A user with this owner email already exists' }, 409);
  }

  const gymId = `gym_${crypto.randomUUID()}`;
  const branchId = `br_${crypto.randomUUID()}`;
  const ownerId = `usr_${crypto.randomUUID()}`;
  const subId = `sub_${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(input.ownerPassword);

  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial
  const trialEndStr = trialEnd.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  // Insert Gym
  await db.insert(gyms).values({
    id: gymId,
    name: input.name.trim(),
    slug: input.slug.toLowerCase().trim(),
    phone: input.phone.trim(),
    email: input.email ? input.email.toLowerCase().trim() : null,
    address: input.address || null,
    city: input.city.trim(),
    state: input.state || 'Telangana',
    pincode: input.pincode || null,
    gstin: input.gstin || null,
    status: 'TRIAL',
  });

  // Insert Primary Branch
  await db.insert(branches).values({
    id: branchId,
    gymId,
    name: 'Main Branch',
    code: 'MAIN-01',
    phone: input.phone,
    address: input.address || null,
    isPrimary: true,
    isActive: true,
  });

  // Insert Owner User
  await db.insert(users).values({
    id: ownerId,
    gymId,
    branchId,
    email: input.ownerEmail.toLowerCase().trim(),
    phone: input.ownerPhone.trim(),
    passwordHash,
    fullName: input.ownerName.trim(),
    role: 'GYM_OWNER',
    isActive: true,
  });

  // Insert Subscription
  await db.insert(gymSubscriptions).values({
    id: subId,
    gymId,
    planId: input.planId,
    status: 'TRIAL',
    trialEndsAt: trialEndStr,
    currentPeriodStart: todayStr,
    currentPeriodEnd: trialEndStr,
  });

  // Seed standard default membership plans for the gym
  await db.insert(membershipPlans).values([
    {
      id: `plan_${crypto.randomUUID()}`,
      gymId,
      name: 'Monthly Gym',
      durationMonths: 1,
      durationDays: 0,
      priceInr: 150000, // ₹1,500
      admissionFeeInr: 50000,
      description: 'Full gym access with cardio and strength training',
      isActive: true,
    },
    {
      id: `plan_${crypto.randomUUID()}`,
      gymId,
      name: 'Quarterly Gym (3 Months)',
      durationMonths: 3,
      durationDays: 0,
      priceInr: 400000, // ₹4,000
      admissionFeeInr: 0,
      description: '3 months access with workout guidance',
      isActive: true,
    },
    {
      id: `plan_${crypto.randomUUID()}`,
      gymId,
      name: 'Annual VIP (12 Months)',
      durationMonths: 12,
      durationDays: 0,
      priceInr: 1200000, // ₹12,000
      admissionFeeInr: 0,
      description: 'Full 1-year unlimited access with steam & locker',
      isActive: true,
    },
  ]);

  // Record Audit Log
  await recordAuditLog({
    db,
    gymId,
    userId: user.id,
    action: 'PLATFORM_CREATE_GYM',
    entityType: 'GYM',
    entityId: gymId,
    newState: { name: input.name, slug: input.slug, ownerEmail: input.ownerEmail, planId: input.planId },
  });

  return c.json({
    success: true,
    data: {
      gymId,
      name: input.name,
      slug: input.slug,
      ownerEmail: input.ownerEmail,
      status: 'TRIAL',
    },
  }, 201);
});

// PATCH /api/platform/gyms/:id/status
platformRoutes.patch('/gyms/:id/status', zValidator('json', UpdateGymStatusSchema), async (c) => {
  const gymId = c.req.param('id');
  const { status } = c.req.valid('json');
  const user = c.get('user')!;
  const db = getDb(c.env.DB);

  const [existing] = await db.select().from(gyms).where(eq(gyms.id, gymId)).limit(1);
  if (!existing) {
    return c.json({ success: false, error: 'Gym not found' }, 404);
  }

  await db
    .update(gyms)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(gyms.id, gymId));

  await recordAuditLog({
    db,
    gymId,
    userId: user.id,
    action: 'PLATFORM_UPDATE_GYM_STATUS',
    entityType: 'GYM',
    entityId: gymId,
    oldState: { status: existing.status },
    newState: { status },
  });

  return c.json({ success: true, data: { id: gymId, status } });
});

// POST /api/platform/gyms/:id/subscription
platformRoutes.post('/gyms/:id/subscription', zValidator('json', UpdateGymSubscriptionSchema), async (c) => {
  const gymId = c.req.param('id');
  const input = c.req.valid('json');
  const user = c.get('user')!;
  const db = getDb(c.env.DB);

  const [existing] = await db.select().from(gymSubscriptions).where(eq(gymSubscriptions.gymId, gymId)).limit(1);

  if (existing) {
    await db
      .update(gymSubscriptions)
      .set({
        planId: input.planId,
        status: input.status,
        currentPeriodEnd: input.currentPeriodEnd,
        maxMembersOverride: input.maxMembersOverride ?? null,
        maxBranchesOverride: input.maxBranchesOverride ?? null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(gymSubscriptions.id, existing.id));
  } else {
    await db.insert(gymSubscriptions).values({
      id: `sub_${crypto.randomUUID()}`,
      gymId,
      planId: input.planId,
      status: input.status,
      currentPeriodStart: new Date().toISOString().split('T')[0],
      currentPeriodEnd: input.currentPeriodEnd,
      maxMembersOverride: input.maxMembersOverride ?? null,
      maxBranchesOverride: input.maxBranchesOverride ?? null,
    });
  }

  // If status is ACTIVE, ensure gym status is ACTIVE
  if (input.status === 'ACTIVE') {
    await db.update(gyms).set({ status: 'ACTIVE' }).where(eq(gyms.id, gymId));
  }

  await recordAuditLog({
    db,
    gymId,
    userId: user.id,
    action: 'PLATFORM_UPDATE_GYM_SUBSCRIPTION',
    entityType: 'GYM_SUBSCRIPTION',
    entityId: gymId,
    newState: input,
  });

  return c.json({ success: true, message: 'Subscription updated successfully' });
});

// GET /api/platform/plans
platformRoutes.get('/plans', async (c) => {
  const db = getDb(c.env.DB);
  const plans = await db.select().from(platformPlans).orderBy(platformPlans.monthlyPriceInr);
  return c.json({ success: true, data: plans });
});

// POST /api/platform/plans
platformRoutes.post('/plans', zValidator('json', CreatePlatformPlanSchema), async (c) => {
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  await db.insert(platformPlans).values({
    ...input,
    isActive: true,
  });

  return c.json({ success: true, data: input }, 201);
});

// GET /api/platform/audit-logs
platformRoutes.get('/audit-logs', async (c) => {
  const db = getDb(c.env.DB);
  const logs = await db
    .select({
      id: auditLogs.id,
      gymId: auditLogs.gymId,
      userId: auditLogs.userId,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldState: auditLogs.oldState,
      newState: auditLogs.newState,
      createdAt: auditLogs.createdAt,
      userName: users.fullName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return c.json({ success: true, data: logs });
});
