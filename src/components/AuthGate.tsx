/**
 * Get Kraken - Authentication Gate Component
 *
 * Handles user authentication with username/password
 * Remembers users on their devices
 */

import { useState, useEffect } from "react";
import { Button, InputField } from "@ffx/sdk";
import { supabase } from "../lib/supabase";
import { KRAKEN_ICON_PATH } from "../constants";
import { usernameToEmail } from "../utils/authHelpers";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert username to fake email for Supabase
      const email = usernameToEmail(username);
      
      // First, try to sign in (user might already exist)
      const signInResult = await supabase.signIn({
        email,
        password,
      });

      if (signInResult.data?.session) {
        // Successfully signed in
        setIsAuthenticated(true);
        return;
      }

      // If sign in failed with "Invalid login credentials", try to create account
      if (signInResult.error?.message?.includes("Invalid login credentials")) {
        // Try to sign up (create new account)
        const signUpResult = await supabase.signUp({
          email,
          password,
        });

        if (signUpResult.error) {
          // Check if user already exists (race condition or different error)
          if (signUpResult.error.message?.includes("already registered") || 
              signUpResult.error.message?.includes("already exists") ||
              signUpResult.error.message?.includes("User already registered")) {
            setError("Invalid login credentials. Please check your password.");
          } else {
            setError(signUpResult.error.message || "Failed to create account");
          }
        } else if (signUpResult.data?.user) {
          // User was created successfully
          if (signUpResult.data?.session) {
            // Email confirmation disabled, user is logged in
            setIsAuthenticated(true);
          } else {
            // No session returned - try to sign in automatically
            const autoSignInResult = await supabase.signIn({
              email,
              password,
            });
            
            if (autoSignInResult.data?.session) {
              // Successfully signed in
              setIsAuthenticated(true);
            } else if (autoSignInResult.error) {
              // If auto sign-in fails, email confirmation might be required
              setError("Account created! Please check your email to confirm your account, then sign in.");
            }
          }
        }
      } else if (signInResult.error) {
        // Other sign in errors (email not confirmed, etc.)
        setError(signInResult.error.message || "Failed to sign in. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-900">
        <div className="text-center">
          <img 
            src={KRAKEN_ICON_PATH} 
            alt="Kraken" 
            className="w-20 h-20 mx-auto mb-4 animate-pulse"
          />
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-900 p-4">
        <div className="bg-blue-50/90 dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full backdrop-blur-sm">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Get Kraken
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A habit tracker for sea monsters
            </p>
          </div>

          <div className="space-y-4">
            <InputField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAuth();
                }
              }}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAuth();
                }
              }}
            />

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleAuth}
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Signing in..." : "Log In"}
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              First time? Create a username and password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

