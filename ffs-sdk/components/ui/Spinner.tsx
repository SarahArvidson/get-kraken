import React from "react";

/**
 * Spinner (Reusable Atomic Component)
 * -----------------------------------
 * A foundational, accessible loading spinner component that serves as the building block
 * for all loading states across the Flying Fox Solutions Template Library.
 *
 * This component is designed for maximum reusability and can be used in:
 * - Button loading states
 * - Form submission indicators
 * - Modal loading overlays
 * - Page loading states
 * - Any UI element requiring loading feedback
 *
 * How to reuse:
 * 1) Import it: `import { Spinner } from "@ffx/sdk";`
 * 2) Use it anywhere:
 *    <Spinner size="md" color="primary" aria-label="Loading content" />
 *
 * Notes:
 * - Fully accessible with ARIA attributes and screen reader support
 * - Dark mode compatible
 * - Lightweight with Tailwind-only animation
 * - Multiple sizes and colors for design flexibility
 * - Optimized for performance with CSS transforms
 */

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerColor = "primary" | "white" | "gray";

export interface SpinnerProps {
  /** Size variant of the spinner */
  size?: SpinnerSize;
  /** Color variant of the spinner */
  color?: SpinnerColor;
  /** Accessible label for screen readers */
  "aria-label"?: string;
  /** Additional CSS classes */
  className?: string;
}

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Main Spinner component
function Spinner({
  size = "md",
  color = "primary",
  "aria-label": ariaLabel = "Loading",
  className,
}: SpinnerProps) {
  // ✅ Size styles
  const sizeStyles = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  // ✅ Color styles
  const colorStyles = {
    primary: "text-indigo-600 dark:text-indigo-400",
    white: "text-white",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cx("inline-flex items-center", className)}
    >
      {/* ✅ Screen reader text */}
      <span className="sr-only">{ariaLabel}</span>

      {/* ✅ Spinner SVG */}
      <svg
        className={cx("animate-spin", sizeStyles[size], colorStyles[color])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
}

// ✅ Export types + component for easy importing
export type { SpinnerProps as TSpinnerProps };
export default Spinner;
