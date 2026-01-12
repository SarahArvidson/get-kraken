/**
 * Get Kraken v2 - Dual-Write Error Logger
 * 
 * Structured logging for dual-write operation failures
 */

interface DualWriteError {
  operation: string;
  table: string;
  error: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const ERROR_STORAGE_KEY = 'getkraken:dual-write-errors';
const MAX_STORED_ERRORS = 50; // Keep last 50 errors

/**
 * Log a dual-write error
 */
export function logDualWriteError(
  operation: string,
  table: string,
  error: any,
  userId?: string,
  metadata?: Record<string, any>
): void {
  const errorData: DualWriteError = {
    operation,
    table,
    error: error?.message || String(error) || 'Unknown error',
    userId,
    timestamp: new Date().toISOString(),
    metadata,
  };

  // Console logging (structured)
  console.error('[Dual-Write Error]', {
    operation: errorData.operation,
    table: errorData.table,
    error: errorData.error,
    userId: errorData.userId,
    timestamp: errorData.timestamp,
    metadata: errorData.metadata,
    code: error?.code,
    details: error?.details,
  });

  // localStorage logging (for debugging)
  try {
    const existing = localStorage.getItem(ERROR_STORAGE_KEY);
    const errors: DualWriteError[] = existing ? JSON.parse(existing) : [];
    errors.push(errorData);
    
    // Keep only last N errors
    if (errors.length > MAX_STORED_ERRORS) {
      errors.splice(0, errors.length - MAX_STORED_ERRORS);
    }
    
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errors));
  } catch (storageError) {
    // If localStorage is full or unavailable, just log to console
    console.warn('Could not store dual-write error to localStorage:', storageError);
  }
}

/**
 * Get stored dual-write errors (for debugging)
 */
export function getStoredDualWriteErrors(): DualWriteError[] {
  try {
    const stored = localStorage.getItem(ERROR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored dual-write errors
 */
export function clearStoredDualWriteErrors(): void {
  try {
    localStorage.removeItem(ERROR_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
