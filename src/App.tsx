/**
 * Kibblings - Main App Component
 *
 * Mobile-first habit-tracker and rewards webapp for two people sharing a wallet
 */

import { useState } from "react";
import { Toast } from "@ffx/sdk";
import { useWallet } from "./hooks/useWallet";
import { useQuests } from "./hooks/useQuests";
import { useShopItems } from "./hooks/useShopItems";
import { WalletDisplay } from "./components/WalletDisplay";
import { QuestCard } from "./components/QuestCard";
import { ShopItemCard } from "./components/ShopItemCard";
import { AddQuestCard } from "./components/AddQuestCard";
import { AddShopItemCard } from "./components/AddShopItemCard";
import { LogView } from "./components/LogView";
import { GamificationPanel } from "./components/GamificationPanel";
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

  const { wallet, loading: walletLoading, updateWallet } = useWallet();
  const {
    quests,
    loading: questsLoading,
    createQuest,
    updateQuest,
    completeQuest,
    getQuestWithLogs,
  } = useQuests();
  const {
    shopItems,
    loading: shopItemsLoading,
    createShopItem,
    updateShopItem,
    purchaseItem,
    getShopItemWithLogs,
  } = useShopItems();

  const handleCompleteQuest = async (questId: string, reward: number) => {
    try {
      await completeQuest(questId, reward);
      await updateWallet(reward);
      setToast({ message: `Earned ${reward} kibblings! 🎉`, type: "success" });
    } catch (err: any) {
      setToast({
        message: err.message || "Failed to complete quest",
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
    } catch (err: any) {
      setToast({
        message: err.message || "Failed to purchase item",
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

  const handleEditQuest = async (quest: Quest) => {
    // For now, just allow editing reward via the card controls
    // Full edit modal can be added later
    console.log("Edit quest:", quest);
  };

  const handleEditShopItem = async (item: ShopItem) => {
    // For now, just allow editing price via the card controls
    // Full edit modal can be added later
    console.log("Edit shop item:", item);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            🎿 Kibblings
          </h1>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => setCurrentView("shop")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${
              currentView === "shop"
                ? "bg-amber-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setCurrentView("progress")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all touch-manipulation ${
              currentView === "progress"
                ? "bg-amber-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Progress
          </button>
        </div>

        {/* Quests View */}
        {currentView === "quests" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Daily Quests
            </h2>
            {questsLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading quests...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AddQuestCard
                  onCreate={async (questData) => {
                    await createQuest(questData);
                    setToast({ message: "Quest created! 🎯", type: "success" });
                  }}
                />
                {quests.map((quest) => (
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Shop
            </h2>
            {shopItemsLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading shop items...
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
                {shopItems.map((item) => (
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Progress & Stats
            </h2>
            <GamificationPanel
              walletTotal={wallet?.total ?? 0}
              questLogs={[]} // TODO: Load all quest logs for full stats
              shopLogs={[]} // TODO: Load all shop logs for full stats
              questNames={new Map(quests.map((q) => [q.id, q.name]))}
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
