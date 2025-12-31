-- COMPLETE User Isolation Fix - Run this to fix all user isolation issues
-- This script aggressively drops ALL conflicting policies and creates correct ones
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL existing policies on quests and shop_items (by name, to be thorough)
-- This includes all the problematic policies that allow all users to see everything

DROP POLICY IF EXISTS "Allow all on quests" ON quests;
DROP POLICY IF EXISTS "Allow all for authenticated users on quests" ON quests;
DROP POLICY IF EXISTS "Everyone can read quests" ON quests;
DROP POLICY IF EXISTS "Users can read all quests" ON quests;
DROP POLICY IF EXISTS "Users can read seeded and own quests" ON quests;
DROP POLICY IF EXISTS "Users can create their own quests" ON quests;
DROP POLICY IF EXISTS "Users can update only their own quests" ON quests;
DROP POLICY IF EXISTS "Users can update their own quests or seeded quests" ON quests;
DROP POLICY IF EXISTS "Users can delete their own quests" ON quests;
DROP POLICY IF EXISTS "Users can delete only their own quests" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding quests" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON quests;

DROP POLICY IF EXISTS "Allow all on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Everyone can read shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can read all shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can read seeded and own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can create their own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can update only their own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can update their own shop items or seeded items" ON shop_items;
DROP POLICY IF EXISTS "Users can delete their own shop items" ON shop_items;
DROP POLICY IF EXISTS "Users can delete only their own shop items" ON shop_items;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding shop_items" ON shop_items;

-- Step 2: Use a DO block to drop ALL remaining policies (catch-all)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Drop all policies on quests
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'quests'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON quests', r.policyname);
  END LOOP;
  
  -- Drop all policies on shop_items
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'shop_items'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON shop_items', r.policyname);
  END LOOP;
END $$;

-- Step 3: Create CORRECT restrictive policies for quests
-- Users can ONLY read seeded quests (created_by IS NULL) OR their own quests
CREATE POLICY "Users can read seeded and own quests ONLY" 
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

-- Step 4: Create CORRECT restrictive policies for shop_items
-- Users can ONLY read seeded items (created_by IS NULL) OR their own items
CREATE POLICY "Users can read seeded and own shop items ONLY" 
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

-- Step 5: Ensure RLS is enabled
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies 
WHERE tablename IN ('quests', 'shop_items')
ORDER BY tablename, policyname;

-- Step 7: Test query to verify isolation (this should only return seeded + own quests)
-- Uncomment to test:
-- SELECT 
--   id,
--   name,
--   created_by,
--   CASE 
--     WHEN created_by IS NULL THEN 'Seeded'
--     WHEN created_by = auth.uid() THEN 'Own'
--     ELSE 'Other User'
--   END as quest_type
-- FROM quests
-- ORDER BY quest_type, name;

SELECT 'User isolation fix complete! Users can now only see seeded quests/items and their own.' as status;

