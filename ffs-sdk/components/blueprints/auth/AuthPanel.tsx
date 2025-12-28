import React, { useState, useCallback } from "react";
import { InputField, Button, Toast, FormGroup } from "../../ui";

/**
 * AuthPanel (Blueprint Component)
 * ------------------------------
 * A comprehensive authentication blueprint that combines multiple atomic components
 * into a complete login, signup, and password reset flow for the Flying Fox Solutions Template Library.
 *
 * This blueprint demonstrates how to compose atomic components (InputField, Button, Toast, FormGroup)
 * into a production-ready authentication experience that can be dropped into any project.
 *
 * How to reuse:
 * 1) Import it: `import { AuthPanel } from "@ffx/sdk/blueprints";`
 * 2) Use it anywhere:
 *    <AuthPanel
 *      onLogin={(data) => handleLogin(data)}
 *      onSignUp={(data) => handleSignUp(data)}
 *      onPasswordReset={(email) => handlePasswordReset(email)}
 *      onRedirect={(path) => navigate(path)}
 *    />
 *
 * Notes:
 * - Combines InputField, Button, Toast, and FormGroup atomic components
 * - Supports three authentication states: login, signup, password reset
 * - Built-in client-side validation with real-time feedback
 * - Full accessibility with ARIA attributes and screen reader support
 * - Dark mode compatible with Tailwind CSS
 * - Production-ready with comprehensive error handling
 */

export type AuthView = "login" | "signup" | "reset";

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe?: boolean;
}

export interface PasswordResetData {
  email: string;
}

