/**
 * useChecklistItems Hook
 *
 * Hook for managing checklist items
 * - Add/remove/reorder items
 * - Validation logic
 * - Duplicate detection
 * - Generate temporary IDs for new items
 */

import { useState, useCallback } from 'react';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateDescriptions: string[];
}

export const useChecklistItems = (initialItems: ChecklistItemEditor[] = []) => {
  const [items, setItems] = useState<ChecklistItemEditor[]>(initialItems);

  /**
   * Generate a temporary ID for new items
   */
  const generateTempId = useCallback((): string => {
    return `temp_${crypto.randomUUID()}`;
  }, []);

  /**
   * Validate a single checklist item
   */
  const validateItem = useCallback(
    (item: ChecklistItemEditor): ValidationResult => {
      const errors: Record<string, string> = {};

      // Description validation
      if (!item.description || !item.description.trim()) {
        errors.description = 'Description is required';
      } else if (item.description.length < 3) {
        errors.description = 'Description must be at least 3 characters';
      } else if (item.description.length > 255) {
        errors.description = 'Description must not exceed 255 characters';
      }

      // Input type validation
      const validInputTypes = ['checkbox', 'text', 'number'];
      if (!validInputTypes.includes(item.inputType)) {
        errors.inputType = 'Invalid input type';
      }

      // Order validation
      if (item.order < 1 || item.order > 1000) {
        errors.order = 'Order must be between 1 and 1000';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    []
  );

  /**
   * Validate all items
   */
  const validateAllItems = useCallback((): ValidationResult => {
    const allErrors: Record<string, string> = {};
    let isValid = true;

    const activeItems = items.filter((item) => !item.isDeleted);

    if (activeItems.length === 0) {
      return {
        isValid: false,
        errors: { items: 'At least one item is required' },
      };
    }

    activeItems.forEach((item, index) => {
      const itemValidation = validateItem(item);
      if (!itemValidation.isValid) {
        isValid = false;
        Object.keys(itemValidation.errors).forEach((key) => {
          allErrors[`item_${index}_${key}`] = itemValidation.errors[key];
        });
      }
    });

    return {
      isValid,
      errors: allErrors,
    };
  }, [items, validateItem]);

  /**
   * Check for duplicate descriptions
   */
  const checkDuplicates = useCallback((): DuplicateCheckResult => {
    const activeItems = items.filter((item) => !item.isDeleted);
    const descriptions = activeItems.map((item) =>
      item.description.toLowerCase().trim()
    );

    const duplicates = new Set<string>();
    const seen = new Set<string>();

    descriptions.forEach((desc) => {
      if (seen.has(desc)) {
        duplicates.add(desc);
      }
      seen.add(desc);
    });

    return {
      hasDuplicates: duplicates.size > 0,
      duplicateDescriptions: Array.from(duplicates),
    };
  }, [items]);

  /**
   * Add a new item
   */
  const addItem = useCallback(
    (description: string, isMandatory = false): ChecklistItemEditor => {
      const newItem: ChecklistItemEditor = {
        id: generateTempId(),
        tempId: generateTempId(),
        description: description.trim(),
        inputType: 'checkbox',
        isMandatory,
        order: items.filter((i) => !i.isDeleted).length + 1,
        requiresPhoto: false,
        requiresComment: false,
        isNew: true,
        isModified: false,
        isDeleted: false,
        errors: {},
      };

      setItems((prevItems) => [...prevItems, newItem]);
      return newItem;
    },
    [items, generateTempId]
  );

  /**
   * Remove an item by marking it as deleted
   */
  const removeItem = useCallback((itemId: string): void => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isDeleted: true,
            }
          : item
      )
    );
  }, []);

  /**
   * Restore a deleted item
   */
  const restoreItem = useCallback((itemId: string): void => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isDeleted: false,
            }
          : item
      )
    );
  }, []);

  /**
   * Update an item
   */
  const updateItem = useCallback(
    (itemId: string, updates: Partial<ChecklistItemEditor>): void => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...updates,
                isModified: true,
              }
            : item
        )
      );
    },
    []
  );

  /**
   * Reorder items by moving from one position to another
   */
  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number): void => {
      const activeItems = items.filter((item) => !item.isDeleted);

      if (fromIndex < 0 || fromIndex >= activeItems.length) {
        console.warn('Invalid fromIndex:', fromIndex);
        return;
      }

      if (toIndex < 0 || toIndex >= activeItems.length) {
        console.warn('Invalid toIndex:', toIndex);
        return;
      }

      const newItems = [...activeItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      // Update order
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index + 1,
        isModified: true,
      }));

      // Keep deleted items at the end
      const deletedItems = items.filter((item) => item.isDeleted);
      setItems([...reorderedItems, ...deletedItems]);
    },
    [items]
  );

  /**
   * Move item up in the list
   */
  const moveItemUp = useCallback(
    (itemId: string): void => {
      const activeItems = items.filter((item) => !item.isDeleted);
      const index = activeItems.findIndex((item) => item.id === itemId);

      if (index > 0) {
        reorderItems(index, index - 1);
      }
    },
    [items, reorderItems]
  );

  /**
   * Move item down in the list
   */
  const moveItemDown = useCallback(
    (itemId: string): void => {
      const activeItems = items.filter((item) => !item.isDeleted);
      const index = activeItems.findIndex((item) => item.id === itemId);

      if (index >= 0 && index < activeItems.length - 1) {
        reorderItems(index, index + 1);
      }
    },
    [items, reorderItems]
  );

  /**
   * Duplicate an item
   */
  const duplicateItem = useCallback(
    (itemId: string): ChecklistItemEditor | null => {
      const itemToDuplicate = items.find((item) => item.id === itemId);

      if (!itemToDuplicate || itemToDuplicate.isDeleted) {
        return null;
      }

      const duplicatedItem: ChecklistItemEditor = {
        ...itemToDuplicate,
        id: generateTempId(),
        tempId: generateTempId(),
        isNew: true,
        isModified: false,
        isDeleted: false,
        errors: {},
        description: `${itemToDuplicate.description} (copy)`,
      };

      setItems((prevItems) => [...prevItems, duplicatedItem]);
      return duplicatedItem;
    },
    [items, generateTempId]
  );

  /**
   * Get active (non-deleted) items
   */
  const getActiveItems = useCallback((): ChecklistItemEditor[] => {
    return items.filter((item) => !item.isDeleted);
  }, [items]);

  /**
   * Get deleted items
   */
  const getDeletedItems = useCallback((): ChecklistItemEditor[] => {
    return items.filter((item) => item.isDeleted);
  }, [items]);

  /**
   * Clear all items
   */
  const clearAllItems = useCallback((): void => {
    setItems([]);
  }, []);

  /**
   * Reset items to initial state
   */
  const resetItems = useCallback((): void => {
    setItems(initialItems);
  }, [initialItems]);

  /**
   * Bulk update items
   */
  const bulkUpdateItems = useCallback(
    (updates: Record<string, Partial<ChecklistItemEditor>>): void => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          updates[item.id]
            ? {
                ...item,
                ...updates[item.id],
                isModified: true,
              }
            : item
        )
      );
    },
    []
  );

  /**
   * Get total count of active items
   */
  const getActiveCount = useCallback((): number => {
    return items.filter((item) => !item.isDeleted).length;
  }, [items]);

  /**
   * Get count of mandatory items
   */
  const getMandatoryCount = useCallback((): number => {
    return items.filter((item) => !item.isDeleted && item.isMandatory).length;
  }, [items]);

  /**
   * Get count of optional items
   */
  const getOptionalCount = useCallback((): number => {
    return items.filter((item) => !item.isDeleted && !item.isMandatory).length;
  }, [items]);

  /**
   * Add a new item pre-populated from a Tarea (TemplateTag)
   */
  const addItemFromTarea = useCallback(
    (tarea: { id: string; name: string; description?: string }): void => {
      const newItem: ChecklistItemEditor = {
        id: crypto.randomUUID(),
        tempId: crypto.randomUUID(),
        description: tarea.name,
        isMandatory: false,
        order: items.filter((i) => !i.isDeleted).length + 1,
        requiresPhoto: false,
        requiresComment: false,
        inputType: 'checkbox',
        isNew: true,
        isModified: false,
        isDeleted: false,
        errors: {},
      };
      setItems((prev) => [...prev, newItem]);
    },
    [items]
  );

  return {
    // State
    items,
    setItems,

    // Validation
    validateItem,
    validateAllItems,
    checkDuplicates,

    // Item operations
    addItem,
    addItemFromTarea,
    removeItem,
    restoreItem,
    updateItem,
    duplicateItem,

    // Reordering
    reorderItems,
    moveItemUp,
    moveItemDown,

    // Bulk operations
    bulkUpdateItems,
    clearAllItems,
    resetItems,

    // Getters
    getActiveItems,
    getDeletedItems,
    getActiveCount,
    getMandatoryCount,
    getOptionalCount,

    // Utilities
    generateTempId,
  };
};
