// Core UI Components
export { default as InputField } from "./InputField";
export type { InputFieldProps, TInputFieldProps } from "./InputField";

export { default as Button } from "./Button";
export type { ButtonProps, TButtonProps } from "./Button";

export { default as Modal } from "./Modal";
export type { ModalProps, TModalProps } from "./Modal";

export { default as Spinner } from "./Spinner";
export type { SpinnerProps, TSpinnerProps } from "./Spinner";

export { default as FormGroup } from "./FormGroup";
export type { FormGroupProps, TFormGroupProps } from "./FormGroup";

export { default as Toast } from "./Toast";
export type { ToastProps, TToastProps } from "./Toast";

// Advanced UI Components - Use lazy loading for heavy components
export { default as Navigation, useNavigation } from "./Navigation";

// Advanced component types
export type {
  DataTableProps,
  DataTableColumn,
  DataTablePagination,
  DataTableSelection,
} from "./DataTable";
export type {
  NavigationProps,
  NavigationItem as UINavigationItem,
} from "./Navigation";
export type {
  FormProps,
  FormFieldSchema,
  FormFieldType,
  FormConfig,
  UseFormReturn,
} from "./Form";
export type {
  ThemeProviderProps,
  ThemeConfig,
  ThemeVariant,
  ColorScheme,
  ColorMode,
  CustomColors,
} from "./ThemeProvider";

// Lazy-loaded components for performance (preferred for heavy components)
export {
  LazyDataTable,
  LazyForm,
  LazyThemeProvider,
  LazyWrapper,
  LazyDataTableWithSuspense,
  LazyFormWithSuspense,
  default as LazyComponents,
} from "./LazyComponents";

// Re-export heavy components as lazy by default
export { LazyDataTableWithSuspense as DataTable } from "./LazyComponents";
export { LazyFormWithSuspense as Form } from "./LazyComponents";
export { LazyThemeProvider as ThemeProvider } from "./LazyComponents";

// Export hooks separately to avoid static imports
export { useForm } from "./Form";
export { useTheme, useThemeStyles } from "./ThemeProvider";
