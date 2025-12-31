/**
 * Get Kraken - Progress View Component
 *
 * Displays the progress and stats view
 */

import { useMemo, memo } from "react";
import { GamificationPanel } from "../GamificationPanel";
import type { Quest, ShopItem, QuestLog, ShopLog } from "../../types";

interface ProgressViewProps {
  walletTotal: number;
  walletDollarTotal?: number;
  questLogs: QuestLog[];
  shopLogs: ShopLog[];
  quests: Quest[];
  shopItems: ShopItem[];
  onResetProgress: () => Promise<void>;
  onResetAllProgress: () => Promise<void>;
}

function ProgressView({
  walletTotal,
  walletDollarTotal = 0,
  questLogs,
  shopLogs,
  quests,
  shopItems,
  onResetProgress,
  onResetAllProgress,
}: ProgressViewProps) {
  // Memoize expensive computations to prevent recalculation on every render
  const questNames = useMemo(
    () => new Map(quests.map((q) => [q.id, q.name])),
    [quests]
  );

  const questsData = useMemo(
    () => quests.map((q) => ({ id: q.id, reward: q.reward, dollar_amount: q.dollar_amount })),
    [quests]
  );

  const shopItemsData = useMemo(
    () => shopItems.map((item) => ({
      id: item.id,
      price: item.price,
      dollar_amount: item.dollar_amount,
    })),
    [shopItems]
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 header-text-color mb-4">
        Progress & Stats
      </h2>
      <GamificationPanel
        walletTotal={walletTotal}
        walletDollarTotal={walletDollarTotal}
        questLogs={questLogs}
        shopLogs={shopLogs}
        questNames={questNames}
        quests={questsData}
        shopItems={shopItemsData}
        onResetProgress={onResetProgress}
        onResetAllProgress={onResetAllProgress}
      />
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
const MemoizedProgressView = memo(ProgressView);
export { MemoizedProgressView as ProgressView };
export default MemoizedProgressView;

