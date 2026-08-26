import { DbClient } from '../db/client';
import { memberships, members } from '../db/schema';
import { eq, and, lte, sql } from 'drizzle-orm';

/**
 * Scheduled Daily Cron Job (18:31 UTC = 00:01 IST)
 * Transitions past memberships from ACTIVE to EXPIRED
 */
export async function runMembershipExpiryJob(db: DbClient): Promise<{ expiredCount: number }> {
  const todayStr = new Date().toISOString().split('T')[0];

  // Find active memberships that passed end date
  const expiredRows = await db
    .select({
      id: memberships.id,
      memberId: memberships.memberId,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.status, 'ACTIVE'),
        lte(memberships.endDate, todayStr)
      )
    );

  if (expiredRows.length === 0) {
    return { expiredCount: 0 };
  }

  // Update membership status
  for (const row of expiredRows) {
    await db
      .update(memberships)
      .set({ status: 'EXPIRED', updatedAt: new Date().toISOString() })
      .where(eq(memberships.id, row.id));

    // Check if member has any other active membership
    const otherActive = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.memberId, row.memberId),
          eq(memberships.status, 'ACTIVE'),
          sql`${memberships.id} != ${row.id}`
        )
      )
      .limit(1);

    if (otherActive.length === 0) {
      await db
        .update(members)
        .set({ status: 'EXPIRED', updatedAt: new Date().toISOString() })
        .where(eq(members.id, row.memberId));
    }
  }

  return { expiredCount: expiredRows.length };
}
