/**
 * Get Kraken - Quest Card Component
 *
 * Displays a quest with tap-to-complete, swipeable log, and editable reward
 */

import { useState, useMemo } from "react";
import { Button } from "@ffx/sdk";
import type { Quest } from "../types";
import { CyclingBorder } from "./CyclingBorder";
import { SEA_DOLLAR_ICON_PATH, DEFAULT_REWARD_INCREMENT, DEFAULT_DOLLAR_INCREMENT } from "../constants";
import { useQuestOverrides } from "../hooks/useQuestOverrides";

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, reward: number) => Promise<void>;
  onViewLogs: (questId: string) => void;
  onEdit: (quest: Quest) => void;
  showDollarAmounts?: boolean;
  userCompletionCount?: number; // Count from user's own logs
}

export function QuestCard({
  quest,
  onComplete,
  onViewLogs,
  onEdit,
  showDollarAmounts = false,
  userCompletionCount,
}: QuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { getEffectiveReward, getEffectiveDollarAmount, updateOverride } = useQuestOverrides();
  
  // Get effective values (user override or base)
  const effectiveReward = useMemo(
    () => getEffectiveReward(quest.id, quest.reward),
    [getEffectiveReward, quest.id, quest.reward]
  );
  const effectiveDollarAmount = useMemo(
    () => getEffectiveDollarAmount(quest.id, quest.dollar_amount || 0),
    [getEffectiveDollarAmount, quest.id, quest.dollar_amount]
  );

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(quest.id, effectiveReward);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRewardChange = async (delta: number) => {
    const newReward = Math.max(0, effectiveReward + delta * DEFAULT_REWARD_INCREMENT);
    if (newReward !== effectiveReward) {
      await updateOverride(quest.id, { reward: newReward });
    }
  };

  const handleDollarAmountChange = async (delta: number) => {
    if (!showDollarAmounts) return;
    const newDollarAmount = Math.max(0, Math.round(effectiveDollarAmount + delta * DEFAULT_DOLLAR_INCREMENT));
    if (newDollarAmount !== Math.round(effectiveDollarAmount)) {
      await updateOverride(quest.id, { dollar_amount: newDollarAmount });
    }
  };

  return (
    <CyclingBorder tags={quest.tags}>
      <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation backdrop-blur-sm">
        {/* Card Content */}
        <div className="p-4">
          {/* Quest Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 header-text-color mb-2">
              {quest.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-6 h-6" />
                <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {effectiveReward}
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
                {userCompletionCount !== undefined ? userCompletionCount : quest.completion_count} completed
              </div>
            </div>
          </div>

          {/* Reward Controls - All users can edit (changes are per-user) */}
          <div className="space-y-3 mb-4">
              <div className="flex items-center justify-center gap-4">
                <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-5 h-5" />
                <button
                  onClick={() => handleRewardChange(-1)}
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
                  aria-label="Decrease reward"
                >
                  −
                </button>
                <span className="text-lg font-semibold min-w-[60px] text-center">
                  {effectiveReward}
                </span>
                <button
                  onClick={() => handleRewardChange(1)}
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
                  aria-label="Increase reward"
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
              onClick={handleComplete}
              loading={isCompleting}
              className="flex-1 touch-manipulation"
            >
              Complete Quest
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onViewLogs(quest.id)}
              className="touch-manipulation"
            >
              Logs
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onEdit(quest)}
              className="touch-manipulation"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </CyclingBorder>
  );
}
