/**
 * Get Kraken - Navigation Tabs Component
 *
 * Displays navigation tabs for switching between views
 */

type View = "quests" | "shop" | "progress";

interface NavigationTabsProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function NavigationTabs({ currentView, onViewChange }: NavigationTabsProps) {
  const tabButtonClasses = (view: View) =>
    currentView === view
      ? "bg-amber-500 text-white shadow-md"
      : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <div className="flex gap-2 mb-6 bg-blue-100/30 dark:bg-gray-800 rounded-2xl p-2 shadow-sm backdrop-blur-sm">
      <button
        onClick={() => onViewChange("quests")}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${tabButtonClasses("quests")}`}
      >
        Quests
      </button>
      <button
        onClick={() => onViewChange("shop")}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${tabButtonClasses("shop")}`}
      >
        Shop
      </button>
      <button
        onClick={() => onViewChange("progress")}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${tabButtonClasses("progress")}`}
      >
        Progress
      </button>
    </div>
  );
}

