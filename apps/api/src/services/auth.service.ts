import { UserRepository } from '../repositories/user.repository';
import { hashPassword, createSessionToken, verifySessionToken } from '../lib/session';
import { SessionUser, Gym } from '@gymtech/shared';

export class AuthService {
  private userRepo: UserRepository;

  constructor(private db: D1Database, private jwtSecret: string) {
    this.userRepo = new UserRepository(db);
  }

  async login(email: string, passwordPlain: string): Promise<{ token: string; user: SessionUser; gym?: Gym | null }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('This account has been deactivated or suspended');
    }

    const hashed = await hashPassword(passwordPlain);
    if (hashed !== user.password_hash) {
      throw new Error('Invalid email or password');
    }

    let gym: Gym | null = null;
    if (user.gym_id) {
      gym = await this.db
        .prepare(`SELECT * FROM gyms WHERE id = ? AND deleted_at IS NULL`)
        .bind(user.gym_id)
        .first<Gym>();

      if (gym && gym.status === 'SUSPENDED') {
        throw new Error('This gym account has been suspended by the platform administrator');
      }
    }

    await this.userRepo.updateLastLogin(user.id);

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      gymId: user.gym_id,
    };

    const token = await createSessionToken(sessionUser, this.jwtSecret);

    return {
      token,
      user: sessionUser,
      gym,
    };
  }

  async getCurrentUser(user: SessionUser): Promise<{ user: SessionUser; gym?: Gym | null }> {
    let gym: Gym | null = null;
    if (user.gymId) {
      gym = await this.db
        .prepare(`SELECT * FROM gyms WHERE id = ? AND deleted_at IS NULL`)
        .bind(user.gymId)
        .first<Gym>();
    }

    return {
      user,
      gym,
    };
  }

  async signMemberToken(member: { id: string; gymId: string; memberCode: string; phone: string; name: string }): Promise<string> {
    const sessionUser: SessionUser = {
      id: member.id,
      email: `${member.memberCode.toLowerCase()}@member.gymtech.app`,
      name: member.name,
      role: 'MEMBER',
      gymId: member.gymId,
    };
    return await createSessionToken(sessionUser, this.jwtSecret);
  }

  async verifyToken(token: string) {
    const payload = await verifySessionToken(token, this.jwtSecret);
    if (!payload) return null;
    return {
      userId: payload.id,
      email: payload.email,
      role: payload.role,
      gymId: payload.gymId,
    };
  }
}
