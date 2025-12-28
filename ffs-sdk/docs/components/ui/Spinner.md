# ⏳ Spinner Component

The Spinner is a foundational atomic component of the Flying Fox Solutions Template Library, designed to serve as the primary loading indicator for all loading states across buttons, forms, modals, and page transitions.

## ✨ Overview

Spinner provides a consistent, accessible, and lightweight loading indicator that supports multiple sizes and colors. It's built with accessibility-first principles and follows the established design language of the Flying Fox Solutions template system.

## 🎯 Key Features

- **📏 Multiple Sizes**: Small, medium, and large size variants
- **🎨 Color Variants**: Primary, white, and gray color options
- **♿ Full Accessibility**: ARIA attributes, role="status", and screen reader support
- **🌙 Dark Mode**: Complete dark theme compatibility
- **⚡ Performance**: Lightweight with CSS-only animation
- **🔧 Highly Configurable**: Customizable aria-label and styling
- **🔄 Smooth Animation**: Tailwind-based rotate animation
- **📱 Responsive**: Works perfectly on all screen sizes

## 📁 Location

`components/ui/Spinner.tsx`

## 📦 Props

| Name         | Type                             | Required | Default     | Description                         |
| ------------ | -------------------------------- | -------- | ----------- | ----------------------------------- |
| `size`       | `"sm" \| "md" \| "lg"`           | ❌       | `"md"`      | Size variant of the spinner         |
| `color`      | `"primary" \| "white" \| "gray"` | ❌       | `"primary"` | Color variant of the spinner        |
| `aria-label` | `string`                         | ❌       | `"Loading"` | Accessible label for screen readers |
| `className`  | `string`                         | ❌       | —           | Additional CSS classes              |

## 🛠️ Usage Examples

### Basic Spinner

```tsx
import Spinner from "@ffx/components/ui/Spinner";

<Spinner />;
```

### Spinner with Custom Label

```tsx
<Spinner aria-label="Loading user data" />
```

### Different Sizes

```tsx
<div className="flex items-center gap-4">
  <Spinner size="sm" aria-label="Small loading" />
  <Spinner size="md" aria-label="Medium loading" />
  <Spinner size="lg" aria-label="Large loading" />
</div>
```

### Different Colors

```tsx
<div className="flex items-center gap-4">
  <Spinner color="primary" aria-label="Primary loading" />
  <Spinner color="white" aria-label="White loading" />
  <Spinner color="gray" aria-label="Gray loading" />
</div>
```

### In Button Loading State

```tsx
<Button loading={isLoading} loadingText="Saving...">
  Save Changes
</Button>
```

### In Form Context

```tsx
<form onSubmit={handleSubmit}>
  <InputField
    type="email"
    label="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <Button type="submit" loading={isSubmitting}>
    {isSubmitting ? "Sending..." : "Send"}
  </Button>
</form>
```

### In Modal Context

```tsx
<Modal isOpen={isModalOpen} onClose={onClose} title="Processing">
  <div className="flex items-center justify-center py-8">
    <Spinner size="lg" color="primary" aria-label="Processing request" />
  </div>
</Modal>
```

### With Custom Styling

```tsx
<Spinner
  size="lg"
  color="primary"
  className="mx-auto my-4"
  aria-label="Loading content"
/>
```

## 📏 Sizes

### Small (`sm`)

- **Dimensions**: `h-3 w-3` (12px)
- **Use Case**: Inline loading indicators, small buttons, compact interfaces

### Medium (`md`) - Default

- **Dimensions**: `h-4 w-4` (16px)
- **Use Case**: General purpose, most common size for buttons and forms

### Large (`lg`)

- **Dimensions**: `h-6 w-6` (24px)
- **Use Case**: Page loading states, modal loading, prominent loading indicators

## 🎨 Colors

### Primary

- **Light Mode**: `text-indigo-600`
- **Dark Mode**: `text-indigo-400`
- **Use Case**: Default loading states, primary actions

### White

- **Color**: `text-white`
- **Use Case**: Loading states on dark backgrounds, primary/danger buttons

### Gray

- **Light Mode**: `text-gray-600`
- **Dark Mode**: `text-gray-400`
- **Use Case**: Secondary actions, ghost buttons, subtle loading states

## ♿ Accessibility

### ARIA Support

- **Role**: `status` indicates loading state to screen readers
- **Labeling**: `aria-label` provides descriptive text for screen readers
- **Screen Reader Text**: Visually hidden text announces loading state

### Screen Reader Support

- **Announcement**: Screen readers announce the loading state
- **Context**: Clear indication of what is loading
- **Status Updates**: Proper status role for dynamic content

### Implementation

```tsx
<div role="status" aria-label="Loading user data">
  <span className="sr-only">Loading user data</span>
  {/* Spinner SVG */}
</div>
```

