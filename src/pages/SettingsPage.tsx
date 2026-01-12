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
import { ConfirmDialog } from "../components/ConfirmDialog";
import { supabase } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";

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
  const { themeMode, updateThemeMode } = useTheme();
  const { showDollarAmounts, showSandDollars, enableSocialFeatures, toggleDollarAmounts, toggleSandDollars, toggleSocialFeatures } = usePreferences();
  const { username, updateUsername, loading: profileLoading } = useProfile();
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetWalletConfirm, setResetWalletConfirm] = useState(false);
  const [resetProgressConfirm, setResetProgressConfirm] = useState(false);
  const [resetProgressType, setResetProgressType] = useState("");
  const { refresh: refreshWallet } = useWallet();

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
            {/* Sign Out */}
            <div className="pt-2 pb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={async () => {
                  await supabase.supabase.auth.signOut();
                }}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
            
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
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Beta Feature:</strong> Social features are experimental. When enabled, you can add friends and share quests.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enable Social Features (Beta)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show social UI and enable friend features
                </p>
              </div>
              <button
                onClick={toggleSocialFeatures}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enableSocialFeatures ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={enableSocialFeatures}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableSocialFeatures ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {enableSocialFeatures && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Social features are enabled. Friends section coming soon...
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Danger Zone Section */}
        <CollapsibleSection title="Danger Zone">
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                <strong>Warning:</strong> Actions in this section are destructive and cannot be undone.
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                These actions will permanently modify or delete your data. Please proceed with caution.
              </p>
            </div>

            {/* Reset Wallet */}
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Reset Wallet to Zero
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will set your wallet balances (sand dollars and dollars) to zero. Your activity logs and progress history will remain intact.
              </p>
              <button
                onClick={() => setResetWalletConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Reset Wallet
              </button>
            </div>

            {/* Reset All Progress */}
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Reset All Progress
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                This will permanently delete:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mb-4 space-y-1">
                <li>All quest logs (quest_logs table)</li>
                <li>All activity logs (activity_logs table)</li>
                <li>All shop purchase logs (shop_logs table)</li>
                <li>Wallet balances (set to zero)</li>
              </ul>
              <p className="text-xs text-red-700 dark:text-red-300 mb-4">
                <strong>Note:</strong> Your quests, shop items, and preferences will remain. Only your progress and logs will be deleted.
              </p>
              <button
                onClick={() => setResetProgressConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Reset Wallet Confirmation */}
        <ConfirmDialog
          isOpen={resetWalletConfirm}
          onClose={() => setResetWalletConfirm(false)}
          onConfirm={async () => {
            try {
              const { data: { user } } = await supabase.supabase.auth.getUser();
              if (!user) throw new Error("User must be authenticated");

              // Set wallet to zero
              const { error: walletError } = await supabase
                .from("wallets")
                .update({
                  total: 0,
                  dollar_total: 0,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

              if (walletError) throw walletError;

              // Reload wallet
              await refreshWallet();
              setResetWalletConfirm(false);
              alert("Wallet has been reset to zero.");
            } catch (error: any) {
              console.error("Error resetting wallet:", error);
              alert(`Failed to reset wallet: ${error.message}`);
            }
          }}
          title="Reset Wallet to Zero"
          message="This will set your wallet balances (sand dollars and dollars) to zero. Your activity logs and progress history will remain intact. This action cannot be undone."
          confirmText="Reset Wallet"
          danger={true}
        />

        {/* Reset Progress Confirmation */}
        <ConfirmDialog
          isOpen={resetProgressConfirm}
          onClose={() => {
            setResetProgressConfirm(false);
            setResetProgressType("");
          }}
          onConfirm={async () => {
            try {
              const { data: { user } } = await supabase.supabase.auth.getUser();
              if (!user) throw new Error("User must be authenticated");

              // Delete quest logs
              const { error: questLogsError } = await supabase
                .from("quest_logs")
                .delete()
                .eq("user_id", user.id);

              if (questLogsError) throw questLogsError;

              // Delete activity logs
              const { error: activityLogsError } = await supabase
                .from("activity_logs")
                .delete()
                .eq("user_id", user.id);

              if (activityLogsError) {
                // activity_logs might not exist yet, that's okay
                console.warn("Activity logs deletion failed (table might not exist):", activityLogsError);
              }

              // Delete shop logs
              const { error: shopLogsError } = await supabase
                .from("shop_logs")
                .delete()
                .eq("user_id", user.id);

              if (shopLogsError) throw shopLogsError;

              // Reset wallet to zero
              const { error: walletError } = await supabase
                .from("wallets")
                .update({
                  total: 0,
                  dollar_total: 0,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

              if (walletError) throw walletError;

              // Reload wallet
              await refreshWallet();
              setResetProgressConfirm(false);
              setResetProgressType("");
              alert("All progress has been reset. Your quests and shop items remain intact.");
            } catch (error: any) {
              console.error("Error resetting progress:", error);
              alert(`Failed to reset progress: ${error.message}`);
            }
          }}
          title="Reset All Progress"
          message="This will permanently delete all your quest logs, activity logs, shop purchase logs, and reset your wallet to zero. Your quests, shop items, and preferences will remain. This action cannot be undone."
          confirmText="Reset All Progress"
          danger={true}
          requireType="RESET"
          typeInput={resetProgressType}
          onTypeInputChange={setResetProgressType}
        />
      </div>
    </div>
  );
}
