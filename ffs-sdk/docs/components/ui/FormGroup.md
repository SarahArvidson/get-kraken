# 📝 FormGroup Component

The FormGroup is a foundational atomic component of the Flying Fox Solutions Template Library, designed to serve as the primary wrapper for all form controls, providing consistent layout, accessibility, and validation messaging.

## ✨ Overview

FormGroup provides a consistent, accessible, and fully-featured wrapper that handles label-to-input associations, description text, error messaging, and proper ARIA attributes. It's built with accessibility-first principles and follows the established design language of the Flying Fox Solutions template system.

## 🎯 Key Features

- **🏷️ Automatic Label Linking**: Seamless label-to-input associations via `htmlFor`
- **📝 Description Support**: Optional helper text below labels
- **⚠️ Error Handling**: Built-in error display with proper ARIA attributes
- **♿ Full Accessibility**: ARIA linking, role="alert", and screen reader support
- **🌙 Dark Mode**: Complete dark theme compatibility
- **🔧 Flexible Children**: Supports any form control (InputField, select, textarea, etc.)
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **⚡ Performance**: Lightweight with minimal DOM overhead

## 📁 Location

`components/ui/FormGroup.tsx`

## 📦 Props

| Name                   | Type              | Required | Default | Description                                         |
| ---------------------- | ----------------- | -------- | ------- | --------------------------------------------------- |
| `label`                | `string`          | ✅       | —       | Label text for the form control                     |
| `children`             | `React.ReactNode` | ✅       | —       | Form control element(s) to wrap                     |
| `htmlFor`              | `string`          | ❌       | —       | HTML for attribute (auto-generated if not provided) |
| `description`          | `string`          | ❌       | —       | Optional description text below the label           |
| `error`                | `string`          | ❌       | —       | Error message to display                            |
| `required`             | `boolean`         | ❌       | `false` | Whether the field is required                       |
| `className`            | `string`          | ❌       | —       | Additional CSS classes for container                |
| `labelClassName`       | `string`          | ❌       | —       | Additional CSS classes for label                    |
| `descriptionClassName` | `string`          | ❌       | —       | Additional CSS classes for description              |
| `errorClassName`       | `string`          | ❌       | —       | Additional CSS classes for error message            |

## 🛠️ Usage Examples

### Basic FormGroup

```tsx
import FormGroup from "@ffx/components/ui/FormGroup";
import InputField from "@ffx/components/ui/InputField";

<FormGroup label="Email Address">
  <InputField
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
  />
</FormGroup>;
```

### FormGroup with Description

```tsx
<FormGroup
  label="Password"
  description="Must be at least 8 characters long"
  required
>
  <InputField
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
  />
</FormGroup>
```

### FormGroup with Error

```tsx
<FormGroup
  label="Email Address"
  error="Please enter a valid email address"
  required
>
  <InputField
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
  />
</FormGroup>
```

### FormGroup with Select

```tsx
<FormGroup label="Country" description="Select your country of residence">
  <select
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  >
    <option value="">Choose a country</option>
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="uk">United Kingdom</option>
  </select>
</FormGroup>
```

### FormGroup with Textarea

```tsx
<FormGroup label="Message" description="Tell us how we can help you" required>
  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    rows={4}
    placeholder="Enter your message here..."
    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
  />
</FormGroup>
```

### FormGroup with Custom HTML For

```tsx
<FormGroup
  label="Username"
  htmlFor="custom-username"
  description="This will be your unique identifier"
>
  <InputField
    type="text"
    id="custom-username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="Choose a username"
  />
</FormGroup>
```

## 🔗 ARIA Integration

### Automatic Linking

FormGroup automatically creates proper ARIA associations:

- **Label → Input**: Uses `htmlFor` and `id` for proper labeling
- **Description**: Links via `aria-describedby` for helper text
- **Error**: Links via `aria-describedby` and uses `role="alert"`

### Generated IDs

```tsx
// FormGroup automatically generates unique IDs
<FormGroup label="Email">
  <InputField type="email" />
  {/* Results in:
   * <label htmlFor=":r1:">Email</label>
   * <input id=":r1:" aria-describedby=":r1:-description" />
   * <p id=":r1:-description">Description text</p>
   */}
</FormGroup>
```

### Error Handling

```tsx
<FormGroup label="Email" error="Invalid email format">
  <InputField type="email" />
  {/* Results in:
   * <label htmlFor=":r2:">Email</label>
   * <input id=":r2:" aria-describedby=":r2:-error" aria-invalid="true" />
   * <p id=":r2:-error" role="alert">Invalid email format</p>
   */}
</FormGroup>
```

## 🎨 Styling

### Design System Integration

- **Typography**: Consistent font weights and sizes
- **Colors**: Gray text hierarchy with red error states
- **Spacing**: Follows 4px grid system (mt-1, mt-2)
- **Required Indicator**: Red asterisk for required fields

### Dark Mode Support

```css
/* Light mode */
text-gray-900 text-gray-600 text-red-600

/* Dark mode */
dark:text-gray-100 dark:text-gray-400 dark:text-red-400
```

### Custom Styling

