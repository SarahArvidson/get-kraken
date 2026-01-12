/**
 * Get Kraken v2 - Wallet Drilldown Component
 * 
 * Overlay/drawer showing wallet details and transaction history
 */

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "../hooks/useWallet";
import { useQuests } from "../hooks/useQuests";
import { useShopItems } from "../hooks/useShopItems";
import { usePreferences } from "../hooks/usePreferences";
import type { QuestLog, ShopLog } from "../types";
import { CURRENCY_SYMBOL } from "../constants";

interface WalletDrilldownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDrilldown({ isOpen, onClose }: WalletDrilldownProps) {
  const { wallet, loading: walletLoading } = useWallet();
  const { quests, loadAllQuestLogs } = useQuests();
  const { shopItems, loadAllShopLogs } = useShopItems();
  const preferences = usePreferences();
  const [questLogs, setQuestLogs] = useState<QuestLog[]>([]);
  const [shopLogs, setShopLogs] = useState<ShopLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTransactionHistory();
    }
  }, [isOpen]);

  const loadTransactionHistory = async () => {
    setLoadingLogs(true);
    try {
      const [quests, shops] = await Promise.all([
        loadAllQuestLogs(),
        loadAllShopLogs(),
      ]);
      setQuestLogs(quests);
      setShopLogs(shops);
    } catch (err) {
      console.error("Error loading transaction history:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const total = wallet?.total ?? 0;
  const dollarTotal = wallet?.dollar_total ?? 0;

  // Build lookup maps for quest and shop item names
  const questMap = useMemo(() => {
    const map: Record<string, { name: string; reward: number; dollar_amount: number }> = {};
    quests.forEach(quest => {
      map[quest.id] = {
        name: quest.name,
        reward: quest.reward,
        dollar_amount: quest.dollar_amount,
      };
    });
    return map;
  }, [quests]);

  const shopItemMap = useMemo(() => {
    const map: Record<string, { name: string; price: number; dollar_amount: number }> = {};
    shopItems.forEach(item => {
      map[item.id] = {
        name: item.name,
        price: item.price,
        dollar_amount: item.dollar_amount,
      };
    });
    return map;
  }, [shopItems]);

  // Sort logs by date (most recent first) with names and amounts
  const allTransactions = useMemo(() => [
    ...questLogs.map(log => {
      const quest = questMap[log.quest_id];
      return {
        type: 'quest' as const,
        id: log.id,
        questId: log.quest_id,
        date: log.completed_at,
        name: quest?.name || 'Unknown Quest',
        amount: quest?.reward || 0,
        dollarAmount: quest?.dollar_amount || 0,
      };
    }),
    ...shopLogs.map(log => {
      const item = shopItemMap[log.shop_item_id];
      return {
        type: 'purchase' as const,
        id: log.id,
        itemId: log.shop_item_id,
        date: log.purchased_at,
        name: item?.name || 'Unknown Item',
        amount: item?.price || 0,
        dollarAmount: item?.dollar_amount || 0,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [questLogs, shopLogs, questMap, shopItemMap]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Wallet details"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Wallet Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              aria-label="Close wallet details"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Wallet Summary */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3 uppercase tracking-wide">
                Current Balance
              </h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src="/sea-dollar.svg" alt="Sand dollar" className="w-10 h-10 inline-block" />
                <span className="text-5xl font-bold text-amber-900 dark:text-amber-100">
                  {walletLoading ? "..." : total}
                </span>
              </div>
              {preferences.showDollarAmounts && (
                <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-amber-800/30">
                  <span className="text-2xl">{CURRENCY_SYMBOL}</span>
                  <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {walletLoading ? "..." : Math.round(dollarTotal)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Transaction History
            </h3>
            {loadingLogs ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : allTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.map((transaction) => (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {transaction.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {transaction.type === 'quest' ? (
                          <div className="text-green-600 dark:text-green-400 font-semibold">
                            <span className="flex items-center gap-1">
                              +{transaction.amount} <img src="/sea-dollar.svg" alt="Sand dollar" className="w-4 h-4 inline-block" />
                            </span>
                          </div>
                        ) : (
                          <div className="text-red-600 dark:text-red-400 font-semibold">
                            <span className="flex items-center gap-1">
                              -{transaction.amount} <img src="/sea-dollar.svg" alt="Sand dollar" className="w-4 h-4 inline-block" />
                            </span>
                          </div>
                        )}
                        {preferences.showDollarAmounts && transaction.dollarAmount !== 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.type === 'quest' ? '+' : '-'}
                            {CURRENCY_SYMBOL}{Math.abs(transaction.dollarAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
