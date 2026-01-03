/**
 * Get Kraken - Quests View Component
 *
 * Displays the quests view with search, filters, and quest cards
 */

import { useMemo, useDeferredValue } from "react";
import { InputField } from "@ffx/sdk";
import { QuestCard } from "../QuestCard";
import { AddQuestCard } from "../AddQuestCard";
import { TagFilterButtons } from "../TagFilterButtons";
import { filterItems } from "../../utils/filtering";
import { calculateUserCompletionCounts } from "../../utils/completionCount";
import { TAGS, TAG_LABELS, TAG_BUTTON_CLASSES } from "../../utils/tags";
import type { Quest, QuestLog, Tag } from "../../types";

interface QuestsViewProps {
  quests: Quest[];
  allQuestLogs: QuestLog[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: Tag | null;
  onTagSelect: (tag: Tag | null) => void;
  showDollarAmounts: boolean;
  onCreateQuest: (questData: Omit<Quest, "id" | "created_at" | "updated_at" | "completion_count">) => Promise<void>;
  onCompleteQuest: (questId: string, reward: number) => Promise<void>;
  onViewLogs: (questId: string) => void;
  onEdit: (quest: Quest) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function QuestsView({
  quests,
  allQuestLogs,
  loading,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  showDollarAmounts,
  onCreateQuest,
  onCompleteQuest,
  onViewLogs,
  onEdit,
  onShowToast,
}: QuestsViewProps) {
  const userCompletionCounts = useMemo(
    () => calculateUserCompletionCounts(allQuestLogs),
    [allQuestLogs]
  );

  // Defer filtering computation to keep input responsive while typing
  const deferredSearch = useDeferredValue(searchQuery ?? "");

  const filteredQuests = useMemo(() => {
    const q = deferredSearch.trim();
    if (!q) return quests;
    return filterItems<Quest, Tag>({
      items: quests,
      searchQuery: q,
      selectedTag,
      tagLabels: TAG_LABELS,
    });
  }, [quests, deferredSearch, selectedTag]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 header-text-color">
          Quests
        </h2>
        <div className="w-full sm:w-64">
          <InputField
            type="search"
            placeholder="Search quests..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <TagFilterButtons
        tags={TAGS}
        selectedTag={selectedTag}
        onTagSelect={onTagSelect}
        getLabel={(tag) => TAG_LABELS[tag]}
        getButtonClasses={(tag) => TAG_BUTTON_CLASSES[tag]}
      />

      {/* Render quests immediately when available - don't block on loading state */}
      {filteredQuests.length === 0 && !loading && deferredSearch ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-300">
          No quests found matching "{deferredSearch}"
        </div>
      ) : filteredQuests.length === 0 && loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading quests...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AddQuestCard
            onCreate={async (questData) => {
              await onCreateQuest({
                ...questData,
                dollar_amount: questData.dollar_amount ?? 0,
              });
              onShowToast("Quest created! 🎯", "success");
            }}
          />
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onCompleteQuest}
              onViewLogs={onViewLogs}
              onEdit={onEdit}
              showDollarAmounts={showDollarAmounts}
              userCompletionCount={userCompletionCounts[quest.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

