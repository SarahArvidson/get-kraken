-- Get Kraken v2 - Quest Tasks Table Migration
-- Phase 5.95: Habit tracking and task lists
--
-- Creates quest_tasks table for task tracking

-- Create quest_tasks table
CREATE TABLE IF NOT EXISTS quest_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_quest_tasks_quest FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  CONSTRAINT fk_quest_tasks_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quest_tasks_quest_user ON quest_tasks(quest_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quest_tasks_user ON quest_tasks(user_id);

-- Enable Row Level Security
ALTER TABLE quest_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quest_tasks
CREATE POLICY "Users can view their own quest tasks"
  ON quest_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest tasks"
  ON quest_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest tasks"
  ON quest_tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quest tasks"
  ON quest_tasks
  FOR DELETE
  USING (auth.uid() = user_id);
