/**
 * Flying Fox Solutions - POS Inventory Manager
 *
 * Advanced inventory management system for POS applications.
 * Handles stock tracking, low stock alerts, and inventory adjustments.
 *
 * Features:
 * - Real-time inventory tracking
 * - Low stock alerts and notifications
 * - Bulk inventory updates
 * - Product categorization
 * - Supplier management
 * - Inventory history and auditing
 * - Barcode scanning integration
 * - Multi-location support
 *
 * Usage:
 * ```tsx
 * import { InventoryManager } from "@ffx/sdk/blueprints";
 *
 * <InventoryManager
 *   products={products}
 *   onUpdateStock={(productId, newStock) => handleStockUpdate(productId, newStock)}
 *   onLowStockAlert={(products) => handleLowStockAlert(products)}
 *   lowStockThreshold={10}
 * />
 * ```
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Button from "../../ui/Button";
import InputField from "../../ui/InputField";
import Modal from "../../ui/Modal";
import DataTable from "../../ui/DataTable";
import type { Product } from "./types";

export interface InventoryItem extends Product {
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  lastRestocked?: string;
  supplier?: string;
  location?: string;
  barcode?: string;
  costPrice: number;
  stockValue: number;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  type: "increase" | "decrease" | "set" | "restock";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  userId?: string;
  location?: string;
}

export interface InventoryManagerProps {
  /** Inventory items */
  items: InventoryItem[];
  /** Stock update handler */
  onUpdateStock?: (
    productId: string,
    newStock: number,
    reason?: string
  ) => void;
  /** Bulk stock update handler */
  onBulkUpdateStock?: (
    updates: Array<{ productId: string; newStock: number; reason?: string }>
  ) => void;
  /** Low stock alert handler */
  onLowStockAlert?: (products: InventoryItem[]) => void;
  /** Low stock threshold (default: 10) */
  lowStockThreshold?: number;
  /** Show low stock alerts */
  showAlerts?: boolean;
  /** Enable barcode scanning */
  enableBarcodeScanning?: boolean;
  /** Multi-location support */
  locations?: string[];
  /** Current location filter */
  currentLocation?: string;
  /** Location change handler */
  onLocationChange?: (location: string) => void;
  /** Custom className */
  className?: string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function InventoryManager({
  items,
  onUpdateStock,
  onBulkUpdateStock,
  onLowStockAlert,
  lowStockThreshold = 10,
  showAlerts = true,
  enableBarcodeScanning = false,
  locations = [],
  currentLocation,
  onLocationChange,
  className,
}: InventoryManagerProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"single" | "bulk">(
    "single"
  );
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "value" | "category">(
    "name"
  );

  // Calculate low stock items
  const lowStockItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.currentStock <= Math.max(item.minStock, lowStockThreshold) &&
        item.currentStock > 0
    );
  }, [items, lowStockThreshold]);

  // Calculate out of stock items
  const outOfStockItems = useMemo(() => {
    return items.filter((item) => item.currentStock <= 0);
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Location filter
    if (currentLocation && currentLocation !== "all") {
      filtered = filtered.filter((item) => item.location === currentLocation);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.barcode?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Stock filter
    switch (stockFilter) {
      case "low":
        filtered = filtered.filter(
          (item) =>
            item.currentStock <= Math.max(item.minStock, lowStockThreshold) &&
            item.currentStock > 0
        );
        break;
      case "out":
        filtered = filtered.filter((item) => item.currentStock <= 0);
        break;
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "stock":
          return b.currentStock - a.currentStock;
        case "value":
          return b.stockValue - a.stockValue;
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    items,
    currentLocation,
    searchTerm,
    categoryFilter,
    stockFilter,
    sortBy,
    lowStockThreshold,
  ]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats).sort();
  }, [items]);

  // Trigger low stock alerts
  useEffect(() => {
    if (showAlerts && lowStockItems.length > 0 && onLowStockAlert) {
      onLowStockAlert(lowStockItems);
    }
  }, [lowStockItems, showAlerts, onLowStockAlert]);

  // Handle stock adjustment
  const handleStockAdjustment = useCallback(
    (productId: string, newStock: number, reason?: string) => {
      if (onUpdateStock) {
        onUpdateStock(productId, newStock, reason);
      }
    },
    [onUpdateStock]
  );

  // Handle bulk stock adjustment
  const handleBulkStockAdjustment = useCallback(
    (
      updates: Array<{ productId: string; newStock: number; reason?: string }>
    ) => {
      if (onBulkUpdateStock) {
        onBulkUpdateStock(updates);
      }
    },
    [onBulkUpdateStock]
  );

  // Open single item adjustment modal
  const openSingleAdjustment = useCallback((item: InventoryItem) => {
    setSelectedProduct(item);
    setAdjustmentType("single");
    setShowAdjustmentModal(true);
  }, []);

  // Open bulk adjustment modal
  const openBulkAdjustment = useCallback(() => {
    setAdjustmentType("bulk");
    setShowAdjustmentModal(true);
  }, []);

  // Stock status indicator
  const getStockStatus = useCallback(
    (item: InventoryItem) => {
      if (item.currentStock <= 0) {
        return { status: "out", color: "text-red-600", bg: "bg-red-100" };
      } else if (
        item.currentStock <= Math.max(item.minStock, lowStockThreshold)
      ) {
        return { status: "low", color: "text-yellow-600", bg: "bg-yellow-100" };
      } else {
        return { status: "good", color: "text-green-600", bg: "bg-green-100" };
      }
    },
    [lowStockThreshold]
  );

  // Table columns
  const columns = [
    {
      key: "name",
      title: "Product",
      sortable: true,
      render: (value: string, item: InventoryItem) => (
        <div className="flex items-center gap-3">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.category}</div>
            {item.barcode && (
              <div className="text-xs text-gray-400">#{item.barcode}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "currentStock",
      title: "Current Stock",
      sortable: true,
      align: "center" as const,
      render: (value: number, item: InventoryItem) => {
        const status = getStockStatus(item);
        return (
          <div className="flex items-center justify-center">
            <span
              className={cx(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                status.bg,
                status.color
              )}
            >
              {value}
              {status.status === "out" && " (Out)"}
              {status.status === "low" && " (Low)"}
            </span>
          </div>
        );
      },
    },
    {
      key: "minStock",
      title: "Min Stock",
      align: "center" as const,
      render: (value: number) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: "reorderPoint",
      title: "Reorder Point",
      align: "center" as const,
      render: (value: number) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: "stockValue",
      title: "Stock Value",
      sortable: true,
      align: "right" as const,
      render: (value: number) => (
        <span className="font-medium text-gray-900">${value.toFixed(2)}</span>
      ),
    },
    {
      key: "supplier",
      title: "Supplier",
      render: (value: string) => (
        <span className="text-gray-600">{value || "-"}</span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: any, item: InventoryItem) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSingleAdjustment(item)}
          >
            Adjust
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={cx("ffx-inventory-manager", className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Inventory Management
            </h2>
            <p className="text-gray-600">
              Track and manage your product inventory
            </p>
          </div>

          <div className="flex gap-3">
            {selectedItems.length > 0 && (
              <Button variant="outline" onClick={openBulkAdjustment}>
                Bulk Adjust ({selectedItems.length})
              </Button>
            )}
            {enableBarcodeScanning && (
              <Button variant="outline">📷 Scan Barcode</Button>
            )}
            <Button variant="primary">+ Add Product</Button>
          </div>
        </div>

        {/* Alerts */}
        {showAlerts && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Out of Stock
                  </h3>
                  <div className="text-sm text-red-700">
                    {outOfStockItems.length} products
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-xl">📉</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Low Stock
                  </h3>
                  <div className="text-sm text-yellow-700">
                    {lowStockItems.length} products
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-blue-600 text-xl">💰</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Total Value
                  </h3>
                  <div className="text-sm text-blue-700">
                    $
                    {items
                      .reduce((sum, item) => sum + item.stockValue, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <InputField
              placeholder="Search products, categories, or barcodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(e.target.value as "all" | "low" | "out")
            }
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock Only</option>
            <option value="out">Out of Stock Only</option>
          </select>

          {locations.length > 0 && (
            <select
              value={currentLocation || "all"}
              onChange={(e) => onLocationChange?.(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="value">Sort by Value</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <DataTable
        data={filteredItems}
        columns={columns as any}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: true }}
        selection={{
          type: "multiple",
          selectedRowKeys: selectedItems,
          onSelectionChange: (keys) => setSelectedItems(keys),
        }}
        searchable={false} // We have custom search
        exportable={true}
        exportFormats={["csv", "json"]}
        hoverable
        striped
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        type={adjustmentType}
        product={selectedProduct}
        selectedProducts={
          adjustmentType === "bulk"
            ? items.filter((item) => selectedItems.includes(item.id))
            : []
        }
        onAdjustStock={
          adjustmentType === "single"
            ? handleStockAdjustment
            : handleBulkStockAdjustment
        }
      />
    </div>
  );
}

// Stock Adjustment Modal Component
interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "single" | "bulk";
  product?: InventoryItem | null;
  selectedProducts?: InventoryItem[];
  onAdjustStock: any;
}

function StockAdjustmentModal({
  isOpen,
  onClose,
  type,
  product,
  selectedProducts = [],
  onAdjustStock,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<
    "increase" | "decrease" | "set"
  >("increase");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) return;

      if (type === "single" && product) {
        let newStock = product.currentStock;

        switch (adjustmentType) {
          case "increase":
            newStock += qty;
            break;
          case "decrease":
            newStock = Math.max(0, newStock - qty);
            break;
          case "set":
            newStock = qty;
            break;
        }

        onAdjustStock(product.id, newStock, reason);
      } else if (type === "bulk") {
        const updates = selectedProducts.map((item) => {
          let newStock = item.currentStock;

          switch (adjustmentType) {
            case "increase":
              newStock += qty;
              break;
            case "decrease":
              newStock = Math.max(0, newStock - qty);
              break;
            case "set":
              newStock = qty;
              break;
          }

          return {
            productId: item.id,
            newStock,
            reason,
          };
        });

        onAdjustStock(updates);
      }

      onClose();
      setQuantity("");
      setReason("");
    },
    [
      type,
      product,
      selectedProducts,
      adjustmentType,
      quantity,
      reason,
      onAdjustStock,
      onClose,
    ]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "single" ? "Adjust Stock" : "Bulk Stock Adjustment"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "single" && product && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-600">
              Current Stock: {product.currentStock}
            </div>
          </div>
        )}

        {type === "bulk" && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">
              Adjusting {selectedProducts.length} products
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjustment Type
          </label>
          <div className="flex gap-4">
            {(["increase", "decrease", "set"] as const).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name="adjustmentType"
                  value={type}
                  checked={adjustmentType === type}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="mr-2"
                />
                {type === "increase"
                  ? "Increase"
                  : type === "decrease"
                  ? "Decrease"
                  : "Set to"}
              </label>
            ))}
          </div>
        </div>

        <InputField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"
        />

        <InputField
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for adjustment..."
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default InventoryManager;
