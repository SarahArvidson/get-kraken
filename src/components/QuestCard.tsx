/**
 * Kibblings - Quest Card Component
 *
 * Displays a quest with tap-to-complete, swipeable log, and editable reward
 */

import { useState } from "react";
import { Button } from "@ffx/sdk";
import type { Quest } from "../types";
import { CyclingBorder } from "./CyclingBorder";

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, reward: number) => Promise<void>;
  onUpdateReward: (questId: string, newReward: number) => Promise<void>;
  onViewLogs: (questId: string) => void;
  onEdit: (quest: Quest) => void;
}

export function QuestCard({
  quest,
  onComplete,
  onUpdateReward,
  onViewLogs,
  onEdit,
}: QuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(quest.id, quest.reward);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRewardChange = async (delta: number) => {
    const newReward = Math.max(0, quest.reward + delta);
    if (newReward !== quest.reward) {
      await onUpdateReward(quest.id, newReward);
    }
  };

  return (
    <CyclingBorder tags={quest.tags}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation">
        {/* Card Content */}
        <div className="p-4">
          {/* Quest Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 header-text-color mb-2">
              {quest.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🟡</span>
                <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {quest.reward} kibblings
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-200">
                {quest.completion_count} completed
              </div>
            </div>
          </div>

          {/* Reward Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => handleRewardChange(-1)}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
              aria-label="Decrease reward"
            >
              −
            </button>
            <span className="text-lg font-semibold min-w-[60px] text-center">
              {quest.reward}
            </span>
            <button
              onClick={() => handleRewardChange(1)}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
              aria-label="Increase reward"
            >
              +
            </button>
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
