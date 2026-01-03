/**
 * Unified Numeric Input Component
 * 
 * Provides both +/- buttons AND direct typing with consistent behavior:
 * - +/- buttons increment/decrement by 1
 * - Direct typing with no leading zeros
 * - Empty allowed while typing, coerced to integer on blur/save
 * - Debounced save with blur flush
 * - Cancels debounce on blur before flush
 * - Ignores prop updates while focused
 */

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../utils/useDebounce";

interface UnifiedNumericInputProps {
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
  increment?: number;
}

export function UnifiedNumericInput({
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
  increment = 1,
}: UnifiedNumericInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSavedValueRef = useRef<number>(value);

  // Initialize input value from prop - but ignore while focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value === 0 ? "" : value.toString());
      lastSavedValueRef.current = value;
    }
  }, [value, isFocused]);

  // Debounced save function with cancel
  const [debouncedSave, cancelDebounce] = useDebounce(async (val: number) => {
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
    
    // Cancel any pending debounce before flushing
    cancelDebounce();
    
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
    
    // Save immediately on blur (no debounce)
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

  const handleIncrement = async (delta: number) => {
    const newValue = Math.max(min, max !== undefined ? Math.min(max, value + delta * increment) : value + delta * increment);
    if (newValue !== value) {
      // Cancel any pending debounce
      cancelDebounce();
      // Save immediately for button clicks - always pass a number, never undefined
      await onSave(newValue);
      lastSavedValueRef.current = newValue;
    }
  };

  // Display: show inputValue when focused, otherwise show value (empty if 0)
  const displayValue = isFocused 
    ? inputValue 
    : (value === 0 ? "" : value.toString());

  return (
    <div className="flex items-center justify-center gap-2">
      {showPrefix && prefix && <span className="text-lg">{prefix}</span>}
      <button
        onClick={() => handleIncrement(-1)}
        className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
        aria-label={`Decrease ${ariaLabel || "value"}`}
        type="button"
      >
        −
      </button>
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
      <button
        onClick={() => handleIncrement(1)}
        className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all touch-manipulation"
        aria-label={`Increase ${ariaLabel || "value"}`}
        type="button"
      >
        +
      </button>
      {showSuffix && suffix && <span className="text-lg">{suffix}</span>}
    </div>
  );
}

