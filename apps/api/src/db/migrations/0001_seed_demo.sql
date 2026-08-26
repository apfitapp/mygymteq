-- 0001_seed_demo.sql: Master Seed Data for Demo & Pilot Launch

-- 1. Seed Platform SaaS Subscription Plans
INSERT OR IGNORE INTO platform_plans (id, name, slug, monthly_price_inr, yearly_price_inr, max_members, max_branches, max_staff, has_qr_attendance, has_reports, has_whatsapp_automation, is_active)
VALUES 
('plan_starter', 'Starter Single Gym', 'starter', 99900, 999000, 150, 1, 3, 1, 0, 0, 1),
('plan_pro', 'Growth Pro Club', 'pro', 249900, 2499000, 500, 3, 10, 1, 1, 1, 1),
('plan_enterprise', 'Chain Enterprise', 'enterprise', 599900, 5999000, 2500, 15, 50, 1, 1, 1, 1);

-- 2. Seed Super Admin User (admin@mygymteq.com / Admin@12345)
INSERT OR IGNORE INTO users (id, gym_id, branch_id, email, phone, password_hash, full_name, role, is_active)
VALUES 
('usr_super_admin', NULL, NULL, 'admin@mygymteq.com', '9999999999', 'pbkdf2:sha256:100000$9856f95bb1228fabba6af8b4298c0827$a0c8492277c960270c1a7494d46ca0783cff3fb1e5a8137e1327a903fffa6384', 'Platform Super Admin', 'SUPER_ADMIN', 1);