```tsx
<FormGroup
  label="Custom Field"
  className="mb-6"
  labelClassName="text-lg font-bold"
  descriptionClassName="text-blue-600"
  errorClassName="text-red-700 font-semibold"
>
  <InputField type="text" />
</FormGroup>
```

## 🔌 Integration Examples

### Complete Form

```tsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  return (
    <form className="space-y-6">
      <FormGroup label="Full Name" error={errors.name} required>
        <InputField
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter your full name"
        />
      </FormGroup>

      <FormGroup
        label="Email Address"
        description="We'll use this to contact you"
        error={errors.email}
        required
      >
        <InputField
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="you@example.com"
        />
      </FormGroup>

      <FormGroup label="Message" error={errors.message} required>
        <textarea
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          rows={4}
          placeholder="How can we help you?"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </FormGroup>

      <Button type="submit" fullWidth>
        Send Message
      </Button>
    </form>
  );
}
```

### Dynamic Form Fields

```tsx
function DynamicForm() {
  const [fields, setFields] = useState([
    { id: 1, label: "First Name", value: "", error: "" },
    { id: 2, label: "Last Name", value: "", error: "" },
  ]);

  return (
    <form className="space-y-4">
      {fields.map((field) => (
        <FormGroup key={field.id} label={field.label} error={field.error}>
          <InputField
            type="text"
            value={field.value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
          />
        </FormGroup>
      ))}
    </form>
  );
}
```

### Conditional Error Display

```tsx
function ConditionalForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const emailError =
    touched && !email.includes("@")
      ? "Please enter a valid email address"
      : undefined;

  return (
    <FormGroup label="Email" error={emailError} required>
      <InputField
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="you@example.com"
      />
    </FormGroup>
  );
}
```

## 🧠 Best Practices

### 1. **Clear Labels**

```tsx
// ✅ Good: Descriptive, clear labels
<FormGroup label="Email Address">
<FormGroup label="Password">
<FormGroup label="Confirm Password">

// ❌ Avoid: Vague or unclear labels
<FormGroup label="Input">
<FormGroup label="Field">
<FormGroup label="Data">
```

### 2. **Helpful Descriptions**

```tsx
// ✅ Good: Useful, specific descriptions
<FormGroup
  label="Password"
  description="Must be at least 8 characters with numbers and symbols"
>

// ❌ Avoid: Unhelpful or generic descriptions
<FormGroup
  label="Password"
  description="Enter password"
>
```

### 3. **Proper Error Handling**

```tsx
// ✅ Good: Clear, actionable error messages
<FormGroup
  label="Email"
  error="Please enter a valid email address"
>

// ❌ Avoid: Vague or unhelpful error messages
<FormGroup
  label="Email"
  error="Error"
>
```

### 4. **Consistent Required Indicators**

```tsx
// ✅ Good: Consistent required field marking
<FormGroup label="Email" required>
<FormGroup label="Password" required>
<FormGroup label="Name"> {/* Optional field */}

// ❌ Avoid: Inconsistent required field marking
<FormGroup label="Email" required>
<FormGroup label="Password"> {/* Should be required */}
```

### 5. **Accessibility First**

```tsx
// ✅ Good: Proper ARIA attributes and associations
<FormGroup
  label="Email"
  description="We'll never share your email"
  error={emailError}
>
  <InputField type="email" />
</FormGroup>

// ❌ Avoid: Missing accessibility attributes
<FormGroup label="Email">
  <InputField type="email" />
</FormGroup>
```

## 🔮 Future Enhancements

### Planned Features

- **Field Groups**: Support for grouped related fields
- **Conditional Fields**: Built-in conditional rendering
- **Validation Integration**: Built-in validation rules
- **Custom Validators**: Support for custom validation functions
- **Field Dependencies**: Support for dependent field validation

### Advanced Features

- **Form State Management**: Built-in form state handling
- **Field Arrays**: Support for dynamic field arrays
- **Nested Forms**: Support for nested form structures
- **Real-time Validation**: Live validation as user types
- **Custom Error Components**: Support for custom error displays

## 📈 Performance Considerations

- **Minimal DOM**: Lightweight wrapper with minimal overhead
- **Efficient Rendering**: Only re-renders when props change
- **ID Generation**: Uses React's useId for efficient ID generation
- **Memory Usage**: Minimal memory footprint

## ⚙️ Configuration Requirements

### TypeScript Configuration

The FormGroup component requires the same TypeScript configuration as other components:

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

The FormGroup component is a cornerstone of the Flying Fox Solutions form UI system, providing a consistent, accessible, and highly reusable foundation for all form controls. With its comprehensive ARIA integration, flexible children support, and seamless validation handling, it enables rapid development of professional, user-friendly forms across all applications in the template library.

**Key Benefits:**

- 🎯 **Consistency**: Unified form layout and behavior across all applications
- ♿ **Accessibility**: WCAG compliant with automatic ARIA associations
- 🔧 **Flexibility**: Supports any form control as children
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Lightweight with minimal DOM overhead
- 🌙 **Modern**: Dark mode and modern design patterns
- 🏷️ **Automatic**: Handles label linking and ID generation automatically
