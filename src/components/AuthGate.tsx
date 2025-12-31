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

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      // Try to sign in with email (username as email)
      const email = username.includes("@") ? username : `${username}@getkraken.local`;
      
      // Try to sign in first
      const signInResult = await supabase.signIn({
        email,
        password,
      });

      if (signInResult.error) {
        // If sign in fails, try to sign up
        const signUpResult = await supabase.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });

        if (signUpResult.error) {
          setError(signUpResult.error.message || "Failed to create account");
        } else {
          // Check if user needs email confirmation
          if (signUpResult.data?.user && !signUpResult.data?.session) {
            // User created but needs email confirmation
            setError("Account created! Please check your email to confirm your account, then try logging in again.");
            return;
          }
          
          // If we have a session, user is already logged in
          if (signUpResult.data?.session) {
            setIsAuthenticated(true);
            return;
          }
          
          // Try to sign in after sign up (if email confirmation is disabled)
          const autoSignInResult = await supabase.signIn({
            email,
            password,
          });

          if (autoSignInResult.error) {
            // Check if it's an email confirmation error
            if (autoSignInResult.error.message?.includes("email") || 
                autoSignInResult.error.message?.includes("confirm")) {
              setError("Please check your email to confirm your account, then try logging in again.");
            } else {
              setError(autoSignInResult.error.message || "Account created but login failed. Please try again.");
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoggingIn(false);
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
                  handleLogin();
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
                  handleLogin();
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
              onClick={handleLogin}
              loading={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              First time? Enter a username and password to create your account.
              Your device will remember you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

