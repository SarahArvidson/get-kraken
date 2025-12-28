# 🔐 AuthPanel Component

The AuthPanel is a comprehensive blueprint component of the Flying Fox Solutions Template Library, designed to serve as a complete authentication solution that combines multiple atomic components into a production-ready login, signup, and password reset flow.

## ✨ Overview

AuthPanel demonstrates the power of atomic design by composing InputField, Button, Toast, and FormGroup components into a cohesive authentication experience. It provides a complete authentication flow that can be dropped into any project with minimal configuration, showcasing how atomic components can be combined to create powerful, reusable blueprints.

## 🎯 Key Features

- **🔄 Three Authentication States**: Login, signup, and password reset flows
- **🎨 Atomic Component Composition**: Built using InputField, Button, Toast, and FormGroup
- **✅ Client-Side Validation**: Real-time validation with comprehensive error handling
- **♿ Full Accessibility**: ARIA attributes, role="form", and screen reader support
- **🎭 Toast Feedback**: Success and error notifications using Toast component
- **🌙 Dark Mode**: Complete dark theme compatibility with Tailwind CSS
- **📱 Responsive**: Mobile-first design that works on all screen sizes
- **⚡ TypeScript**: Fully typed with comprehensive interfaces
- **🔧 Flexible Configuration**: Customizable callbacks, titles, and behavior

## 📁 Location

`components/blueprints/auth/AuthPanel.tsx`

## 📦 Props

| Name              | Type                                                 | Required | Default                                         | Description                                                |
| ----------------- | ---------------------------------------------------- | -------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `onLogin`         | `(data: LoginData) => void \| Promise<void>`         | ❌       | —                                               | Callback for login form submission                         |
| `onSignUp`        | `(data: SignUpData) => void \| Promise<void>`        | ❌       | —                                               | Callback for signup form submission                        |
| `onPasswordReset` | `(data: PasswordResetData) => void \| Promise<void>` | ❌       | —                                               | Callback for password reset form submission                |
| `onRedirect`      | `(path: string) => void`                             | ❌       | —                                               | Optional redirect callback after successful authentication |
| `initialView`     | `"login" \| "signup" \| "reset"`                     | ❌       | `"login"`                                       | Initial view state                                         |
| `className`       | `string`                                             | ❌       | —                                               | Custom CSS classes for the container                       |
| `showRememberMe`  | `boolean`                                            | ❌       | `true`                                          | Whether to show the remember me checkbox                   |
| `title`           | `string`                                             | ❌       | `"Welcome to Flying Fox Solutions"`             | Custom title for the auth panel                            |
| `subtitle`        | `string`                                             | ❌       | `"Sign in to your account or create a new one"` | Custom subtitle for the auth panel                         |

## 📊 Data Types

### LoginData

```typescript
interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

### SignUpData

```typescript
interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe?: boolean;
}
```

### PasswordResetData

```typescript
interface PasswordResetData {
  email: string;
}
```

## 🛠️ Usage Examples

### Basic AuthPanel

```tsx
import AuthPanel from "@ffx/components/blueprints/auth/AuthPanel";

function App() {
  const handleLogin = async (data) => {
    // Your login logic here
    console.log("Login data:", data);
  };

  const handleSignUp = async (data) => {
    // Your signup logic here
    console.log("Signup data:", data);
  };

  const handlePasswordReset = async (data) => {
    // Your password reset logic here
    console.log("Password reset data:", data);
  };

  return (
    <AuthPanel
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onPasswordReset={handlePasswordReset}
    />
  );
}
```

### AuthPanel with Redirect

```tsx
import AuthPanel from "@ffx/components/blueprints/auth/AuthPanel";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    // Authenticate user
    await authenticateUser(data);
  };

  const handleRedirect = (path) => {
    navigate(path);
  };

  return (
    <AuthPanel
      onLogin={handleLogin}
      onRedirect={handleRedirect}
      title="Welcome Back"
      subtitle="Sign in to continue"
    />
  );
}
```

### AuthPanel with Custom Styling

```tsx
<AuthPanel
  onLogin={handleLogin}
  onSignUp={handleSignUp}
  onPasswordReset={handlePasswordReset}
  className="max-w-lg mx-auto mt-8"
  title="Access Your Account"
  subtitle="Secure authentication powered by Flying Fox Solutions"
  showRememberMe={false}
  initialView="signup"
