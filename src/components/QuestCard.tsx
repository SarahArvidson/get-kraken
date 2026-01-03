/**
 * Get Kraken - Quest Card Component
 *
 * Displays a quest with tap-to-complete, swipeable log, and editable reward
 */

import { useState, useMemo, useRef } from "react";
import { Button } from "@ffx/sdk";
import type { Quest } from "../types";
import { CyclingBorder } from "./CyclingBorder";
import { SEA_DOLLAR_ICON_PATH } from "../constants";
import { useQuestOverrides } from "../hooks/useQuestOverrides";
import { UnifiedNumericInput } from "./UnifiedNumericInput";

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
  const { getEffectiveReward, getEffectiveDollarAmount, getEffectiveTags, getEffectiveName, updateOverride } = useQuestOverrides();
  
  // Track pending CREATE operations to prevent duplicate INSERTs during rapid typing
  const rewardCreateLockRef = useRef<Promise<void> | null>(null);
  const dollarAmountCreateLockRef = useRef<Promise<void> | null>(null);
  
  // Get effective values (user override or base)
  const effectiveReward = useMemo(
    () => getEffectiveReward(quest.id, quest.reward),
    [getEffectiveReward, quest.id, quest.reward]
  );
  const effectiveDollarAmount = useMemo(
    () => getEffectiveDollarAmount(quest.id, quest.dollar_amount || 0),
    [getEffectiveDollarAmount, quest.id, quest.dollar_amount]
  );
  const effectiveTags = useMemo(
    () => getEffectiveTags(quest.id, quest.tags || []),
    [getEffectiveTags, quest.id, quest.tags]
  );
  const effectiveName = useMemo(
    () => getEffectiveName(quest.id, quest.name),
    [getEffectiveName, quest.id, quest.name]
  );

  // Detect if override exists: effective value differs from base value
  const rewardOverrideExists = effectiveReward !== quest.reward;
  const dollarAmountOverrideExists = Math.round(effectiveDollarAmount) !== Math.round(quest.dollar_amount || 0);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(quest.id, effectiveReward);
    } finally {
      setIsCompleting(false);
    }
  };

  // Separate handlers for create vs update to prevent 409 conflicts
  const onCreateRewardOverride = async (newReward: number) => {
    // Serialize CREATE operations to prevent 409 conflicts
    if (rewardCreateLockRef.current) {
      await rewardCreateLockRef.current;
    }
    const createPromise = updateOverride(quest.id, { reward: newReward });
    rewardCreateLockRef.current = createPromise;
    try {
      await createPromise;
    } finally {
      rewardCreateLockRef.current = null;
    }
  };

  const onUpdateRewardOverride = async (newReward: number) => {
    // Override exists, safe to UPDATE multiple times
    await updateOverride(quest.id, { reward: newReward });
  };

  const handleRewardSave = async (newReward: number) => {
    if (newReward === effectiveReward) return;
    // Choose handler based on override existence
    if (rewardOverrideExists) {
      await onUpdateRewardOverride(newReward);
    } else {
      await onCreateRewardOverride(newReward);
    }
  };

  // Separate handlers for create vs update to prevent 409 conflicts
  const onCreateDollarAmountOverride = async (newDollarAmount: number) => {
    const roundedAmount = Math.round(newDollarAmount);
    // Serialize CREATE operations to prevent 409 conflicts
    if (dollarAmountCreateLockRef.current) {
      await dollarAmountCreateLockRef.current;
    }
    const createPromise = updateOverride(quest.id, { dollar_amount: roundedAmount });
    dollarAmountCreateLockRef.current = createPromise;
    try {
      await createPromise;
    } finally {
      dollarAmountCreateLockRef.current = null;
    }
  };

  const onUpdateDollarAmountOverride = async (newDollarAmount: number) => {
    const roundedAmount = Math.round(newDollarAmount);
    // Override exists, safe to UPDATE multiple times
    await updateOverride(quest.id, { dollar_amount: roundedAmount });
  };

  const handleDollarAmountSave = async (newDollarAmount: number) => {
    if (!showDollarAmounts) return;
    const roundedAmount = Math.round(newDollarAmount);
    if (roundedAmount === Math.round(effectiveDollarAmount)) return;
    // Choose handler based on override existence
    if (dollarAmountOverrideExists) {
      await onUpdateDollarAmountOverride(newDollarAmount);
    } else {
      await onCreateDollarAmountOverride(newDollarAmount);
    }
  };

  return (
    <CyclingBorder tags={effectiveTags}>
      <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation backdrop-blur-sm">
        {/* Card Content */}
        <div className="p-4">
          {/* Quest Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 header-text-color mb-2">
              {effectiveName}
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
              <div className="flex items-center justify-center gap-2">
                <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-5 h-5" />
                <UnifiedNumericInput
                  value={effectiveReward}
                  onSave={handleRewardSave}
                  min={0}
                  className="text-amber-600 dark:text-amber-400"
                  ariaLabel="Quest reward in sand dollars"
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
                    ariaLabel="Quest dollar amount"
                  />
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
              onClick={() => onEdit({ ...quest, name: effectiveName, tags: effectiveTags, reward: effectiveReward, dollar_amount: effectiveDollarAmount })}
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
