-- Get Kraken v2 - Quest Reward Rarity Migration
-- Adds reward_rarity column to quests table for quest reward rarity

-- Add reward_rarity column to quests table
ALTER TABLE quests
ADD COLUMN IF NOT EXISTS reward_rarity TEXT CHECK (reward_rarity IN ('common', 'rare', 'epic', 'legendary'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quests_reward_rarity ON quests(reward_rarity) WHERE reward_rarity IS NOT NULL;
