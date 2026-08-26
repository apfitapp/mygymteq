import { authActions } from './auth';
import { memberActions } from './members';
import { membershipActions } from './memberships';
import { paymentActions } from './payments';
import { attendanceActions } from './attendance';
import { adminActions } from './admin';

export const server = {
  auth: authActions,
  members: memberActions,
  memberships: membershipActions,
  payments: paymentActions,
  attendance: attendanceActions,
  admin: adminActions,
};
