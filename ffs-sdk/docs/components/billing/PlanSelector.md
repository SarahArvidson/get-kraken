# PlanSelector Component

## Overview

The `PlanSelector` component displays available subscription plans in an organized grid layout. It allows users to view plan details, compare features, and select a new plan with visual feedback for the current selection.

## Features

- **Plan Grid**: Responsive grid layout for plan cards
- **Current Plan Highlighting**: Visual indication of the currently selected plan
- **Popular Badges**: Special highlighting for popular/recommended plans
- **Feature Lists**: Display plan features with checkmark icons
- **Loading States**: Spinner display while plans are loading
- **Error Handling**: Error message display for failed plan loading
- **Empty State**: Message when no plans are available

## Location

```
components/billing/PlanSelector.tsx
```

## Props

| Prop            | Type                                        | Default      | Description                           |
| --------------- | ------------------------------------------- | ------------ | ------------------------------------- |
| `plans`         | `SubscriptionPlan[]`                        | **Required** | Array of available subscription plans |
| `onSelectPlan`  | `(planId: string) => void \| Promise<void>` | **Required** | Callback when a plan is selected      |
| `currentPlanId` | `string`                                    | `undefined`  | ID of the currently selected plan     |
| `loading`       | `boolean`                                   | `false`      | Whether plans are currently loading   |
| `error`         | `string \| null`                            | `null`       | Error message to display              |
| `currency`      | `string`                                    | `"$"`        | Currency symbol for price display     |
| `className`     | `string`                                    | `undefined`  | Custom CSS classes for the container  |

## Type Definitions

```typescript
interface SubscriptionPlan {
  id: string; // Unique plan identifier
  name: string; // Plan display name
  price: number; // Plan price (decimal)
  description: string; // Plan description
  billingCycle?: "monthly" | "yearly" | "one-time"; // Billing frequency
  features?: string[]; // Array of plan features
  popular?: boolean; // Whether this is a popular plan
  className?: string; // Custom CSS classes for the plan card
}
```

## Usage Examples

### Basic Usage

```tsx
import { PlanSelector } from "@ffx/components/billing";

function PlansPage() {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: 0,
      description: "Perfect for individuals getting started",
      billingCycle: "monthly",
      features: ["Up to 3 projects", "Community support"],
    },
    {
      id: "professional",
      name: "Professional",
      price: 19.99,
      description: "Ideal for professionals and small teams",
      billingCycle: "monthly",
      features: ["Unlimited projects", "Priority support"],
      popular: true,
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    console.log("Plan selected:", planId);
    // API call to update plan
  };

  return (
    <div className="max-w-6xl">
      <PlanSelector
        plans={plans}
        onSelectPlan={handleSelectPlan}
        currentPlanId="starter"
      />
    </div>
  );
}
```

### With Loading and Error States

```tsx
import { PlanSelector } from "@ffx/components/billing";
import { useState, useEffect } from "react";

function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/plans");
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <PlanSelector
        plans={plans}
        onSelectPlan={handleSelectPlan}
        loading={loading}
        error={error}
        currency="€"
      />
    </div>
  );
}
```

### Custom Styling

```tsx
import { PlanSelector } from "@ffx/components/billing";

function PlansPage() {
  const plans = [
    {
      id: "enterprise",
      name: "Enterprise",
      price: 99.99,
      description: "For large organizations",
      className: "border-purple-500 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Choose Your Plan</h1>
      <PlanSelector
        plans={plans}
        onSelectPlan={handleSelectPlan}
        className="shadow-lg"
      />
    </div>
  );
}
```

## Plan Card Layout

### Card Structure

