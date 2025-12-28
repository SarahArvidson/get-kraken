/**
 * Kibblings - Quest Card Component
 *
 * Displays a quest with tap-to-complete, swipeable log, and editable reward
 */

import { useState } from "react";
import { Button } from "@ffx/sdk";
import type { Quest } from "../types";

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string, reward: number) => Promise<void>;
  onUpdateReward: (questId: string, newReward: number) => Promise<void>;
  onViewLogs: (questId: string) => void;
  onEdit: (quest: Quest) => void;
  onDelete: (questId: string) => Promise<void>;
}

export function QuestCard({
  quest,
  onComplete,
  onUpdateReward,
  onViewLogs,
  onEdit,
  onDelete,
}: QuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden touch-manipulation">
      {/* Card Content */}
      <div className="p-4">
        {/* Photo */}
        {quest.photo_url && (
          <div className="w-full h-48 mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={quest.photo_url}
              alt={quest.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Quest Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
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
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 touch-manipulation"
            aria-label="Delete quest"
            title="Delete quest"
          >
            🗑️
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Delete this quest? Progress logs will be kept.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await onDelete(quest.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
