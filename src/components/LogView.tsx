/**
 * Get Kraken - Log View Component
 *
 * Swipeable log view showing chronological history
 */

import { useState, useEffect, useRef } from "react";
import { Modal } from "@ffx/sdk";

interface LogViewProps<T extends { id: string }> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  logs: T[];
  getDateKey: (log: T) => string;
}

export function LogView<T extends { id: string }>({
  isOpen,
  onClose,
  title,
  logs,
  getDateKey,
}: LogViewProps<T>) {
  const [swipeIndex, setSwipeIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Reset swipe index when modal opens
  useEffect(() => {
    if (isOpen) {
      setSwipeIndex(0);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && swipeIndex < logs.length - 1) {
        // Swipe left - next log
        setSwipeIndex((prev) => prev + 1);
      } else if (diff < 0 && swipeIndex > 0) {
        // Swipe right - previous log
        setSwipeIndex((prev) => prev - 1);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrevious = () => {
    if (swipeIndex > 0) {
      setSwipeIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (swipeIndex < logs.length - 1) {
      setSwipeIndex((prev) => prev + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (logs.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
        <div className="text-center py-8 text-gray-500 dark:header-text-color">
          No logs yet. Start completing quests or purchasing items!
        </div>
      </Modal>
    );
  }

  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(getDateKey(b)).getTime() - new Date(getDateKey(a)).getTime()
  );
  const currentLog = sortedLogs[swipeIndex];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div
        className="relative min-h-[200px] touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipeable Log Content */}
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📅</div>
          <div className="text-2xl font-bold text-gray-900 mb-2 log-date-text">
            {formatDate(getDateKey(currentLog))}
          </div>
          <div className="text-sm text-gray-500 dark:header-text-color">
            {swipeIndex + 1} of {logs.length}
          </div>
        </div>

        {/* Navigation Controls - Desktop buttons with pagination indicators */}
        <div className="hidden sm:flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handlePrevious}
            disabled={swipeIndex === 0}
            className={`px-4 py-2 rounded-lg transition-all ${
              swipeIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "opacity-70 hover:opacity-100 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            } text-gray-700 dark:text-gray-200 font-semibold touch-manipulation`}
            aria-label="Previous log"
          >
            ← Previous
          </button>
          
          {/* Swipe Indicators */}
          <div className="flex justify-center gap-2">
            {sortedLogs.map((_, index) => (
              <button
                key={index}
                onClick={() => setSwipeIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === swipeIndex
                    ? "w-8 bg-amber-500"
                    : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Go to log ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            disabled={swipeIndex === logs.length - 1}
            className={`px-4 py-2 rounded-lg transition-all ${
              swipeIndex === logs.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "opacity-70 hover:opacity-100 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            } text-gray-700 dark:text-gray-200 font-semibold touch-manipulation`}
            aria-label="Next log"
          >
            Next →
          </button>
        </div>

        {/* Swipe Indicators - Mobile only */}
        <div className="flex sm:hidden justify-center gap-2 mt-4">
          {sortedLogs.map((_, index) => (
            <button
              key={index}
              onClick={() => setSwipeIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === swipeIndex
                  ? "w-8 bg-amber-500"
                  : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label={`Go to log ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Hints */}
        <div className="text-center mt-4 text-xs text-gray-400 dark:header-text-color">
          <span className="sm:hidden">Swipe left/right to navigate</span>
          <span className="hidden sm:inline">Click Previous/Next buttons or swipe to navigate</span>
        </div>
      </div>
    </Modal>
  );
}
