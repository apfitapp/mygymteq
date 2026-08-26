import { hashPassword } from '../../lib/auth/session';

export class AdminService {
  constructor(private db: D1Database) {}

  async listGyms() {
    const { results } = await this.db
      .prepare(`
        SELECT g.*, 
               p.name as plan_name,
               s.status as subscription_status,
               s.end_date as subscription_end_date,
               l.max_members,
               (SELECT COUNT(*) FROM members WHERE gym_id = g.id AND deleted_at IS NULL) as member_count
        FROM gyms g
        LEFT JOIN subscriptions s ON s.gym_id = g.id
        LEFT JOIN plans p ON p.id = s.plan_id
        LEFT JOIN licenses l ON l.gym_id = g.id
        WHERE g.deleted_at IS NULL
        ORDER BY g.created_at DESC
      `)
      .all<any>();
    return results;
  }

  async listPlans() {
    const { results } = await this.db
      .prepare(`SELECT * FROM plans ORDER BY price_monthly ASC`)
      .all<any>();
    return results;
  }

  async createGymWithOwner(data: {
    gymName: string;
    slug: string;
    gymPhone: string;
    city?: string;
    planId: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerPasswordPlain: string;
  }) {
    const gymId = `gym_${crypto.randomUUID().slice(0, 8)}`;
    const userId = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const subId = `sub_${crypto.randomUUID().slice(0, 8)}`;
    const licId = `lic_${crypto.randomUUID().slice(0, 8)}`;

    const plan = await this.db
      .prepare(`SELECT * FROM plans WHERE id = ?`)
      .bind(data.planId)
      .first<any>();

    if (!plan) {
      throw new Error('Selected commercial plan not found');
    }

    const passwordHash = await hashPassword(data.ownerPasswordPlain);

    // 1. Create Gym
    await this.db
      .prepare(`
        INSERT INTO gyms (id, name, slug, phone, city, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', unixepoch(), unixepoch())
      `)
      .bind(gymId, data.gymName.trim(), data.slug.trim(), data.gymPhone.trim(), data.city?.trim() || null)
      .run();

    // 2. Create Owner User
    await this.db
      .prepare(`
        INSERT INTO users (id, gym_id, name, email, phone, password_hash, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'OWNER', 'ACTIVE', unixepoch(), unixepoch())
      `)
      .bind(userId, gymId, data.ownerName.trim(), data.ownerEmail.toLowerCase().trim(), data.ownerPhone.trim(), passwordHash)
      .run();

    // 3. Create Subscription (14 day trial or 1 year)
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 365 * 86400;

    await this.db
      .prepare(`
        INSERT INTO subscriptions (id, gym_id, plan_id, billing_cycle, status, amount, start_date, end_date, created_at, updated_at)
        VALUES (?, ?, ?, 'YEARLY', 'ACTIVE', ?, ?, ?, unixepoch(), unixepoch())
      `)
      .bind(subId, gymId, plan.id, plan.price_yearly, startDate, endDate)
      .run();

    // 4. Create License
    await this.db
      .prepare(`
        INSERT INTO licenses (id, gym_id, subscription_id, max_members, max_staff, status, entitlements_json, expires_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, unixepoch(), unixepoch())
      `)
      .bind(licId, gymId, subId, plan.max_members, plan.max_staff, plan.features_json || '{}', endDate)
      .run();

    // 5. Seed default starter membership plans for the new gym
    const defaultPlans = [
      { id: `mpl_${crypto.randomUUID().slice(0, 8)}`, name: 'Monthly General', duration: 1, price: 150000 },
      { id: `mpl_${crypto.randomUUID().slice(0, 8)}`, name: 'Quarterly Fitness', duration: 3, price: 400000 },
      { id: `mpl_${crypto.randomUUID().slice(0, 8)}`, name: 'Annual VIP Pass', duration: 12, price: 1200000 },
    ];

    for (const dp of defaultPlans) {
      await this.db
        .prepare(`
          INSERT INTO membership_plans (id, gym_id, name, duration_months, price, admission_fee, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, 1, unixepoch(), unixepoch())
        `)
        .bind(dp.id, gymId, dp.name, dp.duration, dp.price)
        .run();
    }

    return { gymId, userId };
  }

  async toggleGymStatus(gymId: string, status: 'ACTIVE' | 'SUSPENDED') {
    await this.db
      .prepare(`UPDATE gyms SET status = ?, updated_at = unixepoch() WHERE id = ?`)
      .bind(status, gymId)
      .run();
  }
}
