import { Hono } from 'hono';
import { eq, and, sql, isNull, desc } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import {
  members,
  memberships,
  payments,
  attendance,
  branches,
  membershipPlans,
  users,
} from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

export const dashboardRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

dashboardRoutes.use('*', authMiddleware, tenantMiddleware);

// GET /api/dashboard/summary
dashboardRoutes.get('/summary', async (c) => {
  const gym = c.get('gym')!;
  const db = getDb(c.env.DB);

  // 1. Member stats
  const [totalMembersRow] = await db
    .select({ val: sql<number>`count(*)` })
    .from(members)
    .where(and(eq(members.gymId, gym.id), isNull(members.deletedAt)));

  const [activeMembersRow] = await db
    .select({ val: sql<number>`count(*)` })
    .from(members)
    .where(and(eq(members.gymId, gym.id), eq(members.status, 'ACTIVE'), isNull(members.deletedAt)));

  // 2. Expiring in next 7 days
  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);
  const todayStr = today.toISOString().split('T')[0];
  const next7DaysStr = next7Days.toISOString().split('T')[0];

  const [expiringRow] = await db
    .select({ val: sql<number>`count(*)` })
    .from(memberships)
    .innerJoin(members, eq(memberships.memberId, members.id))
    .where(
      and(
        eq(memberships.gymId, gym.id),
        eq(memberships.status, 'ACTIVE'),
        sql`${memberships.endDate} >= ${todayStr} AND ${memberships.endDate} <= ${next7DaysStr}`,
        isNull(members.deletedAt)
      )
    );

  // 3. Today's attendance count
  const [todayAttendanceRow] = await db
    .select({ val: sql<number>`count(*)` })
    .from(attendance)
    .where(and(eq(attendance.gymId, gym.id), sql`date(${attendance.checkInTime}) = date('now')`));

  // 4. Monthly revenue (current calendar month in INR Paise)
  const [monthlyRevenueRow] = await db
    .select({ val: sql<number>`coalesce(sum(${payments.amountInr}), 0)` })
    .from(payments)
    .where(
      and(
        eq(payments.gymId, gym.id),
        sql`strftime('%Y-%m', ${payments.paymentDate}) = strftime('%Y-%m', 'now')`
      )
    );

  // 5. Total pending dues
  const [pendingDuesRow] = await db
    .select({
      val: sql<number>`coalesce(sum(${memberships.totalAmountInr} - ${memberships.paidAmountInr}), 0)`,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.gymId, gym.id),
        eq(memberships.status, 'ACTIVE'),
        sql`${memberships.totalAmountInr} > ${memberships.paidAmountInr}`
      )
    );

  // 6. Recent Payments
  const recentPayments = await db
    .select({
      id: payments.id,
      gymId: payments.gymId,
      branchId: payments.branchId,
      memberId: payments.memberId,
      memberName: members.fullName,
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
    .leftJoin(users, eq(payments.collectedByUserId, users.id))
    .where(eq(payments.gymId, gym.id))
    .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
    .limit(5);

  // 7. Recent Attendance
  const recentAttendance = await db
    .select({
      id: attendance.id,
      gymId: attendance.gymId,
      branchId: attendance.branchId,
      branchName: branches.name,
      memberId: attendance.memberId,
      memberName: members.fullName,
      memberCode: members.memberCode,
      photoR2Key: members.photoR2Key,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      checkInMethod: attendance.checkInMethod,
      markedByUserId: attendance.markedByUserId,
    })
    .from(attendance)
    .innerJoin(members, eq(attendance.memberId, members.id))
    .leftJoin(branches, eq(attendance.branchId, branches.id))
    .where(eq(attendance.gymId, gym.id))
    .orderBy(desc(attendance.checkInTime))
    .limit(5);

  return c.json({
    success: true,
    data: {
      totalMembers: totalMembersRow?.val || 0,
      activeMembers: activeMembersRow?.val || 0,
      expiringIn7Days: expiringRow?.val || 0,
      todayAttendance: todayAttendanceRow?.val || 0,
      monthlyRevenueInr: monthlyRevenueRow?.val || 0,
      totalPendingDuesInr: pendingDuesRow?.val || 0,
      recentPayments,
      recentAttendance,
    },
  });
});
