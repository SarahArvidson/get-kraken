import React, { useId } from "react";

/**
 * FormGroup (Reusable Atomic Component)
 * -------------------------------------
 * A foundational, accessible form group wrapper that serves as the building block
 * for all form controls across the Flying Fox Solutions Template Library.
 *
 * This component is designed for maximum reusability and can be used to:
 * - Wrap InputField, select, textarea, and other form controls
 * - Provide consistent form layout and spacing
 * - Handle label-to-input associations automatically
 * - Display descriptions and validation messages
 * - Ensure proper accessibility with ARIA attributes
 *
 * How to reuse:
 * 1) Import it: `import { FormGroup } from "@ffx/sdk";`
 * 2) Use it anywhere:
 *    <FormGroup
 *      label="Email Address"
 *      description="We'll never share your email"
 *      error={emailError}
 *      required
 *    >
 *      <InputField
 *        type="email"
 *        value={email}
 *        onChange={(e) => setEmail(e.target.value)}
 *        placeholder="you@example.com"
 *      />
 *    </FormGroup>
 *
 * Notes:
 * - Fully accessible with automatic ARIA linking
 * - Dark mode compatible
 * - Supports any form control as children
 * - Automatic ID generation for label association
 * - Proper error handling with role="alert"
 */

export interface FormGroupProps {
  /** Label text for the form control */
  label: string;
  /** HTML for attribute to link label to input */
  htmlFor?: string;
  /** Optional description text below the label */
  description?: string;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Form control element(s) */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the label */
  labelClassName?: string;
  /** Additional CSS classes for the description */
  descriptionClassName?: string;
  /** Additional CSS classes for the error message */
  errorClassName?: string;
}

// ✅ Utility for merging Tailwind classes (handles conditional styling)
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Main FormGroup component
function FormGroup({
  label,
  htmlFor,
  description,
  error,
  required = false,
  children,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
}: FormGroupProps) {
  // ✅ Generate unique IDs for accessibility
  const generatedId = useId();
  const labelId = htmlFor || generatedId;
  const descriptionId = description ? `${labelId}-description` : undefined;
  const errorId = error ? `${labelId}-error` : undefined;

  // ✅ Build aria-describedby attribute
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("w-full", className)}>
      {/* ✅ Label */}
      <label
        htmlFor={labelId}
        className={cx(
          "block text-sm font-medium text-gray-900 dark:text-gray-100",
          labelClassName
        )}
      >
        {label}
        {required && (
          <span
            className="ml-1 text-red-500 dark:text-red-400"
            aria-label="required"
          >
            *
          </span>
        )}
      </label>

      {/* ✅ Description */}
      {description && (
        <p
          id={descriptionId}
          className={cx(
            "mt-1 text-sm text-gray-600 dark:text-gray-400",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}

      {/* ✅ Form Control */}
      <div className={cx(description ? "mt-2" : "mt-1")}>
        {React.isValidElement(children)
          ? React.cloneElement(
              children as React.ReactElement<
                React.InputHTMLAttributes<HTMLInputElement>
              >,
              {
                id: labelId,
                "aria-describedby": describedBy,
                "aria-invalid": !!error,
                ...(children.props || {}),
              }
            )
          : children}
      </div>

      {/* ✅ Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className={cx(
            "mt-1 text-sm text-red-600 dark:text-red-400",
            errorClassName
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ✅ Export types + component for easy importing
export type { FormGroupProps as TFormGroupProps };
export default FormGroup;
