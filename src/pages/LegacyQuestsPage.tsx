/**
 * Get Kraken v2 - Legacy Quests Page (v1 QuestsView)
 * 
 * Temporary wrapper to preserve v1 functionality during Phase 1
 * TODO: Replace with new QuestsPage in Phase 2
 */

import { QuestsView } from "../components/views/QuestsView";
import type { Quest, QuestLog, Tag } from "../types";

interface LegacyQuestsPageProps {
  quests: Quest[];
  allQuestLogs: QuestLog[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: Tag | null;
  onTagSelect: (tag: Tag | null) => void;
  showDollarAmounts: boolean;
  onCreateQuest: (quest: Omit<Quest, "id" | "created_at" | "updated_at" | "completion_count">) => Promise<void>;
  onCompleteQuest: (questId: string, reward: number) => Promise<void>;
  onViewLogs: (questId: string) => Promise<void>;
  onEdit: (quest: Quest) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export function LegacyQuestsPage(props: LegacyQuestsPageProps) {
  return <QuestsView {...props} />;
}
