/**
 * useCorrectiveActions Hook - FASE 5.4
 *
 * Generates smart corrective action suggestions based on discrepancy type
 * Supports auto-execution of simple actions and action history tracking
 *
 * Discrepancy Types:
 * - 'sleep': Unauthorized occupancy (guest in bed when no reservation)
 * - 'skip': Expected occupied but empty (reservation active but room empty)
 * - 'count': Count mismatch (discrepancy between expected and actual occupancy)
 */

import { useState, useCallback, useRef } from 'react';
import type { HousekeepingRecord } from '@/store/housekeeping/housekeepingTypes';
import type {
  CorrectiveAction,
  DiscrepancyType,
} from '../../types/dashboardTypes';

/**
 * Action execution result
 */
export interface ActionExecutionResult {
  success: boolean;
  actionId: string;
  timestamp: string;
  message: string;
  executedBy?: string;
  autoExecuted: boolean;
}

/**
 * Action history entry
 */
export interface ActionHistoryEntry {
  discrepancyId: string;
  actions: ActionExecutionResult[];
  lastUpdated: string;
}

/**
 * Return type for useCorrectiveActions hook
 */
export interface UseCorrectiveActionsResult {
  getCorrectiveActions: (discrepancy: HousekeepingRecord) => CorrectiveAction[];
  executeAction: (
    discrepancy: HousekeepingRecord,
    action: CorrectiveAction,
    executedBy?: string
  ) => Promise<ActionExecutionResult>;
  getActionHistory: (discrepancyId: string) => ActionHistoryEntry | undefined;
  clearHistory: () => void;
  isExecuting: boolean;
}

/**
 * Custom hook to generate and execute corrective actions for discrepancies
 *
 * @returns Methods to get, execute, and track corrective actions
 *
 * @example
 * const { getCorrectiveActions, executeAction } = useCorrectiveActions();
 * const actions = getCorrectiveActions(discrepancy);
 * await executeAction(discrepancy, actions[0], userId);
 */
