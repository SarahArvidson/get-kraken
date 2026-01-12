/**
 * Get Kraken v2 - Quest Detail Page
 * 
 * Shows full quest details with all v2 features (baseline for Phase 2)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { deriveQuestSummary, deriveQuestDetail, setQuestStarred } from "../utils/questDataMapping";
import { HabitLogModal } from "../components/HabitLogModal";
import { QuestEditModal } from "../components/QuestEditModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { QuestDetail } from "../types/quests";
import type { Quest } from "../types";

export function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quests, loading, getQuestWithLogs, updateQuest, completeQuest, deleteQuest } = useQuests();
  const { shopItems } = useShopItems();
  const [questDetail, setQuestDetail] = useState<QuestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/quests');
      return;
    }

    const loadQuestDetail = async () => {
      setDetailLoading(true);
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

  const handleToggleStar = () => {
    if (!questDetail) return;
    const newStarred = !questDetail.isStarred;
    setQuestStarred(questDetail.id, newStarred);
    setQuestDetail({ ...questDetail, isStarred: newStarred });
  };

  const handleHabitLogComplete = async () => {
    if (!id) return;
    // Reload quest detail to show updated logs
    const questWithLogs = await getQuestWithLogs(id);
    if (questWithLogs && questDetail) {
      const userCompletionCount = questWithLogs.logs.length;
      const summary = deriveQuestSummary(questWithLogs, userCompletionCount);
      const detail = await deriveQuestDetail(summary, questWithLogs.logs);
      setQuestDetail(detail);
    }
  };

  const handleCompleteQuest = async () => {
    if (!id || !questDetail) return;
    try {
      await completeQuest(id, questDetail.reward, questDetail.dollar_amount || 0);
      setShowCompleteConfirm(false);
      // Navigate back to quests list
      navigate('/quests');
    } catch (error) {
      console.error('Error completing quest:', error);
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

      {/* Tasks Placeholder */}
      {questDetail.tasks && questDetail.tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Tasks</h3>
          <div className="space-y-2">
            {questDetail.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.is_completed}
                  disabled
                  className="w-5 h-5"
                />
                <span className={task.is_completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habits Section with Log Buttons */}
      {questDetail.habits && questDetail.habits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Habits</h3>
          <div className="space-y-3">
            {questDetail.habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-gray-100 font-medium">
                    {habit.name}
                  </div>
                  {habit.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {habit.description}
                    </div>
                  )}
                  {habit.lastLog && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Last: Difficulty {habit.lastLog.difficulty}/10
                      {habit.lastLog.saved_money && habit.lastLog.dollars_saved && (
                        <span>, ${habit.lastLog.dollars_saved.toFixed(2)} saved</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setLoggingHabitId(habit.id)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors touch-manipulation"
                >
                  Log
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Run Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Current Run
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Repeatable quest support coming soon
        </p>
      </div>

      {/* Past Runs Placeholder */}
      {questDetail.userCompletionCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Past Runs
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quest history and repeatability features coming soon
          </p>
        </div>
      )}

      {/* Rewards Section - Visually Prominent */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">
          Rewards
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐚</span>
            <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              {questDetail.reward} sand dollars
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
      {loggingHabitId && questDetail.habits && (
        (() => {
          const habit = questDetail.habits!.find((h) => h.id === loggingHabitId);
          if (!habit) return null;
          return (
            <HabitLogModal
              isOpen={!!loggingHabitId}
              onClose={() => setLoggingHabitId(null)}
              habitId={habit.id}
              habitName={habit.name}
              questId={questDetail.id}
              onLogComplete={handleHabitLogComplete}
            />
          );
        })()
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
