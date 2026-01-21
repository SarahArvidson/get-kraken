/**
 * Get Kraken v2 - Quest Delete Confirmation Dialog
 * 
 * Custom dialog for quest deletion with three options:
 * - Cancel
 * - Delete Quest (keep progress)
 * - Delete Quest and All Progress
 */

interface QuestDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteQuest: () => void;
  onDeleteQuestAndProgress: () => void;
  questName: string;
}

export function QuestDeleteDialog({
  isOpen,
  onClose,
  onDeleteQuest,
  onDeleteQuestAndProgress,
  questName,
}: QuestDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              Delete Quest
            </h2>

            {/* Message */}
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              What would you like to do with "{questName}"?
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onDeleteQuestAndProgress}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Delete Quest and All Progress
              </button>
              <button
                onClick={onDeleteQuest}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Delete Quest (Keep Progress)
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
