import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import {
  payments,
  memberships,
  members,
  membershipPlans,
  branches,
  users,
} from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { recordAuditLog } from '../lib/audit';
import { RecordPaymentSchema } from '@gym/shared';

export const paymentRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

paymentRoutes.use('*', authMiddleware, tenantMiddleware);

// GET /api/payments (Transaction ledger)
paymentRoutes.get('/', async (c) => {
  const gym = c.get('gym')!;
  const memberId = c.req.query('memberId');
  const db = getDb(c.env.DB);

  const paymentList = await db
    .select({
      id: payments.id,
      gymId: payments.gymId,
      branchId: payments.branchId,
      branchName: branches.name,
      memberId: payments.memberId,
      memberName: members.fullName,
      memberPhone: members.phone,
      memberCode: members.memberCode,
      membershipId: payments.membershipId,
      planName: membershipPlans.name,
      receiptNumber: payments.receiptNumber,
      amountInr: payments.amountInr,
      paymentMethod: payments.paymentMethod,
      paymentDate: payments.paymentDate,
      upiRefOrTxnId: payments.upiRefOrTxnId,
      collectedByUserId: payments.collectedByUserId,
      collectedByName: users.fullName,
      notes: payments.notes,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(members, eq(payments.memberId, members.id))
    .leftJoin(branches, eq(payments.branchId, branches.id))
    .leftJoin(memberships, eq(payments.membershipId, memberships.id))
    .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .leftJoin(users, eq(payments.collectedByUserId, users.id))
    .where(
      and(
        eq(payments.gymId, gym.id),
        memberId ? eq(payments.memberId, memberId) : undefined
      )
    )
    .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
    .limit(100);

  return c.json({ success: true, data: paymentList });
});

// POST /api/payments (Record a payment against a member/membership)
paymentRoutes.post('/', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF']), zValidator('json', RecordPaymentSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, input.memberId), eq(members.gymId, gym.id)))
    .limit(1);

  if (!member) {
    return c.json({ success: false, error: 'Member not found' }, 404);
  }

  // Generate sequential receipt number (e.g. REC-2026-0001)
  const [payCountResult] = await db
    .select({ val: sql<number>`count(*)` })
    .from(payments)
    .where(eq(payments.gymId, gym.id));
  const nextRec = (payCountResult?.val || 0) + 1;
  const currentYear = new Date().getFullYear();
  const receiptNumber = `REC-${currentYear}-${String(nextRec).padStart(4, '0')}`;

  const paymentId = `pay_${crypto.randomUUID()}`;

  // Insert payment
  await db.insert(payments).values({
    id: paymentId,
    gymId: gym.id,
    branchId: member.branchId,
    memberId: member.id,
    membershipId: input.membershipId || null,
    receiptNumber,
    amountInr: input.amountInr,
    paymentMethod: input.paymentMethod,
    paymentDate: input.paymentDate,
    upiRefOrTxnId: input.upiRefOrTxnId || null,
    collectedByUserId: user.id,
    notes: input.notes || null,
  });

  // If tied to a membership, update paid_amount_inr
  if (input.membershipId) {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.id, input.membershipId), eq(memberships.gymId, gym.id)))
      .limit(1);

    if (membership) {
      const updatedPaidAmount = membership.paidAmountInr + input.amountInr;
      await db
        .update(memberships)
        .set({
          paidAmountInr: updatedPaidAmount,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(memberships.id, membership.id));
    }
  }

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'PAYMENT_RECORDED',
    entityType: 'PAYMENT',
    entityId: paymentId,
    newState: { receiptNumber, amountInr: input.amountInr, method: input.paymentMethod, memberId: member.id },
  });

  return c.json({
    success: true,
    data: {
      id: paymentId,
      receiptNumber,
      amountInr: input.amountInr,
      paymentMethod: input.paymentMethod,
      paymentDate: input.paymentDate,
      memberName: member.fullName,
      memberPhone: member.phone,
    },
  }, 201);
});

// GET /api/payments/dues (List members with outstanding membership balance)
paymentRoutes.get('/dues', async (c) => {
  const gym = c.get('gym')!;
  const db = getDb(c.env.DB);

  const duesList = await db
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
      totalAmountInr: memberships.totalAmountInr,
      paidAmountInr: memberships.paidAmountInr,
    })
    .from(memberships)
    .innerJoin(members, eq(memberships.memberId, members.id))
    .innerJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .leftJoin(branches, eq(members.branchId, branches.id))
    .where(
      and(
        eq(memberships.gymId, gym.id),
        eq(memberships.status, 'ACTIVE'),
        sql`${memberships.totalAmountInr} > ${memberships.paidAmountInr}`
      )
    )
    .orderBy(desc(sql`${memberships.totalAmountInr} - ${memberships.paidAmountInr}`));

  const formattedDues = duesList.map((row) => ({
    ...row,
    dueAmountInr: row.totalAmountInr - row.paidAmountInr,
  }));

  return c.json({ success: true, data: formattedDues });
});
