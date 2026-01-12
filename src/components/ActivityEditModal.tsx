/**
 * Get Kraken v2 - Activity Edit Modal
 * 
 * Modal for editing activity log entries (difficulty, dollars_saved, logged_at)
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { ActivityLog } from "../hooks/useActivityLogs";

interface ActivityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityLog | null;
  onSave: (updates: {
    difficulty?: number | null;
    dollars_saved?: number | null;
    logged_at?: string;
  }) => Promise<void>;
}

export function ActivityEditModal({
  isOpen,
  onClose,
  activity,
  onSave,
}: ActivityEditModalProps) {
  const [difficulty, setDifficulty] = useState(5);
  const [dollarsSaved, setDollarsSaved] = useState("");
  const [loggedAt, setLoggedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourceUserName, setSourceUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activity) return;

    setDifficulty(activity.difficulty || 5);
    setDollarsSaved(activity.dollars_saved?.toString() || "");
    setLoggedAt(new Date(activity.logged_at).toISOString().slice(0, 16));

    // Load source user name if buddy attribution exists
    if (activity.source_user_id) {
      const loadSourceUser = async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", activity.source_user_id)
            .single();
          if (data) {
            setSourceUserName(data.username || "Buddy");
          }
        } catch (error) {
          console.error("Error loading source user:", error);
        }
      };
      loadSourceUser();
    } else {
      setSourceUserName(null);
    }
  }, [isOpen, activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    setLoading(true);
    try {
      const updates: {
        difficulty?: number | null;
        dollars_saved?: number | null;
        logged_at?: string;
      } = {};

      if (activity.action_type === 'habit_log') {
        updates.difficulty = difficulty;
        updates.dollars_saved = dollarsSaved ? parseFloat(dollarsSaved) : null;
      }

      if (loggedAt) {
        updates.logged_at = new Date(loggedAt).toISOString();
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !activity) return null;

  const canEditDifficulty = activity.action_type === 'habit_log';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Edit Activity
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Buddy Attribution */}
            {sourceUserName && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Logged by: <strong>{sourceUserName}</strong>
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Difficulty (for habit_log only) */}
              {canEditDifficulty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={difficulty}
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>1</span>
                    <span className="font-semibold">{difficulty}</span>
                    <span>10</span>
                  </div>
                </div>
              )}

              {/* Dollars Saved (for habit_log only) */}
              {canEditDifficulty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dollars Saved ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dollarsSaved}
                    onChange={(e) => setDollarsSaved(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Logged At */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={loggedAt}
                  onChange={(e) => setLoggedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Action Type Display */}
              <div className="pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type: <span className="capitalize">{activity.action_type.replace('_', ' ')}</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
