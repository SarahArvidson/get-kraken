# Stale Closures and Realtime Scoping - Fix Summary

## Overview
Removed stale closures in realtime subscription handlers and scoped realtime channels to eliminate invisible background load from other users' data.

## src/hooks/useQuests.ts

### Stale Closures Removed
**Before:** Subscription handlers were defined inside `useEffect` with empty dependency array `[]`, capturing stale versions of:
- `mergeQuestWithOverrides` - would use old override state
- `isQuestHidden` - would use old hidden quest IDs set

**After:** 
- Moved subscription handlers into `useEffect` with full dependency array: `[loadQuests, mergeQuestWithOverrides, isQuestHidden]`
- Handlers are recreated when dependencies change, ensuring they always use current closures
- Handler function `handleQuestChange` is defined inside `setupSubscriptions` async function, which runs on every effect run

**Why No Extra Renders:**
- `mergeQuestWithOverrides` and `isQuestHidden` are stable callbacks from `useQuestOverrides` hook
- They only change when override state actually changes (which should trigger subscription update anyway)
- Effect only re-runs when these dependencies change, which is correct behavior
- Subscriptions are properly cleaned up and recreated, preventing duplicate subscriptions

### Channel Filters Added
**Before:** Single subscription to `"quests"` table with no filter, receiving ALL quest changes from ALL users

**After:** Two scoped subscriptions with channel-level filters:
1. **Seeded quests:** `supabase.subscribe("quests", handleQuestChange, "created_by=is.null")`
   - Only receives events for quests where `created_by IS NULL`
   - Channel filter at database level, not client filtering

2. **User's quests:** `supabase.subscribe("quests", handleQuestChange, "created_by=eq.${user.id}")`
   - Only receives events for quests where `created_by = current_user_id`
   - Channel filter at database level, not client filtering

**Why No Extra Renders:**
- Database filters events before sending to client
- Client never receives events for other users' quests
- No background processing of irrelevant events
- No state updates from other users' data

---

## src/hooks/useShopItems.ts

### Stale Closures Removed
**Before:** Subscription handlers were defined inside `useEffect` with empty dependency array `[]`, capturing stale versions of:
- `mergeItemWithOverrides` - would use old override state
- `isItemHidden` - would use old hidden item IDs set

**After:**
- Moved subscription handlers into `useEffect` with full dependency array: `[loadShopItems, mergeItemWithOverrides, isItemHidden]`
- Handlers are recreated when dependencies change, ensuring they always use current closures
- Handler function `handleShopItemChange` is defined inside `setupSubscriptions` async function, which runs on every effect run

**Why No Extra Renders:**
- `mergeItemWithOverrides` and `isItemHidden` are stable callbacks from `useShopItemOverrides` hook
- They only change when override state actually changes (which should trigger subscription update anyway)
- Effect only re-runs when these dependencies change, which is correct behavior
- Subscriptions are properly cleaned up and recreated, preventing duplicate subscriptions

### Channel Filters Added
**Before:** Single subscription to `"shop_items"` table with no filter, receiving ALL shop item changes from ALL users

**After:** Two scoped subscriptions with channel-level filters:
1. **Seeded shop items:** `supabase.subscribe("shop_items", handleShopItemChange, "created_by=is.null")`
   - Only receives events for items where `created_by IS NULL`
   - Channel filter at database level, not client filtering

2. **User's shop items:** `supabase.subscribe("shop_items", handleShopItemChange, "created_by=eq.${user.id}")`
   - Only receives events for items where `created_by = current_user_id`
   - Channel filter at database level, not client filtering

**Why No Extra Renders:**
- Database filters events before sending to client
- Client never receives events for other users' shop items
- No background processing of irrelevant events
- No state updates from other users' data

---

## Summary

### Stale Closures Removed
- **useQuests.ts:** `mergeQuestWithOverrides`, `isQuestHidden` now always current
- **useShopItems.ts:** `mergeItemWithOverrides`, `isItemHidden` now always current
- **Dependency arrays:** Changed from `[]` to full arrays with all used dependencies

### Channel Filters Added
- **Quests:** 2 subscriptions (seeded + user) with `created_by=is.null` and `created_by=eq.${user.id}` filters
- **Shop Items:** 2 subscriptions (seeded + user) with `created_by=is.null` and `created_by=eq.${user.id}` filters
- **Filter level:** Database channel filters, not client-side filtering

### Why No Extra Renders
1. **Stale closures fixed:** Handlers always use current merge/hidden functions, preventing incorrect filtering/merging
2. **Channel scoping:** Database filters events before transmission, eliminating irrelevant events entirely
3. **Proper cleanup:** Subscriptions are cleaned up and recreated when dependencies change, preventing duplicate handlers
4. **Stable dependencies:** Merge and hidden functions are stable callbacks that only change when override state changes (correct behavior)

**Result:** Zero stale closure bugs, zero background processing of other users' data, zero unnecessary renders from irrelevant realtime events.

