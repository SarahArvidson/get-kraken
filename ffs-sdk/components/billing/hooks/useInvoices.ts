import { useState, useEffect, useCallback } from "react";

/**
 * Invoices Hook
 * -------------
 * A custom hook for managing invoice data and history.
 * Currently uses mock data but designed to easily integrate with Stripe, Square, or Supabase billing.
 */

export interface Invoice {
  /** Unique invoice identifier */
  id: string;
  /** Invoice number for display */
  number: string;
  /** Invoice creation date */
  date: string;
  /** Invoice due date */
  dueDate: string;
  /** Invoice status */
  status: "paid" | "pending" | "failed" | "draft";
  /** Total amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Tax amount */
  tax?: number;
  /** Discount amount */
  discount?: number;
  /** Description of the invoice */
  description: string;
  /** Plan name */
  planName: string;
  /** Billing period start */
  periodStart: string;
  /** Billing period end */
  periodEnd: string;
  /** Download URL for PDF */
  downloadUrl?: string;
  /** Payment method used */
  paymentMethod?: {
    type: "card" | "bank" | "paypal";
    last4?: string;
    brand?: string;
  };
}

export interface UseInvoicesReturn {
  /** Array of invoices */
  invoices: Invoice[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh invoices */
  refresh: () => Promise<void>;
  /** Download invoice PDF */
  downloadInvoice: (invoiceId: string) => Promise<void>;
  /** Get invoice by ID */
  getInvoice: (invoiceId: string) => Invoice | undefined;
}

// ✅ Mock invoice data generator
const generateMockInvoices = (): Invoice[] => {
  const now = new Date();
  const invoices: Invoice[] = [];

  // Generate 12 months of invoices
  for (let i = 0; i < 12; i++) {
    const invoiceDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
    const periodStart = new Date(
      invoiceDate.getFullYear(),
      invoiceDate.getMonth(),
      1
    );
    const periodEnd = new Date(
      invoiceDate.getFullYear(),
      invoiceDate.getMonth() + 1,
      0
    );

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${i}`,
      number: `INV-${String(invoiceDate.getFullYear()).slice(-2)}${String(
        invoiceDate.getMonth() + 1
      ).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
      date: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: i < 3 ? "paid" : i === 3 ? "pending" : "paid",
      amount: 29.99,
      currency: "USD",
      tax: 2.4,
      discount: i === 0 ? 5.0 : undefined,
      description: `Professional Plan - ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
      planName: "Professional Plan",
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      downloadUrl: `/api/invoices/${i}/download`,
      paymentMethod: {
        type: "card",
        last4: "4242",
        brand: "visa",
      },
    };

    invoices.push(invoice);
  }

  return invoices;
};

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock API response
      const mockInvoices = generateMockInvoices();
      setInvoices(mockInvoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Download invoice PDF
  const downloadInvoice = useCallback(
    async (invoiceId: string) => {
      try {
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock download - in real implementation, this would trigger a file download
        console.log(`Downloading invoice: ${invoiceId}`);

        // Create a mock download link
        const invoice = invoices.find((inv) => inv.id === invoiceId);
        if (invoice) {
          // Simulate PDF download
          const link = document.createElement("a");
          link.href = invoice.downloadUrl || "#";
          link.download = `invoice-${invoice.number}.pdf`;
          link.click();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to download invoice"
        );
        throw err;
      }
    },
    [invoices]
  );

  // ✅ Get invoice by ID
  const getInvoice = useCallback(
    (invoiceId: string) => {
      return invoices.find((invoice) => invoice.id === invoiceId);
    },
    [invoices]
  );

  // ✅ Initial data fetch
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
    downloadInvoice,
    getInvoice,
  };
}
