-- Direct SQL Insert for Seeding
-- Run this in Supabase SQL Editor to insert the quests and shop items directly
-- This bypasses RLS by running as the database owner

-- Insert common quests (only if they don't exist)
INSERT INTO quests (name, tags, reward, dollar_amount, completion_count, created_at, updated_at)
SELECT * FROM (VALUES
  ('Go for a walk', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Eat a homecooked meal', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Drink 8 glasses of water', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Exercise for 30 minutes', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Read for 20 minutes', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Meditate for 10 minutes', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Get 8 hours of sleep', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Write in journal', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Practice gratitude', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Take vitamins', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Floss teeth', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Stretch for 10 minutes', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('No social media before noon', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Eat 5 servings of fruits/vegetables', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Take a break from screens', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Call a friend or family member', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Do a random act of kindness', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Learn something new', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Practice a hobby', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Spend time in nature', ARRAY[]::text[], 0, 0, 0, NOW(), NOW())
) AS v(name, tags, reward, dollar_amount, completion_count, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE quests.name = v.name);

-- Insert common shop items (only if they don't exist)
INSERT INTO shop_items (name, tags, price, dollar_amount, purchase_count, created_at, updated_at)
SELECT * FROM (VALUES
  ('Watch a movie', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Order takeout', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy a new book', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Get a massage', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Go out for coffee', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy new clothes', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Get a haircut', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Go to a concert', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy a video game', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Order dessert', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Get a manicure/pedicure', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy flowers', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Go to a restaurant', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy a gadget', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Get a subscription service', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Go to the movies', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy art supplies', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Get a spa treatment', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Order delivery', ARRAY[]::text[], 0, 0, 0, NOW(), NOW()),
  ('Buy a treat', ARRAY[]::text[], 0, 0, 0, NOW(), NOW())
) AS v(name, tags, price, dollar_amount, purchase_count, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM shop_items WHERE shop_items.name = v.name);

-- Verify what was inserted
SELECT 'Quests inserted:' as info, COUNT(*) as count FROM quests;
SELECT 'Shop items inserted:' as info, COUNT(*) as count FROM shop_items;

