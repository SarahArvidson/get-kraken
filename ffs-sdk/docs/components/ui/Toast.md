# 🍞 Toast Component

The Toast is a foundational atomic component of the Flying Fox Solutions Template Library, designed to serve as the primary notification system for all user feedback across forms, actions, and system messages.

## ✨ Overview

Toast provides a consistent, accessible, and fully-featured notification component that supports multiple variants, auto-dismiss functionality, and smooth animations. It's built with accessibility-first principles and follows the established design language of the Flying Fox Solutions template system.

## 🎯 Key Features

- **🎨 Four Variants**: Success, error, info, and warning notification styles
- **⏰ Auto-Dismiss**: Configurable duration with automatic dismissal
- **✋ Manual Dismiss**: Close button for immediate dismissal
- **♿ Full Accessibility**: ARIA attributes, role="alert", and screen reader support
- **🎭 Smooth Animations**: Slide-in and fade-out transitions
- **📚 Stackable**: Multiple toasts with offset positioning
- **🌙 Dark Mode**: Complete dark theme compatibility
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **⚡ Performance**: Lightweight with CSS-only animations

## 📁 Location

`components/ui/Toast.tsx`

## 📦 Props

| Name         | Type                                          | Required | Default  | Description                                                 |
| ------------ | --------------------------------------------- | -------- | -------- | ----------------------------------------------------------- |
| `message`    | `string`                                      | ✅       | —        | Toast message content                                       |
| `variant`    | `"success" \| "error" \| "info" \| "warning"` | ❌       | `"info"` | Visual variant of the toast                                 |
| `duration`   | `number`                                      | ❌       | `5000`   | Auto-dismiss duration in milliseconds (0 = no auto-dismiss) |
| `show`       | `boolean`                                     | ❌       | `false`  | Whether the toast is visible                                |
| `onDismiss`  | `() => void`                                  | ❌       | —        | Function called when toast is dismissed                     |
| `className`  | `string`                                      | ❌       | —        | Additional CSS classes for the toast container              |
| `aria-label` | `string`                                      | ❌       | —        | Custom aria-label for the toast                             |

## 🛠️ Usage Examples

### Basic Toast

```tsx
import Toast from "@ffx/components/ui/Toast";

<Toast
  message="Successfully saved your changes!"
  variant="success"
  show={showToast}
  onDismiss={() => setShowToast(false)}
/>;
```

### Auto-Dismiss Toast

```tsx
<Toast
  message="Your session will expire in 5 minutes"
  variant="warning"
  duration={3000}
  show={showWarning}
  onDismiss={() => setShowWarning(false)}
/>
```

### Manual Dismiss Only

```tsx
<Toast
  message="Critical error occurred. Please contact support."
  variant="error"
  duration={0}
  show={showError}
  onDismiss={() => setShowError(false)}
/>
```

### Info Toast

```tsx
<Toast
  message="New features available in the latest update"
  variant="info"
  show={showInfo}
  onDismiss={() => setShowInfo(false)}
/>
```

### Toast with Custom Duration

```tsx
<Toast
  message="Processing your request..."
  variant="info"
  duration={10000}
  show={isProcessing}
  onDismiss={() => setIsProcessing(false)}
/>
```

### Toast with Custom Styling

```tsx
<Toast
  message="Custom styled toast"
  variant="success"
  show={showCustom}
  onDismiss={() => setShowCustom(false)}
  className="top-8 right-8 max-w-md"
  aria-label="Custom notification"
/>
```

## 🎨 Variants

### ✅ Success

- **Use Case**: Confirmations, successful actions, positive feedback
- **Colors**: Green background with green border and text
- **Icon**: Checkmark circle
- **States**: Auto-dismiss after 5 seconds (default)

### ❌ Error

- **Use Case**: Errors, failures, critical issues
- **Colors**: Red background with red border and text
- **Icon**: X circle
- **States**: Often requires manual dismiss (duration=0)

### ℹ️ Info

- **Use Case**: General information, tips, neutral messages
- **Colors**: Blue background with blue border and text
- **Icon**: Information circle
- **States**: Auto-dismiss after 5 seconds (default)

### ⚠️ Warning

