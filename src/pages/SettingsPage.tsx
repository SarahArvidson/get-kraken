/**
 * Get Kraken v2 - Settings Page
 * 
 * Full settings page with collapsible sections
 */

import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { usePreferences } from "../hooks/usePreferences";
import { useProfile } from "../hooks/useProfile";
import { exportUserData } from "../utils/exportData";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <span className="text-gray-500 dark:text-gray-400">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { themeMode, updateThemeMode, toggleTheme } = useTheme();
  const { showDollarAmounts, showSandDollars, toggleDollarAmounts, toggleSandDollars } = usePreferences();
  const { username, updateUsername, loading: profileLoading } = useProfile();
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [exporting, setExporting] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      <div className="space-y-4">
        {/* Appearance Section */}
        <CollapsibleSection title="Appearance" defaultOpen={true}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateThemeMode('light')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    themeMode === 'light'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => updateThemeMode('dark')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    themeMode === 'dark'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => updateThemeMode('system')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    themeMode === 'system'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  System
                </button>
              </div>
            </div>
            <div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Quick Toggle (Light ↔ Dark)
              </button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Wallet and Currencies Section */}
        <CollapsibleSection title="Wallet and Currencies" defaultOpen={true}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Show Dollars
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show dollar amounts throughout the app
                </p>
              </div>
              <button
                onClick={toggleDollarAmounts}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showDollarAmounts ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={showDollarAmounts}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showDollarAmounts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Show Sand Dollars
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show sand dollar amounts throughout the app
                </p>
              </div>
              <button
                onClick={toggleSandDollars}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showSandDollars ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={showSandDollars}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showSandDollars ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Account Section */}
        <CollapsibleSection title="Account">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Public Username
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                This username is visible to your friends. Letters, numbers, underscores, and hyphens only. Max 50 characters.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={usernameInput || username}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter username"
                  maxLength={50}
                  pattern="[a-zA-Z0-9_-]+"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={async () => {
                    setSavingUsername(true);
                    try {
                      await updateUsername(usernameInput || username);
                      setUsernameInput("");
                    } catch (error) {
                      alert("Failed to update username. Please check the format.");
                    } finally {
                      setSavingUsername(false);
                    }
                  }}
                  disabled={savingUsername || profileLoading}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingUsername ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Data Section */}
        <CollapsibleSection title="Data">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export your data to CSV files. Each data type will be downloaded as a separate file.
              </p>
              <button
                onClick={async () => {
                  setExporting(true);
                  try {
                    const fileCount = await exportUserData();
                    alert(`Exported ${fileCount} file(s) successfully!`);
                  } catch (error: any) {
                    alert(`Export failed: ${error.message}`);
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export All Data to CSV'}
              </button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Social (Beta) Section */}
        <CollapsibleSection title="Social (Beta)">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Social features toggle coming in Step 6...
          </p>
        </CollapsibleSection>

        {/* Danger Zone Section */}
        <CollapsibleSection title="Danger Zone">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              <strong>Warning:</strong> Actions in this section are destructive and cannot be undone.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Danger zone actions coming in Step 7...
            </p>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
