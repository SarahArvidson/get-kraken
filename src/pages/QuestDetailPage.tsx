/**
 * Get Kraken v2 - Quest Detail Page
 *
 * Shows full quest details with all v2 features (baseline for Phase 2)
 * 
 * CURRENT QUEST PAGE INVENTORY:
 * - Buttons: Edit, Star, Add Task (conditional), Add Habit (conditional), 
 *   Complete Quest and Claim These Rewards (conditional on active), 
 *   Start Quest (idle), Restart Quest (completed), Abandon quest (active), Delete Quest (non-active)
 * - Sections: Title (always), Description (if present), Tasks (if include_tasks enabled),
 *   Habits (if include_habits enabled), Progress (if tasks OR habits enabled), 
 *   Rewards (conditional on rewards or active status)
 * - Toggle fields: include_tasks, include_habits from baseQuest (user_quest_overrides)
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { useQuestHabits } from "../hooks/useQuestHabits";
import { useQuestTasks } from "../hooks/useQuestTasks";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { useQuestMetadata } from "../hooks/useQuestMetadata";
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
import type { Quest } from "../types";

export function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    quests,
    loading,
    getQuestWithLogs,
    updateQuest,
    completeQuest,
    refresh,
  } = useQuests();
  const { shopItems } = useShopItems();
  const {
    habits,
    refresh: refreshHabits,
    createHabit,
    habitLogs,
  } = useQuestHabits(id || null);
  const { tasks, toggleTask, createTask } = useQuestTasks(id || null);
  const questMetadata = useQuestMetadata();
  const { logs: allActivityLogs, loadActivityLogs } = useActivityLogs({
    questMetadata: questMetadata.metadata,
  });
  const [questDetail, setQuestDetail] = useState<QuestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [loggingTaskId, setLoggingTaskId] = useState<string | null>(null);
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [addingHabit, setAddingHabit] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  // Quest status is derived from merged quest list - single source of truth
  // baseQuest is the merged quest (includes all overrides from user_quest_overrides)
  const baseQuest = id ? quests.find((q) => q.id === id) : null;
  const questStatus = baseQuest?.status || "idle";

  // Check if tasks/habits should be shown
  // - If explicitly true: show
  // - If explicitly false: hide (even if data exists - data is preserved but not shown)
  // - If undefined (backwards compatibility): show if there's existing data
  // Use baseQuest which has merged overrides including include_tasks/include_habits
  const includeTasksFlag = baseQuest
    ? (baseQuest as any)?.include_tasks
    : undefined;
  const showTasks =
    includeTasksFlag === true ||
    (includeTasksFlag === undefined && tasks.length > 0);

  const includeHabitsFlag = baseQuest
    ? (baseQuest as any)?.include_habits
    : undefined;
  const showHabits =
    includeHabitsFlag === true ||
    (includeHabitsFlag === undefined && habits.length > 0);

  // Hide progress area if both tasks and habits are disabled
  const showProgress = showTasks || showHabits;

  useEffect(() => {
    if (!id) {
      navigate("/quests");
      return;
    }

    const loadQuestDetail = async () => {
      setDetailLoading(true);
      try {
        // Always prefer the merged quest from quests array (includes all overrides)
        // For newly created quests, wait for it to appear in the array after refresh
        let quest: Quest | undefined = quests.find((q) => q.id === id);

        // If quest not in list yet (newly created), try to load it directly
        // But we still need to wait for overrides to be loaded/merged
        if (!quest) {
          const questWithLogs = await getQuestWithLogs(id);
          if (!questWithLogs) {
            navigate("/quests");
            return;
          }
          // Use questWithLogs as fallback, but it won't have overrides
          // The quest should appear in quests array after refresh
          quest = questWithLogs as Quest;
        }

        // Load logs (may be empty for new quests)
        const questWithLogs = await getQuestWithLogs(id);
        if (!quest) {
          navigate("/quests");
          return;
        }

        const userCompletionCount = questWithLogs?.logs.length || 0;

        // Use baseQuest (merged quest from array) for ALL fields including reward, dollar_amount
        // baseQuest has all the merged overrides including description, include_tasks, include_habits
        // If baseQuest doesn't exist yet (newly created), use quest as fallback
        const mergedQuest: Quest = baseQuest || quest;

        // Create summary from merged quest to ensure reward and dollar_amount are correct
        const summary = deriveQuestSummary(mergedQuest, userCompletionCount);

        const detail = await deriveQuestDetail(
          summary,
          questWithLogs?.logs || [],
          {
            associated_item_id: mergedQuest.reward_item_id || undefined,
            // Description comes from merged quest (includes overrides from user_quest_overrides)
            description: (mergedQuest as any).description || undefined,
          }
        );
        setQuestDetail(detail);
        // Status comes from merged quest list (baseQuest.status), not local state
      } catch (error) {
        console.error("Error loading quest detail:", error);
        navigate("/quests");
      } finally {
        setDetailLoading(false);
      }
    };

    // Load quest detail - try even if quests array is empty (for newly created quests)
    // Also reload when baseQuest changes (when overrides are loaded/updated)
    if (!loading) {
      loadQuestDetail();
    }
    // Include quests and baseQuest in dependencies so quest detail updates when quest data changes (e.g., after edit)
    // baseQuest dependency ensures we reload when overrides are merged
  }, [id, loading, quests, baseQuest, getQuestWithLogs, navigate]);

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

  const handleTaskLogComplete = async () => {
    if (!id) return;
    // Activity logs will update via real-time subscription, just refresh the view
    await loadActivityLogs();
  };

  const handleHabitLogComplete = async () => {
    if (!id) return;
    // Refresh habits and activity logs - quest detail will update via real-time subscription
    await refreshHabits();
    await loadActivityLogs();
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* 1. Quest Identity Header - Centered Title, Right-Justified Actions */}
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="flex-1"></div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 text-center flex-1">
            {questDetail.name}
          </h1>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              aria-label="Edit quest"
            >
              Edit
            </button>
            <button
              onClick={handleToggleStar}
              className="text-3xl transition-transform hover:scale-110 active:scale-95 touch-manipulation"
              aria-label={questDetail.isStarred ? "Unstar quest" : "Star quest"}
            >
              {questDetail.isStarred ? "⭐" : "☆"}
            </button>
          </div>
        </div>

        {/* Optional description */}
        {questDetail.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-center">
            {questDetail.description}
          </p>
        )}
      </div>

      {/* Tasks Block - Show if enabled or if quest already has tasks (backwards compatibility) */}
      {showTasks && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Tasks
            </h2>
            <button
              onClick={() => setAddingTask(true)}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Add Task
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            things you do once to make success in this quest possible.
          </p>
          {addingTask && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newTaskName.trim() && id) {
                    try {
                      await createTask(newTaskName.trim());
                      setNewTaskName("");
                      setAddingTask(false);
                    } catch (err) {
                      console.error("Error creating task:", err);
                    }
                  } else if (e.key === "Escape") {
                    setNewTaskName("");
                    setAddingTask(false);
                  }
                }}
                placeholder="Enter task name..."
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={async () => {
                    if (newTaskName.trim() && id) {
                      try {
                        await createTask(newTaskName.trim());
                        setNewTaskName("");
                        setAddingTask(false);
                      } catch (err) {
                        console.error("Error creating task:", err);
                      }
                    }
                  }}
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewTaskName("");
                    setAddingTask(false);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {tasks.length === 0 && !addingTask ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tasks yet. Add your first task!
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                // Find last task completion log (tasks are logged as habit_log with habit_id: null)
                // Note: activity_logs doesn't have task_id, so we show the most recent task log for this quest
                // In the future, we may add task_id to activity_logs to track individual tasks
                const taskLogs = questActivityLogs.filter(
                  (log) =>
                    log.action_type === "habit_log" && log.habit_id === null
                );
                const lastTaskLog = taskLogs.sort(
                  (a, b) =>
                    new Date(b.logged_at).getTime() -
                    new Date(a.logged_at).getTime()
                )[0];
                return (
                  <button
                    key={task.id}
                    onClick={() => setLoggingTaskId(task.id)}
                    className={`w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600 text-left ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {task.completed && "✓ "}
                        {task.name}
                      </span>
                      {lastTaskLog && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last: {getTimeAgo(new Date(lastTaskLog.logged_at))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Habits Block - Show if enabled or if quest already has habits (backwards compatibility) */}
      {showHabits && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Habits
            </h2>
            <button
              onClick={() => setAddingHabit(true)}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Add Habit
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            things you do repeatedly to be successful in this quest.
          </p>
          {addingHabit && questStatus === "active" && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newHabitName.trim() && id) {
                    try {
                      await createHabit(newHabitName.trim());
                      setNewHabitName("");
                      setAddingHabit(false);
                    } catch (err) {
                      console.error("Error creating habit:", err);
                    }
                  } else if (e.key === "Escape") {
                    setNewHabitName("");
                    setAddingHabit(false);
                  }
                }}
                placeholder="Enter habit name..."
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={async () => {
                    if (newHabitName.trim() && id) {
                      try {
                        await createHabit(newHabitName.trim());
                        setNewHabitName("");
                        setAddingHabit(false);
                      } catch (err) {
                        console.error("Error creating habit:", err);
                      }
                    }
                  }}
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewHabitName("");
                    setAddingHabit(false);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {habits.length === 0 && !addingHabit ? (
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
                      onClick={() => setLoggingHabitId(habit.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Log
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Progress Dashboard - Show for all statuses, but hide if both tasks and habits are disabled */}
      {showProgress && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Progress
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            activity you've completed and rewards you've earned on the way to
            completing this quest
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-1">
                <img
                  src="/sea-dollar.svg"
                  alt="Sand dollar"
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {liveStats.totalSandDollars}
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {liveStats.totalSandDollars}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-lg">💵</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(liveStats.totalRealDollars)}
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(liveStats.totalRealDollars)}
              </div>
            </div>
            {showTasks && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Tasks
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.completedTasksCount}/{liveStats.totalTasksCount}
                </div>
              </div>
            )}
            {showHabits && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Habits
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.habitLogCount}
                </div>
              </div>
            )}
          </div>
          {liveStats.questStartDate && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Started: {new Date(liveStats.questStartDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Rewards Section - Always shown */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
          <div className="flex items-center gap-2">
            <img
              src="/sea-dollar.svg"
              alt="Sand dollar"
              className="w-6 h-6 sm:w-7 sm:h-7"
            />
            <span className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
              {questDetail.reward}
            </span>
          </div>
          {questDetail.dollar_amount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">💵</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
                ${Math.round(questDetail.dollar_amount)}
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
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                  <span className="text-2xl sm:text-3xl">🎁</span>
                  <span className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-100">
                    {linkedItem.name}
                  </span>
                  {rarity && (
                    <span
                      className={`px-2 py-1 text-xs sm:text-sm font-bold rounded ${
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
        {/* End Quest and Claim Rewards - Always visible */}
        <button
          onClick={() => setShowCompleteConfirm(true)}
          className="w-full px-6 py-4 sm:px-8 sm:py-5 bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-base sm:text-lg leading-tight hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors shadow-xl"
        >
          End Quest and Claim Rewards
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
            try {
              console.log("[QuestDetailPage] onUpdate called - quest id:", id);
              console.log("[QuestDetailPage] Updates payload:", JSON.stringify(updates, null, 2));
              
              const result = await updateQuest(id, updates);
              console.log("[QuestDetailPage] updateQuest result:", result ? { 
                id: result.id, 
                name: result.name, 
                description: (result as any).description,
                include_tasks: (result as any).include_tasks,
                include_habits: (result as any).include_habits
              } : null);
              
              // Refresh quests list to get updated merged data (includes overrides)
              await refresh();
              console.log("[QuestDetailPage] refresh() completed");
              
              // Wait a tick for React state to update, then read fresh quests
              await new Promise(resolve => setTimeout(resolve, 0));
              
              // Read fresh quests state - use a function to get current state
              // Since we can't access current state directly, we'll use the result from updateQuest
              // which should be the merged quest, or we'll reload from the effect
              const updatedQuest = result; // updateQuest returns the merged quest
              
              console.log("[QuestDetailPage] Using updated quest from updateQuest result:", updatedQuest ? {
                id: updatedQuest.id,
                name: updatedQuest.name,
                description: (updatedQuest as any).description,
                include_tasks: (updatedQuest as any).include_tasks,
                include_habits: (updatedQuest as any).include_habits,
                reward: updatedQuest.reward,
                dollar_amount: updatedQuest.dollar_amount
              } : "NULL");
              
              // Explicitly update questDetail state from the updated quest
              if (updatedQuest && questDetail) {
                // Reload logs to get fresh data
                const questWithLogs = await getQuestWithLogs(id);
                const userCompletionCount = questWithLogs?.logs.length || 0;
                const summary = deriveQuestSummary(updatedQuest, userCompletionCount);
                const detail = await deriveQuestDetail(
                  summary,
                  questWithLogs?.logs || [],
                  {
                    associated_item_id: updatedQuest.reward_item_id || undefined,
                    description: (updatedQuest as any).description || undefined,
                  }
                );
                setQuestDetail(detail);
                console.log("[QuestDetailPage] questDetail state updated with:", {
                  name: detail.name,
                  description: detail.description,
                  reward: detail.reward,
                  dollar_amount: detail.dollar_amount,
                  include_tasks: (detail as any).include_tasks,
                  include_habits: (detail as any).include_habits
                });
              }
              
              setShowEditModal(false);
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
          // Use emoji/icon format - just use text for dialog since React components don't work in strings
          rewardParts.push(`${questDetail.reward} sand dollars`);
          if (questDetail.dollar_amount > 0) {
            rewardParts.push(`💵 $${Math.round(questDetail.dollar_amount)}`);
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

    </div>
  );
}
