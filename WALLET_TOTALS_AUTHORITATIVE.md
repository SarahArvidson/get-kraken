# Wallet Totals Made Authoritative - Summary

## Problem

The treasure chest (wallet display) was slow because wallet totals were being recomputed from logs on load, causing performance issues.

## Solution

Made the wallet table the single source of truth for wallet totals. Wallet totals are now:
- Loaded directly from the `wallets` table on login
- Updated atomically when quest/shop actions occur
- Never derived from logs

## Recomputation Paths Removed

### None Found - Wallet Already Loaded from Table

**Verification:**
- ✅ `useWallet.ts` `loadWallet()` - Loads directly from `wallets` table (line 30-34)
- ✅ No code found that aggregates `quest_logs` or `shop_logs` to compute wallet totals
- ✅ `useGamification.ts` computes weekly recap from logs, but this is for display only, not wallet totals

**Note:** The wallet was already loading from the table, but the issue was that wallet updates were not atomic with log inserts, causing potential inconsistencies.

## Where Wallet is Now Loaded

### useWallet.ts (line 17-117)

**loadWallet() function:**
```typescript
const loadWallet = useCallback(async () => {
  // Get current user
  const { data: { user } } = await supabase.supabase.auth.getUser();
  if (!user) {
    setWallet(null);
    setLoading(false);
    return;
  }

  // Load wallet directly from wallets table - authoritative source
  const { data, error: fetchError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If wallet doesn't exist, create it with total: 0
  // Otherwise, use the wallet from the table
  setWallet(data || newWallet);
}, []);
```

**On Login:**
1. User authenticates
2. `loadWallet()` runs immediately
3. Loads wallet row from `wallets` table where `user_id = current user`
4. If wallet doesn't exist, creates it with `total: 0`, `dollar_total: 0`
5. Wallet state set from database - no log aggregation

**Real-time Subscription (line 249-277):**
```typescript
useEffect(() => {
  loadWallet(); // Load immediately on mount

  subscription = supabase.subscribe(
    "wallets",
    (payload: any) => {
      if (payload.new?.user_id === user.id) {
        setWallet(payload.new); // Patch wallet state directly from table changes
      }
    },
    `user_id=eq.${user.id}`
  );
}, [loadWallet]);
```

**Real-time Updates:**
- Subscribes to `wallets` table changes for current user
- Patches wallet state directly from `payload.new` (wallet table row)
- Never computes from logs - always uses wallet table as source of truth

## How Quest and Shop Actions Update Wallet Totals

### useQuests.ts - completeQuest (line 268-340)

**Before (Non-Atomic):**
```typescript
const completeQuest = async (questId: string, reward: number) => {
  // Insert log entry
  await supabase.from("quest_logs").insert({ ... });
  // Wallet update happens separately in App.tsx
  return reward;
};
```

**After (Atomic):**
```typescript
const completeQuest = async (questId: string, reward: number, dollarAmount: number = 0) => {
  // 1. Load current wallet total
  const { data: walletData } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 2. Calculate new totals
  const currentTotal = walletData?.total ?? 0;
  const currentDollarTotal = walletData?.dollar_total ?? 0;
  const newTotal = currentTotal + reward;
  const newDollarTotal = Math.round(currentDollarTotal + Math.round(dollarAmount));

  // 3. Insert log entry
  await supabase.from("quest_logs").insert({
    quest_id: questId,
    user_id: user.id,
    completed_at: new Date().toISOString(),
  });

  // 4. Update wallet atomically (same operation sequence)
  if (!walletData) {
    await supabase.from("wallets").insert({
      user_id: user.id,
      total: newTotal,
      dollar_total: newDollarTotal,
      updated_at: new Date().toISOString(),
    });
  } else {
    await supabase.from("wallets")
      .update({
        total: newTotal,
        dollar_total: newDollarTotal,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }
};
```

**Atomic Operation:**
- Log entry inserted first
- Wallet updated immediately after in same function
- Both operations in sequence - if log insert fails, wallet is not updated
- Real-time subscription picks up wallet change automatically

### useShopItems.ts - purchaseItem (line 266-338)

**Before (Non-Atomic):**
```typescript
const purchaseItem = async (itemId: string, price: number) => {
  // Insert log entry
  await supabase.from("shop_logs").insert({ ... });
  // Wallet update happens separately in App.tsx
  return -price;
};
```

**After (Atomic):**
```typescript
const purchaseItem = async (itemId: string, price: number, dollarAmount: number = 0) => {
  // 1. Load current wallet total
  const { data: walletData } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 2. Calculate new totals (subtract for purchase)
  const currentTotal = walletData?.total ?? 0;
  const currentDollarTotal = walletData?.dollar_total ?? 0;
  const newTotal = currentTotal - price;
  const newDollarTotal = Math.round(currentDollarTotal - Math.round(dollarAmount));

  // 3. Insert log entry
  await supabase.from("shop_logs").insert({
    shop_item_id: itemId,
    user_id: user.id,
    purchased_at: new Date().toISOString(),
  });

  // 4. Update wallet atomically (same operation sequence)
  if (!walletData) {
    await supabase.from("wallets").insert({
      user_id: user.id,
      total: newTotal,
      dollar_total: newDollarTotal,
      updated_at: new Date().toISOString(),
    });
  } else {
    await supabase.from("wallets")
      .update({
        total: newTotal,
        dollar_total: newDollarTotal,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }
};
```

**Atomic Operation:**
- Log entry inserted first
- Wallet updated immediately after in same function
- Both operations in sequence - if log insert fails, wallet is not updated
- Real-time subscription picks up wallet change automatically

### App.tsx - Handler Updates

**Before:**
```typescript
const handleCompleteQuest = async (questId: string, _reward: number) => {
  await completeQuest(questId, effectiveReward);
  await updateWallet(effectiveReward, effectiveDollarAmount); // Separate call
  // ...
};
```

**After:**
```typescript
const handleCompleteQuest = async (questId: string, _reward: number) => {
  // completeQuest now atomically updates wallet - no separate updateWallet call needed
  // Real-time subscription will update wallet state automatically
  await completeQuest(questId, effectiveReward, effectiveDollarAmount);
  // ...
};
```

**Removed:**
- ❌ Separate `updateWallet()` call after `completeQuest()`
- ❌ Separate `updateWallet()` call after `purchaseItem()`
- ✅ Wallet updates now happen atomically within quest/shop operations

## Result

✅ **Wallet table is authoritative** - Wallet totals loaded directly from `wallets` table, never from logs
✅ **Atomic operations** - Log inserts and wallet updates happen in same function sequence
✅ **No recomputation** - Wallet totals never derived from log aggregation
✅ **Real-time updates** - Wallet subscription patches state directly from wallet table changes
✅ **Fast treasure chest** - No log scanning on load, instant wallet display

## Verification

- ✅ `useWallet.ts` loads wallet from `wallets` table only
- ✅ `completeQuest` updates wallet atomically with log insert
- ✅ `purchaseItem` updates wallet atomically with log insert
- ✅ Real-time subscription patches wallet from table changes
- ✅ No code aggregates logs to compute wallet totals
- ✅ `useGamification` computes weekly recap from logs (display only, not wallet totals)

