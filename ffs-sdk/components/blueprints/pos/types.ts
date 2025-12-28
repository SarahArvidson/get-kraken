/**
 * POS Blueprint Starter - Core Types
 *
 * This file defines the TypeScript interfaces and types for the Point of Sale system.
 * Integration-agnostic design allows for easy future integration with Square, Stripe, etc.
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  sku?: string;
  stock?: number;
  isAvailable?: boolean;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  discountCode?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  discountCode?: string;
  customerInfo?: CustomerInfo;
  paymentMethod?: string;
  status: "pending" | "completed" | "cancelled" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: "card" | "cash" | "check" | "digital_wallet";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  name?: string;
}

export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  description?: string;
  validUntil?: Date;
  minimumAmount?: number;
  isActive: boolean;
}

// Component Props Interfaces
export interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewProduct?: (product: Product) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface CartProps {
  cart: Cart;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onApplyDiscount?: (code: string) => boolean;
  loading?: boolean;
  className?: string;
}

export interface CheckoutSummaryProps {
  cart: Cart;
  onCheckout: () => void;
  onCancel?: () => void;
  loading?: boolean;
  customerInfo?: CustomerInfo;
  onCustomerInfoChange?: (info: CustomerInfo) => void;
  className?: string;
}

export interface PaymentButtonProps {
  amount: number;
  onPayment: (paymentMethod: PaymentMethod) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// Hook Return Types
export interface UseCartReturn {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  isEmpty: boolean;
  itemCount: number;
}

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  searchProducts: (query: string) => Product[];
  filterByCategory: (category: string) => Product[];
  categories: string[];
  availableProducts: Product[];
  lowStockProducts: Product[];
}

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByDate: (date: Date) => Order[];
  getOrdersByStatus: (status: Order["status"]) => Order[];
  todaysOrders: Order[];
  todaysTotal: number;
  todaysOrderCount: number;
  averageOrderValue: number;
  topSellingProducts: Array<{
    product: { id: string; name: string; price: number };
    quantity: number;
    revenue: number;
  }>;
}

// Configuration Types
export interface POSConfig {
  currency: string;
  taxRate: number;
  allowDiscounts: boolean;
  requireCustomerInfo: boolean;
  autoSaveCart: boolean;
  theme: "light" | "dark" | "auto";
}

// Event Types
export interface POSEvent {
  type:
    | "item_added"
    | "item_removed"
    | "quantity_changed"
    | "checkout_started"
    | "payment_processed"
    | "order_completed";
  data: Record<string, unknown>;
  timestamp: Date;
}

// Component Props
export interface POSDashboardProps {
  products?: Product[];
  onProductUpdate?: (product: Product) => void;
  onOrderComplete?: (order: Order) => void;
  onPaymentProcess?: (
    order: Order,
    paymentMethod: PaymentMethod
  ) => Promise<void>;
  onCheckout?: (orderData: Record<string, unknown>) => void;
  className?: string;
}
