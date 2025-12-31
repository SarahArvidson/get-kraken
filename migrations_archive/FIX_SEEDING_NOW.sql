-- Quick Fix for Seeding - Run this in Supabase SQL Editor
-- This will allow the seed script to work

-- Drop any existing policies with similar names
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding quests" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding shop" ON shop_items;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON quests;
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON shop_items;

-- Create new policies with unique names
CREATE POLICY "Allow anonymous inserts for seeding quests" 
  ON quests FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts for seeding shop" 
  ON shop_items FOR INSERT 
  TO anon 
  WITH CHECK (true);

