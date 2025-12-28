import React, { useId, useState } from "react";

/**
 * PasswordResetForm (Reusable Template Component)
 * -----------------------------------------------
 * A clean, accessible password reset form with client-side validation.
 * It accepts a `handlePasswordReset(email)` function via props so you can
 * wire it up to Supabase (or any auth service) outside the component.
 *
 * How to reuse:
 * 1) Import it: `import PasswordResetForm, { type HandlePasswordReset, type PasswordResetFormProps } from "@/components/auth/PasswordResetForm";`
 * 2) Provide `handlePasswordReset` (async or sync):
 *    const handlePasswordReset: HandlePasswordReset = async (email) => {
 *      // call your auth provider (e.g., Supabase)
 *      // await supabase.auth.resetPasswordForEmail(email)
 *    };
 * 3) Render it:
 *    <PasswordResetForm handlePasswordReset={handlePasswordReset} loginHref="/login" />
 *
 * Notes:
 * - No external form libs; validation is simple and built-in.
 * - Fully typed with TypeScript and easy to read.
 * - Tailwind-only styling for portability.
 * - Includes success state after submission.
 */

export type HandlePasswordReset = (email: string) => Promise<void> | void;

export interface PasswordResetFormProps {
  /** Function to be called on submit with (email) */
  handlePasswordReset: HandlePasswordReset;
  /** Optional: URL for "Back to login" link (if omitted, link is hidden) */
  loginHref?: string;
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

// ✅ Type for tracking validation errors and success state
type FieldErrors = {
  email?: string;
  form?: string; // non-field error shown at top
};

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Reusable Input subcomponent with built-in accessibility features
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(function Input({ label, id, error, className, ...rest }, ref) {
  // ✅ Generate unique IDs for accessibility (aria-describedby)
  const generatedId = useId(); // always called
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : undefined;

  return (
    <div>
      {/* ✅ Properly labeled form field */}
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error} // ✅ Screen reader announces validation errors
        aria-describedby={describedBy} // ✅ Links to error message
        className={cx(
          // ✅ Base input styling with focus states
          "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400",
          "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
          // ✅ Error state styling
          error && "border-red-400 ring-1 ring-red-400",
          className
        )}
        {...rest}
      />
      {/* ✅ Accessible error message with proper ARIA relationship */}
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

// ✅ Main PasswordResetForm component
function PasswordResetForm({
  handlePasswordReset,
  loginHref,
  title = "Reset your password",
  subtitle = "Enter your email address and we'll send you a link to reset your password",
  submitLabel = "Send reset link",
  initialEmail = "",
  className,
}: PasswordResetFormProps) {
  // ✅ Local state for form data, validation, and success state
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Client-side validation function
  function validate(): boolean {
    const next: FieldErrors = {};

    // ✅ Email validation
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Enter a valid email address";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ✅ Handle form submission
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsSuccess(false);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(handlePasswordReset(email));
      // ✅ Show success message after successful submission
      setIsSuccess(true);
    } catch (err: unknown) {
      // ✅ Handle any errors from the auth provider
      const message =
        err instanceof Error
          ? err.message
          : "Unable to send reset link. Please try again.";
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
      {/* ✅ Header section with title and subtitle */}
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

      {/* ✅ Success message state */}
      {isSuccess && (
        <div
          role="alert" // ✅ Screen reader announces this as an alert
          className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
        >
          <div className="flex items-center gap-2">
            {/* ✅ Success icon */}
            <svg
              className="h-4 w-4 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="font-medium">Check your inbox!</p>
              <p className="mt-1">
                We've sent a password reset link to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Form-level error message (for server/auth errors) */}
      {errors.form && (
        <div
          role="alert" // ✅ Screen reader announces this as an alert
          className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {errors.form}
        </div>
      )}

      {/* ✅ Main form (hidden when success is shown) */}
      {!isSuccess && (
        <form noValidate onSubmit={onSubmit} className="space-y-4">
          {/* ✅ Email input field */}
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

          {/* ✅ Submit button with loading state */}
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
              // ✅ Loading state with spinner animation
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
                Sending reset link…
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </form>
      )}

      {/* ✅ Footer section with login link */}
      <div className="mt-4 text-center">
        {loginHref && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
            <a
              href={loginHref}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Back to login
            </a>
          </p>
        )}
        {!isSuccess && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            We'll send you a secure link to reset your password.
          </p>
        )}
      </div>
    </div>
  );
}

// ✅ Export types + component for easy importing
export type { PasswordResetFormProps as TPasswordResetFormProps };
export default PasswordResetForm;

