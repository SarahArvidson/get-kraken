# 💳 CheckoutPanel Component

The CheckoutPanel is a comprehensive billing blueprint component of the Flying Fox Solutions Template Library, designed to serve as a complete subscription checkout solution that combines multiple atomic components into a production-ready billing experience.

## ✨ Overview

CheckoutPanel demonstrates the power of atomic design by composing InputField, Button, Toast, FormGroup, and Modal components into a cohesive subscription management experience. It provides a complete checkout flow that can be dropped into any project with minimal configuration, showcasing how atomic components can be combined to create powerful, reusable billing blueprints.

## 🎯 Key Features

- **💳 Complete Checkout Flow**: Plan selection, email collection, and payment processing
- **🎨 Atomic Component Composition**: Built using InputField, Button, Toast, FormGroup, and Modal
- **✅ Client-Side Validation**: Real-time validation with comprehensive error handling
- **♿ Full Accessibility**: ARIA attributes, role="form", and screen reader support
- **🎭 Toast Feedback**: Success and error notifications using Toast component
- **🌙 Dark Mode**: Complete dark theme compatibility with Tailwind CSS
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **⚡ TypeScript**: Fully typed with comprehensive interfaces
- **🔧 Flexible Configuration**: Customizable plans, currency, and behavior
- **🧪 Test Mode**: Built-in demo mode for testing and development

## 📁 Location

`components/blueprints/billing/CheckoutPanel.tsx`

## 📦 Props

| Name          | Type                                                                              | Required | Default                                             | Description                               |
| ------------- | --------------------------------------------------------------------------------- | -------- | --------------------------------------------------- | ----------------------------------------- |
| `onCheckout`  | `(planId: string, email: string, paymentMethod: string) => void \| Promise<void>` | ❌       | —                                                   | Callback for checkout form submission     |
| `plans`       | `SubscriptionPlan[]`                                                              | ✅       | —                                                   | Array of subscription plans to display    |
| `currency`    | `string`                                                                          | ❌       | `"$"`                                               | Currency symbol for pricing display       |
| `testMode`    | `boolean`                                                                         | ❌       | `false`                                             | Whether to show test mode UI              |
| `className`   | `string`                                                                          | ❌       | —                                                   | Custom CSS classes for the container      |
| `title`       | `string`                                                                          | ❌       | `"Choose Your Plan"`                                | Custom title for the checkout panel       |
| `subtitle`    | `string`                                                                          | ❌       | `"Select a subscription plan that fits your needs"` | Custom subtitle for the checkout panel    |
| `showSummary` | `boolean`                                                                         | ❌       | `true`                                              | Whether to show the order summary section |

## 📊 Data Types

### SubscriptionPlan

```typescript
interface SubscriptionPlan {
  id: string; // Unique identifier for the plan
  name: string; // Display name of the plan
  price: number; // Price per billing cycle
  description: string; // Description of the plan features
  billingCycle?: "monthly" | "yearly" | "one-time"; // Billing frequency
  features?: string[]; // Array of features included
  popular?: boolean; // Whether this plan is recommended
  className?: string; // Custom styling for the plan
}
```

### CheckoutData

```typescript
interface CheckoutData {
  planId: string; // Selected plan identifier
  email: string; // User's email address
  paymentMethod: string; // Selected payment method
}
```

## 🛠️ Usage Examples

### Basic CheckoutPanel

```tsx
import CheckoutPanel, {
  type SubscriptionPlan,
} from "@ffx/components/blueprints/billing/CheckoutPanel";

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 9.99,
    description: "Perfect for individuals getting started",
    billingCycle: "monthly",
    features: ["Up to 5 projects", "Basic support", "1GB storage"],
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 29.99,
    description: "Ideal for growing teams",
    billingCycle: "monthly",
    features: [
      "Unlimited projects",
      "Priority support",
      "10GB storage",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99.99,
    description: "For large organizations",
    billingCycle: "monthly",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "Unlimited storage",
    ],
  },
];

function App() {
  const handleCheckout = async (planId, email, paymentMethod) => {
    console.log("Checkout:", { planId, email, paymentMethod });
    // Your checkout logic here
  };

  return (
    <CheckoutPanel plans={plans} onCheckout={handleCheckout} currency="$" />
  );
}
```

