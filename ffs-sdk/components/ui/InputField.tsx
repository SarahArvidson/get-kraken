import React, { useId, forwardRef } from "react";

/**
 * InputField (Reusable Atomic Component)
 * -------------------------------------
 * A foundational, accessible input field component that serves as the building block
 * for all forms across the Flying Fox Solutions Template Library.
 *
 * This component is designed for maximum reusability and can be used in:
 * - Authentication forms (LoginForm, SignUpForm, PasswordResetForm)
 * - Onboarding flows
 * - Billing and payment forms
 * - Feedback and contact forms
 * - Any form requiring user input
 *
 * How to reuse:
 * 1) Import it: `import { InputField } from "@ffx/sdk";`
 * 2) Use it in any form:
 *    <InputField
 *      type="email"
 *      label="Email"
 *      value={email}
 *      onChange={(e) => setEmail(e.target.value)}
 *      error={errors.email}
 *      placeholder="you@example.com"
 *    />
 *
 * Notes:
 * - Fully accessible with ARIA attributes
 * - Dark mode compatible
 * - Supports all standard input types
 * - Built-in error handling and display
 * - Responsive design
 */

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input field */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input (when no error) */
  helperText?: string;
  /** Custom ID for the input (auto-generated if not provided) */
  id?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the input element */
  inputClassName?: string;
}

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Main InputField component with forwardRef for form libraries
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      label,
      error,
      helperText,
      id,
      className,
      inputClassName,
      type = "text",
      ...rest
    },
    ref
  ) {
    // ✅ Generate unique IDs for accessibility (aria-describedby)
    const generatedId = useId();
    const inputId = id ?? generatedId;

    // ✅ Build aria-describedby attribute for accessibility
    const describedBy = [
      error && `${inputId}-error`,
      helperText && !error && `${inputId}-helper`,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cx("w-full", className)}>
        {/* ✅ Properly labeled form field */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {/* ✅ Required indicator if required prop is present */}
            {rest.required && (
              <span
                className="ml-1 text-red-500 dark:text-red-400"
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* ✅ Input element with full accessibility support */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={cx(
            // ✅ Base input styling with focus states
            "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400",
            "shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800",
            "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
            // ✅ Error state styling
            error && "border-red-400 ring-1 ring-red-400 dark:border-red-600",
            // ✅ Success state styling (when no error and value exists)
            !error &&
              rest.value !== undefined &&
              rest.value !== "" &&
              "border-green-400 ring-1 ring-green-400 dark:border-green-600",
            inputClassName
          )}
          {...rest}
        />

        {/* ✅ Error message with proper ARIA relationship */}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {/* ✅ Helper text (only shown when no error) */}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// ✅ Export types + component for easy importing
export type { InputFieldProps as TInputFieldProps };
export default InputField;
