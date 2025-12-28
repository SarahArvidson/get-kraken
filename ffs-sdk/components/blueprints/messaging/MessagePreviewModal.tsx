import React, { useState, useCallback } from "react";
import { Modal, Button, Toast } from "../../ui";
import type { MessagePreviewModalProps, Message, Contact } from "./types";

/**
 * MessagePreviewModal Component
 * ----------------------------
 * Modal for previewing SMS messages before sending
 */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({
  isOpen,
  onClose,
  message,
  recipients,
  onSend,
  onSchedule,
  className,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info" | "warning";
    show: boolean;
  } | null>(null);

  // ✅ Handle send message
  const handleSend = useCallback(async () => {
    setIsSending(true);
    try {
      await onSend?.();
      setToast({
        message: "Message sent successfully!",
        variant: "success",
        show: true,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Send error:", error);
      setToast({
        message: "Failed to send message. Please try again.",
        variant: "error",
        show: true,
      });
    } finally {
      setIsSending(false);
    }
  }, [onSend, onClose]);

  // ✅ Handle schedule message
  const handleSchedule = useCallback(async () => {
    if (!scheduledAt) {
      setToast({
        message: "Please select a date and time for scheduling",
        variant: "warning",
        show: true,
      });
      return;
    }

    setIsScheduling(true);
    try {
      await onSchedule?.(scheduledAt);
      setToast({
        message: "Message scheduled successfully!",
        variant: "success",
        show: true,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Schedule error:", error);
      setToast({
        message: "Failed to schedule message. Please try again.",
        variant: "error",
        show: true,
      });
    } finally {
      setIsScheduling(false);
    }
  }, [scheduledAt, onSchedule, onClose]);

  // ✅ Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  // ✅ Calculate total cost
  const totalCost = message.cost * recipients.length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Message Preview"
        size="lg"
        className={className}
      >
        <div className="space-y-6">
          {/* Message Content */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Message Content
            </h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Characters:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {message.content.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Segments:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {message.segments.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Recipients:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {recipients.length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cost per message:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${message.cost.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total cost:
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              {message.status === "scheduled" && message.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Scheduled for:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {new Date(message.scheduledAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recipients List */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Recipients ({recipients.length})
            </h4>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {recipients.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recipients.slice(0, 20).map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {(
                              contact.firstName?.[0] ||
                              contact.lastName?.[0] ||
                              contact.phoneNumber[0]
                            ).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {contact.firstName || contact.lastName
                              ? `${contact.firstName || ""} ${
                                  contact.lastName || ""
                                }`.trim()
                              : "Unknown Contact"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatPhoneNumber(contact.phoneNumber)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {contact.isOptedIn ? "Opted In" : "Opted Out"}
                      </div>
                    </div>
                  ))}
                  {recipients.length > 20 && (
                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      ... and {recipients.length - 20} more recipients
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No recipients selected
                </div>
              )}
            </div>
          </div>

          {/* Segment Preview */}
          {message.segments.length > 1 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Message Segments
              </h4>
              <div className="space-y-2">
                {message.segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Segment {index + 1}
                      </span>
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        {segment.characterCount} chars
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {segment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Delivery Options
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Schedule for later (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSending || isScheduling}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleSend}
              disabled={isSending || isScheduling || recipients.length === 0}
              loading={isSending}
              loadingText="Sending..."
            >
              Send Now
            </Button>

            {scheduledAt && (
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={isSending || isScheduling || recipients.length === 0}
                loading={isScheduling}
                loadingText="Scheduling..."
                className="bg-green-600 hover:bg-green-700"
              >
                Schedule Message
              </Button>
            )}
          </div>

          {/* Cost Warning */}
          {totalCost > 10 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm1-1a1 1 0 10-2 0v3a1 1 0 102 0v-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  This message will cost ${totalCost.toFixed(2)}. Please confirm
                  before sending.
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => setToast(null)}
          className="bottom-4 right-4"
        />
      )}
    </>
  );
};

export default MessagePreviewModal;
