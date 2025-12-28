import React, { useState } from "react";
import { Button, Spinner, Toast } from "../ui";
import { useInvoices } from "./hooks/useInvoices";

/**
 * InvoiceList Component
 * ---------------------
 * Displays a list of past invoices with download functionality.
 * Shows invoice status, dates, amounts, and provides PDF download links.
 */

export interface InvoiceListProps {
  /** Custom CSS classes for the container */
  className?: string;
  /** Maximum number of invoices to display */
  limit?: number;
  /** Whether to show the invoice status filter */
  showStatusFilter?: boolean;
  /** Whether to show the download all button */
  showDownloadAll?: boolean;
  /** Custom title for the invoice list */
  title?: string;
  /** Callback when an invoice is downloaded */
  onInvoiceDownload?: (invoiceId: string) => void;
  /** Callback when an invoice is downloaded (alias for compatibility) */
  onDownloadInvoice?: (invoiceId: string) => void;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

// ✅ Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ✅ Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    case "pending":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
    case "failed":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    case "draft":
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
  }
};

// ✅ Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "pending":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "failed":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "draft":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

// ✅ Toast message interface
interface ToastMessage {
  id: number;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  show: boolean;
}

function InvoiceList({
  className,
  limit,
  showStatusFilter = true,
  showDownloadAll = false,
  title = "Invoice History",
  onInvoiceDownload,
}: InvoiceListProps) {
  const { invoices, loading, error, downloadInvoice } = useInvoices();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [downloadingInvoices, setDownloadingInvoices] = useState<Set<string>>(
    new Set()
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ✅ Toast management
  const addToast = (message: string, variant: ToastMessage["variant"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant, show: true }]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // ✅ Handle invoice download
  const handleInvoiceDownload = async (invoiceId: string) => {
    setDownloadingInvoices((prev) => new Set(prev).add(invoiceId));

    try {
      await downloadInvoice(invoiceId);
      addToast("Invoice downloaded successfully!", "success");
      onInvoiceDownload?.(invoiceId);
    } catch (error) {
      addToast("Failed to download invoice. Please try again.", "error");
    } finally {
      setDownloadingInvoices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invoiceId);
        return newSet;
      });
    }
  };

  // ✅ Handle download all
  const handleDownloadAll = async () => {
    const paidInvoices = filteredInvoices.filter(
      (invoice) => invoice.status === "paid"
    );

    if (paidInvoices.length === 0) {
      addToast("No paid invoices available for download.", "info");
      return;
    }

    addToast(`Downloading ${paidInvoices.length} invoices...`, "info");

    // Download all paid invoices
    for (const invoice of paidInvoices) {
      try {
        await downloadInvoice(invoice.id);
      } catch (error) {
        console.error(`Failed to download invoice ${invoice.id}:`, error);
      }
    }

    addToast("All invoices downloaded successfully!", "success");
  };

  // ✅ Filter invoices by status
  const filteredInvoices = invoices
    .filter(
      (invoice) => statusFilter === "all" || invoice.status === statusFilter
    )
    .slice(0, limit);

  // ✅ Get unique statuses for filter
  const availableStatuses = Array.from(
    new Set(invoices.map((invoice) => invoice.status))
  );

  if (loading) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
      >
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading invoices...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
      >
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <svg
              className="h-8 w-8 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {showDownloadAll && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadAll}
              disabled={
                filteredInvoices.filter((invoice) => invoice.status === "paid")
                  .length === 0
              }
            >
              Download All
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      {showStatusFilter && availableStatuses.length > 1 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={cx(
                  "px-3 py-1 text-sm font-medium rounded-full transition-colors",
                  statusFilter === "all"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                All ({invoices.length})
              </button>
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cx(
                    "px-3 py-1 text-sm font-medium rounded-full transition-colors capitalize",
                    statusFilter === status
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  )}
                >
                  {status} (
                  {
                    invoices.filter((invoice) => invoice.status === status)
                      .length
                  }
                  )
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredInvoices.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg
              className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === "all"
                ? "You don't have any invoices yet."
                : `No invoices with status "${statusFilter}" found.`}
            </p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invoice.number}
                    </h3>
                    <span
                      className={cx(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(invoice.status)
                      )}
                    >
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {formatDate(invoice.date)}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span>{" "}
                      {formatDate(invoice.dueDate)}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>{" "}
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Plan:</span>{" "}
                    {invoice.planName}
                  </div>

                  {invoice.description && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.description}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center gap-2">
                  {invoice.status === "paid" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={downloadingInvoices.has(invoice.id)}
                      onClick={() => handleInvoiceDownload(invoice.id)}
                    >
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download
                    </Button>
                  )}

                  {invoice.status === "pending" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        // In real implementation, redirect to payment page
                        addToast("Redirecting to payment page...", "info");
                      }}
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast Stack */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => removeToast(toast.id)}
          className={`top-${4 + index * 20}`}
        />
      ))}
    </div>
  );
}

export default InvoiceList;
