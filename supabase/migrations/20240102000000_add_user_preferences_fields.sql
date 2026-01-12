-- Get Kraken v2 - User Preferences Fields Migration
-- Phase 5: Settings and toggles
-- 
-- Adds show_sand_dollars column to user_preferences table

-- Add show_sand_dollars column (default true)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS show_sand_dollars BOOLEAN NOT NULL DEFAULT true;

-- Add username column for public display (nullable)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS username TEXT;

-- Add enable_social_features column (default false for beta)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS enable_social_features BOOLEAN NOT NULL DEFAULT false;

-- Add index on username for friend lookups (future)
CREATE INDEX IF NOT EXISTS idx_user_preferences_username ON user_preferences(username) WHERE username IS NOT NULL;
