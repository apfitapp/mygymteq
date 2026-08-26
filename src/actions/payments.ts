import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { PaymentService } from '../server/services/payment.service';

export const paymentActions = {
  recordDuePayment: defineAction({
    accept: 'form',
    input: z.object({
      memberId: z.string().min(1),
      membershipId: z.string().min(1),
      amount: z.coerce.number().min(1, 'Amount must be greater than zero'),
      paymentMode: z.string().default('UPI'),
      referenceId: z.string().optional(),
      notes: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const gym = context.locals.gym;
      const db = context.locals.runtime?.env?.DB;

      if (!user || !gym || !db) {
        throw new Error('Unauthorized');
      }

      const service = new PaymentService(db, gym.id, user.id, gym.name);
      return await service.recordDuePayment(input);
    },
  }),
};
