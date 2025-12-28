/**
 * Utility function to seed initial quests
 * Can be called from browser console or a one-time admin action
 */

import { supabase } from "../lib/supabase";

export const INITIAL_QUESTS = [
  "Study FE for 1 hour",
  "Complete Dry January",
  "Dinner at home",
  "Bike 1 mile outside",
  "Bike 5 miles inside",
  "Sell off a clutter item",
  "Organize the pantry",
  "Clean and organize our tools",
  "Clean and organize our screws, nails, etc.",
  "Declutter our bathroom supplies",
  "Complete a 1 hour gym class",
  "Hike 5 miles",
  "Teach Augie to use his speech buttons",
  "Climb for 1 hour",
  "Kayak class III",
  "Kayak class IV",
  "Finish a Codecademy module",
  "Finish Full Stack Developer course",
  "Pass a Codecademy exam",
  "Pass the FE exam",
  "Give a positive performance review",
  "Exercise together",
  "Lose 5 lbs",
  "Do 25 jumping jacks",
  "Do 5 push ups",
];

export async function seedQuests(): Promise<void> {
  console.log("🌱 Seeding quests...");

  // Check existing quests to avoid duplicates
  const { data: existingQuests } = await supabase
    .from("quests")
    .select("name");

  const existingNames = new Set(existingQuests?.map((q) => q.name) || []);
  const newQuests = INITIAL_QUESTS.filter((name) => !existingNames.has(name));

  if (newQuests.length === 0) {
    console.log("✅ All quests already exist!");
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
    .from("quests")
    .insert(questsToInsert)
    .select();

  if (error) {
    console.error("❌ Error seeding quests:", error);
    throw error;
  }

  console.log(`✅ Successfully created ${data?.length || 0} new quests!`);
  data?.forEach((quest, index) => {
    console.log(`${index + 1}. ${quest.name} (${quest.reward} kibblings)`);
  });

  if (INITIAL_QUESTS.length - newQuests.length > 0) {
    console.log(
      `⚠️  ${INITIAL_QUESTS.length - newQuests.length} quests were already in the database.`
    );
  }
}

