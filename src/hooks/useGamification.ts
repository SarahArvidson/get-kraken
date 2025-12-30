/**
 * Get Kraken - Gamification Hook
 *
 * Manages streaks, weekly recap, milestones, and ski trip progress
 */

import { useMemo } from "react";
import type { QuestLog, ShopLog, WeeklyRecap, QuestStreak } from "../types";

const SKI_TRIP_TARGET = 2000; // Target kibblings for March ski trip
const MILESTONES = [100, 250, 500, 1000, 1500, 2000];

interface UseGamificationProps {
  walletTotal: number;
  questLogs: QuestLog[];
  shopLogs: ShopLog[];
  quests: Array<{ id: string; reward: number; dollar_amount?: number | null }>;
  shopItems: Array<{ id: string; price: number; dollar_amount?: number | null }>;
}

export function useGamification({
  walletTotal,
  questLogs,
  shopLogs,
  quests,
  shopItems,
}: UseGamificationProps) {
  // Create maps for quick lookup
  const questRewardMap = useMemo(() => {
    const map = new Map<string, number>();
    quests.forEach((q) => map.set(q.id, q.reward));
    return map;
  }, [quests]);

  const shopPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    shopItems.forEach((item) => map.set(item.id, item.price));
    return map;
  }, [shopItems]);

  const questDollarMap = useMemo(() => {
    const map = new Map<string, number>();
    quests.forEach((q) => map.set(q.id, Math.round(q.dollar_amount || 0)));
    return map;
  }, [quests]);

  const shopDollarMap = useMemo(() => {
    const map = new Map<string, number>();
    shopItems.forEach((item) => map.set(item.id, Math.round(item.dollar_amount || 0)));
    return map;
  }, [shopItems]);

  // Calculate weekly recap
  const weeklyRecap = useMemo((): WeeklyRecap | null => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Filter logs from this week
    const thisWeekQuestLogs = questLogs.filter((log) => {
      const logDate = new Date(log.completed_at);
      return logDate >= weekStart && logDate < weekEnd;
    });

    const thisWeekShopLogs = shopLogs.filter((log) => {
      const logDate = new Date(log.purchased_at);
      return logDate >= weekStart && logDate < weekEnd;
    });

    // Calculate earned from quest completions (sea dollars)
    const earned = thisWeekQuestLogs.reduce((sum, log) => {
      const reward = questRewardMap.get(log.quest_id) || 0;
      return sum + reward;
    }, 0);

    // Calculate earned dollars from quest completions (rounded to integers)
    const earnedDollars = thisWeekQuestLogs.reduce((sum, log) => {
      const dollarAmount = questDollarMap.get(log.quest_id) || 0;
      return sum + Math.round(dollarAmount);
    }, 0);

    // Calculate spent from shop purchases (sea dollars)
    const spent = thisWeekShopLogs.reduce((sum, log) => {
      const price = shopPriceMap.get(log.shop_item_id) || 0;
      return sum + price;
    }, 0);

    // Calculate spent dollars from shop purchases (rounded to integers)
    const spentDollars = thisWeekShopLogs.reduce((sum, log) => {
      const dollarAmount = shopDollarMap.get(log.shop_item_id) || 0;
      return sum + Math.round(dollarAmount);
    }, 0);

    const net = earned - spent;
    const netDollars = earnedDollars - spentDollars;

    return {
      earned,
      spent,
      net,
      earnedDollars,
      spentDollars,
      netDollars,
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
    };
  }, [questLogs, shopLogs, questRewardMap, questDollarMap, shopPriceMap, shopDollarMap]);

  // Calculate quest streaks
  const questStreaks = useMemo((): QuestStreak[] => {
    // Group logs by quest
    const logsByQuest = new Map<string, QuestLog[]>();
    questLogs.forEach((log) => {
      const existing = logsByQuest.get(log.quest_id) || [];
      existing.push(log);
      logsByQuest.set(log.quest_id, existing);
    });

    const streaks: QuestStreak[] = [];

    logsByQuest.forEach((logs, questId) => {
      // Sort logs by date (newest first)
      const sortedLogs = [...logs].sort(
        (a, b) =>
          new Date(b.completed_at).getTime() -
          new Date(a.completed_at).getTime()
      );

      if (sortedLogs.length === 0) {
        streaks.push({
          quest_id: questId,
          current_streak: 0,
          last_completed: null,
        });
        return;
      }

      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const checkDate = new Date(today);
      for (const log of sortedLogs) {
        const logDate = new Date(log.completed_at);
        logDate.setHours(0, 0, 0, 0);

        // Check if this log is for the date we're checking
        const daysDiff = Math.floor(
          (checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (daysDiff === 1) {
          // Missed a day, streak broken
          break;
        } else {
          // Gap too large, streak broken
          break;
        }
      }

      streaks.push({
        quest_id: questId,
        current_streak: streak,
        last_completed: sortedLogs[0].completed_at,
      });
    });

    return streaks;
  }, [questLogs]);

  // Check for milestone achievements
  const currentMilestone = useMemo(() => {
    return MILESTONES.find((milestone) => walletTotal >= milestone) || null;
  }, [walletTotal]);

  const nextMilestone = useMemo(() => {
    return MILESTONES.find((milestone) => walletTotal < milestone) || null;
  }, [walletTotal]);

  // Calculate ski trip progress
  const skiTripProgress = useMemo(() => {
    const progress = Math.min(100, (walletTotal / SKI_TRIP_TARGET) * 100);
    const remaining = Math.max(0, SKI_TRIP_TARGET - walletTotal);
    return {
      progress,
      remaining,
      target: SKI_TRIP_TARGET,
      current: walletTotal,
    };
  }, [walletTotal]);

  return {
    weeklyRecap,
    questStreaks,
    currentMilestone,
    nextMilestone,
    skiTripProgress,
    milestones: MILESTONES,
  };
}
