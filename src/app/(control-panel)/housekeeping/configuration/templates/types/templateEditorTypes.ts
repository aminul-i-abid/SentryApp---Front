/**
 * Types for Template Editor functionality
 * FASE 5.3 - Housekeeping Configuration
 */

import type { ChecklistTemplate, ChecklistItem } from '@/store/housekeeping/housekeepingTypes';

/**
 * Extended ChecklistItem with editor-specific fields
 */
export interface ChecklistItemEditor extends Omit<ChecklistItem, 'templateId' | 'createdAt' | 'updatedAt'> {
  id: string;
  tempId: string; // Temporary ID for new items (before saving)
  description: string;
  inputType: 'checkbox' | 'text' | 'number';
  isMandatory: boolean;
  order: number;
  isNew: boolean; // True if item hasn't been saved yet
  isModified: boolean; // True if item has unsaved changes
  isDeleted: boolean; // True if marked for deletion
  errors: Record<string, string>; // Validation errors for this item
}

/**
 * State for the Template Editor screen
 */
export interface TemplateEditorState {
  template: {
    id?: string;
    name: string;
    campId: string;
    categoryId: string; // deprecated — usar tagId
    tagId?: string;
    priority: number;
    isActive: boolean;
  };
  items: ChecklistItemEditor[];
  activeTab: 'basic' | 'items' | 'preview' | 'export';
  draggedItem?: ChecklistItemEditor;
  errors: Record<string, string>;
  hasUnsavedChanges: boolean;
  isPreviewMode: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

/**
 * State for Templates List screen
 */
export interface TemplatesListState {
  filters: {
    categoryId?: string;
    isActive?: boolean;
    searchTerm: string;
  };
  selectedTemplates: string[];
  page: number;
  pageSize: number;
  sortBy: 'priority' | 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Validation errors structure
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  warnings?: string[];
}

/**
 * Request to create a new template
 */
export interface CreateTemplateRequest {
  name: string;
  campId: string;
  categoryId: string; // deprecated — usar tagId
  tagId?: string;
  priority: number;
  isActive: boolean;
  items: Array<{
    description: string;
    inputType: 'checkbox' | 'text' | 'number';
    isMandatory: boolean;
    order: number;
    requiresPhoto: boolean;
    requiresComment: boolean;
    tareaId?: number;
  }>;
}

/**
 * Request to update an existing template
 */
export interface UpdateTemplateRequest extends CreateTemplateRequest {
  id: string;
}

/**
 * Template import/export format
 */
export interface TemplateExportData {
  version: string;
  template: {
    name: string;
    categoryId: string;
    tagId?: string;
    priority: number;
    items: Array<{
      description: string;
      inputType: 'checkbox' | 'text' | 'number';
      isMandatory: boolean;
      order: number;
    }>;
  };
  exportedAt: string;
  exportedBy: string;
}

/**
 * Task Category (simplified from store)
 */
export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  basePriority: number;
  isActive: boolean;
  campId: string;
}

/**
 * Template preview data
 */
export interface TemplatePreviewData {
  templateName: string;
  categoryName: string;
  totalItems: number;
  mandatoryItems: number;
  optionalItems: number;
  estimatedMinutes: number;
}

/**
 * Auto-save status
 */
export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
}

/**
 * Bulk action types for templates list
 */
export type TemplateBulkAction = 'activate' | 'deactivate' | 'delete' | 'duplicate';

/**
 * Template list item (summary view)
 */
export interface TemplateListItem {
  id: string;
  name: string;
  categoryName: string;
  categoryId: string;
  priority: number;
  itemsCount: number;
  mandatoryItemsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Drag and drop result
 */
export interface DragResult {
  source: {
    index: number;
    droppableId: string;
  };
  destination?: {
    index: number;
    droppableId: string;
  };
  draggableId: string;
}