### CheckoutPanel with Custom Styling

```tsx
<CheckoutPanel
  plans={plans}
  onCheckout={handleCheckout}
  currency="€"
  title="Upgrade Your Account"
  subtitle="Choose the perfect plan for your business needs"
  showSummary={true}
  className="max-w-6xl mx-auto mt-8"
/>
```

### CheckoutPanel in Test Mode

```tsx
<CheckoutPanel
  plans={plans}
  onCheckout={handleCheckout}
  currency="$"
  testMode={true}
  title="Demo Checkout"
  subtitle="Try out our checkout flow in test mode"
/>
```

### CheckoutPanel with API Integration

```tsx
const handleCheckout = async (planId, email, paymentMethod) => {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        email,
        paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error("Checkout failed");
    }

    const result = await response.json();
    // Handle successful checkout
    console.log("Checkout successful:", result);
  } catch (error) {
    // Error will be handled by CheckoutPanel's built-in error handling
    throw error;
  }
};
```

## 💳 Plan Selection

### Plan Display Features

- **Visual Selection**: Radio button selection with hover effects
- **Popular Badge**: Highlights recommended plans
- **Feature Lists**: Shows included features with checkmark icons
- **Pricing Display**: Clear price formatting with billing cycle
- **Responsive Layout**: Adapts to different screen sizes

### Plan Configuration

```tsx
const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "Free plan to get you started",
    billingCycle: "monthly",
    features: ["1 project", "Community support", "Basic templates"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 19.99,
    description: "Perfect for professionals",
    billingCycle: "monthly",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced templates",
      "Team collaboration",
    ],
    popular: true,
  },
];
```

## 📧 Email Collection

### Email Validation

- **Required Field**: Email cannot be empty
- **Format Validation**: Must be a valid email address
- **Real-time Feedback**: Validates as user types
- **Error Display**: Clear error messages with red styling

### Email Input Features

```tsx
<FormGroup label="Email Address" error={errors.email} required>
  <InputField
    type="email"
    label=""
    value={email}
    onChange={handleEmailChange}
    placeholder="you@example.com"
    disabled={isSubmitting}
  />
</FormGroup>
```

## 💰 Payment Method Selection

### Supported Payment Methods

- **Credit/Debit Card**: Traditional card payments
- **PayPal**: PayPal integration ready
- **Bank Transfer**: Direct bank payments
- **Test Payment**: Demo mode for testing

### Payment Method Configuration

```tsx
<FormGroup
  label="Payment Method"
  description="Choose your preferred payment method"
>
  <select
    value={paymentMethod}
    onChange={handlePaymentMethodChange}
    disabled={isSubmitting}
  >
    <option value="card">💳 Credit/Debit Card</option>
    <option value="paypal">🅿️ PayPal</option>
    <option value="bank">🏦 Bank Transfer</option>
    {testMode && <option value="test">🧪 Test Payment</option>}
  </select>
</FormGroup>
```

## 📋 Order Summary

### Summary Display

- **Selected Plan**: Shows chosen subscription plan
- **Billing Cycle**: Displays billing frequency
- **Payment Method**: Shows selected payment option
- **Total Price**: Clear total with currency formatting

### Summary Configuration

```tsx
{
  showSummary && selectedPlan && (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Order Summary
      </h3>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        {/* Summary details */}
      </div>
    </div>
  );
}
```

## 🎭 Toast Feedback System

### Success Messages

- **Checkout Success**: "Checkout successful! Welcome to your new plan."
- **Confirmation**: "Subscription confirmed! Redirecting to dashboard."

### Error Messages

- **Checkout Failed**: "Checkout failed. Please try again."
- **Validation Error**: "Please complete all required fields."

### Toast Configuration

- **Auto-dismiss**: 5 seconds for all toasts
- **Manual dismiss**: Close button available
- **Stacking**: Multiple toasts stack with offset positioning
- **Variants**: Success (green), Error (red), Info (blue), Warning (yellow)

