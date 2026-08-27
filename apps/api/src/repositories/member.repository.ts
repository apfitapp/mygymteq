import { Member, MemberStatus } from '@gym/shared';

export interface MemberListItem extends Member {
  active_membership_id?: string | null;
  membership_status?: string | null;
  membership_end_date?: number | null;
  membership_due_amount?: number | null;
  plan_name?: string | null;
}

export class MemberRepository {
  constructor(private db: D1Database, private gymId: string) {}

  async list(params: { search?: string; status?: string; limit?: number; offset?: number }): Promise<MemberListItem[]> {
    let query = `
      SELECT m.*, 
             ms.id as active_membership_id,
             ms.status as membership_status,
             ms.end_date as membership_end_date,
             ms.due_amount as membership_due_amount,
             mp.name as plan_name
      FROM members m
      LEFT JOIN memberships ms ON ms.member_id = m.id AND ms.status = 'ACTIVE'
      LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
      WHERE m.gym_id = ? AND m.deleted_at IS NULL
    `;
    const bindings: any[] = [this.gymId];

    if (params.status && params.status !== 'ALL') {
      query += ` AND m.status = ?`;
      bindings.push(params.status);
    }

    if (params.search) {
      query += ` AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.phone LIKE ? OR m.member_code LIKE ?)`;
      const term = `%${params.search}%`;
      bindings.push(term, term, term, term);
    }

    query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    bindings.push(params.limit || 50, params.offset || 0);

    const { results } = await this.db.prepare(query).bind(...bindings).all<MemberListItem>();
    return results || [];
  }

  async countActive(): Promise<number> {
    const res = await this.db
      .prepare(`SELECT COUNT(*) as count FROM members WHERE gym_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL`)
      .bind(this.gymId)
      .first<{ count: number }>();
    return res?.count || 0;
  }

  async findById(id: string): Promise<Member | null> {
    return await this.db
      .prepare(`SELECT * FROM members WHERE id = ? AND gym_id = ? AND deleted_at IS NULL`)
      .bind(id, this.gymId)
      .first<Member>();
  }

  async findByIdentifier(identifier: string): Promise<Member | null> {
    return await this.db
      .prepare(`
        SELECT * FROM members 
        WHERE gym_id = ? AND (phone = ? OR member_code = ?) AND deleted_at IS NULL
      `)
      .bind(this.gymId, identifier, identifier)
      .first<Member>();
  }

  async getNextMemberCode(): Promise<string> {
    const res = await this.db
      .prepare(`SELECT COUNT(*) as total FROM members WHERE gym_id = ?`)
      .bind(this.gymId)
      .first<{ total: number }>();
    const count = (res?.total || 0) + 1;
    return `MEM-${1000 + count}`;
  }

  async create(data: {
    id: string;
    member_code: string;
    first_name: string;
    last_name?: string | null;
    email?: string | null;
    phone: string;
    gender?: string | null;
    date_of_birth?: string | null;
    blood_group?: string | null;
    photo_url?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    health_notes?: string | null;
    joined_date: number;
  }): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO members (
          id, gym_id, member_code, first_name, last_name, email, phone, 
          gender, date_of_birth, blood_group, photo_url, address, 
          emergency_contact_name, emergency_contact_phone, health_notes, 
          status, joined_date, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?, 
          ?, ?, ?, 
          'ACTIVE', ?, unixepoch(), unixepoch()
        )
      `)
      .bind(
        data.id,
        this.gymId,
        data.member_code,
        data.first_name,
        data.last_name || null,
        data.email || null,
        data.phone,
        data.gender || null,
        data.date_of_birth || null,
        data.blood_group || null,
        data.photo_url || null,
        data.address || null,
        data.emergency_contact_name || null,
        data.emergency_contact_phone || null,
        data.health_notes || null,
        data.joined_date
      )
      .run();
  }

  async update(id: string, data: Partial<Member>): Promise<void> {
    const fields: string[] = [];
    const bindings: any[] = [];

    const allowedKeys: (keyof Member)[] = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'gender',
      'date_of_birth',
      'address',
      'emergency_contact_name',
      'emergency_contact_phone',
      'health_notes',
      'status',
    ];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`${String(key)} = ?`);
        bindings.push(data[key]);
      }
    }

    if (fields.length === 0) return;

    fields.push('updated_at = unixepoch()');
    bindings.push(id, this.gymId);

    const query = `UPDATE members SET ${fields.join(', ')} WHERE id = ? AND gym_id = ? AND deleted_at IS NULL`;
    await this.db.prepare(query).bind(...bindings).run();
  }
}
