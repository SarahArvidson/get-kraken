/**
 * Get Kraken - Main App Component
 *
 * A habit tracker for sea monsters
 */

import { useState, useEffect, useMemo } from "react";
import { Toast, InputField } from "@ffx/sdk";
import { useWallet } from "./hooks/useWallet";
import { useQuests } from "./hooks/useQuests";
import { useShopItems } from "./hooks/useShopItems";
import { usePreferences } from "./hooks/usePreferences";
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
import type { Quest, ShopItem, QuestLog, ShopLog, Tag, ShopTag } from "./types";
import { TAGS, TAG_LABELS, TAG_BUTTON_CLASSES } from "./utils/tags";
import {
  SHOP_TAGS,
  SHOP_TAG_LABELS,
  SHOP_TAG_BUTTON_CLASSES,
} from "./utils/shopTags";

type View = "quests" | "shop" | "progress";

function App() {
  const [currentView, setCurrentView] = useState<View>("quests");
  const preferences = usePreferences();
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

  const [allQuestLogs, setAllQuestLogs] = useState<QuestLog[]>([]);
  const [allShopLogs, setAllShopLogs] = useState<ShopLog[]>([]);
  const [questSearchQuery, setQuestSearchQuery] = useState("");
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [selectedQuestTag, setSelectedQuestTag] = useState<Tag | null>(null);
  const [selectedShopTag, setSelectedShopTag] = useState<ShopTag | null>(null);

  // Filter quests based on search query and tag
  const filteredQuests = useMemo(() => {
    let filtered = quests;

    // Filter by tag
    if (selectedQuestTag) {
      filtered = filtered.filter(
        (quest) => quest.tags && quest.tags.includes(selectedQuestTag)
      );
    }

    // Filter by search query (name or tag name)
    if (questSearchQuery.trim()) {
      const query = questSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((quest) => {
        const nameMatch = quest.name.toLowerCase().includes(query);
        const tagMatch = quest.tags.some((tag) => {
          const tagLabel = TAG_LABELS[tag];
          return tagLabel ? tagLabel.toLowerCase().includes(query) : false;
        });
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
      filtered = filtered.filter(
        (item) => item.tags && item.tags.includes(selectedShopTag)
      );
    }

    // Filter by search query (name or tag name)
    if (shopSearchQuery.trim()) {
      const query = shopSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const tagMatch = item.tags.some((tag) => {
          const tagLabel = SHOP_TAG_LABELS[tag];
          return tagLabel ? tagLabel.toLowerCase().includes(query) : false;
        });
        return nameMatch || tagMatch;
      });
    }

    return filtered;
  }, [shopItems, shopSearchQuery, selectedShopTag]);

  const handleCompleteQuest = async (questId: string, reward: number) => {
    try {
      // Find the quest to get dollar_amount
      const quest = quests.find((q) => q.id === questId);
      const dollarAmount = quest?.dollar_amount || 0;

      await completeQuest(questId, reward);
      await updateWallet(reward, dollarAmount);
      playCoinSound(); // Play coin sound on successful completion
      setToast({ message: `Earned ${reward} sea dollars! 🎉`, type: "success" });
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
      // Find the shop item to get dollar_amount
      const item = shopItems.find((i) => i.id === itemId);
      const dollarAmount = item?.dollar_amount || 0;

      await purchaseItem(itemId, price);
      await updateWallet(-price, -dollarAmount); // Negative for purchases
      setToast({
        message: `Purchased for ${price} sea dollars! 🛒`,
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
    tags: Tag[];
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
    tags: ShopTag[];
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

  const handleResetAllProgress = async () => {
    if (!confirm("Reset all progress? This will delete all quest and shop logs and reset your wallet. This cannot be undone.")) {
      return;
    }
    try {
      // Delete logs first
      await deleteAllQuestLogs();
      await deleteAllShopLogs();
      // Reset wallet
      await resetWallet();
      // Reload logs to reflect the changes (should be empty now)
      const [questLogs, shopLogs] = await Promise.all([
        loadAllQuestLogs(),
        loadAllShopLogs(),
      ]);
      setAllQuestLogs(questLogs);
      setAllShopLogs(shopLogs);
      setToast({ message: "All progress reset! ✅", type: "success" });
    } catch (err: unknown) {
      console.error("Error resetting all progress:", err);
      setToast({
        message: err instanceof Error ? err.message : "Failed to reset all progress",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative" style={{ zIndex: 1 }}>
      {/* Underwater Bubbles Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bubble" />
        ))}
      </div>
      {/* Header */}
      <header className="bg-blue-100/50 dark:bg-gray-800 shadow-sm sticky top-0 z-20 relative backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Desktop Layout */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1"></div>
              <div className="flex items-center justify-center gap-4 flex-1">
                <img
                  src="/kraken-icon.png"
                  alt="Kraken"
                  className="h-32 object-contain flex-shrink-0"
                />
                <div className="flex flex-col items-start">
                  <h1 className="text-6xl font-bold text-gray-900 header-text-color leading-tight">
                    Get Kraken
                  </h1>
                  <p className="text-base text-gray-500 dark:text-gray-200 mt-1">
                    A habit tracker for sea monsters
                  </p>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => preferences.toggleDollarAmounts()}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors touch-manipulation ${
                    preferences.showDollarAmounts
                      ? "bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                  title={preferences.showDollarAmounts ? "Hide dollar amounts" : "Show dollar amounts"}
                >
                  💵 {preferences.showDollarAmounts ? "On" : "Off"}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-start gap-2 mb-2">
              <img
                src="/kraken-icon.png"
                alt="Kraken"
                className="h-20 object-contain flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-left text-gray-900 header-text-color leading-tight mb-1">
                  Get Kraken
                </h1>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-200 flex-shrink">
                    A habit tracker for sea monsters
                  </p>
                  <button
                    onClick={() => preferences.toggleDollarAmounts()}
                    className={`px-2 py-1 text-xs font-medium rounded-lg border-2 transition-colors touch-manipulation flex-shrink-0 ${
                      preferences.showDollarAmounts
                        ? "bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                    title={preferences.showDollarAmounts ? "Hide dollar amounts" : "Show dollar amounts"}
                  >
                    💵 {preferences.showDollarAmounts ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Wallet Display */}
        <div className="mb-8">
          <WalletDisplay 
            wallet={wallet} 
            loading={walletLoading}
            showDollarAmounts={preferences.showDollarAmounts}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-blue-100/30 dark:bg-gray-800 rounded-2xl p-2 shadow-sm backdrop-blur-sm">
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
                    await createQuest({
                      ...questData,
                      dollar_amount: 0, // Default to 0, can be set in edit form
                    });
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
                    onUpdateDollarAmount={preferences.showDollarAmounts ? async (questId, newDollarAmount) => {
                      await updateQuest(questId, { dollar_amount: newDollarAmount });
                    } : undefined}
                    onViewLogs={handleViewQuestLogs}
                    onEdit={handleEditQuest}
                    showDollarAmounts={preferences.showDollarAmounts}
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
              {SHOP_TAGS.map((tag) => {
                const classes = SHOP_TAG_BUTTON_CLASSES[tag];
                const isActive = selectedShopTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedShopTag(isActive ? null : tag)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      isActive ? classes.active : classes.base
                    }`}
                  >
                    {SHOP_TAG_LABELS[tag]}
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
                    await createShopItem({
                      ...itemData,
                      dollar_amount: 0, // Default to 0, can be set in edit form
                    });
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
                    onUpdateDollarAmount={preferences.showDollarAmounts ? async (itemId, newDollarAmount) => {
                      await updateShopItem(itemId, { dollar_amount: newDollarAmount });
                    } : undefined}
                    onViewLogs={handleViewShopLogs}
                    onEdit={handleEditShopItem}
                    showDollarAmounts={preferences.showDollarAmounts}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {currentView === "progress" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 header-text-color mb-4">
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
              onResetAllProgress={handleResetAllProgress}
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

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          Built by{" "}
          <a
            href="https://saraharvidson.github.io/sarahArvidson/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Sarah Arvidson
          </a>
          {" · "}
          <a
            href="https://github.com/SarahArvidson"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            GitHub
          </a>
          {" · "}
          <a
            href="https://www.venmo.com/u/Sarah-Arvidson"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-gray-300"
          >
            Venmo
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
