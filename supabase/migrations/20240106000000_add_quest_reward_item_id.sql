-- Get Kraken v2 - Quest Reward Item ID Migration
-- Core quest reward model fix
--
-- Adds reward_item_id column to quests table for associated reward items

-- Add reward_item_id column to quests table
ALTER TABLE quests
ADD COLUMN IF NOT EXISTS reward_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quests_reward_item_id ON quests(reward_item_id) WHERE reward_item_id IS NOT NULL;
