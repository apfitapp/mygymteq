import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { AttendanceService } from '../server/services/attendance.service';

export const attendanceActions = {
  checkIn: defineAction({
    accept: 'form',
    input: z.object({
      identifier: z.string().min(1, 'Member Code or Phone number is required'),
      method: z.enum(['MANUAL', 'QR_SCAN', 'SELF_KIOSK']).default('MANUAL'),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      const gym = context.locals.gym;
      const db = context.locals.runtime?.env?.DB;

      if (!gym || !db) {
        throw new Error('Unauthorized');
      }

      const service = new AttendanceService(db, gym.id, user?.id);
      return await service.quickCheckIn(input.identifier, input.method);
    },
  }),
};
