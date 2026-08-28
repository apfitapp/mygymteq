-- ============================================================================
-- DEVELOPMENT / TEST SEED DATA  (never apply to production)
-- Creates a demo gym with an owner, staff, trainer, membership plans,
-- members, memberships, payments and attendance for local development
-- and Playwright E2E tests.
--
-- Apply with:  pnpm --filter @gymtech/api db:seed:local
-- ============================================================================

-- Demo Gym (Single Location)
INSERT OR IGNORE INTO gyms (id, name, slug, phone, email, address, city, state, pincode, gst_number, currency, status)
VALUES 
('gym_ironhouse', 'Iron House Fitness', 'iron-house-fitness', '9876543210', 'contact@ironhouse.in', 'Road No 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', '36AAAAA0000A1Z5', 'INR', 'ACTIVE');

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

-- Demo PT Collection
INSERT OR IGNORE INTO pt_collections (id, gym_id, member_id, trainer_id, sessions, amount, commission_percentage, commission_amount, commission_status, payment_mode, payment_date, receipt_number, notes, recorded_by_user_id)
VALUES 
('ptc_1001', 'gym_ironhouse', 'mem_1004', 'usr_trainer', 12, 1200000, 30, 360000, 'PENDING', 'UPI', unixepoch() - 432000, 'RCP-2026-0006', '12-session PT package', 'usr_owner');
