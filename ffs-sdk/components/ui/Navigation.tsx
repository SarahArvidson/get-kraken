/**
 * Flying Fox Solutions - Navigation Component
 *
 * Flexible navigation system supporting multiple layouts and interaction patterns.
 * Perfect for web apps, dashboards, and POS systems with diverse navigation needs.
 *
 * Features:
 * - Multiple layouts (horizontal, vertical, sidebar, tabs)
 * - Nested menu support with icons
 * - Active state management
 * - Responsive behavior
 * - Customizable styling
 * - Breadcrumb integration
 * - Search functionality
 *
 * Usage:
 * ```tsx
 * import { Navigation } from "@ffx/sdk";
 *
 * const menuItems = [
 *   { key: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/' },
 *   { key: 'products', label: 'Products', icon: '📦', path: '/products' },
 *   {
 *     key: 'settings',
 *     label: 'Settings',
 *     icon: '⚙️',
 *     children: [
 *       { key: 'profile', label: 'Profile', path: '/settings/profile' },
 *       { key: 'billing', label: 'Billing', path: '/settings/billing' }
 *     ]
 *   }
 * ];
 *
 * <Navigation
 *   items={menuItems}
 *   layout="sidebar"
 *   activeKey="dashboard"
 *   onItemClick={(item) => navigate(item.path)}
 * />
 * ```
 */

import React, { useState, useCallback } from "react";
import InputField from "./InputField";
import Button from "./Button";

export interface NavigationItem {
  key: string;
  label: string;
  icon?: React.ReactNode | string;
  path?: string;
  badge?: string | number;
  disabled?: boolean;
  hidden?: boolean;
  children?: NavigationItem[];
  className?: string;
  onClick?: (item: NavigationItem) => void;
}

