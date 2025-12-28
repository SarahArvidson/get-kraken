/**
 * Kibblings - Main App Component
 *
 * Mobile-first habit-tracker and rewards webapp for two people sharing a wallet
 */

import { useState, useEffect, useMemo } from "react";
import { Toast, InputField } from "@ffx/sdk";
import { useWallet } from "./hooks/useWallet";
import { useQuests } from "./hooks/useQuests";
import { useShopItems } from "./hooks/useShopItems";
import { WalletDisplay } from "./components/WalletDisplay";
import { QuestCard } from "./components/QuestCard";
import { ShopItemCard } from "./components/ShopItemCard";
import { AddQuestCard } from "./components/AddQuestCard";
import { AddShopItemCard } from "./components/AddShopItemCard";
import { EditQuestCard } from "./components/EditQuestCard";
import { EditShopItemCard } from "./components/EditShopItemCard";
import { LogView } from "./components/LogView";
import { GamificationPanel } from "./components/GamificationPanel";
import { playCoinSound, preloadAudio } from "./utils/sound";
import { seedQuests } from "./utils/seedQuests";
import type { Quest, ShopItem, QuestLog, ShopLog } from "./types";

type View = "quests" | "shop" | "progress";

function App() {
  const [currentView, setCurrentView] = useState<View>("quests");
  const [selectedQuestLogs, setSelectedQuestLogs] = useState<{
    quest: Quest;
    logs: QuestLog[];
  } | null>(null);
  const [selectedShopLogs, setSelectedShopLogs] = useState<{
    item: ShopItem;
    logs: ShopLog[];
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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
  } = useShopItems();

  const [allQuestLogs, setAllQuestLogs] = useState<QuestLog[]>([]);
  const [allShopLogs, setAllShopLogs] = useState<ShopLog[]>([]);
  const [questSearchQuery, setQuestSearchQuery] = useState("");
  const [shopSearchQuery, setShopSearchQuery] = useState("");

  // Filter quests based on search query
  const filteredQuests = useMemo(() => {
    if (!questSearchQuery.trim()) return quests;
    const query = questSearchQuery.toLowerCase().trim();
    return quests.filter((quest) => quest.name.toLowerCase().includes(query));
  }, [quests, questSearchQuery]);

  // Filter shop items based on search query
  const filteredShopItems = useMemo(() => {
    if (!shopSearchQuery.trim()) return shopItems;
    const query = shopSearchQuery.toLowerCase().trim();
    return shopItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [shopItems, shopSearchQuery]);

  const handleCompleteQuest = async (questId: string, reward: number) => {
    try {
      await completeQuest(questId, reward);
      await updateWallet(reward);
      playCoinSound(); // Play coin sound on successful completion
      setToast({ message: `Earned ${reward} kibblings! 🎉`, type: "success" });
    } catch (err: unknown) {
      setToast({
        message:
          err instanceof Error ? err.message : "Failed to complete quest",
        type: "error",
      });
    }
  };

  const handlePurchaseItem = async (itemId: string, price: number) => {
    try {
      await purchaseItem(itemId, price);
      await updateWallet(-price);
      setToast({
        message: `Purchased for ${price} kibblings! 🛒`,
        type: "success",
      });
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to purchase item",
        type: "error",
      });
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

  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);

  const handleEditQuest = async (quest: Quest) => {
    setEditingQuest(quest);
  };

  const handleEditShopItem = async (item: ShopItem) => {
    setEditingShopItem(item);
  };

  const handleSaveQuestEdit = async (updates: {
    name: string;
    photo_url: string | null;
    reward: number;
    completion_count: number;
  }) => {
    if (!editingQuest) return;
    try {
      await updateQuest(editingQuest.id, updates);
      setEditingQuest(null);
      setToast({ message: "Quest updated! ✅", type: "success" });
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to update quest",
        type: "error",
      });
    }
  };

  const handleSaveShopItemEdit = async (updates: {
    name: string;
    photo_url: string | null;
    price: number;
    purchase_count: number;
  }) => {
    if (!editingShopItem) return;
    try {
      await updateShopItem(editingShopItem.id, updates);
      setEditingShopItem(null);
      setToast({ message: "Shop item updated! ✅", type: "success" });
    } catch (err: unknown) {
      setToast({
        message:
          err instanceof Error ? err.message : "Failed to update shop item",
        type: "error",
      });
    }
  };

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
    // Reload logs when quests/items change
    const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
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

  const handleDeleteQuest = async (questId: string) => {
    try {
      await deleteQuest(questId);
      setToast({ message: "Quest deleted! ✅", type: "success" });
      // Reload logs after deletion
      const logs = await loadAllQuestLogs();
      setAllQuestLogs(logs);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to delete quest",
        type: "error",
      });
    }
  };

  const handleDeleteShopItem = async (itemId: string) => {
    try {
      await deleteShopItem(itemId);
      setToast({ message: "Shop item deleted! ✅", type: "success" });
      // Reload logs after deletion
      const logs = await loadAllShopLogs();
      setAllShopLogs(logs);
    } catch (err: unknown) {
      setToast({
        message:
          err instanceof Error ? err.message : "Failed to delete shop item",
        type: "error",
      });
    }
  };

  const handleResetProgress = async () => {
    if (!confirm("Reset wallet to zero? This cannot be undone.")) {
      return;
    }
    try {
      await resetWallet();
      setToast({ message: "Wallet reset to zero! ✅", type: "success" });
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to reset wallet",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">
            🎿 Kibblings
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-200 mt-1">
            Operation Skiskohli : Save Money, Get Ripped, Go Shred
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Wallet Display */}
        <div className="mb-8">
          <WalletDisplay wallet={wallet} loading={walletLoading} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
          <button
            onClick={() => setCurrentView("quests")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${
              currentView === "quests"
                ? "bg-amber-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => setCurrentView("shop")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${
              currentView === "shop"
                ? "bg-amber-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setCurrentView("progress")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${
              currentView === "progress"
                ? "bg-amber-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Progress
          </button>
        </div>

        {/* Quests View */}
        {currentView === "quests" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                Daily Quests
              </h2>
              <div className="w-full sm:w-64">
                <InputField
                  type="search"
                  placeholder="Search quests..."
                  value={questSearchQuery}
                  onChange={(e) => setQuestSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            {questsLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading quests...
              </div>
            ) : filteredQuests.length === 0 && questSearchQuery ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                No quests found matching "{questSearchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                    onUpdateReward={async (questId, newReward) => {
                      await updateQuest(questId, { reward: newReward });
                    }}
                    onViewLogs={handleViewQuestLogs}
                    onEdit={handleEditQuest}
                    onDelete={handleDeleteQuest}
                  />
                ))}
                <AddQuestCard
                  onCreate={async (questData) => {
                    await createQuest(questData);
                    setToast({ message: "Quest created! 🎯", type: "success" });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Shop View */}
        {currentView === "shop" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                Shop
              </h2>
              <div className="w-full sm:w-64">
                <InputField
                  type="search"
                  placeholder="Search shop items..."
                  value={shopSearchQuery}
                  onChange={(e) => setShopSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            {shopItemsLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading shop items...
              </div>
            ) : filteredShopItems.length === 0 && shopSearchQuery ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                No items found matching "{shopSearchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShopItems.map((item) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    walletTotal={wallet?.total ?? 0}
                    onPurchase={handlePurchaseItem}
                    onUpdatePrice={async (itemId, newPrice) => {
                      await updateShopItem(itemId, { price: newPrice });
                    }}
                    onViewLogs={handleViewShopLogs}
                    onEdit={handleEditShopItem}
                    onDelete={handleDeleteShopItem}
                  />
                ))}
                <AddShopItemCard
                  onCreate={async (itemData) => {
                    await createShopItem(itemData);
                    setToast({
                      message: "Shop item created! 🛍️",
                      type: "success",
                    });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {currentView === "progress" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Progress & Stats
            </h2>
            <GamificationPanel
              walletTotal={wallet?.total ?? 0}
              questLogs={allQuestLogs}
              shopLogs={allShopLogs}
              questNames={new Map(quests.map((q) => [q.id, q.name]))}
              quests={quests.map((q) => ({ id: q.id, reward: q.reward }))}
              shopItems={shopItems.map((item) => ({
                id: item.id,
                price: item.price,
              }))}
              onResetProgress={handleResetProgress}
            />
          </div>
        )}
      </main>

      {/* Log Views */}
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

      {/* Edit Modals */}
      {editingQuest && (
        <EditQuestCard
          quest={editingQuest}
          onSave={handleSaveQuestEdit}
          onClose={() => setEditingQuest(null)}
        />
      )}

      {editingShopItem && (
        <EditShopItemCard
          item={editingShopItem}
          onSave={handleSaveShopItemEdit}
          onClose={() => setEditingShopItem(null)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.type}
          show={true}
          onDismiss={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
}

export default App;
