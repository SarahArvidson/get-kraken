/**
 * Get Kraken v2 - Home Page
 *
 * Vertical layout from top to bottom:
 * - Header row (icon, title/subtitle, hamburger)
 * - Treasure chest card (full width, clickable → wallet drilldown)
 * - Two large cards row (Quests 50%, Rewards 50%)
 * - Tide Chart section (full width, progress summary)
 * - Calendar preview section (full width, clickable → full calendar)
 */

import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { WalletDisplay } from "../components/WalletDisplay";
import { useWallet } from "../hooks/useWallet";
import { usePreferences } from "../hooks/usePreferences";
import { useActivityLogs, type ActivityLog } from "../hooks/useActivityLogs";
import { useQuestMetadata } from "../hooks/useQuestMetadata";
import { useRewardMetadata } from "../hooks/useRewardMetadata";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { useGoals } from "../hooks/useGoals";
import { TAG_COLORS } from "../utils/tags";
import { CyclingBorder } from "../components/CyclingBorder";
import { GoalCreateModal } from "../components/GoalCreateModal";
import type { Tag } from "../types";

interface HomePageProps {
  onOpenWalletDrilldown: () => void;
}

export function HomePage({ onOpenWalletDrilldown }: HomePageProps) {
  const navigate = useNavigate();
  const { wallet, loading: walletLoading } = useWallet();
  const preferences = usePreferences();
  const questMetadata = useQuestMetadata();
  const rewardMetadata = useRewardMetadata();
  const { quests, refresh: refreshQuests } = useQuests();
  const { shopItems } = useShopItems();
  const { goals, createGoal, refresh: refreshGoals } = useGoals();
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const {
    logs: activityLogs,
    getActivitiesForDate,
    loading: activityLoading,
  } = useActivityLogs({
    questMetadata: questMetadata.metadata,
    rewardMetadata: rewardMetadata.metadata,
  });

  const today = useMemo(() => new Date(), []);
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  // Get active quests (quests with status = 'active')
  const activeQuests = useMemo(() => {
    return quests.filter((q) => q.status === "active");
  }, [quests]);

  // Get derived milestones (achievements, not raw logs)
  const recentMilestones = useMemo(() => {
    const milestones: Array<{ text: string; date: string }> = [];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Count quest completions
    const questCompletions = activityLogs.filter(
      (log) => log.action_type === "quest_complete"
    );
    const questCompletionsThisWeek = questCompletions.filter((log) => {
      const logDate = new Date(log.logged_at);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    // Calculate total sand dollars earned
    const totalSandDollars = wallet?.total || 0;

    // "First quest completed" milestone
    if (questCompletions.length >= 1) {
      const firstQuest = questCompletions[questCompletions.length - 1];
      milestones.push({
        text: "First quest completed",
        date: firstQuest.logged_at,
      });
    }

    // "500 sand dollars earned" milestone
    if (totalSandDollars >= 500) {
      // Find when we first hit 500 by looking at activity logs
      let runningTotal = 0;
      for (const log of activityLogs
        .filter((l) => l.action_type === "quest_complete")
        .sort(
          (a, b) =>
            new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
        )) {
        const quest = quests.find((q) => q.id === log.quest_id);
        if (quest) {
          runningTotal += quest.reward;
          if (runningTotal >= 500) {
            milestones.push({
              text: "500 sand dollars earned",
              date: log.logged_at,
            });
            break;
          }
        }
      }
    }

    // "5 quests completed this week" milestone
    if (questCompletionsThisWeek.length >= 5) {
      const fifthQuest = questCompletionsThisWeek[4];
      milestones.push({
        text: "5 quests completed this week",
        date: fifthQuest.logged_at,
      });
    }

    // Sort by date, most recent first, and take last 5
    return milestones
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [activityLogs, wallet, quests]);

  // Get tag color for a quest tag
  const getTagColorClass = (tag: Tag): string => {
    const color = TAG_COLORS[tag];
    switch (color) {
      case "blue":
        return "bg-blue-500 dark:bg-blue-500";
      case "green":
        return "bg-green-500 dark:bg-green-500";
      case "purple":
        return "bg-purple-500 dark:bg-purple-500";
      case "red":
        return "bg-red-500 dark:bg-red-500";
      case "pink":
        return "bg-pink-500 dark:bg-pink-500";
      case "cyan":
        return "bg-cyan-500 dark:bg-cyan-500";
      default:
        return "bg-gray-400 dark:bg-gray-500";
    }
  };

  // Get activities for a date with their tag colors
  // Returns all activities, with tag colors for quest completions, gray for others
  const getActivitiesForDateWithTags = (
    date: Date
  ): Array<{ activity: ActivityLog; color: string }> => {
    const activities = getActivitiesForDate(date);
    return activities.map((activity) => {
      // For quest completions with tags, use tag color
      if (
        activity.action_type === "quest_complete" &&
        activity.quest_tags &&
        activity.quest_tags.length > 0
      ) {
        const firstTag = activity.quest_tags[0] as Tag;
        return {
          activity,
          color: getTagColorClass(firstTag),
        };
      }
      // For other activities (habit logs, reward purchases), use gray
      return {
        activity,
        color: "bg-gray-400 dark:bg-gray-500",
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Treasure Chest Card - Full Width, Clickable */}
      <div
        onClick={onOpenWalletDrilldown}
        className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenWalletDrilldown();
          }
        }}
        aria-label="Open wallet details"
      >
        <WalletDisplay
          wallet={wallet}
          loading={walletLoading}
          showDollarAmounts={preferences.showDollarAmounts}
        />
      </div>

      {/* Two Large Cards Row - Quests and Rewards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Quests Card */}
        <div
          onClick={() => navigate("/quests")}
          className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-3xl p-8 sm:p-12 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] min-h-[200px] sm:min-h-[300px] flex items-center justify-center touch-manipulation"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/quests");
            }
          }}
          aria-label="Go to Quests"
        >
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Quests
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Tap to explore
            </p>
          </div>
        </div>

        {/* Rewards Card */}
        <div
          onClick={() => navigate("/rewards")}
          className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-3xl p-8 sm:p-12 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] min-h-[200px] sm:min-h-[300px] flex items-center justify-center touch-manipulation"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/rewards");
            }
          }}
          aria-label="Go to Rewards"
        >
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Rewards
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Tap to explore
            </p>
          </div>
        </div>
      </div>

      {/* Tide Chart Section - Full Width */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Tide Chart
        </h2>
        <div className="space-y-6">
          {/* My Goals */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                My Goals
              </h3>
              <button
                onClick={() => setShowCreateGoalModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm"
              >
                Create Goal
              </button>
            </div>
            {goals.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No goals yet. Create your first goal!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {goals.map((goal) => {
                  const rewardItem = goal.reward_item_id
                    ? shopItems.find((item) => item.id === goal.reward_item_id)
                    : null;
                  return (
                    <div
                      key={goal.id}
                      className="flex items-start justify-between text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => navigate(`/goals/${goal.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {goal.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <img
                              src="/sea-dollar.svg"
                              alt="Sand dollar"
                              className="w-3 h-3 inline-block"
                            />
                            {goal.sand_dollars}
                          </span>
                          {goal.dollars && goal.dollars > 0 && (
                            <span className="flex items-center gap-1">
                              <span>💵</span>${goal.dollars.toFixed(2)}
                            </span>
                          )}
                          {rewardItem && (
                            <span className="flex items-center gap-1">
                              <span>🎁</span>
                              {rewardItem.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Quests */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Active Quests
            </h3>
            {activeQuests.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No active quests. Start a quest to begin!
              </p>
            ) : (
              <div className="space-y-2">
                {activeQuests.map((quest) => (
                  <CyclingBorder key={quest.id} tags={quest.tags}>
                    <div
                      onClick={() => navigate(`/quests/${quest.id}`)}
                      className="bg-white dark:bg-gray-800 p-3 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {quest.name}
                      </div>
                    </div>
                  </CyclingBorder>
                ))}
              </div>
            )}
          </div>

          {/* Recent Milestones */}
          {recentMilestones.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recent Milestones
              </h3>
              <div className="space-y-2">
                {recentMilestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {milestone.text}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(milestone.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Preview Section - Full Width */}
      <div
        onClick={() => navigate("/calendar")}
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate("/calendar");
          }
        }}
        aria-label="Go to Calendar"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Calendar
          </h2>
          <span className="text-gray-600 dark:text-gray-300">→</span>
        </div>

        {/* Activity Grid - Last 30 Days */}
        {activityLoading ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Loading activity...
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 w-full">
              {days.map((date, index) => {
                const activitiesWithTags = getActivitiesForDateWithTags(date);
                const isToday =
                  date.toISOString().split("T")[0] ===
                  today.toISOString().split("T")[0];
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const displayActivities = activitiesWithTags.slice(0, 6);
                const overflowCount = activitiesWithTags.length - 6;

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded-sm
                      ${
                        activitiesWithTags.length === 0
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "bg-white dark:bg-gray-900 p-0.5 sm:p-1 flex flex-col"
                      }
                      ${
                        isToday
                          ? "ring-1 ring-amber-500 dark:ring-amber-400"
                          : ""
                      }
                      ${isWeekend ? "opacity-75" : ""}
                      transition-all hover:scale-105
                    `}
                    title={`${date.toLocaleDateString()}: ${
                      activitiesWithTags.length
                    } activit${activitiesWithTags.length !== 1 ? "ies" : "y"}`}
                    aria-label={`${date.toLocaleDateString()}: ${
                      activitiesWithTags.length
                    } activit${activitiesWithTags.length !== 1 ? "ies" : "y"}`}
                  >
                    {activitiesWithTags.length === 0 ? null : (
                      <>
                        <div className="grid grid-cols-3 gap-0.5 flex-1">
                          {displayActivities.map((item, tagIndex) => (
                            <div
                              key={tagIndex}
                              className={`w-full aspect-square rounded ${item.color}`}
                              title={
                                item.activity.quest_name ||
                                item.activity.action_type.replace("_", " ")
                              }
                            />
                          ))}
                        </div>
                        {overflowCount > 0 && (
                          <div className="text-[7px] sm:text-[8px] font-semibold text-gray-600 dark:text-gray-400 text-center mt-0.5">
                            +{overflowCount}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2"></div>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateGoalModal && (
        <GoalCreateModal
          isOpen={showCreateGoalModal}
          onClose={() => setShowCreateGoalModal(false)}
          onCreate={async (goalData) => {
            await createGoal({
              name: goalData.name,
              description: goalData.description || undefined,
              sand_dollars: goalData.sand_dollars,
              dollars: goalData.dollars,
              reward_item_id: goalData.reward_item_id,
              share_mode: goalData.share_mode,
            });
            await refreshGoals();
            setShowCreateGoalModal(false);
          }}
        />
      )}
    </div>
  );
}
