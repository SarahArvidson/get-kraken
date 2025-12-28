# Seed Initial Quests

This document explains how to add the initial 25 quest items to your Kibblings app.

## Option 1: Run the Seed Script

If you have your Supabase credentials in a `.env` file or as environment variables:

```bash
npm run seed:quests
```

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Option 2: Use Browser Console

If the script doesn't work, you can run this in your browser console while on the Kibblings app:

```javascript
const quests = [
  'Study FE for 1 hour',
  'Complete Dry January',
  'Dinner at home',
  'Bike 1 mile outside',
  'Bike 5 miles inside',
  'Sell off a clutter item',
  'Organize the pantry',
  'Clean and organize our tools',
  'Clean and organize our screws, nails, etc.',
  'Declutter our bathroom supplies',
  'Complete a 1 hour gym class',
  'Hike 5 miles',
  'Teach Augie to use his speech buttons',
  'Climb for 1 hour',
  'Kayak class III',
  'Kayak class IV',
  'Finish a Codecademy module',
  'Finish Full Stack Developer course',
  'Pass a Codecademy exam',
  'Pass the FE exam',
  'Give a positive performance review',
  'Exercise together',
  'Lose 5 lbs',
  'Do 25 jumping jacks',
  'Do 5 push ups',
];

// Get the supabase client from the app
const supabase = window.__SUPABASE__ || (await import('./src/lib/supabase.js')).supabase;

const now = new Date().toISOString();
for (const name of quests) {
  await supabase.from('quests').insert({
    name,
    reward: 10,
    photo_url: null,
    completion_count: 0,
    created_at: now,
    updated_at: now,
  });
  console.log(`Created: ${name}`);
}
```

## Quest List

All quests will be created with:
- **Reward**: 10 kibblings (default)
- **Photo**: None (can be added later)
- **Completion Count**: 0

1. Study FE for 1 hour
2. Complete Dry January
3. Dinner at home
4. Bike 1 mile outside
5. Bike 5 miles inside
6. Sell off a clutter item
7. Organize the pantry
8. Clean and organize our tools
9. Clean and organize our screws, nails, etc.
10. Declutter our bathroom supplies
11. Complete a 1 hour gym class
12. Hike 5 miles
13. Teach Augie to use his speech buttons
14. Climb for 1 hour
15. Kayak class III
16. Kayak class IV
17. Finish a Codecademy module
18. Finish Full Stack Developer course
19. Pass a Codecademy exam
20. Pass the FE exam
21. Give a positive performance review
22. Exercise together
23. Lose 5 lbs
24. Do 25 jumping jacks
25. Do 5 push ups

