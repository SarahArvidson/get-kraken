import React, { forwardRef } from "react";
import Spinner from "./Spinner";

/**
 * Button (Reusable Atomic Component)
 * ----------------------------------
 * A foundational, accessible button component that serves as the building block
 * for all interactive elements across the Flying Fox Solutions Template Library.
 *
 * This component is designed for maximum reusability and can be used in:
 * - Form submissions and actions
 * - Navigation elements
 * - Modal and dialog controls
 * - Card actions and CTAs
 * - Any interactive UI element requiring a button
 *
 * How to reuse:
 * 1) Import it: `import { Button } from "@ffx/sdk";`
 * 2) Use it anywhere:
 *    <Button
 *      variant="primary"
 *      size="md"
 *      onClick={handleClick}
 *      loading={isLoading}
 *    >
 *      Click me
 *    </Button>
 *
 * Notes:
 * - Fully accessible with ARIA attributes and keyboard navigation
 * - Dark mode compatible
 * - Supports loading states with spinner animation
 * - Multiple variants and sizes for design flexibility
 * - Responsive design with mobile-first approach
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Custom content to show when loading (defaults to spinner) */
  loadingText?: string;
  /** Additional CSS classes for the button */
  className?: string;
  /** Button content */
  children: React.ReactNode;
  /** If provided, renders as an anchor tag with href */
  href?: string;
}

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Map button sizes to spinner sizes
const getSpinnerSize = (buttonSize: ButtonSize): "sm" | "md" | "lg" => {
  switch (buttonSize) {
    case "sm":
      return "sm";
    case "md":
      return "md";
    case "lg":
      return "lg";
    default:
      return "md";
  }
};

// ✅ Map button variants to spinner colors
const getSpinnerColor = (
  variant: ButtonVariant
): "primary" | "white" | "gray" => {
  switch (variant) {
    case "primary":
    case "danger":
      return "white";
    case "secondary":
      return "primary";
    case "ghost":
    case "outline":
      return "gray";
    default:
      return "primary";
  }
};

// ✅ Main Button component with forwardRef for form libraries
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    loadingText,
    className,
    children,
    disabled,
    href,
    ...rest
  },
  ref
) {
  // ✅ Variant styles
  const variantStyles = {
    primary: cx(
      "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      "disabled:bg-indigo-400 disabled:cursor-not-allowed"
    ),
    secondary: cx(
      "bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
      "dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700"
    ),
    danger: cx(
      "bg-red-600 text-white shadow-sm hover:bg-red-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
      "disabled:bg-red-400 disabled:cursor-not-allowed"
    ),
    ghost: cx(
      "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      "disabled:text-gray-400 disabled:cursor-not-allowed",
      "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    ),
    outline: cx(
      "bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
      "dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-800"
    ),
  };

  // ✅ Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // ✅ Base button styles
  const baseStyles = cx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "disabled:opacity-60",
    fullWidth && "w-full",
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  const isDisabled = disabled || loading;

  if (href) {
    return (
      <a
        href={href}
        className={baseStyles}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {loading && (
          <>
            <Spinner
              size={getSpinnerSize(size)}
              color={getSpinnerColor(variant)}
              aria-label="Loading"
            />
            {loadingText && <span>{loadingText}</span>}
          </>
        )}
        {!loading && children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={rest.type || "button"}
      disabled={isDisabled}
      className={baseStyles}
      aria-disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <>
          <Spinner
            size={getSpinnerSize(size)}
            color={getSpinnerColor(variant)}
            aria-label="Loading"
          />
          {loadingText && <span>{loadingText}</span>}
        </>
      )}
      {!loading && children}
    </button>
  );
});

// ✅ Export types + component for easy importing
export type { ButtonProps as TButtonProps };
export default Button;
