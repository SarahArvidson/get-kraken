/**
 * Flying Fox Solutions - Consulting Site Sidebar
 *
 * Responsive sidebar navigation component for the consulting site archetype.
 * Demonstrates how to build navigation using atomic components.
 */

import React from "react";
import { Button } from "../../../";
import type { SidebarProps, NavigationItem } from "../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Sidebar: React.FC<SidebarProps> = ({
  navigation,
  currentPath,
  isCollapsed,
  onToggle,
  user,
}) => {
  const isActive = (href: string) => {
    if (href === "/" && currentPath === "/") return true;
    if (href !== "/" && currentPath.startsWith(href)) return true;
    return false;
  };

  const renderNavItem = (item: NavigationItem) => (
    <li key={item.id}>
      <a
        href={item.href}
        className={cx(
          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isActive(item.href)
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        {item.icon && (
          <span className={cx("mr-3", isCollapsed ? "mr-0" : "")}>
            {item.icon}
          </span>
        )}
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </a>
      {!isCollapsed && item.children && (
        <ul className="mt-2 ml-6 space-y-1">
          {item.children.map(renderNavItem)}
        </ul>
      )}
    </li>
  );

  return (
    <div
      className={cx(
        "flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {navigation.brand.name.charAt(0)}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {navigation.brand.name}
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">
              {navigation.brand.name.charAt(0)}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">{navigation.items.map(renderNavItem)}</ul>
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
