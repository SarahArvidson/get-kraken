-- Get Kraken - Complete Database Setup
-- Run this SQL in your Supabase SQL editor to set up all required tables
-- Run this ONCE to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets table (single shared wallet)
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY DEFAULT 'shared-wallet',
  total INTEGER NOT NULL DEFAULT 0,
  dollar_total DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  reward INTEGER NOT NULL DEFAULT 10,
  dollar_amount DECIMAL(10, 2) DEFAULT 0,
  completion_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quest logs table
CREATE TABLE IF NOT EXISTS quest_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  price INTEGER NOT NULL DEFAULT 20,
  dollar_amount DECIMAL(10, 2) DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shop logs table
CREATE TABLE IF NOT EXISTS shop_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_dollar_amounts BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quest_logs_quest_id ON quest_logs(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_logs_completed_at ON quest_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_logs_item_id ON shop_logs(shop_item_id);
CREATE INDEX IF NOT EXISTS idx_shop_logs_purchased_at ON shop_logs(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_quests_tags ON quests USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shop_items_tags ON shop_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all on quests" ON quests;
DROP POLICY IF EXISTS "Allow all on quest_logs" ON quest_logs;
DROP POLICY IF EXISTS "Allow all on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow all on shop_logs" ON shop_logs;
DROP POLICY IF EXISTS "Allow all for authenticated users on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all for authenticated users on quests" ON quests;
DROP POLICY IF EXISTS "Allow all for authenticated users on quest_logs" ON quest_logs;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_logs" ON shop_logs;
DROP POLICY IF EXISTS "Allow all for authenticated users on goals" ON goals;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow all for authenticated users on wallets" 
  ON wallets FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on quests" 
  ON quests FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on quest_logs" 
  ON quest_logs FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on shop_items" 
  ON shop_items FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on shop_logs" 
  ON shop_logs FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on goals" 
  ON goals FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Users can manage their own preferences" 
  ON user_preferences FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Initialize the wallet if it doesn't exist
INSERT INTO wallets (id, total, dollar_total, updated_at)
VALUES ('shared-wallet', 0, 0, NOW())
ON CONFLICT (id) DO NOTHING;

