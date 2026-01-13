/**
 * Get Kraken v2 - Quest Detail Page
 * 
 * Shows full quest details with all v2 features (baseline for Phase 2)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { useQuestRuns, type QuestRun } from "../hooks/useQuestRuns";
import { useQuestHabits } from "../hooks/useQuestHabits";
import { useQuestTasks } from "../hooks/useQuestTasks";
import { deriveQuestSummary, deriveQuestDetail, setQuestStarred } from "../utils/questDataMapping";
import { HabitLogModal } from "../components/HabitLogModal";
import { QuestEditModal } from "../components/QuestEditModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { QuestDetail } from "../types/quests";

export function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quests, loading, getQuestWithLogs, updateQuest, completeQuest, deleteQuest } = useQuests();
  const { shopItems } = useShopItems();
  const { getCurrentRun, getPastRuns, createRun, completeRun } = useQuestRuns();
  const [questDetail, setQuestDetail] = useState<QuestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [currentRun, setCurrentRun] = useState<QuestRun | null>(null);
  const [pastRuns, setPastRuns] = useState<QuestRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/quests');
      return;
    }

    const loadQuestDetail = async () => {
      setDetailLoading(true);
      setRunsLoading(true);
      try {
        // Find quest in current list
        const quest = quests.find((q) => q.id === id);
        if (!quest) {
          // Try to load from database
          const questWithLogs = await getQuestWithLogs(id);
          if (!questWithLogs) {
            navigate('/quests');
            return;
          }
          
          // Derive summary and detail
          const userCompletionCount = questWithLogs.logs.length;
          const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
          const detail = await deriveQuestDetail(summary, questWithLogs.logs);
          setQuestDetail(detail);
        } else {
          // Load logs
          const questWithLogs = await getQuestWithLogs(id);
          if (questWithLogs) {
            const userCompletionCount = questWithLogs.logs.length;
            const summary = deriveQuestSummary(quest, userCompletionCount);
            const detail = await deriveQuestDetail(summary, questWithLogs.logs);
            setQuestDetail(detail);
          }
        }

        // Load quest runs
        const [current, past] = await Promise.all([
          getCurrentRun(id),
          getPastRuns(id),
        ]);
        setCurrentRun(current);
        setPastRuns(past);
      } catch (error) {
        console.error('Error loading quest detail:', error);
        navigate('/quests');
      } finally {
        setDetailLoading(false);
        setRunsLoading(false);
      }
    };

    if (!loading) {
      loadQuestDetail();
    }
  }, [id, quests, loading, getQuestWithLogs, getCurrentRun, getPastRuns, navigate]);

  const handleToggleStar = () => {
    if (!questDetail) return;
    const newStarred = !questDetail.isStarred;
    setQuestStarred(questDetail.id, newStarred);
    setQuestDetail({ ...questDetail, isStarred: newStarred });
  };

  const handleHabitLogComplete = async () => {
    if (!id) return;
    // Refresh habits to show updated logs
    await refreshHabits();
    // Reload quest detail to show updated logs
    const questWithLogs = await getQuestWithLogs(id);
    if (questWithLogs && questDetail) {
      const userCompletionCount = questWithLogs.logs.length;
      const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
      const detail = await deriveQuestDetail(summary, questWithLogs.logs);
      setQuestDetail(detail);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await createHabit(newHabitName.trim());
      setNewHabitName("");
      setShowAddHabitModal(false);
    } catch (error) {
      console.error("Error adding habit:", error);
      alert("Failed to add habit. Please try again.");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;
    try {
      await createTask(newTaskName.trim());
      setNewTaskName("");
      setShowAddTaskModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleLogHabit = async (habitId: string, difficulty: number, dollarsSaved: number) => {
    try {
      await logHabit(habitId, difficulty, dollarsSaved);
      await handleHabitLogComplete();
      setLoggingHabitId(null);
    } catch (error) {
      console.error("Error logging habit:", error);
      alert("Failed to log habit. Please try again.");
    }
  };

  const handleCompleteQuest = async () => {
    if (!id || !questDetail) return;
    try {
      // Complete the quest (writes to quest_logs and updates wallet)
      await completeQuest(id, questDetail.reward, questDetail.dollar_amount || 0);
      
      // If there's a current run, mark it as completed
      if (currentRun) {
        await completeRun(currentRun.id);
        setCurrentRun(null);
      }
      
      setShowCompleteConfirm(false);
      // Reload past runs to show the newly completed run
      const past = await getPastRuns(id);
      setPastRuns(past);
      // Navigate back to quests list
      navigate('/quests');
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const handleRestartQuest = async () => {
    if (!id) return;
    try {
      await createRun(id);
      // Reload current run
      const current = await getCurrentRun(id);
      setCurrentRun(current);
      // Reload past runs (in case the new run replaced something)
      const past = await getPastRuns(id);
      setPastRuns(past);
    } catch (error) {
      console.error('Error restarting quest:', error);
    }
  };

  const handleAbandonQuest = async (keepProgress: boolean) => {
    if (!id) return;
    try {
      if (!keepProgress) {
        // Delete quest logs if user wants to delete progress
        // This would require additional logic to delete logs
      }
      await deleteQuest(id);
      setShowAbandonConfirm(false);
      navigate('/quests');
    } catch (error) {
      console.error('Error abandoning quest:', error);
    }
  };

  // Get the base quest for editing
  const baseQuest = quests.find((q) => q.id === id) || null;

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
          onClick={() => navigate('/quests')}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          aria-label="Back to quests"
        >
          ← Back
        </button>
      </div>

      {/* Quest Name and Star Toggle */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">
          {questDetail.name}
        </h1>
        <button
          onClick={handleToggleStar}
          className="text-3xl transition-transform hover:scale-110 active:scale-95 touch-manipulation"
          aria-label={questDetail.isStarred ? "Unstar quest" : "Star quest"}
        >
          {questDetail.isStarred ? '⭐' : '☆'}
        </button>
      </div>

      {/* Tags */}
      {questDetail.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {questDetail.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {questDetail.description && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <p className="text-gray-700 dark:text-gray-300">{questDetail.description}</p>
        </div>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Created Date */}
        {questDetail.created_at && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
            <div className="text-gray-900 dark:text-gray-100">
              {new Date(questDetail.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Target Completion Date */}
        {questDetail.target_completion_date && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Date</div>
            <div className="text-gray-900 dark:text-gray-100">
              {new Date(questDetail.target_completion_date).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Rarity */}
        {questDetail.rarity && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rarity</div>
            <div className="text-gray-900 dark:text-gray-100 capitalize">{questDetail.rarity}</div>
          </div>
        )}

        {/* Completion Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</div>
          <div className="text-gray-900 dark:text-gray-100">
            {questDetail.userCompletionCount} time{questDetail.userCompletionCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Associated Item */}
      {questDetail.associated_item_id && (() => {
        const linkedItem = shopItems.find((item) => item.id === questDetail.associated_item_id);
        return (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 dark:text-blue-400">🔗</span>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Associated Reward
              </div>
            </div>
            <div className="text-gray-900 dark:text-gray-100 mb-2">
              {linkedItem ? (
                <>This quest is linked to <strong>{linkedItem.name}</strong></>
              ) : (
                <>This quest is linked to a reward item. View it in the Rewards library.</>
              )}
            </div>
            <button
              onClick={() => navigate(`/rewards/${questDetail.associated_item_id}`)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Reward →
            </button>
          </div>
        );
      })()}

      {/* Tasks Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tasks</h3>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors touch-manipulation"
          >
            + Add Task
          </button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet. Add one to get started!</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => toggleTask(task.id, e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                  {task.name}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habits Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Habits</h3>
          <button
            onClick={() => setShowAddHabitModal(true)}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors touch-manipulation"
          >
            + Add Habit
          </button>
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No habits yet. Add one to start tracking!</p>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const logs = habitLogs[habit.id] || [];
              const lastLog = logs[0];
              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {habit.name}
                    </div>
                    {lastLog && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Last: Difficulty {lastLog.difficulty}/10
                        {lastLog.dollars_saved > 0 && (
                          <span>, ${lastLog.dollars_saved} saved</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLoggingHabitId(habit.id)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors touch-manipulation"
                    >
                      Log
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="px-2 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      aria-label="Delete habit"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Run */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Current Run
        </h3>
        {runsLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : currentRun ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>Started: {new Date(currentRun.started_at).toLocaleDateString()}</div>
              <div>Progress logs: {questDetail.logs.filter(log => new Date(log.completed_at) >= new Date(currentRun.started_at)).length}</div>
            </div>
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              End Quest and Claim Rewards
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No active run. Start by completing the quest.
          </p>
        )}
      </div>

      {/* Past Runs */}
      {pastRuns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Past Runs
          </h3>
          <div className="space-y-3">
            {pastRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    Completed: {run.completed_at ? new Date(run.completed_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Rewards: {questDetail.reward} <img src="/sea-dollar.svg" alt="Sand dollar" className="w-3 h-3 inline-block" />
                    {questDetail.dollar_amount > 0 && (
                      <> • ${questDetail.dollar_amount.toFixed(2)}</>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRestartQuest}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Restart Quest
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Section - Visually Prominent */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">
          Rewards
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src="/sea-dollar.svg" alt="Sand dollar" className="w-6 h-6 inline-block" />
            <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              {questDetail.reward}
            </span>
          </div>
          {questDetail.dollar_amount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                ${questDetail.dollar_amount.toFixed(2)} saved
              </span>
            </div>
          )}
          {questDetail.rarity && (
            <div className="mt-4 pt-4 border-t border-amber-800/30">
              <div className="text-sm text-amber-900 dark:text-amber-100 opacity-75">
                Rarity: {questDetail.rarity}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
        >
          Edit Quest
        </button>
        <button
          onClick={() => setShowCompleteConfirm(true)}
          className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
        >
          End Quest and Claim Rewards
        </button>
        <button
          onClick={() => setShowAbandonConfirm(true)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
        >
          Abandon and Delete
        </button>
      </div>

      {/* Habit Logging Modal */}
      {loggingHabitId && (() => {
        const habit = habits.find((h) => h.id === loggingHabitId);
        if (!habit) return null;
        return (
          <HabitLogModal
            isOpen={!!loggingHabitId}
            onClose={() => setLoggingHabitId(null)}
            habitId={habit.id}
            habitName={habit.name}
            questId={id || ""}
            onLogComplete={handleHabitLogComplete}
          />
        );
      })()}

      {/* Add Habit Modal */}
      {showAddHabitModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setShowAddHabitModal(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Add habit"
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Habit</h2>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name..."
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHabit();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddHabitModal(false);
                    setNewHabitName("");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHabit}
                  disabled={!newHabitName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setShowAddTaskModal(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Add task"
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Task</h2>
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task name..."
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setNewTaskName("");
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Quest Modal */}
      {baseQuest && (
        <QuestEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          quest={baseQuest}
          onUpdate={async (id, updates) => {
            await updateQuest(id, updates);
            setShowEditModal(false);
            // Reload quest detail
            const questWithLogs = await getQuestWithLogs(id);
            if (questWithLogs) {
              const userCompletionCount = questWithLogs.logs.length;
              const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
              const detail = await deriveQuestDetail(summary, questWithLogs.logs);
              setQuestDetail(detail);
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
        message={`Are you sure you want to complete "${questDetail?.name}" and claim the rewards?`}
        confirmText="Complete Quest"
        confirmButtonClass="bg-amber-500 hover:bg-amber-600"
      />

      {/* Abandon Quest Confirmation */}
      <ConfirmDialog
        isOpen={showAbandonConfirm}
        onClose={() => setShowAbandonConfirm(false)}
        onConfirm={() => handleAbandonQuest(false)}
        title="Abandon Quest"
        message={`Are you sure you want to abandon "${questDetail?.name}"? This will delete the quest. Do you want to keep your progress logs?`}
        confirmText="Delete Progress & Abandon"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        secondaryAction={{
          label: "Keep Progress & Abandon",
          onClick: () => handleAbandonQuest(true),
          className: "bg-gray-500 hover:bg-gray-600",
        }}
      />
    </div>
  );
}
