import { DbClient } from '../db/client';
import { auditLogs } from '../db/schema';

export interface RecordAuditOptions {
  db: DbClient;
  gymId: string | null;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldState?: unknown;
  newState?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAuditLog(options: RecordAuditOptions): Promise<void> {
  try {
    const id = `audit_${crypto.randomUUID()}`;
    await options.db.insert(auditLogs).values({
      id,
      gymId: options.gymId,
      userId: options.userId,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      oldState: options.oldState ? JSON.stringify(options.oldState) : null,
      newState: options.newState ? JSON.stringify(options.newState) : null,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
