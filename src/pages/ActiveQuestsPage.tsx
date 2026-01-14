/**
 * Get Kraken v2 - Active Quests Page
 * 
 * Shows only quests that are currently active (started but not completed)
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { supabase } from "../lib/supabase";
import { deriveQuestSummary } from "../utils/questDataMapping";
import { CyclingBorder } from "../components/CyclingBorder";
import type { QuestSummary } from "../types/quests";
import type { QuestLog } from "../types";

export function ActiveQuestsPage() {
  const navigate = useNavigate();
  const { quests, loading, loadAllQuestLogs } = useQuests();
  const [allQuestLogs, setAllQuestLogs] = useState<QuestLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [activeQuestIds, setActiveQuestIds] = useState<Set<string>>(new Set());
  const [activeQuestsLoading, setActiveQuestsLoading] = useState(true);

  // Load quest logs on mount
  useEffect(() => {
    loadAllQuestLogs().then((logs) => {
      setAllQuestLogs(logs);
      setLogsLoading(false);
    });
  }, [loadAllQuestLogs]);

  // Load active quest IDs (quests with active quest_runs)
  useEffect(() => {
    const loadActiveQuests = async () => {
      setActiveQuestsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          setActiveQuestIds(new Set());
          setActiveQuestsLoading(false);
          return;
        }

        const { data: runs } = await supabase
          .from("quest_runs")
          .select("quest_id")
          .eq("user_id", user.id)
          .is("completed_at", null);

        if (runs && runs.length > 0) {
          setActiveQuestIds(new Set(runs.map((r: { quest_id: string }) => r.quest_id)));
        } else {
          setActiveQuestIds(new Set());
        }
      } catch (error) {
        console.error("Error loading active quests:", error);
        setActiveQuestIds(new Set());
      } finally {
        setActiveQuestsLoading(false);
      }
    };

    if (quests.length > 0) {
      loadActiveQuests();
    }
  }, [quests]);

  // Derive QuestSummary from quests and logs
  const questSummaries = useMemo(() => {
    if (loading || logsLoading) return [];
    
    return quests.map((quest) => {
      const userCompletionCount = allQuestLogs.filter(
        (log) => log.quest_id === quest.id
      ).length;
      return deriveQuestSummary(quest, userCompletionCount);
    });
  }, [quests, allQuestLogs, loading, logsLoading]);

  // Filter to only active quests
  const activeQuests = useMemo(() => {
    return questSummaries.filter((quest) => activeQuestIds.has(quest.id));
  }, [questSummaries, activeQuestIds]);

  if (loading || logsLoading || activeQuestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading active quests...</div>
      </div>
    );
  }

  if (activeQuests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Active Quests
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No active quests. Start a quest to begin!
          </p>
        </div>
      </div>
    );
  }

  // Group by first letter
  const groupedQuests = useMemo(() => {
    const groups: Record<string, QuestSummary[]> = {};
    
    activeQuests.forEach((quest) => {
      const firstLetter = quest.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(quest);
    });

    // Sort groups alphabetically
    return Object.keys(groups)
      .sort()
      .reduce((acc, letter) => {
        acc[letter] = groups[letter].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {} as Record<string, QuestSummary[]>);
  }, [activeQuests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Active Quests
        </h1>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedQuests).map(([letter, quests]) => (
          <div key={letter}>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 sticky top-0 bg-blue-50 dark:bg-gray-900 py-2 z-10">
              {letter}
            </h2>
            <div className="space-y-2">
              {quests.map((quest) => (
                <CyclingBorder key={quest.id} tags={quest.tags}>
                  <div
                    onClick={() => navigate(`/quests/${quest.id}`)}
                    className="bg-white dark:bg-gray-800 p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {quest.name}
                    </div>
                  </div>
                </CyclingBorder>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
