import React, { useState, useCallback, useRef } from "react";
import { Button, Toast } from "../../ui";
import type {
  ContactListUploaderProps,
  Contact,
  ContactUploadResult,
  ContactUploadError,
} from "./types";

/**
 * ContactListUploader Component
 * ----------------------------
 * CSV upload component with contact validation and preview
 */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const ContactListUploader: React.FC<ContactListUploaderProps> = ({
  onUpload,
  onValidate,
  maxFileSize = 5, // 5MB default
  allowedFormats = [".csv", ".xlsx", ".xls"],
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ContactUploadResult | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info" | "warning";
    show: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file) return;

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        setToast({
          message: `File size must be less than ${maxFileSize}MB`,
          variant: "error",
          show: true,
        });
        return;
      }

      // Validate file format
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));
      if (!allowedFormats.includes(fileExtension)) {
        setToast({
          message: `File format not supported. Allowed formats: ${allowedFormats.join(
            ", "
          )}`,
          variant: "error",
          show: true,
        });
        return;
      }

      processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxFileSize, allowedFormats]
  );

  // ✅ Process uploaded file
  const processFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadResult(null);

      try {
        const contacts = await parseFile(file);
        const result = onValidate
          ? onValidate(contacts)
          : validateContacts(contacts);

        setUploadResult(result);
        setShowPreview(true);

        if (result.success) {
          setToast({
            message: `Successfully processed ${result.totalRows} contacts. ${result.validContacts.length} valid, ${result.errors.length} errors.`,
            variant: result.errors.length > 0 ? "warning" : "success",
            show: true,
          });
        } else {
          setToast({
            message: `Failed to process contacts: ${
              result.errors[0]?.error || "Unknown error"
            }`,
            variant: "error",
            show: true,
          });
        }
      } catch (error) {
        console.error("File processing error:", error);
        setToast({
          message:
            "Failed to process file. Please check the format and try again.",
          variant: "error",
          show: true,
        });
      } finally {
        setIsUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onValidate]
  );

  // ✅ Parse CSV file
  const parseFile = useCallback((file: File): Promise<Contact[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const contacts = parseCSV(text);
          resolve(contacts);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Parse CSV content
  const parseCSV = useCallback((csvText: string): Contact[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2)
      throw new Error("CSV must have at least a header row and one data row");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const contacts: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((v) => v.trim().replace(/^"|"$/g, ""));

      if (values.length !== headers.length) continue;

      const contact: Contact = {
        id: `temp-${i}`,
        phoneNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        tags: [],
        isOptedIn: true,
        createdAt: new Date().toISOString(),
      };

      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case "phone":
          case "phonenumber":
          case "phone_number":
          case "mobile":
            contact.phoneNumber = value;
            break;
          case "firstname":
          case "first_name":
          case "first":
            contact.firstName = value;
            break;
          case "lastname":
          case "last_name":
          case "last":
            contact.lastName = value;
            break;
          case "email":
          case "email_address":
            contact.email = value;
            break;
          case "tags":
          case "tag":
            contact.tags = value ? value.split(";").map((t) => t.trim()) : [];
            break;
        }
      });

      contacts.push(contact);
    }

    return contacts;
  }, []);

  // ✅ Validate contacts
  const validateContacts = useCallback(
    (contacts: Contact[]): ContactUploadResult => {
      const validContacts: Contact[] = [];
      const errors: ContactUploadError[] = [];
      const duplicates: Contact[] = [];
      const phoneNumbers = new Set<string>();

      contacts.forEach((contact, index) => {
        const row = index + 2; // +2 because CSV starts at row 1 and we skip header

        // Validate phone number
        if (!contact.phoneNumber) {
          errors.push({
            row,
            phoneNumber: contact.phoneNumber || "N/A",
            error: "Phone number is required",
          });
          return;
        }

        // Clean phone number
        const cleanPhone = contact.phoneNumber.replace(/\D/g, "");
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
          errors.push({
            row,
            phoneNumber: contact.phoneNumber,
            error: "Invalid phone number format",
          });
          return;
        }

        // Check for duplicates
        if (phoneNumbers.has(cleanPhone)) {
          duplicates.push(contact);
          return;
        }

        phoneNumbers.add(cleanPhone);

        // Create valid contact
        const validContact: Contact = {
          ...contact,
          id: `contact-${Date.now()}-${index}`,
          phoneNumber: cleanPhone,
          isOptedIn: true,
          createdAt: new Date().toISOString(),
        };

        validContacts.push(validContact);
      });

      return {
        success: validContacts.length > 0,
        totalRows: contacts.length,
        validContacts,
        errors,
        duplicates,
        successCount: validContacts.length,
        errorCount: errors.length,
      };
    },
    []
  );

  // ✅ Handle upload confirmation
  const handleUpload = useCallback(async () => {
    if (!uploadResult || uploadResult.validContacts.length === 0) return;

    try {
      await onUpload?.(uploadResult.validContacts);
      setToast({
        message: `Successfully uploaded ${uploadResult.validContacts.length} contacts`,
        variant: "success",
        show: true,
      });
      setShowPreview(false);
      setUploadResult(null);
    } catch (error) {
      console.error("Upload error:", error);
      setToast({
        message: "Failed to upload contacts. Please try again.",
        variant: "error",
        show: true,
      });
    }
  }, [uploadResult, onUpload]);

  // ✅ Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // ✅ File input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Upload Contact List
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a CSV file with your contacts to create a mailing list
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={cx(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragOver
                ? "Drop your file here"
                : "Drag and drop your file here"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              or click to browse files
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Processing..." : "Choose File"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFormats.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* File Requirements */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          File Requirements:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Supported formats: {allowedFormats.join(", ")}</li>
          <li>• Maximum file size: {maxFileSize}MB</li>
          <li>• Required columns: phone (or phone_number, mobile)</li>
          <li>• Optional columns: first_name, last_name, email, tags</li>
          <li>• First row should contain column headers</li>
        </ul>
      </div>

      {/* Upload Preview */}
      {showPreview && uploadResult && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Upload Preview
          </h4>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {uploadResult.validContacts.length}
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">
                Valid Contacts
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {uploadResult.errors.length}
              </div>
              <div className="text-sm text-red-800 dark:text-red-200">
                Errors
              </div>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {uploadResult.duplicates.length}
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                Duplicates
              </div>
            </div>
          </div>

          {/* Errors */}
          {uploadResult.errors.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Validation Errors:
              </h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {uploadResult.errors.slice(0, 5).map((error, index) => (
                  <div
                    key={index}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    Row {error.row}: {error.error}
                  </div>
                ))}
                {uploadResult.errors.length > 5 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ... and {uploadResult.errors.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploadResult.validContacts.length === 0}
            >
              Upload {uploadResult.validContacts.length} Contacts
            </Button>

            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => setToast(null)}
          className="bottom-4 right-4"
        />
      )}
    </div>
  );
};

export default ContactListUploader;
