import { Attendance, AttendanceMethod } from '@gym/shared';

export interface AttendanceListItem extends Attendance {
  first_name: string;
  last_name: string | null;
  member_code: string;
  phone: string;
  photo_url?: string | null;
}

export class AttendanceRepository {
  constructor(private db: D1Database, private gymId: string) {}

  async checkIn(data: {
    id: string;
    member_id: string;
    method: AttendanceMethod;
    recorded_by_user_id?: string | null;
  }): Promise<{ alreadyCheckedIn: boolean }> {
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await this.db
      .prepare(`
        SELECT id FROM attendance 
        WHERE gym_id = ? AND member_id = ? AND date_key = ?
      `)
      .bind(this.gymId, data.member_id, today)
      .first();

    if (existing) {
      return { alreadyCheckedIn: true };
    }

    await this.db
      .prepare(`
        INSERT INTO attendance (
          id, gym_id, member_id, check_in_time, date_key, method, recorded_by_user_id, created_at
        ) VALUES (
          ?, ?, ?, unixepoch(), ?, ?, ?, unixepoch()
        )
      `)
      .bind(
        data.id,
        this.gymId,
        data.member_id,
        today,
        data.method,
        data.recorded_by_user_id || null
      )
      .run();

    return { alreadyCheckedIn: false };
  }

  async listToday(): Promise<AttendanceListItem[]> {
    const today = new Date().toISOString().split('T')[0];

    const { results } = await this.db
      .prepare(`
        SELECT a.*, m.first_name, m.last_name, m.member_code, m.phone, m.photo_url
        FROM attendance a
        JOIN members m ON m.id = a.member_id
        WHERE a.gym_id = ? AND a.date_key = ?
        ORDER BY a.check_in_time DESC
      `)
      .bind(this.gymId, today)
      .all<AttendanceListItem>();

    return results || [];
  }

  async listByMember(memberId: string, limit = 30): Promise<Attendance[]> {
    const { results } = await this.db
      .prepare(`
        SELECT * FROM attendance
        WHERE member_id = ? AND gym_id = ?
        ORDER BY check_in_time DESC
        LIMIT ?
      `)
      .bind(memberId, this.gymId, limit)
      .all<Attendance>();

    return results || [];
  }

  async countToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const res = await this.db
      .prepare(`SELECT COUNT(*) as count FROM attendance WHERE gym_id = ? AND date_key = ?`)
      .bind(this.gymId, today)
      .first<{ count: number }>();
    return res?.count || 0;
  }
}
