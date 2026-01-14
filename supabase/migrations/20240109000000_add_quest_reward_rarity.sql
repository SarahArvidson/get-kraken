-- Get Kraken v2 - Quest Reward Rarity Migration
-- Adds reward_rarity column to quests table for quest reward rarity

-- Add reward_rarity column to quests table with DEFAULT
ALTER TABLE quests
ADD COLUMN IF NOT EXISTS reward_rarity TEXT CHECK (reward_rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common';

-- Set default for existing rows
UPDATE quests SET reward_rarity = 'common' WHERE reward_rarity IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quests_reward_rarity ON quests(reward_rarity) WHERE reward_rarity IS NOT NULL;

-- Force schema cache refresh (no-op alter to bust cache)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS reward_rarity TEXT;
