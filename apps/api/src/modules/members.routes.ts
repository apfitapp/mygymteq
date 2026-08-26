import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, sql, isNull, desc, like, or } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import {
  members,
  memberships,
  membershipPlans,
  payments,
  attendance,
  branches,
  users,
} from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { recordAuditLog } from '../lib/audit';
import { calculateMembershipEndDate } from '@gym/shared';
import {
  CreateMemberSchema,
  UpdateMemberSchema,
} from '@gym/shared';

export const memberRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All routes require authentication and tenant context
memberRoutes.use('*', authMiddleware, tenantMiddleware);

// GET /api/members
memberRoutes.get('/', async (c) => {
  const gym = c.get('gym')!;
  const query = c.req.query('q') || '';
  const status = c.req.query('status') || '';
  const branchId = c.req.query('branchId') || '';
  const db = getDb(c.env.DB);

  const memberRows = await db
    .select({
      id: members.id,
      gymId: members.gymId,
      branchId: members.branchId,
      branchName: branches.name,
      memberCode: members.memberCode,
      fullName: members.fullName,
      phone: members.phone,
      email: members.email,
      gender: members.gender,
      dob: members.dob,
      photoR2Key: members.photoR2Key,
      emergencyContactName: members.emergencyContactName,
      emergencyContactPhone: members.emergencyContactPhone,
      medicalNotes: members.medicalNotes,
      address: members.address,
      joiningDate: members.joiningDate,
      status: members.status,
      createdAt: members.createdAt,
    })
    .from(members)
    .leftJoin(branches, eq(members.branchId, branches.id))
    .where(
      and(
        eq(members.gymId, gym.id),
        isNull(members.deletedAt),
        branchId ? eq(members.branchId, branchId) : undefined,
        status ? eq(members.status, status as any) : undefined,
        query
          ? or(
              like(members.fullName, `%${query}%`),
              like(members.phone, `%${query}%`),
              like(members.memberCode, `%${query}%`)
            )
          : undefined
      )
    )
    .orderBy(desc(members.createdAt))
    .limit(100);

  // Hydrate each member with active membership summary
  const hydratedMembers = await Promise.all(
    memberRows.map(async (m) => {
      const [activeMemb] = await db
        .select({
          id: memberships.id,
          planName: membershipPlans.name,
          startDate: memberships.startDate,
          endDate: memberships.endDate,
          status: memberships.status,
          totalAmountInr: memberships.totalAmountInr,
          paidAmountInr: memberships.paidAmountInr,
        })
        .from(memberships)
        .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
        .where(
          and(
            eq(memberships.memberId, m.id),
            eq(memberships.gymId, gym.id),
            eq(memberships.status, 'ACTIVE')
          )
        )
        .orderBy(desc(memberships.endDate))
        .limit(1);

      return {
        ...m,
        activeMembership: activeMemb
          ? {
              ...activeMemb,
              dueAmountInr: Math.max(0, activeMemb.totalAmountInr - activeMemb.paidAmountInr),
            }
          : null,
      };
    })
  );

  return c.json({ success: true, data: hydratedMembers });
});

// POST /api/members (Create Member + Optional Immediate Plan & Payment)
memberRoutes.post('/', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF']), zValidator('json', CreateMemberSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  // Generate sequential member code if not provided (e.g. MEM-1001, MEM-1002)
  let memberCode = input.memberCode?.trim();
  if (!memberCode) {
    const [countResult] = await db
      .select({ val: sql<number>`count(*)` })
      .from(members)
      .where(eq(members.gymId, gym.id));
    const nextNum = (countResult?.val || 0) + 1001;
    memberCode = `MEM-${nextNum}`;
  }

  const memberId = `mem_${crypto.randomUUID()}`;

  await db.insert(members).values({
    id: memberId,
    gymId: gym.id,
    branchId: input.branchId,
    memberCode,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email ? input.email.trim() : null,
    gender: input.gender || null,
    dob: input.dob || null,
    emergencyContactName: input.emergencyContactName || null,
    emergencyContactPhone: input.emergencyContactPhone || null,
    medicalNotes: input.medicalNotes || null,
    address: input.address || null,
    joiningDate: input.joiningDate,
    status: 'ACTIVE',
  });

  // If initial membership plan was selected during member creation
  let createdMembershipId: string | null = null;
  if (input.initialPlanId) {
    const [plan] = await db
      .select()
      .from(membershipPlans)
      .where(and(eq(membershipPlans.id, input.initialPlanId), eq(membershipPlans.gymId, gym.id)))
      .limit(1);

    if (plan) {
      createdMembershipId = `mship_${crypto.randomUUID()}`;
      const startDate = input.joiningDate;
      const endDate = calculateMembershipEndDate(startDate, plan.durationMonths, plan.durationDays);
      const totalAmountInr = plan.priceInr + plan.admissionFeeInr;
      const initialPaid = input.initialPaidAmountInr ?? totalAmountInr;

      await db.insert(memberships).values({
        id: createdMembershipId,
        gymId: gym.id,
        memberId,
        planId: plan.id,
        startDate,
        endDate,
        totalAmountInr,
        discountInr: 0,
        paidAmountInr: initialPaid,
        status: 'ACTIVE',
        createdByUserId: user.id,
      });

      if (initialPaid > 0) {
        const paymentId = `pay_${crypto.randomUUID()}`;
        const [payCountResult] = await db
          .select({ val: sql<number>`count(*)` })
          .from(payments)
          .where(eq(payments.gymId, gym.id));
        const receiptNumber = `REC-${new Date().getFullYear()}-${String((payCountResult?.val || 0) + 1).padStart(4, '0')}`;

        await db.insert(payments).values({
          id: paymentId,
          gymId: gym.id,
          branchId: input.branchId,
          memberId,
          membershipId: createdMembershipId,
          receiptNumber,
          amountInr: initialPaid,
          paymentMethod: input.initialPaymentMethod || 'UPI',
          paymentDate: startDate,
          upiRefOrTxnId: input.initialUpiRef || null,
          collectedByUserId: user.id,
          notes: 'Initial admission & plan payment',
        });
      }
    }
  }

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'MEMBER_CREATED',
    entityType: 'MEMBER',
    entityId: memberId,
    newState: { memberCode, fullName: input.fullName, phone: input.phone },
  });

  return c.json({
    success: true,
    data: {
      id: memberId,
      memberCode,
      fullName: input.fullName,
      phone: input.phone,
      membershipId: createdMembershipId,
    },
  }, 201);
});

