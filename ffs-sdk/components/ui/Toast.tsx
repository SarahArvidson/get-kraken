import React, { useEffect, useState } from "react";

/**
 * Toast (Reusable Atomic Component)
 * ---------------------------------
 * A foundational, accessible toast notification component that serves as the building block
 * for all notification feedback across the Flying Fox Solutions Template Library.
 *
 * This component is designed for maximum reusability and can be used for:
 * - Success confirmations (form submissions, actions completed)
 * - Error notifications (validation failures, API errors)
 * - Info messages (general information, tips)
 * - Warning alerts (important notices, caution messages)
 *
 * How to reuse:
 * 1) Import it: `import { Toast } from "@ffx/sdk";`
 * 2) Use it anywhere:
 *    <Toast
 *      message="Successfully saved your changes!"
 *      variant="success"
 *      duration={3000}
 *      show={showToast}
 *      onDismiss={() => setShowToast(false)}
 *    />
 *
 * Notes:
 * - Fully accessible with ARIA attributes and screen reader support
 * - Dark mode compatible
 * - Auto-dismiss with customizable duration
 * - Manual dismiss with close button
 * - Smooth animations with CSS transitions
 * - Stackable with offset positioning
 */

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  /** Toast message content */
  message: string;
  /** Visual variant of the toast */
  variant?: ToastVariant;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Whether the toast is visible */
  show?: boolean;
  /** Function called when toast is dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes for the toast container */
  className?: string;
  /** Custom aria-label for the toast */
  "aria-label"?: string;
}

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Icon component for each variant
const ToastIcon = ({ variant }: { variant: ToastVariant }) => {
  const iconClasses = "h-5 w-5 flex-shrink-0";

  switch (variant) {
    case "success":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "error":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "warning":
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "info":
    default:
      return (
        <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

// ✅ Main Toast component
function Toast({
  message,
  variant = "info",
  duration = 5000,
  show = false,
  onDismiss,
  className,
  "aria-label": ariaLabel,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ Handle show/hide state changes
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  // ✅ Auto-dismiss timer
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onDismiss]);

  // ✅ Variant styles
  const variantStyles = {
    success: cx(
      "bg-green-50 border-green-200 text-green-800",
      "dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
    ),
    error: cx(
      "bg-red-50 border-red-200 text-red-800",
      "dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
    ),
    warning: cx(
      "bg-yellow-50 border-yellow-200 text-yellow-800",
      "dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200"
    ),
    info: cx(
      "bg-blue-50 border-blue-200 text-blue-800",
      "dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
    ),
  };

  // ✅ Icon colors
  const iconColors = {
    success: "text-green-400 dark:text-green-500",
    error: "text-red-400 dark:text-red-500",
    warning: "text-yellow-400 dark:text-yellow-500",
    info: "text-blue-400 dark:text-blue-500",
  };

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label={ariaLabel || `${variant} notification`}
      className={cx(
        // Base styles
        "fixed top-4 right-4 z-50 max-w-sm w-full",
        "border rounded-lg shadow-lg p-4",
        "transform transition-all duration-300 ease-in-out",
        // Animation states
        isAnimating
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
        // Variant styles
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start">
        {/* ✅ Icon */}
        <div className={cx("flex-shrink-0 mr-3", iconColors[variant])}>
          <ToastIcon variant={variant} />
        </div>

        {/* ✅ Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">{message}</p>
        </div>

        {/* ✅ Close Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cx(
              "ml-3 flex-shrink-0 rounded-md p-1.5",
              "hover:bg-black/10 dark:hover:bg-white/10",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "transition-colors duration-200"
            )}
            aria-label="Dismiss notification"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ✅ Export types + component for easy importing
export type { ToastProps as TToastProps };
export default Toast;
