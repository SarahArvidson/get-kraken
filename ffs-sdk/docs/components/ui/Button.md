# 🔘 Button Component

The Button is a foundational atomic component of the Flying Fox Solutions Template Library, designed to serve as the primary interactive element for all user actions across forms, navigation, modals, and CTAs.

## ✨ Overview

Button provides a consistent, accessible, and fully-featured interactive component that supports multiple variants, sizes, and states. It's built with accessibility-first principles and follows the established design language of the Flying Fox Solutions template system.

## 🎯 Key Features

- **🎨 Multiple Variants**: Primary, secondary, danger, and ghost button styles
- **📏 Flexible Sizes**: Small, medium, and large sizes with full-width option
- **🔄 Loading States**: Built-in spinner animation and loading text support
- **♿ Full Accessibility**: ARIA attributes, keyboard navigation, and focus states
- **🌙 Dark Mode**: Complete dark theme compatibility
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **⚡ Performance**: Lightweight with no external dependencies
- **🔧 Highly Configurable**: Extensive prop system for customization

## 📁 Location

`components/ui/Button.tsx`

## 📦 Props

| Name          | Type                                              | Required | Default     | Description                           |
| ------------- | ------------------------------------------------- | -------- | ----------- | ------------------------------------- |
| `children`    | `React.ReactNode`                                 | ✅       | —           | Button content (text, icons, etc.)    |
| `variant`     | `"primary" \| "secondary" \| "danger" \| "ghost"` | ❌       | `"primary"` | Visual style variant                  |
| `size`        | `"sm" \| "md" \| "lg"`                            | ❌       | `"md"`      | Button size                           |
| `loading`     | `boolean`                                         | ❌       | `false`     | Whether button is in loading state    |
| `fullWidth`   | `boolean`                                         | ❌       | `false`     | Whether button should take full width |
| `loadingText` | `string`                                          | ❌       | —           | Custom text to show when loading      |
| `type`        | `"button" \| "submit" \| "reset"`                 | ❌       | `"button"`  | HTML button type                      |
| `onClick`     | `(e: MouseEvent<HTMLButtonElement>) => void`      | ❌       | —           | Click handler function                |
| `disabled`    | `boolean`                                         | ❌       | —           | Whether button is disabled            |
| `className`   | `string`                                          | ❌       | —           | Additional CSS classes                |
| `...rest`     | `ButtonHTMLAttributes`                            | ❌       | —           | All other standard button props       |

## 🛠️ Usage Examples

### Basic Button

```tsx
import { Button } from "@ffx/sdk";

<Button onClick={() => console.log("Clicked!")}>Click me</Button>;
```

### Button Variants

```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="danger">Delete Item</Button>
<Button variant="ghost">Cancel</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button fullWidth>Full Width</Button>
```

### Loading State

```tsx
<Button loading={isSubmitting} loadingText="Saving...">
  Save Changes
</Button>
```

### Form Integration

```tsx
<form onSubmit={handleSubmit}>
  <Button type="submit" loading={isSubmitting}>
    Submit Form
  </Button>
</form>
```

### With Icons

```tsx
<Button variant="primary">
  <PlusIcon className="h-4 w-4" />
  Add Item
</Button>
```

## 🎨 Variants

### 🔵 Primary

- **Use Case**: Main actions, CTAs, form submissions
- **Style**: Indigo background with white text
- **States**: Hover darkens, focus shows ring, disabled grays out

### ⚪ Secondary

- **Use Case**: Secondary actions, cancel buttons, alternative choices
- **Style**: White background with gray border and text
- **States**: Hover adds gray background, dark mode compatible

### 🔴 Danger

- **Use Case**: Destructive actions, delete buttons, warnings
- **Style**: Red background with white text
- **States**: Hover darkens red, focus shows red ring

### 👻 Ghost

- **Use Case**: Subtle actions, navigation, minimal interfaces
- **Style**: Transparent background with colored text
- **States**: Hover adds background, no border or shadow

## 📏 Sizes

### Small (`sm`)

- **Padding**: `px-3 py-1.5`
- **Text**: `text-sm`
- **Use Case**: Compact interfaces, inline actions

### Medium (`md`) - Default

- **Padding**: `px-4 py-2`
- **Text**: `text-sm`
- **Use Case**: General purpose, most common size

### Large (`lg`)

- **Padding**: `px-6 py-3`
- **Text**: `text-base`
- **Use Case**: Hero sections, primary CTAs

## 🔄 States

### 📋 Default State

- Clean, professional appearance
- Proper contrast ratios
- Clear focus indicators

### 🔄 Loading State

- Spinner animation appears
- Button becomes disabled
- Custom loading text supported
- Screen reader announces loading

### 🚫 Disabled State

- Reduced opacity (60%)
- Cursor changes to not-allowed
- Prevents all interactions
- Maintains visual hierarchy

### 🎯 Focus State

- Clear focus ring in brand color
- Keyboard navigation support
- Accessible focus indicators

