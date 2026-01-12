/**
 * Get Kraken v2 - Hamburger Menu Component
 * 
 * Mobile-first drawer/overlay menu for navigation
 */

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/quests', label: 'Quests', icon: '⚔️' },
  { path: '/rewards', label: 'Rewards', icon: '🎁' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/how-to-use', label: 'How to use', icon: '❓' },
];

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Drawer - Opens from right side to match hamburger icon position */}
      <div
        className="fixed inset-y-0 right-0 w-64 sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              aria-label="Close menu"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors touch-manipulation flex items-center gap-3 ${
                        isActive
                          ? 'bg-amber-500 text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-lg">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            
            {/* Sign Out Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={async () => {
                  await supabase.supabase.auth.signOut();
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-lg transition-colors touch-manipulation flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="text-2xl">🚪</span>
                <span className="text-lg">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
