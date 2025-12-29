/**
 * CyclingBorder - Component that cycles through tag colors for borders
 */

import { useEffect, useState } from "react";
import type { Tag } from "../types";
import { TAG_BORDER_CLASSES } from "../utils/tags";
import type { ShopTag } from "../types";
import { SHOP_TAG_BORDER_CLASSES } from "../utils/shopTags";

interface CyclingBorderProps {
  tags: Tag[];
  children: React.ReactNode;
  className?: string;
}

interface CyclingShopBorderProps {
  tags: ShopTag[];
  children: React.ReactNode;
  className?: string;
}

export function CyclingBorder({
  tags,
  children,
  className = "",
}: CyclingBorderProps) {
  const [currentTagIndex, setCurrentTagIndex] = useState(0);

  useEffect(() => {
    if (tags.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTagIndex((prev) => (prev + 1) % tags.length);
    }, 2000); // Cycle every 2 seconds

    return () => clearInterval(interval);
  }, [tags.length]);

  if (tags.length === 0) {
    return (
      <div className={`border-2 border-transparent rounded-2xl ${className}`}>
        {children}
      </div>
    );
  }

  if (tags.length === 1) {
    const borderClass = TAG_BORDER_CLASSES[tags[0]];
    return (
      <div className={`border-2 rounded-2xl ${borderClass} ${className}`}>
        {children}
      </div>
    );
  }

  // Multiple tags - cycle through them
  const currentTag = tags[currentTagIndex];
  const borderClass = TAG_BORDER_CLASSES[currentTag];

  return (
    <div
      className={`border-2 rounded-2xl transition-all duration-1000 ${borderClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function CyclingShopBorder({
  tags,
  children,
  className = "",
}: CyclingShopBorderProps) {
  const [currentTagIndex, setCurrentTagIndex] = useState(0);

  useEffect(() => {
    if (tags.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTagIndex((prev) => (prev + 1) % tags.length);
    }, 2000); // Cycle every 2 seconds

    return () => clearInterval(interval);
  }, [tags.length]);

  if (tags.length === 0) {
    return (
      <div className={`border-2 border-transparent rounded-2xl ${className}`}>
        {children}
      </div>
    );
  }

  if (tags.length === 1) {
    const borderClass = SHOP_TAG_BORDER_CLASSES[tags[0]];
    return (
      <div className={`border-2 rounded-2xl ${borderClass} ${className}`}>
        {children}
      </div>
    );
  }

  // Multiple tags - cycle through them
  const currentTag = tags[currentTagIndex];
  const borderClass = SHOP_TAG_BORDER_CLASSES[currentTag];

  return (
    <div
      className={`border-2 rounded-2xl transition-all duration-1000 ${borderClass} ${className}`}
    >
      {children}
    </div>
  );
}
