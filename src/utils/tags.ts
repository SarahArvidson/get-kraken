/**
 * Tag utilities - colors and labels for tags
 */

import type { Tag } from "../types";

export const TAGS: NonNullable<Tag>[] = [
  "work",
  "finance",
  "home",
  "health",
  "relationship",
];

export const TAG_COLORS: Record<NonNullable<Tag>, string> = {
  work: "blue",
  finance: "green",
  home: "purple",
  health: "red",
  relationship: "pink",
};

export const TAG_LABELS: Record<NonNullable<Tag>, string> = {
  work: "Work",
  finance: "Finance",
  home: "Home",
  health: "Health",
  relationship: "Relationship",
};

export function getTagBorderClass(tag: Tag): string {
  if (!tag) return "";

  const color = TAG_COLORS[tag];
  return `border-${color}-400 dark:border-${color}-500 shadow-[0_0_8px_rgba(var(--${color}-400),0.4)] dark:shadow-[0_0_8px_rgba(var(--${color}-500),0.4)]`;
}

// Tailwind-safe border classes (must be in full class names for JIT)
export const TAG_BORDER_CLASSES: Record<NonNullable<Tag>, string> = {
  work: "border-blue-400 dark:border-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.4)] dark:shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  finance:
    "border-green-400 dark:border-green-500 shadow-[0_0_8px_rgba(74,222,128,0.4)] dark:shadow-[0_0_8px_rgba(34,197,94,0.4)]",
  home: "border-purple-400 dark:border-purple-500 shadow-[0_0_8px_rgba(196,181,253,0.4)] dark:shadow-[0_0_8px_rgba(167,139,250,0.4)]",
  health:
    "border-red-400 dark:border-red-500 shadow-[0_0_8px_rgba(248,113,113,0.4)] dark:shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  relationship:
    "border-pink-400 dark:border-pink-500 shadow-[0_0_8px_rgba(244,114,182,0.4)] dark:shadow-[0_0_8px_rgba(236,72,153,0.4)]",
};

export const TAG_BUTTON_CLASSES: Record<
  NonNullable<Tag>,
  { base: string; active: string }
> = {
  work: {
    base: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    active:
      "bg-blue-500 dark:bg-blue-600 text-white border-blue-600 dark:border-blue-500",
  },
  finance: {
    base: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
    active:
      "bg-green-500 dark:bg-green-600 text-white border-green-600 dark:border-green-500",
  },
  home: {
    base: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    active:
      "bg-purple-500 dark:bg-purple-600 text-white border-purple-600 dark:border-purple-500",
  },
  health: {
    base: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
    active:
      "bg-red-500 dark:bg-red-600 text-white border-red-600 dark:border-red-500",
  },
  relationship: {
    base: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700",
    active:
      "bg-pink-500 dark:bg-pink-600 text-white border-pink-600 dark:border-pink-500",
  },
};
