export type Role = 'SUPER_ADMIN' | 'GYM_OWNER' | 'MANAGER' | 'STAFF' | 'TRAINER';

export type GymStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';

export type MemberStatus = 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'INACTIVE';

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FROZEN';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'NETBANKING' | 'OTHER';

export type CheckInMethod = 'MANUAL' | 'QR_SCAN' | 'BIOMETRIC';

export interface User {
  id: string;
  gymId: string | null;
  branchId: string | null;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  logoR2Key: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  gstin: string | null;
  status: GymStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  gymId: string;
  name: string;
  code: string;
  phone: string | null;
  address: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformPlan {
  id: string;
  name: string;
  slug: string;
  monthlyPriceInr: number; // in paise (e.g. 99900 = ₹999)
  yearlyPriceInr: number;  // in paise
  maxMembers: number;
  maxBranches: number;
  maxStaff: number;
  hasQrAttendance: boolean;
  hasReports: boolean;
  hasWhatsappAutomation: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GymSubscription {
  id: string;
  gymId: string;
  planId: string;
  status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  maxMembersOverride: number | null;
  maxBranchesOverride: number | null;
  createdAt: string;
  updatedAt: string;
  plan?: PlatformPlan;
}

export interface Member {
  id: string;
  gymId: string;
  branchId: string;
  memberCode: string;
  fullName: string;
  phone: string;
  email: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dob: string | null;
  photoR2Key: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medicalNotes: string | null;
  address: string | null;
  joiningDate: string;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  activeMembership?: MembershipSummary | null;
  branchName?: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  durationDays: number;
  priceInr: number; // in paise
  admissionFeeInr: number; // in paise
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  gymId: string;
  memberId: string;
  planId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalAmountInr: number; // in paise
  discountInr: number;    // in paise
  paidAmountInr: number;  // in paise
  status: MembershipStatus;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  planName?: string;
  memberName?: string;
}

export interface MembershipSummary {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  totalAmountInr: number;
  paidAmountInr: number;
  dueAmountInr: number;
}

export interface Payment {
  id: string;
  gymId: string;
  branchId: string;
  memberId: string;
  membershipId: string | null;
  receiptNumber: string;
  amountInr: number; // in paise
  paymentMethod: PaymentMethod;
  paymentDate: string;
  upiRefOrTxnId: string | null;
  collectedByUserId: string;
  notes: string | null;
  createdAt: string;
  memberName?: string;
  memberPhone?: string;
  memberCode?: string;
  collectedByName?: string;
}

export interface AttendanceRecord {
  id: string;
  gymId: string;
  branchId: string;
  memberId: string;
  checkInTime: string;
  checkOutTime: string | null;
  checkInMethod: CheckInMethod;
  markedByUserId: string | null;
  memberName?: string;
  memberCode?: string;
  photoR2Key?: string | null;
  branchName?: string;
  markedByName?: string;
}

export interface AuditLog {
  id: string;
  gymId: string | null;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldState: string | null;
  newState: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  userName?: string;
}

export interface DashboardSummary {
  activeMembers: number;
  totalMembers: number;
  expiringIn7Days: number;
  todayAttendance: number;
  monthlyRevenueInr: number; // in paise
  totalPendingDuesInr: number; // in paise
  recentPayments: Payment[];
  recentAttendance: AttendanceRecord[];
}

export interface PlatformMetrics {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  suspendedGyms: number;
  mrrInr: number; // in paise
  totalMembersAcrossAllGyms: number;
  expiringSubscriptionsCount: number;
}

export interface AuthSession {
  token: string;
  user: User;
  gym: Gym | null;
  branches: Branch[];
}

export interface AuthJwtPayload {
  sub: string;
  email: string;
  role: Role;
  gymId: string | null;
  branchId: string | null;
  iat?: number;
  exp?: number;
}
