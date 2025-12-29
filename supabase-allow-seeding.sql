-- Get Kraken - Allow Seeding
-- Run this SQL in your Supabase SQL editor to allow the seed script to work
-- This temporarily allows anonymous users to insert quests and shop items

-- Allow anonymous users to insert quests (for seeding only)
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON quests;
CREATE POLICY "Allow anonymous inserts for seeding" 
  ON quests FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Allow anonymous users to insert shop items (for seeding only)
DROP POLICY IF EXISTS "Allow anonymous inserts for seeding" ON shop_items;
CREATE POLICY "Allow anonymous inserts for seeding" 
  ON shop_items FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Note: After seeding, you can remove these policies if you want stricter security:
-- DROP POLICY "Allow anonymous inserts for seeding" ON quests;
-- DROP POLICY "Allow anonymous inserts for seeding" ON shop_items;

