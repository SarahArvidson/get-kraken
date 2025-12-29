# Troubleshooting Seed Script

## If you're still getting RLS errors after running the SQL:

### Step 1: Check Current Policies
Run `check-rls-policies.sql` in Supabase SQL Editor to see what policies exist.

### Step 2: Make Sure RLS is Enabled
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('quests', 'shop_items');
```

### Step 3: Run the Updated Seeding SQL
The policy names have been updated to avoid conflicts. Run `supabase-allow-seeding.sql` again.

### Step 4: Alternative - Temporarily Disable RLS (Not Recommended for Production)
If the policies still don't work, you can temporarily disable RLS:

```sql
-- TEMPORARILY disable RLS (only for seeding)
ALTER TABLE quests DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items DISABLE ROW LEVEL SECURITY;

-- Run your seed script here: npm run seed:common

-- Then re-enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
```

### Step 5: Verify Policies Were Created
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('quests', 'shop_items') 
AND policyname LIKE '%seeding%';
```

You should see two policies:
- "Allow anonymous inserts for seeding quests"
- "Allow anonymous inserts for seeding shop"