- **Use Case**: Warnings, important notices, caution messages
- **Colors**: Yellow background with yellow border and text
- **Icon**: Warning triangle
- **States**: Auto-dismiss after 5 seconds (default)

## ⏰ Duration Behavior

### Auto-Dismiss (Default)

```tsx
// Dismisses automatically after 5 seconds
<Toast message="Success!" variant="success" show={show} onDismiss={onDismiss} />
```

### Custom Duration

```tsx
// Dismisses after 3 seconds
<Toast
  message="Quick notice"
  duration={3000}
  show={show}
  onDismiss={onDismiss}
/>
```

### Manual Dismiss Only

```tsx
// Requires user to click close button
<Toast
  message="Important message"
  duration={0}
  show={show}
  onDismiss={onDismiss}
/>
```

### No Auto-Dismiss

```tsx
// Stays visible until manually dismissed
<Toast
  message="Persistent notification"
  duration={0}
  show={show}
  onDismiss={onDismiss}
/>
```

## 🎭 Animations

### Slide-In Animation

- **Direction**: Slides in from the right
- **Duration**: 300ms
- **Easing**: `ease-in-out`
- **CSS**: `transform: translateX(0)` with `opacity: 1`

### Fade-Out Animation

- **Direction**: Slides out to the right while fading
- **Duration**: 300ms
- **Easing**: `ease-in-out`
- **CSS**: `transform: translateX(100%)` with `opacity: 0`

### Animation States

```css
/* Visible state */
.transform.transition-all.duration-300 {
  transform: translateX(0);
  opacity: 1;
}

/* Hidden state */
.transform.transition-all.duration-300 {
  transform: translateX(100%);
  opacity: 0;
}
```

## 📚 Stacking Multiple Toasts

### Basic Stacking

```tsx
function ToastStack() {
  const [toasts, setToasts] = useState([]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => removeToast(toast.id)}
          className={`top-${4 + index * 16}`}
        />
      ))}
    </div>
  );
}
```

### Offset Positioning

```tsx
// Each toast positioned with offset
{
  toasts.map((toast, index) => (
    <Toast
      key={toast.id}
      message={toast.message}
      variant={toast.variant}
      show={toast.show}
      onDismiss={() => removeToast(toast.id)}
      className={`top-${4 + index * 20}`}
    />
  ));
}
```

## ♿ Accessibility

### ARIA Support

- **Role**: `alert` for immediate screen reader announcement
- **Live Region**: `aria-live="polite"` for non-intrusive updates
- **Labeling**: `aria-label` for custom descriptions

### Screen Reader Support

- **Announcement**: Screen readers announce toast content immediately
- **Context**: Clear indication of toast type and purpose
- **Dismissal**: Close button properly labeled for screen readers

### Keyboard Navigation

- **Focus Management**: Close button receives focus when present
- **Escape Key**: Consider adding ESC key support for dismissal
- **Tab Order**: Proper tab order for interactive elements

### Implementation

```tsx
<div role="alert" aria-live="polite" aria-label="Success notification">
  {/* Toast content */}
</div>
```

## 🎨 Styling

### Design System Integration

- **Colors**: Consistent with brand colors (green, red, blue, yellow)
- **Typography**: Consistent font weights and sizes
- **Spacing**: Follows 4px grid system (p-4, mr-3)
- **Border Radius**: Rounded-lg for modern appearance
- **Shadows**: Shadow-lg for prominence

### Dark Mode Support

```css
/* Light mode */
bg-green-50 border-green-200 text-green-800

/* Dark mode */
dark:bg-green-900/20 dark:border-green-800 dark:text-green-200
```

### Custom Positioning

```tsx
<Toast
  message="Custom positioned toast"
  show={show}
  onDismiss={onDismiss}
  className="top-8 right-8 max-w-md"
/>
```

## 🔌 Integration Examples

### Form Validation Toast

```tsx
function ContactForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
      setShowSuccess(true);
    } catch (error) {
      setShowError(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>{/* Form fields */}</form>

      <Toast
        message="Form submitted successfully!"
        variant="success"
        show={showSuccess}
        onDismiss={() => setShowSuccess(false)}
      />

      <Toast
        message="Failed to submit form. Please try again."
        variant="error"
        show={showError}
        onDismiss={() => setShowError(false)}
      />
    </>
  );
}
```

