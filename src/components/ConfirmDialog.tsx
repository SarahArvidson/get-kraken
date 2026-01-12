/**
 * Get Kraken v2 - Confirmation Dialog
 * 
 * Reusable confirmation dialog for destructive actions
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  requireType?: string; // If provided, user must type this to confirm
  typeInput?: string;
  onTypeInputChange?: (value: string) => void;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
  requireType,
  typeInput = "",
  onTypeInputChange,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const canConfirm = requireType ? typeInput === requireType : true;

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
            <h2 className={`text-2xl font-bold mb-4 ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
              {title}
            </h2>

            {/* Message */}
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {message}
            </p>

            {/* Type to confirm */}
            {requireType && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <strong>{requireType}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={typeInput}
                  onChange={(e) => onTypeInputChange?.(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={requireType}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={!canConfirm}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  danger
                    ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
