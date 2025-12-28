/**
 * Kibblings - Add Shop Item Card Component
 *
 * Card for creating new shop items with image upload
 */

import { useState } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import { supabase } from "../lib/supabase";

interface AddShopItemCardProps {
  onCreate: (item: {
    name: string;
    photo_url: string | null;
    price: number;
  }) => Promise<void>;
}

export function AddShopItemCard({ onCreate }: AddShopItemCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(20);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter an item name");
      return;
    }

    setIsCreating(true);
    try {
      await onCreate({
        name: name.trim(),
        photo_url: photoUrl,
        price,
      });
      // Reset form
      setName("");
      setPrice(20);
      setPhotoUrl(null);
      setIsOpen(false);
    } catch (err: any) {
      console.error("Error creating shop item:", err);
      alert("Failed to create shop item. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer touch-manipulation"
        onClick={() => setIsOpen(true)}
      >
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">➕</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Add Shop Item
          </h3>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Shop Item"
        size="md"
      >
        <div className="space-y-4">
          <InputField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Coffee Treat"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Price (kibblings)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrice(Math.max(0, price - 1))}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
              >
                −
              </button>
              <span className="text-2xl font-semibold min-w-[60px] text-center">
                {price}
              </span>
              <button
                onClick={() => setPrice(price + 1)}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
              >
                +
              </button>
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
              <p className="text-sm text-gray-500 mt-2">Uploading...</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={isCreating}
              className="flex-1"
            >
              Create Item
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
