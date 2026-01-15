/**
 * Get Kraken v2 - Goal Create Modal
 * 
 * Modal for creating new goals
 */

import { useState } from "react";
import type { Goal } from "../types";
import { useShopItems } from "../hooks/useShopItems";

interface GoalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (goal: Omit<Goal, "id" | "user_id" | "is_completed" | "completed_at" | "created_at" | "updated_at">) => Promise<void>;
}

export function GoalCreateModal({
  isOpen,
  onClose,
  onCreate,
}: GoalCreateModalProps) {
  const { shopItems } = useShopItems();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sandDollars, setSandDollars] = useState("");
  const [dollars, setDollars] = useState("");
  const [rewardItemId, setRewardItemId] = useState<string>("");
  const [shareMode, setShareMode] = useState<'private' | 'copyable' | 'co-op'>('private');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Goal name is required");
      return;
    }

    // Zero values are valid - only block negative values
    if (sandDollars && parseInt(sandDollars) < 0) {
      setError("Sand dollar amount cannot be negative");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || null,
        sand_dollars: parseInt(sandDollars) || 0,
        dollars: dollars ? parseInt(dollars) || null : null,
        reward_item_id: rewardItemId || null,
        share_mode: shareMode,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setSandDollars("");
      setDollars("");
      setRewardItemId("");
      setShareMode('private');
      // Don't close here - let parent handle it after refresh
    } catch (err: any) {
      setError(err.message || "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Group shop items by rarity (if rarity exists, otherwise just show all)
  const groupedItems = shopItems.reduce((acc, item) => {
    const rarity = (item as any).rarity || 'common';
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(item);
    return acc;
  }, {} as Record<string, typeof shopItems>);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Create Goal"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Create Goal
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Save for vacation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sand Dollars Target 🪙 *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sandDollars}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setSandDollars(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === ',') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dollars Target 💵 (Optional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={dollars}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setDollars(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === ',') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reward Item 🎁 (Optional)
                </label>
                <select
                  value={rewardItemId}
                  onChange={(e) => setRewardItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">None</option>
                  {Object.entries(groupedItems).map(([rarity, items]) => (
                    <optgroup key={rarity} label={rarity.charAt(0).toUpperCase() + rarity.slice(1)}>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share Mode
                </label>
                <select
                  value={shareMode}
                  onChange={(e) => setShareMode(e.target.value as 'private' | 'copyable' | 'co-op')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="private">Private</option>
                  <option value="copyable">Copyable</option>
                  <option value="co-op">Co-op</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
