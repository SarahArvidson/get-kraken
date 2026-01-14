/**
 * Utility functions for handling number inputs as text
 * Prevents decimal input and leading zeros
 */

export function sanitizeNumberInput(value: string): string {
  // Strip all non-digit characters
  return value.replace(/\D/g, '');
}

export function handleNumberInputChange(
  value: string,
  setValue: (value: string) => void
): void {
  // Strip all non-digits
  const sanitized = sanitizeNumberInput(value);
  // Never auto-insert leading zero when deleting
  setValue(sanitized);
}

export function handleNumberKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>
): void {
  // Prevent "." and "," keys
  if (e.key === '.' || e.key === ',') {
    e.preventDefault();
  }
}
