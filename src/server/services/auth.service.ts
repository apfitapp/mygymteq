import { UserRepository } from '../repositories/user.repository';
import { hashPassword, createSessionToken } from '../../lib/auth/session';

export class AuthService {
  private userRepo: UserRepository;

  constructor(db: D1Database, private jwtSecret: string) {
    this.userRepo = new UserRepository(db);
  }

  async login(email: string, passwordPlain: string) {
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

    await this.userRepo.updateLastLogin(user.id);

    const token = await createSessionToken(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        gymId: user.gym_id,
      },
      this.jwtSecret
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gymId: user.gym_id,
      },
    };
  }
}
