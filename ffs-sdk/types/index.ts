/**
 * Flying Fox Solutions - Types Barrel Export
 *
 * Centralized export for all shared types and interfaces.
 * This provides a single import point for all type definitions.
 */

// ============================================================================
// UI Component Types
// ============================================================================

export type {
  InputFieldProps,
  TInputFieldProps,
} from "../components/ui/InputField";

export type { ButtonProps, TButtonProps } from "../components/ui/Button";

export type { ModalProps, TModalProps } from "../components/ui/Modal";

export type { SpinnerProps, TSpinnerProps } from "../components/ui/Spinner";

export type {
  FormGroupProps,
  TFormGroupProps,
} from "../components/ui/FormGroup";

export type { ToastProps, TToastProps } from "../components/ui/Toast";

// ============================================================================
// Auth Component Types
// ============================================================================

export type {
  HandleLogin,
  TLoginFormProps as LoginFormProps,
} from "../components/auth/LoginForm";

export type {
  HandleSignUp,
  TSignUpFormProps as SignUpFormProps,
} from "../components/auth/SignUpForm";

export type {
  HandlePasswordReset,
  TPasswordResetFormProps as PasswordResetFormProps,
} from "../components/auth/PasswordResetForm";

// ============================================================================
// Blueprint Types
// ============================================================================

// Messaging Types
export type {
  Message,
  Contact,
  Campaign,
  MessageSegment,
  MessagingSlickTextConfig,
  SlickTextResponse,
  MessagingSendMessageRequest,
  SubscribeContactRequest,
  AutoReply,
  MessageComposerProps,
  ContactListUploaderProps,
  MessagePreviewModalProps,
  MessageHistoryProps,
  AutoReplyManagerProps,
  MessagingDashboardProps,
} from "../components/blueprints/messaging/types";

// POS Types
export type {
  Product,
  CartItem,
  Order,
  PaymentMethod,
  POSDashboardProps,
  ProductListProps,
  CartProps,
  CheckoutSummaryProps,
  PaymentButtonProps,
  UseCartReturn,
  UseProductsReturn,
  UseOrdersReturn,
} from "../components/blueprints/pos/types";

// Billing Types
export type {
  BillingSummaryProps,
  PaymentMethodFormProps,
  PlanSelectorProps,
  InvoiceListProps,
  SubscriptionStatusBannerProps,
  BillingDashboardProps,
} from "../components/billing";

// Auth Blueprint Types
export type { AuthPanelProps } from "../components/blueprints/auth/AuthPanel";

// Billing Blueprint Types
export type { CheckoutPanelProps } from "../components/blueprints/billing/CheckoutPanel";

// Consulting Site Types
export type {
  NavigationItem as ConsultingNavigationItem,
  NavigationConfig,
  User,
  UserPreferences,
  DashboardStats,
  ActivityItem,
  LayoutProps,
  SidebarProps,
  HeaderProps,
  PageProps,
  HomePageProps,
  AboutPageProps,
  ContactPageProps,
  ContactFormData,
  SettingsFormData,
  ConsultingSiteConfig,
  ConsultingSiteProps,
  ProtectedRouteProps,
  ApiResponse,
  PaginatedResponse,
} from "../components/blueprints/consulting-site/types";
