import { Member, MemberStatus } from '@gymtech/shared';

export interface MemberListItem extends Member {
  active_membership_id?: string | null;
  membership_status?: string | null;
  membership_start_date?: number | null;
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
             ms.start_date as membership_start_date,
             ms.end_date as membership_end_date,
             ms.due_amount as membership_due_amount,
             mp.name as plan_name
      FROM members m
      LEFT JOIN memberships ms ON ms.member_id = m.id AND ms.id = (
        SELECT id FROM memberships WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1
      )
      LEFT JOIN membership_plans mp ON mp.id = ms.membership_plan_id
      WHERE m.gym_id = ? AND m.deleted_at IS NULL
    `;
    const bindings: any[] = [this.gymId];

    if (params.status && params.status !== 'ALL') {
      if (params.status === 'EXPIRED') {
        query += ` AND (m.status = 'EXPIRED' OR (ms.end_date IS NOT NULL AND ms.end_date < unixepoch()))`;
      } else if (params.status === 'ACTIVE') {
        query += ` AND m.status = 'ACTIVE' AND (ms.end_date IS NULL OR ms.end_date >= unixepoch())`;
      } else {
        query += ` AND m.status = ?`;
        bindings.push(params.status);
      }
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

  async update(id: string, data: any): Promise<void> {
    const fields: string[] = [];
    const bindings: any[] = [];

    const fieldMap: Record<string, string> = {
      first_name: 'first_name',
      firstName: 'first_name',
      last_name: 'last_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      gender: 'gender',
      date_of_birth: 'date_of_birth',
      dateOfBirth: 'date_of_birth',
      photo_url: 'photo_url',
      photoUrl: 'photo_url',
      address: 'address',
      emergency_contact_name: 'emergency_contact_name',
      emergencyContactName: 'emergency_contact_name',
      emergency_contact_phone: 'emergency_contact_phone',
      emergencyContactPhone: 'emergency_contact_phone',
      health_notes: 'health_notes',
      healthNotes: 'health_notes',
      status: 'status',
    };

    const processedColumns = new Set<string>();

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && !processedColumns.has(col)) {
        processedColumns.add(col);
        fields.push(`${col} = ?`);
        bindings.push(data[key]);
      }
    }

    if (fields.length === 0) return;

    fields.push('updated_at = unixepoch()');
    bindings.push(id, this.gymId);

    const query = `UPDATE members SET ${fields.join(', ')} WHERE id = ? AND gym_id = ? AND deleted_at IS NULL`;
    await this.db.prepare(query).bind(...bindings).run();
  }

  async bulkCreateMembers(
    rows: any[],
    recordedByUserId: string,
    defaultPlanId?: string
  ): Promise<{ importedCount: number; skippedCount: number; errors: string[] }> {
    const plansRes = await this.db
      .prepare(`SELECT * FROM membership_plans WHERE gym_id = ? AND is_active = 1`)
      .bind(this.gymId)
      .all();
    const plans: any[] = plansRes.results || [];
    const fallbackPlan = defaultPlanId ? plans.find((p) => p.id === defaultPlanId) || plans[0] : plans[0];

    const currentCodeCountRes = await this.db
      .prepare(`SELECT COUNT(*) as total FROM members WHERE gym_id = ?`)
      .bind(this.gymId)
      .first<{ total: number }>();
    let memberCodeCounter = (currentCodeCountRes?.total || 0) + 1;

    const license = await this.db
      .prepare('SELECT max_members FROM licenses WHERE gym_id = ? AND status = "ACTIVE"')
      .bind(this.gymId)
      .first<{ max_members: number }>();
    let currentActive = await this.countActive();

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const statements: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (license && license.max_members > 0 && (currentActive + importedCount) >= license.max_members) {
        skippedCount += (rows.length - i);
        errors.push(`Commercial license capacity reached (maximum ${license.max_members} active members). Remaining ${rows.length - i} rows were not imported. Please upgrade your plan.`);
        break;
      }

      const row = rows[i];
      const cleanPhone = String(row.phone || '').trim().replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length < 10) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${row.firstName || 'Unknown'}): Invalid 10-digit phone number`);
        continue;
      }

      // Check for existing phone in current gym
      const existing = await this.findByIdentifier(cleanPhone);
      if (existing) {
        skippedCount++;
        errors.push(`Row ${i + 1} (${row.firstName}): Member with phone ${cleanPhone} already enrolled`);
        continue;
      }

      const memberId = `mem_${crypto.randomUUID().slice(0, 8)}`;
      const memberCode = `MEM-${1000 + memberCodeCounter++}`;
      const joinedTimestamp = row.startDate
        ? Math.floor(new Date(row.startDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      // Match Plan by name or use fallback
      let plan = fallbackPlan;
      if (row.planName) {
        const found = plans.find(
          (p) => p.name.toLowerCase().includes(String(row.planName).toLowerCase().trim())
        );
        if (found) plan = found;
      }

      const durationMonths = plan?.duration_months || 1;
      const startTimestamp = joinedTimestamp;
      const endTimestamp = row.endDate
        ? Math.floor(new Date(row.endDate).getTime() / 1000)
        : startTimestamp + durationMonths * 30 * 86400;

      const totalAmount = plan ? plan.price + plan.admission_fee : 150000;
      const paidPaise = Math.round((Number(row.paidAmount) || 0) * 100);
      const duePaise = row.dueAmount !== undefined && Number(row.dueAmount) > 0
        ? Math.round(Number(row.dueAmount) * 100)
        : Math.max(0, totalAmount - paidPaise);

      // 1. Member Insert Statement
      statements.push(
        this.db.prepare(`
          INSERT INTO members (
            id, gym_id, member_code, first_name, last_name, email, phone, 
            gender, status, joined_date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, unixepoch(), unixepoch())
        `).bind(
          memberId,
          this.gymId,
          memberCode,
          String(row.firstName).trim(),
          row.lastName ? String(row.lastName).trim() : null,
          row.email ? String(row.email).trim() : null,
          cleanPhone,
          row.gender || 'MALE',
          joinedTimestamp
        )
      );

      // 2. Membership Insert Statement
      if (plan) {
        const membershipId = `ms_${crypto.randomUUID().slice(0, 8)}`;
        statements.push(
          this.db.prepare(`
            INSERT INTO memberships (
              id, gym_id, member_id, membership_plan_id, start_date, end_date,
              total_amount, discount_amount, final_amount, paid_amount, due_amount,
              status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'ACTIVE', unixepoch(), unixepoch())
          `).bind(
            membershipId,
            this.gymId,
            memberId,
            plan.id,
            startTimestamp,
            endTimestamp,
            totalAmount,
            totalAmount,
            paidPaise,
            duePaise
          )
        );

        // 3. Initial payment if paidAmount > 0
        if (paidPaise > 0) {
          const paymentId = `pay_${crypto.randomUUID().slice(0, 8)}`;
          const receiptNumber = `RCP-MIG-${memberCodeCounter}-${Date.now().toString().slice(-4)}`;
          statements.push(
            this.db.prepare(`
              INSERT INTO payments (
                id, gym_id, member_id, membership_id, receipt_number, amount,
                payment_date, payment_mode, reference_id, status, recorded_by_user_id,
                notes, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OTHER', 'MIGRATION', 'COMPLETED', ?, 'Imported via Excel Migration', unixepoch(), unixepoch())
            `).bind(
              paymentId,
              this.gymId,
              memberId,
              membershipId,
              receiptNumber,
              paidPaise,
              joinedTimestamp,
              recordedByUserId
            )
          );
        }
      }

      importedCount++;
    }

    if (statements.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < statements.length; i += chunkSize) {
        const chunk = statements.slice(i, i + chunkSize);
        await this.db.batch(chunk);
      }
    }

    return { importedCount, skippedCount, errors };
  }
}