## 🎨 Styling

### Design System Integration

- **Colors**: Consistent with brand colors (indigo primary)
- **Typography**: Inherits current text color for flexibility
- **Spacing**: Minimal footprint with precise sizing
- **Animation**: Smooth CSS transform-based rotation

### Animation Details

- **CSS Class**: `animate-spin` (Tailwind's built-in rotation)
- **Duration**: 1 second per rotation
- **Easing**: Linear for consistent motion
- **Performance**: GPU-accelerated transform

### Dark Mode Support

```css
/* Light mode */
text-indigo-600 text-gray-600

/* Dark mode */
dark:text-indigo-400 dark:text-gray-400
```

## 🔌 Integration Examples

### Button Integration

```tsx
function LoadingButton({ isLoading, onClick, children }) {
  return (
    <Button loading={isLoading} onClick={onClick} loadingText="Processing...">
      {children}
    </Button>
  );
}
```

### Form Integration

```tsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />
      <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
```

### Page Loading Integration

```tsx
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" color="primary" aria-label="Loading page" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading your content...
        </p>
      </div>
    </div>
  );
}
```

### Modal Loading Integration

```tsx
function ProcessingModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Processing">
      <div className="flex flex-col items-center py-8">
        <Spinner size="lg" color="primary" aria-label="Processing request" />
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Please wait while we process your request...
        </p>
      </div>
    </Modal>
  );
}
```

### Inline Loading Integration

```tsx
function DataList({ isLoading, data }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" color="gray" aria-label="Loading data" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Loading items...
        </span>
      </div>
    );
  }

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## 🧠 Best Practices

### 1. **Descriptive Labels**

```tsx
// ✅ Good: Clear, specific labels
<Spinner aria-label="Loading user profile" />
<Spinner aria-label="Saving document" />
<Spinner aria-label="Processing payment" />

// ❌ Avoid: Generic or unclear labels
<Spinner aria-label="Loading" />
<Spinner aria-label="Wait" />
```

### 2. **Appropriate Sizes**

```tsx
// ✅ Good: Size matches context
<Spinner size="sm" /> {/* In small button */}
<Spinner size="md" /> {/* In standard button */}
<Spinner size="lg" /> {/* In page loading */}

// ❌ Avoid: Oversized spinners in small contexts
<Spinner size="lg" /> {/* In small inline text */}
```

### 3. **Color Context**

```tsx
// ✅ Good: Colors match background context
<Spinner color="white" /> {/* On dark background */}
<Spinner color="primary" /> {/* On light background */}
<Spinner color="gray" /> {/* For secondary actions */}

// ❌ Avoid: Poor contrast
<Spinner color="white" /> {/* On white background */}
```

### 4. **Loading State Management**

```tsx
// ✅ Good: Clear loading states
<Button loading={isLoading}>
  {isLoading ? "Saving..." : "Save"}
</Button>

// ❌ Avoid: Unclear loading states
<Button loading={isLoading}>
  Save
</Button>
```

## 🔮 Future Enhancements

### Planned Features

- **Animation Variants**: Pulse, bounce, and fade animations
- **Custom Colors**: Support for brand-specific color schemes
- **Progress Spinners**: Percentage-based loading indicators
- **Dots Loading**: Alternative dot-based loading animation
- **Skeleton Loading**: Placeholder content during loading

### Advanced Features

- **Custom SVG**: Support for custom spinner graphics
- **Speed Control**: Configurable animation speed
- **Size Units**: Pixel-perfect sizing options
- **Theme Integration**: Automatic theme-aware colors
- **Reduced Motion**: Respects user's motion preferences

## 📈 Performance Considerations

- **Lightweight**: Minimal DOM footprint
- **CSS Animation**: GPU-accelerated transforms
- **No JavaScript**: Pure CSS animation
- **Efficient Rendering**: Optimized SVG path
- **Memory Usage**: Minimal memory footprint

## ⚙️ Configuration Requirements

### TypeScript Configuration

The Spinner component requires the same TypeScript configuration as other components:

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

The Spinner component is a cornerstone of the Flying Fox Solutions loading UI system, providing a consistent, accessible, and highly reusable foundation for all loading states. With its comprehensive size and color options, seamless integration capabilities, and optimized performance, it enables rapid development of professional, user-friendly loading experiences across all applications in the template library.

**Key Benefits:**

- 🎯 **Consistency**: Unified loading indicators across all applications
- ♿ **Accessibility**: WCAG compliant with full screen reader support
- 🔧 **Flexibility**: Multiple sizes and colors for any context
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Lightweight with CSS-only animation
- 🌙 **Modern**: Dark mode and modern design patterns
- 🔄 **Smooth**: Professional animation with GPU acceleration