## 🔄 Confirmation Modal

### Modal Features

- **Plan Confirmation**: Shows selected plan details
- **Price Verification**: Displays total cost
- **Payment Method**: Confirms payment choice
- **Email Verification**: Shows email address

### Modal Implementation

```tsx
<Modal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  title="Confirm Your Subscription"
  size="md"
>
  <div className="space-y-4">
    <p className="text-gray-600 dark:text-gray-400">
      Are you sure you want to subscribe to the{" "}
      <span className="font-semibold">{selectedPlan.name}</span> plan?
    </p>

    <div className="flex space-x-3 pt-4">
      <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirmCheckout}>
        Confirm Subscription
      </Button>
    </div>
  </div>
</Modal>
```

## ✅ Validation Rules

### Plan Selection Validation

- **Required**: Must select a subscription plan
- **Real-time**: Validates on form submission

### Email Validation

- **Required**: Email field cannot be empty
- **Format**: Must match valid email regex pattern
- **Real-time**: Validates as user types

### Form Submission Validation

- **Complete Form**: All required fields must be filled
- **Visual Feedback**: Error messages with red styling
- **Accessibility**: Errors announced via screen readers

## ♿ Accessibility Features

### ARIA Support

- **Forms**: Each form has `role="form"` and `aria-label`
- **Plan Selection**: Radio buttons with proper `aria-checked`
- **Inputs**: Proper labeling via FormGroup component
- **Buttons**: Descriptive button text and loading states

### Screen Reader Support

- **Form Labels**: All inputs properly labeled
- **Error Announcements**: Errors announced via Toast component
- **Loading States**: Loading state announced via button text
- **Plan Selection**: Clear plan descriptions and pricing

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through all form elements
- **Enter Key**: Submits forms when focused on submit button
- **Plan Selection**: Keyboard accessible plan selection
- **Modal Navigation**: Proper focus management in confirmation modal

## 🎨 Styling and Theming

### Design System Integration

- **Colors**: Consistent with Flying Fox Solutions brand colors
- **Typography**: Uses established font weights and sizes
- **Spacing**: Follows 4px grid system
- **Components**: Leverages atomic component styling

### Dark Mode Support

```css
/* Light mode */
bg-white text-gray-900 border-gray-300

/* Dark mode */
dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
```

### Plan Card Styling

```css
/* Selected plan */
border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20

/* Popular plan */
ring-2 ring-indigo-200 dark:ring-indigo-800

/* Hover effects */
hover:shadow-lg hover:border-indigo-300
```

## 🔌 Integration Examples

### Stripe Integration

```tsx
import { loadStripe } from "@stripe/stripe-js";

const handleCheckout = async (planId, email, paymentMethod) => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, email, paymentMethod }),
    });

    const { sessionId } = await response.json();
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    );

    await stripe.redirectToCheckout({ sessionId });
  } catch (error) {
    throw error;
  }
};
```

### PayPal Integration

```tsx
const handleCheckout = async (planId, email, paymentMethod) => {
  if (paymentMethod === "paypal") {
    try {
      const response = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email }),
      });

      const { orderId } = await response.json();
      // Redirect to PayPal checkout
      window.location.href = `/paypal-checkout/${orderId}`;
    } catch (error) {
      throw error;
    }
  }
};
```

### Analytics Integration

```tsx
const handleCheckout = async (planId, email, paymentMethod) => {
  // Track checkout initiation
  analytics.track("checkout_initiated", {
    plan_id: planId,
    payment_method: paymentMethod,
    value: plans.find((p) => p.id === planId)?.price,
  });

  try {
    await processCheckout(planId, email, paymentMethod);

    // Track successful checkout
    analytics.track("checkout_completed", {
      plan_id: planId,
      payment_method: paymentMethod,
      value: plans.find((p) => p.id === planId)?.price,
    });
  } catch (error) {
    // Track failed checkout
    analytics.track("checkout_failed", {
      plan_id: planId,
      payment_method: paymentMethod,
      error: error.message,
    });
    throw error;
  }
};
```