// GET /api/members/:id (360 Degree Profile)
memberRoutes.get('/:id', async (c) => {
  const gym = c.get('gym')!;
  const memberId = c.req.param('id');
  const db = getDb(c.env.DB);

  const [member] = await db
    .select({
      id: members.id,
      gymId: members.gymId,
      branchId: members.branchId,
      branchName: branches.name,
      memberCode: members.memberCode,
      fullName: members.fullName,
      phone: members.phone,
      email: members.email,
      gender: members.gender,
      dob: members.dob,
      photoR2Key: members.photoR2Key,
      emergencyContactName: members.emergencyContactName,
      emergencyContactPhone: members.emergencyContactPhone,
      medicalNotes: members.medicalNotes,
      address: members.address,
      joiningDate: members.joiningDate,
      status: members.status,
      createdAt: members.createdAt,
    })
    .from(members)
    .leftJoin(branches, eq(members.branchId, branches.id))
    .where(and(eq(members.id, memberId), eq(members.gymId, gym.id), isNull(members.deletedAt)))
    .limit(1);

  if (!member) {
    return c.json({ success: false, error: 'Member not found' }, 404);
  }

  // Fetch all membership histories
  const memberMemberships = await db
    .select({
      id: memberships.id,
      planId: memberships.planId,
      planName: membershipPlans.name,
      startDate: memberships.startDate,
      endDate: memberships.endDate,
      totalAmountInr: memberships.totalAmountInr,
      discountInr: memberships.discountInr,
      paidAmountInr: memberships.paidAmountInr,
      status: memberships.status,
      notes: memberships.notes,
      createdAt: memberships.createdAt,
    })
    .from(memberships)
    .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .where(and(eq(memberships.memberId, memberId), eq(memberships.gymId, gym.id)))
    .orderBy(desc(memberships.startDate));

  // Fetch payment records
  const memberPayments = await db
    .select({
      id: payments.id,
      receiptNumber: payments.receiptNumber,
      amountInr: payments.amountInr,
      paymentMethod: payments.paymentMethod,
      paymentDate: payments.paymentDate,
      upiRefOrTxnId: payments.upiRefOrTxnId,
      notes: payments.notes,
      collectedByName: users.fullName,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .leftJoin(users, eq(payments.collectedByUserId, users.id))
    .where(and(eq(payments.memberId, memberId), eq(payments.gymId, gym.id)))
    .orderBy(desc(payments.paymentDate));

  // Fetch recent attendance
  const memberAttendance = await db
    .select({
      id: attendance.id,
      checkInTime: attendance.checkInTime,
      checkInMethod: attendance.checkInMethod,
      branchName: branches.name,
    })
    .from(attendance)
    .leftJoin(branches, eq(attendance.branchId, branches.id))
    .where(and(eq(attendance.memberId, memberId), eq(attendance.gymId, gym.id)))
    .orderBy(desc(attendance.checkInTime))
    .limit(30);

  return c.json({
    success: true,
    data: {
      member,
      memberships: memberMemberships,
      payments: memberPayments,
      attendance: memberAttendance,
    },
  });
});

// PUT /api/members/:id
memberRoutes.put('/:id', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF']), zValidator('json', UpdateMemberSchema), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const memberId = c.req.param('id');
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);

  const [existing] = await db
    .select()
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.gymId, gym.id), isNull(members.deletedAt)))
    .limit(1);

  if (!existing) {
    return c.json({ success: false, error: 'Member not found' }, 404);
  }

  await db
    .update(members)
    .set({
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ? input.email.trim() : null,
      gender: input.gender || null,
      dob: input.dob || null,
      emergencyContactName: input.emergencyContactName || null,
      emergencyContactPhone: input.emergencyContactPhone || null,
      medicalNotes: input.medicalNotes || null,
      address: input.address || null,
      status: input.status || existing.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, memberId));

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'MEMBER_UPDATED',
    entityType: 'MEMBER',
    entityId: memberId,
    oldState: existing,
    newState: input,
  });

  return c.json({ success: true, message: 'Member profile updated' });
});

// DELETE /api/members/:id (Soft Delete)
memberRoutes.delete('/:id', requireRole(['SUPER_ADMIN', 'GYM_OWNER']), async (c) => {
  const gym = c.get('gym')!;
  const user = c.get('user')!;
  const memberId = c.req.param('id');
  const db = getDb(c.env.DB);

  await db
    .update(members)
    .set({ deletedAt: new Date().toISOString(), status: 'INACTIVE' })
    .where(and(eq(members.id, memberId), eq(members.gymId, gym.id)));

  await recordAuditLog({
    db,
    gymId: gym.id,
    userId: user.id,
    action: 'MEMBER_DELETED',
    entityType: 'MEMBER',
    entityId: memberId,
  });

  return c.json({ success: true, message: 'Member deleted successfully' });
});
