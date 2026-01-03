/**
 * Get Kraken - Main App Component
 *
 * A habit tracker for sea monsters
 */

import { useState, useEffect, useCallback } from "react";
import { Toast } from "@ffx/sdk";
import { useWallet } from "./hooks/useWallet";
import { useQuests } from "./hooks/useQuests";
import { useShopItems } from "./hooks/useShopItems";
import { usePreferences } from "./hooks/usePreferences";
import { useToast } from "./hooks/useToast";
import { useFilterState } from "./hooks/useFilterState";
import { useQuestOverrides } from "./hooks/useQuestOverrides";
import { useShopItemOverrides } from "./hooks/useShopItemOverrides";
import { WalletDisplay } from "./components/WalletDisplay";
import { Header } from "./components/Header";
import { NavigationTabs } from "./components/NavigationTabs";
import { BubbleBackground } from "./components/BubbleBackground";
import { Footer } from "./components/Footer";
import { EditQuestCard } from "./components/EditQuestCard";
import { EditShopItemCard } from "./components/EditShopItemCard";
import { LogView } from "./components/LogView";
import { QuestsView } from "./components/views/QuestsView";
import { ShopView } from "./components/views/ShopView";
import { ProgressView } from "./components/views/ProgressView";
import { playCoinSound, preloadAudio } from "./utils/sound";
import { calculateUserCompletionCounts } from "./utils/completionCount";
import { calculateUserPurchaseCounts } from "./utils/purchaseCount";
import type { Quest, ShopItem, QuestLog, ShopLog, Tag, ShopTag } from "./types";
import {
  LOG_REFRESH_INTERVAL_MS,
  TOAST_DURATION_MS,
  CURRENCY_NAME,
  FEATURE_UPDATES_VERSION,
} from "./constants";
import { getFeatureUpdatesContent, getAboutContent } from "./constants/popupContent";
import { PopupModal } from "./components/PopupModal";
import { supabase } from "./lib/supabase";

type View = "quests" | "shop" | "progress";

