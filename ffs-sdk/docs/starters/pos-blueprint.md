# POS Blueprint Starter

A comprehensive Point of Sale (POS) system blueprint built with reusable atomic components. This blueprint demonstrates how to compose atomic UI components into a real-world business application while maintaining integration-agnostic design for future payment provider connections.

## 🎯 Overview

The POS Blueprint Starter provides a complete point-of-sale experience including:

- Product catalog browsing and search
- Shopping cart management with quantity controls
- Customer information collection
- Order summary and checkout flow
- Payment method selection (placeholder for future integration)
- Order history and management

## 🏗️ Architecture

### Component Hierarchy

```
POSDashboard (Main Blueprint)
├── ProductList
│   └── ProductCard
├── Cart
│   └── CartItemRow
├── CheckoutSummary
└── PaymentButton
    └── PaymentMethodOption
```

### State Management

- **useCart**: Manages cart items, quantities, totals, and discounts
- **useProducts**: Handles product catalog, search, and filtering
- **useOrders**: Manages order history and processing

## 📦 Components

### POSDashboard

Main dashboard component that orchestrates the entire POS experience.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `products` | `Product[]` | ✅ | Initial product catalog |
| `onProductUpdate` | `(product: Product) => void` | ❌ | Called when product is updated |
| `onOrderComplete` | `(order: Order) => void` | ❌ | Called when order is completed |
| `onPaymentProcess` | `(order: Order, paymentMethod: PaymentMethod) => Promise<void>` | ❌ | Payment processing handler |
| `className` | `string` | ❌ | Additional CSS classes |

**Usage:**

```tsx
import { POSDashboard } from "@ffx/components/blueprints/pos";

function MyPOSApp() {
  const handleOrderComplete = (order: Order) => {
    console.log("Order completed:", order);
    // Send to backend, print receipt, etc.
  };

  const handlePaymentProcess = async (
    order: Order,
    paymentMethod: PaymentMethod
  ) => {
    // Integration with Square, Stripe, etc.
    console.log("Processing payment:", { order, paymentMethod });
  };

  return (
    <POSDashboard
      products={myProducts}
      onOrderComplete={handleOrderComplete}
      onPaymentProcess={handlePaymentProcess}
    />
  );
}
```

### ProductList

Displays available products with search, filtering, and add-to-cart functionality.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `products` | `Product[]` | ✅ | Array of products to display |
| `onAddToCart` | `(product: Product, quantity?: number) => void` | ✅ | Called when product is added to cart |
| `onViewProduct` | `(product: Product) => void` | ❌ | Called when product is viewed |
| `loading` | `boolean` | ❌ | Loading state |
| `error` | `string` | ❌ | Error message to display |
| `className` | `string` | ❌ | Additional CSS classes |

**Features:**

- Product search by name, description, category, or tags
- Category filtering with dynamic buttons
- Quantity selection before adding to cart
- Stock status indicators
- Responsive grid layout

### Cart

Shopping cart component with quantity controls and discount code support.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `cart` | `Cart` | ✅ | Cart state object |
| `onUpdateQuantity` | `(productId: string, quantity: number) => void` | ✅ | Called when item quantity changes |
| `onRemoveItem` | `(productId: string) => void` | ✅ | Called when item is removed |
| `onClearCart` | `() => void` | ✅ | Called when cart is cleared |
| `onApplyDiscount` | `(code: string) => boolean` | ❌ | Called when discount code is applied |
| `loading` | `boolean` | ❌ | Loading state |
| `className` | `string` | ❌ | Additional CSS classes |

**Features:**

- Real-time total calculations
- Quantity increment/decrement controls
- Discount code application
- Item removal with confirmation
- Empty cart state

### CheckoutSummary

Order summary component with customer information collection.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `cart` | `Cart` | ✅ | Cart state object |
| `onCheckout` | `() => void` | ✅ | Called when checkout is initiated |
| `onCancel` | `() => void` | ❌ | Called when checkout is cancelled |
| `loading` | `boolean` | ❌ | Loading state |
| `customerInfo` | `CustomerInfo` | ❌ | Customer information |
| `onCustomerInfoChange` | `(info: CustomerInfo) => void` | ❌ | Called when customer info changes |
| `className` | `string` | ❌ | Additional CSS classes |

**Features:**

- Order items summary
- Customer information modal
- Pricing breakdown with discounts and tax
- Validation for required fields

### PaymentButton

Payment processing component with method selection.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | `number` | ✅ | Payment amount |
| `onPayment` | `(paymentMethod: PaymentMethod) => Promise<void>` | ✅ | Payment processing handler |
| `loading` | `boolean` | ❌ | Loading state |
| `disabled` | `boolean` | ❌ | Disabled state |
| `className` | `string` | ❌ | Additional CSS classes |

**Features:**

- Multiple payment method support (cash, card, digital wallet, check)
- Payment method selection modal
- Loading states during processing
- Integration placeholders for real payment providers

## 🎣 Custom Hooks

### useCart

Manages shopping cart state and operations.

**Returns:**

```typescript
{
  cart: Cart;                    // Current cart state
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  isEmpty: boolean;              // Whether cart is empty
  itemCount: number;            // Total number of items
}
```

