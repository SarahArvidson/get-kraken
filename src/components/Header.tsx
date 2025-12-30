/**
 * Get Kraken - Header Component
 *
 * Displays the app header with logo, title, and dollar toggle
 */

import { KRAKEN_ICON_PATH, APP_NAME, APP_SUBTITLE } from "../constants";

interface HeaderProps {
  showDollarAmounts: boolean;
  onToggleDollarAmounts: () => void;
  onLogout: () => void;
}

export function Header({ showDollarAmounts, onToggleDollarAmounts, onLogout }: HeaderProps) {
  const toggleButtonClasses = showDollarAmounts
    ? "bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300"
    : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300";

  const logoutButtonClasses = "px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors touch-manipulation bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";

  return (
    <header className="bg-blue-100/50 dark:bg-gray-800 shadow-sm sticky top-0 z-20 relative backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between gap-4 mb-2">
            {/* Left side - Logout button */}
            <div className="flex-shrink-0">
              <button
                onClick={onLogout}
                className={logoutButtonClasses}
                title="Log out"
              >
                🚪 Log Out
              </button>
            </div>
            {/* Center - Logo and Title */}
            <div className="flex items-center justify-center gap-4 flex-1 min-w-0">
              <img
                src={KRAKEN_ICON_PATH}
                alt="Kraken"
                className="h-60 object-contain flex-shrink-0"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-6xl font-bold text-gray-900 header-text-color leading-tight">
                  {APP_NAME}
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-200 mt-1">
                  {APP_SUBTITLE}
                </p>
              </div>
            </div>
            {/* Right side - Dollar toggle */}
            <div className="flex-shrink-0">
              <button
                onClick={onToggleDollarAmounts}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors touch-manipulation ${toggleButtonClasses}`}
                title={showDollarAmounts ? "Hide dollar amounts" : "Show dollar amounts"}
              >
                💵 {showDollarAmounts ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-start gap-2 mb-2">
            <img
              src={KRAKEN_ICON_PATH}
              alt="Kraken"
              className="h-20 object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h1 className="text-3xl font-bold text-left text-gray-900 header-text-color leading-tight">
                  {APP_NAME}
                </h1>
                <button
                  onClick={onLogout}
                  className="px-2 py-1 text-xs font-medium rounded-lg border-2 transition-colors touch-manipulation bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
                  title="Log out"
                >
                  🚪
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-200">
                  {APP_SUBTITLE}
                </p>
                <button
                  onClick={onToggleDollarAmounts}
                  className={`px-2 py-1 text-xs font-medium rounded-lg border-2 transition-colors touch-manipulation flex-shrink-0 ${toggleButtonClasses}`}
                  title={showDollarAmounts ? "Hide dollar amounts" : "Show dollar amounts"}
                >
                  💵 {showDollarAmounts ? "On" : "Off"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

