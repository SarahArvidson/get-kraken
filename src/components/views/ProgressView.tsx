/**
 * Get Kraken - Progress View Component
 *
 * Displays the progress and stats view
 */

import { GamificationPanel } from "../GamificationPanel";
import type { Quest, ShopItem, QuestLog, ShopLog } from "../../types";

interface ProgressViewProps {
  walletTotal: number;
  questLogs: QuestLog[];
  shopLogs: ShopLog[];
  quests: Quest[];
  shopItems: ShopItem[];
  onResetProgress: () => Promise<void>;
  onResetAllProgress: () => Promise<void>;
}

export function ProgressView({
  walletTotal,
  questLogs,
  shopLogs,
  quests,
  shopItems,
  onResetProgress,
  onResetAllProgress,
}: ProgressViewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 header-text-color mb-4">
        Progress & Stats
      </h2>
      <GamificationPanel
        walletTotal={walletTotal}
        questLogs={questLogs}
        shopLogs={shopLogs}
        questNames={new Map(quests.map((q) => [q.id, q.name]))}
        quests={quests.map((q) => ({ id: q.id, reward: q.reward }))}
        shopItems={shopItems.map((item) => ({
          id: item.id,
          price: item.price,
        }))}
        onResetProgress={onResetProgress}
        onResetAllProgress={onResetAllProgress}
      />
    </div>
  );
}

