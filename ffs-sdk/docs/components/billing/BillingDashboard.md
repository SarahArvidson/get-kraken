# BillingDashboard Component

## Overview

The `BillingDashboard` component is a comprehensive billing management interface that combines all billing components into a single cohesive view. It provides navigation between different billing sections and manages the overall billing experience.

## Features

- **Section Navigation**: Tab-based navigation between Overview, Plans, Payment, and Invoices
- **Component Integration**: Combines all billing components in organized sections
- **Status Banner**: Shows subscription status with contextual actions
- **Toast Notifications**: Success and error feedback for all actions
- **Responsive Layout**: Mobile-friendly design with proper spacing
- **Action Management**: Centralized handling of all billing actions

## Location

```
components/billing/BillingDashboard.tsx
```

## Props

| Prop                    | Type                                                  | Default                         | Description                                 |
| ----------------------- | ----------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| `plans`                 | `SubscriptionPlan[]`                                  | **Required**                    | Available subscription plans                |
| `onSelectPlan`          | `(planId: string) => void \| Promise<void>`           | `undefined`                     | Callback when plan is selected              |
| `onAddPaymentMethod`    | `(cardDetails: CardDetails) => void \| Promise<void>` | `undefined`                     | Callback when payment method is added       |
| `onUpdatePaymentMethod` | `(cardDetails: CardDetails) => void \| Promise<void>` | `undefined`                     | Callback when payment method is updated     |
| `onUpgrade`             | `() => void`                                          | `undefined`                     | Callback when subscription is upgraded      |
| `onRenew`               | `() => void`                                          | `undefined`                     | Callback when subscription is renewed       |
| `onReactivate`          | `() => void`                                          | `undefined`                     | Callback when subscription is reactivated   |
| `onDownloadInvoice`     | `(invoiceId: string) => void`                         | `undefined`                     | Callback when invoice is downloaded         |
| `onCancelSubscription`  | `() => void`                                          | `undefined`                     | Callback when subscription is cancelled     |
| `className`             | `string`                                              | `undefined`                     | Custom CSS classes for the container        |
| `title`                 | `string`                                              | `"Billing Dashboard"`           | Dashboard title                             |
| `subtitle`              | `string`                                              | `"Manage your subscription..."` | Dashboard subtitle                          |
| `showPlanSelector`      | `boolean`                                             | `true`                          | Whether to show the plan selector section   |
| `showPaymentMethod`     | `boolean`                                             | `true`                          | Whether to show the payment method section  |
| `showInvoiceHistory`    | `boolean`                                             | `true`                          | Whether to show the invoice history section |

## Type Definitions

```typescript
interface CardDetails {
  cardNumber: string; // 16-digit card number
  expDate: string; // MM/YY format
  cvc: string; // 3-4 digit CVC
  cardName: string; // Cardholder name
}

interface SubscriptionPlan {
  id: string; // Unique plan identifier
  name: string; // Plan display name
  price: number; // Plan price (decimal)
  description: string; // Plan description
  billingCycle?: "monthly" | "yearly" | "one-time";
  features?: string[]; // Array of plan features
  popular?: boolean; // Whether this is a popular plan
  className?: string; // Custom CSS classes
}
```

## Usage Examples

### Basic Usage

```tsx
import { BillingDashboard } from "@ffx/components/billing";

function BillingPage() {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: 0,
      description: "Perfect for individuals",
      billingCycle: "monthly",
      features: ["Up to 3 projects", "Community support"],
    },
    {
      id: "professional",
      name: "Professional",
      price: 19.99,
      description: "Ideal for professionals",
      billingCycle: "monthly",
      features: ["Unlimited projects", "Priority support"],
      popular: true,
    },
  ];

  return (
    <BillingDashboard
      plans={plans}
      onSelectPlan={(planId) => console.log("Plan selected:", planId)}
      onAddPaymentMethod={(details) =>
        console.log("Adding payment method:", details)
      }
    />
  );
}
```

### With All Callbacks

```tsx
import { BillingDashboard } from "@ffx/components/billing";

function BillingPage() {
  const plans = [
    /* plan data */
  ];

  const handleSelectPlan = async (planId: string) => {
    // API call to update plan
    await fetch(`/api/plans/${planId}`, { method: "PUT" });
  };

  const handleAddPaymentMethod = async (cardDetails: any) => {
    // API call to add payment method
    await fetch("/api/payment-methods", {
      method: "POST",
      body: JSON.stringify(cardDetails),
    });
  };

  const handleUpdatePaymentMethod = async (cardDetails: any) => {
    // API call to update payment method
    await fetch("/api/payment-methods", {
      method: "PUT",
      body: JSON.stringify(cardDetails),
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Download invoice
    window.open(`/api/invoices/${invoiceId}/download`);
  };

  const handleUpgrade = () => {
    // Redirect to upgrade page
    window.location.href = "/upgrade";
  };

  const handleRenew = () => {
    // Process renewal
    fetch("/api/subscription/renew", { method: "POST" });
  };

  const handleReactivate = () => {
    // Reactivate subscription
    fetch("/api/subscription/reactivate", { method: "POST" });
  };

  const handleCancelSubscription = () => {
    // Cancel subscription
    fetch("/api/subscription/cancel", { method: "POST" });
  };

  return (
    <BillingDashboard
      plans={plans}
      onSelectPlan={handleSelectPlan}
      onAddPaymentMethod={handleAddPaymentMethod}
      onUpdatePaymentMethod={handleUpdatePaymentMethod}
      onDownloadInvoice={handleDownloadInvoice}
      onUpgrade={handleUpgrade}
      onRenew={handleRenew}
      onReactivate={handleReactivate}
      onCancelSubscription={handleCancelSubscription}
    />
  );
}
```

