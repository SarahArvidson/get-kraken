# SubscriptionStatusBanner Component

## Overview

The `SubscriptionStatusBanner` component displays subscription status information with visual indicators and action buttons. It provides quick access to subscription management actions based on the current status.

## Features

- **Status Indicators**: Visual status display for active, trial, expired, and cancelled states
- **Action Buttons**: Contextual actions based on subscription status
- **Auto-Hide Logic**: Automatically hides for active subscriptions (unless trial)
- **Close Button**: Optional close functionality for dismissing the banner
- **Loading Integration**: Works seamlessly with billing data loading states

## Location

```
components/billing/SubscriptionStatusBanner.tsx
```

## Props

| Prop              | Type         | Default     | Description                          |
| ----------------- | ------------ | ----------- | ------------------------------------ |
| `className`       | `string`     | `undefined` | Custom CSS classes for the container |
| `showActions`     | `boolean`    | `true`      | Whether to show action buttons       |
| `onUpgrade`       | `() => void` | `undefined` | Callback when upgrade is clicked     |
| `onRenew`         | `() => void` | `undefined` | Callback when renew is clicked       |
| `onReactivate`    | `() => void` | `undefined` | Callback when reactivate is clicked  |
| `title`           | `string`     | `undefined` | Custom title for the banner          |
| `showCloseButton` | `boolean`    | `false`     | Whether to show the close button     |
| `onClose`         | `() => void` | `undefined` | Callback when close is clicked       |

## Status Types

### Active Status

- **Background**: Green with checkmark icon
- **Title**: "Subscription Active"
- **Description**: "Your subscription is active and will auto-renew."
- **Actions**: None (banner hidden by default)

### Trial Status

- **Background**: Blue with clock icon
- **Title**: "Trial Period"
- **Description**: "Your trial ends in X days. Upgrade now to continue using all features."
- **Actions**: "Upgrade Now" button + "Extend Trial" button

### Expired Status

- **Background**: Red with X icon
- **Title**: "Subscription Expired"
- **Description**: "Your subscription has expired. Renew now to restore access to all features."
- **Actions**: "Renew Subscription" button

### Cancelled Status

- **Background**: Yellow with warning icon
- **Title**: "Subscription Cancelled"
- **Description**: "Your subscription has been cancelled. Reactivate to restore access to all features."
- **Actions**: "Reactivate" button

## Usage Examples

### Basic Usage

```tsx
import { SubscriptionStatusBanner } from "@ffx/components/billing";

function BillingPage() {
  return (
    <div className="max-w-4xl">
      <SubscriptionStatusBanner />
    </div>
  );
}
```

### With Custom Actions

```tsx
import { SubscriptionStatusBanner } from "@ffx/components/billing";

function BillingPage() {
  const handleUpgrade = () => {
    console.log("Redirecting to upgrade page");
    // Redirect to upgrade flow
  };

  const handleRenew = () => {
    console.log("Processing renewal");
    // Process subscription renewal
  };

  const handleReactivate = () => {
    console.log("Reactivating subscription");
    // Reactivate cancelled subscription
  };

  return (
    <div className="max-w-4xl">
      <SubscriptionStatusBanner
        onUpgrade={handleUpgrade}
        onRenew={handleRenew}
        onReactivate={handleReactivate}
        showActions={true}
      />
    </div>
  );
}
```

### With Close Button

```tsx
import { SubscriptionStatusBanner } from "@ffx/components/billing";
import { useState } from "react";

function BillingPage() {
  const [showBanner, setShowBanner] = useState(true);

  if (!showBanner) return null;

  return (
    <div className="max-w-4xl">
      <SubscriptionStatusBanner
        showCloseButton={true}
        onClose={() => setShowBanner(false)}
        title="Subscription Notice"
      />
    </div>
  );
}
```

### Custom Styling

```tsx
import { SubscriptionStatusBanner } from "@ffx/components/billing";

function BillingPage() {
  return (
    <div className="space-y-8">
      <SubscriptionStatusBanner className="shadow-lg" />
      <div>Other billing content</div>
    </div>
  );
}
```

