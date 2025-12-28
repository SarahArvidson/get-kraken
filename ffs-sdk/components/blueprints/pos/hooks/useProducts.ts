/**
 * POS Blueprint - Products State Management Hook
 *
 * Manages product catalog including CRUD operations, search, and filtering.
 * Provides methods for product management and retrieval.
 */

import { useState, useCallback, useMemo } from "react";
import { Product, UseProductsReturn } from "../types";

// Mock product data - in real implementation, this would come from an API
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Espresso",
    description: "Rich, full-bodied espresso shot",
    price: 2.5,
    category: "Coffee",
    sku: "ESP001",
    stock: 100,
    isAvailable: true,
    tags: ["hot", "coffee", "caffeine"],
  },
  {
    id: "2",
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam",
    price: 3.75,
    category: "Coffee",
    sku: "CAP001",
    stock: 50,
    isAvailable: true,
    tags: ["hot", "coffee", "milk"],
  },
  {
    id: "3",
    name: "Latte",
    description: "Espresso with steamed milk and light foam",
    price: 4.25,
    category: "Coffee",
    sku: "LAT001",
    stock: 75,
    isAvailable: true,
    tags: ["hot", "coffee", "milk"],
  },
  {
    id: "4",
    name: "Iced Coffee",
    description: "Cold brewed coffee served over ice",
    price: 3.5,
    category: "Coffee",
    sku: "ICE001",
    stock: 60,
    isAvailable: true,
    tags: ["cold", "coffee"],
  },
  {
    id: "5",
    name: "Chocolate Croissant",
    description: "Buttery croissant filled with chocolate",
    price: 3.25,
    category: "Pastry",
    sku: "CRO001",
    stock: 25,
    isAvailable: true,
    tags: ["pastry", "chocolate", "sweet"],
  },
  {
    id: "6",
    name: "Blueberry Muffin",
    description: "Fresh baked muffin with blueberries",
    price: 2.95,
    category: "Pastry",
    sku: "MUF001",
    stock: 30,
    isAvailable: true,
    tags: ["pastry", "blueberry", "sweet"],
  },
  {
    id: "7",
    name: "Green Tea",
    description: "Premium loose leaf green tea",
    price: 2.75,
    category: "Tea",
    sku: "TEA001",
    stock: 80,
    isAvailable: true,
    tags: ["hot", "tea", "healthy"],
  },
  {
    id: "8",
    name: "Chai Latte",
    description: "Spiced tea with steamed milk",
    price: 4.5,
    category: "Tea",
    sku: "CHAI001",
    stock: 40,
    isAvailable: true,
    tags: ["hot", "tea", "spiced", "milk"],
  },
  {
    id: "9",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 3.95,
    category: "Beverage",
    sku: "OJUICE001",
    stock: 20,
    isAvailable: true,
    tags: ["cold", "juice", "fresh"],
  },
  {
    id: "10",
    name: "Chocolate Chip Cookie",
    description: "Homemade chocolate chip cookie",
    price: 1.95,
    category: "Pastry",
    sku: "COO001",
    stock: 45,
    isAvailable: true,
    tags: ["pastry", "chocolate", "sweet", "cookie"],
  },
];

export function useProducts(initialProducts?: Product[]): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>(
    initialProducts || MOCK_PRODUCTS
  );
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Add a new product
  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product]);
  }, []);

  // Update an existing product
  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  }, []);

  // Remove a product
  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  }, []);

  // Search products by name or description
  const searchProducts = useCallback(
    (query: string): Product[] => {
      if (!query.trim()) return products;

      const lowercaseQuery = query.toLowerCase();
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.description?.toLowerCase().includes(lowercaseQuery) ||
          product.category?.toLowerCase().includes(lowercaseQuery) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(lowercaseQuery)
          )
      );
    },
    [products]
  );

  // Filter products by category
  const filterByCategory = useCallback(
    (category: string): Product[] => {
      if (!category) return products;
      return products.filter((product) => product.category === category);
    },
    [products]
  );

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category)
        .filter((cat): cat is string => Boolean(cat))
    );
    return Array.from(uniqueCategories).sort();
  }, [products]);

  // Get available products only
  const availableProducts = useMemo(() => {
    return products.filter((product) => product.isAvailable !== false);
  }, [products]);

  // Get low stock products (stock < 10)
  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.stock !== undefined &&
        product.stock < 10 &&
        product.isAvailable !== false
    );
  }, [products]);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    removeProduct,
    searchProducts,
    filterByCategory,
    // Additional computed properties
    categories,
    availableProducts,
    lowStockProducts,
  };
}
