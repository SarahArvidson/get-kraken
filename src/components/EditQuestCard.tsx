/**
 * Get Kraken - Edit Quest Card Component
 *
 * Modal for editing existing quests with image upload
 */

import { useState, useEffect } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import type { Quest, Tag } from "../types";
import { TAGS, TAG_LABELS, TAG_BUTTON_CLASSES } from "../utils/tags";

interface EditQuestCardProps {
  quest: Quest;
  userCompletionCount?: number;
  onSave: (updates: {
    name: string;
    tags: Tag[];
    reward: number;
    dollar_amount?: number;
    completion_count: number;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function EditQuestCard({
  quest,
  userCompletionCount,
  onSave,
  onDelete,
  onClose,
}: EditQuestCardProps) {
  const [name, setName] = useState(quest.name);
  const [reward, setReward] = useState(quest.reward);
  const [dollarAmount, setDollarAmount] = useState(quest.dollar_amount || 0);
  const [completionCount, setCompletionCount] = useState(
    userCompletionCount !== undefined ? userCompletionCount : quest.completion_count
  );
  const [tags, setTags] = useState<Tag[]>(quest.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when quest changes
  useEffect(() => {
    setName(quest.name);
    setReward(quest.reward);
    setDollarAmount(quest.dollar_amount || 0);
    setCompletionCount(userCompletionCount !== undefined ? userCompletionCount : quest.completion_count);
    setTags(quest.tags || []);
  }, [quest, userCompletionCount]);

  const toggleTag = (tagOption: Tag) => {
    setTags((prev) =>
      prev.includes(tagOption)
        ? prev.filter((t) => t !== tagOption)
        : [...prev, tagOption]
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error("Error deleting quest:", err);
      alert("Failed to delete quest. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a quest name");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        tags,
        reward,
        dollar_amount: dollarAmount > 0 ? dollarAmount : undefined,
        completion_count: completionCount,
      });
    } catch (err: any) {
      console.error("Error saving quest:", err);
      // Error handling is done in parent component
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Quest" size="md">
      <div className="space-y-4">
        <InputField
          label="Quest Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Run"
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Reward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Sea Dollars
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReward(Math.max(0, reward - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={reward}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setReward(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
              />
              <button
                onClick={() => setReward(reward + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Dollar Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              💵 Dollars <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDollarAmount(Math.max(0, dollarAmount - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={dollarAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setDollarAmount(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
              />
              <button
                onClick={() => setDollarAmount(dollarAmount + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Completion Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Completions
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCompletionCount(Math.max(0, completionCount - 1))
                }
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={completionCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setCompletionCount(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
              />
              <button
                onClick={() => setCompletionCount(completionCount + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Tag Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tagOption) => {
              const isActive = tags.includes(tagOption);
              const classes = TAG_BUTTON_CLASSES[tagOption];
              return (
                <button
                  key={tagOption}
                  type="button"
                  onClick={() => toggleTag(tagOption)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                    isActive ? classes.active : classes.base
                  }`}
                >
                  {TAG_LABELS[tagOption]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
          >
            Delete Quest
          </button>
          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
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
                  onClick={handleDelete}
                  loading={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
