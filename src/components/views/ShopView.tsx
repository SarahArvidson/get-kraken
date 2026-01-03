/**
 * Get Kraken - Shop View Component
 *
 * Displays the shop view with search, filters, and shop item cards
 */

import { useMemo } from "react";
import { ShopItemCard } from "../ShopItemCard";
import { AddShopItemCard } from "../AddShopItemCard";
import { TagFilterButtons } from "../TagFilterButtons";
import { calculateUserPurchaseCounts } from "../../utils/purchaseCount";
import {
  SHOP_TAGS,
  SHOP_TAG_LABELS,
  SHOP_TAG_BUTTON_CLASSES,
} from "../../utils/shopTags";
import type { ShopItem, ShopTag, ShopLog } from "../../types";

interface ShopViewProps {
  shopItems: ShopItem[];
  allShopLogs: ShopLog[];
  walletTotal: number;
  walletDollarTotal?: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: ShopTag | null;
  onTagSelect: (tag: ShopTag | null) => void;
  showDollarAmounts: boolean;
  onCreateShopItem: (
    itemData: Omit<
      ShopItem,
      "id" | "created_at" | "updated_at" | "purchase_count"
    >
  ) => Promise<void>;
  onPurchaseItem: (itemId: string, price: number) => Promise<void>;
  onViewLogs: (itemId: string) => void;
  onEdit: (item: ShopItem) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function ShopView({
  shopItems,
  allShopLogs,
  walletTotal,
  walletDollarTotal = 0,
  loading,
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  selectedTag,
  onTagSelect,
  showDollarAmounts,
  onCreateShopItem,
  onPurchaseItem,
  onViewLogs,
  onEdit,
  onShowToast,
}: ShopViewProps) {
  const userPurchaseCounts = useMemo(
    () => calculateUserPurchaseCounts(allShopLogs),
    [allShopLogs]
  );

  // Render full shop items list unconditionally
  const filteredShopItems = shopItems;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 header-text-color">
          Shop
        </h2>
      </div>

      <TagFilterButtons
        tags={SHOP_TAGS}
        selectedTag={selectedTag}
        onTagSelect={onTagSelect}
        getLabel={(tag) => SHOP_TAG_LABELS[tag]}
        getButtonClasses={(tag) => SHOP_TAG_BUTTON_CLASSES[tag]}
      />

      {/* Render shop items immediately when available - don't block on loading state */}
      {filteredShopItems.length === 0 && loading ? (
        <div className="text-center py-12 text-gray-500 dark:header-text-color">
          Loading shop items...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AddShopItemCard
            onCreate={async (itemData) => {
              await onCreateShopItem({
                ...itemData,
                dollar_amount: itemData.dollar_amount ?? 0,
              });
              onShowToast("Shop item created! 🛍️", "success");
            }}
          />
          {filteredShopItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              walletTotal={walletTotal}
              walletDollarTotal={walletDollarTotal}
              onPurchase={onPurchaseItem}
              onViewLogs={onViewLogs}
              onEdit={onEdit}
              showDollarAmounts={showDollarAmounts}
              userPurchaseCount={userPurchaseCounts[item.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

