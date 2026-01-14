/**
 * Get Kraken v2 - Goal Detail Page
 * 
 * Displays a single goal with edit functionality
 */

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGoals } from "../hooks/useGoals";
import { useShopItems } from "../hooks/useShopItems";
import { GoalEditModal } from "../components/GoalEditModal";
import type { Goal } from "../types";

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goals, loading, updateGoal, deleteGoal, refresh } = useGoals();
  const { shopItems } = useShopItems();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id && goals.length > 0) {
      const foundGoal = goals.find((g) => g.id === id);
      setGoal(foundGoal || null);
    } else if (id && !loading && goals.length === 0) {
      // Goal not found
      setGoal(null);
    }
  }, [id, goals, loading]);

  const handleUpdate = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await updateGoal(goalId, updates);
      await refresh();
      setShowEditModal(false);
    } catch (err: any) {
      console.error("Error updating goal:", err);
      alert("Failed to update goal. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!goal || !window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }
    try {
      await deleteGoal(goal.id);
      navigate("/");
    } catch (err: any) {
      console.error("Error deleting goal:", err);
      alert("Failed to delete goal. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading goal...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Goal not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const rewardItem = goal.reward_item_id
    ? shopItems.find((item) => item.id === goal.reward_item_id)
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {goal.name}
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Back
          </button>
        </div>

        {goal.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">{goal.description}</p>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              <img src="/sea-dollar.svg" alt="Sand dollar" className="w-6 h-6 inline-block" />
            </span>
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {goal.sand_dollars}
            </span>
          </div>

          {goal.dollars && goal.dollars > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                ${goal.dollars.toFixed(2)}
              </span>
            </div>
          )}

          {rewardItem && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {rewardItem.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Edit Goal
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Delete Goal
          </button>
        </div>
      </div>

      {showEditModal && (
        <GoalEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          goal={goal}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
