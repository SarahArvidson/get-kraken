/**
 * Get Kraken - Bubble Background Component
 *
 * Displays floating bubbles animation
 */

import { BUBBLE_COUNT } from "../constants";

export function BubbleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => (
        <div key={i} className="bubble" />
      ))}
    </div>
  );
}

