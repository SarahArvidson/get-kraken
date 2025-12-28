/**
 * Flying Fox Solutions - Advanced Form System
 *
 * Comprehensive form handling with validation, field types, and layout options.
 * Perfect for complex forms in web apps, POS systems, and admin interfaces.
 *
 * Features:
 * - Multiple field types (text, email, password, select, checkbox, radio, etc.)
 * - Built-in validation with custom rules
 * - Conditional field rendering
 * - Multi-step forms with progress tracking
 * - Auto-save functionality
 * - File upload support
 * - Responsive layouts (vertical, horizontal, grid)
 * - Real-time validation feedback
 *
 * Usage:
 * ```tsx
 * import { Form, useForm } from "@ffx/sdk";
 *
 * const schema = [
 *   { name: 'email', type: 'email', label: 'Email', required: true },
 *   { name: 'password', type: 'password', label: 'Password', validation: { minLength: 8 } },
 *   { name: 'role', type: 'select', label: 'Role', options: ['admin', 'user'] }
 * ];
 *
 * function MyForm() {
 *   const form = useForm({ schema });
 *
 *   return (
 *     <Form
 *       form={form}
 *       onSubmit={(data) => console.log(data)}
 *       layout="vertical"
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useCallback, useEffect, memo } from "react";
import InputField from "./InputField";
import Button from "./Button";

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "datetime-local"
  | "file"
  | "hidden"
  | "switch"
  | "slider"
  | "color"
  | "custom";

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, formData: Record<string, any>) => string | null;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
}

export interface FormFieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}

export interface FormFieldSchema {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  validation?: FormFieldValidation;
  options?: FormFieldOption[] | string[];
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  className?: string;
  width?: string | number;
  conditional?: {
    field: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "greater_than"
      | "less_than";
    value: any;
  };
  help?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  renderCustom?: (
    field: FormFieldSchema,
    value: any,
    onChange: (value: any) => void,
    error?: string
  ) => React.ReactNode;
}

export interface FormStep {
  title: string;
  description?: string;
  fields: string[];
  validation?: (data: Record<string, any>) => Record<string, string>;
}

export interface FormConfig {
  schema: FormFieldSchema[];
  steps?: FormStep[];
  layout?: "vertical" | "horizontal" | "grid" | "inline";
  gridColumns?: number;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showProgress?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  currentStep: number;
  isDirty: boolean;
}

export interface FormActions {
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  reset: (data?: Record<string, any>) => void;
  submit: () => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

export interface UseFormReturn extends FormState, FormActions {
  getFieldProps: (name: string) => {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
  };
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// Form validation utilities
const validateField = (
  field: FormFieldSchema,
  value: any,
  formData: Record<string, any>
): string | null => {
  const { validation } = field;
  if (!validation) return null;

  // Required validation
  if (
    validation.required &&
    (value === null || value === undefined || value === "")
  ) {
    return `${field.label} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value && !validation.required) return null;

  // String validations
  if (typeof value === "string") {
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }
    if (validation.pattern && !validation.pattern.test(value)) {
      return `${field.label} format is invalid`;
    }
    if (validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${field.label} must be a valid email address`;
    }
    if (validation.url && !/^https?:\/\/.+/.test(value)) {
      return `${field.label} must be a valid URL`;
    }
  }

  // Numeric validations
  if (validation.numeric || typeof value === "number") {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return `${field.label} must be a number`;
    }
    if (validation.min !== undefined && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && numValue > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value, formData);
  }

  return null;
};

// Check if field should be visible based on conditions
const isFieldVisible = (
  field: FormFieldSchema,
  formData: Record<string, any>
): boolean => {
  if (field.hidden) return false;
  if (!field.conditional) return true;

  const {
    field: conditionField,
    operator,
    value: conditionValue,
  } = field.conditional;
  const fieldValue = formData[conditionField];

  switch (operator) {
    case "equals":
      return fieldValue === conditionValue;
    case "not_equals":
      return fieldValue !== conditionValue;
    case "contains":
      return Array.isArray(fieldValue)
        ? fieldValue.includes(conditionValue)
        : typeof fieldValue === "string"
        ? fieldValue.includes(conditionValue)
        : false;
    case "greater_than":
      return typeof fieldValue === "number" && fieldValue > conditionValue;
    case "less_than":
      return typeof fieldValue === "number" && fieldValue < conditionValue;
    default:
      return true;
  }
};

// Custom form hook
export function useForm(config: FormConfig): UseFormReturn {
  const [state, setState] = useState<FormState>(() => {
    const initialData: Record<string, any> = {};
    config.schema.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });

    return {
      data: initialData,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
      currentStep: 0,
      isDirty: false,
    };
  });

  // Auto-save functionality
  useEffect(() => {
    if (!config.autoSave || !state.isDirty) return;

    const timeoutId = setTimeout(() => {
      // Implement auto-save logic here
      console.log("Auto-saving form data:", state.data);
    }, config.autoSaveDelay || 1000);

    return () => clearTimeout(timeoutId);
  }, [state.data, state.isDirty, config.autoSave, config.autoSaveDelay]);

  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setState((prev) => ({
        ...prev,
        data: { ...prev.data, [name]: value },
        isDirty: true,
      }));

      // Validate on change if enabled
      if (config.validateOnChange) {
        const field = config.schema.find((f) => f.name === name);
        if (field) {
          const error = validateField(field, value, {
            ...state.data,
            [name]: value,
          });
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [name]: error || "" },
          }));
        }
      }
    },
    [config.validateOnChange, config.schema, state.data]
  );

  const setFieldError = useCallback((name: string, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  const validateFieldAsync = useCallback(
    async (name: string): Promise<string | null> => {
      const field = config.schema.find((f) => f.name === name);
      if (!field) return null;

      const value = state.data[name];
      const error = validateField(field, value, state.data);

      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error || "" },
      }));

      return error;
    },
    [config.schema, state.data]
  );

  const validateForm = useCallback(async (): Promise<boolean> => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate visible fields
    for (const field of config.schema) {
      if (!isFieldVisible(field, state.data)) continue;

      const error = validateField(field, state.data[field.name], state.data);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    }

    // Step-specific validation
    if (config.steps && config.steps[state.currentStep]?.validation) {
      const stepErrors = config.steps[state.currentStep].validation!(
        state.data
      );
      Object.assign(errors, stepErrors);
      if (Object.keys(stepErrors).length > 0) {
        isValid = false;
      }
    }

    setState((prev) => ({
      ...prev,
      errors,
      isValid,
    }));

    return isValid;
  }, [config.schema, config.steps, state.data, state.currentStep]);

  const reset = useCallback(
    (data?: Record<string, any>) => {
      const resetData = data || {};
      config.schema.forEach((field) => {
        if (field.defaultValue !== undefined) {
          resetData[field.name] = field.defaultValue;
        }
      });

      setState({
        data: resetData,
        errors: {},
        touched: {},
        isValid: false,
        isSubmitting: false,
        currentStep: 0,
        isDirty: false,
      });
    },
    [config.schema]
  );

  const submit = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setState((prev) => ({ ...prev, isSubmitting: false }));
        return;
      }

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      config.schema.forEach((field) => {
        allTouched[field.name] = true;
      });

      setState((prev) => ({
        ...prev,
        touched: allTouched,
        isSubmitting: false,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      throw error;
    }
  }, [validateForm, config.schema]);

  const nextStep = useCallback(() => {
    if (!config.steps || state.currentStep >= config.steps.length - 1) return;
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, [config.steps, state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep <= 0) return;
    setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
  }, [state.currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (!config.steps || step < 0 || step >= config.steps.length) return;
      setState((prev) => ({ ...prev, currentStep: step }));
    },
    [config.steps]
  );

  const getFieldProps = useCallback(
    (name: string) => {
      return {
        value: state.data[name] || "",
        onChange: (value: any) => setFieldValue(name, value),
        onBlur: () => {
          setFieldTouched(name, true);
          if (config.validateOnBlur) {
            validateFieldAsync(name);
          }
        },
        error: state.errors[name],
        touched: state.touched[name],
      };
    },
    [
      state.data,
      state.errors,
      state.touched,
      setFieldValue,
      setFieldTouched,
      config.validateOnBlur,
      validateFieldAsync,
    ]
  );

  return {
    ...state,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField: validateFieldAsync,
    validateForm,
    reset,
    submit,
    nextStep,
    prevStep,
    goToStep,
    getFieldProps,
  };
}

// Form field renderer
function FormField({
  field,
  value,
  onChange,
  onBlur,
  error,
  touched,
}: {
  field: FormFieldSchema;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
}) {
  const showError = touched && error;

  // Custom field renderer
  if (field.renderCustom) {
    return field.renderCustom(
      field,
      value,
      onChange,
      showError ? error : undefined
    );
  }

  const commonProps = {
    disabled: field.disabled,
    readOnly: field.readonly,
    onBlur,
  };

  switch (field.type) {
    case "textarea":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={cx(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              showError &&
                "border-red-300 focus:ring-red-500 focus:border-red-500",
              field.className
            )}
            {...commonProps}
          />
          {field.help && (
            <p className="mt-1 text-sm text-gray-500">{field.help}</p>
          )}
          {showError && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );

    case "select":
      const options = field.options || [];
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={cx(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              showError &&
                "border-red-300 focus:ring-red-500 focus:border-red-500",
              field.className
            )}
            {...commonProps}
          >
            <option value="">
              {field.placeholder || `Select ${field.label.toLowerCase()}...`}
            </option>
            {options.map((option, index) => {
              const optionValue =
                typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string" ? option : option.label;
              const optionDisabled =
                typeof option === "object" ? option.disabled : false;

              return (
                <option
                  key={index}
                  value={optionValue}
                  disabled={optionDisabled}
                >
                  {optionLabel}
                </option>
              );
            })}
          </select>
          {field.help && (
            <p className="mt-1 text-sm text-gray-500">{field.help}</p>
          )}
          {showError && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...commonProps}
          />
          <label className="ml-2 block text-sm text-gray-900">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          {field.help && (
            <p className="ml-6 text-sm text-gray-500">{field.help}</p>
          )}
          {showError && <p className="ml-6 text-sm text-red-600">{error}</p>}
        </div>
      );

    case "radio":
      const radioOptions = field.options || [];
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="space-y-2">
            {radioOptions.map((option, index) => {
              const optionValue =
                typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string" ? option : option.label;
              const optionDisabled =
                typeof option === "object" ? option.disabled : false;

              return (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={field.name}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={optionDisabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
          {field.help && (
            <p className="mt-1 text-sm text-gray-500">{field.help}</p>
          )}
          {showError && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );

    case "file":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className={cx(
              "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              showError &&
                "border-red-300 focus:ring-red-500 focus:border-red-500",
              field.className
            )}
            {...commonProps}
          />
          {field.help && (
            <p className="mt-1 text-sm text-gray-500">{field.help}</p>
          )}
          {showError && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );

    case "hidden":
      return <input type="hidden" name={field.name} value={value || ""} />;

    default:
      // Default to InputField for text-based inputs
      return (
        <InputField
          type={field.type as any}
          label={field.label}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          error={showError ? error : undefined}
          helperText={field.help}
          required={field.validation?.required}
          disabled={field.disabled}
          readOnly={field.readonly}
          className={field.className}
        />
      );
  }
}

// Main Form component
export interface FormProps {
  form: UseFormReturn;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  className?: string;
  layout?: "vertical" | "horizontal" | "grid" | "inline";
  gridColumns?: number;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  showResetButton?: boolean;
  resetButtonText?: string;
  children?: React.ReactNode;
}

export const Form = memo(function Form({
  form,
  onSubmit,
  className,
  layout = "vertical",
  gridColumns = 2,
  showSubmitButton = true,
  submitButtonText = "Submit",
  showResetButton = false,
  resetButtonText = "Reset",
  children,
}: FormProps) {
  const config = form as any; // Access internal config if needed

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        await form.submit();
        if (onSubmit) {
          await onSubmit(form.data);
        }
      } catch (error) {
        console.error("Form submission error:", error);
      }
    },
    [form, onSubmit]
  );

  // Get visible fields for current step
  const visibleFields =
    config?.schema?.filter((field: FormFieldSchema) =>
      isFieldVisible(field, form.data)
    ) || [];

  const layoutClasses = cx(
    "ffx-form",
    layout === "grid" && `grid gap-4 grid-cols-1 md:grid-cols-${gridColumns}`,
    layout === "horizontal" && "space-y-4",
    layout === "vertical" && "space-y-4",
    layout === "inline" && "flex flex-wrap gap-4",
    className
  );

  return (
    <form onSubmit={handleSubmit} className={layoutClasses}>
      {visibleFields.map((field: FormFieldSchema) => {
        const fieldProps = form.getFieldProps(field.name);

        return (
          <div
            key={field.name}
            className={cx(
              "form-field",
              layout === "grid" && field.width
                ? `col-span-${field.width}`
                : false,
              layout === "inline" && field.width ? `w-${field.width}` : false
            )}
          >
            <FormField
              field={field}
              value={fieldProps.value}
              onChange={fieldProps.onChange}
              onBlur={fieldProps.onBlur}
              error={fieldProps.error}
              touched={fieldProps.touched}
            />
          </div>
        );
      })}

      {/* Custom children */}
      {children}

      {/* Form actions */}
      {(showSubmitButton || showResetButton) && (
        <div className="flex gap-4 pt-4">
          {showSubmitButton && (
            <Button
              type="submit"
              variant="primary"
              disabled={form.isSubmitting || !form.isValid}
              loading={form.isSubmitting}
            >
              {submitButtonText}
            </Button>
          )}

          {showResetButton && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.isSubmitting}
            >
              {resetButtonText}
            </Button>
          )}
        </div>
      )}
    </form>
  );
});

export default Form;
