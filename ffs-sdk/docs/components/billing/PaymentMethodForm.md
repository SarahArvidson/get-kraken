# PaymentMethodForm Component

## Overview

The `PaymentMethodForm` component provides a secure form for adding or updating payment methods. It includes comprehensive validation, error handling, and success feedback for payment method management.

## Features

- **Dual Mode**: Supports both adding new and updating existing payment methods
- **Form Validation**: Client-side validation for card number, expiration, CVC, and cardholder name
- **Error Handling**: Displays field-level and form-level error messages
- **Success Feedback**: Toast notifications for successful operations
- **Loading States**: Visual feedback during form submission
- **Current Method Display**: Shows existing payment method details when updating

## Location

```
components/billing/PaymentMethodForm.tsx
```

## Props

| Prop                    | Type                                                  | Default     | Description                                       |
| ----------------------- | ----------------------------------------------------- | ----------- | ------------------------------------------------- |
| `onAddPaymentMethod`    | `(cardDetails: CardDetails) => void \| Promise<void>` | `undefined` | Callback when adding a new payment method         |
| `onUpdatePaymentMethod` | `(cardDetails: CardDetails) => void \| Promise<void>` | `undefined` | Callback when updating an existing payment method |
| `currentPaymentMethod`  | `PaymentMethod \| null`                               | `undefined` | Current payment method details (for update mode)  |
| `className`             | `string`                                              | `undefined` | Custom CSS classes for the container              |

## Type Definitions

```typescript
interface CardDetails {
  cardNumber: string; // 16-digit card number
  expDate: string; // MM/YY format
  cvc: string; // 3-4 digit CVC
  cardName: string; // Cardholder name
}

interface PaymentMethod {
  brand: string; // e.g., "Visa", "Mastercard"
  last4: string; // e.g., "4242"
  expMonth: number; // e.g., 12
  expYear: number; // e.g., 2025
}
```

## Usage Examples

### Adding New Payment Method

```tsx
import { PaymentMethodForm } from "@ffx/components/billing";

function PaymentPage() {
  const handleAddPaymentMethod = async (cardDetails) => {
    console.log("Adding payment method:", cardDetails);
    // API call to add payment method
  };

  return (
    <div className="max-w-md">
      <PaymentMethodForm onAddPaymentMethod={handleAddPaymentMethod} />
    </div>
  );
}
```

### Updating Existing Payment Method

```tsx
import { PaymentMethodForm } from "@ffx/components/billing";

function PaymentPage() {
  const currentPaymentMethod = {
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2025,
  };

  const handleUpdatePaymentMethod = async (cardDetails) => {
    console.log("Updating payment method:", cardDetails);
    // API call to update payment method
  };

  return (
    <div className="max-w-md">
      <PaymentMethodForm
        currentPaymentMethod={currentPaymentMethod}
        onUpdatePaymentMethod={handleUpdatePaymentMethod}
      />
    </div>
  );
}
```

### With Custom Styling

```tsx
import { PaymentMethodForm } from "@ffx/components/billing";

function PaymentPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PaymentMethodForm className="shadow-lg" />
      <div>Other content</div>
    </div>
  );
}
```

## Form Fields

### Card Number

- **Type**: Text input with numeric pattern
- **Validation**: 16-digit format (spaces allowed)
- **Placeholder**: "XXXX XXXX XXXX XXXX"
- **Max Length**: 19 characters (including spaces)

### Expiration Date

- **Type**: Text input
- **Validation**: MM/YY format
- **Placeholder**: "MM/YY"
- **Max Length**: 5 characters

### CVC

- **Type**: Text input
- **Validation**: 3-4 digit number
- **Placeholder**: "XXX"
- **Max Length**: 4 characters

### Cardholder Name

- **Type**: Text input
- **Validation**: Required, non-empty string
- **Placeholder**: "Name on card"

## Validation Rules

### Client-Side Validation

```typescript
// Card Number: 16 digits (spaces allowed)
/^\d{16}$/

// Expiration Date: MM/YY format
/^(0[1-9]|1[0-2])\/\d{2}$/

// CVC: 3-4 digits
/^\d{3,4}$/

// Cardholder Name: Non-empty string
cardName.trim() !== ""
```

### Error Messages

- **Card Number**: "Invalid card number"
- **Expiration Date**: "Invalid expiration date (MM/YY)"
- **CVC**: "Invalid CVC"
- **Cardholder Name**: "Cardholder name is required"

## States

### Form States

- **Empty**: All fields empty, ready for input
- **Filling**: User entering data, validation on blur
- **Valid**: All fields valid, submit button enabled
- **Invalid**: Validation errors present, submit disabled
- **Submitting**: Loading state during API call
- **Success**: Form cleared, success toast shown
- **Error**: Error toast shown, form remains filled

### Loading States

- **Submit Button**: Shows spinner and loading text
- **Form Fields**: Disabled during submission
- **Toast**: Success/error feedback

## Accessibility

- **Form Labels**: All fields have proper labels
- **Error Messages**: Linked via `aria-describedby`
- **Required Fields**: Marked with asterisk and `aria-label="required"`
- **Loading States**: Submit button shows loading state
- **Screen Reader Support**: All text and states are accessible

## Styling

### Base Styles

- White background (`bg-white dark:bg-gray-800`)
- Rounded corners (`rounded-lg`)
- Drop shadow (`shadow`)
- Padding (`p-6`)

### Form Layout

- **Grid Layout**: Card number full width, expiration and CVC in 2-column grid
- **Spacing**: Consistent spacing between form groups
- **Typography**: Clear hierarchy with proper contrast

### Dark Mode

- Full dark mode support
- Appropriate color variants for all elements
- Maintains readability in both themes

## Integration

### With Other Billing Components

```tsx
import {
  PaymentMethodForm,
  BillingSummary,
  InvoiceList,
} from "@ffx/components/billing";

function BillingDashboard() {
  return (
    <div className="space-y-8">
      <BillingSummary />
      <PaymentMethodForm />
      <InvoiceList />
    </div>
  );
}
```

### With Form Libraries

```tsx
import { PaymentMethodForm } from "@ffx/components/billing";
import { useForm } from "react-hook-form";

function PaymentPage() {
  // The component handles its own form state
  // No need for external form libraries
  return <PaymentMethodForm />;
}
```

## Best Practices

### 1. **Security Considerations**

- Never store sensitive card data in component state
- Use secure payment processors (Stripe, Square, etc.)
- Implement server-side validation
- Use HTTPS for all payment-related requests

### 2. **User Experience**

- Provide clear validation feedback
- Use appropriate input types and patterns
- Show loading states during submission
- Clear form after successful submission

### 3. **Error Handling**

- Display both field-level and form-level errors
- Provide actionable error messages
- Handle network errors gracefully
- Allow retry after failed submissions

### 4. **Accessibility**

- Ensure proper form labeling
- Provide keyboard navigation
- Support screen readers
- Use appropriate ARIA attributes

## Future Enhancements

### Planned Features

- **Card Type Detection**: Auto-detect Visa, Mastercard, etc.
- **Auto-formatting**: Format card number with spaces
- **Saved Cards**: Display previously saved payment methods
- **Multiple Methods**: Support for multiple payment methods

### Potential Improvements

- **International Cards**: Support for international card formats
- **Address Validation**: Billing address collection
- **3D Secure**: Integration with 3D Secure authentication
- **Mobile Optimization**: Better mobile input experience

## Performance

- **Bundle Size**: ~3KB minified + gzipped
- **Dependencies**: Uses `@ffx/components/ui` components
- **Validation**: Client-side validation for immediate feedback
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
