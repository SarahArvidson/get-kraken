/**
 * Editable Numeric Input Component
 * 
 * Allows typing numeric values with debounced save and blur flush.
 * Prevents leading zeros and supports empty state during typing.
 */

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../utils/useDebounce";

interface EditableNumericInputProps {
  value: number;
  onSave: (value: number) => Promise<void>;
  min?: number;
  max?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  showPrefix?: boolean;
  showSuffix?: boolean;
  ariaLabel?: string;
}

export function EditableNumericInput({
  value,
  onSave,
  min = 0,
  max,
  className = "",
  prefix,
  suffix,
  showPrefix = false,
  showSuffix = false,
  ariaLabel,
}: EditableNumericInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSavedValueRef = useRef<number>(value);

  // Initialize input value from prop
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value === 0 ? "" : value.toString());
      lastSavedValueRef.current = value;
    }
  }, [value, isFocused]);

  // Debounced save function
  const debouncedSave = useDebounce(async (val: number) => {
    if (val !== lastSavedValueRef.current) {
      await onSave(val);
      lastSavedValueRef.current = val;
    }
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow empty string
    if (rawValue === "") {
      setInputValue("");
      return;
    }

    // Remove leading zeros (e.g., "02" -> "2")
    const normalizedValue = rawValue.replace(/^0+/, "") || "0";
    
    // Parse as integer
    const numValue = parseInt(normalizedValue, 10);
    
    if (isNaN(numValue)) {
      return; // Invalid input, don't update
    }

    // Clamp to min/max
    const clampedValue = Math.max(min, max !== undefined ? Math.min(max, numValue) : numValue);
    
    setInputValue(clampedValue.toString());
    debouncedSave(clampedValue);
  };

  const handleBlur = async () => {
    setIsFocused(false);
    
    // Determine final value to save
    let finalValue: number;
    if (inputValue === "") {
      finalValue = min;
    } else {
      const parsed = parseInt(inputValue, 10);
      finalValue = isNaN(parsed) ? min : parsed;
    }
    
    // Clamp to min/max
    const clampedFinal = Math.max(min, max !== undefined ? Math.min(max, finalValue) : finalValue);
    
    // Save immediately on blur
    if (clampedFinal !== lastSavedValueRef.current) {
      await onSave(clampedFinal);
      lastSavedValueRef.current = clampedFinal;
    }
    
    // Reset display value
    setInputValue(clampedFinal === 0 ? "" : clampedFinal.toString());
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show empty if value is 0, otherwise show the value
    setInputValue(value === 0 ? "" : value.toString());
    inputRef.current?.select();
  };

  // Display: show inputValue when focused, otherwise show value (empty if 0)
  const displayValue = isFocused 
    ? inputValue 
    : (value === 0 ? "" : value.toString());

  return (
    <div className="flex items-center gap-1">
      {showPrefix && prefix && <span className="text-lg">{prefix}</span>}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`text-lg font-semibold min-w-[60px] text-center bg-transparent border-b-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:outline-none ${className}`}
        aria-label={ariaLabel}
      />
      {showSuffix && suffix && <span className="text-lg">{suffix}</span>}
    </div>
  );
}

