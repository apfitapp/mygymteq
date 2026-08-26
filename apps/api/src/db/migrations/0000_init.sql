-- 0000_init.sql: Master Multi-Tenant Schema for Gym SaaS

-- 1. SaaS Platform Subscription Plans
CREATE TABLE IF NOT EXISTS platform_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    monthly_price_inr INTEGER NOT NULL,
    yearly_price_inr INTEGER NOT NULL,
    max_members INTEGER NOT NULL DEFAULT 150,
    max_branches INTEGER NOT NULL DEFAULT 1,
    max_staff INTEGER NOT NULL DEFAULT 3,
    has_qr_attendance INTEGER NOT NULL DEFAULT 1,
    has_reports INTEGER NOT NULL DEFAULT 0,
    has_whatsapp_automation INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Gym Tenants
CREATE TABLE IF NOT EXISTS gyms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    custom_domain TEXT UNIQUE,
    logo_r2_key TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Telangana',
    pincode TEXT,
    gstin TEXT,
    status TEXT NOT NULL DEFAULT 'TRIAL',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_gyms_slug ON gyms(slug);
CREATE INDEX IF NOT EXISTS idx_gyms_status ON gyms(status);

-- 3. Gym Subscriptions & Entitlements
CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'TRIAL',
    trial_ends_at TEXT,
    current_period_start TEXT NOT NULL,
    current_period_end TEXT NOT NULL,
    max_members_override INTEGER,
    max_branches_override INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES platform_plans(id)
);
CREATE INDEX IF NOT EXISTS idx_gym_subscriptions_gym ON gym_subscriptions(gym_id);

-- 4. Branches
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    UNIQUE(gym_id, code)
);
CREATE INDEX IF NOT EXISTS idx_branches_gym ON branches(gym_id);

-- 5. Users & Identity
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    gym_id TEXT,
    branch_id TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    UNIQUE(email)
);
CREATE INDEX IF NOT EXISTS idx_users_gym_role ON users(gym_id, role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 6. Members
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    member_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gender TEXT,
    dob TEXT,
    photo_r2_key TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_notes TEXT,
    address TEXT,
    joining_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    UNIQUE(gym_id, member_code)
);
CREATE INDEX IF NOT EXISTS idx_members_gym_status ON members(gym_id, status);
CREATE INDEX IF NOT EXISTS idx_members_gym_phone ON members(gym_id, phone);
CREATE INDEX IF NOT EXISTS idx_members_branch ON members(branch_id);

-- 7. Gym's Membership Plans
CREATE TABLE IF NOT EXISTS membership_plans (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    name TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 0,
    price_inr INTEGER NOT NULL,
    admission_fee_inr INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_membership_plans_gym ON membership_plans(gym_id);

-- 8. Member Assigned Memberships
CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_amount_inr INTEGER NOT NULL,
    discount_inr INTEGER NOT NULL DEFAULT 0,
    paid_amount_inr INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_by_user_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES membership_plans(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_gym_dates ON memberships(gym_id, end_date);
CREATE INDEX IF NOT EXISTS idx_memberships_member ON memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(gym_id, status);

-- 9. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    membership_id TEXT,
    receipt_number TEXT NOT NULL,
    amount_inr INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date TEXT NOT NULL,
    upi_ref_or_txn_id TEXT,
    collected_by_user_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_id) REFERENCES memberships(id),
    FOREIGN KEY (collected_by_user_id) REFERENCES users(id),
    UNIQUE(gym_id, receipt_number)
);
CREATE INDEX IF NOT EXISTS idx_payments_gym_date ON payments(gym_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership ON payments(membership_id);

-- 10. Attendance Logs
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    branch_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    check_in_time TEXT NOT NULL DEFAULT (datetime('now')),
    check_out_time TEXT,
    check_in_method TEXT NOT NULL DEFAULT 'MANUAL',
    marked_by_user_id TEXT,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by_user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_date ON attendance(gym_id, check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, check_in_time);

-- 11. Immutable Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    gym_id TEXT,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_state TEXT,
    new_state TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_gym_action ON audit_logs(gym_id, action, created_at);
