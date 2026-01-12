/**
 * Get Kraken - Header Component
 *
 * Displays the app header with logo, title, and dollar toggle
 */

import { Link } from "react-router-dom";
import { KRAKEN_ICON_PATH, APP_NAME, APP_SUBTITLE } from "../constants";

interface HeaderProps {
  showDollarAmounts: boolean;
  onToggleDollarAmounts: () => void;
  onLogout: () => void;
  onOpenMenu: () => void;
}

export function Header({ showDollarAmounts, onToggleDollarAmounts, onLogout, onOpenMenu }: HeaderProps) {
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
            {/* Left side - Logo and Title (Clickable to Home) */}
            <Link to="/" className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <img
                src={KRAKEN_ICON_PATH}
                alt="Kraken"
                className="h-16 sm:h-20 object-contain flex-shrink-0"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {APP_NAME}
                </h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-200 mt-1">
                  {APP_SUBTITLE}
                </p>
              </div>
            </Link>
            {/* Right side - Hamburger menu and Dollar toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onOpenMenu}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors touch-manipulation bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Open menu"
                aria-label="Open navigation menu"
              >
                ☰
              </button>
              <button
                onClick={onToggleDollarAmounts}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors touch-manipulation ${toggleButtonClasses}`}
                title={showDollarAmounts ? "Hide dollar amounts" : "Show dollar amounts"}
              >
                💵 {showDollarAmounts ? "On" : "Off"}
              </button>
              <button
                onClick={onLogout}
                className={logoutButtonClasses}
                title="Log out"
              >
                🚪 Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-start gap-2 mb-2">
            <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src={KRAKEN_ICON_PATH}
                alt="Kraken"
                className="h-12 object-contain"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <Link to="/" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <h1 className="text-2xl font-bold text-left text-gray-900 dark:text-gray-100 leading-tight">
                    {APP_NAME}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-200 mt-0.5">
                    {APP_SUBTITLE}
                  </p>
                </Link>
                <button
                  onClick={onOpenMenu}
                  className="px-2 py-1 text-lg font-medium rounded-lg border-2 transition-colors touch-manipulation bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
                  title="Open menu"
                  aria-label="Open navigation menu"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

