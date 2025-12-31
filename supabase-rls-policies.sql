-- Get Kraken - RLS Policies for Complete User Isolation
-- Run this SQL in your Supabase SQL editor to ensure strict user isolation
-- This prevents users from seeing or modifying each other's data

-- Step 1: Drop ALL existing policies (comprehensive cleanup)
-- First, explicitly drop known problematic policies by name
DROP POLICY IF EXISTS "Allow all on quests" ON quests;
DROP POLICY IF EXISTS "Allow all for authenticated users on quests" ON quests;
DROP POLICY IF EXISTS "Everyone can read quests" ON quests;
DROP POLICY IF EXISTS "Users can read all quests" ON quests;
DROP POLICY IF EXISTS "Users can read seeded and own quests" ON quests;
DROP POLICY IF EXISTS "Users can update their own quests or seeded quests" ON quests;

DROP POLICY IF EXISTS "Allow all on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Everyone can read shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can read all shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can read seeded and own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can update their own shop items or seeded items" ON shop_items;

-- Then use a DO block to catch any remaining policies
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on all relevant tables
  FOR r IN (
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE tablename IN ('quests', 'shop_items', 'quest_logs', 'shop_logs', 'goals', 'wallets', 'user_preferences', 'user_quest_overrides', 'user_shop_item_overrides', 'user_hidden_quests', 'user_hidden_shop_items')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Step 2: Create RLS policies with STRICT user isolation

-- Quests: Users can READ seeded quests (created_by IS NULL) and their own quests
-- Users can only CREATE/UPDATE/DELETE their own quests
CREATE POLICY "Users can read seeded and own quests" 
  ON quests FOR SELECT 
  TO authenticated 
  USING (created_by IS NULL OR created_by = auth.uid());

CREATE POLICY "Users can create their own quests" 
  ON quests FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update only their own quests" 
  ON quests FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete only their own quests" 
  ON quests FOR DELETE 
  TO authenticated 
  USING (created_by = auth.uid());

-- Shop Items: Users can READ seeded items (created_by IS NULL) and their own items
-- Users can only CREATE/UPDATE/DELETE their own items
CREATE POLICY "Users can read seeded and own shop items" 
  ON shop_items FOR SELECT 
  TO authenticated 
  USING (created_by IS NULL OR created_by = auth.uid());

CREATE POLICY "Users can create their own shop items" 
  ON shop_items FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update only their own shop items" 
  ON shop_items FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete only their own shop items" 
  ON shop_items FOR DELETE 
  TO authenticated 
  USING (created_by = auth.uid());

-- Quest Logs: Users can only see/modify their own logs
CREATE POLICY "Users can read their own quest logs" 
  ON quest_logs FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quest logs" 
  ON quest_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own quest logs" 
  ON quest_logs FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Shop Logs: Users can only see/modify their own logs
CREATE POLICY "Users can read their own shop logs" 
  ON shop_logs FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shop logs" 
  ON shop_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own shop logs" 
  ON shop_logs FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Goals: Users can only see/modify their own goals
CREATE POLICY "Users can read their own goals" 
  ON goals FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals" 
  ON goals FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals" 
  ON goals FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals" 
  ON goals FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Wallets: Users can only see/modify their own wallet
CREATE POLICY "Users can read their own wallet" 
  ON wallets FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wallet" 
  ON wallets FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet" 
  ON wallets FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own wallet" 
  ON wallets FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- User Preferences: Users can only manage their own preferences
CREATE POLICY "Users can manage their own preferences" 
  ON user_preferences FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Quest Overrides: Users can only manage their own overrides
CREATE POLICY "Users can read their own quest overrides" 
  ON user_quest_overrides FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quest overrides" 
  ON user_quest_overrides FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quest overrides" 
  ON user_quest_overrides FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own quest overrides" 
  ON user_quest_overrides FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- User Shop Item Overrides: Users can only manage their own overrides
CREATE POLICY "Users can read their own shop item overrides" 
  ON user_shop_item_overrides FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shop item overrides" 
  ON user_shop_item_overrides FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own shop item overrides" 
  ON user_shop_item_overrides FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own shop item overrides" 
  ON user_shop_item_overrides FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- User Hidden Quests: Users can only manage their own hidden quests
CREATE POLICY "Users can read their own hidden quests" 
  ON user_hidden_quests FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own hidden quests" 
  ON user_hidden_quests FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own hidden quests" 
  ON user_hidden_quests FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- User Hidden Shop Items: Users can only manage their own hidden items
CREATE POLICY "Users can read their own hidden shop items" 
  ON user_hidden_shop_items FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own hidden shop items" 
  ON user_hidden_shop_items FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own hidden shop items" 
  ON user_hidden_shop_items FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Step 3: Ensure RLS is enabled on all tables
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shop_item_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hidden_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hidden_shop_items ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify the setup
SELECT 'User isolation setup complete!' as status;
