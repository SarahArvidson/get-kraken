/**
 * Kibblings - Gamification Panel Component
 *
 * Displays streaks, weekly recap, milestones, and ski trip progress
 */

import { useGamification } from "../hooks/useGamification";
import type { QuestLog, ShopLog } from "../types";

interface GamificationPanelProps {
  walletTotal: number;
  questLogs: QuestLog[];
  shopLogs: ShopLog[];
  questNames: Map<string, string>;
  quests: Array<{ id: string; reward: number }>;
  shopItems: Array<{ id: string; price: number }>;
  onResetProgress?: () => void;
}

export function GamificationPanel({
  walletTotal,
  questLogs,
  shopLogs,
  questNames,
  quests,
  shopItems,
  onResetProgress,
}: GamificationPanelProps) {
  const {
    weeklyRecap,
    questStreaks,
    currentMilestone,
    nextMilestone,
    skiTripProgress,
  } = useGamification({
    walletTotal,
    questLogs,
    shopLogs,
    quests,
    shopItems,
  });

  return (
    <div className="space-y-6">
      {/* Ski Trip Progress */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">🎿 Ski Trip Fund</h3>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-blue-100 mb-1">
            <span>
              {walletTotal} / {skiTripProgress.target} kibblings
            </span>
            <span>{Math.round(skiTripProgress.progress)}%</span>
          </div>
          <div className="w-full bg-blue-300 dark:bg-blue-800 rounded-full h-4 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${skiTripProgress.progress}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-blue-100">
          {skiTripProgress.remaining > 0
            ? `${skiTripProgress.remaining} more to go!`
            : "Goal reached! 🎉"}
        </p>
      </div>

      {/* Current Milestone */}
      {currentMilestone && (
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-2xl p-6 shadow-lg text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h3 className="text-xl font-bold text-white mb-1">
            {currentMilestone} Kibblings Milestone!
          </h3>
          <p className="text-sm text-amber-100">Keep it up! 🎉</p>
        </div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Next Milestone
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {nextMilestone} 🟡
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-200">
              {nextMilestone - walletTotal} to go
            </span>
          </div>
        </div>
      )}

      {/* Quest Streaks */}
      {questStreaks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔥 Daily Streaks
          </h3>
          <div className="space-y-3">
            {questStreaks
              .filter((streak) => streak.current_streak > 0)
              .sort((a, b) => b.current_streak - a.current_streak)
              .slice(0, 5)
              .map((streak) => (
                <div
                  key={streak.quest_id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white">
                    {questNames.get(streak.quest_id) || "Quest"}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {streak.current_streak} day
                    {streak.current_streak !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Weekly Recap */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 This Week
        </h3>
        {weeklyRecap ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{weeklyRecap.earned}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200">
                Earned
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                -{weeklyRecap.spent}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200">
                Spent
              </div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${
                  weeklyRecap.net >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {weeklyRecap.net >= 0 ? "+" : ""}
                {weeklyRecap.net}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200">
                Net
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-200 text-center">
            No activity this week yet
          </p>
        )}
      </div>

      {/* Reset Progress Button */}
      {onResetProgress && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <button
            onClick={onResetProgress}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors touch-manipulation"
          >
            Reset Wallet to Zero
          </button>
        </div>
      )}
    </div>
  );
}
