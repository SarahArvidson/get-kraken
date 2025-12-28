import { useState, useCallback } from "react";
import { messagingApiClient } from "../services/apiClient";
import type {
  Contact,
  ContactUploadResult,
  SubscribeContactRequest,
} from "../types";

/**
 * useContacts Hook
 * ---------------
 * Hook for managing contact list operations
 */

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Validate phone number
  const validatePhoneNumber = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  }, []);

  // ✅ Validate email
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // ✅ Validate contacts
  const validateContacts = useCallback(
    (contacts: Contact[]): ContactUploadResult => {
      const validContacts: Contact[] = [];
      const errors: Array<{ row: number; phoneNumber: string; error: string }> =
        [];
      const duplicates: Contact[] = [];
      const phoneNumbers = new Set<string>();

      contacts.forEach((contact, index) => {
        const row = index + 1;

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
        if (!validatePhoneNumber(contact.phoneNumber)) {
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

        // Validate email if provided
        if (contact.email && !validateEmail(contact.email)) {
          errors.push({
            row,
            phoneNumber: contact.phoneNumber,
            error: "Invalid email format",
          });
          return;
        }

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
    [validatePhoneNumber, validateEmail]
  );

  // ✅ Add contact
  const addContact = useCallback((contact: Contact) => {
    setContacts((prev) => [...prev, contact]);
  }, []);

  // ✅ Add multiple contacts
  const addContacts = useCallback((newContacts: Contact[]) => {
    setContacts((prev) => [...prev, ...newContacts]);
  }, []);

  // ✅ Remove contact
  const removeContact = useCallback((contactId: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    setSelectedContacts((prev) =>
      prev.filter((contact) => contact.id !== contactId)
    );
  }, []);

  // ✅ Update contact
  const updateContact = useCallback(
    (contactId: string, updates: Partial<Contact>) => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, ...updates } : contact
        )
      );
      setSelectedContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, ...updates } : contact
        )
      );
    },
    []
  );

  // ✅ Select contact
  const selectContact = useCallback((contact: Contact) => {
    setSelectedContacts((prev) => {
      if (prev.some((c) => c.id === contact.id)) {
        return prev;
      }
      return [...prev, contact];
    });
  }, []);

  // ✅ Deselect contact
  const deselectContact = useCallback((contactId: string) => {
    setSelectedContacts((prev) =>
      prev.filter((contact) => contact.id !== contactId)
    );
  }, []);

  // ✅ Toggle contact selection
  const toggleContactSelection = useCallback((contact: Contact) => {
    setSelectedContacts((prev) => {
      if (prev.some((c) => c.id === contact.id)) {
        return prev.filter((c) => c.id !== contact.id);
      }
      return [...prev, contact];
    });
  }, []);

  // ✅ Select all contacts
  const selectAllContacts = useCallback(() => {
    setSelectedContacts(contacts);
  }, [contacts]);

  // ✅ Deselect all contacts
  const deselectAllContacts = useCallback(() => {
    setSelectedContacts([]);
  }, []);

  // ✅ Clear contacts
  const clearContacts = useCallback(() => {
    setContacts([]);
    setSelectedContacts([]);
  }, []);

  // ✅ Search contacts
  const searchContacts = useCallback(
    (query: string): Contact[] => {
      if (!query.trim()) return contacts;

      const lowercaseQuery = query.toLowerCase();
      return contacts.filter(
        (contact) =>
          contact.phoneNumber.toLowerCase().includes(lowercaseQuery) ||
          contact.firstName?.toLowerCase().includes(lowercaseQuery) ||
          contact.lastName?.toLowerCase().includes(lowercaseQuery) ||
          contact.email?.toLowerCase().includes(lowercaseQuery) ||
          contact.tags?.some((tag) =>
            tag.toLowerCase().includes(lowercaseQuery)
          )
      );
    },
    [contacts]
  );

  // ✅ Filter contacts by tag
  const filterContactsByTag = useCallback(
    (tag: string): Contact[] => {
      return contacts.filter((contact) => contact.tags?.includes(tag));
    },
    [contacts]
  );

  // ✅ Get contact statistics
  const getContactStats = useCallback(() => {
    const total = contacts.length;
    const optedIn = contacts.filter((c) => c.isOptedIn).length;
    const optedOut = total - optedIn;
    const withEmail = contacts.filter((c) => c.email).length;
    const withName = contacts.filter((c) => c.firstName || c.lastName).length;

    // Get unique tags
    const allTags = contacts.flatMap((c) => c.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return {
      total,
      optedIn,
      optedOut,
      withEmail,
      withName,
      uniqueTags: uniqueTags.length,
      tags: uniqueTags,
    };
  }, [contacts]);

  // ✅ Export contacts to CSV
  const exportContactsToCSV = useCallback(
    (contactsToExport: Contact[] = contacts): string => {
      const headers = [
        "Phone",
        "First Name",
        "Last Name",
        "Email",
        "Tags",
        "Opted In",
      ];
      const rows = contactsToExport.map((contact) => [
        contact.phoneNumber,
        contact.firstName || "",
        contact.lastName || "",
        contact.email || "",
        contact.tags?.join(";") || "",
        contact.isOptedIn ? "Yes" : "No",
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return csvContent;
    },
    [contacts]
  );

  // ✅ Download contacts as CSV
  const downloadContactsCSV = useCallback(
    (filename = "contacts.csv", contactsToExport?: Contact[]) => {
      const csvContent = exportContactsToCSV(contactsToExport);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    },
    [exportContactsToCSV]
  );

  // ✅ Subscribe contact to list
  const subscribeContact = useCallback(
    async (
      listId: string,
      phoneNumber: string,
      customFields?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const request: SubscribeContactRequest = {
          listId,
          phoneNumber,
          customFields,
        };

        const result = await messagingApiClient.subscribeContact(request);

        // Create a local contact object from the result
        const newContact: Contact = {
          id: result.subscriber_id || `contact_${Date.now()}`,
          phoneNumber,
          firstName: customFields?.firstName,
          lastName: customFields?.lastName,
          email: customFields?.email,
          isOptedIn: true,
          createdAt: new Date().toISOString(),
          tags: [],
        };

        // Add to local contacts list
        addContact(newContact);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to subscribe contact";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addContact]
  );

  return {
    contacts,
    selectedContacts,
    loading,
    error,
    setLoading,
    setError,
    validateContacts,
    addContact,
    addContacts,
    removeContact,
    updateContact,
    selectContact,
    deselectContact,
    toggleContactSelection,
    selectAllContacts,
    deselectAllContacts,
    clearContacts,
    searchContacts,
    filterContactsByTag,
    getContactStats,
    exportContactsToCSV,
    downloadContactsCSV,
    subscribeContact,
  };
};
