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

-- 10. PASSWORD RESETS
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- ============================================================================
-- PLATFORM BOOTSTRAP: Commercial SaaS plans + Platform Super Admin
-- (Demo gym, members, payments and attendance live in seed_dev.sql and are
--  only applied to local/test databases — never to production.)
-- ============================================================================

-- Commercial Plans
INSERT OR IGNORE INTO plans (id, name, code, description, price_monthly, price_yearly, max_members, max_staff, features_json)
VALUES 
('plan_starter', 'Starter', 'STARTER', 'Ideal for boutique and private studios — up to 100 active members, 3 staff accounts', 99900, 999900, 100, 3, '{"reports": false, "qr_attendance": true, "whatsapp_links": true}'),
('plan_pro', 'Professional', 'PRO', 'Full feature set for growing fitness centers', 199900, 1999900, 500, 10, '{"reports": true, "qr_attendance": true, "whatsapp_links": true}'),
('plan_enterprise', 'Enterprise', 'ENTERPRISE', 'Unlimited capacity and priority support', 399900, 3999900, -1, -1, '{"reports": true, "qr_attendance": true, "whatsapp_links": true, "api_access": true}');

-- Platform Super Admin (gym_id is NULL). Password must be rotated on first login.
-- SHA-256 for 'admin123'
INSERT OR IGNORE INTO users (id, gym_id, name, email, phone, password_hash, role, status)
VALUES 
('usr_superadmin', NULL, 'Super Administrator', 'superadmin@gymtech.app', '9999999999', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'SUPER_ADMIN', 'ACTIVE');
