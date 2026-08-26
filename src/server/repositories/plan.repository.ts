export interface MembershipPlanRow {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  duration_months: number;
  price: number;
  admission_fee: number;
  tax_percentage: number;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export class PlanRepository {
  constructor(private db: D1Database, private gymId: string) {}

  async listActive() {
    const { results } = await this.db
      .prepare(`SELECT * FROM membership_plans WHERE gym_id = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY duration_months ASC`)
      .bind(this.gymId)
      .all<MembershipPlanRow>();
    return results;
  }

  async listAll() {
    const { results } = await this.db
      .prepare(`SELECT * FROM membership_plans WHERE gym_id = ? AND deleted_at IS NULL ORDER BY is_active DESC, duration_months ASC`)
      .bind(this.gymId)
      .all<MembershipPlanRow>();
    return results;
  }

  async findById(id: string) {
    return await this.db
      .prepare(`SELECT * FROM membership_plans WHERE id = ? AND gym_id = ? AND deleted_at IS NULL`)
      .bind(id, this.gymId)
      .first<MembershipPlanRow>();
  }

  async create(data: {
    id: string;
    name: string;
    description?: string;
    duration_months: number;
    price: number;
    admission_fee?: number;
    tax_percentage?: number;
  }) {
    await this.db
      .prepare(`
        INSERT INTO membership_plans (
          id, gym_id, name, description, duration_months, price,
          admission_fee, tax_percentage, is_active, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, 1, unixepoch(), unixepoch()
        )
      `)
      .bind(
        data.id,
        this.gymId,
        data.name,
        data.description || null,
        data.duration_months,
        data.price,
        data.admission_fee || 0,
        data.tax_percentage || 0
      )
      .run();
  }

  async update(id: string, data: Partial<MembershipPlanRow>) {
    const fields: string[] = [];
    const bindings: any[] = [];

    const allowedKeys: (keyof MembershipPlanRow)[] = [
      'name',
      'description',
      'duration_months',
      'price',
      'admission_fee',
      'tax_percentage',
      'is_active',
    ];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        bindings.push(data[key]);
      }
    }

    if (fields.length === 0) return;

    fields.push('updated_at = unixepoch()');
    bindings.push(id, this.gymId);

    const query = `UPDATE membership_plans SET ${fields.join(', ')} WHERE id = ? AND gym_id = ?`;
    await this.db.prepare(query).bind(...bindings).run();
  }
}
