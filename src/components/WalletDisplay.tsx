/**
 * Get Kraken - Wallet Display Component
 *
 * Shows the treasure chest total prominently
 */

import type { Wallet } from "../types";
import { TREASURE_CHEST_LABEL, SEA_DOLLAR_ICON_PATH, CURRENCY_SYMBOL } from "../constants";

interface WalletDisplayProps {
  wallet: Wallet | null;
  loading: boolean;
  showDollarAmounts?: boolean;
}

export function WalletDisplay({ wallet, loading, showDollarAmounts = false }: WalletDisplayProps) {
  const total = wallet?.total ?? 0;
  const dollarTotal = wallet?.dollar_total ?? 0;
  const isNegative = total < 0;

  return (
    <div className="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-3xl p-6 shadow-xl">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 uppercase tracking-wide">
          {TREASURE_CHEST_LABEL}
        </h2>
        {/* Render wallet immediately - show 0 if loading, actual total when available */}
        <div className="flex items-center justify-center gap-3">
          <img src={SEA_DOLLAR_ICON_PATH} alt="Sea Dollar" className="w-12 h-12" />
          <span
            className={`text-6xl font-bold ${
              isNegative
                ? "text-red-600 dark:text-red-400"
                : "text-amber-900 dark:text-amber-100"
            } ${loading ? "opacity-50" : ""}`}
          >
            {loading ? "0" : total}
          </span>
          {showDollarAmounts && (
            <>
              <span className="text-4xl text-amber-900 dark:text-amber-100 font-bold">|</span>
              <span className="text-4xl">{CURRENCY_SYMBOL}</span>
              <span
                className={`text-6xl font-bold ${
                  dollarTotal < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-900 dark:text-amber-100"
                } ${loading ? "opacity-50" : ""}`}
              >
                {loading ? "0" : Math.round(dollarTotal)}
              </span>
            </>
          )}
        </div>
        {!loading && isNegative && (
          <p className="text-sm text-amber-900 dark:text-amber-100 mt-2 opacity-75">
            Negative balance allowed
          </p>
        )}
      </div>
    </div>
  );
}
