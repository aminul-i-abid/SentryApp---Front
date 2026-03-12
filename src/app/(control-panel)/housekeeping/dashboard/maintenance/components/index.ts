/**
 * Maintenance Kanban Components - Barrel Export
 * FASE 5.4 - Housekeeping Dashboard
 *
 * Centralized export for all maintenance Kanban components
 */

export { default as KanbanBoard } from './KanbanBoard';
export { default as KanbanColumn } from './KanbanColumn';
export { default as AlertCard } from './AlertCard';
export { default as AlertDetailsModal } from './AlertDetailsModal';
export { default as BulkActions, type BulkActionType } from './BulkActions';

// AlertFilters must be exported separately due to isolatedModules
import AlertFiltersDefault from './AlertFilters';
export const AlertFiltersComponent = AlertFiltersDefault;
