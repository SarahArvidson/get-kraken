/**
 * Seed initial quests into the database
 * Run with: node scripts/seed-quests.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env');
    const envFile = readFileSync(envPath, 'utf-8');
    const env = {};
    envFile.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    return env;
  } catch (error) {
    // .env file doesn't exist, that's okay
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('   You can set them in .env or as environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

async function seedQuests() {
  console.log('🌱 Seeding quests...\n');

  // Check if quests already exist
  const { data: existingQuests } = await supabase
    .from('quests')
    .select('name');

  const existingNames = new Set(existingQuests?.map(q => q.name) || []);
  const newQuests = quests.filter(name => !existingNames.has(name));

  if (newQuests.length === 0) {
    console.log('✅ All quests already exist in the database!');
    return;
  }

  const now = new Date().toISOString();
  const questsToInsert = newQuests.map((name) => ({
    name,
    reward: 10,
    photo_url: null,
    completion_count: 0,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('quests')
    .insert(questsToInsert)
    .select();

  if (error) {
    console.error('❌ Error seeding quests:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully created ${data.length} new quests!\n`);
  data.forEach((quest, index) => {
    console.log(`${index + 1}. ${quest.name} (${quest.reward} kibblings)`);
  });

  if (quests.length - newQuests.length > 0) {
    console.log(`\n⚠️  ${quests.length - newQuests.length} quests were already in the database and skipped.`);
  }
}

seedQuests()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

