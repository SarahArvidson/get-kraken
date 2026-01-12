/**
 * Get Kraken v2 - Settings Page
 * 
 * Full settings page with collapsible sections
 */

import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <span className="text-gray-500 dark:text-gray-400">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      <div className="space-y-4">
        {/* Appearance Section */}
        <CollapsibleSection title="Appearance" defaultOpen={true}>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Appearance controls coming in Step 2...
          </p>
        </CollapsibleSection>

        {/* Wallet and Currencies Section */}
        <CollapsibleSection title="Wallet and Currencies" defaultOpen={true}>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Currency visibility toggles coming in Step 3...
          </p>
        </CollapsibleSection>

        {/* Account Section */}
        <CollapsibleSection title="Account">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Account controls coming in Step 4...
          </p>
        </CollapsibleSection>

        {/* Data Section */}
        <CollapsibleSection title="Data">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Data export coming in Step 5...
          </p>
        </CollapsibleSection>

        {/* Social (Beta) Section */}
        <CollapsibleSection title="Social (Beta)">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Social features toggle coming in Step 6...
          </p>
        </CollapsibleSection>

        {/* Danger Zone Section */}
        <CollapsibleSection title="Danger Zone">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              <strong>Warning:</strong> Actions in this section are destructive and cannot be undone.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Danger zone actions coming in Step 7...
            </p>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
