# Dollar Tracking Implementation Guide

## Overview
This feature allows users to toggle between showing just sea dollars, or showing both sea dollars and real dollar amounts side by side. Dollar amounts are stored in the database and persist when toggled off/on.

## Database Setup

### Step 1: Run SQL Migration
Run `supabase-dollar-tracking-schema.sql` in your Supabase SQL editor. This will:
- Add `dollar_amount` column to `quests` table
- Add `dollar_amount` column to `shop_items` table  
- Add `dollar_total` column to `wallets` table
- Create `user_preferences` table for storing display toggle state
- Set up RLS policies

## Features Implemented

### 1. ✅ Toggle Button in Header
- Small, unobtrusive button in top-right corner
- Shows 💵 On/Off status
- Green when enabled, gray when disabled
- Persists preference in database and localStorage

### 2. ✅ Wallet Display
- Shows: [sea dollar icon] [number] | 💵 [dollar amount]
- Both values same size and balanced
- Dollar amount formatted to 2 decimal places

### 3. ⏳ Quest/Shop Item Cards
- Need to update to show dollar amounts when enabled
- Format: [sea dollar icon] [number] | 💵 [dollar amount]

### 4. ⏳ Add/Edit Forms
- Need to add dollar amount input fields
- Only visible when dollar tracking is enabled
- Stored in database

### 5. ⏳ Wallet Hook Updates
- Need to update wallet total when quests completed/shop items purchased
- Calculate dollar_total based on dollar_amount of items

## Remaining Work

1. Update `QuestCard.tsx` to show dollar amounts
2. Update `ShopItemCard.tsx` to show dollar amounts  
3. Update `AddQuestCard.tsx` to include dollar amount input
4. Update `AddShopItemCard.tsx` to include dollar amount input
5. Update `EditQuestCard.tsx` to include dollar amount input
6. Update `EditShopItemCard.tsx` to include dollar amount input
7. Update `useWallet.ts` to track dollar_total
8. Update `useQuests.ts` to handle dollar_amount
9. Update `useShopItems.ts` to handle dollar_amount
10. Update `GamificationPanel.tsx` to show dollars in goals

## Usage

Once fully implemented:
1. Toggle dollar amounts on/off using the button in header
2. When creating/editing quests, set dollar amount saved per completion
3. When creating/editing shop items, set dollar amount spent per purchase
4. Wallet automatically tracks total dollar amounts
5. All displays show both currencies when enabled

