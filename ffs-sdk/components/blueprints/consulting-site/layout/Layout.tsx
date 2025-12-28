/**
 * Flying Fox Solutions - Consulting Site Layout
 *
 * Main layout component that combines sidebar and header for the consulting site.
 * Demonstrates how to build responsive layouts using atomic components.
 */

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { LayoutProps, NavigationConfig } from "../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const defaultNavigation: NavigationConfig = {
  brand: {
    name: "Consulting Pro",
    href: "/",
  },
  items: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    {
      id: "messaging",
      label: "Messaging",
      href: "/messaging",
      icon: "💬",
      badge: "3",
    },
    {
      id: "billing",
      label: "Billing",
      href: "/billing",
      icon: "💳",
    },
    {
      id: "pos",
      label: "POS / Orders",
      href: "/pos",
      icon: "🛒",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/analytics",
      icon: "📈",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "⚙️",
      children: [
        {
          id: "profile",
          label: "Profile",
          href: "/settings/profile",
          icon: "👤",
        },
        {
          id: "preferences",
          label: "Preferences",
          href: "/settings/preferences",
          icon: "🎨",
        },
        {
          id: "integrations",
          label: "Integrations",
          href: "/settings/integrations",
          icon: "🔗",
        },
      ],
    },
  ],
  userMenu: {
    profile: {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: "👤",
    },
    settings: {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "⚙️",
    },
    logout: {
      id: "logout",
      label: "Sign Out",
      href: "/logout",
      icon: "🚪",
    },
  },
};

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  navigation = defaultNavigation,
  className,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <div className={cx("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <Sidebar
            navigation={navigation}
            currentPath={window.location.pathname}
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
            user={user}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            user={user}
            onMenuToggle={handleSidebarToggle}
            onUserMenuToggle={handleUserMenuToggle}
            isUserMenuOpen={isUserMenuOpen}
          />

          {/* Page content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 {navigation.brand.name}. All rights reserved.
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <a
                  href="/privacy"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Terms
                </a>
                <a
                  href="/support"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Support
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {!isSidebarCollapsed && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={handleSidebarToggle}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800">
            <Sidebar
              navigation={navigation}
              currentPath={window.location.pathname}
              isCollapsed={false}
              onToggle={handleSidebarToggle}
              user={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};
