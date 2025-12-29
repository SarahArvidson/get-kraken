-- Re-enable RLS after seeding
-- Run this AFTER running npm run seed:common

-- Re-enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Recreate the authenticated user policies
DROP POLICY IF EXISTS "Allow all for authenticated users on quests" ON quests;
DROP POLICY IF EXISTS "Allow all for authenticated users on shop_items" ON shop_items;

CREATE POLICY "Allow all for authenticated users on quests" 
  ON quests FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on shop_items" 
  ON shop_items FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Verify RLS is enabled and policies exist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('quests', 'shop_items');

SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('quests', 'shop_items');

