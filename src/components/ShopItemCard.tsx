/**
 * Get Kraken - Shop Item Card Component
 *
 * Displays a shop item with tap-to-purchase, swipeable log, and editable price
 */

import { useState, useMemo, useRef } from "react";
import { Button } from "@ffx/sdk";
import type { ShopItem } from "../types";
import { CyclingShopBorder } from "./CyclingBorder";
import { SEA_DOLLAR_ICON_PATH } from "../constants";
import { useShopItemOverrides } from "../hooks/useShopItemOverrides";
import { UnifiedNumericInput } from "./UnifiedNumericInput";

interface ShopItemCardProps {
  item: ShopItem;
  walletTotal: number;
  walletDollarTotal?: number;
  onPurchase: (itemId: string, price: number) => Promise<void>;
  onViewLogs: (itemId: string) => void;
  onEdit: (item: ShopItem) => void;
  showDollarAmounts?: boolean;
  userPurchaseCount?: number; // Count from user's own logs
}

export function ShopItemCard({
  item,
  walletTotal,
  walletDollarTotal = 0,
  onPurchase,
  onViewLogs,
  onEdit,
  showDollarAmounts = false,
  userPurchaseCount,
}: ShopItemCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { getEffectivePrice, getEffectiveDollarAmount, getEffectiveTags, getEffectiveName, updateOverride } = useShopItemOverrides();
  
  // Track pending CREATE operations to prevent duplicate INSERTs during rapid typing
  const priceCreateLockRef = useRef<Promise<void> | null>(null);
  const dollarAmountCreateLockRef = useRef<Promise<void> | null>(null);
  
  // Get effective values (user override or base)
  const effectivePrice = useMemo(
    () => getEffectivePrice(item.id, item.price),
    [getEffectivePrice, item.id, item.price]
  );
  const effectiveDollarAmount = useMemo(
    () => getEffectiveDollarAmount(item.id, item.dollar_amount || 0),
    [getEffectiveDollarAmount, item.id, item.dollar_amount]
  );
  const effectiveTags = useMemo(
    () => getEffectiveTags(item.id, item.tags || []),
    [getEffectiveTags, item.id, item.tags]
  );
  const effectiveName = useMemo(
    () => getEffectiveName(item.id, item.name),
    [getEffectiveName, item.id, item.name]
  );

  // Detect if override exists: effective value differs from base value
  const priceOverrideExists = effectivePrice !== item.price;
  const dollarAmountOverrideExists = Math.round(effectiveDollarAmount) !== Math.round(item.dollar_amount || 0);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase(item.id, effectivePrice);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePriceSave = async (newPrice: number) => {
    if (newPrice !== effectivePrice) {
      // If override exists, updateOverride will UPDATE (safe to call multiple times)
      if (priceOverrideExists) {
        await updateOverride(item.id, { price: newPrice });
      } else {
        // No override exists - serialize CREATE operations to prevent 409 conflicts
        if (priceCreateLockRef.current) {
          // Wait for pending CREATE to complete
          await priceCreateLockRef.current;
        }
        // Initiate CREATE and store promise
        const createPromise = updateOverride(item.id, { price: newPrice });
        priceCreateLockRef.current = createPromise;
        try {
          await createPromise;
        } finally {
          // Clear lock after completion (override now exists, future calls will UPDATE)
          priceCreateLockRef.current = null;
        }
      }
    }
  };

  const handleDollarAmountSave = async (newDollarAmount: number) => {
    if (!showDollarAmounts) return;
    const roundedAmount = Math.round(newDollarAmount);
    if (roundedAmount !== Math.round(effectiveDollarAmount)) {
      // If override exists, updateOverride will UPDATE (safe to call multiple times)
      if (dollarAmountOverrideExists) {
        await updateOverride(item.id, { dollar_amount: roundedAmount });
      } else {
        // No override exists - serialize CREATE operations to prevent 409 conflicts
        if (dollarAmountCreateLockRef.current) {
          // Wait for pending CREATE to complete
          await dollarAmountCreateLockRef.current;
        }
        // Initiate CREATE and store promise
        const createPromise = updateOverride(item.id, { dollar_amount: roundedAmount });
        dollarAmountCreateLockRef.current = createPromise;
        try {
          await createPromise;
        } finally {
          // Clear lock after completion (override now exists, future calls will UPDATE)
          dollarAmountCreateLockRef.current = null;
        }
      }
    }
  };

  // Check if user can afford both sand dollars and dollars (if dollar amounts are enabled)
  const canAffordSeaDollars = walletTotal >= effectivePrice;
  const canAffordDollars = !showDollarAmounts || effectiveDollarAmount === 0 || (walletDollarTotal >= Math.round(effectiveDollarAmount));
  const canAfford = canAffordSeaDollars && canAffordDollars;

  return (
    <CyclingShopBorder tags={effectiveTags}>
      <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation backdrop-blur-sm">
        {/* Card Content */}
        <div className="p-4">
          {/* Item Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 header-text-color mb-2">
              {effectiveName}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-6 h-6" />
                <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {effectivePrice}
                </span>
                {showDollarAmounts && (
                  <>
                    <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">|</span>
                    <span className="text-lg">💵</span>
                    <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {Math.round(effectiveDollarAmount)}
                    </span>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:header-text-color">
                {userPurchaseCount !== undefined ? userPurchaseCount : item.purchase_count} purchased
              </div>
            </div>
          </div>

          {/* Price Controls - All users can edit (changes are per-user) */}
          <div className="space-y-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-5 h-5" />
                <UnifiedNumericInput
                  value={effectivePrice}
                  onSave={handlePriceSave}
                  min={0}
                  className="text-amber-600 dark:text-amber-400"
                  ariaLabel="Shop item price in sand dollars"
                />
              </div>
              {showDollarAmounts && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">💵</span>
                  <UnifiedNumericInput
                    value={Math.round(effectiveDollarAmount)}
                    onSave={handleDollarAmountSave}
                    min={0}
                    className="text-amber-600 dark:text-amber-400"
                    ariaLabel="Shop item dollar amount"
                  />
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePurchase}
              loading={isPurchasing}
              disabled={!canAfford && walletTotal >= 0}
              className="flex-1 touch-manipulation"
            >
              {canAfford || walletTotal < 0
                ? "Purchase"
                : !canAffordSeaDollars
                ? `Need ${effectivePrice - walletTotal} more sand dollars`
                : !canAffordDollars
                ? `Need ${Math.round(effectiveDollarAmount) - Math.round(walletDollarTotal)} more dollars`
                : "Cannot afford"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onViewLogs(item.id)}
              className="touch-manipulation"
            >
              Logs
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onEdit({ ...item, name: effectiveName, tags: effectiveTags, price: effectivePrice, dollar_amount: effectiveDollarAmount })}
              className="touch-manipulation"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </CyclingShopBorder>
  );
}
