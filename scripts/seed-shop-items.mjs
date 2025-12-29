/**
 * Seed initial shop items into the database
 * Run with: node scripts/seed-shop-items.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env");
    const envFile = readFileSync(envPath, "utf-8");
    const env = {};
    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
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
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
  console.error("   You can set them in .env or as environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const shopItems = [
  "Buy new skis",
  "Buy ski boots",
  "Golf Game- 1 round",
  "Golf Game - 1 tournament",
  "Play a board game",
  "Date night",
  "Buy tickets to Tahoe",
  "Real ball golf",
  "Disc golf",
  "Buy work lunch",
  "Buy ski lift passes",
  "Buy climbing gym punch pass",
  "Go kayaking",
  "Get a new book",
  "Get road bikes",
];

async function seedShopItems() {
  console.log("🌱 Seeding shop items...\n");

  // Check if shop items already exist
  const { data: existingItems } = await supabase
    .from("shop_items")
    .select("name");

  const existingNames = new Set(existingItems?.map((item) => item.name) || []);
  const newItems = shopItems.filter((name) => !existingNames.has(name));

  if (newItems.length === 0) {
    console.log("✅ All shop items already exist in the database!");
    return;
  }

  const now = new Date().toISOString();
  const itemsToInsert = newItems.map((name) => ({
    name,
    price: 10,
    photo_url: null,
    purchase_count: 0,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from("shop_items")
    .insert(itemsToInsert)
    .select();

  if (error) {
    console.error("❌ Error seeding shop items:", error);
    process.exit(1);
  }

  console.log(`✅ Successfully created ${data.length} new shop items!\n`);
  data.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name} (${item.price} kibblings)`);
  });

  if (shopItems.length - newItems.length > 0) {
    console.log(
      `\n⚠️  ${
        shopItems.length - newItems.length
      } shop items were already in the database and skipped.`
    );
  }
}

seedShopItems()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
