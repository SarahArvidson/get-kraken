-- Get Kraken - Dollar Tracking Schema
-- Run this SQL in your Supabase SQL editor to add dollar amount tracking

-- Add dollar_amount column to quests table
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS dollar_amount DECIMAL(10, 2) DEFAULT 0;

-- Add dollar_amount column to shop_items table
ALTER TABLE shop_items 
ADD COLUMN IF NOT EXISTS dollar_amount DECIMAL(10, 2) DEFAULT 0;

-- Add dollar_total column to wallets table
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS dollar_total DECIMAL(10, 2) DEFAULT 0;

-- Create user preferences table for storing display settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_dollar_amounts BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" 
  ON user_preferences FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

