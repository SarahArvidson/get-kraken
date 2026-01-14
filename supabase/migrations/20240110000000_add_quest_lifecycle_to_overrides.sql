-- Get Kraken v2 - Quest Lifecycle in User Overrides
-- Moves quest lifecycle state (status, completion_count, etc.) to user_quest_overrides
-- This allows per-user quest state for seeded quests that users cannot directly update

-- Add lifecycle columns to user_quest_overrides
ALTER TABLE user_quest_overrides
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('idle', 'active', 'completed')) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS reward_rarity TEXT CHECK (reward_rarity IN ('common', 'rare', 'epic', 'legendary')) NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_quest_overrides_status ON user_quest_overrides(user_id, status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_quest_overrides_quest_id ON user_quest_overrides(quest_id);

-- Force schema cache refresh
ALTER TABLE user_quest_overrides ADD COLUMN IF NOT EXISTS status TEXT;