/>
```

### AuthPanel with Error Handling

```tsx
const handleLogin = async (data) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const user = await response.json();
    // Handle successful login
  } catch (error) {
    // Error will be handled by AuthPanel's built-in error handling
    throw error;
  }
};
```

## 🔄 Authentication States

### Login State

- **Email Input**: Required, with email format validation
- **Password Input**: Required, with minimum length validation
- **Remember Me**: Optional checkbox (if enabled)
- **Actions**: Sign in button, forgot password link, sign up link

### Sign Up State

- **Email Input**: Required, with email format validation
- **Password Input**: Required, with minimum 8 characters
- **Confirm Password**: Required, must match password
- **Remember Me**: Optional checkbox (if enabled)
- **Actions**: Create account button, sign in link

### Password Reset State

- **Email Input**: Required, with email format validation
- **Actions**: Send reset email button, back to sign in link

## ✅ Validation Rules

### Email Validation

- **Required**: Email field cannot be empty
- **Format**: Must match valid email regex pattern
- **Real-time**: Validates as user types

### Password Validation

- **Required**: Password field cannot be empty
- **Length**: Minimum 8 characters
- **Real-time**: Validates as user types

### Confirm Password Validation

- **Required**: Confirm password field cannot be empty
- **Match**: Must exactly match the password field
- **Real-time**: Validates as user types

## 🎭 Toast Feedback System

### Success Messages

- **Login**: "Login successful! Redirecting..."
- **Signup**: "Account created successfully! Please sign in."
- **Password Reset**: "Password reset email sent! Check your inbox."

### Error Messages

- **Login**: "Login failed. Please check your credentials."
- **Signup**: "Sign up failed. Please try again."
- **Password Reset**: "Failed to send reset email. Please try again."

### Toast Configuration

- **Auto-dismiss**: 5 seconds for all toasts
- **Manual dismiss**: Close button available
- **Stacking**: Multiple toasts stack with offset positioning
- **Variants**: Success (green), Error (red), Info (blue), Warning (yellow)

## ♿ Accessibility Features

### ARIA Support

- **Forms**: Each form has `role="form"` and `aria-label`
- **Inputs**: Proper labeling via FormGroup component
- **Buttons**: Descriptive button text and loading states
- **Errors**: Error messages with proper ARIA attributes

### Screen Reader Support

- **Form Labels**: All inputs properly labeled
- **Error Announcements**: Errors announced via Toast component
- **Loading States**: Loading state announced via button text
- **Navigation**: Clear navigation between auth states

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through all form elements
- **Enter Key**: Submits forms when focused on submit button
- **Focus Management**: Proper focus handling during state transitions

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

### Custom Styling

```tsx
<AuthPanel
  className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800"
  title="Custom Styled Auth"
  subtitle="With custom container styling"
/>
```

## 🔌 Integration Examples

### React Router Integration

```tsx
import { useNavigate } from "react-router-dom";
import AuthPanel from "@ffx/components/blueprints/auth/AuthPanel";

function AuthPage() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    // Your authentication logic
    const user = await authenticateUser(data);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleRedirect = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <AuthPanel
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onPasswordReset={handlePasswordReset}
        onRedirect={handleRedirect}
      />
    </div>
  );
}
```

### API Integration

```tsx
const handleLogin = async (data) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  return result;
};

const handleSignUp = async (data) => {
  const { confirmPassword, ...signupData } = data;

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signupData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  return result;
};
```

### State Management Integration

```tsx
import { useDispatch } from "react-redux";
import AuthPanel from "@ffx/components/blueprints/auth/AuthPanel";

