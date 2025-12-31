-- Comprehensive Fix for Quest Completion Issues
-- Run this in Supabase SQL Editor to fix all quest completion problems

-- Step 1: Ensure user_id columns exist (with proper constraints)
DO $$ 
BEGIN
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

  -- Add user_id to goals if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE goals 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Drop ALL existing policies (comprehensive cleanup)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on quest_logs
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quest_logs') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON quest_logs', r.policyname);
  END LOOP;
  
  -- Drop all policies on shop_logs
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'shop_logs') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON shop_logs', r.policyname);
  END LOOP;
  
  -- Drop all policies on quests
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quests') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON quests', r.policyname);
  END LOOP;
  
  -- Drop all policies on shop_items
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'shop_items') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON shop_items', r.policyname);
  END LOOP;
  
  -- Drop all policies on goals
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'goals') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON goals', r.policyname);
  END LOOP;
  
  -- Drop all policies on wallets
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'wallets') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON wallets', r.policyname);
  END LOOP;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quest_logs_user_id ON quest_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_logs_user_id ON shop_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_created_by ON quests(created_by);
CREATE INDEX IF NOT EXISTS idx_shop_items_created_by ON shop_items(created_by);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Step 4: Create RLS policies for quest_logs
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

-- Step 5: Create RLS policies for shop_logs
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

-- Step 6: Create RLS policies for quests
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

-- Step 7: Create RLS policies for shop_items
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

-- Step 8: Create RLS policies for goals
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

-- Step 9: Create RLS policies for wallets (per-user wallets)
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

-- Step 10: Verify the setup
SELECT 'Setup complete! Check the results below:' as status;

SELECT 
  'quest_logs' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quest_logs' AND column_name = 'user_id'
  ) THEN '✅ user_id column exists' ELSE '❌ user_id column missing' END as status
UNION ALL
SELECT 
  'shop_logs' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_logs' AND column_name = 'user_id'
  ) THEN '✅ user_id column exists' ELSE '❌ user_id column missing' END as status
UNION ALL
SELECT 
  'quest_logs policies' as table_name,
  CASE WHEN COUNT(*) >= 3 THEN '✅ Policies exist' ELSE '❌ Policies missing' END as status
FROM pg_policies WHERE tablename = 'quest_logs';

