export interface MembershipRow {
  id: string;
  gym_id: string;
  member_id: string;
  membership_plan_id: string;
  start_date: number;
  end_date: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export class MembershipRepository {
  constructor(private db: D1Database, private gymId: string) {}

  async findByMemberId(memberId: string) {
    return await this.db
      .prepare(`
        SELECT ms.*, mp.name as plan_name, mp.duration_months
        FROM memberships ms
        JOIN membership_plans mp ON mp.id = ms.membership_plan_id
        WHERE ms.member_id = ? AND ms.gym_id = ?
        ORDER BY ms.created_at DESC
      `)
      .bind(memberId, this.gymId)
      .all<any>();
  }

  async findActiveByMemberId(memberId: string) {
    return await this.db
      .prepare(`
        SELECT ms.*, mp.name as plan_name
        FROM memberships ms
        JOIN membership_plans mp ON mp.id = ms.membership_plan_id
        WHERE ms.member_id = ? AND ms.gym_id = ? AND ms.status = 'ACTIVE'
        ORDER BY ms.end_date DESC
        LIMIT 1
      `)
      .bind(memberId, this.gymId)
      .first<any>();
  }

  async create(data: {
    id: string;
    member_id: string;
    membership_plan_id: string;
    start_date: number;
    end_date: number;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount: number;
    due_amount: number;
    notes?: string;
  }) {
    await this.db
      .prepare(`
        INSERT INTO memberships (
          id, gym_id, member_id, membership_plan_id, start_date, end_date,
          total_amount, discount_amount, final_amount, paid_amount, due_amount,
          status, notes, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          'ACTIVE', ?, unixepoch(), unixepoch()
        )
      `)
      .bind(
        data.id,
        this.gymId,
        data.member_id,
        data.membership_plan_id,
        data.start_date,
        data.end_date,
        data.total_amount,
        data.discount_amount,
        data.final_amount,
        data.paid_amount,
        data.due_amount,
        data.notes || null
      )
      .run();
  }

  async updatePaymentProgress(id: string, additionalPaid: number) {
    const current = await this.db
      .prepare(`SELECT * FROM memberships WHERE id = ? AND gym_id = ?`)
      .bind(id, this.gymId)
      .first<MembershipRow>();

    if (!current) return;

    const newPaid = current.paid_amount + additionalPaid;
    const newDue = Math.max(0, current.final_amount - newPaid);

    await this.db
      .prepare(`
        UPDATE memberships 
        SET paid_amount = ?, due_amount = ?, updated_at = unixepoch() 
        WHERE id = ? AND gym_id = ?
      `)
      .bind(newPaid, newDue, id, this.gymId)
      .run();
  }

  async getExpiringSoon(days = 7) {
    const now = Math.floor(Date.now() / 1000);
    const target = now + days * 86400;

    const { results } = await this.db
      .prepare(`
        SELECT ms.*, m.first_name, m.last_name, m.phone, m.member_code, mp.name as plan_name
        FROM memberships ms
        JOIN members m ON m.id = ms.member_id
        JOIN membership_plans mp ON mp.id = ms.membership_plan_id
        WHERE ms.gym_id = ? AND ms.status = 'ACTIVE' AND ms.end_date >= ? AND ms.end_date <= ?
        ORDER BY ms.end_date ASC
      `)
      .bind(this.gymId, now, target)
      .all<any>();

    return results;
  }
}
