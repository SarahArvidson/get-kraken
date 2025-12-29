# Seed Script Fix - Making Seeded Items Visible

## Problem

The seed script was using the anon key (unauthenticated), but RLS policies only allow authenticated users to read/write data. This means:
- Seed script couldn't insert data (or data was inserted but not visible)
- Authenticated users couldn't see seeded items

## Solution

The seed script now supports using the **Service Role Key** which bypasses RLS policies. This is the recommended approach for seeding.

## How to Fix

### Option 1: Use Service Role Key (Recommended)

1. Get your Service Role Key from Supabase:
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the `service_role` key (NOT the anon key - this is secret!)

2. Add it to your `.env` file:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run the seed script:
   ```bash
   npm run seed:common
   ```

### Option 2: Update RLS Policies (Alternative)

If you prefer not to use the service role key, you can add a policy that allows unauthenticated inserts for seeding. However, this is less secure and not recommended for production.

Run this SQL in Supabase:
```sql
-- Allow unauthenticated inserts for seeding (less secure)
CREATE POLICY "Allow unauthenticated inserts for seeding" 
  ON quests FOR INSERT 
  TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow unauthenticated inserts for seeding" 
  ON shop_items FOR INSERT 
  TO anon 
  WITH CHECK (true);
```

## Verification

After seeding, check that items are visible:
1. Log into the app
2. Check the Quests tab - you should see seeded quests
3. Check the Shop tab - you should see seeded shop items

If items still don't appear:
- Check browser console for errors
- Verify RLS policies are correct
- Make sure you're logged in (authenticated)

