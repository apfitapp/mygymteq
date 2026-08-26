import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, isNull, desc, lte, gte, sql } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import {
  memberships,
  membershipPlans,
  members,
  payments,
  branches,
} from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { recordAuditLog } from '../lib/audit';
import {
  CreateMembershipPlanSchema,
  AssignMembershipSchema,
  RenewMembershipSchema,
  calculateMembershipEndDate,
} from '@gym/shared';

export const membershipRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

membershipRoutes.use('*', authMiddleware, tenantMiddleware);

// GET /api/memberships/plans (List gym membership plans)
membershipRoutes.get('/plans', async (c) => {
  const gym = c.get('gym')!;
  const db = getDb(c.env.DB);

  const plans = await db
    .select()
    .from(membershipPlans)
    .where(and(eq(membershipPlans.gymId, gym.id), isNull(membershipPlans.deletedAt)))
    .orderBy(membershipPlans.priceInr);

  return c.json({ success: true, data: plans });
});

// POST /api/memberships/plans (Create gym membership plan)
membershipRoutes.post('/plans', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER']), zValidator('json', CreateMembershipPlanSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  const planId = `plan_${crypto.randomUUID()}`;

  await db.insert(membershipPlans).values({
    id: planId,
    gymId: gym.id,
    name: input.name.trim(),
    durationMonths: input.durationMonths,
    durationDays: input.durationDays || 0,
    priceInr: input.priceInr,
    admissionFeeInr: input.admissionFeeInr || 0,
    description: input.description || null,
    isActive: true,
  });

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'MEMBERSHIP_PLAN_CREATED',
    entityType: 'MEMBERSHIP_PLAN',
    entityId: planId,
    newState: input,
  });

  return c.json({ success: true, data: { id: planId, ...input } }, 201);
});

// POST /api/memberships/assign (Assign plan to member)
membershipRoutes.post('/assign', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF']), zValidator('json', AssignMembershipSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  // Validate member exists in this gym
  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, input.memberId), eq(members.gymId, gym.id), isNull(members.deletedAt)))
    .limit(1);

  if (!member) {
    return c.json({ success: false, error: 'Member not found' }, 404);
  }

  // Validate plan exists in this gym
  const [plan] = await db
    .select()
    .from(membershipPlans)
    .where(and(eq(membershipPlans.id, input.planId), eq(membershipPlans.gymId, gym.id)))
    .limit(1);

  if (!plan) {
    return c.json({ success: false, error: 'Membership plan not found' }, 404);
  }

  const endDate = calculateMembershipEndDate(input.startDate, plan.durationMonths, plan.durationDays);
  const membershipId = `mship_${crypto.randomUUID()}`;

  // Insert assigned membership
  await db.insert(memberships).values({
    id: membershipId,
    gymId: gym.id,
    memberId: member.id,
    planId: plan.id,
    startDate: input.startDate,
    endDate,
    totalAmountInr: input.totalAmountInr,
    discountInr: input.discountInr || 0,
    paidAmountInr: input.paidAmountInr || 0,
    status: 'ACTIVE',
    notes: input.notes || null,
    createdByUserId: user.id,
  });

  // Ensure member status is ACTIVE
  await db.update(members).set({ status: 'ACTIVE' }).where(eq(members.id, member.id));

  // If upfront payment was made
  let receiptNumber: string | null = null;
  if (input.paidAmountInr > 0) {
    const paymentId = `pay_${crypto.randomUUID()}`;
    const [payCountResult] = await db
      .select({ val: sql<number>`count(*)` })
      .from(payments)
      .where(eq(payments.gymId, gym.id));
    receiptNumber = `REC-${new Date().getFullYear()}-${String((payCountResult?.val || 0) + 1).padStart(4, '0')}`;

    await db.insert(payments).values({
      id: paymentId,
      gymId: gym.id,
      branchId: member.branchId,
      memberId: member.id,
      membershipId,
      receiptNumber,
      amountInr: input.paidAmountInr,
      paymentMethod: input.paymentMethod,
      paymentDate: input.startDate,
      upiRefOrTxnId: input.upiRef || null,
      collectedByUserId: user.id,
      notes: `Plan assignment payment (${plan.name})`,
    });
  }

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'MEMBERSHIP_ASSIGNED',
    entityType: 'MEMBERSHIP',
    entityId: membershipId,
    newState: { memberId: member.id, planId: plan.id, startDate: input.startDate, endDate, totalAmountInr: input.totalAmountInr },
  });

  return c.json({
    success: true,
    data: {
      id: membershipId,
      memberId: member.id,
      planName: plan.name,
      startDate: input.startDate,
      endDate,
      totalAmountInr: input.totalAmountInr,
      paidAmountInr: input.paidAmountInr,
      dueAmountInr: Math.max(0, input.totalAmountInr - input.paidAmountInr),
      receiptNumber,
    },
  }, 201);
});

