import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. SaaS Platform Subscription Plans
export const platformPlans = sqliteTable('platform_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  monthlyPriceInr: integer('monthly_price_inr').notNull(),
  yearlyPriceInr: integer('yearly_price_inr').notNull(),
  maxMembers: integer('max_members').notNull().default(150),
  maxBranches: integer('max_branches').notNull().default(1),
  maxStaff: integer('max_staff').notNull().default(3),
  hasQrAttendance: integer('has_qr_attendance', { mode: 'boolean' }).notNull().default(true),
  hasReports: integer('has_reports', { mode: 'boolean' }).notNull().default(false),
  hasWhatsappAutomation: integer('has_whatsapp_automation', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// 2. Gym Tenants
export const gyms = sqliteTable('gyms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  customDomain: text('custom_domain').unique(),
  logoR2Key: text('logo_r2_key'),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  city: text('city').notNull(),
  state: text('state').notNull().default('Telangana'),
  pincode: text('pincode'),
  gstin: text('gstin'),
  status: text('status', { enum: ['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED'] }).notNull().default('TRIAL'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
}, (table) => [
  index('idx_gyms_slug').on(table.slug),
  index('idx_gyms_status').on(table.status),
]);

// 3. Gym Subscriptions
export const gymSubscriptions = sqliteTable('gym_subscriptions', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => platformPlans.id),
  status: text('status', { enum: ['TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED'] }).notNull().default('TRIAL'),
  trialEndsAt: text('trial_ends_at'),
  currentPeriodStart: text('current_period_start').notNull(),
  currentPeriodEnd: text('current_period_end').notNull(),
  maxMembersOverride: integer('max_members_override'),
  maxBranchesOverride: integer('max_branches_override'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_gym_subscriptions_gym').on(table.gymId),
]);

// 4. Branches
export const branches = sqliteTable('branches', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  phone: text('phone'),
  address: text('address'),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
}, (table) => [
  index('idx_branches_gym').on(table.gymId),
  unique('uq_branches_gym_code').on(table.gymId, table.code),
]);

// 5. Users & Identity
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: text('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['SUPER_ADMIN', 'GYM_OWNER', 'MANAGER', 'STAFF', 'TRAINER'] }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
}, (table) => [
  index('idx_users_gym_role').on(table.gymId, table.role),
  index('idx_users_phone').on(table.phone),
]);

// 6. Members
export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: text('branch_id').notNull().references(() => branches.id),
  memberCode: text('member_code').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  gender: text('gender', { enum: ['MALE', 'FEMALE', 'OTHER'] }),
  dob: text('dob'),
  photoR2Key: text('photo_r2_key'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  medicalNotes: text('medical_notes'),
  address: text('address'),
  joiningDate: text('joining_date').notNull(),
  status: text('status', { enum: ['ACTIVE', 'EXPIRED', 'FROZEN', 'INACTIVE'] }).notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
}, (table) => [
  index('idx_members_gym_status').on(table.gymId, table.status),
  index('idx_members_gym_phone').on(table.gymId, table.phone),
  index('idx_members_branch').on(table.branchId),
  unique('uq_members_gym_code').on(table.gymId, table.memberCode),
]);

// 7. Membership Plans
export const membershipPlans = sqliteTable('membership_plans', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  durationMonths: integer('duration_months').notNull(),
  durationDays: integer('duration_days').notNull().default(0),
  priceInr: integer('price_inr').notNull(),
  admissionFeeInr: integer('admission_fee_inr').notNull().default(0),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
}, (table) => [
  index('idx_membership_plans_gym').on(table.gymId),
]);

// 8. Assigned Memberships
export const memberships = sqliteTable('memberships', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  memberId: text('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => membershipPlans.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalAmountInr: integer('total_amount_inr').notNull(),
  discountInr: integer('discount_inr').notNull().default(0),
  paidAmountInr: integer('paid_amount_inr').notNull().default(0),
  status: text('status', { enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'FROZEN'] }).notNull().default('ACTIVE'),
  notes: text('notes'),
  createdByUserId: text('created_by_user_id').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_memberships_gym_dates').on(table.gymId, table.endDate),
  index('idx_memberships_member').on(table.memberId),
  index('idx_memberships_status').on(table.gymId, table.status),
]);

// 9. Payments
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: text('branch_id').notNull().references(() => branches.id),
  memberId: text('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  membershipId: text('membership_id').references(() => memberships.id),
  receiptNumber: text('receipt_number').notNull(),
  amountInr: integer('amount_inr').notNull(),
  paymentMethod: text('payment_method', { enum: ['CASH', 'UPI', 'CARD', 'NETBANKING', 'OTHER'] }).notNull(),
  paymentDate: text('payment_date').notNull(),
  upiRefOrTxnId: text('upi_ref_or_txn_id'),
  collectedByUserId: text('collected_by_user_id').notNull().references(() => users.id),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_payments_gym_date').on(table.gymId, table.paymentDate),
  index('idx_payments_member').on(table.memberId),
  index('idx_payments_membership').on(table.membershipId),
  unique('uq_payments_gym_receipt').on(table.gymId, table.receiptNumber),
]);

// 10. Attendance
export const attendance = sqliteTable('attendance', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').notNull().references(() => gyms.id, { onDelete: 'cascade' }),
  branchId: text('branch_id').notNull().references(() => branches.id),
  memberId: text('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  checkInTime: text('check_in_time').notNull().default(sql`(datetime('now'))`),
  checkOutTime: text('check_out_time'),
  checkInMethod: text('check_in_method', { enum: ['MANUAL', 'QR_SCAN', 'BIOMETRIC'] }).notNull().default('MANUAL'),
  markedByUserId: text('marked_by_user_id').references(() => users.id),
}, (table) => [
  index('idx_attendance_gym_date').on(table.gymId, table.checkInTime),
  index('idx_attendance_member_date').on(table.memberId, table.checkInTime),
]);

// 11. Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  gymId: text('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  oldState: text('old_state'),
  newState: text('new_state'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
}, (table) => [
  index('idx_audit_gym_action').on(table.gymId, table.action, table.createdAt),
]);
