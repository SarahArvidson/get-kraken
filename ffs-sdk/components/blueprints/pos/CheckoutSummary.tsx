/**
 * POS Blueprint - CheckoutSummary Component
 *
 * Displays order summary and checkout functionality.
 * Includes customer information collection and payment processing.
 */

import React, { useState } from "react";
import Button from "../../ui/Button";
import InputField from "../../ui/InputField";
import FormGroup from "../../ui/FormGroup";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import { CheckoutSummaryProps, CustomerInfo } from "./types";

const cx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function CheckoutSummary({
  cart,
  onCheckout,
  onCancel,
  loading = false,
  customerInfo,
  onCustomerInfoChange,
  className,
}: CheckoutSummaryProps) {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [localCustomerInfo, setLocalCustomerInfo] = useState<CustomerInfo>(
    customerInfo || {
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
    }
  );
  const [requireCustomerInfo] = useState(false);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleCustomerInfoChange = (
    field: keyof CustomerInfo,
    value: string
  ) => {
    const updatedInfo = { ...localCustomerInfo, [field]: value };
    setLocalCustomerInfo(updatedInfo);

    if (onCustomerInfoChange) {
      onCustomerInfoChange(updatedInfo);
    }
  };

  const handleAddressChange = (
    field: keyof NonNullable<CustomerInfo["address"]>,
    value: string
  ) => {
    const updatedInfo = {
      ...localCustomerInfo,
      address: {
        ...localCustomerInfo.address,
        [field]: value,
      },
    };
    setLocalCustomerInfo(updatedInfo);

    if (onCustomerInfoChange) {
      onCustomerInfoChange(updatedInfo);
    }
  };

  const handleCheckout = () => {
    if (
      requireCustomerInfo &&
      (!localCustomerInfo.name || !localCustomerInfo.email)
    ) {
      setShowCustomerModal(true);
      return;
    }
    onCheckout();
  };

  const handleCustomerInfoSave = () => {
    if (onCustomerInfoChange) {
      onCustomerInfoChange(localCustomerInfo);
    }
    setShowCustomerModal(false);
  };

  if (loading) {
    return (
      <div className={cx("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Spinner size="lg" color="primary" aria-label="Processing checkout" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Processing checkout...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Checkout Summary
        </h2>
      </div>

      {/* Order Items Summary */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
          Order Items ({cart.items.length})
        </h3>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Information */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Customer Information
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomerModal(true)}
          >
            {customerInfo?.name ? "Edit" : "Add"}
          </Button>
        </div>

        {customerInfo?.name ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Name:</strong> {customerInfo.name}
            </p>
            {customerInfo.email && (
              <p>
                <strong>Email:</strong> {customerInfo.email}
              </p>
            )}
            {customerInfo.phone && (
              <p>
                <strong>Phone:</strong> {customerInfo.phone}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
            No customer information provided
          </p>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {cart.discount && cart.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount ({cart.discountCode}):</span>
            <span>-{formatPrice(cart.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatPrice(cart.tax)}
          </span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-gray-900 dark:text-gray-100">Total:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatPrice(cart.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCheckout}
          className="flex-1"
        >
          Process Payment
        </Button>

        {onCancel && (
          <Button variant="secondary" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Customer Information Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Customer Information"
        size="md"
      >
        <div className="space-y-4">
          <FormGroup label="Customer Name" required>
            <InputField
              type="text"
              label=""
              value={localCustomerInfo.name || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleCustomerInfoChange("name", e.target.value)
              }
              placeholder="Enter customer name"
            />
          </FormGroup>

          <FormGroup label="Email Address">
            <InputField
              type="email"
              label=""
              value={localCustomerInfo.email || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleCustomerInfoChange("email", e.target.value)
              }
              placeholder="Enter email address"
            />
          </FormGroup>

          <FormGroup label="Phone Number">
            <InputField
              type="tel"
              label=""
              value={localCustomerInfo.phone || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleCustomerInfoChange("phone", e.target.value)
              }
              placeholder="Enter phone number"
            />
          </FormGroup>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Shipping Address (Optional)
            </h4>

            <div className="space-y-3">
              <FormGroup label="Street Address">
                <InputField
                  type="text"
                  label=""
                  value={localCustomerInfo.address?.street || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleAddressChange("street", e.target.value)
                  }
                  placeholder="Enter street address"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="City">
                  <InputField
                    type="text"
                    label=""
                    value={localCustomerInfo.address?.city || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleAddressChange("city", e.target.value)
                    }
                    placeholder="City"
                  />
                </FormGroup>

                <FormGroup label="State">
                  <InputField
                    type="text"
                    label=""
                    value={localCustomerInfo.address?.state || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleAddressChange("state", e.target.value)
                    }
                    placeholder="State"
                  />
                </FormGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="ZIP Code">
                  <InputField
                    type="text"
                    label=""
                    value={localCustomerInfo.address?.zipCode || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleAddressChange("zipCode", e.target.value)
                    }
                    placeholder="ZIP Code"
                  />
                </FormGroup>

                <FormGroup label="Country">
                  <InputField
                    type="text"
                    label=""
                    value={localCustomerInfo.address?.country || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleAddressChange("country", e.target.value)
                    }
                    placeholder="Country"
                  />
                </FormGroup>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleCustomerInfoSave}
              className="flex-1"
            >
              Save Information
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCustomerModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
