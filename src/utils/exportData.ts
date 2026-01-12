/**
 * Get Kraken v2 - Data Export Utilities
 * 
 * Exports user-owned data to CSV format
 */

import { supabase } from "../lib/supabase";

interface ExportOptions {
  includeQuests?: boolean;
  includeQuestLogs?: boolean;
  includeActivityLogs?: boolean;
  includeShopItems?: boolean;
  includeShopLogs?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')];
  
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      // Escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    rows.push(values.join(','));
  });
  
  return rows.join('\n');
}

/**
 * Export user data to CSV and trigger download
 */
export async function exportUserData(options: ExportOptions = {}) {
  try {
    const {
      data: { user },
    } = await supabase.supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const userId = user.id;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const files: { name: string; content: string }[] = [];

    // Export Quests
    if (options.includeQuests !== false) {
      const { data: quests, error: questsError } = await supabase
        .from("quests")
        .select("*")
        .or(`created_by.is.null,created_by.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (questsError) throw questsError;

      if (quests && quests.length > 0) {
        files.push({
          name: `quests-${timestamp}.csv`,
          content: arrayToCSV(quests, [
            'id',
            'name',
            'tags',
            'reward',
            'dollar_amount',
            'completion_count',
            'created_by',
            'created_at',
            'updated_at',
          ]),
        });
      }
    }

    // Export Quest Logs
    if (options.includeQuestLogs !== false) {
      const { data: questLogs, error: questLogsError } = await supabase
        .from("quest_logs")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (questLogsError) throw questLogsError;

      if (questLogs && questLogs.length > 0) {
        files.push({
          name: `quest-logs-${timestamp}.csv`,
          content: arrayToCSV(questLogs, [
            'id',
            'quest_id',
            'user_id',
            'completed_at',
          ]),
        });
      }
    }

    // Export Activity Logs
    if (options.includeActivityLogs !== false) {
      const { data: activityLogs, error: activityLogsError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false });

      if (activityLogsError) {
        // activity_logs might not exist yet, that's okay
        console.warn("Activity logs not available:", activityLogsError);
      } else if (activityLogs && activityLogs.length > 0) {
        files.push({
          name: `activity-logs-${timestamp}.csv`,
          content: arrayToCSV(activityLogs, [
            'id',
            'user_id',
            'quest_id',
            'habit_id',
            'reward_id',
            'action_type',
            'difficulty',
            'dollars_saved',
            'sand_dollars_earned',
            'logged_at',
            'source_user_id',
            'created_at',
          ]),
        });
      }
    }

    // Export Shop Items
    if (options.includeShopItems !== false) {
      const { data: shopItems, error: shopItemsError } = await supabase
        .from("shop_items")
        .select("*")
        .or(`created_by.is.null,created_by.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (shopItemsError) throw shopItemsError;

      if (shopItems && shopItems.length > 0) {
        files.push({
          name: `shop-items-${timestamp}.csv`,
          content: arrayToCSV(shopItems, [
            'id',
            'name',
            'tags',
            'price',
            'dollar_amount',
            'purchase_count',
            'created_by',
            'created_at',
            'updated_at',
          ]),
        });
      }
    }

    // Export Shop Logs
    if (options.includeShopLogs !== false) {
      const { data: shopLogs, error: shopLogsError } = await supabase
        .from("shop_logs")
        .select("*")
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });

      if (shopLogsError) throw shopLogsError;

      if (shopLogs && shopLogs.length > 0) {
        files.push({
          name: `shop-logs-${timestamp}.csv`,
          content: arrayToCSV(shopLogs, [
            'id',
            'shop_item_id',
            'user_id',
            'purchased_at',
          ]),
        });
      }
    }

    // Download all files
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', file.name);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    return files.length;
  } catch (error: any) {
    console.error("Error exporting data:", error);
    throw new Error(error.message || "Failed to export data");
  }
}
