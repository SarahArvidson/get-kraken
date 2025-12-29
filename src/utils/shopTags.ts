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
];

export const SHOP_TAG_COLORS: Record<ShopTag, string> = {
  hobbies: "indigo",
  "social life": "cyan",
  relationship: "pink",
  travel: "amber",
  family: "emerald",
};

export const SHOP_TAG_LABELS: Record<ShopTag, string> = {
  hobbies: "Hobbies",
  "social life": "Social Life",
  relationship: "Relationship",
  travel: "Travel",
  family: "Family",
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
};

export const SHOP_TAG_BUTTON_CLASSES: Record<
  ShopTag,
  { base: string; active: string }
> = {
  hobbies: {
    base: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-white border-indigo-300 dark:border-indigo-600",
    active:
      "bg-indigo-500 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-400",
  },
  "social life": {
    base: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-white border-cyan-300 dark:border-cyan-600",
    active:
      "bg-cyan-500 dark:bg-cyan-500 text-white border-cyan-600 dark:border-cyan-400",
  },
  relationship: {
    base: "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-white border-pink-300 dark:border-pink-600",
    active:
      "bg-pink-500 dark:bg-pink-500 text-white border-pink-600 dark:border-pink-400",
  },
  travel: {
    base: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-white border-amber-300 dark:border-amber-600",
    active:
      "bg-amber-500 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-400",
  },
  family: {
    base: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-white border-emerald-300 dark:border-emerald-600",
    active:
      "bg-emerald-500 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-400",
  },
};
