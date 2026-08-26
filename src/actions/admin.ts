import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { AdminService } from '../server/services/admin.service';

export const adminActions = {
  createGym: defineAction({
    accept: 'form',
    input: z.object({
      gymName: z.string().min(2),
      slug: z.string().min(2),
      gymPhone: z.string().min(10),
      city: z.string().optional(),
      planId: z.string().min(1),
      ownerName: z.string().min(2),
      ownerEmail: z.string().email(),
      ownerPhone: z.string().min(10),
      ownerPassword: z.string().min(6),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const db = context.locals.runtime?.env?.DB;

      if (!user || user.role !== 'SUPER_ADMIN' || !db) {
        throw new Error('Forbidden: Platform Super Admin privileges required');
      }

      const service = new AdminService(db);
      return await service.createGymWithOwner({
        gymName: input.gymName,
        slug: input.slug,
        gymPhone: input.gymPhone,
        city: input.city,
        planId: input.planId,
        ownerName: input.ownerName,
        ownerEmail: input.ownerEmail,
        ownerPhone: input.ownerPhone,
        ownerPasswordPlain: input.ownerPassword,
      });
    },
  }),

  toggleStatus: defineAction({
    accept: 'form',
    input: z.object({
      gymId: z.string().min(1),
      status: z.enum(['ACTIVE', 'SUSPENDED']),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const db = context.locals.runtime?.env?.DB;

      if (!user || user.role !== 'SUPER_ADMIN' || !db) {
        throw new Error('Forbidden');
      }

      const service = new AdminService(db);
      await service.toggleGymStatus(input.gymId, input.status);
      return { success: true };
    },
  }),
};
