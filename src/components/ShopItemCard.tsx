/**
 * Kibblings - Shop Item Card Component
 *
 * Displays a shop item with tap-to-purchase, swipeable log, and editable price
 */

import { useState } from "react";
import { Button } from "@ffx/sdk";
import type { ShopItem } from "../types";
import { CyclingShopBorder } from "./CyclingBorder";

interface ShopItemCardProps {
  item: ShopItem;
  walletTotal: number;
  onPurchase: (itemId: string, price: number) => Promise<void>;
  onUpdatePrice: (itemId: string, newPrice: number) => Promise<void>;
  onViewLogs: (itemId: string) => void;
  onEdit: (item: ShopItem) => void;
}

export function ShopItemCard({
  item,
  walletTotal,
  onPurchase,
  onUpdatePrice,
  onViewLogs,
  onEdit,
}: ShopItemCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase(item.id, item.price);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePriceChange = async (delta: number) => {
    const newPrice = Math.max(0, item.price + delta);
    if (newPrice !== item.price) {
      await onUpdatePrice(item.id, newPrice);
    }
  };

  const canAfford = walletTotal >= item.price;

  return (
    <CyclingShopBorder tags={item.tags}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation">
        {/* Card Content */}
        <div className="p-4">
          {/* Item Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 header-text-color mb-2">
              {item.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🟡</span>
                <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {item.price} kibblings
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-200">
                {item.purchase_count} purchased
              </div>
            </div>
          </div>

          {/* Price Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => handlePriceChange(-1)}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
              aria-label="Decrease price"
            >
              −
            </button>
            <span className="text-lg font-semibold min-w-[60px] text-center">
              {item.price}
            </span>
            <button
              onClick={() => handlePriceChange(1)}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
              aria-label="Increase price"
            >
              +
            </button>
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
                : `Need ${item.price - walletTotal} more`}
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
