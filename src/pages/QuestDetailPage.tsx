/**
 * Get Kraken v2 - Quest Detail Page
 *
 * Shows full quest details with all v2 features (baseline for Phase 2)
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { useQuestHabits } from "../hooks/useQuestHabits";
import { useQuestTasks } from "../hooks/useQuestTasks";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { useQuestMetadata } from "../hooks/useQuestMetadata";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  deriveQuestSummary,
  deriveQuestDetail,
  setQuestStarred,
} from "../utils/questDataMapping";
import { QuestEditModal } from "../components/QuestEditModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { HabitLogModal } from "../components/HabitLogModal";
import { TaskLogModal } from "../components/TaskLogModal";
import type { QuestDetail } from "../types/quests";

export function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    quests,
    loading,
    getQuestWithLogs,
    updateQuest,
    startQuest,
    restartQuest,
    completeQuest,
    deleteQuest,
    refresh,
  } = useQuests();
  const { shopItems } = useShopItems();
  const {
    habits,
    refresh: refreshHabits,
    createHabit,
    deleteHabit,
    habitLogs,
  } = useQuestHabits(id || null);
  const { tasks, toggleTask, createTask, deleteTask } = useQuestTasks(
    id || null
  );
  const questMetadata = useQuestMetadata();
  const { logs: allActivityLogs, loadActivityLogs } = useActivityLogs({
    questMetadata: questMetadata.metadata,
  });
  const { userId: currentUserId } = useCurrentUser();
  const [questDetail, setQuestDetail] = useState<QuestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [loggingTaskId, setLoggingTaskId] = useState<string | null>(null);
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);
  // Quest status is derived from merged quest list - single source of truth
  const baseQuest = id ? quests.find((q) => q.id === id) : null;
  const questStatus = baseQuest?.status || "idle";

  useEffect(() => {
    if (!id) {
      navigate("/quests");
      return;
    }

    const loadQuestDetail = async () => {
      setDetailLoading(true);
      try {
        // Find quest in current list
        let quest = quests.find((q) => q.id === id);
        if (!quest) {
          // Try to load from database
          const questWithLogs = await getQuestWithLogs(id);
          if (!questWithLogs) {
            navigate("/quests");
            return;
          }

          // Derive summary and detail
          const userCompletionCount = questWithLogs.logs.length;
          const summary = deriveQuestSummary(
            questWithLogs,
            userCompletionCount
          );
          const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
            associated_item_id: questWithLogs.reward_item_id || undefined,
          });
          setQuestDetail(detail);
          // Status comes from merged quest list, not from getQuestWithLogs
        } else {
          // Load logs
          const questWithLogs = await getQuestWithLogs(id);
          if (questWithLogs) {
            const userCompletionCount = questWithLogs.logs.length;
            const summary = deriveQuestSummary(quest, userCompletionCount);
            const detail = await deriveQuestDetail(
              summary,
              questWithLogs.logs,
              {
                associated_item_id: quest.reward_item_id || undefined,
              }
            );
            setQuestDetail(detail);
          }
          // Status comes from merged quest list (quest.status), not local state
        }
      } catch (error) {
        console.error("Error loading quest detail:", error);
        navigate("/quests");
      } finally {
        setDetailLoading(false);
      }
    };

    if (!loading) {
      loadQuestDetail();
    }
    // Only depend on id and loading, NOT quests - prevents flash loops when quests update
  }, [id, loading, getQuestWithLogs, navigate]);

  // Load activity logs when quest loads
  useEffect(() => {
    if (id && !loading) {
      loadActivityLogs();
    }
  }, [id, loading, loadActivityLogs]);

  // Filter activity logs for this quest and calculate live stats
  const questActivityLogs = useMemo(() => {
    if (!id) return [];
    return allActivityLogs
      .filter((log) => log.quest_id === id)
      .sort(
        (a, b) =>
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
      );
  }, [allActivityLogs, id]);

  // Calculate live stats from activity logs
  const liveStats = useMemo(() => {
    let totalSandDollars = 0;
    let totalRealDollars = 0;
    let habitLogCount = 0;
    const completedTasksCount = tasks.filter((t) => t.completed).length;
    const totalTasksCount = tasks.length;
    const completionPercentage =
      totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0;

    // Calculate days active (unique days with activity)
    const activeDays = new Set<string>();
    let questStartDate: string | null = null;

    // Calculate from activity logs (all progress for this quest)
    questActivityLogs.forEach((log) => {
      // Track unique days
      const logDate = new Date(log.logged_at).toISOString().split("T")[0];
      activeDays.add(logDate);

      // Quest start date is the earliest log date
      if (!questStartDate || log.logged_at < questStartDate) {
        questStartDate = log.logged_at;
      }

      if (log.action_type === "quest_complete") {
        // Quest completions add to sand dollars (from quest reward) and dollars
        totalSandDollars += questDetail?.reward || 0;
        totalRealDollars += log.dollars_saved || 0;
      } else if (log.action_type === "habit_log") {
        // Habit logs add to dollars only
        habitLogCount++;
        totalRealDollars += log.dollars_saved || 0;
      }
    });

    return {
      totalSandDollars,
      totalRealDollars,
      completionPercentage,
      completedTasksCount,
      totalTasksCount,
      habitLogCount,
      daysActive: activeDays.size,
      questStartDate,
    };
  }, [questActivityLogs, tasks, questDetail]);

  const handleToggleStar = () => {
    if (!questDetail) return;
    const newStarred = !questDetail.isStarred;
    setQuestStarred(questDetail.id, newStarred);
    setQuestDetail({ ...questDetail, isStarred: newStarred });
  };

  const handleCompleteQuest = async () => {
    if (!id || !questDetail) return;
    try {
      // Complete the quest (writes to quest_logs, updates wallet, and sets status to 'completed')
      await completeQuest(
        id,
        questDetail.reward,
        questDetail.dollar_amount || 0
      );
      setShowCompleteConfirm(false);
      // completeQuest already calls loadQuests() internally
      await refresh();
      navigate("/quests");
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };

  const handleStartQuest = async () => {
    console.log("[handleStartQuest] Button clicked");

    if (!id) {
      console.error("[handleStartQuest] ERROR: No quest id from URL params");
      return;
    }

    // Log the quest id being passed - this is the base quest id from URL params
    console.log(
      "[handleStartQuest] Quest id from URL:",
      id,
      "type:",
      typeof id
    );

    // Verify quest exists in list
    const questInList = quests.find((q) => q.id === id);
    if (!questInList) {
      console.warn(
        "[handleStartQuest] WARNING: Quest not found in current quests list, id:",
        id
      );
      console.log(
        "[handleStartQuest] Available quest ids:",
        quests.map((q) => q.id)
      );
    } else {
      console.log("[handleStartQuest] Found quest:", {
        id: questInList.id,
        name: questInList.name,
        currentStatus: questInList.status,
      });
    }

    try {
      console.log("[handleStartQuest] Calling startQuest...");
      await startQuest(id);
      // startQuest already calls loadQuests() internally, so just refresh to ensure UI updates
      await refresh();
      console.log(
        "[handleStartQuest] COMPLETE - UI will re-render from quests list"
      );
    } catch (error: any) {
      console.error("[handleStartQuest] ERROR:", error);
      console.error(
        "[handleStartQuest] Error details:",
        JSON.stringify(error, null, 2)
      );
      alert(`Failed to start quest: ${error.message || "Unknown error"}`);
    }
  };

  const handleRestartQuest = async () => {
    if (!id) return;
    try {
      await restartQuest(id);
      // restartQuest already calls loadQuests() internally
      await refresh();
    } catch (error) {
      console.error("Error restarting quest:", error);
    }
  };

  const handleTaskLogComplete = async () => {
    if (!id) return;
    await loadActivityLogs();
    // Refresh tasks to show updated state
    const questWithLogs = await getQuestWithLogs(id);
    if (questWithLogs && questDetail) {
      const userCompletionCount = questWithLogs.logs.length;
      const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
      const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
        associated_item_id: questWithLogs.reward_item_id || undefined,
      });
      setQuestDetail(detail);
    }
  };

  const handleHabitLogComplete = async () => {
    if (!id) return;
    await refreshHabits();
    await loadActivityLogs();
    // Reload quest detail to show updated logs
    const questWithLogs = await getQuestWithLogs(id);
    if (questWithLogs && questDetail) {
      const userCompletionCount = questWithLogs.logs.length;
      const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
      const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
        associated_item_id: questWithLogs.reward_item_id || undefined,
      });
      setQuestDetail(detail);
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // baseQuest is already declared above for status derivation - reuse it for editing

  if (detailLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading quest...</div>
      </div>
    );
  }

  if (!questDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Quest not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            navigate(
              questStatus === "active" ? "/quests?filter=active" : "/quests"
            )
          }
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          aria-label="Back to quests"
        >
          ← Back
        </button>
      </div>

      {/* 1. Quest Identity Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">
            {questDetail.name}
          </h1>
          <button
            onClick={handleToggleStar}
            className="text-3xl transition-transform hover:scale-110 active:scale-95 touch-manipulation"
            aria-label={questDetail.isStarred ? "Unstar quest" : "Star quest"}
          >
            {questDetail.isStarred ? "⭐" : "☆"}
          </button>
        </div>

        {/* Optional description */}
        {questDetail.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {questDetail.description}
          </p>
        )}
      </div>

      {/* Tasks Block */}
      {questStatus === "active" && tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Tasks
          </h2>
          <div className="space-y-2">
            {tasks
              .filter((task) => !task.completed)
              .map((task) => (
                <button
                  key={task.id}
                  onClick={() => setLoggingTaskId(task.id)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600 text-left"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    className="w-5 h-5 rounded border-gray-300 text-amber-500"
                  />
                  <span className="flex-1 text-gray-900 dark:text-gray-100">
                    {task.name}
                  </span>
                </button>
              ))}
            {tasks.filter((task) => !task.completed).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                All tasks completed! 🎉
              </p>
            )}
          </div>
        </div>
      )}

      {/* Habits Block */}
      {questStatus === "active" && habits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Habits
          </h2>
          <div className="space-y-2">
            {habits.map((habit) => {
              const lastLog = habitLogs[habit.id]?.[0];
              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {habit.name}
                    </span>
                    {lastLog && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last: {getTimeAgo(new Date(lastLog.logged_at))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setLoggingHabitId(habit.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Log
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Dashboard */}
      {questStatus === "active" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Progress
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Sand Dollars
              </div>
              <div className="flex items-center gap-1">
                <img
                  src="/sea-dollar.svg"
                  alt="Sand dollar"
                  className="w-4 h-4"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.totalSandDollars}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                💵
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">💵</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.totalRealDollars.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Tasks
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {liveStats.completedTasksCount}/{liveStats.totalTasksCount}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Habits
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {liveStats.habitLogCount}
              </div>
            </div>
          </div>
          {liveStats.questStartDate && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Started: {new Date(liveStats.questStartDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Rewards Block */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <img
              src="/sea-dollar.svg"
              alt="Sand dollar"
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {questDetail.reward}
            </span>
          </div>
          {questDetail.dollar_amount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-3xl">💵</span>
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                ${questDetail.dollar_amount.toFixed(2)}
              </span>
            </div>
          )}
          {questDetail.associated_item_id &&
            (() => {
              const linkedItem = shopItems.find(
                (item) => item.id === questDetail.associated_item_id
              );
              if (!linkedItem) return null;
              const quest = quests.find((q) => q.id === id);
              const rarity = quest?.reward_rarity;
              const rarityColors: Record<string, string> = {
                common:
                  "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                rare: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                epic: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
                legendary:
                  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
              };
              return (
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎁</span>
                  <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {linkedItem.name}
                  </span>
                  {rarity && (
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded ${
                        rarityColors[rarity] || rarityColors.common
                      }`}
                    >
                      {rarity.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })()}
        </div>
      </div>

      {/* Primary Action - Complete Quest */}
      {questStatus === "active" && (
        <button
          onClick={() => setShowCompleteConfirm(true)}
          className="w-full px-8 py-4 bg-amber-500 text-white rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors shadow-lg"
        >
          Complete Quest and Claim Rewards
        </button>
      )}

      {/* Footer - Delete Quest */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAbandonConfirm(true)}
          className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
        >
          Delete Quest
        </button>
      </div>

      {/* 2. Continue Quest Card - Primary Action Block */}
      {questStatus === "active" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Continue Quest
          </h2>

          {/* Tasks - Functional checkboxes */}
          {tasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tasks
              </h3>
              <div className="space-y-2">
                {tasks
                  .filter((task) => !task.completed)
                  .map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={async (e) => {
                          await toggleTask(task.id, e.target.checked);
                          // Refresh to show updated state
                          await refresh();
                          await loadActivityLogs();
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="flex-1 text-gray-900 dark:text-gray-100">
                        {task.name}
                      </span>
                    </label>
                  ))}
                {tasks.filter((task) => !task.completed).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    All tasks completed! 🎉
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Habits - Log buttons */}
          {habits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Habits
              </h3>
              <div className="space-y-2">
                {habits.map((habit) => {
                  const lastLog = habitLogs[habit.id]?.[0];
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {habit.name}
                        </span>
                        {lastLog && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last: {getTimeAgo(new Date(lastLog.logged_at))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setLoggingHabitId(habit.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Log
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. Live Progress Dashboard - Read-only */}
      {questStatus === "active" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Progress
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Sand Dollars
              </div>
              <div className="flex items-center gap-1">
                <img
                  src="/sea-dollar.svg"
                  alt="Sand dollar"
                  className="w-4 h-4"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.totalSandDollars}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                💵 Earned
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">💵</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.totalRealDollars.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Habit Logs
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {liveStats.habitLogCount}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Tasks
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {liveStats.completedTasksCount}/{liveStats.totalTasksCount}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Days Active
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {liveStats.daysActive}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Activity Feed - Read-only History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Activity
          </h2>
          {questActivityLogs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No activity yet. Start logging progress to see history.
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {questActivityLogs.map((log) => {
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                      {log.action_type === "habit_log" ? "H" : "Q"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {log.action_type === "habit_log"
                          ? `Logged habit: ${
                              habits.find((h) => h.id === log.habit_id)?.name ||
                              "Unknown"
                            }`
                          : log.action_type === "quest_complete"
                          ? "Quest completed"
                          : "Activity logged"}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {log.user_id === currentUserId ? (
                          <span className="text-gray-600 dark:text-gray-300">
                            You
                          </span>
                        ) : (
                          <span>User</span>
                        )}
                        {log.difficulty && log.difficulty > 0 && (
                          <span>• Difficulty: {log.difficulty}/10</span>
                        )}
                        {log.dollars_saved && log.dollars_saved > 0 && (
                          <span>• 💵 {log.dollars_saved}</span>
                        )}
                        <span>• {getTimeAgo(new Date(log.logged_at))}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Quest Structure - Edit Only */}
      {questStatus === "active" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Quest Structure
          </h2>

          {/* Tasks */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tasks
              </h3>
              <button
                onClick={async () => {
                  const name = prompt("Enter task name:");
                  if (name && name.trim() && id) {
                    try {
                      await createTask(name.trim());
                    } catch (err) {
                      console.error("Error creating task:", err);
                      alert("Failed to create task");
                    }
                  }
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Add Task
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tasks yet. Add your first task!
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      disabled
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
                    />
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {task.name}
                    </span>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete task "${task.name}"?`)) {
                          try {
                            await deleteTask(task.id);
                          } catch (err) {
                            console.error("Error deleting task:", err);
                            alert("Failed to delete task");
                          }
                        }
                      }}
                      className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habits */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Habits
              </h3>
              <button
                onClick={async () => {
                  const name = prompt("Enter habit name:");
                  if (name && name.trim() && id) {
                    try {
                      await createHabit(name.trim());
                    } catch (err) {
                      console.error("Error creating habit:", err);
                      alert("Failed to create habit");
                    }
                  }
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Add Habit
              </button>
            </div>
            {habits.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No habits yet. Add your first habit!
              </p>
            ) : (
              <div className="space-y-2">
                {habits.map((habit) => {
                  const lastLog = habitLogs[habit.id]?.[0];
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {habit.name}
                        </span>
                        {lastLog && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last: {getTimeAgo(new Date(lastLog.logged_at))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(`Delete habit "${habit.name}"?`)
                          ) {
                            try {
                              await deleteHabit(habit.id);
                            } catch (err) {
                              console.error("Error deleting habit:", err);
                              alert("Failed to delete habit");
                            }
                          }
                        }}
                        className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Quest Lifecycle Footer - Last Section */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {questStatus === "active" ? (
          <button
            onClick={() => setShowCompleteConfirm(true)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
          >
            End Quest
          </button>
        ) : questStatus === "completed" ? (
          <button
            onClick={handleRestartQuest}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
          >
            Restart Quest
          </button>
        ) : (
          <button
            onClick={handleStartQuest}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
          >
            Start Quest
          </button>
        )}
        <button
          onClick={() => setShowEditModal(true)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
        >
          Edit Quest
        </button>
        <button
          onClick={() => setShowAbandonConfirm(true)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
        >
          Abandon and Delete
        </button>
      </div>

      {/* Task Logging Modal */}
      {loggingTaskId && (
        <TaskLogModal
          isOpen={!!loggingTaskId}
          onClose={() => setLoggingTaskId(null)}
          taskId={loggingTaskId}
          taskName={tasks.find((t) => t.id === loggingTaskId)?.name || ""}
          questId={id || ""}
          onToggleTask={async (taskId: string, completed: boolean) => {
            await toggleTask(taskId, completed);
          }}
          onLogComplete={async () => {
            setLoggingTaskId(null);
            await handleTaskLogComplete();
          }}
        />
      )}

      {/* Habit Logging Modal */}
      {loggingHabitId && (
        <HabitLogModal
          isOpen={!!loggingHabitId}
          onClose={() => setLoggingHabitId(null)}
          habitId={loggingHabitId}
          habitName={habits.find((h) => h.id === loggingHabitId)?.name || ""}
          questId={id || ""}
          onLogComplete={async () => {
            setLoggingHabitId(null);
            await handleHabitLogComplete();
          }}
        />
      )}

      {/* Edit Quest Modal */}
      {baseQuest && (
        <QuestEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          quest={baseQuest}
          onUpdate={async (id, updates) => {
            console.log(
              "[QuestDetailPage] Updating quest:",
              id,
              "with updates:",
              updates
            );
            try {
              await updateQuest(id, updates);
              setShowEditModal(false);
              // Update local quest detail state directly without triggering useEffect reload
              // Status comes from merged quest list (baseQuest.status), not from getQuestWithLogs
              const questWithLogs = await getQuestWithLogs(id);
              if (questWithLogs) {
                const userCompletionCount = questWithLogs.logs.length;
                const summary = deriveQuestSummary(
                  questWithLogs,
                  userCompletionCount
                );
                const detail = await deriveQuestDetail(
                  summary,
                  questWithLogs.logs,
                  {
                    associated_item_id:
                      questWithLogs.reward_item_id || undefined,
                  }
                );
                setQuestDetail(detail);
              }
            } catch (err) {
              console.error("[QuestDetailPage] Error updating quest:", err);
              // Keep modal open on error so user can retry
            }
          }}
        />
      )}

      {/* Complete Quest Confirmation */}
      <ConfirmDialog
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={handleCompleteQuest}
        title="Complete Quest"
        message={(() => {
          if (!questDetail)
            return "Are you sure you want to complete this quest and claim the rewards?";
          const rewardParts = [];
          // Use image reference format for sand dollars (matches rewards display)
          rewardParts.push(`${questDetail.reward} sand dollars`);
          if (questDetail.dollar_amount > 0) {
            rewardParts.push(`💵 $${questDetail.dollar_amount.toFixed(2)}`);
          }
          const rewardItem = questDetail.associated_item_id
            ? shopItems.find(
                (item) => item.id === questDetail.associated_item_id
              )
            : null;
          if (rewardItem) {
            rewardParts.push(`🎁 ${rewardItem.name}`);
          }
          return `Are you sure you want to complete "${
            questDetail.name
          }" and claim the rewards?\n\nRewards: ${rewardParts.join(", ")}`;
        })()}
        confirmText="Complete Quest"
        confirmButtonClass="bg-amber-500 hover:bg-amber-600"
      />

      {/* Delete Quest Confirmation */}
      <ConfirmDialog
        isOpen={showAbandonConfirm}
        onClose={() => setShowAbandonConfirm(false)}
        onConfirm={async () => {
          if (!id) return;
          try {
            // Scrap all progress - delete logs and remove wallet entries
            await deleteQuest(id);
            setShowAbandonConfirm(false);
            navigate("/quests");
          } catch (error) {
            console.error("Error deleting quest:", error);
          }
        }}
        title="Delete Quest"
        message={`Are you sure you want to delete "${questDetail?.name}"?`}
        confirmText="Scrap all progress"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        secondaryAction={{
          label: "Keep my progress",
          onClick: async () => {
            if (!id) return;
            try {
              // Keep progress - just delete the quest, keep logs
              // Note: deleteQuest may delete logs too, so we may need to adjust this
              await deleteQuest(id);
              setShowAbandonConfirm(false);
              navigate("/quests");
            } catch (error) {
              console.error("Error deleting quest:", error);
            }
          },
          className: "bg-gray-500 hover:bg-gray-600",
        }}
      />
    </div>
  );
}
