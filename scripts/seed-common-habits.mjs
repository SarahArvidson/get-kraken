#!/usr/bin/env node
/**
 * Get Kraken - Seed Common Habits
 * 
 * Seeds the database with common habit tracker quests and shop items
 * All items start with 0 sea dollars and 0 dollars
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
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  try {
    // Check existing quests and shop items
    const { data: existingQuests } = await supabase
      .from('quests')
      .select('name');

    const { data: existingShopItems } = await supabase
      .from('shop_items')
      .select('name');

    const existingQuestNames = new Set(existingQuests?.map(q => q.name) || []);
    const existingShopItemNames = new Set(existingShopItems?.map(item => item.name) || []);

    const newQuests = commonQuests.filter(name => !existingQuestNames.has(name));
    const newShopItems = commonShopItems.filter(name => !existingShopItemNames.has(name));

    if (newQuests.length === 0 && newShopItems.length === 0) {
      console.log('✅ All common habits already exist in the database!');
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

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Error seeding common habits:', error);
    process.exit(1);
  }
}

seedCommonHabits();

