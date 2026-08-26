import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { AuthService } from '../server/services/auth.service';

export const authActions = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
    handler: async (input, context) => {
      const db = context.locals.runtime?.env?.DB;
      if (!db) throw new Error('Database connection unavailable');

      const secret = context.locals.runtime?.env?.JWT_SECRET || 'gym-saas-jwt-super-secret-production-key-2026';
      const authService = new AuthService(db, secret);

      const result = await authService.login(input.email, input.password);

      context.cookies.set('gym_session', result.token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 86400 * 7,
      });

      return {
        success: true,
        user: result.user,
        redirectUrl: result.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard',
      };
    },
  }),

  logout: defineAction({
    accept: 'form',
    input: z.object({}),
    handler: async (_input, context) => {
      context.cookies.delete('gym_session', { path: '/' });
      return { success: true, redirectUrl: '/login' };
    },
  }),
};
