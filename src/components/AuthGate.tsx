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
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
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

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert username to fake email for Supabase
      const email = usernameToEmail(username);
      const result = await supabase.signIn({
        email,
        password,
      });

      if (result.error) {
        // Check if user already exists (trying to sign in but account doesn't exist or wrong password)
        if (result.error.message?.includes("Invalid login credentials") || 
            result.error.message?.includes("Email not confirmed")) {
          setError(result.error.message);
        } else {
          setError(result.error.message || "Failed to sign in. Please check your credentials.");
        }
      } else if (result.data?.session) {
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
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
      const result = await supabase.signUp({
        email,
        password,
      });

      if (result.error) {
        // Check if user already exists
        if (result.error.message?.includes("already registered") || 
            result.error.message?.includes("already exists") ||
            result.error.message?.includes("User already registered")) {
          setError("That username is already taken. Please sign in instead.");
          // Switch to sign in mode with username prefilled
          setAuthMode("signin");
          return;
        }
        setError(result.error.message || "Failed to create account");
      } else {
        // Check if user needs email confirmation
        if (result.data?.user && !result.data?.session) {
          setError("Account created! Please check your email to confirm your account, then sign in.");
          setAuthMode("signin");
        } else if (result.data?.session) {
          // Email confirmation disabled, user is logged in
          setIsAuthenticated(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
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
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setError(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  authMode === "signin"
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  authMode === "signup"
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Sign Up
              </button>
            </div>

            <InputField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  authMode === "signin" ? handleSignIn() : handleSignUp();
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
                  authMode === "signin" ? handleSignIn() : handleSignUp();
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
              onClick={authMode === "signin" ? handleSignIn : handleSignUp}
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting 
                ? (authMode === "signin" ? "Signing in..." : "Creating account...")
                : (authMode === "signin" ? "Sign In" : "Sign Up")
              }
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {authMode === "signin" 
                ? "Don't have an account? Click 'Sign Up' above."
                : "Already have an account? Click 'Sign In' above."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

