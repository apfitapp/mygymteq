-- ============================================================================
-- GYM SAAS D1 MIGRATION: 0001_freeze_and_pt.sql
-- Freeze/pause support + Personal Trainer collections & commissions
-- ============================================================================

-- 1. Freeze/pause tracking on memberships.
-- While a membership is frozen, `frozen_at` holds the freeze start (unixepoch).
-- On unfreeze, end_date is extended by the frozen duration and frozen_at is cleared.
ALTER TABLE memberships ADD COLUMN frozen_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_memberships_frozen ON memberships(gym_id, frozen_at);

-- 2. PERSONAL TRAINER COLLECTIONS
-- Tracks PT package payments collected from members and the trainer's commission.
CREATE TABLE IF NOT EXISTS pt_collections (
    id TEXT PRIMARY KEY,
    gym_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    trainer_id TEXT NOT NULL,
    sessions INTEGER NOT NULL DEFAULT 0,
    amount INTEGER NOT NULL,
    commission_percentage REAL NOT NULL DEFAULT 0.0,
    commission_amount INTEGER NOT NULL DEFAULT 0,
    commission_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | PAID
    payment_mode TEXT NOT NULL DEFAULT 'CASH',
    payment_date INTEGER NOT NULL,
    receipt_number TEXT,
    notes TEXT,
    recorded_by_user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(id),
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_pt_collections_gym_date ON pt_collections(gym_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_pt_collections_trainer ON pt_collections(gym_id, trainer_id, commission_status);
