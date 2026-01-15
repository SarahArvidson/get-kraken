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
import { deriveQuestSummary, deriveQuestDetail, setQuestStarred } from "../utils/questDataMapping";
import { QuestEditModal } from "../components/QuestEditModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ProgressLogModal } from "../components/ProgressLogModal";
import type { QuestDetail } from "../types/quests";

export function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quests, loading, getQuestWithLogs, updateQuest, startQuest, restartQuest, completeQuest, deleteQuest, refresh } = useQuests();
  const { shopItems } = useShopItems();
  const { habits, refresh: refreshHabits } = useQuestHabits(id || null);
  const { tasks, toggleTask } = useQuestTasks(id || null);
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
  const [showProgressLogModal, setShowProgressLogModal] = useState(false);
  const [questStatus, setQuestStatus] = useState<'idle' | 'active' | 'completed'>('idle');

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

  // Load activity logs when quest loads
  useEffect(() => {
    if (id && !loading) {
      loadActivityLogs();
    }
  }, [id, loading, loadActivityLogs]);

  // Filter activity logs for this quest and calculate live stats
  const questActivityLogs = useMemo(() => {
    if (!id) return [];
    return allActivityLogs.filter(log => log.quest_id === id).sort((a, b) => 
      new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );
  }, [allActivityLogs, id]);

  // Calculate live stats from activity logs
  const liveStats = useMemo(() => {
    let totalSandDollars = 0;
    let totalRealDollars = 0;
    let habitLogCount = 0;
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const totalTasksCount = tasks.length;
    const completionPercentage = totalTasksCount > 0 
      ? Math.round((completedTasksCount / totalTasksCount) * 100) 
      : 0;

    // Calculate from activity logs (all progress for this quest)
    questActivityLogs.forEach(log => {
      if (log.action_type === 'quest_complete') {
        // Quest completions add to sand dollars (from quest reward) and real dollars
        totalSandDollars += questDetail?.reward || 0;
        totalRealDollars += log.dollars_saved || 0;
      } else if (log.action_type === 'habit_log') {
        // Habit logs add to real dollars only
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
    // Reload activity logs to update live stats and feed
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
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

      {/* Lifecycle Action Buttons - Prominent at top */}
      <div className="flex flex-col sm:flex-row gap-3">
        {questStatus === 'active' ? (
          <>
            <button
              onClick={() => setShowProgressLogModal(true)}
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

      {/* Rewards Section - Visually Prominent */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            Rewards
          </h2>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-amber-900/20 dark:bg-amber-100/20 text-amber-900 dark:text-amber-100 rounded-lg font-medium hover:bg-amber-900/30 dark:hover:bg-amber-100/30 transition-colors text-sm"
          >
            Edit Rewards
          </button>
        </div>
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

      {/* Progress Dashboard - Unified Single Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Progress Dashboard
          </h2>

          {/* Live Stats - Read-only Dashboard */}
          {questStatus === 'active' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sand Dollars</div>
                <div className="flex items-center gap-1">
                  <img src="/sea-dollar.svg" alt="Sand dollar" className="w-4 h-4" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {liveStats.totalSandDollars}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Real Dollars</div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">💵</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {liveStats.totalRealDollars.toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Habit Logs</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.habitLogCount}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {liveStats.completedTasksCount}/{liveStats.totalTasksCount}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Activity Feed - Read-only History */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
          {questActivityLogs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet. Start logging progress to see history.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {questActivityLogs.map((log) => {
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                      {log.action_type === 'habit_log' ? 'H' : 'Q'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {log.action_type === 'habit_log' 
                          ? `Logged habit: ${habits.find(h => h.id === log.habit_id)?.name || 'Unknown'}` 
                          : log.action_type === 'quest_complete'
                          ? 'Quest completed'
                          : 'Activity logged'}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {log.user_id === currentUserId ? (
                          <span className="text-gray-600 dark:text-gray-300">You</span>
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