### useProducts

Manages product catalog and operations.

**Returns:**

```typescript
{
  products: Product[];           // All products
  loading: boolean;             // Loading state
  error: string | null;         // Error message
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  searchProducts: (query: string) => Product[];
  filterByCategory: (category: string) => Product[];
  categories: string[];         // Available categories
  availableProducts: Product[]; // Products in stock
  lowStockProducts: Product[];  // Products with low stock
}
```

### useOrders

Manages order history and processing.

**Returns:**

```typescript
{
  orders: Order[];              // All orders
  loading: boolean;             // Loading state
  error: string | null;         // Error message
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByDate: (date: Date) => Order[];
  getOrdersByStatus: (status: Order['status']) => Order[];
  todaysOrders: Order[];        // Orders from today
  todaysTotal: number;          // Total sales for today
  todaysOrderCount: number;     // Number of orders today
  averageOrderValue: number;    // Average order value
  topSellingProducts: Array<{   // Top 5 selling products
    product: Product;
    quantity: number;
    revenue: number;
  }>;
}
```

## 🔧 Integration Points

### Payment Provider Integration

The blueprint is designed for easy integration with payment providers:

```typescript
// Example Square integration
import { paymentsApi } from "@square/web-sdk";

const handlePaymentProcess = async (
  order: Order,
  paymentMethod: PaymentMethod
) => {
  try {
    const request = {
      sourceId: paymentMethod.id,
      amountMoney: {
        amount: Math.round(order.total * 100), // Convert to cents
        currency: "USD",
      },
      orderId: order.id,
      referenceId: order.id,
    };

    const { result } = await paymentsApi.createPayment(request);

    if (result.payment?.status === "COMPLETED") {
      // Update order status
      console.log("Payment successful:", result.payment);
    }
  } catch (error) {
    console.error("Payment failed:", error);
    throw error;
  }
};
```

### Backend API Integration

Connect to your backend for data persistence:

```typescript
// Example API integration
const handleOrderComplete = async (order: Order) => {
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    // Print receipt, send confirmation email, etc.
  } catch (error) {
    console.error("Failed to save order:", error);
  }
};
```

## 🎨 Styling & Theming

The POS blueprint uses Tailwind CSS with dark mode support. All components follow the established design system:

- **Colors**: Primary blue, secondary gray, success green, error red
- **Spacing**: Consistent 4px grid system
- **Typography**: Clear hierarchy with proper contrast
- **Components**: Rounded corners, subtle shadows, hover states

## 📱 Responsive Design

The blueprint is fully responsive:

- **Mobile**: Single column layout with stacked components
- **Tablet**: Two-column layout with sidebar cart
- **Desktop**: Three-column layout with full product grid

## ♿ Accessibility

All components include proper accessibility features:

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## 🧪 Testing

The blueprint includes comprehensive TypeScript types for type safety. For testing:

```typescript
// Example test setup
import { render, screen } from "@testing-library/react";
import { POSDashboard } from "@ffx/components/blueprints/pos";

test("renders POS dashboard", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Coffee",
      price: 3.5,
      category: "Beverage",
      isAvailable: true,
    },
  ];

  render(<POSDashboard products={mockProducts} />);

  expect(screen.getByText("Point of Sale System")).toBeInTheDocument();
  expect(screen.getByText("Coffee")).toBeInTheDocument();
});
```

## 🚀 Getting Started

1. **Install Dependencies**: Ensure all atomic components are available
2. **Import Components**: Use the barrel export for clean imports
3. **Provide Data**: Pass your product catalog to the dashboard
4. **Handle Events**: Implement order completion and payment processing
5. **Customize Styling**: Override classes as needed for your brand

## 🔮 Future Enhancements

The blueprint is designed for easy extension:

- **Inventory Management**: Real-time stock updates
- **Customer Profiles**: Save and retrieve customer information
- **Receipt Printing**: Thermal printer integration
- **Multi-location Support**: Store-specific configurations
- **Analytics Dashboard**: Sales reporting and insights
- **Offline Mode**: PWA capabilities for offline operation

## 📋 Example Usage

```tsx
import React from "react";
import { POSDashboard } from "@ffx/components/blueprints/pos";

const MyCoffeeShop = () => {
  const products = [
    {
      id: "1",
      name: "Espresso",
      price: 2.5,
      category: "Coffee",
      description: "Rich, full-bodied espresso shot",
      isAvailable: true,
      stock: 100,
    },
    // ... more products
  ];

  const handleOrderComplete = (order) => {
    // Save to database, print receipt, etc.
    console.log("Order completed:", order);
  };

  const handlePaymentProcess = async (order, paymentMethod) => {
    // Integrate with your payment provider
    console.log("Processing payment:", { order, paymentMethod });
  };

  return (
    <POSDashboard
      products={products}
      onOrderComplete={handleOrderComplete}
      onPaymentProcess={handlePaymentProcess}
    />
  );
};

export default MyCoffeeShop;
```

This POS Blueprint Starter provides a solid foundation for building point-of-sale applications while maintaining flexibility for future integrations and customizations.
