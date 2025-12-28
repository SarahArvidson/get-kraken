/**
 * Flying Fox Solutions - Consulting Site Types
 *
 * Type definitions for the Consulting Site archetype.
 * This starter demonstrates how to build a complete SaaS-style web application
 * using our atomic components and blueprints.
 */

// ============================================================================
// Navigation Types
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationConfig {
  brand: {
    name: string;
    logo?: string;
    href: string;
  };
  items: NavigationItem[];
  userMenu: {
    profile: NavigationItem;
    settings: NavigationItem;
    logout: NavigationItem;
  };
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "admin" | "user" | "viewer";
  company?: string;
  lastLogin?: Date;
  isActive: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: "overview" | "analytics" | "activity";
    widgets: string[];
  };
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  orders: number;
  growth: {
    users: number;
    revenue: number;
    orders: number;
  };
}

export interface ActivityItem {
  id: string;
  type: "user_login" | "order_created" | "payment_received" | "message_sent";
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Layout Types
// ============================================================================

export interface LayoutProps {
  children: React.ReactNode;
  user?: User;
  navigation?: NavigationConfig;
  className?: string;
}

export interface SidebarProps {
  navigation: NavigationConfig;
  currentPath: string;
  isCollapsed: boolean;
  onToggle: () => void;
  user?: User;
}

export interface HeaderProps {
  user?: User;
  onMenuToggle: () => void;
  onUserMenuToggle: () => void;
  isUserMenuOpen: boolean;
}

// ============================================================================
// Page Types
// ============================================================================

export interface PageProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface AboutPageProps extends PageProps {
  team?: Array<{
    name: string;
    role: string;
    bio: string;
    avatar?: string;
  }>;
}

export interface ContactPageProps extends PageProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isLoading?: boolean;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  preferredContact: "email" | "phone";
}

export interface SettingsFormData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  preferences: UserPreferences;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

// ============================================================================
// Integration Types
// ============================================================================

export interface ConsultingSiteConfig {
  features: {
    messaging: boolean;
    billing: boolean;
    pos: boolean;
    analytics: boolean;
  };
  integrations: {
    slicktext?: {
      enabled: boolean;
      apiKey?: string;
    };
    stripe?: {
      enabled: boolean;
      publicKey?: string;
    };
    square?: {
      enabled: boolean;
      applicationId?: string;
    };
  };
  branding: {
    companyName: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ConsultingSiteProps {
  config: ConsultingSiteConfig;
  user?: User;
  onUserUpdate?: (user: User) => void;
  onConfigUpdate?: (config: ConsultingSiteConfig) => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user" | "viewer";
  fallback?: React.ReactNode;
}

export interface HomePageProps {
  title?: string;
  description?: string;
  stats?: DashboardStats;
  recentActivity?: ActivityItem[];
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface ConsultingSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "one-time";
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
