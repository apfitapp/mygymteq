import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { MemberService } from '../server/services/member.service';
import { MemberRepository } from '../server/repositories/member.repository';

export const memberActions = {
  create: defineAction({
    accept: 'form',
    input: z.object({
      firstName: z.string().min(2, 'First name is required'),
      lastName: z.string().optional(),
      phone: z.string().min(10, 'Valid 10-digit phone number is required'),
      email: z.string().email().optional().or(z.literal('')),
      gender: z.string().optional(),
      dateOfBirth: z.string().optional(),
      joinedDate: z.string().optional(),
      planId: z.string().min(1, 'Membership plan is required'),
      discountAmount: z.coerce.number().min(0).default(0),
      initialPaymentAmount: z.coerce.number().min(0).default(0),
      paymentMode: z.string().default('CASH'),
      referenceId: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const gym = context.locals.gym;
      const license = context.locals.license;
      const db = context.locals.runtime?.env?.DB;

      if (!user || !gym || !db) {
        throw new Error('Unauthorized');
      }

      const service = new MemberService(db, gym.id, user.id, gym.name);

      return await service.createMemberWithPlan({
        ...input,
        maxMembersLicenseLimit: license?.maxMembers,
      });
    },
  }),

  updateStatus: defineAction({
    accept: 'form',
    input: z.object({
      memberId: z.string().min(1),
      status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'BLOCKED']),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const gym = context.locals.gym;
      const db = context.locals.runtime?.env?.DB;

      if (!user || !gym || !db) {
        throw new Error('Unauthorized');
      }

      const repo = new MemberRepository(db, gym.id);
      await repo.update(input.memberId, { status: input.status });
      return { success: true };
    },
  }),
};
