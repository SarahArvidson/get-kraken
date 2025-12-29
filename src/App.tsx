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
import type { Quest, ShopItem, QuestLog, ShopLog, Tag } from "./types";
import { TAGS, TAG_LABELS, TAG_BUTTON_CLASSES } from "./utils/tags";

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
  const [selectedQuestTag, setSelectedQuestTag] = useState<Tag | null>(null);
  const [selectedShopTag, setSelectedShopTag] = useState<Tag | null>(null);

  // Filter quests based on search query and tag
  const filteredQuests = useMemo(() => {
    let filtered = quests;

    // Filter by tag
    if (selectedQuestTag) {
      filtered = filtered.filter((quest) => quest.tag === selectedQuestTag);
    }

    // Filter by search query (name or tag name)
    if (questSearchQuery.trim()) {
      const query = questSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((quest) => {
        const nameMatch = quest.name.toLowerCase().includes(query);
        const tagMatch = quest.tag
          ? TAG_LABELS[quest.tag].toLowerCase().includes(query)
          : false;
        return nameMatch || tagMatch;
      });
    }

    return filtered;
  }, [quests, questSearchQuery, selectedQuestTag]);

  // Filter shop items based on search query and tag
  const filteredShopItems = useMemo(() => {
    let filtered = shopItems;

    // Filter by tag
    if (selectedShopTag) {
      filtered = filtered.filter((item) => item.tag === selectedShopTag);
    }

    // Filter by search query (name or tag name)
    if (shopSearchQuery.trim()) {
      const query = shopSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const tagMatch = item.tag
          ? TAG_LABELS[item.tag].toLowerCase().includes(query)
          : false;
        return nameMatch || tagMatch;
      });
    }

    return filtered;
  }, [shopItems, shopSearchQuery, selectedShopTag]);

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
    tag: Tag;
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
    tag: Tag;
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
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-[oklch(0.79_0.11_264.93)]">
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
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedQuestTag(null)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedQuestTag === null
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All
              </button>
              {TAGS.map((tag) => {
                const classes = TAG_BUTTON_CLASSES[tag];
                const isActive = selectedQuestTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedQuestTag(isActive ? null : tag)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      isActive ? classes.active : classes.base
                    }`}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                );
              })}
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
                <AddQuestCard
                  onCreate={async (questData) => {
                    await createQuest(questData);
                    setToast({ message: "Quest created! 🎯", type: "success" });
                  }}
                />
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
                  />
                ))}
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
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedShopTag(null)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedShopTag === null
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All
              </button>
              {TAGS.map((tag) => {
                const classes = TAG_BUTTON_CLASSES[tag];
                const isActive = selectedShopTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedShopTag(isActive ? null : tag)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      isActive ? classes.active : classes.base
                    }`}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                );
              })}
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
                <AddShopItemCard
                  onCreate={async (itemData) => {
                    await createShopItem(itemData);
                    setToast({
                      message: "Shop item created! 🛍️",
                      type: "success",
                    });
                  }}
                />
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
                  />
                ))}
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
