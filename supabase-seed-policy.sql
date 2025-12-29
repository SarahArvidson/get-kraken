-- Get Kraken - Seed Data Policy
-- Run this SQL in your Supabase SQL editor to allow seeding
-- This allows anonymous users to insert quests and shop items for seeding

-- Option 1: Allow anonymous inserts (less secure, but works for seeding)
-- Uncomment the lines below if you want to allow anonymous inserts:

-- CREATE POLICY "Allow anonymous inserts for seeding" 
--   ON quests FOR INSERT 
--   TO anon 
--   WITH CHECK (true);

-- CREATE POLICY "Allow anonymous inserts for seeding" 
--   ON shop_items FOR INSERT 
--   TO anon 
--   WITH CHECK (true);

-- Option 2: Better approach - Allow all authenticated users to see all quests/shop items
-- This is already in your SUPABASE_SETUP_COMPLETE.sql, but verify these exist:

-- The policies should already allow authenticated users to:
-- - SELECT all quests and shop items
-- - INSERT quests and shop items
-- - UPDATE quests and shop items
-- - DELETE quests and shop items

-- If seeding still doesn't work, the issue might be:
-- 1. The seed script isn't authenticating properly
-- 2. RLS policies aren't set up correctly
-- 3. The data is being inserted but not visible due to filtering

-- To verify your policies, run:
-- SELECT * FROM pg_policies WHERE tablename IN ('quests', 'shop_items');

