import React, { useEffect, useRef, forwardRef } from "react";

/**
 * Modal (Reusable Atomic Component)
 * ---------------------------------
 * A foundational, accessible modal component that serves as the building block
 * for all overlay dialogs across the Flying Fox Solutions Template Library.
 *
 * This component is designed for maximum reusability and can be used in:
 * - Confirmation dialogs
 * - Form submissions and data entry
 * - Image and content viewers
 * - Settings and configuration panels
 * - Any overlay content requiring user attention
 *
 * How to reuse:
 * 1) Import it: `import { Modal } from "@ffx/sdk";`
 * 2) Use it anywhere:
 *    <Modal
 *      isOpen={isModalOpen}
 *      onClose={() => setIsModalOpen(false)}
 *      title="Confirm Action"
 *      size="md"
 *    >
 *      <p>Are you sure you want to proceed?</p>
 *      <div className="flex gap-2 justify-end">
 *        <Button variant="ghost" onClick={onClose}>Cancel</Button>
 *        <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *      </div>
 *    </Modal>
 *
 * Notes:
 * - Fully accessible with ARIA attributes and keyboard navigation
 * - Dark mode compatible
 * - Focus trap when open, restores focus on close
 * - ESC key and click-outside-to-close support
 * - Responsive design with mobile-first approach
 */

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function called when modal should close */
  onClose: () => void;
  /** Title for the modal */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size variant of the modal */
  size?: ModalSize;
  /** Whether to close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Whether to close on ESC key */
  closeOnEscape?: boolean;
  /** Additional CSS classes for the modal container */
  className?: string;
  /** Additional CSS classes for the modal content */
  contentClassName?: string;
  /** Custom aria-label for the modal (defaults to title) */
  ariaLabel?: string;
}

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Hook for managing focus trap
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements within the modal
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      // Restore focus to the previously focused element
      previousActiveElementRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
};

// ✅ Main Modal component
const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className,
    contentClassName,
    ariaLabel,
  },
  ref
) {
  const containerRef = useFocusTrap(isOpen);

  // ✅ Size styles
  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  // ✅ Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, closeOnEscape, onClose]);

  // ✅ Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ✅ Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-label={ariaLabel || title}
    >
      {/* ✅ Backdrop/Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity dark:bg-opacity-75"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* ✅ Modal Content */}
      <div
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          containerRef.current = node;
        }}
        className={cx(
          "relative w-full mx-4 bg-white rounded-lg shadow-xl transition-all",
          "dark:bg-gray-900 dark:border dark:border-gray-700",
          sizeStyles[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-1 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* ✅ Content */}
        <div className={cx(title ? "p-6" : "p-6 pt-6", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
});

// ✅ Export types + component for easy importing
export type { ModalProps as TModalProps };
export default Modal;
