-- Complete User Isolation Fix
-- Run this in Supabase SQL Editor to ensure complete user isolation
-- This prevents users from modifying each other's quests/shop items and ensures all state is per-user

-- Step 1: Ensure all required columns exist
DO $$ 
BEGIN
  -- Add created_by to quests if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quests' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE quests 
    ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add created_by to shop_items if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_items' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE shop_items 
    ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add user_id to quest_logs if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quest_logs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE quest_logs 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to shop_logs if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_logs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE shop_logs 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to goals if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE goals 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to wallets if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE wallets 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Drop ALL existing policies (comprehensive cleanup)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on all relevant tables
  FOR r IN (
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE tablename IN ('quests', 'shop_items', 'quest_logs', 'shop_logs', 'goals', 'wallets', 'user_preferences')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quest_logs_user_id ON quest_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_logs_user_id ON shop_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
CREATE INDEX IF NOT EXISTS idx_shop_items_created_by ON shop_items(created_by);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Step 4: Create RLS policies with STRICT user isolation

-- Quests: Everyone can READ, but only CREATOR can UPDATE/DELETE
-- Seeded quests (created_by IS NULL) are READ-ONLY for all users
CREATE POLICY "Everyone can read quests" 
  ON quests FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own quests" 
  ON quests FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

-- CRITICAL: Only allow updates to quests the user created (NOT seeded quests)
CREATE POLICY "Users can update only their own quests" 
  ON quests FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Only allow deletion of quests the user created
CREATE POLICY "Users can delete only their own quests" 
  ON quests FOR DELETE 
  TO authenticated 
  USING (created_by = auth.uid());

-- Shop Items: Everyone can READ, but only CREATOR can UPDATE/DELETE
-- Seeded items (created_by IS NULL) are READ-ONLY for all users
CREATE POLICY "Everyone can read shop items" 
  ON shop_items FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create their own shop items" 
  ON shop_items FOR INSERT 
  TO authenticated 
  WITH CHECK (created_by = auth.uid());

-- CRITICAL: Only allow updates to shop items the user created (NOT seeded items)
CREATE POLICY "Users can update only their own shop items" 
  ON shop_items FOR UPDATE 
  TO authenticated 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Only allow deletion of shop items the user created
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

-- Step 5: Enable RLS on all tables
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the setup
SELECT 'User isolation setup complete!' as status;

SELECT 
  'quests' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quests' 
    AND policyname = 'Users can update only their own quests'
  ) THEN '✅ Update policy restricts to own quests only' 
  ELSE '❌ Update policy missing or incorrect' END as status
UNION ALL
SELECT 
  'shop_items' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_items' 
    AND policyname = 'Users can update only their own shop items'
  ) THEN '✅ Update policy restricts to own items only' 
  ELSE '❌ Update policy missing or incorrect' END as status;

