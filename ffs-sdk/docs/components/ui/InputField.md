# 🔧 InputField Component

The InputField is the foundational atomic component of the Flying Fox Solutions Template Library, designed to serve as the primary building block for all form inputs across authentication, onboarding, billing, and feedback flows.

## ✨ Overview

InputField provides a consistent, accessible, and fully-featured input component that can handle text, email, password, number, and other input types. It's built with accessibility-first principles and follows the established design language of the Flying Fox Solutions template system.

## 🎯 Key Features

- **📝 Multiple Input Types**: Supports text, email, password, number, tel, url, and more
- **♿ Full Accessibility**: ARIA labels, error announcements, and keyboard navigation
- **🌙 Dark Mode**: Complete dark theme compatibility
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **✅ Validation States**: Visual feedback for error, success, and default states
- **🎨 Consistent Styling**: Matches the design language of existing auth components
- **🔧 Highly Configurable**: Extensive prop system for customization
- **⚡ Performance**: Lightweight with no external dependencies

## 📁 Location

`components/ui/InputField.tsx`

## 📦 Props

| Name             | Type                                         | Required | Default        | Description                                           |
| ---------------- | -------------------------------------------- | -------- | -------------- | ----------------------------------------------------- |
| `label`          | `string`                                     | ✅       | —              | Text label for the input field                        |
| `type`           | `string`                                     | ❌       | `"text"`       | HTML input type (text, email, password, number, etc.) |
| `value`          | `string \| number`                           | ❌       | —              | Controlled input value                                |
| `onChange`       | `(e: ChangeEvent<HTMLInputElement>) => void` | ❌       | —              | Change handler function                               |
| `placeholder`    | `string`                                     | ❌       | —              | Placeholder text                                      |
| `error`          | `string`                                     | ❌       | —              | Error message to display                              |
| `helperText`     | `string`                                     | ❌       | —              | Helper text (shown when no error)                     |
| `id`             | `string`                                     | ❌       | auto-generated | Custom ID for the input                               |
| `className`      | `string`                                     | ❌       | —              | Additional CSS classes for container                  |
| `inputClassName` | `string`                                     | ❌       | —              | Additional CSS classes for input element              |
| `required`       | `boolean`                                    | ❌       | —              | Whether the field is required                         |
| `disabled`       | `boolean`                                    | ❌       | —              | Whether the field is disabled                         |
| `autoComplete`   | `string`                                     | ❌       | —              | HTML autocomplete attribute                           |
| `...rest`        | `HTMLInputAttributes`                        | ❌       | —              | All other standard input props                        |

## 🛠️ Usage Examples

### Basic Text Input

```tsx
import InputField from "@ffx/components/ui/InputField";

<InputField
  type="text"
  label="Full Name"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  placeholder="Enter your full name"
/>;
```

### Email Input with Validation

```tsx
<InputField
  type="email"
  label="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  placeholder="you@example.com"
  autoComplete="email"
  required
/>
```

### Password Input with Helper Text

```tsx
<InputField
  type="password"
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  helperText="Must be at least 8 characters long"
  autoComplete="new-password"
  required
/>
```

### Number Input for Forms

```tsx
<InputField
  type="number"
  label="Age"
  value={age}
  onChange={(e) => setAge(e.target.value)}
  placeholder="25"
  min="0"
  max="120"
/>
```

## 🔄 States

### 📋 Default State

- Clean, professional appearance
- Gray border with subtle shadow
- Focus ring in indigo color

### ❌ Error State

- Red border and ring
- Error message displayed below
- `aria-invalid="true"` for screen readers
- `role="alert"` on error message

### ✅ Success State

- Green border and ring (when value exists and no error)
- Visual confirmation of valid input

### 🚫 Disabled State

- Reduced opacity
- Grayed out appearance
- Cursor changes to not-allowed

### 🔄 Loading State

- Can be combined with disabled prop
- Maintains visual hierarchy

## ♿ Accessibility

### ARIA Support

- **Labels**: Proper `htmlFor` and `id` association
- **Error Announcements**: `role="alert"` on error messages
- **State Communication**: `aria-invalid` for validation states
- **Descriptive Text**: `aria-describedby` links to helper/error text

### Keyboard Navigation

- Full keyboard accessibility
- Tab order follows logical flow
- Enter key submits forms (when in form context)
- Escape key clears focus

### Screen Reader Support

- All text is announced properly
- Error states are communicated immediately
- Required fields are indicated with asterisk

## 🎨 Styling

### Design System Integration

