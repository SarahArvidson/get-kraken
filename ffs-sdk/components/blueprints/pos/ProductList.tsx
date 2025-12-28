/**
 * POS Blueprint - ProductList Component
 *
 * Displays available products with name, price, and add-to-cart functionality.
 * Uses atomic components (Button, InputField) for consistent styling.
 */

import React, { useState } from "react";
import Button from "../../ui/Button";
import InputField from "../../ui/InputField";
import Spinner from "../../ui/Spinner";
import { ProductListProps, Product } from "./types";

const cx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function ProductList({
  products,
  onAddToCart,
  onViewProduct,
  loading = false,
  error,
  className,
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory && product.isAvailable !== false;
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    onAddToCart(product, quantity);
    // Reset quantity after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (loading) {
    return (
      <div className={cx("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Spinner size="lg" color="primary" aria-label="Loading products" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cx("p-6 text-center", className)}>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("space-y-6", className)}>
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <InputField
          type="text"
          label="Search Products"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          className="w-full"
        />

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "primary" : "secondary"
                }
                size="sm"
                onClick={() => setSelectedCategory(category || "")}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedCategory
              ? "No products match your search criteria."
              : "No products available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] || 1}
              onQuantityChange={(quantity) =>
                handleQuantityChange(product.id, quantity)
              }
              onAddToCart={() => handleAddToCart(product)}
              onViewProduct={
                onViewProduct ? () => onViewProduct(product) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onViewProduct?: () => void;
}

function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  onViewProduct,
}: ProductCardProps) {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const isLowStock =
    product.stock !== undefined && product.stock < 10 && product.stock > 0;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image Placeholder */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-4xl">📦</div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </span>

          {product.category && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              {product.category}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="text-red-600 dark:text-red-400 font-medium">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                In Stock ({product.stock} available)
              </span>
            )}
          </div>
        )}

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            SKU: {product.sku}
          </p>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      {!isOutOfStock && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Qty:
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="!p-1 !min-w-0 h-8 w-8 rounded-r-none"
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuantityChange(quantity + 1)}
                className="!p-1 !min-w-0 h-8 w-8 rounded-l-none"
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onAddToCart}
              className="flex-1"
              disabled={isOutOfStock}
            >
              Add to Cart
            </Button>

            {onViewProduct && (
              <Button variant="secondary" size="sm" onClick={onViewProduct}>
                View
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Out of Stock Message */}
      {isOutOfStock && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" className="w-full" disabled>
            Out of Stock
          </Button>
        </div>
      )}
    </div>
  );
}
