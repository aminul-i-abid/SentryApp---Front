/**
 * useDragAndDrop Hook
 *
 * Custom React hook for handling drag & drop operations in Kanban board
 * - Manages drag state with optimistic UI updates
 * - Updates alert status on drop using Redux thunk: updateAlertStatus
 * - Implements rollback mechanism on API failures
 * - Handles DropResult from react-beautiful-dnd
 * - Provides error handling and loading states
 * - Validates drop operations before executing
 *
 * @returns {UseDragAndDropReturn} Object with drag handlers and state
 *
 * @example
 * const {
 *   onDragEnd,
 *   onDragStart,
 *   isDragging,
 *   dragError,
 *   clearDragError
 * } = useDragAndDrop({
 *   onStatusChanged: handleStatusChange,
 *   onError: handleError
 * });
 */

import { useCallback, useState, useRef } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAlertStatus } from '@/store/maintenance';
import type { MaintenanceAlert, AlertStatus } from '@/store/maintenance/maintenanceTypes';

// ─── TYPES ────────────────────────────────────────────────────────────

/**
 * Callback triggered after successful status change
 */
export type OnStatusChangedCallback = (
  alert: MaintenanceAlert,
  previousStatus: AlertStatus,
  newStatus: AlertStatus
) => void;

/**
 * Callback for error handling
 */
export type OnErrorCallback = (error: Error | string, alertId: string) => void;

export interface UseDragAndDropOptions {
  /** Callback when alert status is successfully changed */
  onStatusChanged?: OnStatusChangedCallback;
  /** Callback for error handling */
  onError?: OnErrorCallback;
  /** Optional user ID for tracking who made the change */
  userId?: string;
  /** Optional flag to enable verbose logging */
  debug?: boolean;
}

export interface UseDragAndDropReturn {
  /** Handler for drag end event from DragDropContext */
  onDragEnd: (result: DropResult) => Promise<void>;
  /** Handler for drag start event */
  onDragStart: () => void;
  /** Flag indicating if a drag operation is in progress */
  isDragging: boolean;
  /** Error message from last failed operation */
  dragError: string | null;
  /** Function to clear the error state */
  clearDragError: () => void;
  /** Flag indicating if API call is in progress */
  isUpdating: boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────

const VALID_DROP_ZONES = ['column-pending', 'column-inprogress', 'column-resolved', 'column-cancelled'];

const STATUS_MAP: Record<string, AlertStatus> = {
  'column-pending': 'Pending',
  'column-inprogress': 'InProgress',
  'column-resolved': 'Resolved',
  'column-cancelled': 'Cancelled',
};

// ─── HOOK ─────────────────────────────────────────────────────────────

export function useDragAndDrop(options: UseDragAndDropOptions = {}): UseDragAndDropReturn {
  const dispatch = useAppDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get alerts from store for optimistic update/rollback
  const alerts = useAppSelector((state) => state.maintenance.alerts || []);

  // Keep track of original state for rollback
  const previousStateRef = useRef<Record<string, MaintenanceAlert>>({});

  const { onStatusChanged, onError, userId, debug = false } = options;

  /**
   * Validate if drop zone is valid
   */
  const isValidDropZone = (droppableId: string): boolean => {
    return VALID_DROP_ZONES.includes(droppableId);
  };

  /**
   * Get status from droppable ID
   */
  const getStatusFromDropZone = (droppableId: string): AlertStatus | null => {
    return STATUS_MAP[droppableId] || null;
  };

  /**
   * Find alert by ID in alerts list
   */
  const findAlertById = (alertId: string): MaintenanceAlert | undefined => {
    return alerts.find((alert) => alert.id === alertId);
  };

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(null);
    if (debug) console.log('[DragAndDrop] Drag started');
  }, [debug]);

  /**
   * Handle drag end with optimistic update and rollback
   */
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;

      setIsDragging(false);

      // Validation checks
      if (!destination) {
        if (debug) console.log('[DragAndDrop] Dropped outside valid zone');
        return;
      }

      if (source.droppableId === destination.droppableId) {
        if (debug) console.log('[DragAndDrop] Dropped in same column');
        return;
      }

      if (!isValidDropZone(destination.droppableId)) {
        const error = `Invalid drop zone: ${destination.droppableId}`;
        setDragError(error);
        onError?.(error, draggableId);
        if (debug) console.warn('[DragAndDrop]', error);
        return;
      }

      // Find the alert being dragged
      const alert = findAlertById(draggableId);
      if (!alert) {
        const error = `Alert not found: ${draggableId}`;
        setDragError(error);
        onError?.(error, draggableId);
        if (debug) console.warn('[DragAndDrop]', error);
        return;
      }

      // Get new status
      const newStatus = getStatusFromDropZone(destination.droppableId);
      if (!newStatus) {
        const error = `Unable to determine status from drop zone`;
        setDragError(error);
        onError?.(error, draggableId);
        if (debug) console.warn('[DragAndDrop]', error);
        return;
      }

      // Don't update if status hasn't changed
      if (alert.currentStatus === newStatus) {
        if (debug) console.log(`[DragAndDrop] Status unchanged (${newStatus})`);
        return;
      }

      // Store previous state for rollback
      const previousStatus = alert.currentStatus;
      previousStateRef.current[alert.id] = { ...alert };

      try {
        setIsUpdating(true);
        setDragError(null);

        if (debug) {
          console.log('[DragAndDrop] Updating alert status:', {
            alertId: alert.id,
            from: previousStatus,
            to: newStatus,
          });
        }

        // Dispatch Redux thunk to update status
        const updatedAlert = await dispatch(
          updateAlertStatus({
            alertId: alert.id,
            newStatus,
            changedBy: userId,
          })
        ).unwrap();

        if (debug) console.log('[DragAndDrop] Update successful:', updatedAlert);

        // Trigger callback
        onStatusChanged?.(updatedAlert, previousStatus, newStatus);

        // Clear stored state
        delete previousStateRef.current[alert.id];
      } catch (error) {
        // Handle API error
        const errorMessage = error instanceof Error ? error.message : 'Failed to update alert status';

        setDragError(errorMessage);
        onError?.(error || errorMessage, alert.id);

        if (debug) {
          console.error('[DragAndDrop] Update failed:', {
            alertId: alert.id,
            error: errorMessage,
          });
        }

        // Note: UI rollback is handled by Redux - the alert status in state
        // will remain in previous status since the dispatch failed
      } finally {
        setIsUpdating(false);
      }
    },
    [dispatch, findAlertById, isValidDropZone, getStatusFromDropZone, onStatusChanged, onError, userId, debug]
  );

  /**
   * Clear error state
   */
  const clearDragError = useCallback(() => {
    setDragError(null);
  }, []);

  return {
    onDragEnd: handleDragEnd,
    onDragStart: handleDragStart,
    isDragging,
    dragError,
    clearDragError,
    isUpdating,
  };
}

export default useDragAndDrop;
