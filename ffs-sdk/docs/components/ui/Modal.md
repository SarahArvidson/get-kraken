# 🪟 Modal Component

The Modal is a foundational atomic component of the Flying Fox Solutions Template Library, designed to serve as the primary overlay dialog for all modal interactions across forms, confirmations, and content display.

## ✨ Overview

Modal provides a consistent, accessible, and fully-featured overlay component that supports focus trapping, keyboard navigation, and responsive design. It's built with accessibility-first principles and follows the established design language of the Flying Fox Solutions template system.

## 🎯 Key Features

- **🎯 Focus Management**: Automatic focus trap and restoration
- **⌨️ Keyboard Navigation**: ESC key close and full keyboard support
- **🖱️ Click Interactions**: Click-outside-to-close functionality
- **📏 Multiple Sizes**: Small, medium, and large size variants
- **♿ Full Accessibility**: ARIA attributes, screen reader support, and keyboard navigation
- **🌙 Dark Mode**: Complete dark theme compatibility
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **⚡ Performance**: Lightweight with no external dependencies
- **🔧 Highly Configurable**: Extensive prop system for customization

## 📁 Location

`components/ui/Modal.tsx`

## 📦 Props

| Name                  | Type                   | Required | Default | Description                                |
| --------------------- | ---------------------- | -------- | ------- | ------------------------------------------ |
| `isOpen`              | `boolean`              | ✅       | —       | Whether the modal is open                  |
| `onClose`             | `() => void`           | ✅       | —       | Function called when modal should close    |
| `children`            | `React.ReactNode`      | ✅       | —       | Modal content                              |
| `title`               | `string`               | ❌       | —       | Title for the modal header                 |
| `size`                | `"sm" \| "md" \| "lg"` | ❌       | `"md"`  | Size variant of the modal                  |
| `closeOnOverlayClick` | `boolean`              | ❌       | `true`  | Whether to close when clicking overlay     |
| `closeOnEscape`       | `boolean`              | ❌       | `true`  | Whether to close on ESC key                |
| `className`           | `string`               | ❌       | —       | Additional CSS classes for modal container |
| `contentClassName`    | `string`               | ❌       | —       | Additional CSS classes for modal content   |
| `ariaLabel`           | `string`               | ❌       | —       | Custom aria-label (defaults to title)      |

## 🛠️ Usage Examples

### Basic Modal

```tsx
import Modal from "@ffx/components/ui/Modal";

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
</Modal>;
```

### Modal with Custom Content

```tsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Profile"
  size="lg"
>
  <form>
    <InputField
      type="text"
      label="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    <div className="flex gap-2 justify-end mt-4">
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
    </div>
  </form>
</Modal>
```

### Modal Without Title

```tsx
<Modal
  isOpen={isImageOpen}
  onClose={() => setIsImageOpen(false)}
  size="lg"
  closeOnOverlayClick={false}
>
  <img src="/large-image.jpg" alt="Full size image" />
</Modal>
```

### Confirmation Dialog

```tsx
<Modal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete Item"
  size="sm"
>
  <div className="space-y-4">
    <p className="text-gray-600 dark:text-gray-400">
      This action cannot be undone. Are you sure you want to delete this item?
    </p>
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" onClick={() => setShowConfirm(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  </div>
</Modal>
```

## 📏 Sizes

### Small (`sm`)

- **Max Width**: `max-w-md` (448px)
- **Use Case**: Confirmation dialogs, simple forms, alerts

### Medium (`md`) - Default

- **Max Width**: `max-w-lg` (512px)
- **Use Case**: General purpose, most common size

### Large (`lg`)

- **Max Width**: `max-w-2xl` (672px)
- **Use Case**: Complex forms, image viewers, detailed content

## 🔄 Behavior

### 📋 Focus Management

- **Focus Trap**: Keyboard navigation stays within modal
- **Focus Restoration**: Returns focus to trigger element on close
- **Initial Focus**: First focusable element receives focus when opened

### ⌨️ Keyboard Support

- **ESC Key**: Closes modal (configurable)
- **Tab Navigation**: Cycles through focusable elements
- **Shift+Tab**: Reverse tab navigation with wraparound

### 🖱️ Mouse Interactions

- **Overlay Click**: Closes modal when clicking backdrop (configurable)
- **Content Click**: Prevents modal from closing when clicking content
- **Close Button**: X button in header for explicit close action

### 🚫 Scroll Prevention

- **Body Lock**: Prevents background scrolling when modal is open
- **Restoration**: Automatically restores scrolling when modal closes

## ♿ Accessibility

### ARIA Support

- **Role**: `dialog` for proper screen reader announcement
- **Modal**: `aria-modal="true"` indicates modal behavior
- **Labeling**: `aria-labelledby` links to title or custom `aria-label`
- **Focus Management**: Proper focus indicators and keyboard navigation

### Screen Reader Support