## Banner Layout

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Icon]  Title                                    [Close]    │
│         Description                                            │
│         [Action Button] [Secondary Action]                   │
└─────────────────────────────────────────────────────────────┘
```

### Visual States

- **Success (Active)**: Green background, checkmark icon
- **Info (Trial)**: Blue background, clock icon
- **Error (Expired)**: Red background, X icon
- **Warning (Cancelled)**: Yellow background, warning icon

## Auto-Hide Logic

The banner automatically hides in these scenarios:

- **Loading State**: While billing data is being fetched
- **No Data**: When no billing data is available
- **Active Subscription**: When subscription is active and not in trial

The banner shows for:

- **Trial Active**: Shows trial information with upgrade options
- **Trial Expired**: Shows expired trial with renewal options
- **Subscription Expired**: Shows expired subscription with renewal options
- **Subscription Cancelled**: Shows cancelled subscription with reactivation options

## Accessibility

- **Semantic HTML**: Proper heading structure and button elements
- **Screen Reader Support**: All text and actions are accessible
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Management**: Clear focus indicators on buttons
- **ARIA Labels**: Proper labeling for close button and actions

## Styling

### Status-Specific Colors

```css
/* Active Status */
.bg-green-50 .border-green-200 .text-green-800
.dark:bg-green-900/20 .dark:border-green-800 .dark:text-green-200

/* Trial Status */
.bg-blue-50 .border-blue-200 .text-blue-800
.dark:bg-blue-900/20 .dark:border-blue-800 .dark:text-blue-200

/* Expired Status */
.bg-red-50 .border-red-200 .text-red-800
.dark:bg-red-900/20 .dark:border-red-800 .dark:text-red-200

/* Cancelled Status */
.bg-yellow-50 .border-yellow-200 .text-yellow-800
.dark:bg-yellow-900/20 .dark:border-yellow-800 .dark:text-yellow-200
```

### Layout

- **Flex Layout**: Icon, content, and close button in flex container
- **Spacing**: Consistent padding and margins
- **Typography**: Clear hierarchy with proper contrast
- **Buttons**: Primary and secondary action buttons

## Integration

### With BillingDashboard

```tsx
import {
  SubscriptionStatusBanner,
  BillingDashboard,
} from "@ffx/components/billing";

function BillingPage() {
  return (
    <div>
      <SubscriptionStatusBanner />
      <BillingDashboard plans={plans} />
    </div>
  );
}
```

### With Custom Billing Data

```tsx
import { SubscriptionStatusBanner } from "@ffx/components/billing";

function BillingPage() {
  // The component automatically uses useBillingData hook
  // No additional setup required
  return <SubscriptionStatusBanner />;
}
```

## Best Practices

### 1. **User Experience**

- Show banner prominently for important status changes
- Provide clear action buttons for next steps
- Allow users to dismiss non-critical banners
- Use appropriate urgency levels for different statuses

### 2. **Action Handling**

- Implement proper error handling for actions
- Provide loading states during action processing
- Show success/error feedback after actions
- Handle edge cases gracefully

### 3. **Accessibility**

- Ensure keyboard navigation works
- Provide clear visual feedback
- Use appropriate color contrast
- Test with screen readers

### 4. **Performance**

- Only render when necessary (auto-hide logic)
- Minimize re-renders with proper state management
- Use efficient event handlers

## Future Enhancements

### Planned Features

- **Dismissal Persistence**: Remember dismissed banners
- **Custom Messages**: Support for custom status messages
- **Action Callbacks**: More granular action handling
- **Animation**: Smooth show/hide animations

### Potential Improvements

- **Notification Center**: Integrate with notification system
- **Email Integration**: Send status notifications via email
- **Analytics**: Track banner interactions
- **A/B Testing**: Test different banner designs

## Performance

- **Bundle Size**: ~2KB minified + gzipped
- **Dependencies**: Uses `@ffx/components/billing` hooks
- **Rendering**: Conditional rendering based on status
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
