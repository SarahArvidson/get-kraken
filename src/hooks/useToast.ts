/**
 * Get Kraken - Toast Hook
 *
 * Manages toast notification state
 */

import { useState, useCallback } from "react";

export type ToastType = "success" | "error";

export interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, "success");
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, "error");
  }, [showToast]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    dismissToast,
  };
}