- **Colors**: Indigo primary, gray secondary, red error, green success
- **Typography**: Consistent with existing auth components
- **Spacing**: Follows 4px grid system (mt-1, px-3, py-2)
- **Border Radius**: Rounded-lg for modern appearance
- **Shadows**: Subtle shadow-sm for depth

### Dark Mode Support

```css
/* Light mode */
bg-white border-gray-300 text-gray-900

/* Dark mode */
dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
```

### Customization

```tsx
<InputField
  label="Custom Styled Input"
  className="mb-4" // Container styles
  inputClassName="text-lg font-bold" // Input-specific styles
  // ... other props
/>
```

## 🔌 Integration Examples

### Replacing Existing Input Components

**Before (LoginForm):**

```tsx
const Input = React.forwardRef<HTMLInputElement, {...}>(
  function Input({ label, id, error, className, ...rest }, ref) {
    // ... existing implementation
  }
);
```

**After (with InputField):**

```tsx
import InputField from "@ffx/components/ui/InputField";

// In LoginForm component:
<InputField
  type="email"
  label="Email"
  placeholder="you@example.com"
  autoComplete="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  inputMode="email"
  required
/>;
```

### Form Library Integration

```tsx
import { useForm } from "react-hook-form";
import InputField from "@ffx/components/ui/InputField";

function MyForm() {
  const {
    register,
    formState: { errors },
  } = useForm();

  return (
    <InputField
      {...register("email", { required: "Email is required" })}
      label="Email"
      type="email"
      error={errors.email?.message}
    />
  );
}
```

### Controlled Component Usage

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  return (
    <form>
      <InputField
        type="text"
        label="Name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        error={errors.name}
        required
      />

      <InputField
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        error={errors.email}
        required
      />

      <InputField
        type="text"
        label="Message"
        value={formData.message}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, message: e.target.value }))
        }
        error={errors.message}
        helperText="Tell us about your project"
        required
      />
    </form>
  );
}
```

## 🧠 Best Practices

### 1. **Consistent Labeling**

```tsx
// ✅ Good: Clear, descriptive labels
<InputField label="Email Address" />
<InputField label="Password" />
<InputField label="Phone Number" />

// ❌ Avoid: Vague or unclear labels
<InputField label="Input" />
<InputField label="Data" />
```

### 2. **Proper Error Handling**

```tsx
// ✅ Good: Specific, actionable error messages
<InputField
  error="Please enter a valid email address"
  helperText="We'll never share your email"
/>

// ❌ Avoid: Generic or unhelpful errors
<InputField error="Invalid" />
```

### 3. **Accessibility First**

```tsx
// ✅ Good: Always include proper attributes
<InputField
  label="Email"
  type="email"
  autoComplete="email"
  required
  aria-describedby="email-help"
/>
```

### 4. **Consistent Styling**

```tsx
// ✅ Good: Use className for layout, inputClassName for input-specific styles
<InputField
  className="mb-4" // Container spacing
  inputClassName="text-lg" // Input-specific styling
/>
```

## 🔮 Future Enhancements

### Planned Features

- **Icon Support**: Left/right icons for enhanced UX
- **Character Counter**: For textarea and text inputs with limits
- **Password Strength Indicator**: Visual feedback for password requirements
- **Autocomplete Suggestions**: Dropdown integration for search inputs
- **File Upload**: Support for file input types
- **Currency Input**: Specialized number formatting
- **Phone Input**: Country code and formatting support

### Advanced Features

- **Validation Rules**: Built-in validation with custom rules
- **Async Validation**: Real-time validation with API calls
- **Masking**: Input formatting (phone, credit card, etc.)
- **Multi-language**: Internationalization support
- **Analytics**: Built-in event tracking for form interactions

## 📈 Performance Considerations

- **Lightweight**: No external dependencies
- **Tree Shaking**: Only imports what you use
- **Memoization**: Consider wrapping in React.memo for large forms
- **Bundle Size**: Minimal impact on bundle size

## ⚙️ Configuration Requirements

### TypeScript Configuration

The InputField component requires proper TypeScript configuration for the `@ffx` alias to work correctly:

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

The InputField component is the cornerstone of the Flying Fox Solutions form system, providing a consistent, accessible, and highly reusable foundation for all user input needs. With its comprehensive prop system, built-in accessibility features, and seamless integration with existing components, it enables rapid development of professional, user-friendly forms across all applications in the template library.

**Key Benefits:**

- 🎯 **Consistency**: Unified look and feel across all forms
- ♿ **Accessibility**: WCAG compliant out of the box
- 🔧 **Flexibility**: Extensive customization options
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Lightweight and fast
- 🌙 **Modern**: Dark mode and modern design patterns
