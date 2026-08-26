import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Bindings, Variables } from '../env';
import { getDb } from '../db/client';
import { attendance, members, branches, users } from '../db/schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { CheckInMemberSchema } from '@gym/shared';

export const attendanceRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// POST /api/attendance/self-check-in (Public for members scanning Front-Desk QR)
attendanceRoutes.post('/self-check-in', async (c) => {
  const body = await c.req.json<{ gymId: string; branchId: string; identifier: string }>().catch(() => null);
  if (!body || !body.gymId || !body.branchId || !body.identifier) {
    return c.json({ success: false, error: 'gymId, branchId, and identifier (phone or memberCode) are required' }, 400);
  }

  const db = getDb(c.env.DB);
  const cleanId = body.identifier.trim();

  // Find active gym
  const [gym] = await db.select().from(branches).where(and(eq(branches.id, body.branchId), eq(branches.gymId, body.gymId))).limit(1);
  if (!gym) {
    return c.json({ success: false, error: 'Invalid gym or branch' }, 404);
  }

  // Find member by phone or memberCode
  const [member] = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.gymId, body.gymId),
        sql`(${members.phone} = ${cleanId} OR ${members.memberCode} = ${cleanId.toUpperCase()})`
      )
    )
    .limit(1);

  if (!member) {
    return c.json({ success: false, error: 'Member not found with this phone number or ID code' }, 404);
  }

  if (member.status === 'EXPIRED' || member.status === 'INACTIVE') {
    return c.json({
      success: false,
      error: `Membership is ${member.status}. Please visit the front desk to renew before checking in.`,
    }, 403);
  }

  // Check duplicate within 20 mins
  const recentCheckins = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.gymId, body.gymId),
        eq(attendance.memberId, member.id),
        sql`${attendance.checkInTime} >= datetime('now', '-20 minutes')`
      )
    )
    .limit(1);

  if (recentCheckins.length > 0) {
    return c.json({
      success: false,
      error: `${member.fullName} is already checked in (${recentCheckins[0].checkInTime})`,
    }, 409);
  }

  const attendanceId = `att_${crypto.randomUUID()}`;
  await db.insert(attendance).values({
    id: attendanceId,
    gymId: body.gymId,
    branchId: body.branchId,
    memberId: member.id,
    checkInMethod: 'QR_SCAN',
    markedByUserId: null,
  });

  return c.json({
    success: true,
    data: {
      id: attendanceId,
      memberName: member.fullName,
      memberCode: member.memberCode,
      status: member.status,
      checkInTime: new Date().toISOString(),
    },
  });
});

// Protected routes require staff auth
attendanceRoutes.use('/today', authMiddleware, tenantMiddleware);
attendanceRoutes.use('/check-in', authMiddleware, tenantMiddleware);

// GET /api/attendance/today (Today's check-in log)
attendanceRoutes.get('/today', async (c) => {
  const gym = c.get('gym')!;
  const branchId = c.req.query('branchId');
  const db = getDb(c.env.DB);

  // In SQLite, date('now') returns UTC date
  const todayRecords = await db
    .select({
      id: attendance.id,
      gymId: attendance.gymId,
      branchId: attendance.branchId,
      branchName: branches.name,
      memberId: attendance.memberId,
      memberName: members.fullName,
      memberCode: members.memberCode,
      memberPhone: members.phone,
      photoR2Key: members.photoR2Key,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      checkInMethod: attendance.checkInMethod,
      markedByName: users.fullName,
    })
    .from(attendance)
    .innerJoin(members, eq(attendance.memberId, members.id))
    .leftJoin(branches, eq(attendance.branchId, branches.id))
    .leftJoin(users, eq(attendance.markedByUserId, users.id))
    .where(
      and(
        eq(attendance.gymId, gym.id),
        sql`date(${attendance.checkInTime}) = date('now')`,
        branchId ? eq(attendance.branchId, branchId) : undefined
      )
    )
    .orderBy(desc(attendance.checkInTime))
    .limit(200);

  return c.json({ success: true, data: todayRecords });
});

// POST /api/attendance/check-in (Staff manual check-in)
attendanceRoutes.post('/check-in', requireRole(['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF', 'TRAINER']), zValidator('json', CheckInMemberSchema), async (c) => {
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

  // Prevent duplicate check-in within last 20 minutes
  const recentCheckins = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.gymId, gym.id),
        eq(attendance.memberId, member.id),
        sql`${attendance.checkInTime} >= datetime('now', '-20 minutes')`
      )
    )
    .limit(1);

  if (recentCheckins.length > 0) {
    return c.json({
      success: false,
      error: `${member.fullName} was already checked in recently (${recentCheckins[0].checkInTime})`,
    }, 409);
  }

  const attendanceId = `att_${crypto.randomUUID()}`;

  await db.insert(attendance).values({
    id: attendanceId,
    gymId: gym.id,
    branchId: input.branchId,
    memberId: member.id,
    checkInMethod: input.checkInMethod,
    markedByUserId: user.id,
  });

  return c.json({
    success: true,
    data: {
      id: attendanceId,
      memberName: member.fullName,
      memberCode: member.memberCode,
      checkInTime: new Date().toISOString(),
    },
  }, 201);
});