```
┌─────────────────────────────────────┐
│ [Popular Badge]                     │
│ ┌─────────────────────────────────┐ │
│ │ Plan Name              Price    │ │
│ │ Description                    │ │
│ │                                │ │
│ │ Features:                      │ │
│ │ ✓ Feature 1                    │ │
│ │ ✓ Feature 2                    │ │
│ │ ✓ Feature 3                    │ │
│ │                                │ │
│ │ [Select Plan Button]           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Visual States

- **Default**: Gray border, white background
- **Current Plan**: Indigo border with ring, indigo background tint
- **Popular**: Additional shadow and ring
- **Hover**: Enhanced shadow and border color

## States

### Loading State

- Shows centered spinner with "Loading plans..." text
- Uses `Spinner` component with medium size
- Maintains consistent spacing

### Error State

- Red background with error message
- Clear error text: "Error: {error message} Please try again later."
- Rounded corners and proper padding

### Empty State

- Gray background with "No plans available." message
- Maintains consistent styling with other states

### Success State

- Grid layout with plan cards
- Interactive plan selection
- Visual feedback for current selection

## Accessibility

- **Keyboard Navigation**: All plan cards are keyboard accessible
- **Screen Reader Support**: Proper heading structure and descriptions
- **Focus Management**: Clear focus indicators on interactive elements
- **ARIA Labels**: Proper labeling for plan selection
- **Color Contrast**: Meets WCAG guidelines for all text and backgrounds

## Styling

### Grid Layout

- **Responsive**: 1 column on mobile, 2 on tablet, 3 on desktop
- **Gap**: Consistent spacing between cards
- **Alignment**: Cards stretch to equal height

### Plan Cards

- **Border**: Gray border with hover effects
- **Background**: White with dark mode support
- **Padding**: Consistent internal spacing
- **Shadow**: Subtle shadow with hover enhancement

### Typography

- **Plan Name**: Large, bold heading
- **Price**: Large, bold with smaller billing cycle
- **Description**: Medium gray text
- **Features**: Small text with checkmark icons

## Integration

### With Other Billing Components

```tsx
import {
  PlanSelector,
  BillingSummary,
  PaymentMethodForm,
} from "@ffx/components/billing";

function BillingDashboard() {
  return (
    <div className="space-y-8">
      <BillingSummary />
      <PlanSelector plans={plans} onSelectPlan={handleSelect} />
      <PaymentMethodForm />
    </div>
  );
}
```

### With CheckoutPanel

```tsx
import { PlanSelector } from "@ffx/components/billing";
import { CheckoutPanel } from "@ffx/components/blueprints/billing";

function PlansPage() {
  return (
    <div className="space-y-8">
      <PlanSelector plans={plans} onSelectPlan={handleSelect} />
      <CheckoutPanel plans={plans} onCheckout={handleCheckout} />
    </div>
  );
}
```

## Best Practices

### 1. **Plan Organization**

- Order plans by price (ascending)
- Mark most popular plan with `popular: true`
- Provide clear feature comparisons
- Use consistent naming conventions

### 2. **User Experience**

- Show current plan clearly
- Provide clear selection feedback
- Handle loading and error states gracefully
- Make plan differences obvious

### 3. **Data Management**

- Fetch plans from reliable API
- Handle network errors appropriately
- Cache plans for better performance
- Validate plan data structure

### 4. **Accessibility**

- Ensure keyboard navigation works
- Provide clear visual feedback
- Use proper heading structure
- Test with screen readers

## Future Enhancements

### Planned Features

- **Plan Comparison**: Side-by-side feature comparison
- **Annual Discounts**: Show savings for yearly plans
- **Custom Plans**: Support for custom enterprise plans
- **Plan Recommendations**: AI-driven plan suggestions

### Potential Improvements

- **Pricing Calculator**: Interactive pricing tool
- **Feature Filtering**: Filter plans by features
- **Plan History**: Show previous plan selections
- **Bulk Selection**: Support for team plan selection

## Performance

- **Bundle Size**: ~2.5KB minified + gzipped
- **Dependencies**: Uses `@ffx/components/ui` components
- **Rendering**: Efficient grid layout with CSS Grid
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
