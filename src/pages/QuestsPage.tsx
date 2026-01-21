/**
 * Get Kraken v2 - Quests Library Page
 * 
 * Calm list library with search, filters, and alphabetical grouping
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuests } from "../hooks/useQuests";
import { useFilterState } from "../hooks/useFilterState";
import { deriveQuestSummary } from "../utils/questDataMapping";
import { QuestCreateModal } from "../components/QuestCreateModal";
import { CyclingBorder } from "../components/CyclingBorder";
import { FilterDrawer } from "../components/FilterDrawer";
import { TAG_BUTTON_CLASSES, TAG_LABELS } from "../utils/tags";
import type { QuestSummary } from "../types/quests";
import type { QuestLog, Tag } from "../types";

export function QuestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { quests, loading, loadAllQuestLogs, createQuest } = useQuests();
  const { questSearchQuery, selectedQuestTag, setQuestSearchQuery, setSelectedQuestTag } = useFilterState();
  const [allQuestLogs, setAllQuestLogs] = useState<QuestLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(questSearchQuery || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  
  // Get status filter from URL
  const statusFilter = searchParams.get('filter') || 'all';

  // Load quest logs on mount
  useEffect(() => {
    loadAllQuestLogs().then((logs) => {
      setAllQuestLogs(logs);
      setLogsLoading(false);
    });
  }, [loadAllQuestLogs]);

  // Debounce search query
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(questSearchQuery || '');
    }, 300);
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [questSearchQuery]);

  // Derive QuestSummary from quests and logs
  const questSummaries = useMemo(() => {
    if (loading || logsLoading) return [];
    
    return quests.map((quest) => {
      const userCompletionCount = allQuestLogs.filter(
        (log) => log.quest_id === quest.id
      ).length;
      return deriveQuestSummary(quest, userCompletionCount);
    });
  }, [quests, allQuestLogs, loading, logsLoading]);

  // Filter and search quests
  const filteredQuests = useMemo(() => {
    let filtered = questSummaries;

    // Apply status filter (uses effective status from merged quests)
    if (statusFilter !== 'all') {
      filtered = filtered.filter((quest) => {
        const baseQuest = quests.find((q) => q.id === quest.id);
        if (!baseQuest) return false;
        // Use effective status from merged quest (comes from override or defaults to 'idle')
        return baseQuest.status === statusFilter;
      });
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (quest) =>
          quest.name.toLowerCase().includes(query) ||
          quest.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedQuestTag) {
      filtered = filtered.filter((quest) =>
        quest.tags.includes(selectedQuestTag)
      );
    }

    // Sort A-Z
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [questSummaries, debouncedSearchQuery, selectedQuestTag, statusFilter, quests]);

  // Group by first letter
  const groupedQuests = useMemo(() => {
    const groups: Record<string, QuestSummary[]> = {};
    
    filteredQuests.forEach((quest) => {
      const firstLetter = quest.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(quest);
    });

    // Sort letters
    const sortedLetters = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return { groups, sortedLetters };
  }, [filteredQuests]);

  // Get all unique tags from quests
  const availableTags = useMemo(() => {
    const tagSet = new Set<Tag>();
    questSummaries.forEach((quest) => {
      quest.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [questSummaries]);

  const handleQuestClick = useCallback((questId: string) => {
    navigate(`/quests/${questId}`);
  }, [navigate]);

  if (loading || logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading quests...</div>
      </div>
    );
  }

  if (questSummaries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No quests yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first quest to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter, and Create Quest Buttons */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="search"
            placeholder="Search quests..."
            value={questSearchQuery}
            onChange={(e) => setQuestSearchQuery(e.target.value)}
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
        {/* Create Quest Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors touch-manipulation"
          aria-label="Create new quest"
        >
          Create Quest
        </button>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSearchParams({ filter: 'all' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSearchParams({ filter: 'active' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setSearchParams({ filter: 'completed' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'completed'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Filter Quests"
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
                  onClick={() => setSelectedQuestTag(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    selectedQuestTag === null
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {availableTags.map((tag) => {
                  const tagClasses = TAG_BUTTON_CLASSES[tag];
                  const isActive = selectedQuestTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedQuestTag(isActive ? null : tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-manipulation border-2 ${
                        isActive ? tagClasses.active : tagClasses.base
                      }`}
                    >
                      {TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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

      {/* Quest List with Alphabetical Grouping */}
      {filteredQuests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No quests match your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedQuests.sortedLetters.map((letter) => (
            <div key={letter}>
              {/* Sticky Letter Header */}
              <div className="sticky top-0 z-10 bg-blue-50 dark:bg-gray-800 py-2 px-4 mb-2 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {letter}
                </h3>
              </div>
              
              {/* Quest Cards for this Letter */}
              <div className="space-y-2">
                {groupedQuests.groups[letter].map((quest) => (
                  <CyclingBorder key={quest.id} tags={quest.tags as Tag[]}>
                    <div
                      onClick={() => handleQuestClick(quest.id)}
                      className="bg-white dark:bg-gray-800 p-4 shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleQuestClick(quest.id);
                        }
                      }}
                      aria-label={`Open quest: ${quest.name}`}
                    >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {quest.name}
                          </h4>
                          {quest.isStarred && (
                            <span className="text-amber-500" aria-label="Starred">
                              ⭐
                            </span>
                          )}
                        </div>
                        {quest.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {quest.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                            {quest.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-500">
                                +{quest.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <img src="/sea-dollar.svg" alt="Sand dollar" className="w-4 h-4 inline-block" />
                            {quest.reward}
                          </span>
                          {quest.userCompletionCount > 0 && (
                            <span>Completed {quest.userCompletionCount}x</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-gray-400 dark:text-gray-500">→</span>
                      </div>
                    </div>
                    </div>
                  </CyclingBorder>
                ))}
              </div>
            </div>
          )          )}
        </div>
      )}

      {/* Create Quest Modal */}
      <QuestCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (questData) => {
          const createdQuest = await createQuest(questData);
          setShowCreateModal(false);
          // Navigate to the newly created quest's detail page
          if (createdQuest?.id) {
            navigate(`/quests/${createdQuest.id}`);
          }
        }}
      />
    </div>
  );
}
