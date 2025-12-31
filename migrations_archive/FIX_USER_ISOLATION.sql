-- Fix User Isolation - Make each user's progress separate
-- Run this in Supabase SQL Editor to fix the RLS policies

-- Step 1: Add user_id columns to logs tables (if they don't exist)
ALTER TABLE quest_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE shop_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add user_id to goals table (if it doesn't exist)
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Add user_id to quests and shop_items for tracking who created them
-- (Optional - if you want users to only edit their own created items)
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE shop_items 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 4: Drop all existing policies (including any with similar names)
DROP POLICY IF EXISTS "Allow all for authenticated users on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all for authenticated users on quests" ON quests;
DROP POLICY IF EXISTS "Allow all for authenticated users on quest_logs" ON quest_logs;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_logs" ON shop_logs;
DROP POLICY IF EXISTS "Allow all for authenticated users on goals" ON goals;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding quests" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding shop" ON shop_items;
DROP POLICY IF EXISTS "Everyone can read quests" ON quests;
DROP POLICY IF EXISTS "Users can create their own quests" ON quests;
DROP POLICY IF EXISTS "Users can update their own quests or seeded quests" ON quests;
DROP POLICY IF EXISTS "Users can delete their own quests" ON quests;
DROP POLICY IF EXISTS "Users can read their own quest logs" ON quest_logs;
DROP POLICY IF EXISTS "Users can create their own quest logs" ON quest_logs;
DROP POLICY IF EXISTS "Users can delete their own quest logs" ON quest_logs;
DROP POLICY IF EXISTS "Everyone can read shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can create their own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can update their own shop items or seeded items" ON shop_items;
DROP POLICY IF EXISTS "Users can delete their own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can read their own shop logs" ON shop_logs;
DROP POLICY IF EXISTS "Users can create their own shop logs" ON shop_logs;
DROP POLICY IF EXISTS "Users can delete their own shop logs" ON shop_logs;
DROP POLICY IF EXISTS "Users can read their own goals" ON goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;
DROP POLICY IF EXISTS "Everyone can read shared wallet" ON wallets;
DROP POLICY IF EXISTS "Everyone can update shared wallet" ON wallets;
DROP POLICY IF EXISTS "Users can read their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can create their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can delete their own wallet" ON wallets;

-- Step 5: Create new policies with proper user isolation

-- Wallets: Shared (everyone can read/write the shared wallet)
CREATE POLICY "Everyone can read shared wallet" 
  ON wallets FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Everyone can update shared wallet" 
  ON wallets FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Quests: Everyone can read (see starter items), but only modify their own or seeded items
CREATE POLICY "Everyone can read quests" 
  ON quests FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own quests" 
  ON quests FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can update their own quests or seeded quests" 
  ON quests FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid() OR created_by IS NULL)
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their own quests" 
  ON quests FOR DELETE 
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

-- Shop Items: Everyone can read (see starter items), but only modify their own or seeded items
CREATE POLICY "Everyone can read shop items" 
  ON shop_items FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own shop items" 
  ON shop_items FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can update their own shop items or seeded items" 
  ON shop_items FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid() OR created_by IS NULL)
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can delete their own shop items" 
  ON shop_items FOR DELETE 
  TO authenticated 
  USING (created_by = auth.uid());

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

-- Step 6: Update existing logs to have user_id (set to a default or leave NULL for old data)
-- Note: This will set old logs to NULL - you may want to handle this differently
-- For now, we'll leave them NULL and they won't be visible to anyone (which is safe)

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quest_logs_user_id ON quest_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_logs_user_id ON shop_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
CREATE INDEX IF NOT EXISTS idx_shop_items_created_by ON shop_items(created_by);

