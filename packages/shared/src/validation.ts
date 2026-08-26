import { z } from 'zod';

// Auth Validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Platform Super Admin Validation
export const CreatePlatformPlanSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  slug: z.string().min(2),
  monthlyPriceInr: z.number().int().nonnegative(),
  yearlyPriceInr: z.number().int().nonnegative(),
  maxMembers: z.number().int().positive().default(150),
  maxBranches: z.number().int().positive().default(1),
  maxStaff: z.number().int().positive().default(3),
  hasQrAttendance: z.boolean().default(true),
  hasReports: z.boolean().default(false),
  hasWhatsappAutomation: z.boolean().default(false),
});
export type CreatePlatformPlanInput = z.infer<typeof CreatePlatformPlanSchema>;

export const CreateGymTenantSchema = z.object({
  name: z.string().min(2, 'Gym name is required'),
  slug: z.string().min(2, 'Subdomain slug is required').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2).default('Telangana'),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
  planId: z.string().min(1, 'Plan selection is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  ownerEmail: z.string().email('Valid owner email is required'),
  ownerPhone: z.string().min(10, 'Valid owner phone is required'),
  ownerPassword: z.string().min(6, 'Owner password must be at least 6 characters'),
});
export type CreateGymTenantInput = z.infer<typeof CreateGymTenantSchema>;

export const UpdateGymStatusSchema = z.object({
  status: z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED']),
});
export type UpdateGymStatusInput = z.infer<typeof UpdateGymStatusSchema>;

export const UpdateGymSubscriptionSchema = z.object({
  planId: z.string().min(1),
  status: z.enum(['TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED']),
  currentPeriodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  maxMembersOverride: z.number().int().positive().nullable().optional(),
  maxBranchesOverride: z.number().int().positive().nullable().optional(),
});
export type UpdateGymSubscriptionInput = z.infer<typeof UpdateGymSubscriptionSchema>;

// Gym & Branch Settings
export const UpdateGymSettingsSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
});
export type UpdateGymSettingsInput = z.infer<typeof UpdateGymSettingsSchema>;

export const CreateBranchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  code: z.string().min(2, 'Branch code is required').regex(/^[A-Z0-9-]+$/, 'Uppercase code e.g. MAIN-01'),
  phone: z.string().optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().default(false),
});
export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;

export const CreateStaffUserSchema = z.object({
  branchId: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10),
  fullName: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['MANAGER', 'STAFF', 'TRAINER']),
});
export type CreateStaffUserInput = z.infer<typeof CreateStaffUserSchema>;

// Member Validation
export const CreateMemberSchema = z.object({
  branchId: z.string().min(1, 'Branch is required'),
  memberCode: z.string().optional(), // Auto-generated if omitted
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, '10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
  address: z.string().optional(),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').default(() => new Date().toISOString().split('T')[0]),
  // Optional immediate membership assignment
  initialPlanId: z.string().optional(),
  initialPaidAmountInr: z.number().int().nonnegative().optional(),
  initialPaymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).optional(),
  initialUpiRef: z.string().optional(),
});
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;

export const UpdateMemberSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'FROZEN', 'INACTIVE']).optional(),
});
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;

// Membership Plan Validation
export const CreateMembershipPlanSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  durationMonths: z.number().int().min(0),
  durationDays: z.number().int().min(0).default(0),
  priceInr: z.number().int().nonnegative('Price cannot be negative'), // in paise
  admissionFeeInr: z.number().int().nonnegative().default(0),
  description: z.string().optional(),
});
export type CreateMembershipPlanInput = z.infer<typeof CreateMembershipPlanSchema>;

export const AssignMembershipSchema = z.object({
  memberId: z.string().min(1),
  planId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalAmountInr: z.number().int().positive(), // Agreed total in paise
  discountInr: z.number().int().nonnegative().default(0),
  paidAmountInr: z.number().int().nonnegative().default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).default('UPI'),
  upiRef: z.string().optional(),
  notes: z.string().optional(),
});
export type AssignMembershipInput = z.infer<typeof AssignMembershipSchema>;

export const RenewMembershipSchema = z.object({
  planId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalAmountInr: z.number().int().positive(),
  discountInr: z.number().int().nonnegative().default(0),
  paidAmountInr: z.number().int().nonnegative().default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).default('UPI'),
  upiRef: z.string().optional(),
  notes: z.string().optional(),
});
export type RenewMembershipInput = z.infer<typeof RenewMembershipSchema>;

// Payment Validation
export const RecordPaymentSchema = z.object({
  memberId: z.string().min(1),
  membershipId: z.string().optional(),
  amountInr: z.number().int().positive('Payment amount must be greater than 0'), // in paise
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().split('T')[0]),
  upiRefOrTxnId: z.string().optional(),
  notes: z.string().optional(),
});
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

// Attendance Validation
export const CheckInMemberSchema = z.object({
  memberId: z.string().min(1),
  branchId: z.string().min(1),
  checkInMethod: z.enum(['MANUAL', 'QR_SCAN', 'BIOMETRIC']).default('MANUAL'),
});
export type CheckInMemberInput = z.infer<typeof CheckInMemberSchema>;