function App() {
  // Persist current view in localStorage
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem("get-kraken-current-view");
    if (saved && (saved === "quests" || saved === "shop" || saved === "progress")) {
      return saved as View;
    }
    return "quests";
  });

  // Update localStorage when view changes
  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
    localStorage.setItem("get-kraken-current-view", view);
  }, []);
  const preferences = usePreferences();
  const { toast, showToast, showSuccess, showError, dismissToast } = useToast();

  const [selectedQuestLogs, setSelectedQuestLogs] = useState<{
    quest: Quest;
    logs: QuestLog[];
  } | null>(null);
  const [selectedShopLogs, setSelectedShopLogs] = useState<{
    item: ShopItem;
    logs: ShopLog[];
  } | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [showFeatureUpdates, setShowFeatureUpdates] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const {
    wallet,
    loading: walletLoading,
    resetWallet,
  } = useWallet();
  const {
    quests,
    loading: questsLoading,
    createQuest,
    updateQuest,
    completeQuest,
    deleteQuest,
    getQuestWithLogs,
    loadAllQuestLogs,
    deleteAllQuestLogs,
  } = useQuests();
  const {
    shopItems,
    loading: shopItemsLoading,
    createShopItem,
    updateShopItem,
    purchaseItem,
    deleteShopItem,
    getShopItemWithLogs,
    loadAllShopLogs,
    deleteAllShopLogs,
  } = useShopItems();
  const { getEffectiveReward, getEffectiveDollarAmount } = useQuestOverrides();
  const {
    getEffectivePrice,
    getEffectiveDollarAmount: getEffectiveShopDollarAmount,
  } = useShopItemOverrides();

  const [allQuestLogs, setAllQuestLogs] = useState<QuestLog[]>([]);
  const [allShopLogs, setAllShopLogs] = useState<ShopLog[]>([]);

  // Use per-user filter state
  const {
    questSearchQuery,
    shopSearchQuery,
    selectedQuestTag,
    selectedShopTag,
    setQuestSearchQuery,
    setShopSearchQuery,
    setSelectedQuestTag,
    setSelectedShopTag,
  } = useFilterState();

  // Load all logs for progress tracking - independent of quests/shopItems to prevent waterfall
  useEffect(() => {
    const loadLogs = async () => {
      const [questLogs, shopLogs] = await Promise.all([
        loadAllQuestLogs(),
        loadAllShopLogs(),
      ]);
      setAllQuestLogs(questLogs);
      setAllShopLogs(shopLogs);
    };
    loadLogs();
    const interval = setInterval(loadLogs, LOG_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadAllQuestLogs, loadAllShopLogs]); // Removed quests.length and shopItems.length - logs load independently

  // Preload audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      preloadAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Feature Updates popup - show once per content version
  useEffect(() => {
    // Check localStorage for seen version
    const seenVersion = localStorage.getItem("get-kraken-feature-updates-seen");
    
    // Show popup if version changed or never seen (non-blocking, after initial render)
    if (seenVersion !== FEATURE_UPDATES_VERSION) {
      // Small delay to ensure base UI is rendered first (progressive rendering)
      const timer = setTimeout(() => {
        setShowFeatureUpdates(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFeatureUpdatesClose = () => {
    setShowFeatureUpdates(false);
    // Mark this version as seen
    localStorage.setItem("get-kraken-feature-updates-seen", FEATURE_UPDATES_VERSION);
  };

  const handleCompleteQuest = useCallback(async (questId: string, _reward: number) => {
    try {
      const quest = quests.find((q) => q.id === questId);
      if (!quest) throw new Error("Quest not found");

      // Use effective values from overrides
      const effectiveReward = getEffectiveReward(questId, quest.reward);
      const effectiveDollarAmount = getEffectiveDollarAmount(
        questId,
        quest.dollar_amount || 0
      );

      // completeQuest now atomically updates wallet - no separate updateWallet call needed
      // Real-time subscription will update wallet state automatically
      await completeQuest(questId, effectiveReward, effectiveDollarAmount);

      const questLogs = await loadAllQuestLogs();
      setAllQuestLogs(questLogs);

      playCoinSound();
      showSuccess(`Earned ${effectiveReward} ${CURRENCY_NAME}! 🎉`);
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to complete quest"
      );
    }
  }, [quests, getEffectiveReward, getEffectiveDollarAmount, completeQuest, loadAllQuestLogs, showSuccess, showError]);

  const handlePurchaseItem = useCallback(async (itemId: string, _price: number) => {
    try {
      const item = shopItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Shop item not found");

      // Use effective values from overrides
      const effectivePrice = getEffectivePrice(itemId, item.price);
      const effectiveDollarAmount = getEffectiveShopDollarAmount(
        itemId,
        item.dollar_amount || 0
      );

      // Validate purchase: check both sand dollars and dollars (if dollar amounts are enabled)
      const walletTotal = wallet?.total ?? 0;
      const walletDollarTotal = wallet?.dollar_total ?? 0;
      
      if (walletTotal < effectivePrice) {
        throw new Error(`Not enough sand dollars. Need ${effectivePrice - walletTotal} more.`);
      }

      if (preferences.showDollarAmounts && effectiveDollarAmount > 0) {
        const roundedDollarAmount = Math.round(effectiveDollarAmount);
        const roundedWalletDollarTotal = Math.round(walletDollarTotal);
        if (roundedWalletDollarTotal < roundedDollarAmount) {
          throw new Error(`Not enough dollars. Need ${roundedDollarAmount - roundedWalletDollarTotal} more.`);
        }
      }

      // purchaseItem now atomically updates wallet - no separate updateWallet call needed
      // Real-time subscription will update wallet state automatically
      await purchaseItem(itemId, effectivePrice, effectiveDollarAmount);

      showSuccess(`Purchased for ${effectivePrice} ${CURRENCY_NAME}! 🛒`);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to purchase item");
    }
  }, [shopItems, getEffectivePrice, getEffectiveShopDollarAmount, wallet, preferences.showDollarAmounts, purchaseItem, showSuccess, showError]);

  const handleViewQuestLogs = useCallback(async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const questWithLogs = await getQuestWithLogs(questId);
    if (questWithLogs) {
      setSelectedQuestLogs({
        quest,
        logs: questWithLogs.logs,
      });
    }
  }, [quests, getQuestWithLogs]);

  const handleViewShopLogs = useCallback(async (itemId: string) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;

    const itemWithLogs = await getShopItemWithLogs(itemId);
    if (itemWithLogs) {
      setSelectedShopLogs({
        item,
        logs: itemWithLogs.logs,
      });
    }
  }, [shopItems, getShopItemWithLogs]);

  const handleEditQuest = useCallback((quest: Quest) => {
    setEditingQuest(quest);
  }, []);

  const handleEditShopItem = useCallback((item: ShopItem) => {
    setEditingShopItem(item);
  }, []);

  const handleSaveQuestEdit = useCallback(async (updates: {
    name: string;
    tags: Tag[];
    reward: number;
    dollar_amount?: number;
    completion_count: number;
  }) => {
    if (!editingQuest) return;
    try {
      await updateQuest(editingQuest.id, updates);
      // updateQuest already calls loadQuests internally, so we don't need to call it again
      // Reload logs to reflect any count changes
      const logs = await loadAllQuestLogs();
      setAllQuestLogs(logs);
      setEditingQuest(null);
      showSuccess("Quest updated! ✅");
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to update quest");
    }
  }, [editingQuest, updateQuest, loadAllQuestLogs, showSuccess, showError]);

  const handleSaveShopItemEdit = useCallback(async (updates: {
    name: string;
    tags: ShopTag[];
    price: number;
    dollar_amount?: number;
    purchase_count: number;
  }) => {
    if (!editingShopItem) return;
    try {
      await updateShopItem(editingShopItem.id, updates);
      // updateShopItem already calls loadShopItems internally, so we don't need to call it again
      // Reload logs to reflect any count changes
      const logs = await loadAllShopLogs();
      setAllShopLogs(logs);
      setEditingShopItem(null);
      showSuccess("Shop item updated! ✅");
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to update shop item"
      );
    }
  }, [editingShopItem, updateShopItem, loadAllShopLogs, showSuccess, showError]);

  const handleDeleteQuest = useCallback(async (questId: string) => {
    try {
      await deleteQuest(questId);
      showSuccess("Quest deleted! ✅");
      const logs = await loadAllQuestLogs();
      setAllQuestLogs(logs);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to delete quest");
    }
  }, [deleteQuest, loadAllQuestLogs, showSuccess, showError]);

  const handleDeleteShopItem = useCallback(async (itemId: string) => {
    try {
      await deleteShopItem(itemId);
      showSuccess("Shop item deleted! ✅");
      const logs = await loadAllShopLogs();
      setAllShopLogs(logs);
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to delete shop item"
      );
    }
  }, [deleteShopItem, loadAllShopLogs, showSuccess, showError]);

  const handleResetProgress = useCallback(async () => {
    if (!confirm("Reset wallet to zero? This cannot be undone.")) {
      return;
    }
    try {
      await resetWallet();
      showSuccess("Wallet reset to zero! ✅");
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to reset wallet");
    }
  }, [resetWallet, showSuccess, showError]);

  const handleResetAllProgress = useCallback(async () => {
    if (
      !confirm(
        "Reset all progress? This will delete all quest and shop logs and reset your wallet. This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteAllQuestLogs();
      await deleteAllShopLogs();
      await resetWallet();
      const [questLogs, shopLogs] = await Promise.all([
        loadAllQuestLogs(),
        loadAllShopLogs(),
      ]);
      setAllQuestLogs(questLogs);
      setAllShopLogs(shopLogs);
      showSuccess("All progress reset! ✅");
    } catch (err: unknown) {
      console.error("Error resetting all progress:", err);
      showError(
        err instanceof Error ? err.message : "Failed to reset all progress"
      );
    }
  }, [deleteAllQuestLogs, deleteAllShopLogs, resetWallet, loadAllQuestLogs, loadAllShopLogs, showSuccess, showError]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.supabase.auth.signOut();
      // The AuthGate component will handle the redirect to login
    } catch (err: unknown) {
      console.error("Error logging out:", err);
      showError(err instanceof Error ? err.message : "Failed to log out");
    }
  }, [showError]);

  return (
    <div
      className="min-h-screen bg-blue-50 dark:bg-gray-900 relative"
      style={{ zIndex: 1 }}
    >
      <BubbleBackground />

      <Header
        showDollarAmounts={preferences.showDollarAmounts}
        onToggleDollarAmounts={() => preferences.toggleDollarAmounts()}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="mb-8">
          <WalletDisplay
            wallet={wallet}
            loading={walletLoading}
            showDollarAmounts={preferences.showDollarAmounts}
          />
        </div>

        <NavigationTabs
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {/* Always mount all views - use CSS visibility to show/hide */}
        <div className={currentView === "quests" ? "" : "hidden"}>
          <QuestsView
            quests={quests}
            allQuestLogs={allQuestLogs}
            loading={questsLoading}
            searchQuery={questSearchQuery}
            onSearchChange={setQuestSearchQuery}
            selectedTag={selectedQuestTag}
            onTagSelect={setSelectedQuestTag}
            showDollarAmounts={preferences.showDollarAmounts}
            onCreateQuest={createQuest}
            onCompleteQuest={handleCompleteQuest}
            onViewLogs={handleViewQuestLogs}
            onEdit={handleEditQuest}
            onShowToast={showToast}
          />
        </div>

        <div className={currentView === "shop" ? "" : "hidden"}>
          <ShopView
            shopItems={shopItems}
            allShopLogs={allShopLogs}
            walletTotal={wallet?.total ?? 0}
            walletDollarTotal={wallet?.dollar_total ?? 0}
            loading={shopItemsLoading}
            searchQuery={shopSearchQuery}
            onSearchChange={setShopSearchQuery}
            selectedTag={selectedShopTag}
            onTagSelect={setSelectedShopTag}
            showDollarAmounts={preferences.showDollarAmounts}
            onCreateShopItem={createShopItem}
            onPurchaseItem={handlePurchaseItem}
            onViewLogs={handleViewShopLogs}
            onEdit={handleEditShopItem}
            onShowToast={showToast}
          />
        </div>

        <div className={currentView === "progress" ? "" : "hidden"}>
          <ProgressView
            walletTotal={wallet?.total ?? 0}
            walletDollarTotal={wallet?.dollar_total ?? 0}
            questLogs={allQuestLogs}
            shopLogs={allShopLogs}
            quests={quests}
            shopItems={shopItems}
            onResetProgress={handleResetProgress}
            onResetAllProgress={handleResetAllProgress}
          />
        </div>
      </main>

      {selectedQuestLogs && (
        <LogView
          isOpen={!!selectedQuestLogs}
          onClose={() => setSelectedQuestLogs(null)}
          title={`${selectedQuestLogs.quest.name} - Completion Log`}
          logs={selectedQuestLogs.logs}
          getDateKey={(log) => log.completed_at}
        />
      )}

      {selectedShopLogs && (
        <LogView
          isOpen={!!selectedShopLogs}
          onClose={() => setSelectedShopLogs(null)}
          title={`${selectedShopLogs.item.name} - Purchase Log`}
          logs={selectedShopLogs.logs}
          getDateKey={(log) => log.purchased_at}
        />
      )}

      {editingQuest &&
        (() => {
          const userCompletionCounts =
            calculateUserCompletionCounts(allQuestLogs);
          return (
            <EditQuestCard
              quest={editingQuest}
              userCompletionCount={userCompletionCounts[editingQuest.id]}
              onSave={handleSaveQuestEdit}
              onDelete={async () => {
                await handleDeleteQuest(editingQuest.id);
                setEditingQuest(null);
              }}
              onClose={() => setEditingQuest(null)}
            />
          );
        })()}

      {editingShopItem &&
        (() => {
          const userPurchaseCounts = calculateUserPurchaseCounts(allShopLogs);
          return (
            <EditShopItemCard
              item={editingShopItem}
              userPurchaseCount={userPurchaseCounts[editingShopItem.id]}
              onSave={handleSaveShopItemEdit}
              onDelete={async () => {
                await handleDeleteShopItem(editingShopItem.id);
                setEditingShopItem(null);
              }}
              onClose={() => setEditingShopItem(null)}
            />
          );
        })()}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.type}
          show={true}
          onDismiss={dismissToast}
          duration={TOAST_DURATION_MS}
        />
      )}

      <Footer onAboutClick={() => setShowAbout(true)} />

      {/* Feature Updates Popup - shows once per content version */}
      <PopupModal
        isOpen={showFeatureUpdates}
        onClose={handleFeatureUpdatesClose}
        title="What's New"
      >
        {getFeatureUpdatesContent()}
      </PopupModal>

      {/* About Popup */}
      <PopupModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        title="About Get Kraken"
      >
        {getAboutContent()}
      </PopupModal>
    </div>
  );
}

export default App;