// POST /api/memberships/:id/renew (Renew an existing membership)
membershipRoutes.post('/:id/renew', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF']), zValidator('json', RenewMembershipSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const currentMembershipId = c.req.param('id');
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  const [current] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, currentMembershipId), eq(memberships.gymId, gym.id)))
    .limit(1);

  if (!current) {
    return c.json({ success: false, error: 'Current membership not found' }, 404);
  }

  const [plan] = await db
    .select()
    .from(membershipPlans)
    .where(and(eq(membershipPlans.id, input.planId), eq(membershipPlans.gymId, gym.id)))
    .limit(1);

  if (!plan) {
    return c.json({ success: false, error: 'Membership plan not found' }, 404);
  }

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, current.memberId))
    .limit(1);

  const newMembershipId = `mship_${crypto.randomUUID()}`;
  const endDate = calculateMembershipEndDate(input.startDate, plan.durationMonths, plan.durationDays);

  await db.insert(memberships).values({
    id: newMembershipId,
    gymId: gym.id,
    memberId: current.memberId,
    planId: plan.id,
    startDate: input.startDate,
    endDate,
    totalAmountInr: input.totalAmountInr,
    discountInr: input.discountInr || 0,
    paidAmountInr: input.paidAmountInr || 0,
    status: 'ACTIVE',
    notes: input.notes || 'Renewed membership',
    createdByUserId: user.id,
  });

  // Ensure member is marked ACTIVE
  await db.update(members).set({ status: 'ACTIVE' }).where(eq(members.id, current.memberId));

  let receiptNumber: string | null = null;
  if (input.paidAmountInr > 0 && member) {
    const paymentId = `pay_${crypto.randomUUID()}`;
    const [payCountResult] = await db
      .select({ val: sql<number>`count(*)` })
      .from(payments)
      .where(eq(payments.gymId, gym.id));
    receiptNumber = `REC-${new Date().getFullYear()}-${String((payCountResult?.val || 0) + 1).padStart(4, '0')}`;

    await db.insert(payments).values({
      id: paymentId,
      gymId: gym.id,
      branchId: member.branchId,
      memberId: member.id,
      membershipId: newMembershipId,
      receiptNumber,
      amountInr: input.paidAmountInr,
      paymentMethod: input.paymentMethod,
      paymentDate: input.startDate,
      upiRefOrTxnId: input.upiRef || null,
      collectedByUserId: user.id,
      notes: `Renewal payment (${plan.name})`,
    });
  }

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'MEMBERSHIP_RENEWED',
    entityType: 'MEMBERSHIP',
    entityId: newMembershipId,
    newState: { memberId: current.memberId, startDate: input.startDate, endDate },
  });

  return c.json({
    success: true,
    data: {
      id: newMembershipId,
      startDate: input.startDate,
      endDate,
      totalAmountInr: input.totalAmountInr,
      paidAmountInr: input.paidAmountInr,
      receiptNumber,
    },
  }, 201);
});

// GET /api/memberships/expiring (Expiring memberships in next N days)
membershipRoutes.get('/expiring', async (c) => {
  const gym = c.get('gym')!;
  const days = parseInt(c.req.query('days') || '7', 10);
  const db = getDb(c.env.DB);

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + days);

  const todayStr = today.toISOString().split('T')[0];
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const expiringRows = await db
    .select({
      membershipId: memberships.id,
      memberId: members.id,
      memberName: members.fullName,
      memberPhone: members.phone,
      memberCode: members.memberCode,
      branchName: branches.name,
      planName: membershipPlans.name,
      startDate: memberships.startDate,
      endDate: memberships.endDate,
      status: memberships.status,
    })
    .from(memberships)
    .innerJoin(members, eq(memberships.memberId, members.id))
    .innerJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .leftJoin(branches, eq(members.branchId, branches.id))
    .where(
      and(
        eq(memberships.gymId, gym.id),
        eq(memberships.status, 'ACTIVE'),
        gte(memberships.endDate, todayStr),
        lte(memberships.endDate, targetDateStr),
        isNull(members.deletedAt)
      )
    )
    .orderBy(memberships.endDate);

  return c.json({ success: true, data: expiringRows });
});
