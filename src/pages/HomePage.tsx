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
import { WalletDisplay } from "../components/WalletDisplay";
import { useWallet } from "../hooks/useWallet";
import { usePreferences } from "../hooks/usePreferences";
import { useActivityLogs, type ActivityLog } from "../hooks/useActivityLogs";
import { useQuestMetadata } from "../hooks/useQuestMetadata";
import { useRewardMetadata } from "../hooks/useRewardMetadata";
import { TAG_COLORS } from "../utils/tags";
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
  const { getActivitiesForDate, loading: activityLoading } = useActivityLogs({
    questMetadata: questMetadata.metadata,
    rewardMetadata: rewardMetadata.metadata,
  });

  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

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
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Your progress at a glance
          </p>
          {/* TODO: Add actual progress content from v1 ProgressView */}
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Progress summary coming soon...
          </div>
        </div>
      </div>

      {/* Calendar Preview Section - Full Width */}
      <div
        onClick={() => navigate("/calendar")}
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-3xl p-6 sm:p-8 shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
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
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                          : "bg-white dark:bg-gray-900 p-1 flex flex-col"
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
                          <div className="text-[8px] font-semibold text-gray-600 dark:text-gray-400 text-center mt-0.5">
                            +{overflowCount}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
              <span>Each square = one activity</span>
              <span>•</span>
              <span>Colors = quest tags</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
