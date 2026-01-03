/**
 * Reusable Popup Modal Component
 * 
 * Styled to match edit-card modals with X close button in upper-right.
 * Used for Feature Updates and About popups.
 * 
 * TO EDIT POPUP CONTENT:
 * - Feature Updates: Edit FEATURE_UPDATES_VERSION and FEATURE_UPDATES_CONTENT in src/constants.ts
 * - About: Edit ABOUT_CONTENT in src/constants.ts
 */

import { useEffect } from "react";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function PopupModal({ isOpen, onClose, title, children }: PopupModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X Close Button - matches edit-card styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation z-10"
          aria-label="Close"
        >
          <span className="text-xl font-bold">×</span>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pr-10">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

