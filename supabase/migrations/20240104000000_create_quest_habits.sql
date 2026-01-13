-- Get Kraken v2 - Quest Habits Table Migration
-- Phase 5.95: Habit tracking and task lists
--
-- Creates quest_habits and habit_logs tables for habit tracking

-- Create quest_habits table
CREATE TABLE IF NOT EXISTS quest_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_quest_habits_quest FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  CONSTRAINT fk_quest_habits_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quest_habits_quest_user ON quest_habits(quest_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quest_habits_user ON quest_habits(user_id);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES quest_habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  dollars_saved INTEGER DEFAULT 0,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_habit_logs_habit FOREIGN KEY (habit_id) REFERENCES quest_habits(id) ON DELETE CASCADE,
  CONSTRAINT fk_habit_logs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id, user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_logged_at ON habit_logs(user_id, logged_at DESC);

-- Enable Row Level Security
ALTER TABLE quest_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quest_habits
CREATE POLICY "Users can view their own quest habits"
  ON quest_habits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest habits"
  ON quest_habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest habits"
  ON quest_habits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quest habits"
  ON quest_habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_logs
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
  ON habit_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs
  FOR DELETE
  USING (auth.uid() = user_id);
