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
import { useActivityLogs } from "../hooks/useActivityLogs";

interface HomePageProps {
  onOpenWalletDrilldown: () => void;
}

export function HomePage({ onOpenWalletDrilldown }: HomePageProps) {
  const navigate = useNavigate();
  const { wallet, loading: walletLoading } = useWallet();
  const preferences = usePreferences();
  const { getActivityCountByDate, loading: activityLoading } = useActivityLogs();

  // Get activity counts for last 30 days
  const activityCounts = getActivityCountByDate();
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  // Calculate activity intensity for color coding
  const getActivityIntensity = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const count = activityCounts[dateStr] || 0;
    if (count === 0) return 'none';
    if (count === 1) return 'low';
    if (count <= 3) return 'medium';
    return 'high';
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
          if (e.key === 'Enter' || e.key === ' ') {
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
          onClick={() => navigate('/quests')}
          className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-3xl p-8 sm:p-12 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] min-h-[200px] sm:min-h-[300px] flex items-center justify-center touch-manipulation"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/quests');
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
          onClick={() => navigate('/rewards')}
          className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-3xl p-8 sm:p-12 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] min-h-[200px] sm:min-h-[300px] flex items-center justify-center touch-manipulation"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/rewards');
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
        onClick={() => navigate('/calendar')}
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-3xl p-6 sm:p-8 shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/calendar');
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
          <div className="text-gray-500 dark:text-gray-400 text-sm">Loading activity...</div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((date, index) => {
                const intensity = getActivityIntensity(date);
                const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded
                      ${intensity === 'none' 
                        ? 'bg-gray-100 dark:bg-gray-800' 
                        : intensity === 'low'
                        ? 'bg-amber-200 dark:bg-amber-800'
                        : intensity === 'medium'
                        ? 'bg-amber-400 dark:bg-amber-700'
                        : 'bg-amber-600 dark:bg-amber-600'
                      }
                      ${isToday ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}
                      ${isWeekend ? 'opacity-75' : ''}
                      transition-all hover:scale-110
                    `}
                    title={`${date.toLocaleDateString()}: ${activityCounts[date.toISOString().split('T')[0]] || 0} activities`}
                    aria-label={`${date.toLocaleDateString()}: ${activityCounts[date.toISOString().split('T')[0]] || 0} activities`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-800" />
                <div className="w-3 h-3 rounded bg-amber-400 dark:bg-amber-700" />
                <div className="w-3 h-3 rounded bg-amber-600 dark:bg-amber-600" />
              </div>
              <span>More</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
