/**
 * Get Kraken v2 - Legacy Progress Page (v1 ProgressView)
 * 
 * Temporary wrapper to preserve v1 functionality during Phase 1
 * TODO: Integrate into Home page Tide Chart section in Phase 4
 */

import { ProgressView } from "../components/views/ProgressView";
import type { Quest, ShopItem, QuestLog, ShopLog } from "../types";

interface LegacyProgressPageProps {
  walletTotal: number;
  walletDollarTotal: number;
  questLogs: QuestLog[];
  shopLogs: ShopLog[];
  quests: Quest[];
  shopItems: ShopItem[];
  onResetProgress: () => Promise<void>;
  onResetAllProgress: () => Promise<void>;
  showDollarAmounts: boolean;
}

export function LegacyProgressPage(props: LegacyProgressPageProps) {
  return <ProgressView {...props} />;
}
