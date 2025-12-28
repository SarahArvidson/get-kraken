import React, { useState, useCallback, useEffect } from "react";
import { InputField, Button, FormGroup } from "../../ui";
import { slickTextService } from "./services/slicktext";
import type {
  MessageComposerProps,
  Message,
  MessageSegment,
  Contact,
} from "./types";

/**
 * MessageComposer Component
 * ------------------------
 * SMS message composer with character counting, segment preview, and cost estimation
 */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onSaveDraft,
  onSchedule,
  initialMessage = "",
  maxCharacters = 1600, // Allow up to 10 segments
  className,
}) => {
  const [message, setMessage] = useState(initialMessage);
  const [segments, setSegments] = useState<MessageSegment[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isUnicode, setIsUnicode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [campaignName, setCampaignName] = useState("");

  // ✅ Calculate message segments when content changes
  useEffect(() => {
    if (message.trim()) {
      const result = slickTextService.calculateMessageSegments(message);

      const messageSegments: MessageSegment[] = result.segments.map(
        (segment, index) => ({
          id: `segment-${index}`,
          content: segment.content,
          characterCount: segment.characterCount,
          isUnicode: segment.isUnicode,
          estimatedCost: segment.isUnicode ? 0.015 : 0.0075,
        })
      );

      setSegments(messageSegments);
      setTotalCost(result.totalCost);
      setIsUnicode(result.segments[0]?.isUnicode || false);
    } else {
      setSegments([]);
      setTotalCost(0);
      setIsUnicode(false);
    }
  }, [message]);

  // ✅ Handle message content change
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= maxCharacters) {
        setMessage(value);
      }
    },
    [maxCharacters]
  );

  // ✅ Handle save draft
  const handleSaveDraft = useCallback(async () => {
    if (!message.trim()) return;

    setIsSaving(true);
    try {
      const draftMessage: Message = {
        id: `draft-${Date.now()}`,
        content: message,
        segments,
        recipientCount: selectedContacts.length,
        status: "draft",
        createdAt: new Date().toISOString(),
        cost: totalCost,
        currency: "USD",
      };

      await onSaveDraft?.(draftMessage);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  }, [message, segments, selectedContacts.length, totalCost, onSaveDraft]);

  // ✅ Handle send message
  const handleSend = useCallback(async () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    setIsSending(true);
    try {
      const messageToSend: Message = {
        id: `msg-${Date.now()}`,
        content: message,
        segments,
        recipientCount: selectedContacts.length,
        status: "sending",
        createdAt: new Date().toISOString(),
        cost: totalCost,
        currency: "USD",
      };

      await onSend?.(messageToSend, selectedContacts);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [message, segments, selectedContacts, totalCost, onSend]);

  // ✅ Handle schedule message
  const handleSchedule = useCallback(async () => {
    if (!message.trim() || selectedContacts.length === 0 || !scheduledAt)
      return;

    setIsSending(true);
    try {
      const messageToSchedule: Message = {
        id: `msg-${Date.now()}`,
        content: message,
        segments,
        recipientCount: selectedContacts.length,
        status: "scheduled",
        createdAt: new Date().toISOString(),
        scheduledAt,
        cost: totalCost,
        currency: "USD",
      };

      await onSchedule?.(messageToSchedule, scheduledAt, selectedContacts);
    } catch (error) {
      console.error("Failed to schedule message:", error);
    } finally {
      setIsSending(false);
    }
  }, [message, segments, selectedContacts, scheduledAt, totalCost, onSchedule]);

  // ✅ Character count display
  const getCharacterCountDisplay = () => {
    const currentCount = message.length;
    const remaining = maxCharacters - currentCount;

    if (segments.length === 0)
      return { current: currentCount, remaining, segments: 0 };

    const totalChars = segments.reduce(
      (sum, seg) => sum + seg.characterCount,
      0
    );
    return {
      current: totalChars,
      remaining: maxCharacters - totalChars,
      segments: segments.length,
    };
  };

  const {
    current,
    remaining,
    segments: segmentCount,
  } = getCharacterCountDisplay();

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Compose SMS Message
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create and send SMS messages to your contacts
        </p>
      </div>

      {/* Campaign Name */}
      <div className="mb-4">
        <FormGroup
          label="Campaign Name"
          description="Optional name for this campaign"
        >
          <InputField
            type="text"
            label=""
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="My Campaign"
            className="mb-0"
          />
        </FormGroup>
      </div>

      {/* Message Content */}
      <div className="mb-4">
        <FormGroup
          label="Message Content"
          description="Enter your SMS message content"
          required
        >
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message here..."
            rows={4}
            className={cx(
              "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400",
              "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
              "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
              "resize-none"
            )}
          />
        </FormGroup>
      </div>

      {/* Character Count & Segment Info */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span
              className={cx(
                "font-medium",
                remaining < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {current} / {maxCharacters} characters
            </span>
            {segmentCount > 0 && (
              <span className="text-gray-600 dark:text-gray-400">
                {segmentCount} segment{segmentCount > 1 ? "s" : ""}
              </span>
            )}
            {isUnicode && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                Unicode
              </span>
            )}
          </div>
          {totalCost > 0 && (
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              ${totalCost.toFixed(4)} per recipient
            </span>
          )}
        </div>
      </div>

      {/* Segment Preview */}
      {segments.length > 1 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Message Segments
          </h4>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Segment {index + 1}
                  </span>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {segment.characterCount} chars • $
                    {segment.estimatedCost.toFixed(4)}
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

      {/* Contact Selection */}
      <div className="mb-4">
        <FormGroup
          label="Recipients"
          description="Select contacts to receive this message"
          required
        >
          <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedContacts.length === 0
                ? "No contacts selected"
                : `${selectedContacts.length} contact${
                    selectedContacts.length > 1 ? "s" : ""
                  } selected`}
            </p>
            {selectedContacts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedContacts.slice(0, 5).map((contact) => (
                  <span
                    key={contact.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200"
                  >
                    {contact.firstName || contact.lastName
                      ? `${contact.firstName || ""} ${
                          contact.lastName || ""
                        }`.trim()
                      : contact.phoneNumber}
                  </span>
                ))}
                {selectedContacts.length > 5 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{selectedContacts.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </FormGroup>
      </div>

      {/* Scheduling */}
      <div className="mb-6">
        <FormGroup
          label="Schedule Message"
          description="Optional: Schedule for later delivery"
        >
          <InputField
            type="datetime-local"
            label=""
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="mb-0"
          />
        </FormGroup>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={handleSaveDraft}
          disabled={!message.trim() || isSaving}
          loading={isSaving}
          loadingText="Saving..."
        >
          Save Draft
        </Button>

        <Button
          variant="primary"
          onClick={handleSend}
          disabled={
            !message.trim() ||
            selectedContacts.length === 0 ||
            isSending ||
            remaining < 0
          }
          loading={isSending}
          loadingText="Sending..."
        >
          Send Now
        </Button>

        {scheduledAt && (
          <Button
            variant="primary"
            onClick={handleSchedule}
            disabled={
              !message.trim() ||
              selectedContacts.length === 0 ||
              isSending ||
              remaining < 0
            }
            loading={isSending}
            loadingText="Scheduling..."
            className="bg-green-600 hover:bg-green-700"
          >
            Schedule
          </Button>
        )}
      </div>

      {/* Cost Summary */}
      {selectedContacts.length > 0 && totalCost > 0 && (
        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              Total Cost Estimate:
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ${(totalCost * selectedContacts.length).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
            {selectedContacts.length} recipients × ${totalCost.toFixed(4)} per
            message
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageComposer;
