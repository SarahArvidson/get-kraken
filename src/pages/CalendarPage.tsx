/**
 * Get Kraken v2 - Calendar Page
 * 
 * Full calendar experience with day, week, month, and year views
 */

import { useState, useEffect, useMemo } from "react";
import { useActivityLogs, type ActivityLog } from "../hooks/useActivityLogs";
import { useQuestMetadata } from "../hooks/useQuestMetadata";
import { useRewardMetadata } from "../hooks/useRewardMetadata";
import { ActivityEditModal } from "../components/ActivityEditModal";
import { supabase } from "../lib/supabase";
import { TAG_COLORS } from "../utils/tags";
import type { Tag } from "../types";

type ViewMode = 'day' | 'week' | 'month' | 'year';

export function CalendarPage() {
  const questMetadata = useQuestMetadata();
  const rewardMetadata = useRewardMetadata();
  const { logs, loading, getActivitiesForDate, updateActivityLog, loadActivityLogs } = useActivityLogs({
    questMetadata: questMetadata.metadata,
    rewardMetadata: rewardMetadata.metadata,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(null);
  const [sourceUserNames, setSourceUserNames] = useState<Record<string, string>>({});

  // Load activity logs for current view
  // Only reload when date or view mode changes, not when metadata changes
  useEffect(() => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);

    switch (viewMode) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    loadActivityLogs(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, viewMode]);

  // Load source user names for buddy attribution
  useEffect(() => {
    const loadSourceUserNames = async () => {
      const userIds = new Set<string>();
      logs.forEach((log) => {
        if (log.source_user_id) {
          userIds.add(log.source_user_id);
        }
      });

      if (userIds.size === 0) return;

      try {
        // Username is stored in user_preferences table, not profiles
        const { data } = await supabase
          .from("user_preferences")
          .select("user_id, username")
          .in("user_id", Array.from(userIds));

        if (data) {
          const names: Record<string, string> = {};
          data.forEach((pref: { user_id: string; username: string | null }) => {
            names[pref.user_id] = pref.username || "Buddy";
          });
          setSourceUserNames(names);
        }
      } catch (error) {
        console.error("Error loading source user names:", error);
      }
    };

    loadSourceUserNames();
  }, [logs]);

  // Get activities for current view
  const viewActivities = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return getActivitiesForDate(selectedDate);
      case 'week':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekActivities: ActivityLog[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          weekActivities.push(...getActivitiesForDate(date));
        }
        return weekActivities.sort((a, b) => 
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        );
      case 'month':
        return logs.filter((log) => {
          const logDate = new Date(log.logged_at);
          return logDate.getMonth() === selectedDate.getMonth() &&
                 logDate.getFullYear() === selectedDate.getFullYear();
        }).sort((a, b) => 
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        );
      case 'year':
        return logs.filter((log) => {
          const logDate = new Date(log.logged_at);
          return logDate.getFullYear() === selectedDate.getFullYear();
        }).sort((a, b) => 
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        );
      default:
        return [];
    }
  }, [viewMode, selectedDate, logs, getActivitiesForDate]);

  // Month view: Get days in month
  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewMode, selectedDate]);


  const handleSaveActivity = async (updates: {
    difficulty?: number | null;
    dollars_saved?: number | null;
    logged_at?: string;
  }) => {
    if (!editingActivity) return;
    await updateActivityLog(editingActivity.id, updates);
    setEditingActivity(null);
  };

  // Get display name from hydrated activity log
  const getActivityDisplayName = (activity: ActivityLog): string => {
    // Use hydrated quest_name or reward_name, fallback to "Activity"
    if (activity.quest_name) {
      return activity.quest_name;
    }
    if (activity.reward_name) {
      return activity.reward_name;
    }
    return "Activity";
  };

  // Get tag color class for activity dots
  const getActivityDotColor = (activity: ActivityLog): string => {
    if (activity.action_type === 'quest_complete' && activity.quest_tags && activity.quest_tags.length > 0) {
      const firstTag = activity.quest_tags[0] as Tag;
      const color = TAG_COLORS[firstTag];
      switch (color) {
        case 'blue':
          return 'bg-blue-500';
        case 'green':
          return 'bg-green-500';
        case 'purple':
          return 'bg-purple-500';
        case 'red':
          return 'bg-red-500';
        case 'pink':
          return 'bg-pink-500';
        case 'cyan':
          return 'bg-cyan-500';
        default:
          return 'bg-gray-400';
      }
    }
    return 'bg-gray-400';
  };

  // Get tag color class for activity (for border coloring)
  const getActivityTagBorderColor = (activity: ActivityLog): string => {
    if (activity.action_type === 'quest_complete' && activity.quest_tags && activity.quest_tags.length > 0) {
      const firstTag = activity.quest_tags[0] as Tag;
      const color = TAG_COLORS[firstTag];
      switch (color) {
        case 'blue':
          return 'border-l-blue-500';
        case 'green':
          return 'border-l-green-500';
        case 'purple':
          return 'border-l-purple-500';
        case 'red':
          return 'border-l-red-500';
        case 'pink':
          return 'border-l-pink-500';
        case 'cyan':
          return 'border-l-cyan-500';
        default:
          return 'border-l-gray-400';
      }
    }
    return 'border-l-gray-400';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Calendar
        </h1>
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
            else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
            else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else newDate.setFullYear(newDate.getFullYear() - 1);
            setSelectedDate(newDate);
          }}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          ←
        </button>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {viewMode === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {viewMode === 'week' && `Week of ${new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - selectedDate.getDay() + 1).toLocaleDateString()}`}
          {viewMode === 'month' && selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          {viewMode === 'year' && selectedDate.getFullYear()}
        </div>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
            else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
            else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else newDate.setFullYear(newDate.getFullYear() + 1);
            setSelectedDate(newDate);
          }}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          →
        </button>
      </div>

      {/* View Content */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          {viewActivities.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No activities on this day
            </p>
          ) : (
            viewActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => setEditingActivity(activity)}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 ${getActivityTagBorderColor(activity)} border-t border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getActivityDisplayName(activity)}
                      </span>
                      {activity.source_user_id && sourceUserNames[activity.source_user_id] && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          By {sourceUserNames[activity.source_user_id]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.logged_at).toLocaleTimeString()}
                    </p>
                    {activity.difficulty && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Difficulty: {activity.difficulty}/10
                      </p>
                    )}
                    {activity.dollars_saved && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Saved: ${activity.dollars_saved.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="space-y-3">
          {viewActivities.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No activities this week
            </p>
          ) : (
            viewActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => setEditingActivity(activity)}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 ${getActivityTagBorderColor(activity)} border-t border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getActivityDisplayName(activity)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.logged_at).toLocaleDateString()}
                      </span>
                      {activity.source_user_id && sourceUserNames[activity.source_user_id] && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          By {sourceUserNames[activity.source_user_id]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.logged_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="aspect-square" />;
              }
              const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              const dayActivities = getActivitiesForDate(date);
              const displayActivities = dayActivities.slice(0, 6);
              const overflowCount = dayActivities.length - 6;
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                  }}
                  className={`
                    aspect-square rounded p-1 cursor-pointer transition-all hover:scale-110
                    ${dayActivities.length === 0 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'bg-white dark:bg-gray-900'
                    }
                    ${isToday ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}
                    flex flex-col
                  `}
                  title={`${date.toLocaleDateString()}: ${dayActivities.length} activities`}
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {date.getDate()}
                  </div>
                  {dayActivities.length > 0 && (
                    <div className="grid grid-cols-3 gap-0.5 flex-1">
                      {displayActivities.map((activity, activityIndex) => (
                        <div
                          key={activityIndex}
                          className={`w-full aspect-square rounded ${getActivityDotColor(activity)}`}
                          title={getActivityDisplayName(activity)}
                        />
                      ))}
                    </div>
                  )}
                  {overflowCount > 0 && (
                    <div className="text-[8px] font-semibold text-gray-600 dark:text-gray-400 text-center mt-0.5">
                      +{overflowCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => {
            const monthDate = new Date(selectedDate.getFullYear(), i, 1);
            const monthStart = new Date(selectedDate.getFullYear(), i, 1);
            const monthEnd = new Date(selectedDate.getFullYear(), i + 1, 0);
            
            // Get all days in this month
            const monthDays: (Date | null)[] = [];
            const firstDayOfWeek = monthStart.getDay();
            // Add empty cells for days before month start
            for (let j = 0; j < firstDayOfWeek; j++) {
              monthDays.push(null);
            }
            // Add all days in month
            for (let day = 1; day <= monthEnd.getDate(); day++) {
              monthDays.push(new Date(selectedDate.getFullYear(), i, day));
            }
            
            return (
              <div
                key={i}
                onClick={() => {
                  setSelectedDate(monthDate);
                  setViewMode('month');
                }}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {monthDate.toLocaleDateString('en-US', { month: 'long' })}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {/* Day headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-[8px] text-center text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                  {/* Month days with activity dots */}
                  {monthDays.map((date, dayIdx) => {
                    if (!date) {
                      return <div key={dayIdx} className="aspect-square" />;
                    }
                    const dayActivities = getActivitiesForDate(date);
                    const displayActivities = dayActivities.slice(0, 1); // Show only first activity dot in year view
                    
                    return (
                      <div
                        key={dayIdx}
                        className={`aspect-square rounded-sm ${dayActivities.length === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900 p-0.5'}`}
                        title={date.toLocaleDateString()}
                      >
                        {displayActivities.length > 0 && (
                          <div className={`w-full h-full rounded ${getActivityDotColor(displayActivities[0])}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <ActivityEditModal
        isOpen={editingActivity !== null}
        onClose={() => setEditingActivity(null)}
        activity={editingActivity}
        onSave={handleSaveActivity}
      />
    </div>
  );
}
