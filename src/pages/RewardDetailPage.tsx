/**
 * Get Kraken v2 - Reward Detail Page
 * 
 * Shows full reward details with purchase functionality
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShopItems } from "../hooks/useShopItems";
import { useQuests } from "../hooks/useQuests";
import { usePreferences } from "../hooks/usePreferences";
import { deriveRewardSummary, deriveRewardDetail, setRewardStarred } from "../utils/rewardDataMapping";
import type { RewardDetail } from "../types/rewards";

export function RewardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shopItems, loading, getShopItemWithLogs } = useShopItems();
  const { quests } = useQuests();
  const preferences = usePreferences();
  const [rewardDetail, setRewardDetail] = useState<RewardDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/rewards');
      return;
    }

    const loadRewardDetail = async () => {
      setDetailLoading(true);
      try {
        // Find item in current list
        const item = shopItems.find((i) => i.id === id);
        if (!item) {
          // Try to load from database
          const itemWithLogs = await getShopItemWithLogs(id);
          if (!itemWithLogs) {
            navigate('/rewards');
            return;
          }
          
          // Derive summary and detail
          const userPurchaseCount = itemWithLogs.logs.length;
          const summary = deriveRewardSummary(itemWithLogs, userPurchaseCount);
          // Load linked quest info if available
          const linkedQuest = summary.linkedQuestId
            ? quests.find((q) => q.id === summary.linkedQuestId)
            : undefined;
          const detail = await deriveRewardDetail(summary, itemWithLogs.logs, {
            linkedQuest: linkedQuest ? { id: linkedQuest.id, name: linkedQuest.name } : undefined,
          });
          setRewardDetail(detail);
        } else {
          // Load logs
          const itemWithLogs = await getShopItemWithLogs(id);
          if (itemWithLogs) {
            const userPurchaseCount = itemWithLogs.logs.length;
            const summary = deriveRewardSummary(item, userPurchaseCount);
            // Load linked quest info if available
            const linkedQuest = summary.linkedQuestId
              ? quests.find((q) => q.id === summary.linkedQuestId)
              : undefined;
            const detail = await deriveRewardDetail(summary, itemWithLogs.logs, {
              linkedQuest: linkedQuest ? { id: linkedQuest.id, name: linkedQuest.name } : undefined,
            });
            setRewardDetail(detail);
          }
        }
      } catch (error) {
        console.error('Error loading reward detail:', error);
        navigate('/rewards');
      } finally {
        setDetailLoading(false);
      }
    };

    if (!loading) {
      loadRewardDetail();
    }
  }, [id, shopItems, quests, loading, getShopItemWithLogs, navigate]);

  const handleToggleStar = () => {
    if (!rewardDetail) return;
    const newStarred = !rewardDetail.isStarred;
    setRewardStarred(rewardDetail.id, newStarred);
    setRewardDetail({ ...rewardDetail, isStarred: newStarred });
  };

  if (detailLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading reward...</div>
      </div>
    );
  }

  if (!rewardDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Reward not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rewards')}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          aria-label="Back to rewards"
        >
          ← Back
        </button>
      </div>

      {/* Reward Name and Star Toggle */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">
          {rewardDetail.name}
        </h1>
        <button
          onClick={handleToggleStar}
          className="text-3xl transition-transform hover:scale-110 active:scale-95 touch-manipulation"
          aria-label={rewardDetail.isStarred ? "Unstar reward" : "Star reward"}
        >
          {rewardDetail.isStarred ? '⭐' : '☆'}
        </button>
      </div>

      {/* Tags */}
      {rewardDetail.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {rewardDetail.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Linked Quest Indicator */}
      {rewardDetail.linkedQuest && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">🔗</span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Linked to quest: <strong>{rewardDetail.linkedQuest.name}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      {rewardDetail.description && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <p className="text-gray-700 dark:text-gray-300">{rewardDetail.description}</p>
        </div>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Created Date */}
        {rewardDetail.created_at && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
            <div className="text-gray-900 dark:text-gray-100">
              {new Date(rewardDetail.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Rarity */}
        {rewardDetail.rarity && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rarity</div>
            <div className="text-gray-900 dark:text-gray-100 capitalize">{rewardDetail.rarity}</div>
          </div>
        )}

        {/* Purchase Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Purchased</div>
          <div className="text-gray-900 dark:text-gray-100">
            {rewardDetail.userPurchaseCount} time{rewardDetail.userPurchaseCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Purchase Section - Visually Prominent */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 rounded-3xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">
          Purchase
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐚</span>
            <span className="text-xl font-semibold text-purple-900 dark:text-purple-100">
              {rewardDetail.price} sand dollars
            </span>
          </div>
          {preferences.showDollarAmounts && rewardDetail.dollar_amount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <span className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                ${rewardDetail.dollar_amount.toFixed(2)}
              </span>
            </div>
          )}
          {rewardDetail.rarity && (
            <div className="mt-4 pt-4 border-t border-purple-800/30">
              <div className="text-sm text-purple-900 dark:text-purple-100 opacity-75">
                Rarity: {rewardDetail.rarity}
              </div>
            </div>
          )}
        </div>
        {/* Purchase Button - Disabled for now */}
        <div className="mt-6">
          <button
            disabled
            className="w-full px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 rounded-lg font-semibold opacity-50 cursor-not-allowed"
          >
            Purchase (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