### API Response Toast

```tsx
function DataManager() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, variant, duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      { id, message, variant, duration, show: true },
    ]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleApiCall = async () => {
    try {
      await apiCall();
      showToast("Data saved successfully!", "success");
    } catch (error) {
      showToast("Failed to save data", "error", 0); // Manual dismiss
    }
  };

  return (
    <>
      <button onClick={handleApiCall}>Save Data</button>

      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          show={toast.show}
          onDismiss={() => removeToast(toast.id)}
          className={`top-${4 + index * 20}`}
        />
      ))}
    </>
  );
}
```

### Session Management Toast

```tsx
function SessionManager() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWarning(true);
    }, 25 * 60 * 1000); // 25 minutes

    return () => clearTimeout(timer);
  }, []);

  return (
    <Toast
      message="Your session will expire in 5 minutes. Click here to extend."
      variant="warning"
      duration={0}
      show={showWarning}
      onDismiss={() => setShowWarning(false)}
    />
  );
}
```

## 🧠 Best Practices

### 1. **Clear, Actionable Messages**

```tsx
// ✅ Good: Clear and actionable
<Toast message="Password updated successfully" variant="success" />
<Toast message="Please check your email and try again" variant="error" />

// ❌ Avoid: Vague or unclear messages
<Toast message="Done" variant="success" />
<Toast message="Error" variant="error" />
```

### 2. **Appropriate Durations**

```tsx
// ✅ Good: Appropriate durations for message types
<Toast message="Saved!" variant="success" duration={3000} />
<Toast message="Critical error" variant="error" duration={0} />

// ❌ Avoid: Inappropriate durations
<Toast message="Quick success" variant="success" duration={10000} />
<Toast message="Important error" variant="error" duration={2000} />
```

### 3. **Consistent Positioning**

```tsx
// ✅ Good: Consistent positioning
<Toast className="top-4 right-4" />
<Toast className="top-20 right-4" />

// ❌ Avoid: Inconsistent positioning
<Toast className="top-4 right-4" />
<Toast className="bottom-4 left-4" />
```

### 4. **Proper Variant Usage**

```tsx
// ✅ Good: Variants match message type
<Toast message="Success!" variant="success" />
<Toast message="Error occurred" variant="error" />
<Toast message="Information" variant="info" />
<Toast message="Warning" variant="warning" />

// ❌ Avoid: Incorrect variant usage
<Toast message="Success!" variant="error" />
<Toast message="Error" variant="success" />
```

## 🔮 Future Enhancements

### Planned Features

- **Progress Bars**: Visual countdown for auto-dismiss
- **Action Buttons**: Built-in action buttons (undo, retry)
- **Rich Content**: Support for HTML content and links
- **Position Variants**: Top, bottom, left, right positioning
- **Animation Variants**: Different animation styles

### Advanced Features

- **Toast Manager**: Global toast state management
- **Queue System**: Automatic queuing of multiple toasts
- **Custom Icons**: Support for custom icon components
- **Sound Effects**: Audio feedback for different variants
- **Gesture Support**: Swipe to dismiss on mobile

## 📈 Performance Considerations

- **Lightweight**: Minimal DOM footprint
- **CSS Animations**: GPU-accelerated transforms
- **Efficient Rendering**: Only renders when visible
- **Memory Management**: Proper cleanup of timers
- **Bundle Size**: No external dependencies

## ⚙️ Configuration Requirements

### TypeScript Configuration

The Toast component requires the same TypeScript configuration as other components:

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

The Toast component is a cornerstone of the Flying Fox Solutions notification UI system, providing a consistent, accessible, and highly reusable foundation for all user feedback. With its comprehensive variant system, flexible duration options, and seamless animation support, it enables rapid development of professional, user-friendly notification experiences across all applications in the template library.

**Key Benefits:**

- 🎯 **Consistency**: Unified notification behavior across all applications
- ♿ **Accessibility**: WCAG compliant with full screen reader support
- 🔧 **Flexibility**: Multiple variants and duration options
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Lightweight with CSS-only animations
- 🌙 **Modern**: Dark mode and modern design patterns
- 🎭 **Smooth**: Professional animations with GPU acceleration
- 📚 **Stackable**: Support for multiple simultaneous notifications
