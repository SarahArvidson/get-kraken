/**
 * Flying Fox Solutions - Consulting Site Header
 *
 * Top header component with user menu and mobile navigation toggle.
 * Demonstrates how to build responsive headers using atomic components.
 */

import React, { useState } from "react";
import { Button, Modal } from "../../../";
import type { HeaderProps } from "../types";

export const Header: React.FC<HeaderProps> = ({
  user,
  onMenuToggle,
  onUserMenuToggle,
  isUserMenuOpen,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Left side - Mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
              aria-label="Toggle navigation menu"
            >
              ☰
            </Button>

            {/* Breadcrumb or page title could go here */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Right side - User menu and actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              aria-label="Search"
            >
              🔍
            </Button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={onUserMenuToggle}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role}
                    </p>
                  </div>
                  <span className="text-gray-400">▼</span>
                </Button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        👤 Profile
                      </a>
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        ⚙️ Settings
                      </a>
                      <a
                        href="/billing"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        💳 Billing
                      </a>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          // Handle logout
                          console.log("Logout clicked");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🚪 Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" href="/login">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" href="/signup">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu modal */}
      <Modal
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        title="Navigation"
        size="sm"
      >
        <div className="space-y-4">
          <a
            href="/dashboard"
            className="block px-4 py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            📊 Dashboard
          </a>
          <a
            href="/messaging"
            className="block px-4 py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            💬 Messaging
          </a>
          <a
            href="/billing"
            className="block px-4 py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            💳 Billing
          </a>
          <a
            href="/pos"
            className="block px-4 py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            🛒 POS
          </a>
          <a
            href="/settings"
            className="block px-4 py-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ⚙️ Settings
          </a>
        </div>
      </Modal>
    </>
  );
};
