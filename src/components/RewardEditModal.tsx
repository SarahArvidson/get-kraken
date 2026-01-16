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
  showDollarAmounts: boolean;
}

export function RewardEditModal({
  isOpen,
  onClose,
  reward,
  onUpdate,
  showDollarAmounts,
}: RewardEditModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<ShopTag[]>([]);
  const [price, setPrice] = useState("20");
  const [dollarAmount, setDollarAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-1 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-7rem)] sm:max-h-[calc(100vh-9rem)] md:max-h-[calc(100vh-10rem)] lg:max-h-[calc(100vh-11rem)] flex flex-col relative z-[101] mt-20 sm:mt-32 md:mt-36 lg:mt-40 mb-4 sm:mb-0 min-w-0"
          style={{ marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 space-y-6 min-w-0">
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
