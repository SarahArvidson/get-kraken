/**
 * Get Kraken v2 - Reward Edit Modal
 *
 * Modal for editing existing reward items
 */

import { useState, useEffect } from "react";
import type { ShopItem, ShopTag } from "../types";
import { SHOP_TAGS, SHOP_TAG_LABELS } from "../utils/shopTags";

interface RewardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: ShopItem | null;
  onUpdate: (id: string, updates: Partial<ShopItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  showDollarAmounts: boolean;
}

export function RewardEditModal({
  isOpen,
  onClose,
  reward,
  onUpdate,
  onDelete,
  showDollarAmounts,
}: RewardEditModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<ShopTag[]>([]);
  const [price, setPrice] = useState("20");
  const [dollarAmount, setDollarAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load reward data when modal opens
  useEffect(() => {
    if (reward && isOpen) {
      setName(reward.name || "");
      setDescription((reward as any).description || "");
      setTags(reward.tags || []);
      setPrice(reward.price ? reward.price.toString() : "20");
      setDollarAmount(
        reward.dollar_amount ? reward.dollar_amount.toString() : ""
      );
    }
  }, [reward, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reward || !name.trim()) {
      setError("Item name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(reward.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : [],
        price: price ? parseInt(price) || 0 : 0,
        dollar_amount: dollarAmount ? parseInt(dollarAmount) || 0 : 0,
      } as any);

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: ShopTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (!isOpen || !reward) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-start justify-start sm:justify-center p-0 sm:p-4 md:p-6 lg:p-8">
        <div
          className="quest-reward-modal-content bg-white dark:bg-gray-800 rounded-none sm:rounded-lg md:rounded-2xl shadow-2xl w-full sm:w-full max-w-3xl h-screen sm:h-auto max-h-screen sm:max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-10rem)] lg:max-h-[calc(100vh-11rem)] flex flex-col relative z-[101] mt-0 sm:mt-32 md:mt-36 lg:mt-40 mb-0 sm:mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                Edit Reward
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
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter item name"
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
                  placeholder="Enter item description"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {SHOP_TAGS.map((tag) => (
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
                      {SHOP_TAG_LABELS[tag]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sand Dollar Cost
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPrice(value);
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

              {/* Dollar Amount (Optional, only if showDollarAmounts) */}
              {showDollarAmounts && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dollar Cost (Optional)
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
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Buttons - Sticky Footer */}
            <div className="flex-shrink-0 flex flex-col gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-3">
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors text-center"
                >
                  Delete reward
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete Confirmation */}
      {onDelete && reward && (
        <div className={`fixed inset-0 bg-black/50 z-[102] ${showDeleteConfirm ? '' : 'hidden'}`}>
          <div className="fixed inset-0 z-[103] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Delete Reward
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete "{reward.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (reward && onDelete) {
                      await onDelete(reward.id);
                      setShowDeleteConfirm(false);
                      onClose();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
