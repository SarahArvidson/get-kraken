/**
 * Get Kraken v2 - Legacy Shop Page (v1 ShopView)
 * 
 * Temporary wrapper to preserve v1 functionality during Phase 1
 * TODO: Replace with new RewardsPage in Phase 3
 */

import { ShopView } from "../components/views/ShopView";
import type { ShopItem, ShopLog, ShopTag } from "../types";

interface LegacyShopPageProps {
  shopItems: ShopItem[];
  allShopLogs: ShopLog[];
  walletTotal: number;
  walletDollarTotal: number;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: ShopTag | null;
  onTagSelect: (tag: ShopTag | null) => void;
  showDollarAmounts: boolean;
  onCreateShopItem: (item: Omit<ShopItem, "id" | "created_at" | "updated_at" | "purchase_count">) => Promise<void>;
  onPurchaseItem: (itemId: string, price: number) => Promise<void>;
  onViewLogs: (itemId: string) => Promise<void>;
  onEdit: (item: ShopItem) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function LegacyShopPage(props: LegacyShopPageProps) {
  return <ShopView {...props} />;
}
