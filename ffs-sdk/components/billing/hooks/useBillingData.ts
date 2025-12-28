import { useState, useEffect, useCallback } from "react";

/**
 * Billing Data Hook
 * ----------------
 * A custom hook for managing billing data and subscription information.
 * Currently uses mock data but designed to easily integrate with Stripe, Square, or Supabase billing.
 */

export interface BillingData {
  /** Current subscription plan */
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: "monthly" | "yearly" | "one-time";
    status: "active" | "trial" | "expired" | "cancelled";
    trialEndsAt?: string;
    nextBillingDate?: string;
  };
  /** Payment method information */
  paymentMethod: {
    id: string;
    type: "card" | "bank" | "paypal";
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
  } | null;
  /** Current billing status */
  status: {
    isActive: boolean;
    isTrial: boolean;
    isExpired: boolean;
    isCancelled: boolean;
    daysUntilRenewal?: number;
    trialDaysRemaining?: number;
  };
  /** Usage information */
  usage: {
    currentPeriodStart: string;
    currentPeriodEnd: string;
    itemsUsed: number;
    itemsLimit: number;
    overageAmount?: number;
  };
}

export interface UseBillingDataReturn {
  /** Current billing data */
  data: BillingData | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh billing data */
  refresh: () => Promise<void>;
  /** Update payment method */
  updatePaymentMethod: (
    paymentMethod: Partial<BillingData["paymentMethod"]>
  ) => Promise<void>;
  /** Cancel subscription */
  cancelSubscription: () => Promise<void>;
  /** Reactivate subscription */
  reactivateSubscription: () => Promise<void>;
}

// ✅ Mock billing data generator
const generateMockBillingData = (): BillingData => {
  const now = new Date();
  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  return {
    plan: {
      id: "pro",
      name: "Professional Plan",
      price: 29.99,
      currency: "USD",
      billingCycle: "monthly",
      status: "active",
      nextBillingDate: nextMonth.toISOString(),
    },
    paymentMethod: {
      id: "pm_1234567890",
      type: "card",
      last4: "4242",
      brand: "visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    status: {
      isActive: true,
      isTrial: false,
      isExpired: false,
      isCancelled: false,
      daysUntilRenewal: 15,
    },
    usage: {
      currentPeriodStart: new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString(),
      currentPeriodEnd: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString(),
      itemsUsed: 45,
      itemsLimit: 100,
    },
  };
};

export function useBillingData(): UseBillingDataReturn {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch billing data
  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock API response
      const mockData = generateMockBillingData();
      setData(mockData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch billing data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Update payment method
  const updatePaymentMethod = useCallback(
    async (paymentMethod: Partial<BillingData["paymentMethod"]>) => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Update local data
        setData((prev) =>
          prev
            ? {
                ...prev,
                paymentMethod: {
                  ...prev.paymentMethod,
                  ...paymentMethod,
                } as BillingData["paymentMethod"],
              }
            : null
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update payment method"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ✅ Cancel subscription
  const cancelSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local data
      setData((prev) =>
        prev
          ? {
              ...prev,
              plan: {
                ...prev.plan,
                status: "cancelled",
              },
              status: {
                ...prev.status,
                isActive: false,
                isCancelled: true,
              },
            }
          : null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel subscription"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Reactivate subscription
  const reactivateSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local data
      setData((prev) =>
        prev
          ? {
              ...prev,
              plan: {
                ...prev.plan,
                status: "active",
              },
              status: {
                ...prev.status,
                isActive: true,
                isCancelled: false,
              },
            }
          : null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reactivate subscription"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Initial data fetch
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    data,
    loading,
    error,
    refresh: fetchBillingData,
    updatePaymentMethod,
    cancelSubscription,
    reactivateSubscription,
  };
}
