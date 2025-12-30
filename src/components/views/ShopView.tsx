/**
 * Get Kraken - Shop View Component
 *
 * Displays the shop view with search, filters, and shop item cards
 */

import { useMemo } from "react";
import { InputField } from "@ffx/sdk";
import { ShopItemCard } from "../ShopItemCard";
import { AddShopItemCard } from "../AddShopItemCard";
import { TagFilterButtons } from "../TagFilterButtons";
import { filterItems } from "../../utils/filtering";
import {
  SHOP_TAGS,
  SHOP_TAG_LABELS,
  SHOP_TAG_BUTTON_CLASSES,
} from "../../utils/shopTags";
import type { ShopItem, ShopTag } from "../../types";
import { DEFAULT_DOLLAR_AMOUNT } from "../../constants";

interface ShopViewProps {
  shopItems: ShopItem[];
  walletTotal: number;
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
  walletTotal,
  loading,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  showDollarAmounts,
  onCreateShopItem,
  onPurchaseItem,
  onViewLogs,
  onEdit,
  onShowToast,
}: ShopViewProps) {
  const filteredShopItems = useMemo(
    () =>
      filterItems<ShopItem, ShopTag>({
        items: shopItems,
        searchQuery,
        selectedTag,
        tagLabels: SHOP_TAG_LABELS,
      }),
    [shopItems, searchQuery, selectedTag]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Shop
        </h2>
        <div className="w-full sm:w-64">
          <InputField
            type="search"
            placeholder="Search shop items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <TagFilterButtons
        tags={SHOP_TAGS}
        selectedTag={selectedTag}
        onTagSelect={onTagSelect}
        getLabel={(tag) => SHOP_TAG_LABELS[tag]}
        getButtonClasses={(tag) => SHOP_TAG_BUTTON_CLASSES[tag]}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading shop items...
        </div>
      ) : filteredShopItems.length === 0 && searchQuery ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-300">
          No items found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AddShopItemCard
            onCreate={async (itemData) => {
              await onCreateShopItem({
                ...itemData,
                dollar_amount: DEFAULT_DOLLAR_AMOUNT,
              });
              onShowToast("Shop item created! 🛍️", "success");
            }}
          />
          {filteredShopItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              walletTotal={walletTotal}
              onPurchase={onPurchaseItem}
              onViewLogs={onViewLogs}
              onEdit={onEdit}
              showDollarAmounts={showDollarAmounts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

