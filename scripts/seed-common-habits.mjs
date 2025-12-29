#!/usr/bin/env node
/**
 * Get Kraken - Seed Common Habits (One-Time Setup)
 * 
 * Seeds the database with common habit tracker quests and shop items.
 * This is a ONE-TIME setup - run it once to populate initial starter items.
 * 
 * After seeding:
 * - All users will see these common quests and shop items
 * - Users can add their own custom quests and shop items via the UI
 * - The seed script will skip items that already exist (safe to run multiple times)
 * 
 * All seeded items start with 0 sea dollars and $0.00 dollars.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials.');
  console.error('');
  console.error('Required in .env file:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  VITE_SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Common habit tracker quests
const commonQuests = [
  'Go for a walk',
  'Eat a homecooked meal',
  'Drink 8 glasses of water',
  'Exercise for 30 minutes',
  'Read for 20 minutes',
  'Meditate for 10 minutes',
  'Get 8 hours of sleep',
  'Write in journal',
  'Practice gratitude',
  'Take vitamins',
  'Floss teeth',
  'Stretch for 10 minutes',
  'No social media before noon',
  'Eat 5 servings of fruits/vegetables',
  'Take a break from screens',
  'Call a friend or family member',
  'Do a random act of kindness',
  'Learn something new',
  'Practice a hobby',
  'Spend time in nature',
];

// Common habit tracker shop items (rewards)
const commonShopItems = [
  'Watch a movie',
  'Order takeout',
  'Buy a new book',
  'Get a massage',
  'Go out for coffee',
  'Buy new clothes',
  'Get a haircut',
  'Go to a concert',
  'Buy a video game',
  'Order dessert',
  'Get a manicure/pedicure',
  'Buy flowers',
  'Go to a restaurant',
  'Buy a gadget',
  'Get a subscription service',
  'Go to the movies',
  'Buy art supplies',
  'Get a spa treatment',
  'Order delivery',
  'Buy a treat',
];

async function seedCommonHabits() {
  console.log('🌱 Seeding common habits...\n');
  console.log('Note: This script uses the anon key. Make sure you\'ve run');
  console.log('      supabase-allow-seeding.sql to allow anonymous inserts.\n');

  try {
    // Check existing quests and shop items
    const { data: existingQuests, error: questCheckError } = await supabase
      .from('quests')
      .select('name');

    if (questCheckError) {
      console.error('❌ Error checking existing quests:', questCheckError);
      console.error('   This might be an RLS policy issue. Try using SUPABASE_SERVICE_ROLE_KEY.');
      throw questCheckError;
    }

    const { data: existingShopItems, error: shopCheckError } = await supabase
      .from('shop_items')
      .select('name');

    if (shopCheckError) {
      console.error('❌ Error checking existing shop items:', shopCheckError);
      console.error('   This might be an RLS policy issue. Try using SUPABASE_SERVICE_ROLE_KEY.');
      throw shopCheckError;
    }

    const existingQuestNames = new Set(existingQuests?.map(q => q.name) || []);
    const existingShopItemNames = new Set(existingShopItems?.map(item => item.name) || []);

    const newQuests = commonQuests.filter(name => !existingQuestNames.has(name));
    const newShopItems = commonShopItems.filter(name => !existingShopItemNames.has(name));

    if (newQuests.length === 0 && newShopItems.length === 0) {
      console.log('✅ All common habits already exist in the database!');
      console.log('   No new items to seed. Users can add custom items via the UI.');
      return;
    }

    const now = new Date().toISOString();

    // Insert new quests
    if (newQuests.length > 0) {
      const questsToInsert = newQuests.map((name) => ({
        name,
        tags: [],
        reward: 0,
        dollar_amount: 0,
        completion_count: 0,
        created_at: now,
        updated_at: now,
      }));

      const { data: questData, error: questError } = await supabase
        .from('quests')
        .insert(questsToInsert)
        .select();

      if (questError) {
        console.error('❌ Error seeding quests:', questError);
        console.error('   Error details:', JSON.stringify(questError, null, 2));
        if (questError.code === '42501' || questError.message?.includes('permission') || questError.message?.includes('policy')) {
          console.error('\n   ⚠️  This looks like an RLS policy issue.');
          console.error('   Solution: Use SUPABASE_SERVICE_ROLE_KEY in your .env file');
          console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
        }
        throw questError;
      }

      console.log(`✅ Successfully created ${questData.length} new quests:`);
      questData.forEach((quest, index) => {
        console.log(`   ${index + 1}. ${quest.name}`);
      });
    }

    // Insert new shop items
    if (newShopItems.length > 0) {
      const itemsToInsert = newShopItems.map((name) => ({
        name,
        tags: [],
        price: 0,
        dollar_amount: 0,
        purchase_count: 0,
        created_at: now,
        updated_at: now,
      }));

      const { data: itemData, error: itemError } = await supabase
        .from('shop_items')
        .insert(itemsToInsert)
        .select();

      if (itemError) {
        console.error('❌ Error seeding shop items:', itemError);
        console.error('   Error details:', JSON.stringify(itemError, null, 2));
        if (itemError.code === '42501' || itemError.message?.includes('permission') || itemError.message?.includes('policy')) {
          console.error('\n   ⚠️  This looks like an RLS policy issue.');
          console.error('   Solution: Use SUPABASE_SERVICE_ROLE_KEY in your .env file');
          console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
        }
        throw itemError;
      }

      console.log(`\n✅ Successfully created ${itemData.length} new shop items:`);
      itemData.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name}`);
      });
    }

    if (commonQuests.length - newQuests.length > 0) {
      console.log(`\n⚠️  ${commonQuests.length - newQuests.length} quests were already in the database and skipped.`);
    }

    if (commonShopItems.length - newShopItems.length > 0) {
      console.log(`⚠️  ${commonShopItems.length - newShopItems.length} shop items were already in the database and skipped.`);
    }

    console.log('\n✨ Seeding complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   - Users can now see these starter quests and shop items');
    console.log('   - Users can add their own custom items via the "Add Quest" and "Add Shop Item" cards');
    console.log('   - All seeded items start with 0 sea dollars and $0.00');
    console.log('');
    console.log('💡 Tip: You can run this script again safely - it will skip items that already exist.');
  } catch (error) {
    console.error('❌ Error seeding common habits:', error);
    process.exit(1);
  }
}

seedCommonHabits();

