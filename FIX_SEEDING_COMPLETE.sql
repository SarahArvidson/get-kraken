-- Complete Fix for Seeding - Run this ONCE in Supabase SQL Editor
-- This will properly set up policies to allow seeding

-- Step 1: Drop ALL existing policies on quests and shop_items
-- (We'll recreate the necessary ones below)
DROP POLICY IF EXISTS "Allow all for authenticated users on quests" ON quests;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_items" ON shop_items;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding quests" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding shop" ON shop_items;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON shop_items;
DROP POLICY IF EXISTS "Allow all on quests" ON quests;
DROP POLICY IF EXISTS "Allow all on shop_items" ON shop_items;

-- Step 2: Create policies that allow BOTH authenticated users AND anonymous inserts
-- This way authenticated users can do everything, and anonymous can insert for seeding

-- Quests: Allow authenticated users to do everything
CREATE POLICY "Allow all for authenticated users on quests" 
  ON quests FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Quests: Allow anonymous users to INSERT (for seeding)
CREATE POLICY "Allow anonymous inserts for seeding quests" 
  ON quests FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Shop Items: Allow authenticated users to do everything
CREATE POLICY "Allow all for authenticated users on shop_items" 
  ON shop_items FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Shop Items: Allow anonymous users to INSERT (for seeding)
CREATE POLICY "Allow anonymous inserts for seeding shop" 
  ON shop_items FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Verify the policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('quests', 'shop_items')
ORDER BY tablename, policyname;

