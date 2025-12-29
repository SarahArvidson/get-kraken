-- Get Kraken - RLS Policies for Authenticated Users
-- Run this SQL in your Supabase SQL editor to fix RLS policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all on quests" ON quests;
DROP POLICY IF EXISTS "Allow all on quest_logs" ON quest_logs;
DROP POLICY IF EXISTS "Allow all on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow all on shop_logs" ON shop_logs;

-- Create policies for authenticated users
-- These allow all operations for any authenticated user
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

-- Ensure RLS is enabled
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_logs ENABLE ROW LEVEL SECURITY;

