/**
 * POS Blueprint - Orders State Management Hook
 *
 * Manages order history and processing.
 * Provides methods for order CRUD operations and retrieval.
 */

import { useState, useCallback, useMemo } from "react";
import { Order, UseOrdersReturn } from "../types";

// Mock order data - in real implementation, this would come from an API
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    items: [
      {
        product: {
          id: "1",
          name: "Espresso",
          price: 2.5,
        },
        quantity: 2,
      },
      {
        product: {
          id: "5",
          name: "Chocolate Croissant",
          price: 3.25,
        },
        quantity: 1,
      },
    ],
    subtotal: 8.25,
    tax: 0.66,
    total: 8.91,
    status: "completed",
    createdAt: new Date("2024-01-15T10:30:00"),
    updatedAt: new Date("2024-01-15T10:35:00"),
  },
  {
    id: "ORD-002",
    items: [
      {
        product: {
          id: "2",
          name: "Cappuccino",
          price: 3.75,
        },
        quantity: 1,
      },
    ],
    subtotal: 3.75,
    tax: 0.3,
    total: 4.05,
    status: "completed",
    createdAt: new Date("2024-01-15T11:15:00"),
    updatedAt: new Date("2024-01-15T11:20:00"),
  },
];

export function useOrders(initialOrders?: Order[]): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>(initialOrders || MOCK_ORDERS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Add a new order
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  // Update an existing order
  const updateOrder = useCallback(
    (orderId: string, updates: Partial<Order>) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, ...updates, updatedAt: new Date() }
            : order
        )
      );
    },
    []
  );

  // Get order by ID
  const getOrder = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((order) => order.id === orderId);
    },
    [orders]
  );

  // Get orders by date
  const getOrdersByDate = useCallback(
    (date: Date): Order[] => {
      const targetDate = date.toDateString();
      return orders.filter(
        (order) => order.createdAt.toDateString() === targetDate
      );
    },
    [orders]
  );

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status: Order["status"]): Order[] => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  // Get today's orders
  const todaysOrders = useMemo(() => {
    const today = new Date();
    return getOrdersByDate(today);
  }, [getOrdersByDate]);

  // Get total sales for today
  const todaysTotal = useMemo(() => {
    return todaysOrders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.total, 0);
  }, [todaysOrders]);

  // Get order count for today
  const todaysOrderCount = useMemo(() => {
    return todaysOrders.length;
  }, [todaysOrders]);

  // Get average order value
  const averageOrderValue = useMemo(() => {
    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    );
    if (completedOrders.length === 0) return 0;

    const total = completedOrders.reduce((sum, order) => sum + order.total, 0);
    return total / completedOrders.length;
  }, [orders]);

  // Get top selling products
  const topSellingProducts = useMemo(() => {
    const productSales = new Map<
      string,
      {
        product: { id: string; name: string; price: number };
        quantity: number;
        revenue: number;
      }
    >();

    orders
      .filter((order) => order.status === "completed")
      .forEach((order) => {
        order.items.forEach((item) => {
          const existing = productSales.get(item.product.id);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += item.product.price * item.quantity;
          } else {
            productSales.set(item.product.id, {
              product: item.product,
              quantity: item.quantity,
              revenue: item.product.price * item.quantity,
            });
          }
        });
      });

    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    getOrder,
    getOrdersByDate,
    // Additional computed properties
    getOrdersByStatus,
    todaysOrders,
    todaysTotal,
    todaysOrderCount,
    averageOrderValue,
    topSellingProducts,
  };
}
