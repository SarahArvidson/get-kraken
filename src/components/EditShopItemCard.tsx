/**
 * Get Kraken - Edit Shop Item Card Component
 *
 * Modal for editing existing shop items with image upload
 */

import { useState, useEffect } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import type { ShopItem, ShopTag } from "../types";
import {
  SHOP_TAGS,
  SHOP_TAG_LABELS,
  SHOP_TAG_BUTTON_CLASSES,
} from "../utils/shopTags";

interface EditShopItemCardProps {
  item: ShopItem;
  userPurchaseCount?: number;
  onSave: (updates: {
    name: string;
    tags: ShopTag[];
    price: number;
    dollar_amount?: number;
    purchase_count: number;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function EditShopItemCard({
  item,
  userPurchaseCount,
  onSave,
  onDelete,
  onClose,
}: EditShopItemCardProps) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [dollarAmount, setDollarAmount] = useState(item.dollar_amount || 0);
  const [purchaseCount, setPurchaseCount] = useState(
    userPurchaseCount !== undefined ? userPurchaseCount : item.purchase_count
  );
  const [tags, setTags] = useState<ShopTag[]>(item.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when item changes
  useEffect(() => {
    setName(item.name);
    setPrice(item.price);
    setDollarAmount(item.dollar_amount || 0);
    setPurchaseCount(userPurchaseCount !== undefined ? userPurchaseCount : item.purchase_count);
    setTags(item.tags || []);
  }, [item, userPurchaseCount]);

  const toggleTag = (tagOption: ShopTag) => {
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
      console.error("Error deleting shop item:", err);
      alert("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter an item name");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        tags,
        price,
        dollar_amount: dollarAmount > 0 ? dollarAmount : undefined,
        purchase_count: purchaseCount,
      });
    } catch (err: any) {
      console.error("Error saving shop item:", err);
      // Error handling is done in parent component
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Shop Item" size="md">
      <div className="space-y-4">
        <InputField
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Coffee Treat"
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label htmlFor="shop-item-price-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Sea Dollars
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrice(Math.max(0, price - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Decrease price"
              >
                −
              </button>
              <input
                id="shop-item-price-input"
                type="number"
                value={price}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setPrice(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
                aria-label="Shop item price in sea dollars"
              />
              <button
                onClick={() => setPrice(price + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Dollar Amount */}
          <div>
            <label htmlFor="shop-item-dollar-amount-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              💵 Dollars <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDollarAmount(Math.max(0, dollarAmount - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Decrease dollar amount"
              >
                −
              </button>
              <input
                id="shop-item-dollar-amount-input"
                type="number"
                value={dollarAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setDollarAmount(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
                aria-label="Shop item dollar amount"
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
          {/* Purchase Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Purchases
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPurchaseCount(Math.max(0, purchaseCount - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={purchaseCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setPurchaseCount(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
              />
              <button
                onClick={() => setPurchaseCount(purchaseCount + 1)}
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
            {SHOP_TAGS.map((tagOption) => {
              const isActive = tags.includes(tagOption);
              const classes = SHOP_TAG_BUTTON_CLASSES[tagOption];
              return (
                <button
                  key={tagOption}
                  type="button"
                  onClick={() => toggleTag(tagOption)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all touch-manipulation ${
                    isActive ? classes.active : classes.base
                  }`}
                >
                  {SHOP_TAG_LABELS[tagOption]}
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
            Delete Item
          </button>
          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                Delete this item? Purchase logs will be kept.
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