-- 3. Seed Tenant 1: Iron House Gym (Hyderabad)
INSERT OR IGNORE INTO gyms (id, name, slug, phone, email, address, city, state, pincode, status)
VALUES 
('gym_ironhouse', 'Iron House Fitness Club', 'ironhouse', '9876500001', 'contact@ironhouse.in', 'Road No 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 'ACTIVE');

-- 4. Seed Branches for Iron House
INSERT OR IGNORE INTO branches (id, gym_id, name, code, phone, address, is_primary, is_active)
VALUES 
('br_ironhouse_jh', 'gym_ironhouse', 'Jubilee Hills HQ', 'JH-01', '9876500001', 'Road No 36, Jubilee Hills', 1, 1),
('br_ironhouse_gb', 'gym_ironhouse', 'Gachibowli Tech Center', 'GB-02', '9876500002', 'Opp. DLF Cybercity, Gachibowli', 0, 1);

-- 5. Seed Gym Owner & Staff for Iron House
-- Owner: owner@ironhouse.in / IronHouse@123
-- Staff: staff@ironhouse.in / Staff@12345
INSERT OR IGNORE INTO users (id, gym_id, branch_id, email, phone, password_hash, full_name, role, is_active)
VALUES 
('usr_ironhouse_owner', 'gym_ironhouse', 'br_ironhouse_jh', 'owner@ironhouse.in', '9876511111', 'pbkdf2:sha256:100000$399e687c612c74d8669797d163add759$900cd64aa145260d58125ad2601ca565b6e6a2dda2955068be79143065a33bae', 'Vikram Reddy', 'GYM_OWNER', 1),
('usr_ironhouse_staff', 'gym_ironhouse', 'br_ironhouse_jh', 'staff@ironhouse.in', '9876522222', 'pbkdf2:sha256:100000$900281ab60be5fb97f397b703e76fd59$e2f036f68dd51826f02667f2bb518045f453d1d5a7dec85bbd2532a1cb480472', 'Karan Frontdesk', 'STAFF', 1);

-- 6. Seed Subscription for Iron House
INSERT OR IGNORE INTO gym_subscriptions (id, gym_id, plan_id, status, trial_ends_at, current_period_start, current_period_end)
VALUES 
('sub_ironhouse', 'gym_ironhouse', 'plan_pro', 'ACTIVE', NULL, '2026-08-01', '2027-08-01');

-- 7. Seed Membership Plans for Iron House
INSERT OR IGNORE INTO membership_plans (id, gym_id, name, duration_months, duration_days, price_inr, admission_fee_inr, description, is_active)
VALUES 
('plan_ih_monthly', 'gym_ironhouse', 'Monthly Gym & Cardio', 1, 0, 150000, 50000, '1 month general gym access with locker', 1),
('plan_ih_quarterly', 'gym_ironhouse', 'Quarterly Transformation (3 Mo)', 3, 0, 400000, 0, '3 months full access + steam & body assessment', 1),
('plan_ih_annual', 'gym_ironhouse', 'Annual VIP Elite (12 Mo)', 12, 0, 1200000, 0, '12 months unlimited access to all branches + 2 guest passes', 1);

-- 8. Seed Sample Members for Iron House
INSERT OR IGNORE INTO members (id, gym_id, branch_id, member_code, full_name, phone, email, gender, dob, emergency_contact_name, emergency_contact_phone, address, joining_date, status)
VALUES 
('mem_rahul', 'gym_ironhouse', 'br_ironhouse_jh', 'MEM-1001', 'Rahul Sharma', '9876543210', 'rahul.sharma@gmail.com', 'MALE', '1995-04-12', 'Sunita Sharma', '9876543219', 'Flat 402, Banjara Hills', '2026-08-01', 'ACTIVE'),
('mem_sneha', 'gym_ironhouse', 'br_ironhouse_jh', 'MEM-1002', 'Sneha Patel', '9876543211', 'sneha.patel@outlook.com', 'FEMALE', '1998-09-21', 'Ramesh Patel', '9876543218', 'Jubilee Hills Road 10', '2026-08-10', 'ACTIVE'),
('mem_amit', 'gym_ironhouse', 'br_ironhouse_gb', 'MEM-1003', 'Amit Varma', '9876543212', 'amit.varma@gmail.com', 'MALE', '1992-11-05', 'Pooja Varma', '9876543217', 'Gachibowli Cyber Towers', '2026-07-15', 'ACTIVE'),
('mem_priya', 'gym_ironhouse', 'br_ironhouse_jh', 'MEM-1004', 'Priya Rao', '9876543213', 'priya.rao@yahoo.com', 'FEMALE', '1996-02-18', 'Kishore Rao', '9876543216', 'Madhapur 100ft Road', '2026-06-01', 'ACTIVE');

-- 9. Seed Active Memberships
INSERT OR IGNORE INTO memberships (id, gym_id, member_id, plan_id, start_date, end_date, total_amount_inr, discount_inr, paid_amount_inr, status, created_by_user_id)
VALUES 
('mship_rahul', 'gym_ironhouse', 'mem_rahul', 'plan_ih_quarterly', '2026-08-01', '2026-11-01', 400000, 0, 400000, 'ACTIVE', 'usr_ironhouse_owner'),
('mship_sneha', 'gym_ironhouse', 'mem_sneha', 'plan_ih_monthly', '2026-08-10', '2026-08-30', 200000, 0, 200000, 'ACTIVE', 'usr_ironhouse_owner'),
('mship_amit', 'gym_ironhouse', 'mem_amit', 'plan_ih_annual', '2026-07-15', '2027-07-15', 1200000, 0, 900000, 'ACTIVE', 'usr_ironhouse_staff'),
('mship_priya', 'gym_ironhouse', 'mem_priya', 'plan_ih_monthly', '2026-08-01', '2026-08-28', 200000, 0, 200000, 'ACTIVE', 'usr_ironhouse_owner');

-- 10. Seed Payments
INSERT OR IGNORE INTO payments (id, gym_id, branch_id, member_id, membership_id, receipt_number, amount_inr, payment_method, payment_date, upi_ref_or_txn_id, collected_by_user_id, notes)
VALUES 
('pay_001', 'gym_ironhouse', 'br_ironhouse_jh', 'mem_rahul', 'mship_rahul', 'REC-2026-0001', 400000, 'UPI', '2026-08-01', 'UPI/GPay/482910482910', 'usr_ironhouse_owner', '3 months plan payment via GPay'),
('pay_002', 'gym_ironhouse', 'br_ironhouse_jh', 'mem_sneha', 'mship_sneha', 'REC-2026-0002', 200000, 'UPI', '2026-08-10', 'UPI/PhonePe/918237482910', 'usr_ironhouse_owner', 'Admission + Monthly Plan via PhonePe'),
('pay_003', 'gym_ironhouse', 'br_ironhouse_gb', 'mem_amit', 'mship_amit', 'REC-2026-0003', 900000, 'CARD', '2026-07-15', 'POS/HDFC/992819', 'usr_ironhouse_staff', 'Part payment for 12 months membership'),
('pay_004', 'gym_ironhouse', 'br_ironhouse_jh', 'mem_priya', 'mship_priya', 'REC-2026-0004', 200000, 'CASH', '2026-08-01', NULL, 'usr_ironhouse_owner', 'Monthly cash payment at desk');

-- 11. Seed Attendance Check-ins
INSERT OR IGNORE INTO attendance (id, gym_id, branch_id, member_id, check_in_time, check_in_method, marked_by_user_id)
VALUES 
('att_001', 'gym_ironhouse', 'br_ironhouse_jh', 'mem_rahul', datetime('now', '-2 hours'), 'MANUAL', 'usr_ironhouse_staff'),
('att_002', 'gym_ironhouse', 'br_ironhouse_jh', 'mem_sneha', datetime('now', '-45 minutes'), 'QR_SCAN', NULL),
('att_003', 'gym_ironhouse', 'br_ironhouse_gb', 'mem_amit', datetime('now', '-10 minutes'), 'MANUAL', 'usr_ironhouse_staff');

-- 12. Seed Tenant 2: PowerHouse Fitness (Bengaluru) - for Multi-Tenant Isolation Testing
INSERT OR IGNORE INTO gyms (id, name, slug, phone, email, address, city, state, pincode, status)
VALUES 
('gym_powerhouse', 'PowerHouse Fitness Arena', 'powerhouse', '9876500099', 'info@powerhouse.in', '100 Feet Rd, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'ACTIVE');

INSERT OR IGNORE INTO branches (id, gym_id, name, code, phone, is_primary, is_active)
VALUES 
('br_powerhouse_hq', 'gym_powerhouse', 'Indiranagar HQ', 'IN-01', '9876500099', 1, 1);

INSERT OR IGNORE INTO users (id, gym_id, branch_id, email, phone, password_hash, full_name, role, is_active)
VALUES 
('usr_powerhouse_owner', 'gym_powerhouse', 'br_powerhouse_hq', 'owner@powerhouse.in', '9876533333', 'pbkdf2:sha256:100000$86b653ea13be550223208c70d75f0f28$0752474fb980a0f21bb383229784e66b39e96932b60632277f1bdb1d5c4750e4', 'Rajesh Gowda', 'GYM_OWNER', 1);

INSERT OR IGNORE INTO gym_subscriptions (id, gym_id, plan_id, status, trial_ends_at, current_period_start, current_period_end)
VALUES 
('sub_powerhouse', 'gym_powerhouse', 'plan_starter', 'ACTIVE', NULL, '2026-08-01', '2027-08-01');
