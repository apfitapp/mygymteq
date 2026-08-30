-- ============================================================================
-- GYM SAAS D1 MIGRATION: 0002_notification_settings.sql
-- Persist per-gym notification/WhatsApp trigger preferences
-- ============================================================================

-- Stores a JSON blob: { reminderDays, welcomeEnabled, receiptEnabled, expiryEnabled }
ALTER TABLE gyms ADD COLUMN notification_settings_json TEXT;
