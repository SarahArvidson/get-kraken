/**
 * Kibblings - Edit Quest Card Component
 *
 * Modal for editing existing quests with image upload
 */

import { useState, useEffect } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import { supabase } from "../lib/supabase";
import type { Quest } from "../types";

interface EditQuestCardProps {
  quest: Quest;
  onSave: (updates: {
    name: string;
    photo_url: string | null;
    reward: number;
  }) => Promise<void>;
  onClose: () => void;
}

export function EditQuestCard({ quest, onSave, onClose }: EditQuestCardProps) {
  const [name, setName] = useState(quest.name);
  const [reward, setReward] = useState(quest.reward);
  const [photoUrl, setPhotoUrl] = useState<string | null>(quest.photo_url);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when quest changes
  useEffect(() => {
    setName(quest.name);
    setReward(quest.reward);
    setPhotoUrl(quest.photo_url);
  }, [quest]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `quests/${Date.now()}-${Math.random()
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
      alert("Please enter a quest name");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        photo_url: photoUrl,
        reward,
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reward (kibblings)
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setReward(Math.max(0, reward - 1))}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
            >
              −
            </button>
            <span className="text-2xl font-semibold min-w-[60px] text-center">
              {reward}
            </span>
            <button
              onClick={() => setReward(reward + 1)}
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photo (optional)
          </label>
          {photoUrl ? (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Quest preview"
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
