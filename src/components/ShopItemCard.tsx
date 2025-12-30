/**
 * Get Kraken - Shop Item Card Component
 *
 * Displays a shop item with tap-to-purchase, swipeable log, and editable price
 */

import { useState, useMemo } from "react";
import { Button } from "@ffx/sdk";
import type { ShopItem } from "../types";
import { CyclingShopBorder } from "./CyclingBorder";
import { SEA_DOLLAR_ICON_PATH, DEFAULT_REWARD_INCREMENT, DEFAULT_DOLLAR_INCREMENT } from "../constants";
import { useShopItemOverrides } from "../hooks/useShopItemOverrides";

interface ShopItemCardProps {
  item: ShopItem;
  walletTotal: number;
  onPurchase: (itemId: string, price: number) => Promise<void>;
  onViewLogs: (itemId: string) => void;
  onEdit: (item: ShopItem) => void;
  showDollarAmounts?: boolean;
}

export function ShopItemCard({
  item,
  walletTotal,
  onPurchase,
  onViewLogs,
  onEdit,
  showDollarAmounts = false,
}: ShopItemCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { getEffectivePrice, getEffectiveDollarAmount, updateOverride } = useShopItemOverrides();
  
  // Get effective values (user override or base)
  const effectivePrice = useMemo(
    () => getEffectivePrice(item.id, item.price),
    [getEffectivePrice, item.id, item.price]
  );
  const effectiveDollarAmount = useMemo(
    () => getEffectiveDollarAmount(item.id, item.dollar_amount || 0),
    [getEffectiveDollarAmount, item.id, item.dollar_amount]
  );

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase(item.id, effectivePrice);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePriceChange = async (delta: number) => {
    const newPrice = Math.max(0, effectivePrice + delta * DEFAULT_REWARD_INCREMENT);
    if (newPrice !== effectivePrice) {
      await updateOverride(item.id, { price: newPrice });
    }
  };

  const handleDollarAmountChange = async (delta: number) => {
    if (!showDollarAmounts) return;
    const newDollarAmount = Math.max(0, Math.round(effectiveDollarAmount + delta * DEFAULT_DOLLAR_INCREMENT));
    if (newDollarAmount !== Math.round(effectiveDollarAmount)) {
      await updateOverride(item.id, { dollar_amount: newDollarAmount });
    }
  };

  const canAfford = walletTotal >= effectivePrice;

  return (
    <CyclingShopBorder tags={item.tags}>
      <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation backdrop-blur-sm">
        {/* Card Content */}
        <div className="p-4">
          {/* Item Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 header-text-color mb-2">
              {item.name}
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
                {item.purchase_count} purchased
              </div>
            </div>
          </div>

          {/* Price Controls - All users can edit (changes are per-user) */}
          <div className="space-y-3 mb-4">
              <div className="flex items-center justify-center gap-4">
                <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-5 h-5" />
                <button
                  onClick={() => handlePriceChange(-1)}
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
                  aria-label="Decrease price"
                >
                  −
                </button>
                <span className="text-lg font-semibold min-w-[60px] text-center">
                  {effectivePrice}
                </span>
                <button
                  onClick={() => handlePriceChange(1)}
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
                  aria-label="Increase price"
                >
                  +
                </button>
              </div>
              {showDollarAmounts && (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-lg">💵</span>
                  <button
                    onClick={() => handleDollarAmountChange(-1)}
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
                    aria-label="Decrease dollar amount"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold min-w-[80px] text-center">
                    ${Math.round(effectiveDollarAmount)}
                  </span>
                  <button
                    onClick={() => handleDollarAmountChange(1)}
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
                    aria-label="Increase dollar amount"
                  >
                    +
                  </button>
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
                : `Need ${effectivePrice - walletTotal} more`}
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
              onClick={() => onEdit(item)}
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
