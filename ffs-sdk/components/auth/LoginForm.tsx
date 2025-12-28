import React, { useId, useState } from "react";

/**
 * LoginForm (Reusable Template Component)
 * --------------------------------------
 * A clean, accessible login form with client-side validation.
 * It accepts a `handleLogin(email, password)` function via props so you can
 * wire it up to Supabase (or any auth service) outside the component.
 *
 * How to reuse:
 * 1) Import it: `import LoginForm, { type HandleLogin, type LoginFormProps } from "@/components/auth/LoginForm";`
 * 2) Provide `handleLogin` (async or sync):
 *    const handleLogin: HandleLogin = async (email, password) => {
 *      // call your auth provider (e.g., Supabase)
 *      // await supabase.auth.signInWithPassword({ email, password })
 *    };
 * 3) Render it:
 *    <LoginForm handleLogin={handleLogin} forgotPasswordHref="/forgot" />
 *
 * Notes:
 * - No external form libs; validation is simple and built-in.
 * - Fully typed with TypeScript and easy to read.
 * - Tailwind-only styling for portability.
 */

export type HandleLogin = (
  email: string,
  password: string
) => Promise<void> | void;

export interface LoginFormProps {
  /** Function to be called on submit with (email, password) */
  handleLogin: HandleLogin;
  /** Optional: URL for "Forgot password?" link (if omitted, link is hidden) */
  forgotPasswordHref?: string;
  /** Optional: Title above the form */
  title?: string;
  /** Optional: Subtext beneath title */
  subtitle?: string;
  /** Optional: Custom label for the submit button */
  submitLabel?: string;
  /** Optional: Controlled initial email value */
  initialEmail?: string;
  /** Optional: Pass extra classes for outer wrapper */
  className?: string;
}

// ✅ Basic, readable email regex for quick client-side validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  email?: string;
  password?: string;
  form?: string; // non-field error shown at top
};

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Input subcomponent (reusable)
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(function Input({ label, id, error, className, ...rest }, ref) {
  const generatedId = useId(); // ✅ always called
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cx(
          "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400",
          "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
          error && "border-red-400 ring-1 ring-red-400",
          className
        )}
        {...rest}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
});

// ✅ Main LoginForm component
function LoginForm({
  handleLogin,
  forgotPasswordHref,
  title = "Welcome back",
  subtitle = "Please sign in to your account",
  submitLabel = "Sign in",
  initialEmail = "",
  className,
}: LoginFormProps) {
  // Local state
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Client-side validation
  function validate(): boolean {
    const next: FieldErrors = {};

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Use at least 8 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ✅ Handle form submit
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(handleLogin(email, password));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ✅ Component UI
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
        "dark:border-gray-800 dark:bg-gray-950",
        className
      )}
    >
      {/* Title + Subtitle */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Form-level error */}
      {errors.form && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {errors.form}
        </div>
      )}

      {/* Form */}
      <form noValidate onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          error={errors.email}
          inputMode="email"
          required
        />

        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <div />
          {forgotPasswordHref && (
            <a
              href={forgotPasswordHref}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Forgot password?
            </a>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cx(
            "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold",
            "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
            "disabled:opacity-60"
          )}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Signing in…
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        By signing in you agree to our Terms and Privacy Policy.
      </div>
    </div>
  );
}

// ✅ Export types + component
export type { LoginFormProps as TLoginFormProps };
export default LoginForm;
