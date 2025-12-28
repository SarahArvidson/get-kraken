/**
 * Kibblings - Edit Shop Item Card Component
 *
 * Modal for editing existing shop items with image upload
 */

import { useState, useEffect } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import { supabase } from "../lib/supabase";
import type { ShopItem } from "../types";

interface EditShopItemCardProps {
  item: ShopItem;
  onSave: (updates: {
    name: string;
    photo_url: string | null;
    price: number;
    purchase_count: number;
  }) => Promise<void>;
  onClose: () => void;
}

export function EditShopItemCard({
  item,
  onSave,
  onClose,
}: EditShopItemCardProps) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [purchaseCount, setPurchaseCount] = useState(item.purchase_count);
  const [photoUrl, setPhotoUrl] = useState<string | null>(item.photo_url);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when item changes
  useEffect(() => {
    setName(item.name);
    setPrice(item.price);
    setPurchaseCount(item.purchase_count);
    setPhotoUrl(item.photo_url);
  }, [item]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `shop/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      // Use the client's storage API directly to bypass RLS issues
      const { data: uploadData, error: uploadError } =
        await supabase.supabase.storage
          .from("kibblings")
          .upload(fileName, file, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload image");
      }

      // Verify upload succeeded
      if (!uploadData || !uploadData.path) {
        throw new Error("Upload succeeded but no path returned");
      }

      // Get public URL - use the path from upload response
      const uploadPath = uploadData.path;
      const { data: urlData } = supabase.supabase.storage
        .from("kibblings")
        .getPublicUrl(uploadPath);

      if (urlData?.publicUrl) {
        setPhotoUrl(urlData.publicUrl);
      } else {
        // Fallback: construct URL manually if getPublicUrl doesn't work
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/kibblings/${uploadPath}`;
          setPhotoUrl(publicUrl);
        } else {
          throw new Error("Failed to get public URL for uploaded image");
        }
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(`Failed to upload image: ${err.message || "Please try again."}`);
    } finally {
      setIsUploading(false);
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
        photo_url: photoUrl,
        price,
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Price (kibblings)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrice(Math.max(0, price - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setPrice(Math.max(0, val));
                }}
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                min="0"
              />
              <button
                onClick={() => setPrice(price + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Photo (optional)
          </label>
          {photoUrl ? (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Item preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setPhotoUrl(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8"
              >
                ×
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            />
          )}
          {isUploading && (
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
              Uploading...
            </p>
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
