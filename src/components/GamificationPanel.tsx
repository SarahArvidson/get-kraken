/**
 * Get Kraken - Gamification Panel Component
 *
 * Displays streaks, weekly recap, milestones, and customizable goals
 */

import { useState, useEffect } from "react";
import { useGamification } from "../hooks/useGamification";
import { useGoals } from "../hooks/useGoals";
import { Button, InputField, Modal } from "@ffx/sdk";
import type { QuestLog, ShopLog } from "../types";

interface GamificationPanelProps {
  walletTotal: number;
  walletDollarTotal?: number;
  questLogs: QuestLog[];
  shopLogs: ShopLog[];
  questNames: Map<string, string>;
  quests: Array<{ id: string; reward: number }>;
  shopItems: Array<{ id: string; price: number }>;
  onResetProgress?: () => void;
  onResetAllProgress?: () => void;
}

export function GamificationPanel({
  walletTotal,
  walletDollarTotal = 0,
  questLogs,
  shopLogs,
  questNames,
  quests,
  shopItems,
  onResetProgress,
  onResetAllProgress,
}: GamificationPanelProps) {
  const {
    weeklyRecap,
    questStreaks,
    currentMilestone,
    nextMilestone,
  } = useGamification({
    walletTotal,
    questLogs,
    shopLogs,
    quests,
    shopItems,
  });

  const { goals, loading: goalsLoading, createGoal, deleteGoal, checkGoalCompletion } = useGoals();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(100);
  const [goalDollarAmount, setGoalDollarAmount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // Check goal completion when wallet total changes
  useEffect(() => {
    checkGoalCompletion(walletTotal, walletDollarTotal);
  }, [walletTotal, walletDollarTotal, checkGoalCompletion]);

  const handleCreateGoal = async () => {
    if (!goalName.trim()) {
      alert("Please enter a goal name");
      return;
    }

    setIsCreating(true);
    try {
      await createGoal({
        name: goalName.trim(),
        target_amount: goalAmount,
        dollar_amount: goalDollarAmount > 0 ? goalDollarAmount : null,
      });
      setGoalName("");
      setGoalAmount(100);
      setGoalDollarAmount(0);
      setIsAddingGoal(false);
    } catch (err: any) {
      console.error("Error creating goal:", err);
      alert("Failed to create goal. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteGoal(goalId);
    } catch (err: any) {
      console.error("Error deleting goal:", err);
      alert("Failed to delete goal. Please try again.");
    }
  };


  return (
    <div className="space-y-6">
      {/* Customizable Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 header-text-color">
            Goals
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddingGoal(true)}
          >
            + Add Goal
          </Button>
        </div>

        {goalsLoading ? (
          <div className="text-center py-8 text-gray-500 dark:header-text-color">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg backdrop-blur-sm">
            <p className="text-gray-500 dark:header-text-color">
              No goals yet. Create your first goal to start tracking!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = Math.min(100, (walletTotal / goal.target_amount) * 100);
              const remaining = Math.max(0, goal.target_amount - walletTotal);
              const dollarRemaining = goal.dollar_amount ? Math.max(0, goal.dollar_amount - (walletDollarTotal || 0)) : 0;
              const isCompleted = goal.is_completed || (walletTotal >= goal.target_amount && (!goal.dollar_amount || (walletDollarTotal || 0) >= goal.dollar_amount));

              return (
                <div
                  key={goal.id}
                  className="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-2xl p-6 shadow-lg relative overflow-hidden"
                >
                  {/* Completion Overlay */}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10 rounded-2xl">
                      <div className="flex items-center gap-4 text-white">
                        <img
                          src="/kraken-icon.png"
                          alt="Kraken"
                          className="w-16 h-16 object-contain"
                        />
                        <div className="flex items-center gap-3">
                          <h3 className="text-3xl font-bold">Goal Met, Kraken Released!</h3>
                          <div className="text-6xl">✅</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Goal Content */}
                  <div className="relative z-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-white hover:text-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-blue-100 mb-1">
                        <span>
                          {walletTotal} / {goal.target_amount} sea dollars
                          {goal.dollar_amount && (
                            <span className="ml-2">
                              | 💵 {walletDollarTotal} / {goal.dollar_amount}
                            </span>
                          )}
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-blue-300 dark:bg-blue-800 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-blue-100">
                      {remaining > 0 || dollarRemaining > 0
                        ? `${remaining > 0 ? `${remaining} more sea dollars` : ''}${remaining > 0 && dollarRemaining > 0 ? ' and ' : ''}${dollarRemaining > 0 ? `💵 ${dollarRemaining} more dollars` : ''} to go!`
                        : "Goal reached! 🎉"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddingGoal}
        onClose={() => {
          setIsAddingGoal(false);
          setGoalName("");
          setGoalAmount(100);
        }}
        title="Create New Goal"
        size="md"
      >
        <div className="space-y-4">
          <InputField
            label="Goal Name"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="e.g., Save for vacation, Buy new bike, etc."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Target Amount (Sea Dollars)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGoalAmount(Math.max(0, goalAmount - 10))}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setGoalAmount(Math.max(0, val));
                }}
                className="w-32 text-center text-2xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                min="0"
              />
              <button
                onClick={() => setGoalAmount(goalAmount + 10)}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Target Amount (Dollars) <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGoalDollarAmount(Math.max(0, goalDollarAmount - 10))}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={goalDollarAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setGoalDollarAmount(Math.max(0, val));
                }}
                className="w-32 text-center text-2xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2"
                min="0"
              />
              <button
                onClick={() => setGoalDollarAmount(goalDollarAmount + 10)}
                className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddingGoal(false);
                setGoalName("");
                setGoalAmount(100);
                setGoalDollarAmount(0);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateGoal}
              loading={isCreating}
              className="flex-1"
            >
              Create Goal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Current Milestone */}
      {currentMilestone && (
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-2xl p-6 shadow-lg text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h3 className="text-xl font-bold text-white mb-1">
            {currentMilestone} Sea Dollars Milestone!
          </h3>
          <p className="text-sm text-amber-100">Keep it up! 🎉</p>
        </div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 header-text-color mb-2">
            Next Milestone
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {nextMilestone} <img src="/sea-dollar.svg" alt="Sea Dollar" className="w-6 h-6 inline" />
            </span>
            <span className="text-sm text-gray-500 header-text-color">
              {nextMilestone - walletTotal} to go
            </span>
          </div>
        </div>
      )}

      {/* Quest Streaks */}
      {questStreaks.length > 0 && (
        <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 header-text-color mb-4">
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
                  <span className="text-gray-900 header-text-color">
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
        <h3 className="text-lg font-semibold text-gray-900 header-text-color mb-4">
          📊 This Week
        </h3>
        {weeklyRecap ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{weeklyRecap.earned}
                </div>
                <div className="text-xs text-gray-500 header-text-color">Earned (Sea $)</div>
                {weeklyRecap.earnedDollars > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    💵 +{weeklyRecap.earnedDollars}
                  </div>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -{weeklyRecap.spent}
                </div>
                <div className="text-xs text-gray-500 header-text-color">Spent (Sea $)</div>
                {weeklyRecap.spentDollars > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    💵 -{weeklyRecap.spentDollars}
                  </div>
                )}
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
                <div className="text-xs text-gray-500 header-text-color">Net (Sea $)</div>
                {(weeklyRecap.netDollars !== 0) && (
                  <div className={`text-sm mt-1 ${
                    weeklyRecap.netDollars >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    💵 {weeklyRecap.netDollars >= 0 ? "+" : ""}{weeklyRecap.netDollars}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 header-text-color text-center">
            No activity this week yet
          </p>
        )}
      </div>

      {/* Reset Progress Buttons */}
      {(onResetProgress || onResetAllProgress) && (
        <div className="bg-blue-50/80 dark:bg-gray-800 rounded-2xl p-6 shadow-lg backdrop-blur-sm space-y-3">
          {onResetProgress && (
            <button
              onClick={onResetProgress}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors touch-manipulation"
            >
              Reset Wallet to Zero
            </button>
          )}
          {onResetAllProgress && (
            <button
              onClick={onResetAllProgress}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors touch-manipulation"
            >
              Reset All Progress
            </button>
          )}
        </div>
      )}
    </div>
  );
}
