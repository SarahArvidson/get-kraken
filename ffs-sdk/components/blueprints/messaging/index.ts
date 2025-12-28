// ✅ Messaging Blueprint Components
export { default as MessageComposer } from "./MessageComposer";
export { default as ContactListUploader } from "./ContactListUploader";
export { default as MessagePreviewModal } from "./MessagePreviewModal";
export { default as MessageHistory } from "./MessageHistory";
export { default as AutoReplyManager } from "./AutoReplyManager";

// Heavy components - use lazy loading
export { LazyMessagingDashboardWithSuspense as MessagingDashboard } from "../../ui/LazyComponents";

// ✅ Types
export type {
  Message,
  Contact,
  Campaign,
  MessageSegment,
  MessagingSlickTextConfig,
  MessageComposerProps,
  ContactListUploaderProps,
  MessagePreviewModalProps,
  MessageHistoryProps,
  AutoReplyManagerProps,
  MessagingDashboardProps,
} from "./types";