## 🧠 Best Practices

### 1. **Plan Configuration**

```tsx
// ✅ Good: Clear, descriptive plans
const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 9.99,
    description: "Perfect for individuals getting started",
    features: ["Up to 5 projects", "Basic support", "1GB storage"],
  },
];

// ❌ Avoid: Vague or unclear plan descriptions
const plans = [
  {
    id: "plan1",
    name: "Plan",
    price: 10,
    description: "Good plan",
  },
];
```

### 2. **Error Handling**

```tsx
// ✅ Good: Let CheckoutPanel handle UI errors
const handleCheckout = async (planId, email, paymentMethod) => {
  try {
    await processPayment(planId, email, paymentMethod);
  } catch (error) {
    // CheckoutPanel will show error toast
    throw error;
  }
};

// ❌ Avoid: Handling UI errors manually
const handleCheckout = async (planId, email, paymentMethod) => {
  try {
    await processPayment(planId, email, paymentMethod);
  } catch (error) {
    // Don't show your own error UI
    setError(error.message);
  }
};
```

### 3. **Plan Features**

```tsx
// ✅ Good: Specific, valuable features
features: [
  "Unlimited projects",
  "Priority email support",
  "10GB cloud storage",
  "Team collaboration tools",
  "Advanced analytics dashboard",
];

// ❌ Avoid: Generic or unclear features
features: ["Projects", "Support", "Storage", "Tools"];
```

### 4. **Currency Configuration**

```tsx
// ✅ Good: Use appropriate currency symbols
<CheckoutPanel currency="$" />   // US Dollar
<CheckoutPanel currency="€" />   // Euro
<CheckoutPanel currency="£" />   // British Pound
<CheckoutPanel currency="¥" />   // Japanese Yen

// ✅ Good: Handle different currencies properly
const formatPrice = (price, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === '$' ? 'USD' :
              currency === '€' ? 'EUR' : 'USD'
  }).format(price);
};
```

## 🔮 Future Enhancements

### Planned Features

- **Payment Integration**: Direct Stripe, PayPal, and other payment processors
- **Coupon Codes**: Discount code application
- **Tax Calculation**: Automatic tax computation
- **Multiple Currencies**: Full internationalization support
- **Subscription Management**: Plan changes and cancellations

### Advanced Features

- **Recurring Billing**: Automatic subscription renewals
- **Proration**: Mid-cycle plan changes
- **Trial Periods**: Free trial support
- **Usage Limits**: Metered billing capabilities
- **Custom Pricing**: Dynamic pricing based on usage

## 📈 Performance Considerations

- **Component Composition**: Leverages atomic components for optimal reusability
- **Minimal Re-renders**: Efficient state management with useCallback
- **Lazy Loading**: Could be enhanced with code splitting
- **Bundle Size**: No external dependencies beyond atomic components
- **Memory Usage**: Proper cleanup of timers and event listeners

## ⚙️ Configuration Requirements

### TypeScript Configuration

The CheckoutPanel component requires the same TypeScript configuration as other components:

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@ffx/*": ["./*"]
    }
  }
}
```

**vite.config.ts:**

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

## ✅ Summary

The CheckoutPanel component is a cornerstone of the Flying Fox Solutions billing blueprint system, demonstrating how atomic components can be composed into powerful, reusable subscription management experiences. With its comprehensive plan selection, validation, accessibility features, and flexible configuration options, it provides a production-ready solution that can be dropped into any project with minimal setup.

**Key Benefits:**

- 🎯 **Production Ready**: Complete checkout flow with error handling
- ♿ **Accessible**: WCAG compliant with full screen reader support
- 🔧 **Flexible**: Customizable plans, currency, and behavior
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Efficient component composition and state management
- 🌙 **Modern**: Dark mode and modern design patterns
- 🎭 **User-Friendly**: Toast feedback and smooth interactions
- 🔄 **Composable**: Built using atomic components for maximum reusability
- 💳 **Payment Ready**: Supports multiple payment methods and integrations
- 🧪 **Test Friendly**: Built-in test mode for development and demos
