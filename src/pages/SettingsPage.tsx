/**
 * Get Kraken v2 - Settings Page
 * 
 * Full settings page with collapsible sections
 */

import { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import { usePreferences } from "../hooks/usePreferences";
import { useProfile } from "../hooks/useProfile";
import { exportUserData } from "../utils/exportData";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { supabase } from "../lib/supabase";
import { useWallet } from "../hooks/useWallet";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { TAGS, TAG_LABELS } from "../utils/tags";
import { SHOP_TAGS, SHOP_TAG_LABELS } from "../utils/shopTags";
import type { Tag, ShopTag, QuestLog, ShopLog } from "../types";

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
  const { wallet, refresh: refreshWallet, updateWallet } = useWallet();
  const { loadAllQuestLogs } = useQuests();
  const { loadAllShopLogs } = useShopItems();
  
  // Tag management state
  const [customQuestTags, setCustomQuestTags] = useState<string[]>(() => {
    const stored = localStorage.getItem('customQuestTags');
    return stored ? JSON.parse(stored) : [];
  });
  const [customRewardTags, setCustomRewardTags] = useState<string[]>(() => {
    const stored = localStorage.getItem('customRewardTags');
    return stored ? JSON.parse(stored) : [];
  });
  const [newQuestTag, setNewQuestTag] = useState("");
  const [newRewardTag, setNewRewardTag] = useState("");
  
  // Wallet adjustment state
  const [walletSandDollars, setWalletSandDollars] = useState("");
  const [walletDollars, setWalletDollars] = useState("");
  const [adjustingWallet, setAdjustingWallet] = useState(false);
  
  // Recent rewards state
  const [recentQuestLogs, setRecentQuestLogs] = useState<QuestLog[]>([]);
  const [recentShopLogs, setRecentShopLogs] = useState<ShopLog[]>([]);
  const [loadingRecentLogs, setLoadingRecentLogs] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [deletingLogType, setDeletingLogType] = useState<'quest' | 'shop' | null>(null);
  
  // Load wallet values when wallet changes
  useEffect(() => {
    if (wallet) {
      setWalletSandDollars(wallet.total.toString());
      setWalletDollars(Math.round(wallet.dollar_total || 0).toString());
    }
  }, [wallet]);
  
  // Load recent logs
  useEffect(() => {
    loadRecentLogs();
  }, []);
  
  const loadRecentLogs = async () => {
    setLoadingRecentLogs(true);
    try {
      const [questLogs, shopLogs] = await Promise.all([
        loadAllQuestLogs(),
        loadAllShopLogs(),
      ]);
      // Get most recent 10 of each
      setRecentQuestLogs(questLogs.slice(0, 10));
      setRecentShopLogs(shopLogs.slice(0, 10));
    } catch (err) {
      console.error("Error loading recent logs:", err);
    } finally {
      setLoadingRecentLogs(false);
    }
  };
  
  const addQuestTag = () => {
    if (newQuestTag.trim() && !customQuestTags.includes(newQuestTag.trim().toLowerCase()) && !TAGS.includes(newQuestTag.trim().toLowerCase() as Tag)) {
      const updated = [...customQuestTags, newQuestTag.trim().toLowerCase()];
      setCustomQuestTags(updated);
      localStorage.setItem('customQuestTags', JSON.stringify(updated));
      setNewQuestTag("");
    }
  };
  
  const removeQuestTag = (tag: string) => {
    const updated = customQuestTags.filter(t => t !== tag);
    setCustomQuestTags(updated);
    localStorage.setItem('customQuestTags', JSON.stringify(updated));
  };
  
  const addRewardTag = () => {
    if (newRewardTag.trim() && !customRewardTags.includes(newRewardTag.trim().toLowerCase()) && !SHOP_TAGS.includes(newRewardTag.trim().toLowerCase() as ShopTag)) {
      const updated = [...customRewardTags, newRewardTag.trim().toLowerCase()];
      setCustomRewardTags(updated);
      localStorage.setItem('customRewardTags', JSON.stringify(updated));
      setNewRewardTag("");
    }
  };
  
  const removeRewardTag = (tag: string) => {
    const updated = customRewardTags.filter(t => t !== tag);
    setCustomRewardTags(updated);
    localStorage.setItem('customRewardTags', JSON.stringify(updated));
  };
  
  const handleWalletAdjustment = async () => {
    if (!wallet) return;
    setAdjustingWallet(true);
    try {
      const newSandDollars = parseInt(walletSandDollars) || 0;
      const newDollars = parseInt(walletDollars) || 0;
      
      // Calculate difference
      const sandDiff = newSandDollars - wallet.total;
      const dollarDiff = newDollars - Math.round(wallet.dollar_total || 0);
      
      // Update wallet using the updateWallet function (which adds to current)
      await updateWallet(sandDiff, dollarDiff);
      await refreshWallet();
      alert("Wallet values updated successfully!");
    } catch (err: any) {
      alert(`Failed to update wallet: ${err.message}`);
    } finally {
      setAdjustingWallet(false);
    }
  };
  
  const deleteLogEntry = async (logId: string, type: 'quest' | 'shop') => {
    try {
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) throw new Error("User must be authenticated");
      
      if (type === 'quest') {
        // Get the log to find quest and amounts
        const { data: log } = await supabase
          .from("quest_logs")
          .select("quest_id")
          .eq("id", logId)
          .single();
        
        if (log) {
          // Get quest to find reward amounts
          const { data: quest } = await supabase
            .from("quests")
            .select("reward, dollar_amount")
            .eq("id", log.quest_id)
            .single();
          
          if (quest) {
            // Delete the log
            const { error } = await supabase
              .from("quest_logs")
              .delete()
              .eq("id", logId)
              .eq("user_id", user.id);
            
            if (error) throw error;
            
            // Adjust wallet (subtract the reward)
            await updateWallet(-quest.reward, -Math.round(quest.dollar_amount || 0));
          }
        }
      } else {
        // Get the log to find shop item and amounts
        const { data: log } = await supabase
          .from("shop_logs")
          .select("shop_item_id")
          .eq("id", logId)
          .single();
        
        if (log) {
          // Get shop item to find price amounts
          const { data: item } = await supabase
            .from("shop_items")
            .select("price, dollar_amount")
            .eq("id", log.shop_item_id)
            .single();
          
          if (item) {
            // Delete the log
            const { error } = await supabase
              .from("shop_logs")
              .delete()
              .eq("id", logId)
              .eq("user_id", user.id);
            
            if (error) throw error;
            
            // Adjust wallet (add back the price - since purchase subtracts)
            await updateWallet(item.price, Math.round(item.dollar_amount || 0));
          }
        }
      }
      
      await refreshWallet();
      await loadRecentLogs();
      setDeletingLogId(null);
      setDeletingLogType(null);
      alert("Log entry deleted and wallet adjusted.");
    } catch (err: any) {
      alert(`Failed to delete log entry: ${err.message}`);
      setDeletingLogId(null);
      setDeletingLogType(null);
    }
  };

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
            
            {/* Manual Wallet Adjustment */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Manual Wallet Adjustment
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Adjust your treasure chest values if you made a mistake. Changes will update your wallet immediately.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sand Dollars
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={walletSandDollars}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setWalletSandDollars(value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {showDollarAmounts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dollars
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={walletDollars}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setWalletDollars(value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                )}
                <button
                  onClick={handleWalletAdjustment}
                  disabled={adjustingWallet || !wallet}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {adjustingWallet ? 'Updating...' : 'Update Wallet Values'}
                </button>
              </div>
            </div>
            
            {/* Recent Rewards Adjustment */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recently Earned Rewards
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Delete recent quest completions or purchases to correct mistakes. Wallet will be adjusted automatically.
              </p>
              {loadingRecentLogs ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
              ) : recentQuestLogs.length === 0 && recentShopLogs.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No recent rewards</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentQuestLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Quest completed: {new Date(log.completed_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setDeletingLogId(log.id);
                          setDeletingLogType('quest');
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {recentShopLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Purchase: {new Date(log.purchased_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setDeletingLogId(log.id);
                          setDeletingLogType('shop');
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
          <div className="space-y-6">
            {/* Tag Management */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Change tags for filtering rewards and quests.
              </p>
              
              {/* Quest Tags */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Quest Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                    >
                      {TAG_LABELS[tag]}
                    </span>
                  ))}
                  {customQuestTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeQuestTag(tag)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestTag}
                    onChange={(e) => setNewQuestTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addQuestTag();
                      }
                    }}
                    placeholder="Add new quest tag"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={addQuestTag}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Reward Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Reward Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SHOP_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm"
                    >
                      {SHOP_TAG_LABELS[tag]}
                    </span>
                  ))}
                  {customRewardTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeRewardTag(tag)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRewardTag}
                    onChange={(e) => setNewRewardTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRewardTag();
                      }
                    }}
                    placeholder="Add new reward tag"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={addRewardTag}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            {/* Export Data */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
        
        {/* Delete Log Entry Confirmation */}
        <ConfirmDialog
          isOpen={deletingLogId !== null}
          onClose={() => {
            setDeletingLogId(null);
            setDeletingLogType(null);
          }}
          onConfirm={() => {
            if (deletingLogId && deletingLogType) {
              deleteLogEntry(deletingLogId, deletingLogType);
            }
          }}
          title="Delete Log Entry"
          message="This will delete this log entry and adjust your wallet accordingly. This action cannot be undone."
          confirmText="Delete"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
        />
      </div>
    </div>
  );
}
