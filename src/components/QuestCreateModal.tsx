/**
 * Get Kraken v2 - Quest Create Modal
 *
 * Modal for creating new quests
 */

import { useState } from "react";
import type { Quest, Tag } from "../types";
import { TAGS, TAG_LABELS } from "../utils/tags";
import { useShopItems } from "../hooks/useShopItems";

interface QuestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    quest: Omit<Quest, "id" | "created_at" | "updated_at" | "completion_count">
  ) => Promise<void>;
}

export function QuestCreateModal({
  isOpen,
  onClose,
  onCreate,
}: QuestCreateModalProps) {
  const { shopItems, createShopItem, refresh } = useShopItems();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [reward, setReward] = useState("10");
  const [dollarAmount, setDollarAmount] = useState("");
  const [rewardItemId, setRewardItemId] = useState<string>("");
  const [newRewardItemName, setNewRewardItemName] = useState("");
  const [showNewRewardItemInput, setShowNewRewardItemInput] = useState(false);
  const [rarity, setRarity] = useState<
    "common" | "rare" | "epic" | "legendary" | ""
  >("");
  const [includeTasks, setIncludeTasks] = useState(false);
  const [includeHabits, setIncludeHabits] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Quest name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalRewardItemId = rewardItemId;
      
      // If user entered a new reward item name, create it first
      if (showNewRewardItemInput && newRewardItemName.trim()) {
        try {
          const newItem = await createShopItem({
            name: newRewardItemName.trim(),
            tags: [],
            price: 0,
            dollar_amount: 0,
          });
          finalRewardItemId = newItem.id;
          // Refresh shop items list so the new item appears in dropdowns  
          await refresh();
        } catch (err: any) {
          setError(`Failed to create reward item: ${err.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : [],
        reward: reward ? parseInt(reward) || 0 : 0,
        dollar_amount: dollarAmount ? parseInt(dollarAmount) || 0 : 0,
        reward_item_id: finalRewardItemId || null,
        reward_rarity: (finalRewardItemId && rarity) || null,
        status: "idle",
        include_tasks: includeTasks,
        include_habits: includeHabits,
      } as any);

      // Reset form
      setName("");
      setDescription("");
      setTags([]);
      setReward("10");
      setDollarAmount("");
      setRewardItemId("");
      setNewRewardItemName("");
      setShowNewRewardItemInput(false);
      setRarity("");
      setIncludeTasks(false);
      setIncludeHabits(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create quest");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: Tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 sm:p-4 md:p-6 lg:p-8">
        <div
          className="quest-reward-modal-content bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-2xl w-full sm:w-full max-w-3xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-10rem)] lg:max-h-[calc(100vh-11rem)] flex flex-col relative z-[101] mt-16 sm:mt-32 md:mt-36 lg:mt-40 mb-2 sm:mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                Create New Quest
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              {/* Name (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quest Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter quest name"
                />
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter quest description"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        tags.includes(tag)
                          ? "bg-amber-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {TAG_LABELS[tag]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sand Dollar Reward
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={reward}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setReward(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "." || e.key === ",") {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Dollar Amount (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dollar Amount Saved (Optional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={dollarAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setDollarAmount(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "." || e.key === ",") {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Associated Reward Item (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Associated Reward Item (Optional)
                </label>
                <div className="space-y-2">
                  <select
                    value={showNewRewardItemInput ? "" : rewardItemId}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setShowNewRewardItemInput(true);
                        setRewardItemId("");
                      } else {
                        setShowNewRewardItemInput(false);
                        setRewardItemId(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    <option value="__new__">+ Create New Item</option>
                    {shopItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {showNewRewardItemInput && (
                    <input
                      type="text"
                      value={newRewardItemName}
                      onChange={(e) => setNewRewardItemName(e.target.value)}
                      placeholder="Enter new reward item name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              {/* Reward Rarity (Optional) - Only show if reward item is selected */}
              {(rewardItemId || (showNewRewardItemInput && newRewardItemName.trim())) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reward Rarity (Optional)
                  </label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
              )}

              {/* Include Tasks/Habits Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTasks}
                    onChange={(e) => setIncludeTasks(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Include tasks?
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      These are things you'll do once for this quest.
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHabits}
                    onChange={(e) => setIncludeHabits(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Include habits?
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      These are things you'll do repeatedly for this quest.
                    </p>
                  </div>
                </label>
              </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Buttons - Sticky Footer */}
              <div className="flex-shrink-0 flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Creating..." : "Create Quest"}
                </button>
              </div>
            </form>
          </div>
        </div>
    </>
  );
}