export const useCorrectiveActions = (): UseCorrectiveActionsResult => {
  // ─── State Management ──────────────────────────────────────

  // Track execution history
  const [actionHistory, setActionHistory] = useState<
    Map<string, ActionHistoryEntry>
  >(new Map());

  // Track execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Track auto-executed actions
  const autoExecutionQueue = useRef<Set<string>>(new Set());

  // ─── Corrective Action Generators ─────────────────────────

  /**
   * Generate corrective actions for 'sleep' discrepancy
   * (Unauthorized occupancy - guest in bed when no reservation)
   */
  const getActionsForSleep = (
    discrepancy: HousekeepingRecord
  ): CorrectiveAction[] => {
    return [
      {
        type: 'verify_reservation',
        title: 'Verify Reservation Status',
        description: `Check if guest in room ${discrepancy.roomNumber} has a valid reservation. \
Verify booking details and guest information in the system.`,
        priority: 'high',
        estimatedTime: 15,
        autoExecutable: false,
      },
      {
        type: 'notify_guest',
        title: 'Contact Guest',
        description: `Reach out to the guest to clarify their stay. \
Confirm they are authorized to be in the room or request immediate vacating if unauthorized.`,
        priority: 'high',
        estimatedTime: 20,
        autoExecutable: false,
      },
      {
        type: 'maintenance_alert',
        title: 'Create Maintenance Alert',
        description: `Create a security/maintenance alert for unauthorized occupancy. \
Document the incident and assign to management for further investigation.`,
        priority: 'medium',
        estimatedTime: 10,
        autoExecutable: true,
      },
    ];
  };

  /**
   * Generate corrective actions for 'skip' discrepancy
   * (Expected occupied but empty - reservation active but room empty)
   */
  const getActionsForSkip = (
    discrepancy: HousekeepingRecord
  ): CorrectiveAction[] => {
    return [
      {
        type: 'check_room',
        title: 'Physical Room Inspection',
        description: `Physically inspect room ${discrepancy.roomNumber} to verify occupancy status. \
Check for guest belongings, signs of habitation, and equipment usage.`,
        priority: 'high',
        estimatedTime: 10,
        autoExecutable: false,
      },
      {
        type: 'verify_reservation',
        title: 'Verify Checkout Status',
        description: `Confirm guest checkout status in reservation system. \
Check if guest has already left without proper check-in procedure or if checkout was missed.`,
        priority: 'high',
        estimatedTime: 10,
        autoExecutable: false,
      },
      {
        type: 'notify_guest',
        title: 'Contact Guest',
        description: `Attempt to contact the guest to confirm their status. \
Clarify if they will be arriving, have already checked out, or need to update their reservation.`,
        priority: 'medium',
        estimatedTime: 15,
        autoExecutable: false,
      },
      {
        type: 'manual_review',
        title: 'Manual Record Review',
        description: `Conduct manual review of the discrepancy record. \
Check census data, occupancy logs, and previous status updates to identify the root cause.`,
        priority: 'medium',
        estimatedTime: 20,
        autoExecutable: true,
      },
    ];
  };

  /**
   * Generate corrective actions for 'count' discrepancy
   * (Count mismatch - discrepancy between expected and actual occupancy)
   */
  const getActionsForCount = (
    discrepancy: HousekeepingRecord
  ): CorrectiveAction[] => {
    return [
      {
        type: 'manual_review',
        title: 'Recount Beds/Occupancy',
        description: `Perform manual recount of beds in use in room ${discrepancy.roomNumber}. \
Update census data if initial count was inaccurate.`,
        priority: 'medium',
        estimatedTime: 15,
        autoExecutable: false,
      },
      {
        type: 'check_room',
        title: 'Inspect Room Conditions',
        description: `Conduct physical inspection to verify occupancy count. \
Check bed usage, guest presence, and compare with recorded census data.`,
        priority: 'medium',
        estimatedTime: 10,
        autoExecutable: false,
      },
      {
        type: 'maintenance_alert',
        title: 'Create Count Audit Alert',
        description: `Create maintenance/audit alert for count discrepancy. \
Flag for management review and data integrity verification.`,
        priority: 'low',
        estimatedTime: 10,
        autoExecutable: true,
      },
    ];
  };

  // ─── Main Action Generator ────────────────────────────────

  /**
   * Get corrective actions based on discrepancy type
   */
  const getCorrectiveActions = useCallback(
    (discrepancy: HousekeepingRecord): CorrectiveAction[] => {
      if (!discrepancy.censusData?.discrepancyType) {
        return [];
      }

      const type = discrepancy.censusData.discrepancyType;

      switch (type) {
        case 'sleep':
          return getActionsForSleep(discrepancy);
        case 'skip':
          return getActionsForSkip(discrepancy);
        case 'count':
          return getActionsForCount(discrepancy);
        default:
          console.warn(`Unknown discrepancy type: ${type}`);
          return [];
      }
    },
    []
  );

  // ─── Action Execution ──────────────────────────────────────

  /**
   * Execute a corrective action
   * Simulates the action execution and tracks history
   */
  const executeAction = useCallback(
    async (
      discrepancy: HousekeepingRecord,
      action: CorrectiveAction,
      executedBy?: string
    ): Promise<ActionExecutionResult> => {
      return new Promise((resolve) => {
        // Simulate async execution
        setTimeout(() => {
          const result: ActionExecutionResult = {
            success: true,
            actionId: `${action.type}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: `Action "${action.title}" executed successfully for room ${discrepancy.roomNumber}`,
            executedBy,
            autoExecuted: false,
          };

          // Track action in history
          const currentHistory = actionHistory.get(discrepancy.id) || {
            discrepancyId: discrepancy.id,
            actions: [],
            lastUpdated: new Date().toISOString(),
          };

          currentHistory.actions.push(result);
          currentHistory.lastUpdated = new Date().toISOString();

          const newHistory = new Map(actionHistory);
          newHistory.set(discrepancy.id, currentHistory);
          setActionHistory(newHistory);

          resolve(result);
        }, 500);
      });
    },
    [actionHistory]
  );

  /**
   * Auto-execute simple actions (those marked as autoExecutable)
   * Used for automatic maintenance alerts and manual review flags
   */
  const autoExecuteAction = useCallback(
    async (
      discrepancy: HousekeepingRecord,
      action: CorrectiveAction
    ): Promise<ActionExecutionResult> => {
      // Prevent duplicate auto-execution
      const actionKey = `${discrepancy.id}-${action.type}`;
      if (autoExecutionQueue.current.has(actionKey)) {
        return {
          success: false,
          actionId: action.type,
          timestamp: new Date().toISOString(),
          message: 'Action already queued for execution',
          autoExecuted: true,
        };
      }

      autoExecutionQueue.current.add(actionKey);

      try {
        const result = await executeAction(discrepancy, action, 'system');
        return {
          ...result,
          autoExecuted: true,
        };
      } finally {
        autoExecutionQueue.current.delete(actionKey);
      }
    },
    [executeAction]
  );

  // ─── History Management ────────────────────────────────────

  /**
   * Get action history for a discrepancy
   */
  const getActionHistory = useCallback(
    (discrepancyId: string): ActionHistoryEntry | undefined => {
      return actionHistory.get(discrepancyId);
    },
    [actionHistory]
  );

  /**
   * Clear all action history
   */
  const clearHistory = useCallback(() => {
    setActionHistory(new Map());
    autoExecutionQueue.current.clear();
  }, []);

  // ─── Return Value ──────────────────────────────────────────

  return {
    getCorrectiveActions,
    executeAction,
    getActionHistory,
    clearHistory,
    isExecuting,
  };
};

/**
 * Utility function to determine priority color for UI rendering
 */
export const getPriorityColor = (
  priority: CorrectiveAction['priority']
): string => {
  switch (priority) {
    case 'high':
      return '#d32f2f'; // red
    case 'medium':
      return '#f57c00'; // orange
    case 'low':
      return '#fbc02d'; // yellow
    default:
      return '#757575'; // gray
  }
};

/**
 * Utility function to get action icon based on action type
 */
export const getActionIcon = (actionType: CorrectiveAction['type']): string => {
  switch (actionType) {
    case 'verify_reservation':
      return 'event_note'; // Check
    case 'notify_guest':
      return 'notifications_active'; // Bell
    case 'check_room':
      return 'meeting_room'; // Room
    case 'maintenance_alert':
      return 'warning'; // Alert
    case 'manual_review':
      return 'assessment'; // Clipboard
    default:
      return 'info';
  }
};

/**
 * Custom hook for batch processing corrective actions
 * Useful for processing multiple discrepancies at once
 */
export const useBatchCorrectiveActions = () => {
  const { executeAction, getCorrectiveActions } = useCorrectiveActions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  /**
   * Process corrective actions for multiple discrepancies
   */
  const processBatch = useCallback(
    async (
      discrepancies: HousekeepingRecord[],
      actionFilter?: (action: CorrectiveAction) => boolean,
      executedBy?: string
    ): Promise<ActionExecutionResult[]> => {
      setIsProcessing(true);
      setProcessedCount(0);

      const results: ActionExecutionResult[] = [];

      for (const discrepancy of discrepancies) {
        const actions = getCorrectiveActions(discrepancy);
        const actionsToExecute = actionFilter
          ? actions.filter(actionFilter)
          : actions.filter((a) => a.autoExecutable);

        for (const action of actionsToExecute) {
          const result = await executeAction(discrepancy, action, executedBy);
          results.push(result);
          setProcessedCount((prev) => prev + 1);
        }
      }

      setIsProcessing(false);
      return results;
    },
    [executeAction, getCorrectiveActions]
  );

  return {
    processBatch,
    isProcessing,
    processedCount,
  };
};
