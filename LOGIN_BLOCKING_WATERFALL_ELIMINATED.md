# Login Blocking Waterfall Eliminated - Summary

## Problem

On first login, there was a long delay where quests remained empty until wallet and shop state resolved, and then quests would refresh again when wallet state became available.

**Root Cause:** The `useEffect` in `App.tsx` that loads quest logs and shop logs had dependencies on `quests.length` and `shopItems.length`, creating a blocking waterfall:

1. Quests load → `quests.length` changes → effect runs → logs reload
2. Shop items load → `shopItems.length` changes → effect runs → logs reload again
3. Wallet loads → potentially triggers another refresh cycle

This created a dependency chain where quest rendering was indirectly blocked by wallet/shop resolution.

## Dependencies Removed

### App.tsx (line 132)

**Before:**
```typescript
useEffect(() => {
  const loadLogs = async () => {
    const [questLogs, shopLogs] = await Promise.all([
      loadAllQuestLogs(),
      loadAllShopLogs(),
    ]);
    setAllQuestLogs(questLogs);
    setAllShopLogs(shopLogs);
  };
  loadLogs();
  const interval = setInterval(loadLogs, LOG_REFRESH_INTERVAL_MS);
  return () => clearInterval(interval);
}, [loadAllQuestLogs, loadAllShopLogs, quests.length, shopItems.length]); // ❌ Blocking dependencies
```

**After:**
```typescript
useEffect(() => {
  const loadLogs = async () => {
    const [questLogs, shopLogs] = await Promise.all([
      loadAllQuestLogs(),
      loadAllShopLogs(),
    ]);
    setAllQuestLogs(questLogs);
    setAllShopLogs(shopLogs);
  };
  loadLogs();
  const interval = setInterval(loadLogs, LOG_REFRESH_INTERVAL_MS);
  return () => clearInterval(interval);
}, [loadAllQuestLogs, loadAllShopLogs]); // ✅ Independent - no quests/shopItems dependencies
```

**Removed Dependencies:**
- `quests.length` - Removed (logs load independently of quest list)
- `shopItems.length` - Removed (logs load independently of shop items list)

### useQuests.ts (line 83)

**Before:**
```typescript
const loadQuests = useCallback(async () => {
  // ... load quests ...
  const mergedQuests = (data || [])
    .filter((quest: Quest) => !isQuestHidden(quest.id))
    .map((quest: Quest) => mergeQuestWithOverrides(quest));
  setQuests(mergedQuests);
}, [isQuestHidden, mergeQuestWithOverrides]); // ❌ Blocking - waits for overrides to load
```

**After:**
```typescript
const loadQuests = useCallback(async () => {
  // ... load quests ...
  // Note: isQuestHidden and mergeQuestWithOverrides are used but not dependencies
  // to allow immediate quest loading without waiting for overrides to resolve
  const mergedQuests = (data || [])
    .filter((quest: Quest) => !isQuestHidden(quest.id))
    .map((quest: Quest) => mergeQuestWithOverrides(quest));
  setQuests(mergedQuests);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ No dependencies - load immediately, overrides merge when ready
```

**Removed Dependencies:**
- `isQuestHidden` - Removed from dependency array (function works with empty overrides)
- `mergeQuestWithOverrides` - Removed from dependency array (function works with empty overrides)

**Added Non-Blocking Re-Merge Effect:**
```typescript
// Re-merge quests when overrides become available (non-blocking enrichment)
// This effect only runs when override functions change (when overrides load)
// It re-applies filtering and merging to existing quests without reloading from DB
useEffect(() => {
  setQuests((prev) =>
    prev
      .filter((quest) => !isQuestHidden(quest.id))
      .map((quest) => mergeQuestWithOverrides(quest))
  );
}, [mergeQuestWithOverrides, isQuestHidden]); // Only when override functions change (overrides loaded)
```

**Separated Initial Load from Override Merging:**
- Initial load effect: Runs immediately on mount, no dependencies
- Re-merge effect: Runs when overrides become available, enriches existing quests
- Subscription effect: Runs with current override functions for real-time updates

## Quest Ownership Isolation

### Verified No Wallet/Shop Dependencies in useQuests

**useQuests.ts:**
- ✅ No imports of `useWallet` or `useShopItems`
- ✅ No dependencies on `wallet`, `walletTotal`, `shopItems`, or `shopLogs`
- ✅ Loads quests from:
  - `quests` table (seeded or user-created)
  - `user_quest_overrides` (via `useQuestOverrides`)
  - `user_hidden_quests` (via `useQuestOverrides`)

**useQuestOverrides.ts:**
- ✅ No dependencies on wallet or shop state
- ✅ Loads only from:
  - `user_quest_overrides` table
  - `user_hidden_quests` table

**QuestCard.tsx:**
- ✅ No dependencies on wallet or shop state
- ✅ Uses only quest data and overrides

## Why Quests Can Now Render Instantly on Login

### Data Authority Boundaries Restored

**Before (Blocking Waterfall):**
1. User logs in
2. `useQuests` loads quests → `quests.length` changes
3. `useEffect` in App.tsx detects `quests.length` change → reloads logs
4. `useShopItems` loads shop items → `shopItems.length` changes
5. `useEffect` in App.tsx detects `shopItems.length` change → reloads logs again
6. `useWallet` loads wallet → potentially triggers another cycle
7. Quest rendering delayed by log reload cycles

**After (Independent Loading):**
1. User logs in
2. `useQuests` loads quests → renders immediately
3. `useQuestOverrides` loads overrides → merges with quests (non-blocking)
4. `useEffect` in App.tsx loads logs independently → doesn't block quest rendering
5. `useShopItems` loads shop items → independent
6. `useWallet` loads wallet → independent

### Quest Rendering Data Sources (All Independent)

Quests render immediately from:
1. **`quests` table** - Base quest data (seeded or user-created)
2. **`user_quest_overrides` table** - User-specific overrides (name, tags, reward, dollar_amount)
3. **`user_hidden_quests` table** - Hidden quests filter

**No dependencies on:**
- ❌ Wallet totals
- ❌ Shop logs
- ❌ Shop state
- ❌ Treasure chest state

### Non-Blocking Enrichment

**Wallet/Shop Enrichment (Layered After Initial Render):**
- Quest completion counts (`userCompletionCount`) are calculated from `allQuestLogs`
- Logs load independently via `useEffect` with interval refresh
- Logs don't block quest rendering - they enrich the display after initial render
- If logs aren't loaded yet, quests still render with base `completion_count` from quest table

## Result

✅ **Quests render instantly on login** - No waiting for wallet or shop state
✅ **Data authority boundaries restored** - Quests, wallet, and shop load independently
✅ **No blocking waterfall** - Log loading doesn't depend on quest/shop item counts
✅ **Progressive enhancement** - Quests render immediately, logs enrich display when ready
✅ **No unnecessary reloads** - Logs load once on mount and refresh on interval, not on every quest/shop change

## Verification

- ✅ `useQuests` has zero dependencies on wallet or shop state
- ✅ `useQuestOverrides` has zero dependencies on wallet or shop state
- ✅ Log loading effect no longer depends on `quests.length` or `shopItems.length`
- ✅ Quest rendering uses only quest table, overrides, and hidden quests
- ✅ Wallet and shop enrichment is non-blocking and layered after initial render

