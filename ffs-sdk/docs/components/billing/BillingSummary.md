# BillingSummary Component

## Overview

The `BillingSummary` component displays the user's current billing information in a clean, organized card layout. It shows the current plan, next billing date, amount due, and payment method details.

## Features

- **Current Plan Display**: Shows the active subscription plan name
- **Billing Information**: Displays next billing date and amount due
- **Payment Method**: Shows current payment method details (brand, last 4 digits, expiration)
- **Loading State**: Displays spinner while fetching data
- **Error Handling**: Shows error message if data fetch fails
- **Empty State**: Handles case when no billing data is available

## Location

```
components/billing/BillingSummary.tsx
```

## Props

| Prop        | Type     | Default     | Description                          |
| ----------- | -------- | ----------- | ------------------------------------ |
| `className` | `string` | `undefined` | Custom CSS classes for the container |

## Usage Examples

### Basic Usage

```tsx
import { BillingSummary } from "@ffx/components/billing";

function BillingPage() {
  return (
    <div className="max-w-md">
      <BillingSummary />
    </div>
  );
}
```

### With Custom Styling

```tsx
import { BillingSummary } from "@ffx/components/billing";

function BillingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BillingSummary className="shadow-lg" />
      <div>Other content</div>
    </div>
  );
}
```

## Data Structure

The component uses the `useBillingData` hook which returns:

```typescript
interface BillingData {
  currentPlan: string; // e.g., "Professional"
  nextBillingDate: string; // e.g., "2024-07-20"
  amountDue: number; // e.g., 19.99
  currency: string; // e.g., "$"
  paymentMethod: {
    // Can be null
    brand: string; // e.g., "Visa"
    last4: string; // e.g., "4242"
    expMonth: number; // e.g., 12
    expYear: number; // e.g., 2025
  } | null;
}
```

## States

### Loading State

- Shows spinner with "Loading billing summary..." text
- Uses `Spinner` component with medium size and primary color

### Error State

- Red background with error message
- Displays "Error: {error message} Please try again later."

### Empty State

- Gray background with "No billing data available." message

### Success State

- White background with organized billing information
- Green accent color for plan name
- Clean typography hierarchy

## Accessibility

- **Semantic HTML**: Uses proper heading structure (`h3`)
- **Screen Reader Support**: All text is accessible to screen readers
- **Loading State**: Spinner includes `aria-label="Loading billing summary"`
- **Error State**: Error messages are clearly announced
- **Color Contrast**: Meets WCAG guidelines for text contrast

## Styling

### Base Styles

- White background (`bg-white dark:bg-gray-800`)
- Rounded corners (`rounded-lg`)
- Drop shadow (`shadow`)
- Padding (`p-6`)

### Typography

- **Title**: `text-lg font-semibold text-gray-900 dark:text-gray-100`
- **Labels**: `text-gray-600 dark:text-gray-400`
- **Values**: `font-medium text-gray-900 dark:text-gray-100`
- **Plan Name**: `font-medium text-indigo-600 dark:text-indigo-400`

### Dark Mode

- Full dark mode support with appropriate color variants
- Automatic theme switching based on system preference

## Integration

### With Other Billing Components

```tsx
import {
  BillingSummary,
  PaymentMethodForm,
  PlanSelector,
} from "@ffx/components/billing";

function BillingDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BillingSummary />
      <PaymentMethodForm />
    </div>
  );
}
```

### Custom Data Hook

```tsx
import { BillingSummary } from "@ffx/components/billing";

function CustomBillingSummary() {
  // The component automatically uses useBillingData hook
  // No additional setup required
  return <BillingSummary />;
}
```

## Best Practices

### 1. **Layout Considerations**

- Use in sidebar or main content area
- Consider responsive grid layouts
- Allow sufficient spacing around the component

### 2. **Error Handling**

- The component handles its own loading and error states
- No need for external error boundaries
- Errors are displayed inline with clear messaging

### 3. **Data Management**

- Component automatically fetches data on mount
- No need for external data management
- Uses mock data for demonstration purposes

### 4. **Styling**

- Use consistent spacing with other billing components
- Consider using shadow for visual separation
- Maintain consistent typography hierarchy

## Future Enhancements

### Planned Features

- **Currency Formatting**: Better currency display with locale support
- **Payment Method Icons**: Show card brand icons
- **Billing History Link**: Quick access to invoice history
- **Plan Change CTA**: Direct link to plan selection

### Potential Improvements

- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Cache billing data for offline viewing
- **Export Options**: PDF export of billing summary
- **Notifications**: Alerts for upcoming billing dates

## Performance

- **Bundle Size**: ~2KB minified + gzipped
- **Dependencies**: Only uses `@ffx/components/ui` components
- **Rendering**: Single render cycle for data display
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
