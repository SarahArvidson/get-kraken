/**
 * Shop Tag utilities - colors and labels for shop item tags
 */

import type { ShopTag } from "../types";

export const SHOP_TAGS: ShopTag[] = [
  "hobbies",
  "social life",
  "relationship",
  "travel",
  "family",
  "little treat",
];

export const SHOP_TAG_COLORS: Record<ShopTag, string> = {
  hobbies: "indigo",
  "social life": "cyan",
  relationship: "pink",
  travel: "amber",
  family: "emerald",
  "little treat": "purple",
};

export const SHOP_TAG_LABELS: Record<ShopTag, string> = {
  hobbies: "Hobbies",
  "social life": "Social Life",
  relationship: "Relationship",
  travel: "Travel",
  family: "Family",
  "little treat": "Little Treat",
};

// Tailwind-safe border classes (must be in full class names for JIT)
export const SHOP_TAG_BORDER_CLASSES: Record<ShopTag, string> = {
  hobbies:
    "border-indigo-400 dark:border-indigo-500 shadow-[0_0_8px_rgba(129,140,248,0.4)] dark:shadow-[0_0_8px_rgba(99,102,241,0.4)]",
  "social life":
    "border-cyan-400 dark:border-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)] dark:shadow-[0_0_8px_rgba(6,182,212,0.4)]",
  relationship:
    "border-pink-400 dark:border-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.4)] dark:shadow-[0_0_8px_rgba(236,72,153,0.4)]",
  travel:
    "border-amber-400 dark:border-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.4)] dark:shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  family:
    "border-emerald-400 dark:border-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)] dark:shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  "little treat":
    "border-purple-400 dark:border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] dark:shadow-[0_0_8px_rgba(147,51,234,0.4)]",
};

export const SHOP_TAG_BUTTON_CLASSES: Record<
  ShopTag,
  { base: string; active: string }
> = {
  hobbies: {
    base: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
    active:
      "bg-indigo-500 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-400 shadow-md",
  },
  "social life": {
    base: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
    active:
      "bg-cyan-500 dark:bg-cyan-500 text-white border-cyan-600 dark:border-cyan-400 shadow-md",
  },
  relationship: {
    base: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
    active:
      "bg-pink-500 dark:bg-pink-500 text-white border-pink-600 dark:border-pink-400 shadow-md",
  },
  travel: {
    base: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
    active:
      "bg-amber-500 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-400 shadow-md",
  },
  family: {
    base: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
    active:
      "bg-emerald-500 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-400 shadow-md",
  },
  "little treat": {
    base: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700",
    active:
      "bg-purple-500 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-400 shadow-md",
  },
};
