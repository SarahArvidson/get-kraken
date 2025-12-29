-- Get Kraken - Goals Table Schema
-- Run this SQL in your Supabase SQL editor to add goals functionality

-- Goals table for customizable user goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_amount INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users on goals" ON goals;
CREATE POLICY "Allow all for authenticated users on goals" 
  ON goals FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

