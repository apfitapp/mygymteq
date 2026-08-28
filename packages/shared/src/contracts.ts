import { z } from 'zod';
import {
  User,
  Gym,
  Member,
  Membership,
  Payment,
  Attendance,
  GymMembershipPlan,
  CommercialPlan,
  SessionUser,
  DashboardMetrics,
} from './types';

// ==========================================
// 1. AUTH CONTRACTS
// ==========================================

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  turnstileToken: z.string().optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export interface LoginResponse {
  token: string;
  user: SessionUser;
  gym?: Gym | null;
}

export const MemberLoginRequestSchema = z.object({
  identifier: z.string().min(3, 'Phone number or member code is required'),
  codeOrPin: z.string().min(1, 'Member code or verification credential is required'),
  turnstileToken: z.string().optional(),
});
export type MemberLoginRequest = z.infer<typeof MemberLoginRequestSchema>;

export interface MemberLoginResponse {
  token: string;
  member: Member;
  activeMembership?: Membership | null;
  gym?: Gym | null;
}

export interface MeResponse {
  user: SessionUser;
  gym?: Gym | null;
}

// ==========================================
// 2. MEMBER CONTRACTS
// ==========================================

export const CreateMemberRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  joinedDate: z.string().optional(),
  photoUrl: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  planId: z.string().min(1, 'Plan selection is required'),
  discountAmount: z.number().min(0).default(0),
  initialPaymentAmount: z.number().min(0).default(0),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).default('UPI'),
  referenceId: z.string().optional(),
});
export type CreateMemberRequest = z.infer<typeof CreateMemberRequestSchema>;

export interface CreateMemberResponse {
  member: Member;
  membership: Membership;
  payment?: Payment | null;
  receiptNumber?: string;
  whatsappUrl?: string;
}

export const UpdateMemberRequestSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  photoUrl: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  healthNotes: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'FROZEN', 'CANCELLED']).optional(),
});
export type UpdateMemberRequest = z.infer<typeof UpdateMemberRequestSchema>;

export interface MemberDetailResponse {
  member: Member;
  activeMembership?: Membership | null;
  memberships: Membership[];
  payments: Payment[];
  attendance: Attendance[];
}

// ==========================================
// 3. MEMBERSHIP & PLAN CONTRACTS
// ==========================================

export const RenewMembershipRequestSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  startDate: z.string().optional(),
  discountAmount: z.number().min(0).default(0),
  paymentAmount: z.number().min(0).default(0),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).default('UPI'),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});
export type RenewMembershipRequest = z.infer<typeof RenewMembershipRequestSchema>;

export interface RenewMembershipResponse {
  membershipId: string;
  receiptNumber?: string;
  whatsappUrl?: string;
}

export const CreatePlanRequestSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  durationMonths: z.number().min(1, 'Duration in months is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  admissionFee: z.number().min(0).default(0),
});
export type CreatePlanRequest = z.infer<typeof CreatePlanRequestSchema>;

// ==========================================
// 4. PAYMENT CONTRACTS
// ==========================================

export const RecordPaymentRequestSchema = z.object({
  memberId: z.string().min(1),
  membershipId: z.string().optional(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentDate: z.string().optional(),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).default('CASH'),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});
export type RecordPaymentRequest = z.infer<typeof RecordPaymentRequestSchema>;

export interface RecordPaymentResponse {
  paymentId?: string;
  payment?: Payment;
  receiptNumber: string;
  whatsappUrl?: string;
}

// ==========================================
// 5. ATTENDANCE CONTRACTS
// ==========================================

export const CheckInRequestSchema = z.object({
  memberIdOrCode: z.string().min(1, 'Member ID or code is required'),
  method: z.enum(['MANUAL', 'QR_SCAN']).default('MANUAL'),
});
export type CheckInRequest = z.infer<typeof CheckInRequestSchema>;

export interface CheckInResponse {
  success?: boolean;
  alreadyCheckedIn?: boolean;
  attendance?: Attendance;
  member: {
    id: string;
    name: string;
    memberCode: string;
    phone?: string;
    status?: string;
    membershipStatus?: string;
    planName?: string;
    daysRemaining?: number;
  };
}

// ==========================================
// 6. STAFF CONTRACTS
// ==========================================

export const CreateStaffRequestSchema = z.object({
  name: z.string().min(1, 'Staff name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MANAGER', 'STAFF', 'TRAINER']),
});
export type CreateStaffRequest = z.infer<typeof CreateStaffRequestSchema>;

// ==========================================
// 7. SUPER ADMIN CONTRACTS
// ==========================================

export const CreateGymRequestSchema = z.object({
  gymName: z.string().min(1, 'Gym name is required'),
  slug: z.string().min(1, 'Slug is required'),
  city: z.string().optional(),
  gymPhone: z.string().min(10, 'Valid phone required'),
  planId: z.string().min(1, 'Plan selection is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerEmail: z.string().email('Valid email required'),
  ownerPhone: z.string().min(10, 'Valid phone required'),
  ownerPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
export type CreateGymRequest = z.infer<typeof CreateGymRequestSchema>;

export const ToggleGymStatusRequestSchema = z.object({
  gymId: z.string().min(1),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});
export type ToggleGymStatusRequest = z.infer<typeof ToggleGymStatusRequestSchema>;

// ==========================================
// 8. BULK EXCEL MIGRATION CONTRACTS
// ==========================================

export const BulkImportMemberRowSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional().default(''),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  email: z.string().email().optional().or(z.literal('')).default(''),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().default('MALE'),
  planName: z.string().optional().default(''),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paidAmount: z.number().min(0).optional().default(0),
  dueAmount: z.number().min(0).optional().default(0),
});
export type BulkImportMemberRow = z.infer<typeof BulkImportMemberRowSchema>;

export const BulkImportMembersRequestSchema = z.object({
  members: z.array(BulkImportMemberRowSchema).min(1, 'At least one member record is required'),
  defaultPlanId: z.string().optional(),
});
export type BulkImportMembersRequest = z.infer<typeof BulkImportMembersRequestSchema>;

export interface BulkImportMembersResponse {
  success: boolean;
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

// ==========================================
// 9. FORGOT & RESET PASSWORD CONTRACTS
// ==========================================

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  devResetUrl?: string;
}

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ==========================================
// 10. FREEZE / PAUSE MEMBERSHIP CONTRACTS
// ==========================================

export const FreezeMemberRequestSchema = z.object({
  reason: z.string().max(200).optional(),
});
export type FreezeMemberRequest = z.infer<typeof FreezeMemberRequestSchema>;

export interface FreezeMemberResponse {
  success: boolean;
  status: 'FROZEN' | 'ACTIVE';
  membershipId?: string | null;
  extendedTo?: number | null;
  message: string;
}

// ==========================================
// 11. PT COLLECTION CONTRACTS
// ==========================================

export const RecordPtCollectionRequestSchema = z.object({
  memberId: z.string().min(1, 'Member selection is required'),
  trainerId: z.string().min(1, 'Trainer selection is required'),
  sessions: z.number().int().min(0).default(0),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  commissionPercentage: z.number().min(0).max(100).default(0),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER']).default('CASH'),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
});
export type RecordPtCollectionRequest = z.infer<typeof RecordPtCollectionRequestSchema>;

export interface RecordPtCollectionResponse {
  id: string;
  commissionAmount: number;
}

export const SettlePtCommissionRequestSchema = z.object({
  status: z.enum(['PAID', 'PENDING']),
});
export type SettlePtCommissionRequest = z.infer<typeof SettlePtCommissionRequestSchema>;
