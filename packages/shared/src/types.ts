import {
  UserRole,
  GymStatus,
  MemberStatus,
  MembershipStatus,
  PaymentMode,
  AttendanceMethod,
} from './constants';

export interface User {
  id: string;
  gym_id: string | null;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  last_login_at?: number | null;
  created_at: number;
  updated_at: number;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gst_number?: string | null;
  currency: string;
  logo_url?: string | null;
  status: GymStatus;
  created_at: number;
  updated_at: number;
}

export interface CommercialPlan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  price_monthly: number;
  price_yearly: number;
  max_members: number;
  max_staff: number;
  features_json: string;
  is_active: number;
}

export interface Subscription {
  id: string;
  gym_id: string;
  plan_id: string;
  billing_cycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  amount: number;
  start_date: number;
  end_date: number;
}

export interface License {
  id: string;
  gym_id: string;
  subscription_id: string;
  max_members: number;
  max_staff: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  entitlements_json: string;
  expires_at: number;
}

export interface GymMembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  description?: string | null;
  duration_months: number;
  price: number;
  admission_fee: number;
  tax_percentage?: number;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface Member {
  id: string;
  gym_id: string;
  member_code: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  photo_url?: string | null;
  address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  health_notes?: string | null;
  status: MemberStatus;
  joined_date: number;
  created_at: number;
  updated_at: number;
}

export interface Membership {
  id: string;
  gym_id: string;
  member_id: string;
  membership_plan_id: string;
  start_date: number;
  end_date: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  due_amount: number;
  status: MembershipStatus;
  notes?: string | null;
  created_at: number;
  updated_at: number;
  // Joined fields
  plan_name?: string;
  duration_months?: number;
}

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string;
  membership_id?: string | null;
  receipt_number: string;
  amount: number;
  payment_date: number;
  payment_mode: PaymentMode;
  reference_id?: string | null;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  recorded_by_user_id: string;
  notes?: string | null;
  created_at: number;
  // Joined fields
  first_name?: string;
  last_name?: string | null;
  phone?: string;
  member_code?: string;
  recorded_by_name?: string | null;
}

export interface Attendance {
  id: string;
  gym_id: string;
  member_id: string;
  check_in_time: number;
  date_key: string;
  method: AttendanceMethod;
  recorded_by_user_id?: string | null;
  created_at: number;
  // Joined fields
  first_name?: string;
  last_name?: string | null;
  member_code?: string;
  phone?: string;
  membership_status?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  gymId: string | null;
}

export interface ExpiringMember {
  id: string;
  first_name: string;
  last_name?: string | null;
  phone: string;
  plan_name: string;
  end_date: number;
  due_amount: number;
  whatsapp_url?: string;
}

export interface DashboardMetrics {
  activeMembers: number;
  todayAttendance: number;
  monthlyRevenue: number;
  pendingDues: number;
  expiringSoon: ExpiringMember[];
  recentPayments: Payment[];
}
