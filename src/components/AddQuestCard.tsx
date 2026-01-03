/**
 * Get Kraken - Add Quest Card Component
 *
 * Card for creating new quests with image upload
 */

import { useState } from "react";
import { Button, InputField, Modal } from "@ffx/sdk";
import type { Tag } from "../types";
import { TAGS, TAG_LABELS, TAG_BUTTON_CLASSES } from "../utils/tags";
import { UnifiedNumericInput } from "./UnifiedNumericInput";

interface AddQuestCardProps {
  onCreate: (quest: {
    name: string;
    tags: Tag[];
    reward: number;
    dollar_amount?: number;
  }) => Promise<void>;
}

export function AddQuestCard({ onCreate }: AddQuestCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [reward, setReward] = useState(10);
  const [dollarAmount, setDollarAmount] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleTag = (tagOption: Tag) => {
    setTags((prev) =>
      prev.includes(tagOption)
        ? prev.filter((t) => t !== tagOption)
        : [...prev, tagOption]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Please enter a quest name");
      return;
    }

    setIsCreating(true);
    try {
      await onCreate({
        name: name.trim(),
        tags,
        reward,
        dollar_amount: dollarAmount,
      });
      // Reset form
      setName("");
      setReward(10);
      setDollarAmount(0);
      setTags([]);
      setIsOpen(false);
    } catch (err: any) {
      console.error("Error creating quest:", err);
      alert("Failed to create quest. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div
        className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-blue-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer touch-manipulation backdrop-blur-sm"
        onClick={() => setIsOpen(true)}
      >
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">➕</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Add New Quest
          </h3>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Quest"
        size="md"
      >
        <div className="space-y-4">
          <InputField
            label="Quest Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Run"
          />

          <div>
            <label htmlFor="add-quest-reward-display" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Sand Dollars
            </label>
            <UnifiedNumericInput
              value={reward}
              onSave={async (val) => setReward(val)}
              min={0}
              ariaLabel="Sand dollars reward"
            />
          </div>

          <div>
            <label htmlFor="add-quest-dollar-amount-display" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              💵 Dollars <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <UnifiedNumericInput
              value={dollarAmount}
              onSave={async (val) => setDollarAmount(val)}
              min={0}
              ariaLabel="Dollar amount"
            />
          </div>

          {/* Tag Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Category (optional)
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
              Create Quest
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
