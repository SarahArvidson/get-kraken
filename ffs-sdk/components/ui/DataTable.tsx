/**
 * Flying Fox Solutions - DataTable Component
 *
 * Advanced data table with sorting, filtering, pagination, and selection.
 * Perfect for admin dashboards, POS systems, and data-heavy applications.
 *
 * Features:
 * - Column sorting (ascending/descending)
 * - Global and column-specific filtering
 * - Pagination with customizable page sizes
 * - Row selection (single/multiple)
 * - Responsive design with horizontal scrolling
 * - Custom cell renderers
 * - Export functionality
 * - Loading states
 *
 * Usage:
 * ```tsx
 * import { DataTable } from "@ffx/sdk";
 *
 * const columns = [
 *   { key: 'name', title: 'Name', sortable: true },
 *   { key: 'email', title: 'Email', filterable: true },
 *   { key: 'status', title: 'Status', render: (value) => <Badge>{value}</Badge> }
 * ];
 *
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   pagination={{ pageSize: 10 }}
 *   onRowSelect={(rows) => console.log(rows)}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback, memo } from "react";
import Button from "./Button";
import InputField from "./InputField";
import Spinner from "./Spinner";

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface DataTablePagination {
  pageSize: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export interface DataTableSelection {
  type: "single" | "multiple";
  selectedRowKeys?: string[];
  onSelectionChange?: (selectedRowKeys: string[], selectedRows: any[]) => void;
  getRowKey?: (row: any, index: number) => string;
}

export interface DataTableProps<T = any> {
  /** Data array to display */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Loading state */
  loading?: boolean;
  /** Pagination configuration */
  pagination?: DataTablePagination | false;
  /** Row selection configuration */
  selection?: DataTableSelection;
  /** Global search/filter */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Export functionality */
  exportable?: boolean;
  /** Export formats */
  exportFormats?: ("csv" | "json" | "xlsx")[];
  /** Custom row className */
  rowClassName?: (row: T, index: number) => string;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Custom empty state */
  emptyState?: React.ReactNode;
  /** Table container className */
  className?: string;
  /** Enable row hover effects */
  hoverable?: boolean;
  /** Enable striped rows */
  striped?: boolean;
  /** Table size */
  size?: "sm" | "md" | "lg";
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const DataTable = memo(function DataTable<T = any>({
  data,
  columns,
  loading = false,
  pagination = { pageSize: 10 },
  selection,
  searchable = false,
  searchPlaceholder = "Search...",
  exportable = false,
  exportFormats = ["csv", "json"],
  rowClassName,
  onRowClick,
  emptyState,
  className,
  hoverable = true,
  striped = false,
  size = "md",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    pagination ? pagination.pageSize : 10
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    selection?.selectedRowKeys || []
  );
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );

  // Get row key
  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (selection?.getRowKey) {
        return selection.getRowKey(row, index);
      }
      return (row as any)?.id?.toString() || index.toString();
    },
    [selection]
  );

  // Filter data based on search term and column filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Global search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = (row as any)[column.key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((row) => {
          const value = (row as any)[columnKey];
          return value
            ?.toString()
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, searchTerm, columnFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortState.column!];
      const bValue = (b as any)[sortState.column!];

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortState.direction === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortState]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    setSortState((prev) => {
      if (prev.column === columnKey) {
        // Cycle through: asc -> desc -> null
        const newDirection =
          prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? null
            : "asc";
        return {
          column: newDirection ? columnKey : null,
          direction: newDirection,
        };
      } else {
        return { column: columnKey, direction: "asc" };
      }
    });
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback(
    (rowKey: string, selected: boolean) => {
      const newSelectedKeys = selected
        ? [...selectedRowKeys, rowKey]
        : selectedRowKeys.filter((key) => key !== rowKey);

      setSelectedRowKeys(newSelectedKeys);

      if (selection?.onSelectionChange) {
        const selectedRows = data.filter((row, index) =>
          newSelectedKeys.includes(getRowKey(row, index))
        );
        selection.onSelectionChange(newSelectedKeys, selectedRows);
      }
    },
    [selectedRowKeys, selection, data, getRowKey]
  );

  // Handle select all
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      const newSelectedKeys = selected
        ? paginatedData.map((row, index) => getRowKey(row, index))
        : [];

      setSelectedRowKeys(newSelectedKeys);

      if (selection?.onSelectionChange) {
        const selectedRows = selected ? [...paginatedData] : [];
        selection.onSelectionChange(newSelectedKeys, selectedRows);
      }
    },
    [paginatedData, selection, getRowKey]
  );

  // Export functionality
  const handleExport = useCallback(
    (format: "csv" | "json" | "xlsx") => {
      const exportData = sortedData.map((row) => {
        const exportRow: any = {};
        columns.forEach((column) => {
          exportRow[column.title] = (row as any)[column.key];
        });
        return exportRow;
      });

      if (format === "csv") {
        const csv = [
          columns.map((col) => col.title).join(","),
          ...exportData.map((row) =>
            columns.map((col) => `"${row[col.title] || ""}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [sortedData, columns]
  );

  // Pagination calculations
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;
  const startRecord = pagination ? (currentPage - 1) * pageSize + 1 : 1;
  const endRecord = pagination
    ? Math.min(currentPage * pageSize, sortedData.length)
    : sortedData.length;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, index) =>
      selectedRowKeys.includes(getRowKey(row, index))
    );

  const isIndeterminate = selectedRowKeys.length > 0 && !isAllSelected;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cx("ffx-data-table", className)}>
      {/* Header with search and export */}
      {(searchable || exportable) && (
        <div className="flex items-center justify-between mb-4 gap-4">
          {searchable && (
            <div className="flex-1 max-w-md">
              <InputField
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full"
              />
            </div>
          )}

          {exportable && (
            <div className="flex gap-2">
              {exportFormats.map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(format)}
                >
                  Export {format.toUpperCase()}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table
          className={cx(
            "w-full",
            sizeClasses[size],
            striped && "ffx-table-striped"
          )}
        >
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selection && (
                <th className="w-12 px-4 py-3">
                  {selection.type === "multiple" && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cx(
                    "px-4 py-3 text-left font-medium text-gray-900",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.sortable && "cursor-pointer hover:bg-gray-100",
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={
                    column.sortable ? () => handleSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <span
                          className={cx(
                            "text-xs",
                            sortState.column === column.key &&
                              sortState.direction === "asc"
                              ? "text-blue-600"
                              : "text-gray-400"
                          )}
                        >
                          ▲
                        </span>
                        <span
                          className={cx(
                            "text-xs -mt-1",
                            sortState.column === column.key &&
                              sortState.direction === "desc"
                              ? "text-blue-600"
                              : "text-gray-400"
                          )}
                        >
                          ▼
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column filter */}
                  {column.filterable && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <InputField
                        value={columnFilters[column.key] || ""}
                        onChange={(e) =>
                          setColumnFilters((prev) => ({
                            ...prev,
                            [column.key]: e.target.value,
                          }))
                        }
                        placeholder={`Filter ${column.title.toLowerCase()}...`}
                        className="w-full"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selection ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyState || "No data available"}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey = getRowKey(row, index);
                const isSelected = selectedRowKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    className={cx(
                      "bg-white",
                      hoverable && "hover:bg-gray-50",
                      isSelected && "bg-blue-50",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(row, index)
                    )}
                    onClick={
                      onRowClick ? () => onRowClick(row, index) : undefined
                    }
                  >
                    {selection && (
                      <td className="px-4 py-3">
                        <input
                          type={
                            selection.type === "multiple" ? "checkbox" : "radio"
                          }
                          checked={isSelected}
                          onChange={(e) => {
                            if (selection.type === "single") {
                              setSelectedRowKeys([rowKey]);
                              if (selection.onSelectionChange) {
                                selection.onSelectionChange([rowKey], [row]);
                              }
                            } else {
                              handleRowSelect(rowKey, e.target.checked);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cx(
                          "px-4 py-3",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render((row as any)[column.key], row, index)
                          : (row as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            {pagination.showTotal && (
              <>
                Showing {startRecord} to {endRecord} of {sortedData.length}{" "}
                results
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {pagination.showSizeChanger && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(
                    (size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > totalPages) return null;

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>

            {pagination.showQuickJumper && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Go to:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const page = parseInt(
                        (e.target as HTMLInputElement).value,
                        10
                      );
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default DataTable;
