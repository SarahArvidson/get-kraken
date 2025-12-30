/**
 * Get Kraken - Filtering Utilities
 *
 * Shared filtering logic for quests and shop items
 */

import type { Quest, ShopItem, Tag, ShopTag } from "../types";

export interface FilterOptions<T extends Tag | ShopTag> {
  items: (Quest | ShopItem)[];
  searchQuery: string;
  selectedTag: T | null;
  tagLabels: Record<T, string>;
}

/**
 * Filters items by tag and search query
 */
export function filterItems<T extends Quest | ShopItem, U extends Tag | ShopTag>(
  options: FilterOptions<U>
): T[] {
  const { items, searchQuery, selectedTag, tagLabels } = options;
  let filtered = [...items] as T[];

  // Filter by tag
  if (selectedTag) {
    filtered = filtered.filter(
      (item) => item.tags && item.tags.includes(selectedTag as any)
    );
  }

  // Filter by search query (name or tag name)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const tagMatch = item.tags.some((tag) => {
        const tagLabel = tagLabels[tag as U];
        return tagLabel ? tagLabel.toLowerCase().includes(query) : false;
      });
      return nameMatch || tagMatch;
    });
  }

  return filtered;
}

