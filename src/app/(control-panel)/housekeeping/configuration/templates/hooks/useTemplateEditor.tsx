/**
 * useTemplateEditor Hook
 *
 * Main hook for template editor state management.
 * TASK-FR3: Migrated from apiService direct calls to Redux thunks.
 * - Manages TemplateEditorState
 * - Handles template CRUD operations via Redux dispatch
 * - Auto-save with debounce (2 seconds)
 * - Unsaved changes tracking
 * - Error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { useAppDispatch } from '@/store/hooks';
import {
  fetchTemplateById,
  createTemplate as createTemplateThunk,
  updateTemplate as updateTemplateThunk,
} from '@/store/housekeeping/housekeepingThunks';
import type {
  TemplateEditorState,
  ChecklistItemEditor,
  TemplateValidationResult,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from '../types/templateEditorTypes';
import type { ChecklistTemplate } from '@/store/housekeeping/housekeepingTypes';

interface UseTemplateEditorProps {
  templateId?: string;
  campId: string;
  onSaveSuccess?: (template: ChecklistTemplate) => void;
  onSaveError?: (error: any) => void;
}

const INITIAL_STATE: TemplateEditorState = {
  template: {
    name: '',
    campId: '',
    categoryId: '',
    priority: 1,
    isActive: true,
  },
  items: [],
  activeTab: 'basic',
  errors: {},
  hasUnsavedChanges: false,
  isPreviewMode: false,
  isSaving: false,
};

export const useTemplateEditor = ({
  templateId,
  campId,
  onSaveSuccess,
  onSaveError,
}: UseTemplateEditorProps) => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<TemplateEditorState>({
    ...INITIAL_STATE,
    template: { ...INITIAL_STATE.template, campId },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load template if editing
  useEffect(() => {
    if (templateId && templateId !== 'new') {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const template = await dispatch(fetchTemplateById({ id })).unwrap();

      setState((prev) => ({
        ...prev,
        template: {
          id: template.id,
          name: template.name,
          campId: template.campId,
          categoryId: template.categoryId,
          tagId: template.tagId,
          priority: template.priority,
          isActive: template.isActive,
        },
        items: template.items.map(
          (item, index): ChecklistItemEditor => ({
            id: item.id,
            tempId: item.id,
            description: item.description,
            inputType: item.inputType ?? 'checkbox',
            isMandatory: item.isMandatory,
            order: item.order ?? index,
            requiresPhoto: item.requiresPhoto || false,
            requiresComment: item.requiresComment || false,
            isNew: false,
            isModified: false,
            isDeleted: false,
            errors: {},
          })
        ),
      }));
    } catch (err) {
      setError(err);
      console.error('Failed to load template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateTemplate = (data: TemplateEditorState): TemplateValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    // Validate template name
    if (!data.template.name.trim()) {
      errors['name'] = 'Template name is required';
    } else if (data.template.name.length < 3) {
      errors['name'] = 'Template name must be at least 3 characters';
    } else if (data.template.name.length > 100) {
      errors['name'] = 'Template name must not exceed 100 characters';
    }

    // Validate priority
    if (data.template.priority < 1 || data.template.priority > 10) {
      errors['priority'] = 'Priority must be between 1 and 10';
    }

    // Validate items
    const activeItems = data.items.filter((item) => !item.isDeleted);
    if (activeItems.length === 0) {
      errors['items'] = 'At least one checklist item is required';
    }

    // Validate each item
    activeItems.forEach((item, index) => {
      if (!item.description.trim()) {
        errors[`item_${index}_description`] = 'Description is required';
      } else if (item.description.length > 255) {
        errors[`item_${index}_description`] =
          'Description must not exceed 255 characters';
      }
    });

    // Check for duplicates
    const descriptions = activeItems
      .map((item) => item.description.toLowerCase().trim())
      .filter((desc) => desc);
    const duplicates = descriptions.filter(
      (desc, index) => descriptions.indexOf(desc) !== index
    );
    if (duplicates.length > 0) {
      warnings.push(
        `Found ${duplicates.length} duplicate item descriptions`
      );
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  };

  // Build items payload for API
  const buildItemsPayload = (items: ChecklistItemEditor[]) =>
    items
      .filter((item) => !item.isDeleted)
      .map((item, index) => ({
        description: item.description,
        inputType: item.inputType,
        isMandatory: item.isMandatory,
        order: item.order ?? index,
        requiresPhoto: item.requiresPhoto || false,
        requiresComment: item.requiresComment || false,
      }));

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave: TemplateEditorState) => {
      if (!dataToSave.hasUnsavedChanges) return;

      const validation = validateTemplate(dataToSave);
      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          errors: validation.errors,
          isSaving: false,
        }));
        onSaveError?.(new Error('Validation failed'));
        return;
      }

      setState((prev) => ({
        ...prev,
        isSaving: true,
        errors: {},
      }));

      try {
        const itemsPayload = buildItemsPayload(dataToSave.items);
        let savedTemplate: ChecklistTemplate;

        if (dataToSave.template.id) {
          const updatePayload: UpdateTemplateRequest = {
            id: dataToSave.template.id,
            name: dataToSave.template.name,
            campId: dataToSave.template.campId,
            categoryId: dataToSave.template.categoryId,
            priority: dataToSave.template.priority,
            isActive: dataToSave.template.isActive,
            items: itemsPayload,
          };
          savedTemplate = await dispatch(updateTemplateThunk(updatePayload)).unwrap();
        } else {
          const createPayload: CreateTemplateRequest = {
            name: dataToSave.template.name,
            campId: dataToSave.template.campId,
            categoryId: dataToSave.template.categoryId,
            priority: dataToSave.template.priority,
            isActive: dataToSave.template.isActive,
            items: itemsPayload,
          };
          savedTemplate = await dispatch(createTemplateThunk(createPayload)).unwrap();
        }

        setState((prev) => ({
          ...prev,
          template: {
            id: savedTemplate.id,
            name: savedTemplate.name,
            campId: savedTemplate.campId,
            categoryId: savedTemplate.categoryId,
            tagId: savedTemplate.tagId,
            priority: savedTemplate.priority,
            isActive: savedTemplate.isActive,
          },
          hasUnsavedChanges: false,
          isSaving: false,
          lastSaved: new Date(),
        }));

        onSaveSuccess?.(savedTemplate);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
        }));
        setError(err);
        onSaveError?.(err);
        console.error('Failed to save template:', err);
      }
    }, 2000),
    [dispatch]
  );

  // Manual save function
  const saveTemplate = useCallback(async () => {
    await debouncedSave(state);
  }, [state, debouncedSave]);

  // Handle template field changes
  const updateTemplateField = useCallback(
    (field: keyof TemplateEditorState['template'], value: any) => {
      setState((prev) => ({
        ...prev,
        template: {
          ...prev.template,
          [field]: value,
        },
        hasUnsavedChanges: true,
      }));

      // Trigger auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      debouncedSave({
        ...state,
        template: {
          ...state.template,
          [field]: value,
        },
        hasUnsavedChanges: true,
      });
    },
    [state, debouncedSave]
  );

  // Handle items changes
  const updateItems = useCallback(
    (items: ChecklistItemEditor[]) => {
      setState((prev) => ({
        ...prev,
        items,
        hasUnsavedChanges: true,
      }));

      // Trigger auto-save
      debouncedSave({
        ...state,
        items,
        hasUnsavedChanges: true,
      });
    },
    [state, debouncedSave]
  );

  const addItem = useCallback(
    (item: Omit<ChecklistItemEditor, 'id' | 'isNew' | 'isModified'>) => {
      const newItem: ChecklistItemEditor = {
        ...item,
        id: `new_${crypto.randomUUID()}`,
        isNew: true,
        isModified: true,
        isDeleted: false,
      };

      const newItems = [...state.items, newItem];
      updateItems(newItems);
    },
    [state.items, updateItems]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<ChecklistItemEditor>) => {
      const newItems = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              isModified: true,
            }
          : item
      );
      updateItems(newItems);
    },
    [state.items, updateItems]
  );

  const deleteItem = useCallback(
    (id: string) => {
      const newItems = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              isDeleted: true,
            }
          : item
      );
      updateItems(newItems);
    },
    [state.items, updateItems]
  );

  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newItems = [...state.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      // Update order
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index + 1,
        isModified: true,
      }));

      updateItems(reorderedItems);
    },
    [state.items, updateItems]
  );

  const setActiveTab = useCallback(
    (tab: TemplateEditorState['activeTab']) => {
      setState((prev) => ({
        ...prev,
        activeTab: tab,
      }));
    },
    []
  );

  const setPreviewMode = useCallback((isPreview: boolean) => {
    setState((prev) => ({
      ...prev,
      isPreviewMode: isPreview,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      template: { ...INITIAL_STATE.template, campId },
    });
    setError(null);
  }, [campId]);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel?.();
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [debouncedSave]);

  return {
    // State
    state,
    setState,
    isLoading,
    error,
    hasUnsavedChanges: state.hasUnsavedChanges,
    lastSaved: state.lastSaved,

    // Template operations
    loadTemplate,
    updateTemplateField,
    saveTemplate,
    resetForm,

    // Item operations
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    updateItems,

    // UI operations
    setActiveTab,
    setPreviewMode,
    clearErrors,

    // Validation
    validateTemplate,
  };
};
