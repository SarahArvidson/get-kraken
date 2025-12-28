import React, { useState, useCallback, useEffect } from "react";
import { Button, InputField, FormGroup, Modal, Toast } from "../../ui";
import type { AutoReplyManagerProps, AutoReply } from "./types";

/**
 * AutoReplyManager Component
 * -------------------------
 * Manage auto-reply keywords and messages for SMS campaigns
 */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const AutoReplyManager: React.FC<AutoReplyManagerProps> = ({
  onSave,
  onDelete,
  onToggle,
  className,
}) => {
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReply, setEditingReply] = useState<AutoReply | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info" | "warning";
    show: boolean;
  } | null>(null);

  // ✅ Load auto-replies (mock data for now)
  useEffect(() => {
    const loadAutoReplies = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock auto-reply data
        const mockAutoReplies: AutoReply[] = [
          {
            id: "ar-1",
            keyword: "STOP",
            message:
              "You have been unsubscribed from our messages. Reply START to resubscribe.",
            isActive: true,
            createdAt: "2024-01-10T10:00:00Z",
            updatedAt: "2024-01-10T10:00:00Z",
            triggerCount: 45,
          },
          {
            id: "ar-2",
            keyword: "START",
            message:
              "Welcome back! You are now subscribed to receive our messages.",
            isActive: true,
            createdAt: "2024-01-10T10:05:00Z",
            updatedAt: "2024-01-10T10:05:00Z",
            triggerCount: 23,
          },
          {
            id: "ar-3",
            keyword: "HELP",
            message:
              "For assistance, visit our website at example.com or call us at (555) 123-4567.",
            isActive: true,
            createdAt: "2024-01-10T10:10:00Z",
            updatedAt: "2024-01-10T10:10:00Z",
            triggerCount: 12,
          },
          {
            id: "ar-4",
            keyword: "INFO",
            message:
              "Get the latest updates and information by visiting our website.",
            isActive: false,
            createdAt: "2024-01-10T10:15:00Z",
            updatedAt: "2024-01-10T10:15:00Z",
            triggerCount: 8,
          },
        ];

        setAutoReplies(mockAutoReplies);
      } catch (err) {
        setError("Failed to load auto-replies");
        console.error("Error loading auto-replies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAutoReplies();
  }, []);

  // ✅ Handle create auto-reply
  const handleCreate = useCallback(async () => {
    if (!newKeyword.trim() || !newMessage.trim()) {
      setToast({
        message: "Please fill in all required fields",
        variant: "warning",
        show: true,
      });
      return;
    }

    // Check for duplicate keywords
    if (
      autoReplies.some(
        (reply) => reply.keyword.toUpperCase() === newKeyword.toUpperCase()
      )
    ) {
      setToast({
        message: "Keyword already exists",
        variant: "error",
        show: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const newAutoReply: AutoReply = {
        id: `ar-${Date.now()}`,
        keyword: newKeyword.toUpperCase(),
        message: newMessage,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        triggerCount: 0,
      };

      await onSave?.(newAutoReply);
      setAutoReplies((prev) => [newAutoReply, ...prev]);

      setToast({
        message: "Auto-reply created successfully!",
        variant: "success",
        show: true,
      });

      setShowCreateModal(false);
      setNewKeyword("");
      setNewMessage("");
    } catch (error) {
      console.error("Create error:", error);
      setToast({
        message: "Failed to create auto-reply. Please try again.",
        variant: "error",
        show: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [newKeyword, newMessage, autoReplies, onSave]);

  // ✅ Handle edit auto-reply
  const handleEdit = useCallback(async () => {
    if (!editingReply || !newKeyword.trim() || !newMessage.trim()) return;

    setIsSaving(true);
    try {
      const updatedReply: AutoReply = {
        ...editingReply,
        keyword: newKeyword.toUpperCase(),
        message: newMessage,
        updatedAt: new Date().toISOString(),
      };

      await onSave?.(updatedReply);
      setAutoReplies((prev) =>
        prev.map((reply) =>
          reply.id === editingReply.id ? updatedReply : reply
        )
      );

      setToast({
        message: "Auto-reply updated successfully!",
        variant: "success",
        show: true,
      });

      setEditingReply(null);
      setNewKeyword("");
      setNewMessage("");
    } catch (error) {
      console.error("Edit error:", error);
      setToast({
        message: "Failed to update auto-reply. Please try again.",
        variant: "error",
        show: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [editingReply, newKeyword, newMessage, onSave]);

  // ✅ Handle delete auto-reply
  const handleDelete = useCallback(
    async (autoReply: AutoReply) => {
      if (
        window.confirm(
          `Are you sure you want to delete the "${autoReply.keyword}" auto-reply?`
        )
      ) {
        try {
          await onDelete?.(autoReply.id);
          setAutoReplies((prev) =>
            prev.filter((reply) => reply.id !== autoReply.id)
          );

          setToast({
            message: "Auto-reply deleted successfully!",
            variant: "success",
            show: true,
          });
        } catch (error) {
          console.error("Delete error:", error);
          setToast({
            message: "Failed to delete auto-reply. Please try again.",
            variant: "error",
            show: true,
          });
        }
      }
    },
    [onDelete]
  );

  // ✅ Handle toggle auto-reply
  const handleToggle = useCallback(
    async (autoReply: AutoReply) => {
      try {
        await onToggle?.(autoReply.id, !autoReply.isActive);
        setAutoReplies((prev) =>
          prev.map((reply) =>
            reply.id === autoReply.id
              ? {
                  ...reply,
                  isActive: !reply.isActive,
                  updatedAt: new Date().toISOString(),
                }
              : reply
          )
        );

        setToast({
          message: `Auto-reply ${
            !autoReply.isActive ? "enabled" : "disabled"
          } successfully!`,
          variant: "success",
          show: true,
        });
      } catch (error) {
        console.error("Toggle error:", error);
        setToast({
          message: "Failed to update auto-reply status. Please try again.",
          variant: "error",
          show: true,
        });
      }
    },
    [onToggle]
  );

  // ✅ Open edit modal
  const openEditModal = useCallback((autoReply: AutoReply) => {
    setEditingReply(autoReply);
    setNewKeyword(autoReply.keyword);
    setNewMessage(autoReply.message);
    setShowCreateModal(true);
  }, []);

  // ✅ Close modal
  const closeModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingReply(null);
    setNewKeyword("");
    setNewMessage("");
  }, []);

  // ✅ Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
          className
        )}
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading auto-replies...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
          className
        )}
      >
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Auto-Replies
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx("bg-white dark:bg-gray-800 rounded-lg shadow", className)}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Auto-Reply Manager
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set up automatic responses to keywords in incoming messages
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Add Auto-Reply
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {autoReplies.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Auto-Replies Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first auto-reply to automatically respond to keywords
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Auto-Reply
            </Button>
          </div>
        ) : (
          autoReplies.map((autoReply) => (
            <div
              key={autoReply.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200">
                      {autoReply.keyword}
                    </span>
                    <span
                      className={cx(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        autoReply.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
                      )}
                    >
                      {autoReply.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {autoReply.triggerCount} triggers
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {autoReply.message}
                  </p>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {formatDate(autoReply.createdAt)}
                    {autoReply.updatedAt !== autoReply.createdAt && (
                      <span> • Updated: {formatDate(autoReply.updatedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggle(autoReply)}
                    className={cx(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      autoReply.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                        : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
                    )}
                  >
                    {autoReply.isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => openEditModal(autoReply)}
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(autoReply)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={editingReply ? "Edit Auto-Reply" : "Create Auto-Reply"}
        size="md"
      >
        <div className="space-y-4">
          <FormGroup
            label="Keyword"
            description="The keyword that triggers this auto-reply"
            required
          >
            <InputField
              type="text"
              label=""
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value.toUpperCase())}
              placeholder="STOP, HELP, INFO"
              maxLength={20}
              className="mb-0"
            />
          </FormGroup>

          <FormGroup
            label="Response Message"
            description="The message sent when this keyword is received"
            required
          >
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter your auto-reply message..."
              rows={4}
              maxLength={160}
              className={cx(
                "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400",
                "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
                "resize-none"
              )}
            />
          </FormGroup>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {newMessage.length}/160 characters
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editingReply ? handleEdit : handleCreate}
              disabled={!newKeyword.trim() || !newMessage.trim() || isSaving}
              loading={isSaving}
              loadingText={editingReply ? "Updating..." : "Creating..."}
              className="flex-1"
            >
              {editingReply ? "Update" : "Create"} Auto-Reply
            </Button>
          </div>
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
    </div>
  );
};

export default AutoReplyManager;
