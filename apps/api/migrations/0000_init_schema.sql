-- ============================================================================
-- GYM SAAS D1 MIGRATION: 0000_init_schema.sql
-- ============================================================================

-- 1. GYMS
CREATE TABLE IF NOT EXISTS gyms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gst_number TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_gyms_status ON gyms(status);
CREATE INDEX IF NOT EXISTS idx_gyms_slug ON gyms(slug);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    gym_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_login_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_gym_id ON users(gym_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. COMMERCIAL PLANS & SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER NOT NULL,
    max_members INTEGER NOT NULL,
    max_staff INTEGER NOT NULL,
    features_json TEXT NOT NULL DEFAULT '{}',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    status TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    trial_end_date INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_gym ON subscriptions(gym_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL UNIQUE,
    subscription_id TEXT NOT NULL,
    max_members INTEGER NOT NULL DEFAULT 100,
    max_staff INTEGER NOT NULL DEFAULT 3,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    entitlements_json TEXT NOT NULL DEFAULT '{}',
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_licenses_gym ON licenses(gym_id);

-- 4. GYM MEMBERSHIP PLANS (Gym-specific catalogs)
CREATE TABLE IF NOT EXISTS membership_plans (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_months INTEGER NOT NULL,
    price INTEGER NOT NULL,
    admission_fee INTEGER NOT NULL DEFAULT 0,
    tax_percentage REAL NOT NULL DEFAULT 0.0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_gym ON membership_plans(gym_id, is_active);

-- 5. MEMBERS
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_code TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT NOT NULL,
    gender TEXT,
    date_of_birth TEXT,
    blood_group TEXT,
    photo_url TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    health_notes TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    joined_date INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    deleted_at INTEGER,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    UNIQUE (gym_id, member_code)
);

CREATE INDEX IF NOT EXISTS idx_members_gym_status ON members(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_members_gym_phone ON members(gym_id, phone);
CREATE INDEX IF NOT EXISTS idx_members_gym_name ON members(gym_id, first_name, last_name);

-- 6. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    membership_plan_id TEXT NOT NULL,
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    final_amount INTEGER NOT NULL,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    due_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_plan_id) REFERENCES membership_plans(id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_gym_status ON memberships(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_gym_dates ON memberships(gym_id, end_date);
CREATE INDEX IF NOT EXISTS idx_memberships_member ON memberships(member_id);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    membership_id TEXT,
    receipt_number TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_date INTEGER NOT NULL,
    payment_mode TEXT NOT NULL,
    reference_id TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    recorded_by_user_id TEXT NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id),
    UNIQUE (gym_id, receipt_number)
);

CREATE INDEX IF NOT EXISTS idx_payments_gym_date ON payments(gym_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership ON payments(membership_id);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    check_in_time INTEGER NOT NULL,
    check_out_time INTEGER,
    date_key TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'MANUAL',
    recorded_by_user_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_gym_date ON attendance(gym_id, date_key);
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, date_key);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    gym_id TEXT,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details_json TEXT NOT NULL DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_gym ON audit_logs(gym_id, created_at);

-- ============================================================================
-- SEED DATA: Platform Admin, Plans, Demo Gym, Owner, Memberships & Members
-- ============================================================================

-- Commercial Plans
INSERT OR IGNORE INTO plans (id, name, code, description, price_monthly, price_yearly, max_members, max_staff, features_json)
VALUES 
('plan_starter', 'Starter', 'STARTER', 'Ideal for boutique and private studios', 99900, 999900, 100, 3, '{"reports": false, "qr_attendance": true, "whatsapp_links": true}'),
('plan_pro', 'Professional', 'PRO', 'Full feature set for growing fitness centers', 199900, 1999900, 500, 10, '{"reports": true, "qr_attendance": true, "whatsapp_links": true}'),
('plan_enterprise', 'Enterprise', 'ENTERPRISE', 'Unlimited capacity and priority support', 399900, 3999900, -1, -1, '{"reports": true, "qr_attendance": true, "whatsapp_links": true, "api_access": true}');

-- Demo Gym (Single Location)
INSERT OR IGNORE INTO gyms (id, name, slug, phone, email, address, city, state, pincode, gst_number, currency, status)
VALUES 
('gym_ironhouse', 'Iron House Fitness', 'iron-house-fitness', '9876543210', 'contact@ironhouse.in', 'Road No 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', '36AAAAA0000A1Z5', 'INR', 'ACTIVE');

-- Platform Super Admin (gym_id is NULL)
-- SHA-256 for 'admin123'
INSERT OR IGNORE INTO users (id, gym_id, name, email, phone, password_hash, role, status)
VALUES 
('usr_superadmin', NULL, 'Super Administrator', 'superadmin@mygymteq.com', '9999999999', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'SUPER_ADMIN', 'ACTIVE');

-- Gym Owner (belongs to gym_ironhouse)
-- SHA-256 for 'admin123'
INSERT OR IGNORE INTO users (id, gym_id, name, email, phone, password_hash, role, status)
VALUES 
('usr_owner', 'gym_ironhouse', 'Vikram Rathore', 'admin@ironhouse.in', '9876543210', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'OWNER', 'ACTIVE');

-- Gym Staff & Trainer
-- SHA-256 for 'trainer123' -> 'd302a632c4ee79ff5deefcfa9fbf49e3557e4e13e00e4708761bfcaaeef2f207'
INSERT OR IGNORE INTO users (id, gym_id, name, email, phone, password_hash, role, status)
VALUES 
('usr_staff', 'gym_ironhouse', 'Anjali Sharma', 'staff@ironhouse.in', '9876543215', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'STAFF', 'ACTIVE'),
('usr_trainer', 'gym_ironhouse', 'Karan Verma', 'trainer@ironhouse.in', '9876543216', 'd302a632c4ee79ff5deefcfa9fbf49e3557e4e13e00e4708761bfcaaeef2f207', 'TRAINER', 'ACTIVE');

-- Subscription & License for Demo Gym
INSERT OR IGNORE INTO subscriptions (id, gym_id, plan_id, billing_cycle, status, amount, start_date, end_date)
VALUES 
('sub_ironhouse_pro', 'gym_ironhouse', 'plan_pro', 'YEARLY', 'ACTIVE', 1999900, unixepoch(), unixepoch() + 31536000);

INSERT OR IGNORE INTO licenses (id, gym_id, subscription_id, max_members, max_staff, status, entitlements_json, expires_at)
VALUES 
('lic_ironhouse', 'gym_ironhouse', 'sub_ironhouse_pro', 500, 10, 'ACTIVE', '{"reports": true, "qr_attendance": true, "whatsapp_links": true}', unixepoch() + 31536000);

-- Gym Membership Plans
INSERT OR IGNORE INTO membership_plans (id, gym_id, name, description, duration_months, price, admission_fee, is_active)
VALUES 
('mpl_monthly', 'gym_ironhouse', 'Monthly General Fitness', 'Standard access to gym floor and weights', 1, 150000, 50000, 1),
('mpl_quarterly', 'gym_ironhouse', 'Quarterly Strength & Cardio', 'Includes cardio zone and standard strength machines', 3, 400000, 50000, 1),
('mpl_half_yearly', 'gym_ironhouse', 'Half-Yearly Transform', '6 months all-inclusive access with locker', 6, 750000, 0, 1),
('mpl_annual_vip', 'gym_ironhouse', 'Annual VIP Pass', 'Full year access + personal trainer consultation', 12, 1400000, 0, 1);

-- Demo Members
INSERT OR IGNORE INTO members (id, gym_id, member_code, first_name, last_name, email, phone, gender, joined_date, status)
VALUES 
('mem_1001', 'gym_ironhouse', 'MEM-1001', 'Rahul', 'Sharma', 'rahul@example.com', '9876543210', 'MALE', unixepoch() - 7776000, 'ACTIVE'),
('mem_1002', 'gym_ironhouse', 'MEM-1002', 'Sneha', 'Reddy', 'sneha@example.com', '9876543211', 'FEMALE', unixepoch() - 5184000, 'ACTIVE'),
('mem_1003', 'gym_ironhouse', 'MEM-1003', 'Amit', 'Patel', 'amit@example.com', '9876543212', 'MALE', unixepoch() - 2592000, 'ACTIVE'),
('mem_1004', 'gym_ironhouse', 'MEM-1004', 'Priya', 'Nair', 'priya@example.com', '9876543213', 'FEMALE', unixepoch() - 1296000, 'ACTIVE'),
('mem_1005', 'gym_ironhouse', 'MEM-1005', 'Rohan', 'Gupta', 'rohan@example.com', '9876543214', 'MALE', unixepoch() - 86400, 'ACTIVE');

-- Active Memberships for Members
INSERT OR IGNORE INTO memberships (id, gym_id, member_id, membership_plan_id, start_date, end_date, total_amount, discount_amount, final_amount, paid_amount, due_amount, status)
VALUES 
('ms_1001', 'gym_ironhouse', 'mem_1001', 'mpl_half_yearly', unixepoch() - 2592000, unixepoch() + 12960000, 750000, 50000, 700000, 700000, 0, 'ACTIVE'),
('ms_1002', 'gym_ironhouse', 'mem_1002', 'mpl_quarterly', unixepoch() - 5184000, unixepoch() + 2592000, 450000, 0, 450000, 300000, 150000, 'ACTIVE'),
('ms_1003', 'gym_ironhouse', 'mem_1003', 'mpl_monthly', unixepoch() - 2000000, unixepoch() + 592000, 200000, 0, 200000, 200000, 0, 'ACTIVE'),
('ms_1004', 'gym_ironhouse', 'mem_1004', 'mpl_annual_vip', unixepoch() - 1296000, unixepoch() + 30240000, 1400000, 100000, 1300000, 1300000, 0, 'ACTIVE'),
('ms_1005', 'gym_ironhouse', 'mem_1005', 'mpl_quarterly', unixepoch() - 86400, unixepoch() + 7689600, 450000, 0, 450000, 450000, 0, 'ACTIVE');

-- Demo Payments
INSERT OR IGNORE INTO payments (id, gym_id, member_id, membership_id, receipt_number, amount, payment_date, payment_mode, reference_id, status, recorded_by_user_id)
VALUES 
('pay_1001', 'gym_ironhouse', 'mem_1001', 'ms_1001', 'RCP-2026-0001', 700000, unixepoch() - 2592000, 'UPI', 'UPI/202601/1001', 'COMPLETED', 'usr_owner'),
('pay_1002', 'gym_ironhouse', 'mem_1002', 'ms_1002', 'RCP-2026-0002', 300000, unixepoch() - 5184000, 'CASH', NULL, 'COMPLETED', 'usr_owner'),
('pay_1003', 'gym_ironhouse', 'mem_1003', 'ms_1003', 'RCP-2026-0003', 200000, unixepoch() - 2000000, 'CARD', 'POS-9831', 'COMPLETED', 'usr_staff'),
('pay_1004', 'gym_ironhouse', 'mem_1004', 'ms_1004', 'RCP-2026-0004', 1300000, unixepoch() - 1296000, 'UPI', 'UPI/202602/4482', 'COMPLETED', 'usr_owner'),
('pay_1005', 'gym_ironhouse', 'mem_1005', 'ms_1005', 'RCP-2026-0005', 450000, unixepoch() - 86400, 'UPI', 'UPI/202602/7719', 'COMPLETED', 'usr_owner');

-- Demo Today Attendance
INSERT OR IGNORE INTO attendance (id, gym_id, member_id, check_in_time, date_key, method, recorded_by_user_id)
VALUES 
('att_1001', 'gym_ironhouse', 'mem_1001', unixepoch() - 14400, strftime('%Y-%m-%d', 'now'), 'QR_SCAN', 'usr_staff'),
('att_1002', 'gym_ironhouse', 'mem_1002', unixepoch() - 10800, strftime('%Y-%m-%d', 'now'), 'MANUAL', 'usr_staff'),
('att_1003', 'gym_ironhouse', 'mem_1004', unixepoch() - 7200, strftime('%Y-%m-%d', 'now'), 'MANUAL', 'usr_staff');
