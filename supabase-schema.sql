-- Kibblings Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wallets table (single shared wallet)
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY DEFAULT 'shared-wallet',
  total INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo_url TEXT,
  reward INTEGER NOT NULL DEFAULT 10,
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
  photo_url TEXT,
  price INTEGER NOT NULL DEFAULT 20,
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

-- Create storage bucket for images
-- Note: Run this in Supabase Storage section, not SQL editor
-- Bucket name: "kibblings"
-- Public: true

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quest_logs_quest_id ON quest_logs(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_logs_completed_at ON quest_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_logs_item_id ON shop_logs(shop_item_id);
CREATE INDEX IF NOT EXISTS idx_shop_logs_purchased_at ON shop_logs(purchased_at DESC);

-- Enable Row Level Security (RLS) - Allow all operations for now
-- Adjust based on your security requirements
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust for production)
CREATE POLICY "Allow all on wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on quests" ON quests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on quest_logs" ON quest_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shop_items" ON shop_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shop_logs" ON shop_logs FOR ALL USING (true) WITH CHECK (true);

