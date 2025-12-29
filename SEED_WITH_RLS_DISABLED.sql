-- Temporary Disable RLS for Seeding
-- Run this, then run: npm run seed:common
-- Then run RE_ENABLE_RLS.sql to re-enable security

-- Disable RLS temporarily
ALTER TABLE quests DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('quests', 'shop_items');

