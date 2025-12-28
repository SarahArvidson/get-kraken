/**
 * Kibblings - Wallet Display Component
 *
 * Shows the shared wallet total prominently
 */

import type { Wallet } from "../types";

interface WalletDisplayProps {
  wallet: Wallet | null;
  loading: boolean;
}

export function WalletDisplay({ wallet, loading }: WalletDisplayProps) {
  const total = wallet?.total ?? 0;
  const isNegative = total < 0;

  return (
    <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-3xl p-6 shadow-xl">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 uppercase tracking-wide">
          Shared Wallet
        </h2>
        {loading ? (
          <div className="text-4xl font-bold text-amber-900 dark:text-amber-100">
            ...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl">🟡</span>
            <span
              className={`text-6xl font-bold ${
                isNegative
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-900 dark:text-amber-100"
              }`}
            >
              {total}
            </span>
          </div>
        )}
        {!loading && isNegative && (
          <p className="text-sm text-amber-900 dark:text-amber-100 mt-2 opacity-75">
            Negative balance allowed
          </p>
        )}
      </div>
    </div>
  );
}