function AuthContainer() {
  const dispatch = useDispatch();

  const handleLogin = async (data) => {
    const result = await dispatch(loginUser(data));
    if (result.type.endsWith("fulfilled")) {
      // Handle successful login
    }
  };

  return (
    <AuthPanel
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onPasswordReset={handlePasswordReset}
    />
  );
}
```

## 🧠 Best Practices

### 1. **Error Handling**

```tsx
// ✅ Good: Let AuthPanel handle UI errors
const handleLogin = async (data) => {
  try {
    await authenticateUser(data);
  } catch (error) {
    // AuthPanel will show error toast
    throw error;
  }
};

// ❌ Avoid: Handling UI errors manually
const handleLogin = async (data) => {
  try {
    await authenticateUser(data);
  } catch (error) {
    // Don't show your own error UI
    setError(error.message);
  }
};
```

### 2. **Callback Implementation**

```tsx
// ✅ Good: Async callbacks for API calls
const handleLogin = async (data) => {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
};

// ✅ Good: Sync callbacks for simple operations
const handleLogin = (data) => {
  console.log("Login data:", data);
  // Simple validation or local storage
};
```

### 3. **Customization**

```tsx
// ✅ Good: Customize titles and behavior
<AuthPanel
  title="Welcome to Our Platform"
  subtitle="Sign in to access your dashboard"
  showRememberMe={false}
  initialView="signup"
/>

// ❌ Avoid: Over-customizing with CSS
<AuthPanel
  className="completely-different-styling"
  // This breaks the design system
/>
```

### 4. **Integration Patterns**

```tsx
// ✅ Good: Use with routing
const handleRedirect = (path) => {
  navigate(path);
};

// ✅ Good: Use with state management
const handleLogin = async (data) => {
  const user = await authenticateUser(data);
  dispatch(setUser(user));
};

// ✅ Good: Use with analytics
const handleLogin = async (data) => {
  await authenticateUser(data);
  analytics.track("user_login", { method: "email" });
};
```

## 🔮 Future Enhancements

### Planned Features

- **Social Login**: Integration with Google, GitHub, etc.
- **Two-Factor Authentication**: TOTP and SMS support
- **Biometric Authentication**: Fingerprint and face ID
- **Session Management**: Automatic token refresh
- **Multi-language Support**: Internationalization

### Advanced Features

- **Custom Validation Rules**: Configurable validation logic
- **Progressive Enhancement**: Works without JavaScript
- **Analytics Integration**: Built-in tracking hooks
- **A/B Testing**: Multiple layout variants
- **Custom Themes**: Beyond dark/light mode

## 📈 Performance Considerations

- **Component Composition**: Leverages atomic components for optimal reusability
- **Minimal Re-renders**: Efficient state management with useCallback
- **Lazy Loading**: Could be enhanced with code splitting
- **Bundle Size**: No external dependencies beyond atomic components
- **Memory Usage**: Proper cleanup of timers and event listeners

## ⚙️ Configuration Requirements

### TypeScript Configuration

The AuthPanel component requires the same TypeScript configuration as atomic components:

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

The AuthPanel component is a cornerstone of the Flying Fox Solutions blueprint system, demonstrating how atomic components can be composed into powerful, reusable authentication experiences. With its comprehensive validation, accessibility features, and flexible configuration options, it provides a production-ready solution that can be dropped into any project with minimal setup.

**Key Benefits:**

- 🎯 **Production Ready**: Complete authentication flow with error handling
- ♿ **Accessible**: WCAG compliant with full screen reader support
- 🔧 **Flexible**: Customizable callbacks, styling, and behavior
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Performance**: Efficient component composition and state management
- 🌙 **Modern**: Dark mode and modern design patterns
- 🎭 **User-Friendly**: Toast feedback and smooth state transitions
- 🔄 **Composable**: Built using atomic components for maximum reusability
