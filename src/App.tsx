/**
 * Get Kraken - Main App Component
 *
 * A habit tracker for sea monsters
 */

import { useState, useEffect } from "react";
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
import type { Quest, ShopItem, QuestLog, ShopLog, Tag, ShopTag } from "./types";
import { LOG_REFRESH_INTERVAL_MS, TOAST_DURATION_MS, CURRENCY_NAME } from "./constants";
import { supabase } from "./lib/supabase";

type View = "quests" | "shop" | "progress";

function App() {
  const [currentView, setCurrentView] = useState<View>("quests");
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

  const {
    wallet,
    loading: walletLoading,
    updateWallet,
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
  const { getEffectivePrice, getEffectiveDollarAmount: getEffectiveShopDollarAmount } = useShopItemOverrides();

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

  // Load all logs for progress tracking
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
  }, [loadAllQuestLogs, loadAllShopLogs, quests.length, shopItems.length]);

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

  const handleCompleteQuest = async (questId: string, _reward: number) => {
    try {
      const quest = quests.find((q) => q.id === questId);
      if (!quest) throw new Error("Quest not found");
      
      // Use effective values from overrides
      const effectiveReward = getEffectiveReward(questId, quest.reward);
      const effectiveDollarAmount = getEffectiveDollarAmount(questId, quest.dollar_amount || 0);

      await completeQuest(questId, effectiveReward);
      await updateWallet(effectiveReward, effectiveDollarAmount);
      
      const questLogs = await loadAllQuestLogs();
      setAllQuestLogs(questLogs);
      
      playCoinSound();
      showSuccess(`Earned ${effectiveReward} ${CURRENCY_NAME}! 🎉`);
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to complete quest"
      );
    }
  };

  const handlePurchaseItem = async (itemId: string, _price: number) => {
    try {
      const item = shopItems.find((i) => i.id === itemId);
      if (!item) throw new Error("Shop item not found");
      
      // Use effective values from overrides
      const effectivePrice = getEffectivePrice(itemId, item.price);
      const effectiveDollarAmount = getEffectiveShopDollarAmount(itemId, item.dollar_amount || 0);

      await purchaseItem(itemId, effectivePrice);
      await updateWallet(-effectivePrice, -effectiveDollarAmount);
      showSuccess(`Purchased for ${effectivePrice} ${CURRENCY_NAME}! 🛒`);
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to purchase item"
      );
    }
  };

  const handleViewQuestLogs = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const questWithLogs = await getQuestWithLogs(questId);
    if (questWithLogs) {
      setSelectedQuestLogs({
        quest,
        logs: questWithLogs.logs,
      });
    }
  };

  const handleViewShopLogs = async (itemId: string) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;

    const itemWithLogs = await getShopItemWithLogs(itemId);
    if (itemWithLogs) {
      setSelectedShopLogs({
        item,
        logs: itemWithLogs.logs,
      });
    }
  };

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
  };

  const handleEditShopItem = (item: ShopItem) => {
    setEditingShopItem(item);
  };

  const handleSaveQuestEdit = async (updates: {
    name: string;
    tags: Tag[];
    reward: number;
    completion_count: number;
  }) => {
    if (!editingQuest) return;
    try {
      await updateQuest(editingQuest.id, updates);
      setEditingQuest(null);
      showSuccess("Quest updated! ✅");
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to update quest"
      );
    }
  };

  const handleSaveShopItemEdit = async (updates: {
    name: string;
    tags: ShopTag[];
    price: number;
    purchase_count: number;
  }) => {
    if (!editingShopItem) return;
    try {
      await updateShopItem(editingShopItem.id, updates);
      setEditingShopItem(null);
      showSuccess("Shop item updated! ✅");
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to update shop item"
      );
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    try {
      await deleteQuest(questId);
      showSuccess("Quest deleted! ✅");
      const logs = await loadAllQuestLogs();
      setAllQuestLogs(logs);
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to delete quest"
      );
    }
  };

  const handleDeleteShopItem = async (itemId: string) => {
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
  };

  const handleResetProgress = async () => {
    if (!confirm("Reset wallet to zero? This cannot be undone.")) {
      return;
    }
    try {
      await resetWallet();
      showSuccess("Wallet reset to zero! ✅");
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : "Failed to reset wallet"
      );
    }
  };

  const handleResetAllProgress = async () => {
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
  };

  const handleLogout = async () => {
    try {
      await supabase.supabase.auth.signOut();
      // The AuthGate component will handle the redirect to login
    } catch (err: unknown) {
      console.error("Error logging out:", err);
      showError(
        err instanceof Error ? err.message : "Failed to log out"
      );
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative" style={{ zIndex: 1 }}>
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

        <NavigationTabs currentView={currentView} onViewChange={setCurrentView} />

        {currentView === "quests" && (
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
        )}

        {currentView === "shop" && (
          <ShopView
            shopItems={shopItems}
            walletTotal={wallet?.total ?? 0}
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
        )}

        {currentView === "progress" && (
          <ProgressView
            walletTotal={wallet?.total ?? 0}
            questLogs={allQuestLogs}
            shopLogs={allShopLogs}
            quests={quests}
            shopItems={shopItems}
            onResetProgress={handleResetProgress}
            onResetAllProgress={handleResetAllProgress}
          />
        )}
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

      {editingQuest && (
        <EditQuestCard
          quest={editingQuest}
          onSave={handleSaveQuestEdit}
          onDelete={async () => {
            await handleDeleteQuest(editingQuest.id);
            setEditingQuest(null);
          }}
          onClose={() => setEditingQuest(null)}
        />
      )}

      {editingShopItem && (
        <EditShopItemCard
          item={editingShopItem}
          onSave={handleSaveShopItemEdit}
          onDelete={async () => {
            await handleDeleteShopItem(editingShopItem.id);
            setEditingShopItem(null);
          }}
          onClose={() => setEditingShopItem(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.type}
          show={true}
          onDismiss={dismissToast}
          duration={TOAST_DURATION_MS}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