## ♿ Accessibility

### ARIA Support

- **State Communication**: `aria-disabled` for disabled state
- **Loading Announcements**: Screen reader support for loading state
- **Focus Management**: Proper focus indicators and keyboard navigation

### Keyboard Navigation

- **Tab Order**: Follows logical flow in forms
- **Enter/Space**: Activates button when focused
- **Focus Indicators**: Clear visual feedback for keyboard users

### Screen Reader Support

- All text content is announced properly
- Loading states are communicated
- Button purpose is clear from content

## 🎨 Styling

### Design System Integration

- **Colors**: Indigo primary, gray secondary, red danger
- **Typography**: Consistent font weights and sizes
- **Spacing**: Follows 4px grid system
- **Border Radius**: Rounded-lg for modern appearance
- **Shadows**: Subtle shadow-sm for depth

### Dark Mode Support

```css
/* Light mode */
bg-white text-gray-900 ring-gray-300

/* Dark mode */
dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600
```

### Customization

```tsx
<Button
  className="custom-class" // Additional styling
  variant="primary"
  size="lg"
>
  Custom Button
</Button>
```

## 🔌 Integration Examples

### Form Library Integration

```tsx
import { useForm } from "react-hook-form";
import { Button } from "@ffx/sdk";

function ContactForm() {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <Button type="submit" loading={isSubmitting} fullWidth>
        Send Message
      </Button>
    </form>
  );
}
```

### Modal Integration

```tsx
function ConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
```

### Navigation Integration

```tsx
function Navigation() {
  return (
    <nav className="flex gap-2">
      <Button variant="ghost" size="sm">
        Home
      </Button>
      <Button variant="ghost" size="sm">
        About
      </Button>
      <Button variant="primary" size="sm">
        Contact
      </Button>
    </nav>
  );
}
```

### Card Actions

```tsx
function ProductCard({ product }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm">
          View Details
        </Button>
        <Button variant="primary" size="sm" fullWidth>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
```

## 🧠 Best Practices

### 1. **Clear Action Labels**

```tsx
// ✅ Good: Clear, action-oriented labels
<Button>Save Changes</Button>
<Button variant="danger">Delete Account</Button>
<Button variant="ghost">Cancel</Button>

// ❌ Avoid: Vague or unclear labels
<Button>Click Here</Button>
<Button>OK</Button>
```

### 2. **Appropriate Variants**

```tsx
// ✅ Good: Variants match action importance
<Button variant="primary">Submit Form</Button>
<Button variant="secondary">Save Draft</Button>
<Button variant="danger">Delete Item</Button>
<Button variant="ghost">Cancel</Button>

// ❌ Avoid: Inconsistent variant usage
<Button variant="danger">Save</Button>
<Button variant="primary">Cancel</Button>
```

### 3. **Loading States**

```tsx
// ✅ Good: Show loading for async actions
<Button loading={isSubmitting} loadingText="Saving...">
  Save Changes
</Button>

// ❌ Avoid: No feedback for long operations
<Button onClick={handleLongOperation}>
  Process Data
</Button>
```

### 4. **Accessibility First**

```tsx
// ✅ Good: Proper button semantics
<Button type="submit" aria-label="Submit contact form">
  Send
</Button>

// ❌ Avoid: Using divs for buttons
<div onClick={handleClick}>Click me</div>
```

## 🔮 Future Enhancements

### Planned Features

- **Icon Support**: Built-in icon prop for common icons
- **Badge Integration**: Support for notification badges
- **Tooltip Support**: Built-in tooltip functionality
- **Animation Variants**: More loading animation options
- **Gradient Variants**: Modern gradient button styles

### Advanced Features

- **Async Actions**: Built-in async operation handling
- **Keyboard Shortcuts**: Support for keyboard shortcuts
- **Analytics**: Built-in event tracking
- **Theme Customization**: CSS custom property support
- **Micro-interactions**: Enhanced hover and focus animations

## 📈 Performance Considerations

- **Lightweight**: No external dependencies
- **Tree Shaking**: Only imports what you use
- **Memoization**: Consider wrapping in React.memo for large lists
- **Bundle Size**: Minimal impact on bundle size

## ⚙️ Configuration Requirements

### TypeScript Configuration

The Button component requires the same TypeScript configuration as other components:

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

The Button component is a cornerstone of the Flying Fox Solutions interactive UI system, providing a consistent, accessible, and highly reusable foundation for all user actions. With its comprehensive variant system, built-in loading states, and seamless integration capabilities, it enables rapid development of professional, user-friendly interfaces across all applications in the template library.

**Key Benefits:**

- 🎯 **Consistency**: Unified look and feel across all interactive elements
- ♿ **Accessibility**: WCAG compliant out of the box
- 🔧 **Flexibility**: Multiple variants and sizes for any use case
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Lightweight and fast
- 🌙 **Modern**: Dark mode and modern design patterns
- 🔄 **Interactive**: Built-in loading and state management
