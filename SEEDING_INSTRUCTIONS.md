# Seeding Instructions

## The Problem
The seed script is being blocked by Row Level Security (RLS) policies because it runs as an anonymous user.

## The Solution

### Step 1: Run the SQL Policy
Go to your **Supabase Dashboard → SQL Editor** and run this SQL:

```sql
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
```

Or simply copy and paste the contents of `supabase-allow-seeding.sql` into the SQL editor.

### Step 2: Run the Seed Script
```bash
npm run seed:common
```

### Step 3: Verify
1. Log into your app
2. Check the Quests tab - you should see 20 seeded quests
3. Check the Shop tab - you should see 20 seeded shop items

## After Seeding (Optional)
If you want to remove the anonymous insert policies for better security after seeding:

```sql
DROP POLICY "Allow anonymous inserts for seeding" ON quests;
DROP POLICY "Allow anonymous inserts for seeding" ON shop_items;
```

Note: This will prevent running the seed script again, but users can still add items via the UI (which uses authenticated requests).

