/**
 * Get Kraken v2 - Reward Create Modal
 * 
 * Modal for creating new reward items
 */

import { useState } from "react";
import type { ShopItem, ShopTag } from "../types";
import { SHOP_TAGS, SHOP_TAG_LABELS } from "../utils/shopTags";

interface RewardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (item: Omit<ShopItem, "id" | "created_at" | "updated_at" | "purchase_count">) => Promise<void>;
  showDollarAmounts: boolean;
}

export function RewardCreateModal({
  isOpen,
  onClose,
  onCreate,
  showDollarAmounts,
}: RewardCreateModalProps) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState<ShopTag[]>([]);
  const [price, setPrice] = useState("20");
  const [dollarAmount, setDollarAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Item name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate({
        name: name.trim(),
        tags: tags.length > 0 ? tags : [],
        price: parseInt(price) || 0,
        dollar_amount: dollarAmount ? parseInt(dollarAmount) || 0 : 0,
      });
      
      // Reset form
      setName("");
      setTags([]);
      setPrice("20");
      setDollarAmount("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: ShopTag) => {
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
                Create New Reward
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
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
                    const value = e.target.value.replace(/\D/g, '');
                    setPrice(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === ',') {
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
                      const value = e.target.value.replace(/\D/g, '');
                      setDollarAmount(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === ',') {
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
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
                  {isSubmitting ? "Creating..." : "Create Item"}
                </button>
              </div>
            </form>
        </div>
      </div>
    </>
  );
}
