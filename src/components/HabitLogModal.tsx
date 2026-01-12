/**
 * Get Kraken v2 - Habit Logging Modal
 * 
 * Modal for logging habit difficulty and money saved
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { saveLastHabitLog } from "../utils/questDataMapping";
import { logDualWriteError } from "../utils/dualWriteLogger";

interface HabitLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitId: string;
  habitName: string;
  questId: string;
  onLogComplete: () => void;
}

export function HabitLogModal({
  isOpen,
  onClose,
  habitId,
  habitName,
  questId,
  onLogComplete,
}: HabitLogModalProps) {
  const [difficulty, setDifficulty] = useState(5);
  const [savedMoney, setSavedMoney] = useState(false);
  const [dollarAmount, setDollarAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID and autofill values
  useEffect(() => {
    if (!isOpen) return;

    const loadAutofill = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Try to load from localStorage first (format: getkraken:habit-autofill:{userId}:{habitId})
        const storageKey = `getkraken:habit-autofill:${user.id}:${habitId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const autofill = JSON.parse(stored);
          setDifficulty(autofill.difficulty || 5);
          setSavedMoney(autofill.saved_money || false);
          setDollarAmount(autofill.dollars_saved?.toString() || "");
        } else {
          // Fallback to old format for compatibility
          try {
            const oldStored = localStorage.getItem(`habit_last_log_${habitId}`);
            if (oldStored) {
              const oldFormat = JSON.parse(oldStored);
              setDifficulty(oldFormat.difficulty);
              setSavedMoney(oldFormat.saved_money);
              setDollarAmount(oldFormat.dollars_saved?.toString() || "");
            }
          } catch (error) {
            // Ignore errors in fallback
          }
        }
      } catch (error) {
        console.error('Error loading autofill:', error);
      }
    };

    loadAutofill();
  }, [isOpen, habitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const dollarValue = savedMoney && dollarAmount ? parseFloat(dollarAmount) : 0;

      // Save autofill values to localStorage (new format)
      const storageKey = `getkraken:habit-autofill:${userId}:${habitId}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          difficulty,
          saved_money: savedMoney,
          dollars_saved: dollarValue || undefined,
        })
      );

      // Also save in old format for compatibility
      saveLastHabitLog(habitId, {
        difficulty,
        saved_money: savedMoney,
        dollars_saved: dollarValue || undefined,
      });

      // Create a quest_log entry (without schema changes, just basic completion)
      // This represents the habit being logged as part of quest progress
      const { error: logError } = await supabase
        .from("quest_logs")
        .insert({
          quest_id: questId,
          user_id: userId,
          completed_at: new Date().toISOString(),
        });

      if (logError) {
        console.error('Error creating quest log:', logError);
        // Don't throw - logging is best effort
      }

      // Dual-write: Also insert into activity_logs for calendar/timeline
      // This is best-effort - if it fails, the primary action (quest_log) still succeeds
      try {
        const now = new Date().toISOString();
        const { error: activityLogError } = await supabase
          .from("activity_logs")
          .insert({
            user_id: userId,
            quest_id: questId,
            habit_id: habitId, // Will be NULL if habits table doesn't exist yet, but structure is ready
            action_type: 'habit_log',
            difficulty: difficulty,
            dollars_saved: dollarValue > 0 ? dollarValue : null,
            logged_at: now,
          });

        if (activityLogError) {
          logDualWriteError(
            'habit_log',
            'activity_logs',
            activityLogError,
            userId,
            { questId, habitId, difficulty, dollarValue }
          );
          // Don't throw - activity logging is best effort, existing quest_logs still work
        }
      } catch (error) {
        logDualWriteError(
          'habit_log',
          'activity_logs',
          error,
          userId,
          { questId, habitId, difficulty, dollarValue }
        );
        // Don't throw - activity logging is best effort
      }

      // Call completion callback
      onLogComplete();

      // Close modal
      onClose();

      // Reset form
      setDifficulty(5);
      setSavedMoney(false);
      setDollarAmount("");
    } catch (error) {
      console.error('Error logging habit:', error);
      alert('Failed to log habit. Please try again.');
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
        aria-label={`Log habit: ${habitName}`}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Log Habit: {habitName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Difficulty Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty: {difficulty}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>

            {/* Money Saved Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedMoney}
                  onChange={(e) => {
                    setSavedMoney(e.target.checked);
                    if (!e.target.checked) {
                      setDollarAmount("");
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  Did you save money?
                </span>
              </label>
            </div>

            {/* Dollar Amount Input */}
            {savedMoney && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount Saved ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dollarAmount}
                  onChange={(e) => setDollarAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Logging..." : "Log Habit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
