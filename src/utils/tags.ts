/**
 * Tag utilities - colors and labels for tags
 */

import type { Tag } from "../types";

export const TAGS: Tag[] = [
  "work",
  "finance",
  "home",
  "health",
  "relationship",
];

export const TAG_COLORS: Record<Tag, string> = {
  work: "blue",
  finance: "green",
  home: "purple",
  health: "red",
  relationship: "pink",
};

export const TAG_LABELS: Record<Tag, string> = {
  work: "Work",
  finance: "Finance",
  home: "Home",
  health: "Health",
  relationship: "Relationship",
};

// Tailwind-safe border classes (must be in full class names for JIT)
export const TAG_BORDER_CLASSES: Record<Tag, string> = {
  work: "border-blue-400 dark:border-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.4)] dark:shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  finance:
    "border-green-400 dark:border-green-500 shadow-[0_0_8px_rgba(74,222,128,0.4)] dark:shadow-[0_0_8px_rgba(34,197,94,0.4)]",
  home: "border-purple-400 dark:border-purple-500 shadow-[0_0_8px_rgba(196,181,253,0.4)] dark:shadow-[0_0_8px_rgba(167,139,250,0.4)]",
  health:
    "border-red-400 dark:border-red-500 shadow-[0_0_8px_rgba(248,113,113,0.4)] dark:shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  relationship:
    "border-pink-400 dark:border-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.4)] dark:shadow-[0_0_8px_rgba(236,72,153,0.4)]",
};

export const TAG_BUTTON_CLASSES: Record<Tag, { base: string; active: string }> =
  {
    work: {
      base: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-white border-blue-300 dark:border-blue-600",
      active:
        "bg-blue-500 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-400",
    },
    finance: {
      base: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-white border-green-300 dark:border-green-600",
      active:
        "bg-green-500 dark:bg-green-500 text-white border-green-600 dark:border-green-400",
    },
    home: {
      base: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-white border-purple-300 dark:border-purple-600",
      active:
        "bg-purple-500 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-400",
    },
    health: {
      base: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-white border-red-300 dark:border-red-600",
      active:
        "bg-red-500 dark:bg-red-500 text-white border-red-600 dark:border-red-400",
    },
    relationship: {
      base: "bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-white border-pink-300 dark:border-pink-600",
      active:
        "bg-pink-500 dark:bg-pink-500 text-white border-pink-600 dark:border-pink-400",
    },
  };