export interface NavigationProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Layout style */
  layout?: "horizontal" | "vertical" | "sidebar" | "tabs" | "breadcrumb";
  /** Currently active item key */
  activeKey?: string;
  /** Item click handler */
  onItemClick?: (item: NavigationItem) => void;
  /** Show search functionality */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Collapsible sidebar */
  collapsible?: boolean;
  /** Initially collapsed state */
  defaultCollapsed?: boolean;
  /** Custom className */
  className?: string;
  /** Custom item renderer */
  renderItem?: (item: NavigationItem, level: number) => React.ReactNode;
  /** Show icons */
  showIcons?: boolean;
  /** Show badges */
  showBadges?: boolean;
  /** Maximum nesting level */
  maxLevel?: number;
  /** Theme variant */
  variant?: "default" | "minimal" | "rounded" | "pills";
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function Navigation({
  items,
  layout = "vertical",
  activeKey,
  onItemClick,
  searchable = false,
  searchPlaceholder = "Search navigation...",
  collapsible = false,
  defaultCollapsed = false,
  className,
  renderItem,
  showIcons = true,
  showBadges = true,
  maxLevel = 3,
  variant = "default",
}: NavigationProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Filter items based on search
  const filterItems = useCallback(
    (items: NavigationItem[], term: string): NavigationItem[] => {
      if (!term) return items;

      const filtered: NavigationItem[] = [];

      items.forEach((item) => {
        if (item.hidden) return;

        const matchesSearch = item.label
          .toLowerCase()
          .includes(term.toLowerCase());
        const filteredChildren = item.children
          ? filterItems(item.children, term)
          : [];

        if (matchesSearch || filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children:
              filteredChildren.length > 0 ? filteredChildren : item.children,
          });
        }
      });

      return filtered;
    },
    []
  );

  const filteredItems = searchTerm ? filterItems(items, searchTerm) : items;

  // Handle item click
  const handleItemClick = useCallback(
    (item: NavigationItem, event?: React.MouseEvent) => {
      if (item.disabled) return;

      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Handle expansion for items with children
      if (item.children && item.children.length > 0) {
        setExpandedKeys((prev) =>
          prev.includes(item.key)
            ? prev.filter((key) => key !== item.key)
            : [...prev, item.key]
        );
      }

      // Call custom onClick or parent handler
      if (item.onClick) {
        item.onClick(item);
      } else if (onItemClick) {
        onItemClick(item);
      }
    },
    [onItemClick]
  );

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // Render navigation item
  const renderNavigationItem = useCallback(
    (item: NavigationItem, level: number = 0): React.ReactNode => {
      if (item.hidden || level > maxLevel) return null;

      const isActive = activeKey === item.key;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedKeys.includes(item.key);
      const indent = level * (collapsed ? 0 : 20);

      // Use custom renderer if provided
      if (renderItem) {
        return renderItem(item, level);
      }

      const itemContent = (
        <div
          className={cx(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200",
            // Layout-specific styles
            layout === "horizontal" && "hover:bg-gray-100 rounded-md",
            layout === "vertical" && "hover:bg-gray-100 rounded-md",
            layout === "sidebar" && "hover:bg-gray-100",
            layout === "tabs" &&
              "border-b-2 border-transparent hover:border-gray-300",
            layout === "breadcrumb" && "hover:text-blue-600",

            // Variant styles
            variant === "minimal" && "hover:bg-gray-50",
            variant === "rounded" && "rounded-lg hover:bg-gray-100",
            variant === "pills" && "rounded-full hover:bg-gray-100",

            // Active state
            isActive && layout === "horizontal" && "bg-blue-100 text-blue-700",
            isActive && layout === "vertical" && "bg-blue-100 text-blue-700",
            isActive &&
              layout === "sidebar" &&
              "bg-blue-100 text-blue-700 border-r-2 border-blue-600",
            isActive && layout === "tabs" && "border-blue-600 text-blue-600",
            isActive &&
              layout === "breadcrumb" &&
              "text-blue-600 font-semibold",

            // Disabled state
            item.disabled && "opacity-50 cursor-not-allowed",

            // Interactive state
            !item.disabled && "cursor-pointer",

            // Custom className
            item.className
          )}
          style={{
            paddingLeft:
              layout === "sidebar" && !collapsed
                ? `${16 + indent}px`
                : undefined,
          }}
          onClick={(e) => handleItemClick(item, e)}
        >
          {/* Icon */}
          {showIcons && item.icon && (
            <span
              className={cx(
                "flex-shrink-0",
                collapsed && layout === "sidebar" ? "mx-auto" : "",
                typeof item.icon === "string" ? "text-lg" : ""
              )}
            >
              {item.icon}
            </span>
          )}

          {/* Label */}
          {(!collapsed || layout !== "sidebar") && (
            <span className="flex-1 truncate">{item.label}</span>
          )}

          {/* Badge */}
          {showBadges && item.badge && (!collapsed || layout !== "sidebar") && (
            <span
              className={cx(
                "inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full",
                typeof item.badge === "number" && item.badge > 0
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              {item.badge}
            </span>
          )}

          {/* Expand/collapse indicator */}
          {hasChildren && (!collapsed || layout !== "sidebar") && (
            <span
              className={cx(
                "flex-shrink-0 transition-transform duration-200",
                isExpanded ? "rotate-90" : "rotate-0"
              )}
            >
              ▶
            </span>
          )}
        </div>
      );

      return (
        <div key={item.key} className="navigation-item">
          {itemContent}

          {/* Children */}
          {hasChildren &&
            isExpanded &&
            (!collapsed || layout !== "sidebar") && (
              <div
                className={cx(
                  "navigation-children",
                  layout === "sidebar" && "border-l border-gray-200 ml-4"
                )}
              >
                {item.children!.map((child) =>
                  renderNavigationItem(child, level + 1)
                )}
              </div>
            )}
        </div>
      );
    },
    [
      activeKey,
      expandedKeys,
      collapsed,
      layout,
      variant,
      maxLevel,
      renderItem,
      showIcons,
      showBadges,
      handleItemClick,
    ]
  );

  // Layout-specific container classes
  const containerClasses = cx(
    "ffx-navigation",
    // Base layout classes
    layout === "horizontal" && "flex items-center space-x-1",
    layout === "vertical" && "flex flex-col space-y-1",
    layout === "sidebar" &&
      cx(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      ),
    layout === "tabs" && "flex border-b border-gray-200",
    layout === "breadcrumb" && "flex items-center space-x-2",

    // Custom className
    className
  );

  // Breadcrumb separator
  const renderBreadcrumbSeparator = () => (
    <span className="text-gray-400 mx-2">/</span>
  );

  return (
    <nav className={containerClasses}>
      {/* Sidebar header with collapse toggle */}
      {layout === "sidebar" && collapsible && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <span className="font-semibold text-gray-900">Menu</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="p-1"
          >
            {collapsed ? "→" : "←"}
          </Button>
        </div>
      )}

      {/* Search */}
      {searchable && (!collapsed || layout !== "sidebar") && (
        <div
          className={cx(
            "search-container",
            layout === "sidebar" ? "p-4 border-b border-gray-200" : "mb-4"
          )}
        >
          <InputField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full"
          />
        </div>
      )}

      {/* Navigation items */}
      <div
        className={cx(
          "navigation-items",
          layout === "sidebar" && "flex-1 overflow-y-auto p-2",
          layout === "vertical" && "space-y-1",
          layout === "horizontal" && "flex space-x-1",
          layout === "tabs" && "flex",
          layout === "breadcrumb" && "flex items-center"
        )}
      >
        {layout === "breadcrumb"
          ? // Breadcrumb layout - flatten hierarchy
            filteredItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && renderBreadcrumbSeparator()}
                {renderNavigationItem(item, 0)}
              </React.Fragment>
            ))
          : // Other layouts - preserve hierarchy
            filteredItems.map((item) => renderNavigationItem(item, 0))}
      </div>

      {/* Sidebar footer */}
      {layout === "sidebar" && !collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">Navigation Footer</div>
        </div>
      )}
    </nav>
  );
}

// Navigation hook for managing state
export function useNavigation(
  items: NavigationItem[],
  initialActiveKey?: string
) {
  const [activeKey, setActiveKey] = useState<string | undefined>(
    initialActiveKey
  );
  const [history, setHistory] = useState<string[]>(
    initialActiveKey ? [initialActiveKey] : []
  );

  const navigate = useCallback((key: string) => {
    setActiveKey(key);
    setHistory((prev) => [...prev.filter((k) => k !== key), key]);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const previous = newHistory[newHistory.length - 1];
      setActiveKey(previous);
      setHistory(newHistory);
    }
  }, [history]);

  const findItem = useCallback((key: string): NavigationItem | null => {
    const search = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.key === key) return item;
        if (item.children) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(items);
  }, []);

  const getBreadcrumbs = useCallback(
    (key?: string): NavigationItem[] => {
      const targetKey = key || activeKey;
      if (!targetKey) return [];

      const breadcrumbs: NavigationItem[] = [];

      const buildPath = (
        items: NavigationItem[],
        path: NavigationItem[] = []
      ): boolean => {
        for (const item of items) {
          const currentPath = [...path, item];

          if (item.key === targetKey) {
            breadcrumbs.push(...currentPath);
            return true;
          }

          if (item.children && buildPath(item.children, currentPath)) {
            return true;
          }
        }
        return false;
      };

      buildPath(items);
      return breadcrumbs;
    },
    [items, activeKey]
  );

  return {
    activeKey,
    history,
    navigate,
    goBack,
    findItem,
    getBreadcrumbs,
    canGoBack: history.length > 1,
  };
}

export default Navigation;