export interface AuthPanelProps {
  /** Callback for login form submission */
  onLogin?: (data: LoginData) => void | Promise<void>;
  /** Callback for signup form submission */
  onSignUp?: (data: SignUpData) => void | Promise<void>;
  /** Callback for password reset form submission */
  onPasswordReset?: (data: PasswordResetData) => void | Promise<void>;
  /** Optional redirect callback after successful authentication */
  onRedirect?: (path: string) => void;
  /** Initial view state */
  initialView?: AuthView;
  /** Custom CSS classes for the container */
  className?: string;
  /** Whether to show the remember me checkbox */
  showRememberMe?: boolean;
  /** Custom title for the auth panel */
  title?: string;
  /** Custom subtitle for the auth panel */
  subtitle?: string;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Password validation rules
const PASSWORD_MIN_LENGTH = 8;

// ✅ Toast message types
interface ToastMessage {
  id: number;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  show: boolean;
}

function AuthPanel({
  onLogin,
  onSignUp,
  onPasswordReset,
  onRedirect,
  initialView = "login",
  className,
  showRememberMe = true,
  title = "Welcome to Flying Fox Solutions",
  subtitle = "Sign in to your account or create a new one",
}: AuthPanelProps) {
  // ✅ State management
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ✅ Form data state
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [resetData, setResetData] = useState<PasswordResetData>({
    email: "",
  });

  // ✅ Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Toast management
  const addToast = useCallback(
    (message: string, variant: ToastMessage["variant"]) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, variant, show: true }]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // ✅ Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password.trim()) return "Password is required";
    if (password.length < PASSWORD_MIN_LENGTH)
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    return null;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): string | null => {
    if (!confirmPassword.trim()) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  // ✅ Form submission handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onLogin?.(loginData);
      addToast("Login successful! Redirecting...", "success");

      // Redirect after successful login
      setTimeout(() => {
        onRedirect?.("/dashboard");
      }, 1500);
    } catch (error) {
      addToast("Login failed. Please check your credentials.", "error");
      setErrors({ general: "Invalid email or password" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(signUpData.email);
    const passwordError = validatePassword(signUpData.password);
    const confirmPasswordError = validateConfirmPassword(
      signUpData.password,
      signUpData.confirmPassword
    );

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSignUp?.(signUpData);
      addToast("Account created successfully! Please sign in.", "success");
      setCurrentView("login");
      setLoginData((prev) => ({ ...prev, email: signUpData.email }));
    } catch (error) {
      addToast("Sign up failed. Please try again.", "error");
      setErrors({ general: "Failed to create account. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(resetData.email);

    if (emailError) newErrors.email = emailError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onPasswordReset?.(resetData);
      addToast("Password reset email sent! Check your inbox.", "success");
      setCurrentView("login");
      setLoginData((prev) => ({ ...prev, email: resetData.email }));
    } catch (error) {
      addToast("Failed to send reset email. Please try again.", "error");
      setErrors({ general: "Failed to send reset email. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ View switching handlers
  const switchToLogin = () => {
    setCurrentView("login");
    setErrors({});
  };

  const switchToSignUp = () => {
    setCurrentView("signup");
    setErrors({});
  };

  const switchToReset = () => {
    setCurrentView("reset");
    setErrors({});
  };

  // ✅ Input change handlers
  const handleLoginChange =
    (field: keyof LoginData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "rememberMe" ? e.target.checked : e.target.value;
      setLoginData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSignUpChange =
    (field: keyof SignUpData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "rememberMe" ? e.target.checked : e.target.value;
      setSignUpData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleResetChange =
    (field: keyof PasswordResetData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setResetData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  return (
    <div className={cx("w-full max-w-md mx-auto", className)}>
      {/* ✅ Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      </div>

      {/* ✅ Login Form */}
      {currentView === "login" && (
        <form
          onSubmit={handleLogin}
          className="space-y-6"
          role="form"
          aria-label="Login form"
        >
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <FormGroup label="Email Address" error={errors.email} required>
            <InputField
              type="email"
              label=""
              value={loginData.email}
              onChange={handleLoginChange("email")}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup label="Password" error={errors.password} required>
            <InputField
              type="password"
              label=""
              value={loginData.password}
              onChange={handleLoginChange("password")}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
          </FormGroup>

          {showRememberMe && (
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={loginData.rememberMe}
                onChange={handleLoginChange("rememberMe")}
                disabled={isSubmitting}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
              >
                Remember me
              </label>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Signing in..."
            disabled={isSubmitting}
          >
            Sign In
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={switchToReset}
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              disabled={isSubmitting}
            >
              Forgot your password?
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={switchToSignUp}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                disabled={isSubmitting}
              >
                Sign up
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ✅ Sign Up Form */}
      {currentView === "signup" && (
        <form
          onSubmit={handleSignUp}
          className="space-y-6"
          role="form"
          aria-label="Sign up form"
        >
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <FormGroup label="Email Address" error={errors.email} required>
            <InputField
              type="email"
              label=""
              value={signUpData.email}
              onChange={handleSignUpChange("email")}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup
            label="Password"
            error={errors.password}
            description="Must be at least 8 characters long"
            required
          >
            <InputField
              type="password"
              label=""
              value={signUpData.password}
              onChange={handleSignUpChange("password")}
              placeholder="Create a password"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup
            label="Confirm Password"
            error={errors.confirmPassword}
            required
          >
            <InputField
              type="password"
              label=""
              value={signUpData.confirmPassword}
              onChange={handleSignUpChange("confirmPassword")}
              placeholder="Confirm your password"
              disabled={isSubmitting}
            />
          </FormGroup>

          {showRememberMe && (
            <div className="flex items-center">
              <input
                id="remember-me-signup"
                type="checkbox"
                checked={signUpData.rememberMe}
                onChange={handleSignUpChange("rememberMe")}
                disabled={isSubmitting}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="remember-me-signup"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
              >
                Remember me
              </label>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Creating account..."
            disabled={isSubmitting}
          >
            Create Account
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                disabled={isSubmitting}
              >
                Sign in
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ✅ Password Reset Form */}
      {currentView === "reset" && (
        <form
          onSubmit={handlePasswordReset}
          className="space-y-6"
          role="form"
          aria-label="Password reset form"
        >
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <FormGroup label="Email Address" error={errors.email} required>
            <InputField
              type="email"
              label=""
              value={resetData.email}
              onChange={handleResetChange("email")}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Sending reset email..."
            disabled={isSubmitting}
          >
            Send Reset Email
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              disabled={isSubmitting}
            >
              Back to sign in
            </button>
          </div>
        </form>
      )}

      {/* ✅ Toast Stack */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => removeToast(toast.id)}
          className={`top-${4 + index * 20}`}
        />
      ))}
    </div>
  );
}

// ✅ Export types + component for easy importing
export type {
  AuthPanelProps as TAuthPanelProps,
  LoginData as TLoginData,
  SignUpData as TSignUpData,
  PasswordResetData as TPasswordResetData,
  AuthView as TAuthView,
};
export default AuthPanel;
