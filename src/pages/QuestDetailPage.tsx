/**
 * Get Kraken v2 - Quest Detail Page
 * 
 * Shows full quest details with all v2 features (baseline for Phase 2)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { useQuestHabits } from "../hooks/useQuestHabits";
import { useQuestTasks } from "../hooks/useQuestTasks";
import { deriveQuestSummary, deriveQuestDetail, setQuestStarred } from "../utils/questDataMapping";
import { HabitLogModal } from "../components/HabitLogModal";
import { QuestEditModal } from "../components/QuestEditModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ProgressLogModal } from "../components/ProgressLogModal";
import type { QuestDetail } from "../types/quests";

export function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quests, loading, getQuestWithLogs, updateQuest, startQuest, restartQuest, completeQuest, deleteQuest, refresh } = useQuests();
  const { shopItems } = useShopItems();
  const { habits, habitLogs, createHabit, deleteHabit, refresh: refreshHabits } = useQuestHabits(id || null);
  const { tasks, createTask, toggleTask, deleteTask } = useQuestTasks(id || null);
  const [questDetail, setQuestDetail] = useState<QuestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showProgressLogModal, setShowProgressLogModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [questStatus, setQuestStatus] = useState<'idle' | 'active' | 'completed'>('idle');
  const [activeProgressTab, setActiveProgressTab] = useState<'tasks' | 'habits' | 'log'>('log');

  useEffect(() => {
    if (!id) {
      navigate('/quests');
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
            navigate('/quests');
            return;
          }
          
          // Derive summary and detail
          const userCompletionCount = questWithLogs.logs.length;
          const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
          const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
            associated_item_id: questWithLogs.reward_item_id || undefined,
          });
          setQuestDetail(detail);
          setQuestStatus(questWithLogs.status);
        } else {
          // Load logs
          const questWithLogs = await getQuestWithLogs(id);
          if (questWithLogs) {
            const userCompletionCount = questWithLogs.logs.length;
            const summary = deriveQuestSummary(quest, userCompletionCount);
            const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
              associated_item_id: quest.reward_item_id || undefined,
            });
            setQuestDetail(detail);
          }
          // Use effective status from merged quest (comes from override or defaults to 'idle')
          setQuestStatus(quest.status || 'idle');
        }
      } catch (error) {
        console.error('Error loading quest detail:', error);
        navigate('/quests');
      } finally {
        setDetailLoading(false);
      }
    };

    if (!loading) {
      loadQuestDetail();
    }
  }, [id, quests, loading, getQuestWithLogs, navigate]);

  // Set default tab based on content when tasks/habits change
  useEffect(() => {
    if (tasks.length > 0) {
      setActiveProgressTab('tasks');
    } else if (habits.length > 0) {
      setActiveProgressTab('habits');
    } else {
      setActiveProgressTab('log');
    }
  }, [tasks.length, habits.length]);

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
      const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
        associated_item_id: questWithLogs.reward_item_id || undefined,
      });
      setQuestDetail(detail);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await createHabit(newHabitName.trim());
      setNewHabitName("");
      setShowAddHabitModal(false);
      setActiveProgressTab('habits');
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
      setActiveProgressTab('tasks');
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleCompleteQuest = async () => {
    if (!id || !questDetail) return;
    try {
      // Complete the quest (writes to quest_logs, updates wallet, and sets status to 'completed')
      await completeQuest(id, questDetail.reward, questDetail.dollar_amount || 0);
      setQuestStatus('completed');
      setShowCompleteConfirm(false);
      // Refresh quest list to update status
      await refresh();
      navigate('/quests');
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const handleStartQuest = async () => {
    console.log('[handleStartQuest] Button clicked');
    
    if (!id) {
      console.error('[handleStartQuest] ERROR: No quest id from URL params');
      return;
    }
    
    // Log the quest id being passed - this is the base quest id from URL params
    console.log('[handleStartQuest] Quest id from URL:', id, 'type:', typeof id);
    
    // Verify this is the base quest id, not an override id
    const baseQuest = quests.find(q => q.id === id);
    if (!baseQuest) {
      console.warn('[handleStartQuest] WARNING: Quest not found in current quests list, id:', id);
      console.log('[handleStartQuest] Available quest ids:', quests.map(q => q.id));
    } else {
      console.log('[handleStartQuest] Found base quest:', { 
        id: baseQuest.id, 
        name: baseQuest.name, 
        currentStatus: baseQuest.status 
      });
    }
    
    try {
      console.log('[handleStartQuest] Calling startQuest...');
      const result = await startQuest(id);
      console.log('[handleStartQuest] startQuest returned:', result);
      
      // Refresh quests to get updated merged state (this will update questStatus via useEffect)
      console.log('[handleStartQuest] Refreshing quests...');
      await refresh();
      console.log('[handleStartQuest] Quests refreshed');
      
      // Also update local status immediately for instant UI feedback
      console.log('[handleStartQuest] Setting local status to active');
      setQuestStatus('active');
      
      console.log('[handleStartQuest] COMPLETE');
    } catch (error: any) {
      console.error('[handleStartQuest] ERROR:', error);
      console.error('[handleStartQuest] Error details:', JSON.stringify(error, null, 2));
      alert(`Failed to start quest: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRestartQuest = async () => {
    if (!id) return;
    try {
      const updated = await restartQuest(id);
      if (updated) {
        setQuestStatus('active');
        await refresh();
      }
    } catch (error) {
      console.error('Error restarting quest:', error);
    }
  };

  const handleProgressLogComplete = async () => {
    if (!id) return;
    // Refresh habits to show updated logs
    await refreshHabits();
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
          onClick={() => navigate(questStatus === 'active' ? '/quests?filter=active' : '/quests')}
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
      {/* Progress Card with Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Tab Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveProgressTab('tasks')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeProgressTab === 'tasks'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveProgressTab('habits')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeProgressTab === 'habits'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Habits
          </button>
          <button
            onClick={() => setActiveProgressTab('log')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeProgressTab === 'log'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Log
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto p-4">
          {activeProgressTab === 'tasks' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-end">
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
          )}

          {activeProgressTab === 'habits' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-end">
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
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {habit.name}
                          </div>
                          {lastLog && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Last: Difficulty {lastLog.difficulty}/10
                              {lastLog.dollars_saved > 0 && (
                                <span>, 💵 {lastLog.dollars_saved}</span>
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
          )}

          {activeProgressTab === 'log' && (
            <div className="flex flex-col gap-3">
              {questStatus === 'active' ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track your progress by logging tasks and habits.
                  </p>
                  <button
                    onClick={() => setShowProgressLogModal(true)}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Open Progress Log
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start the quest to begin logging progress.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Rewards Section - Visually Prominent */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">
          Rewards
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <img src="/sea-dollar.svg" alt="Sand dollar" className="w-6 h-6 inline-block" />
            <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              {questDetail.reward}
            </span>
          </div>
          {questDetail.dollar_amount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">💵</span>
              <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                ${questDetail.dollar_amount.toFixed(2)}
              </span>
            </div>
          )}
          {questDetail.associated_item_id && (() => {
            const linkedItem = shopItems.find((item) => item.id === questDetail.associated_item_id);
            if (!linkedItem) return null;
            const quest = quests.find((q) => q.id === id);
            const rarity = quest?.reward_rarity;
            const rarityColors: Record<string, string> = {
              common: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
              rare: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
              epic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
              legendary: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
            };
            return (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                  {linkedItem.name}
                </span>
                {rarity && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${rarityColors[rarity] || rarityColors.common}`}>
                    {rarity.toUpperCase()}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Lifecycle Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {questStatus === 'active' ? (
          <>
            <button
              onClick={() => {
                setShowProgressLogModal(true);
                setActiveProgressTab('log');
              }}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Log Progress
            </button>
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              End Quest
            </button>
          </>
        ) : questStatus === 'completed' ? (
          <button
            onClick={handleRestartQuest}
            className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            Restart Quest
          </button>
        ) : (
          <button
            onClick={handleStartQuest}
            className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            Start Quest
          </button>
        )}
      </div>

      {/* Secondary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
        >
          Edit Quest
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

      {/* Progress Logging Modal */}
      <ProgressLogModal
        isOpen={showProgressLogModal}
        onClose={() => setShowProgressLogModal(false)}
        questId={id || ""}
        tasks={tasks}
        habits={habits}
        onToggleTask={toggleTask}
        onProgressComplete={handleProgressLogComplete}
      />

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
              const detail = await deriveQuestDetail(summary, questWithLogs.logs, {
                associated_item_id: questWithLogs.reward_item_id || undefined,
              });
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
        message={(() => {
          if (!questDetail) return "Are you sure you want to complete this quest and claim the rewards?";
          const rewardParts = [];
          // Use image reference format for sand dollars (matches rewards display)
          rewardParts.push(`${questDetail.reward} sand dollars`);
          if (questDetail.dollar_amount > 0) {
            rewardParts.push(`💵 $${questDetail.dollar_amount.toFixed(2)}`);
          }
          const rewardItem = questDetail.associated_item_id
            ? shopItems.find((item) => item.id === questDetail.associated_item_id)
            : null;
          if (rewardItem) {
            rewardParts.push(`🎁 ${rewardItem.name}`);
          }
          return `Are you sure you want to complete "${questDetail.name}" and claim the rewards?\n\nRewards: ${rewardParts.join(", ")}`;
        })()}
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
