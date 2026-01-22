/**
 * Get Kraken v2 - Rewards Library Page
 * 
 * Calm list library with search, filters, and alphabetical grouping
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useShopItems } from "../hooks/useShopItems";
import { useFilterState } from "../hooks/useFilterState";
import { usePreferences } from "../hooks/usePreferences";
import { deriveRewardSummary } from "../utils/rewardDataMapping";
import { RewardCreateModal } from "../components/RewardCreateModal";
import { CyclingShopBorder } from "../components/CyclingBorder";
import { FilterDrawer } from "../components/FilterDrawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SHOP_TAG_BUTTON_CLASSES, SHOP_TAG_LABELS } from "../utils/shopTags";
import type { RewardSummary } from "../types/rewards";
import type { ShopLog, ShopTag } from "../types";

export function RewardsPage() {
  const navigate = useNavigate();
  const { shopItems, loading, loadAllShopLogs, createShopItem, deleteShopItem } = useShopItems();
  const preferences = usePreferences();
  const { shopSearchQuery, selectedShopTag, setShopSearchQuery, setSelectedShopTag } = useFilterState();
  const [allShopLogs, setAllShopLogs] = useState<ShopLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(shopSearchQuery || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<'common' | 'rare' | 'epic' | 'legendary' | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(null);

  // Load shop logs on mount
  useEffect(() => {
    loadAllShopLogs().then((logs) => {
      setAllShopLogs(logs);
      setLogsLoading(false);
    });
  }, [loadAllShopLogs]);

  // Debounce search query
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(shopSearchQuery || '');
    }, 300);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [shopSearchQuery]);

  // Derive RewardSummary from shop items and logs
  const rewardSummaries = useMemo(() => {
    if (loading || logsLoading) return [];
    
    return shopItems.map((item) => {
      const userPurchaseCount = allShopLogs.filter(
        (log) => log.shop_item_id === item.id
      ).length;
      return deriveRewardSummary(item, userPurchaseCount);
    });
  }, [shopItems, allShopLogs, loading, logsLoading]);

  // Filter and search rewards
  const filteredRewards = useMemo(() => {
    let filtered = rewardSummaries;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (reward) =>
          reward.name.toLowerCase().includes(query) ||
          reward.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedShopTag) {
      filtered = filtered.filter((reward) =>
        reward.tags.includes(selectedShopTag)
      );
    }

    // Apply rarity filter
    if (selectedRarity) {
      filtered = filtered.filter((reward) => reward.rarity === selectedRarity);
    }

    // Apply starred filter
    if (showStarredOnly) {
      filtered = filtered.filter((reward) => reward.isStarred);
    }

    // Sort A-Z
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [rewardSummaries, debouncedSearchQuery, selectedShopTag, selectedRarity, showStarredOnly]);

  // Group by first letter
  const groupedRewards = useMemo(() => {
    const groups: Record<string, RewardSummary[]> = {};
    
    filteredRewards.forEach((reward) => {
      const firstLetter = reward.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(reward);
    });

    // Sort letters
    const sortedLetters = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return { groups, sortedLetters };
  }, [filteredRewards]);

  // Get all unique tags from rewards
  const availableTags = useMemo(() => {
    const tagSet = new Set<ShopTag>();
    rewardSummaries.forEach((reward) => {
      reward.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [rewardSummaries]);

  // Get recent purchases (last 5)
  const recentPurchases = useMemo(() => {
    if (logsLoading) return [];
    const recent = allShopLogs
      .sort((a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime())
      .slice(0, 5);
    
    return recent.map((log) => {
      const reward = rewardSummaries.find((r) => r.id === log.shop_item_id);
      return reward ? { log, reward } : null;
    }).filter((item): item is { log: ShopLog; reward: RewardSummary } => item !== null);
  }, [allShopLogs, rewardSummaries, logsLoading]);

  const handleRewardClick = useCallback((rewardId: string) => {
    navigate(`/rewards/${rewardId}`);
  }, [navigate]);

  const pageRootRef = useRef<HTMLDivElement>(null);

  // Diagnostic: Identify exact element causing horizontal overflow
  type OffenderType = {
    element: Element;
    overflowRight: number;
    overflowLeft: number;
    overflow: number;
    rect: DOMRect;
    scrollWidth: number;
    clientWidth: number;
    tagName: string;
    className: string;
  };

  useEffect(() => {
    if (!pageRootRef.current) return;
    if (loading || logsLoading) return; // Wait for data to load

    const checkOverflow = () => {
      const innerWidth = window.innerWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const difference = scrollWidth - innerWidth;

      console.log(`[RewardsPage Diagnostic] innerWidth=${innerWidth}, scrollWidth=${scrollWidth}, difference=${difference}px`);

      if (scrollWidth > innerWidth) {
        console.log(`[RewardsPage Diagnostic] Overflow detected: ${difference}px`);

        let worstOffender: OffenderType | null = null;

        // Traverse ALL descendants under the Rewards page root
        const traverse = (el: Element) => {
          const rect = el.getBoundingClientRect();
          const overflowRight = rect.right - innerWidth;
          const overflowLeft = 0 - rect.left;
          const overflow = Math.max(overflowRight, overflowLeft);

          if (overflow > 0) {
            const htmlEl = el as HTMLElement;
            const elScrollWidth = htmlEl.scrollWidth || 0;
            const elClientWidth = htmlEl.clientWidth || 0;

            if (!worstOffender || overflow > worstOffender.overflow) {
              worstOffender = {
                element: el,
                overflowRight,
                overflowLeft,
                overflow,
                rect,
                scrollWidth: elScrollWidth,
                clientWidth: elClientWidth,
                tagName: el.tagName,
                className: el.className || '(no class)',
              };
            }
          }

          Array.from(el.children).forEach(traverse);
        };

        if (pageRootRef.current) {
          traverse(pageRootRef.current);
        }

        if (worstOffender !== null) {
          const offender: OffenderType = worstOffender;
          console.log(`[RewardsPage Diagnostic] Worst offender identified:`, {
            tagName: offender.tagName,
            className: offender.className,
            rect: {
              left: offender.rect.left.toFixed(1),
              right: offender.rect.right.toFixed(1),
              width: offender.rect.width.toFixed(1),
            },
            overflowRight: `${offender.overflowRight.toFixed(1)}px`,
            overflowLeft: `${offender.overflowLeft.toFixed(1)}px`,
            overflow: `${offender.overflow.toFixed(1)}px`,
            scrollWidth: offender.scrollWidth,
            clientWidth: offender.clientWidth,
            internalOverflow: offender.scrollWidth > offender.clientWidth 
              ? `${(offender.scrollWidth - offender.clientWidth).toFixed(1)}px` 
              : 'none',
          });

          // Clear all previous outlines and backgrounds
          if (pageRootRef.current) {
            const allElements = pageRootRef.current.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.outline = '';
              htmlEl.style.backgroundColor = '';
            });
          }

          // Visually outline ONLY that element
          const worst = offender.element as HTMLElement;
          worst.style.outline = '3px solid red';
          worst.style.backgroundColor = 'rgba(255,0,0,0.06)';
        } else {
          console.log(`[RewardsPage Diagnostic] No elements found with positive overflow`);
        }
      } else {
        console.log(`[RewardsPage Diagnostic] No overflow detected - scrollWidth === innerWidth`);
      }
    };

    // Check after initial render and data load, and on resize
    const timeoutId = setTimeout(checkOverflow, 200);
    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
      // Remove all outlines and backgrounds on cleanup
      if (pageRootRef.current) {
        const allElements = pageRootRef.current.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.outline = '';
          htmlEl.style.backgroundColor = '';
        });
      }
    };
  }, [loading, logsLoading]);

  if (loading || logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading rewards...</div>
      </div>
    );
  }

  if (rewardSummaries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No rewards yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first reward to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRootRef} className="space-y-6">
      {/* Search, Filter, and Create Item Buttons */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search rewards..."
            value={shopSearchQuery}
            onChange={(e) => setShopSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        {/* Filter Button */}
        <button
          onClick={() => setShowFilterDrawer(true)}
          className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation font-medium"
          aria-label="Open filters"
        >
          Filter
        </button>
        {/* Create Item Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors touch-manipulation"
          aria-label="Create new reward item"
        >
          Create Item
        </button>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Filter Rewards"
      >
        <div className="space-y-6">
          {/* Tags Section */}
          {availableTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedShopTag(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    selectedShopTag === null
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Tags
                </button>
                {availableTags.map((tag) => {
                  const tagClasses = SHOP_TAG_BUTTON_CLASSES[tag];
                  const isActive = selectedShopTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedShopTag(isActive ? null : tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation border-2 ${
                        isActive ? tagClasses.active : tagClasses.base
                      }`}
                    >
                      {SHOP_TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reward Rarity Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Rarity
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRarity(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                  selectedRarity === null
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Rarity
              </button>
              {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation capitalize ${
                    selectedRarity === rarity
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {/* Starred Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Starred
            </h3>
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                showStarredOnly
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {showStarredOnly ? '⭐ Starred Only' : 'All Items'}
            </button>
          </div>

          {/* Sand Dollar Value Range Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Sand Dollar Value Range
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon
            </p>
          </div>

          {/* Dollar Value Range Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Dollar Value Range
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coming soon
            </p>
          </div>
        </div>
      </FilterDrawer>

      {/* Recent Purchases Highlight (Optional, Calm) */}
      {recentPurchases.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recent Purchases
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentPurchases.map(({ reward, log }) => (
              <div
                key={log.id}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              >
                {reward.name}
                <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                  {new Date(log.purchased_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward List with Alphabetical Grouping */}
      {filteredRewards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No rewards match your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedRewards.sortedLetters.map((letter) => (
            <div key={letter}>
              {/* Sticky Letter Header */}
              <div className="sticky top-0 z-10 bg-blue-50 dark:bg-gray-800 py-2 px-4 mb-2 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {letter}
                </h3>
              </div>
              
              {/* Reward Cards for this Letter */}
              <div className="space-y-2">
                {groupedRewards.groups[letter].map((reward) => (
                    <CyclingShopBorder key={reward.id} tags={reward.tags as ShopTag[]}>
                      <div
                        className="bg-white dark:bg-gray-800 p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
                      >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0" onClick={() => handleRewardClick(reward.id)}>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {reward.name}
                          </h4>
                          {reward.isStarred && (
                            <span className="text-amber-500" aria-label="Starred">
                              ⭐
                            </span>
                          )}
                          {reward.linkedQuestId && (
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" title="Linked to quest">
                              🔗
                            </span>
                          )}
                        </div>
                        {reward.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {reward.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                            {reward.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-500">
                                +{reward.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <img src="/sea-dollar.svg" alt="Sand dollar" className="w-4 h-4 inline-block" />
                            {reward.price}
                          </span>
                          {reward.rarity && (
                            <span className="capitalize">{reward.rarity}</span>
                          )}
                          {reward.userPurchaseCount > 0 && (
                            <span>Purchased {reward.userPurchaseCount}x</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingRewardId(reward.id);
                          }}
                          className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete reward"
                          aria-label="Delete reward"
                        >
                          ✕
                        </button>
                        <span className="text-gray-400 dark:text-gray-500">→</span>
                      </div>
                    </div>
                    </div>
                  </CyclingShopBorder>
                ))}
              </div>
            </div>
          )          )}
        </div>
      )}

      {/* Create Reward Modal */}
      <RewardCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (itemData) => {
          await createShopItem(itemData);
          setShowCreateModal(false);
        }}
        showDollarAmounts={preferences.showDollarAmounts}
      />

      {/* Delete Reward Confirmation */}
      <ConfirmDialog
        isOpen={deletingRewardId !== null}
        onClose={() => setDeletingRewardId(null)}
        onConfirm={async () => {
          if (!deletingRewardId) return;
          try {
            await deleteShopItem(deletingRewardId);
            setDeletingRewardId(null);
          } catch (err) {
            console.error("Error deleting reward:", err);
            // Keep dialog open on error so user can retry
          }
        }}
        title="Delete Reward"
        message={
          deletingRewardId
            ? `Are you sure you want to delete "${rewardSummaries.find((r) => r.id === deletingRewardId)?.name || "this reward"}"?`
            : ""
        }
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
