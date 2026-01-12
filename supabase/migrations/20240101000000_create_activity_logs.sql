-- Get Kraken v2 - Activity Logs Table Migration
-- Phase 4: Calendar and unified activity timeline
-- 
-- This migration creates the activity_logs table for unified activity tracking
-- All existing quest_logs and shop_logs remain untouched

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL, -- Future: when habits table exists
  reward_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('habit_log', 'quest_complete', 'reward_purchase')),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10), -- For habit_log
  dollars_saved NUMERIC(10, 2), -- For habit_log
  sand_dollars_earned NUMERIC(10, 2), -- For quest_complete
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For buddy attribution
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_logged_at ON activity_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_quest_id ON activity_logs(quest_id) WHERE quest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_logs_habit_id ON activity_logs(habit_id) WHERE habit_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_logs_reward_id ON activity_logs(reward_id) WHERE reward_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_logs_source_user ON activity_logs(source_user_id) WHERE source_user_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own logs
CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own logs
CREATE POLICY "Users can update their own activity logs"
  ON activity_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own logs
CREATE POLICY "Users can delete their own activity logs"
  ON activity_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: Buddy attribution visibility will be handled in application logic
-- For now, users can only see logs where they are the user_id
-- Future: Add policy for shared quests when buddy system is implemented
