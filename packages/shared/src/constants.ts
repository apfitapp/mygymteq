export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  TRAINER: 'TRAINER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const GYM_STATUSES = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
} as const;

export type GymStatus = (typeof GYM_STATUSES)[keyof typeof GYM_STATUSES];

export const MEMBER_STATUSES = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  FROZEN: 'FROZEN',
  CANCELLED: 'CANCELLED',
} as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[keyof typeof MEMBER_STATUSES];

export const MEMBERSHIP_STATUSES = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
} as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[keyof typeof MEMBERSHIP_STATUSES];

export const PAYMENT_MODES = {
  CASH: 'CASH',
  UPI: 'UPI',
  CARD: 'CARD',
  NETBANKING: 'NETBANKING',
  OTHER: 'OTHER',
} as const;

export type PaymentMode = (typeof PAYMENT_MODES)[keyof typeof PAYMENT_MODES];

export const ATTENDANCE_METHODS = {
  MANUAL: 'MANUAL',
  QR_SCAN: 'QR_SCAN',
} as const;

export type AttendanceMethod = (typeof ATTENDANCE_METHODS)[keyof typeof ATTENDANCE_METHODS];