- **Announcement**: Screen readers announce modal opening
- **Content**: All modal content is accessible to screen readers
- **Close Actions**: Close button and ESC key are properly announced

### Keyboard Navigation

- **Tab Order**: Logical focus flow within modal
- **Escape Key**: Standard close action
- **Focus Indicators**: Clear visual feedback for keyboard users

## 🎨 Styling

### Design System Integration

- **Colors**: White background with gray borders in light mode
- **Typography**: Consistent font weights and sizes
- **Spacing**: Follows 4px grid system (p-6, gap-2)
- **Border Radius**: Rounded-lg for modern appearance
- **Shadows**: Shadow-xl for depth and prominence

### Dark Mode Support

```css
/* Light mode */
bg-white border-gray-200 text-gray-900

/* Dark mode */
dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
```

### Backdrop Styling

- **Overlay**: Semi-transparent black background
- **Animation**: Smooth transition effects
- **Z-Index**: High z-index (z-50) to appear above all content

## 🔌 Integration Examples

### Form Modal

```tsx
function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Us" size="md">
      <form className="space-y-4">
        <InputField
          type="text"
          label="Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
        <InputField
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
        <InputField
          type="text"
          label="Message"
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          helperText="Tell us how we can help"
          required
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Send Message
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

### Image Viewer Modal

```tsx
function ImageModal({ isOpen, onClose, imageSrc, imageAlt }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={false}
      ariaLabel="Image viewer"
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-auto rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
          aria-label="Close image viewer"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </Modal>
  );
}
```

### Settings Modal

```tsx
function SettingsModal({ isOpen, onClose, settings, onSave }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Theme
          </h3>
          <select className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Notifications
          </h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Email notifications
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Push notifications
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

## 🧠 Best Practices

### 1. **Clear Titles**

```tsx
// ✅ Good: Descriptive, clear titles
<Modal title="Delete Account" />
<Modal title="Edit Profile" />
<Modal title="Upload File" />

// ❌ Avoid: Vague or unclear titles
<Modal title="Action" />
<Modal title="Modal" />
```

### 2. **Appropriate Sizes**

```tsx
// ✅ Good: Size matches content complexity
<Modal size="sm">Simple confirmation</Modal>
<Modal size="md">Standard form</Modal>
<Modal size="lg">Complex data entry</Modal>

// ❌ Avoid: Oversized modals for simple content
<Modal size="lg">OK button only</Modal>
```

### 3. **Proper Close Handling**

```tsx
// ✅ Good: Clear close actions
<Modal onClose={() => setIsOpen(false)}>
  <Button onClick={() => setIsOpen(false)}>Cancel</Button>
</Modal>

// ❌ Avoid: Unclear or missing close actions
<Modal onClose={onClose}>
  <Button onClick={someOtherAction}>Close</Button>
</Modal>
```

### 4. **Accessibility First**

```tsx
// ✅ Good: Proper labeling and focus management
<Modal
  title="Confirm Action"
  ariaLabel="Confirmation dialog"
  onClose={handleClose}
>
  {/* Modal content */}
</Modal>

// ❌ Avoid: Missing accessibility attributes
<Modal onClose={onClose}>
  {/* Modal content without proper labeling */}
</Modal>
```

## 🔮 Future Enhancements

### Planned Features

- **Animation Variants**: Slide, fade, and scale animations
- **Position Variants**: Top, center, bottom positioning
- **Nested Modals**: Support for modal stacking
- **Modal Manager**: Global modal state management
- **Custom Backdrop**: Configurable backdrop styles

### Advanced Features

- **Portal Rendering**: Render outside component tree
- **Drag Support**: Draggable modal windows
- **Resize Support**: Resizable modal windows
- **Auto-close Timer**: Automatic close after delay
- **Progress Indicators**: Loading states for async operations

## 📈 Performance Considerations

- **Conditional Rendering**: Only renders when `isOpen` is true
- **Event Cleanup**: Proper cleanup of event listeners
- **Focus Management**: Efficient focus trap implementation
- **Memory Usage**: Minimal memory footprint

## ⚙️ Configuration Requirements

### TypeScript Configuration

The Modal component requires the same TypeScript configuration as other components:

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

The Modal component is a cornerstone of the Flying Fox Solutions overlay UI system, providing a consistent, accessible, and highly reusable foundation for all modal interactions. With its comprehensive focus management, keyboard support, and seamless integration capabilities, it enables rapid development of professional, user-friendly modal experiences across all applications in the template library.

**Key Benefits:**

- 🎯 **Consistency**: Unified modal behavior across all applications
- ♿ **Accessibility**: WCAG compliant with full screen reader support
- 🔧 **Flexibility**: Multiple sizes and configuration options
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Lightweight with efficient focus management
- 🌙 **Modern**: Dark mode and modern design patterns
- ⌨️ **Interactive**: Full keyboard navigation and focus trapping
