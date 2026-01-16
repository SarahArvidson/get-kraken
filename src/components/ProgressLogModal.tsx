/**
 * Get Kraken v2 - Progress Logging Modal
 * 
 * Modal for logging progress on a quest (tasks and habits)
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { logDualWriteError } from "../utils/dualWriteLogger";
import { saveLastHabitLog } from "../utils/questDataMapping";
import type { QuestTask } from "../hooks/useQuestTasks";
import type { QuestHabit } from "../hooks/useQuestHabits";

interface ProgressLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  questId: string;
  tasks: QuestTask[];
  habits: QuestHabit[];
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onProgressComplete: () => void;
  mode?: 'habit' | 'task' | 'note' | null; // Intent mode for contextual opening
}

export function ProgressLogModal({
  isOpen,
  onClose,
  questId,
  tasks,
  habits,
  onToggleTask,
  onProgressComplete,
  mode = null,
}: ProgressLogModalProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [habitLogs, setHabitLogs] = useState<Record<string, { difficulty: number; dollarsSaved: number }>>({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID
  useEffect(() => {
    if (!isOpen) return;

    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTaskIds(new Set());
      setHabitLogs({});
    }
  }, [isOpen]);

  const handleToggleTask = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  const handleHabitDifficultyChange = (habitId: string, difficulty: number) => {
    setHabitLogs((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        difficulty,
        dollarsSaved: prev[habitId]?.dollarsSaved || 0,
      },
    }));
  };

  const handleHabitDollarChange = (habitId: string, value: string) => {
    const dollarsSaved = value ? parseFloat(value) || 0 : 0;
    setHabitLogs((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        difficulty: prev[habitId]?.difficulty || 5,
        dollarsSaved,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      // Toggle selected tasks (only uncompleted tasks can be toggled)
      for (const taskId of selectedTaskIds) {
        const task = tasks.find((t) => t.id === taskId);
        if (task && !task.completed) {
          await onToggleTask(taskId, true);
        }
      }

      // Log habits - write to habit_logs and activity_logs
      for (const [habitId, log] of Object.entries(habitLogs)) {
        if (log.difficulty > 0) {
          const dollarValue = log.dollarsSaved || 0;

          // Save autofill values
          const storageKey = `getkraken:habit-autofill:${userId}:${habitId}`;
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              difficulty: log.difficulty,
              saved_money: dollarValue > 0,
              dollars_saved: dollarValue || undefined,
            })
          );

          // Also save in old format for compatibility
          saveLastHabitLog(habitId, {
            difficulty: log.difficulty,
            saved_money: dollarValue > 0,
            dollars_saved: dollarValue || undefined,
          });

          // Insert into habit_logs (primary table)
          const { data: habitLogData, error: logError } = await supabase
            .from("habit_logs")
            .insert({
              habit_id: habitId,
              user_id: userId,
              difficulty: log.difficulty,
              dollars_saved: dollarValue,
              logged_at: new Date().toISOString(),
            })
            .select();

          if (logError) {
            console.error('Error creating habit log:', logError);
            console.error('Supabase error details:', JSON.stringify(logError, null, 2));
            throw logError;
          }

          if (!habitLogData || habitLogData.length === 0) {
            console.error('Habit log insert returned no data');
            throw new Error('Failed to create habit log: no data returned');
          }

          // Dual-write: Also insert into activity_logs for calendar/timeline
          try {
            const now = new Date().toISOString();
            const { data: activityLogData, error: activityLogError } = await supabase
              .from("activity_logs")
              .insert({
                user_id: userId,
                quest_id: questId || null,
                habit_id: habitId,
                action_type: 'habit_log',
                difficulty: log.difficulty,
                dollars_saved: dollarValue > 0 ? dollarValue : null,
                logged_at: now,
              })
              .select();

            if (activityLogError) {
              console.error('Error creating activity log:', activityLogError);
              console.error('Supabase error details:', JSON.stringify(activityLogError, null, 2));
              logDualWriteError(
                'habit_log',
                'activity_logs',
                activityLogError,
                userId,
                { questId, habitId, difficulty: log.difficulty, dollarValue }
              );
            } else if (!activityLogData || activityLogData.length === 0) {
              console.error('Activity log insert returned no data');
            }
          } catch (error: any) {
            console.error('Exception creating activity log:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            logDualWriteError(
              'habit_log',
              'activity_logs',
              error,
              userId,
              { questId, habitId, difficulty: log.difficulty, dollarValue }
            );
          }
        }
      }

      // Call completion callback
      onProgressComplete();

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error logging progress:', error);
      alert('Failed to log progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Log Progress"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {mode === "habit"
                  ? "Log a Habit"
                  : mode === "task"
                  ? "Complete Tasks"
                  : mode === "note"
                  ? "Add a Note"
                  : "Log Progress"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form id="progress-log-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Tasks Section - Show if mode is 'task' or null (all modes) */}
              {tasks.length > 0 && (mode === 'task' || mode === null) && (
                <div>
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <label
                        key={task.id}
                        className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${
                          task.completed ? "opacity-60" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed || selectedTaskIds.has(task.id)}
                          onChange={(e) => {
                            if (!task.completed) {
                              handleToggleTask(task.id, e.target.checked);
                            }
                          }}
                          disabled={task.completed}
                          className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 disabled:opacity-50"
                        />
                        <span className="flex-1 text-gray-900 dark:text-gray-100">
                          {task.completed && "✓ "}
                          {task.name}
                        </span>
                      </label>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No tasks yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Habits Section - Show if mode is 'habit' or null (all modes) */}
              {habits.length > 0 && (mode === 'habit' || mode === null) && (
                <div>
                  <div className="space-y-4">
                    {habits.map((habit) => (
                      <div
                        key={habit.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {habit.name}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Difficulty (1-10)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={habitLogs[habit.id]?.difficulty || 5}
                            onChange={(e) =>
                              handleHabitDifficultyChange(
                                habit.id,
                                parseInt(e.target.value) || 5
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dollars Saved (Optional)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={habitLogs[habit.id]?.dollarsSaved?.toString() || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              handleHabitDollarChange(habit.id, value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === '.' || e.key === ',') {
                                e.preventDefault();
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && habits.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No tasks or habits to log progress on.
                </p>
              )}

            </form>
          </div>
          {/* Buttons - Fixed at bottom */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="progress-log-form"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Progress"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}