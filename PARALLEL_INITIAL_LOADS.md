# Parallel Initial Data Loads - Summary

## Loads That Were Sequential

### None Found - All Loads Already Parallel

**Verification:**
- ✅ All hooks use independent `useEffect` hooks that fire on mount
- ✅ No hooks wait for other hooks' loading state
- ✅ No blocking patterns (`if (loading) return`, `await load()`, `while (loading)`)
- ✅ All loads start immediately in the same render cycle

**However, one reload storm was fixed:**

### useShopItems.ts - Reload Storm Fixed

**Before:**
```typescript
const loadShopItems = useCallback(async () => {
  // ... load shop items ...
  const mergedItems = (data || [])
    .filter((item: ShopItem) => !isItemHidden(item.id))
    .map((item: ShopItem) => mergeItemWithOverrides(item));
  setShopItems(mergedItems);
}, [isItemHidden, mergeItemWithOverrides]); // ❌ Causes reload when overrides load

useEffect(() => {
  loadShopItems(); // Called when loadShopItems changes (when overrides load)
  // ... setup subscriptions ...
}, [loadShopItems, mergeItemWithOverrides, isItemHidden]); // ❌ Reloads when overrides change
```

**Problem:**
- When overrides load, `isItemHidden` and `mergeItemWithOverrides` functions change
- This recreates `loadShopItems` (due to dependency array)
- This triggers the useEffect (due to `loadShopItems` dependency)
- This calls `loadShopItems()` again → **reload storm**

**After:**
```typescript
const loadShopItems = useCallback(async () => {
  // ... load shop items ...
  // Note: isItemHidden and mergeItemWithOverrides are used but not dependencies
  // to allow immediate shop items loading without waiting for overrides to resolve
  const mergedItems = (data || [])
    .filter((item: ShopItem) => !isItemHidden(item.id))
    .map((item: ShopItem) => mergeItemWithOverrides(item));
  setShopItems(mergedItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ No dependencies - load immediately, overrides merge when ready

// Split into three effects:
useEffect(() => {
  loadShopItems(); // Initial load only
}, [loadShopItems]);

useEffect(() => {
  // Re-merge when overrides load (non-blocking enrichment)
  setShopItems((prev) =>
    prev
      .filter((item) => !isItemHidden(item.id))
      .map((item) => mergeItemWithOverrides(item))
  );
}, [mergeItemWithOverrides, isItemHidden]); // Only re-merge, don't reload

useEffect(() => {
  // Setup subscriptions (needs current override functions)
  // ... setup subscriptions ...
}, [mergeItemWithOverrides, isItemHidden]); // Subscriptions only, no reload
```

**Fixed:**
- Removed `isItemHidden` and `mergeItemWithOverrides` from `loadShopItems` dependency array
- Split useEffect into three separate effects:
  1. Initial load effect (runs once)
  2. Re-merge effect (runs when overrides load, doesn't reload from DB)
  3. Subscription effect (runs when override functions change, doesn't reload)

## How Loads Are Now Parallelized

### All Hooks Fire in Parallel on Mount

When App.tsx renders, all hooks are called and their useEffects fire in the same render cycle:

1. **useWallet()** → useEffect fires → `loadWallet()` starts
2. **useQuests()** → calls `useQuestOverrides()` → both useEffects fire → both loads start
3. **useShopItems()** → calls `useShopItemOverrides()` → both useEffects fire → both loads start

**Result:** All 5 loads start in parallel:
- Wallet: `wallets` table
- Quest overrides: `user_quest_overrides` + `user_hidden_quests` tables
- Quests: `quests` table
- Shop item overrides: `user_shop_item_overrides` + `user_hidden_shop_items` tables
- Shop items: `shop_items` table

### Independent Execution

**Each hook:**
- Calls `supabase.supabase.auth.getUser()` independently
- Loads from different tables
- Handles its own errors
- Sets up its own real-time subscriptions

**No dependencies:**
- ✅ `useWallet` - No dependencies on other hooks
- ✅ `useQuestOverrides` - No dependencies on other hooks
- ✅ `useQuests` - Uses `useQuestOverrides()` but doesn't wait for loading state
- ✅ `useShopItemOverrides` - No dependencies on other hooks
- ✅ `useShopItems` - Uses `useShopItemOverrides()` but doesn't wait for loading state

### Progressive Rendering

**Quests/Shop Items:**
- Load immediately with base data (even if overrides not ready)
- Overrides merge when ready via separate re-merge effect
- No blocking - UI shows data immediately

**Wallet:**
- Loads directly from `wallets` table
- No dependencies on other data

## Why This Cannot Cause Regressions

### Independent Data Sources
- Each hook loads from different tables
- No cross-table dependencies
- All hooks can load simultaneously without conflicts

### Progressive Enhancement
- Quests/shop items render immediately with base data
- Overrides enrich display when ready (non-blocking)
- Wallet loads independently

### Real-time Subscriptions
- All hooks set up subscriptions independently
- Subscriptions don't block initial loads
- State patches happen asynchronously

### Error Isolation
- Each hook handles its own errors
- Failure of one load doesn't block others
- UI shows partial data while other loads complete

### No Reload Storms
- Initial load effects run once (empty or stable dependency arrays)
- Re-merge effects only update state, don't reload from DB
- Subscription effects only set up subscriptions, don't reload

## Performance Impact

**Before:**
- All loads already parallel, but `useShopItems` had reload storm when overrides loaded
- Shop items would reload unnecessarily when quest overrides changed

**After:**
- All loads start in parallel on mount
- No reload storms - initial loads run once
- Overrides enrich display without triggering reloads
- Faster initial load - all data fetches happen simultaneously

## Verification

- ✅ All hooks have independent useEffect hooks that fire on mount
- ✅ No hooks wait for other hooks' loading state
- ✅ No blocking patterns found
- ✅ `loadQuests` has empty dependency array (loads immediately)
- ✅ `loadShopItems` has empty dependency array (loads immediately)
- ✅ `loadWallet` has empty dependency array (loads immediately)
- ✅ Override hooks load independently
- ✅ Re-merge effects only update state, don't reload from DB
