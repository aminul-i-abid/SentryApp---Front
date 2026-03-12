/**
 * Types for Rule Configurator functionality
 * FASE 5.3 - Housekeeping Configuration
 */

import type { CleaningRule, ChecklistTemplate, JobTagValue } from '@/store/housekeeping/housekeepingTypes';
import type { Block, Room } from '../../../assignment/types/assignmentTypes';

/**
 * Trigger types for cleaning rules
 */
export type TriggerType = 'manual' | 'checkout' | 'checkin' | 'interval';

/**
 * Application scope for rules
 */
export type ApplicationScope = 'camp' | 'block' | 'room' | 'jobTag';

/**
 * Trigger condition configuration
 */
export interface TriggerCondition {
  type: TriggerType;
  daysInterval?: number; // For 'interval' type
  onCheckout: boolean;
  onCheckin: boolean;
}

/**
 * State for the Rule Configurator screen
 */
export interface RuleConfiguratorState {
  rule: {
    id?: string;
    name: string;
    campId: string;
    templateId: string;
    priority: number;
    triggerType: TriggerType;
    daysInterval?: number;
    onCheckout: boolean;
    onCheckin: boolean;
    appliesTo: ApplicationScope;
    targetIds?: string; // Comma-separated IDs
    targetJobTag?: JobTagValue | null;
    isActive: boolean;
  };
  availableTemplates: ChecklistTemplate[];
  availableBlocks: Block[];
  availableRooms: Room[];
  selectedTargets: string[];
  testResult?: RuleTestResult;
  errors: Record<string, string>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

/**
 * State for Rules List screen
 */
export interface RulesListState {
  filters: {
    templateId?: string;
    triggerType?: TriggerType;
    isActive?: boolean;
    searchTerm: string;
    targetJobTag?: JobTagValue | null;
  };
  selectedRules: string[];
  page: number;
  pageSize: number;
  sortBy: 'priority' | 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Rule test parameters
 */
export interface RuleTestParams {
  roomId: string;
  date: string; // ISO date string
  hasCheckout?: boolean;
  hasCheckin?: boolean;
  daysSinceLastCleaning?: number;
  daysSinceCheckin?: number;
}

/**
 * Rule test result
 */
export interface RuleTestResult {
  ruleApplies: boolean;
  reason: string;
  templateSelected?: ChecklistTemplate;
  affectedRooms: number;
  estimatedTasks: number;
  details?: {
    triggerMatched: boolean;
    targetMatched: boolean;
    conditionsMet: string[];
    conditionsNotMet: string[];
  };
}

/**
 * Validation errors structure
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Rule validation result
 */
export interface RuleValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  warnings?: string[];
  conflicts?: RuleConflict[];
}

/**
 * Rule conflict detection
 */
export interface RuleConflict {
  conflictingRuleId: string;
  conflictingRuleName: string;
  reason: string;
  severity: 'warning' | 'error';
}

/**
 * Request to create a new rule
 */
export interface CreateRuleRequest {
  name: string;
  campId: string;
  templateId: string;
  priority: number;
  triggerType: TriggerType;
  daysInterval?: number;
  onCheckout: boolean;
  onCheckin: boolean;
  appliesTo: ApplicationScope;
  targetIds?: string;
  targetJobTag?: JobTagValue | null;
  isActive: boolean;
}

/**
 * Request to update an existing rule
 */
export interface UpdateRuleRequest extends CreateRuleRequest {
  id: string;
}

/**
 * Rule list item (summary view)
 */
export interface RuleListItem {
  id: string;
  name: string;
  templateName: string;
  templateId: string;
  priority: number;
  triggerType: TriggerType;
  triggerDescription: string;
  appliesTo: ApplicationScope;
  targetDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Target selection data
 */
export interface TargetSelectionData {
  scope: ApplicationScope;
  selectedIds: string[];
  availableBlocks: Block[];
  availableRooms: Room[];
}

/**
 * Bulk action types for rules list
 */
export type RuleBulkAction = 'activate' | 'deactivate' | 'delete' | 'duplicate' | 'test';

/**
 * Rule preview data
 */
export interface RulePreviewData {
  ruleName: string;
  templateName: string;
  triggerDescription: string;
  targetDescription: string;
  estimatedTasksPerDay: number;
  estimatedAffectedRooms: number;
  priority: number;
}

/**
 * Trigger type configuration
 */
export interface TriggerTypeConfig {
  type: TriggerType;
  label: string;
  description: string;
  icon: string;
  requiresInterval: boolean;
  requiresCheckout: boolean;
  requiresCheckin: boolean;
}

/**
 * Rule testing simulation result
 */
export interface RuleSimulationResult {
  date: string;
  roomsAffected: Array<{
    roomId: string;
    roomNumber: string;
    reason: string;
    taskWouldBeCreated: boolean;
  }>;
  totalTasks: number;
  totalRooms: number;
}