### Custom Configuration

```tsx
import { BillingDashboard } from "@ffx/components/billing";

function BillingPage() {
  return (
    <BillingDashboard
      plans={plans}
      title="Account Billing"
      subtitle="Manage your subscription and payment methods"
      showPlanSelector={true}
      showPaymentMethod={false} // Hide payment method section
      showInvoiceHistory={true}
      className="custom-dashboard"
    />
  );
}
```

## Navigation Sections

### Overview Section

- **BillingSummary**: Current plan and billing information
- **InvoiceList**: Recent invoice history
- **Layout**: Two-column grid on desktop

### Plans Section

- **PlanSelector**: Available subscription plans
- **Features**: Plan comparison and selection
- **Actions**: Plan upgrade/downgrade functionality

### Payment Section

- **PaymentMethodForm**: Add/update payment methods
- **Features**: Card management and validation
- **Actions**: Payment method management

### Invoices Section

- **InvoiceList**: Complete invoice history
- **Features**: Download and view invoices
- **Actions**: Invoice management

## Toast Notifications

The dashboard includes a toast notification system for user feedback:

### Success Toasts

- "Plan updated successfully!"
- "Payment method added successfully!"
- "Payment method updated successfully!"

### Error Toasts

- "Failed to update plan. Please try again."
- "Failed to add payment method. Please try again."
- "Failed to update payment method. Please try again."

### Info Toasts

- "Redirecting to upgrade page..."
- "Processing subscription renewal..."
- "Reactivating subscription..."
- "Downloading invoice..."

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Title + Subtitle)                                   │
├─────────────────────────────────────────────────────────────┤
│ Status Banner (if applicable)                               │
├─────────────────────────────────────────────────────────────┤
│ Navigation Tabs                                             │
│ [Overview] [Plans] [Payment] [Invoices]                    │
├─────────────────────────────────────────────────────────────┤
│ Content Section (changes based on active tab)              │
│                                                             │
│ Overview: [BillingSummary] [InvoiceList]                   │
│ Plans:    [PlanSelector]                                   │
│ Payment:  [PaymentMethodForm]                              │
│ Invoices: [InvoiceList]                                    │
├─────────────────────────────────────────────────────────────┤
│ Footer Actions (if applicable)                             │
│ [Cancel Subscription]                                       │
└─────────────────────────────────────────────────────────────┘
```

## States

### Loading States

- Individual components handle their own loading states
- No global loading state for the dashboard
- Smooth transitions between sections

### Error States

- Components display their own error states
- Toast notifications for action errors
- Graceful error handling throughout

### Success States

- Toast notifications for successful actions
- Visual feedback for completed operations
- Smooth user experience

## Accessibility

- **Navigation**: Keyboard-accessible tab navigation
- **Screen Reader Support**: Proper heading structure and labels
- **Focus Management**: Clear focus indicators and logical tab order
- **ARIA Labels**: Proper labeling for all interactive elements
- **Color Contrast**: Meets WCAG guidelines for all text and backgrounds

## Styling

### Base Layout

- **Container**: Max width with responsive padding
- **Background**: Light gray background with dark mode support
- **Spacing**: Consistent spacing between sections

### Navigation

- **Tabs**: Clean tab design with hover and active states
- **Icons**: Emoji icons for visual appeal
- **Responsive**: Mobile-friendly navigation

### Content Sections

- **Grid Layout**: Responsive grid for overview section
- **Cards**: Consistent card styling across components
- **Typography**: Clear hierarchy with proper contrast

## Integration

### With Custom Billing Data

```tsx
import { BillingDashboard } from "@ffx/components/billing";

function BillingPage() {
  // The dashboard automatically uses useBillingData and useInvoices hooks
  // No additional data setup required
  return <BillingDashboard plans={plans} />;
}
```

### With External State Management

```tsx
import { BillingDashboard } from "@ffx/components/billing";
import { useBillingStore } from "./store/billing";

function BillingPage() {
  const { plans, updatePlan } = useBillingStore();

  return <BillingDashboard plans={plans} onSelectPlan={updatePlan} />;
}
```

## Best Practices

### 1. **Data Management**

- Provide comprehensive plan data
- Implement proper error handling for all callbacks
- Use async/await for API calls
- Handle loading and error states gracefully

### 2. **User Experience**

- Provide clear feedback for all actions
- Use toast notifications for user feedback
- Implement proper loading states
- Handle edge cases gracefully

### 3. **Performance**

- Lazy load components when possible
- Optimize re-renders with proper state management
- Use efficient event handlers
- Minimize bundle size

### 4. **Accessibility**

- Ensure keyboard navigation works
- Provide clear visual feedback
- Use appropriate color contrast
- Test with screen readers

## Future Enhancements

### Planned Features

- **Custom Sections**: Add custom dashboard sections
- **Widget System**: Draggable dashboard widgets
- **Analytics**: Usage analytics and insights
- **Notifications**: Real-time billing notifications

### Potential Improvements

- **Offline Support**: Cache billing data for offline viewing
- **Export Options**: Export billing data to various formats
- **Integration**: Connect with external billing systems
- **Automation**: Automated billing workflows

## Performance

- **Bundle Size**: ~5KB minified + gzipped
- **Dependencies**: Uses all billing components
- **Rendering**: Efficient section-based rendering
- **Memory**: Minimal memory footprint

## Configuration Requirements

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ffx/*": ["./*"]
    }
  }
}
```

### Vite Configuration

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ffx": resolve(__dirname, "."),
    },
  },
});
```
