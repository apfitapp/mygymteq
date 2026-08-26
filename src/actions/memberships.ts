import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { MemberService } from '../server/services/member.service';
import { PlanRepository } from '../server/repositories/plan.repository';

export const membershipActions = {
  renew: defineAction({
    accept: 'form',
    input: z.object({
      memberId: z.string().min(1),
      planId: z.string().min(1),
      startDate: z.string().optional(),
      discountAmount: z.coerce.number().min(0).default(0),
      paymentAmount: z.coerce.number().min(0).default(0),
      paymentMode: z.string().default('CASH'),
      referenceId: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const gym = context.locals.gym;
      const db = context.locals.runtime?.env?.DB;

      if (!user || !gym || !db) {
        throw new Error('Unauthorized');
      }

      const service = new MemberService(db, gym.id, user.id, gym.name);
      return await service.renewMembership(input);
    },
  }),

  createPlan: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      durationMonths: z.coerce.number().min(1),
      price: z.coerce.number().min(0), // in Rupees
      admissionFee: z.coerce.number().min(0).default(0), // in Rupees
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const gym = context.locals.gym;
      const db = context.locals.runtime?.env?.DB;

      if (!user || !gym || !db) {
        throw new Error('Unauthorized');
      }

      const planRepo = new PlanRepository(db, gym.id);
      const planId = `mpl_${crypto.randomUUID().slice(0, 8)}`;

      await planRepo.create({
        id: planId,
        name: input.name.trim(),
        description: input.description?.trim(),
        duration_months: input.durationMonths,
        price: input.price * 100, // convert to Paise
        admission_fee: input.admissionFee * 100,
      });

      return { success: true, planId };
    },
  }),
};
