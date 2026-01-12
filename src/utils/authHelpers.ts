/**
 * Get Kraken - Authentication Helpers
 * 
 * Utilities for username-based authentication with fake email mapping
 */

/**
 * Converts a username to a fake email address for Supabase authentication.
 * Supabase requires email addresses, so we map usernames to fake emails.
 * 
 * @param username - The username entered by the user
 * @returns A fake email address in the format: username@getkraken.local
 */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@getkraken.local`;
}
