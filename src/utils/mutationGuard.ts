/**
 * Mutation Guard Utility
 * 
 * Prevents double-application of optimistic mutations by tracking local mutations
 * and ignoring realtime echoes that match our own actions.
 */

interface PendingMutation {
  mutationId: string;
  expectedTotal: number;
  expectedDollarTotal: number;
  timestamp: number;
}

// Module-level mutation guard state
let lastMutation: PendingMutation | null = null;

/**
 * Generate a unique mutation ID
 */
export function generateMutationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Register a pending wallet mutation (called before database update)
 * Returns the mutation ID for tracking
 */
export function registerPendingWalletMutation(
  expectedTotal: number,
  expectedDollarTotal: number
): string {
  const mutationId = generateMutationId();
  lastMutation = {
    mutationId,
    expectedTotal,
    expectedDollarTotal,
    timestamp: Date.now(),
  };
  return mutationId;
}

/**
 * Check if a realtime update matches our last mutation (echo detection)
 * Returns true if this is an echo of our own mutation (should be ignored)
 */
export function isEchoOfLastWalletMutation(
  newTotal: number,
  newDollarTotal: number
): boolean {
  if (!lastMutation) return false;

  // Check if timestamp is recent (within 5 seconds)
  const timeSinceMutation = Date.now() - lastMutation.timestamp;
  if (timeSinceMutation > 5000) {
    // Mutation too old, clear it
    lastMutation = null;
    return false;
  }

  // Check if values match (allowing for rounding differences)
  const totalMatches = Math.abs(newTotal - lastMutation.expectedTotal) < 0.01;
  const dollarTotalMatches =
    Math.abs(newDollarTotal - lastMutation.expectedDollarTotal) < 0.01;

  if (totalMatches && dollarTotalMatches) {
    // This is an echo of our own mutation - clear the ref and return true
    lastMutation = null;
    return true;
  }

  return false;
}

/**
 * Clear the last mutation (useful for testing or error recovery)
 */
export function clearLastMutation(): void {
  lastMutation = null;
}

