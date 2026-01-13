-- Get Kraken v2 - Quest Runs Table Migration
-- Phase 5.9: Finish core quest lifecycle before social
-- 
-- Creates quest_runs table for repeatable quest instances
-- This is a scaffold-only migration (minimal implementation)

-- Create quest_runs table
CREATE TABLE IF NOT EXISTS quest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_quest_runs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_quest_runs_quest FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quest_runs_user_quest ON quest_runs(user_id, quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_runs_started_at ON quest_runs(user_id, started_at DESC);

-- Enable Row Level Security
ALTER TABLE quest_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own quest runs
CREATE POLICY "Users can view their own quest runs"
  ON quest_runs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own quest runs
CREATE POLICY "Users can insert their own quest runs"
  ON quest_runs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own quest runs
CREATE POLICY "Users can update their own quest runs"
  ON quest_runs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own quest runs
CREATE POLICY "Users can delete their own quest runs"
  ON quest_runs
  FOR DELETE
  USING (auth.uid() = user_id);
