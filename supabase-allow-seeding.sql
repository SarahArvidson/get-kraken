-- Get Kraken - Allow Seeding
-- Run this SQL in your Supabase SQL editor to allow the seed script to work
-- This temporarily allows anonymous users to insert quests and shop items

-- First, check existing policies (optional - for debugging)
-- SELECT * FROM pg_policies WHERE tablename IN ('quests', 'shop_items');

-- Drop any existing anonymous insert policies
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding quests" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding shop" ON shop_items;

-- Allow anonymous users to insert quests (for seeding only)
CREATE POLICY "Allow anonymous inserts for seeding quests" 
  ON quests FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Allow anonymous users to insert shop items (for seeding only)
CREATE POLICY "Allow anonymous inserts for seeding shop" 
  ON shop_items FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Verify the policies were created:
-- SELECT * FROM pg_policies WHERE tablename IN ('quests', 'shop_items') AND policyname LIKE '%seeding%';

-- Note: After seeding, you can remove these policies if you want stricter security:
-- DROP POLICY "Allow anonymous inserts for seeding quests" ON quests;
-- DROP POLICY "Allow anonymous inserts for seeding shop" ON shop_items;

