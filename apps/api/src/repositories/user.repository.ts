import { User, UserRole } from '@gymtech/shared';

export interface UserRow {
  id: string;
  gym_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  last_login_at: number | null;
  created_at: number;
  updated_at: number;
}

export class UserRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    return await this.db
      .prepare(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`)
      .bind(email.toLowerCase().trim())
      .first<UserRow>();
  }

  async findById(id: string): Promise<UserRow | null> {
    return await this.db
      .prepare(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`)
      .bind(id)
      .first<UserRow>();
  }

  async listGymStaff(gymId: string): Promise<Omit<UserRow, 'password_hash'>[]> {
    const { results } = await this.db
      .prepare(`
        SELECT id, gym_id, name, email, phone, role, status, last_login_at, created_at, updated_at
        FROM users 
        WHERE gym_id = ? AND deleted_at IS NULL
        ORDER BY created_at ASC
      `)
      .bind(gymId)
      .all<any>();
    return results;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db
      .prepare(`UPDATE users SET last_login_at = unixepoch() WHERE id = ?`)
      .bind(id)
      .run();
  }

  async create(data: {
    id: string;
    gym_id: string | null;
    name: string;
    email: string;
    phone?: string;
    password_hash: string;
    role: UserRole;
  }): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO users (id, gym_id, name, email, phone, password_hash, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', unixepoch(), unixepoch())
      `)
      .bind(
        data.id,
        data.gym_id,
        data.name,
        data.email.toLowerCase().trim(),
        data.phone || null,
        data.password_hash,
        data.role
      )
      .run();
  }
}
