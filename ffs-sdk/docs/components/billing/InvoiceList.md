# InvoiceList Component

## Overview

The `InvoiceList` component displays a user's invoice history in a clean, organized table format. It provides download functionality for invoices and handles loading, error, and empty states gracefully.

## Features

- **Invoice Table**: Organized display of invoice history with key details
- **Download Functionality**: Download links for each invoice
- **Status Indicators**: Visual status badges (paid, due, failed)
- **Loading States**: Spinner display while fetching invoice data
- **Error Handling**: Error message display for failed data loading
- **Empty State**: Message when no invoices are found
- **Responsive Design**: Mobile-friendly table layout

## Location

```
components/billing/InvoiceList.tsx
```

## Props

| Prop                | Type                          | Default     | Description                          |
| ------------------- | ----------------------------- | ----------- | ------------------------------------ |
| `onDownloadInvoice` | `(invoiceId: string) => void` | `undefined` | Callback when download is clicked    |
| `className`         | `string`                      | `undefined` | Custom CSS classes for the container |

## Type Definitions

```typescript
interface Invoice {
  id: string; // Invoice ID (e.g., "INV-001")
  date: string; // Invoice date (e.g., "2024-06-20")
  amount: number; // Invoice amount (decimal)
  currency: string; // Currency symbol (e.g., "$")
  status: "paid" | "due" | "failed"; // Invoice status
  downloadUrl: string; // URL for invoice download
}
```

## Usage Examples

### Basic Usage

```tsx
import { InvoiceList } from "@ffx/components/billing";

function InvoicesPage() {
  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Downloading invoice:", invoiceId);
    // API call to download invoice
  };

  return (
    <div className="max-w-6xl">
      <InvoiceList onDownloadInvoice={handleDownloadInvoice} />
    </div>
  );
}
```

### With Custom Styling

```tsx
import { InvoiceList } from "@ffx/components/billing";

function InvoicesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Invoice History</h1>
      <InvoiceList className="shadow-lg" />
    </div>
  );
}
```

### In Dashboard Layout

```tsx
import {
  InvoiceList,
  BillingSummary,
  PaymentMethodForm,
} from "@ffx/components/billing";

function BillingDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <BillingSummary />
      </div>
      <div>
        <InvoiceList />
      </div>
    </div>
  );
}
```

## Table Structure

### Column Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Invoice ID        Date          Amount        Status        │
├─────────────────────────────────────────────────────────────┤
│ INV-001          2024-06-20    $19.99        Paid          │
│ INV-002          2024-05-20    $19.99        Paid          │
│ INV-003          2024-04-20    $19.99        Paid          │
└─────────────────────────────────────────────────────────────┘
```

### Status Badges

- **Paid**: Green background with checkmark
- **Due**: Yellow background with clock icon
- **Failed**: Red background with X icon

## States

### Loading State

- Shows centered spinner with "Loading invoices..." text
- Uses `Spinner` component with medium size
- Maintains consistent spacing and styling

### Error State

- Red background with error message
- Clear error text: "Error: {error message} Please try again later."
- Rounded corners and proper padding

### Empty State

- Gray background with "No invoices found." message
- Maintains consistent styling with other states

### Success State

- Table with invoice data
- Interactive download buttons
- Status badges with appropriate colors

## Accessibility

- **Table Structure**: Proper table headers and data cells
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper table markup for screen readers
- **Focus Management**: Clear focus indicators on buttons
- **ARIA Labels**: Proper labeling for download actions

## Styling

### Table Layout

- **Header**: Gray background with bold text
- **Rows**: Alternating row colors for readability
- **Borders**: Subtle borders between cells
- **Responsive**: Horizontal scroll on mobile devices

### Status Badges

```css
/* Paid Status */
.bg-green-100 .text-green-800 dark:bg-green-900/20 dark:text-green-200

/* Due Status */
.bg-yellow-100 .text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200

/* Failed Status */
.bg-red-100 .text-red-800 dark:bg-red-900/20 dark:text-red-200
```

### Typography

- **Headers**: Small, uppercase, medium weight
- **Data**: Regular text with proper contrast
- **Amounts**: Bold for emphasis
- **Dates**: Consistent date formatting

## Integration

### With Other Billing Components

```tsx
import {
  InvoiceList,
  BillingSummary,
  PlanSelector,
} from "@ffx/components/billing";

function BillingDashboard() {
  return (
    <div className="space-y-8">
      <BillingSummary />
      <PlanSelector plans={plans} onSelectPlan={handleSelect} />
      <InvoiceList onDownloadInvoice={handleDownload} />
    </div>
  );
}
```

### With Custom Download Handler

```tsx
import { InvoiceList } from "@ffx/components/billing";

function InvoicesPage() {
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return <InvoiceList onDownloadInvoice={handleDownloadInvoice} />;
}
```

## Best Practices

### 1. **Data Management**

- Fetch invoices from reliable API
- Handle network errors appropriately
- Cache invoice data for better performance
- Validate invoice data structure

### 2. **User Experience**

- Show loading states during data fetch
- Provide clear error messages
- Handle empty states gracefully
- Make download actions obvious

### 3. **Security**

- Validate invoice access permissions
- Use secure download URLs
- Implement proper authentication
- Log download activities

### 4. **Performance**

- Implement pagination for large datasets
- Use virtual scrolling for many invoices
- Cache downloaded files
- Optimize image loading

## Future Enhancements

### Planned Features

- **Pagination**: Support for large invoice lists
- **Filtering**: Filter by date range, status, amount
- **Search**: Search invoices by ID or amount
- **Bulk Download**: Download multiple invoices

### Potential Improvements

- **Invoice Preview**: Preview invoices before download
- **Email Integration**: Email invoices directly
- **Print Support**: Print-friendly invoice view
- **Export Options**: Export to CSV, Excel

## Performance

- **Bundle Size**: ~2KB minified + gzipped
- **Dependencies**: Uses `@ffx/components/ui` components
- **Rendering**: Efficient table rendering
- **Memory**: Minimal memory footprint

## Configuration Requirements

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ffx/*": ["./*"]
    }
  }
}
```

### Vite Configuration

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ffx": resolve(__dirname, "."),
    },
  },
});
```
