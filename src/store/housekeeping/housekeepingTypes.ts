/**
 * Housekeeping Module - TypeScript Types
 *
 * Definiciones de tipos para el módulo de Housekeeping (Aseo)
 * Incluye templates, reglas, tareas, censos y reportes
 */

// ─── CHECKLIST TEMPLATE ───────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  description: string;
  isMandatory: boolean;
  order: number;
  requiresPhoto: boolean;
  requiresComment: boolean;
  inputType: 'checkbox' | 'text' | 'number';
  tareaId?: string;
  tareaNombre?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  campId: string;
  categoryId: string;
  categoryName?: string;
  tagId?: string;
  tagName?: string;
  priority: number;
  isActive: boolean;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── TEMPLATE TAG ─────────────────────────────────────────────────

export interface TemplateTag {
  id: string;
  campId: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

// ─── HOUSEKEEPING TAREA (Tarea Maestra Reutilizable) ──────────────────────────

export interface HousekeepingTarea {
  id: string;
  campId: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTareaRequest {
  campId: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  isActive: boolean;
}

export interface UpdateTareaRequest {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  isActive: boolean;
}

// ─── CLEANING RULE ────────────────────────────────────────────────

export type RuleTriggerType = 'interval' | 'checkout' | 'checkin' | 'manual';
export type RuleAppliesTo = 'camp' | 'block' | 'room' | 'jobTag';
export type JobTagValue = 'CategoriaA' | 'CategoriaB' | 'CategoriaC';

export interface CleaningRule {
  id: string;
  name: string;
  campId: string;
  templateId: string;
  templateName?: string;
  priority: number;
  triggerType: RuleTriggerType;
  daysInterval?: number;
  onCheckout: boolean;
  onCheckin: boolean;
  appliesTo: RuleAppliesTo;
  targetIds?: string; // Comma-separated IDs
  targetJobTag?: JobTagValue | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── HOUSEKEEPING TASK ────────────────────────────────────────────

export type HousekeepingTaskStatus =
  | 'NotStarted'
  | 'CensusCompleted'
  | 'InProgress'
  | 'Completed';

export type DiscrepancyType = 'skip' | 'sleep' | 'count';

export interface CensusData {
  totalBeds: number;
  bedsInUse: number;
  expectedGuests: number;
  hasDiscrepancy: boolean;
  discrepancyType?: DiscrepancyType;
  recordedAt?: string;
  recordedBy?: string;
}

export interface ChecklistItemExecution {
  itemId: string;
  description: string;
  isMandatory: boolean;
  isCompleted: boolean;
  completedAt?: string;
  photoUrl?: string;
  comment?: string;
}

export interface HousekeepingRecord {
  id: string;
  campId: string;
  roomId: string;
  blockId: string;
  roomNumber: string;
  blockName?: string;
  date: string;
  status: HousekeepingTaskStatus;
  assignedTo: string[]; // User IDs
  assignedToUserNames?: string[]; // Display names
  assignedBy: string;
  appliedTemplateId?: string;
  appliedTemplateName?: string;
  appliedTemplate?: ChecklistTemplate;
  censusData?: CensusData;
  checklistItems: ChecklistItemExecution[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── DAILY SUMMARY ────────────────────────────────────────────────

export interface OccupancyData {
  totalRooms: number;
  expectedOccupiedRooms: number;
  actualOccupiedRooms: number;
  variancePercent: number;
  roomsCompleted: number;
  roomsInProgress: number;
  roomsNotStarted: number;
  roomsNotAssigned: number;
  occupancyRate: number;
}

export interface DiscrepanciesData {
  skip: number;
  sleep: number;
  count: number;
  censusBeds?: number;
  reservationBeds?: number;
}

export interface HousekeepingMetrics {
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksInProgress: number;
  completionRate: number;
}

export interface MaintenanceMetrics {
  newAlerts: number;
  resolvedAlerts: number;
  criticalPending: number;
}

export interface DailySummary {
  id: string;
  campId: string;
  date: string;
  occupancy: OccupancyData;
  discrepancies: DiscrepanciesData;
  housekeeping: HousekeepingMetrics;
  maintenance: MaintenanceMetrics;
  lastUpdated: string;
  vsYesterdayCompletionRate: number | null;
  vsYesterdayDiscrepanciesCount: number | null;
  vsYesterdayRoomsCompleted: number | null;
}

// ─── TASK CATEGORY (deprecated — usar TemplateTag) ────────────────

export interface TaskCategory {
  id: string;
  campId: string;
  name: string;
  description?: string;
  basePriority?: number;
  isActive: boolean;
}

// ─── REQUEST DTOs ─────────────────────────────────────────────────

export interface AssignTasksRequest {
  campId: string;
  date: string;
  roomIds: string[];
  assignedToUserIds: string[];
  assignedBy: string;
}

export interface CreateChecklistItemRequest {
  description: string;
  isMandatory: boolean;
  order: number;
  requiresPhoto: boolean;
  requiresComment: boolean;
  inputType?: 'checkbox' | 'text' | 'number';
  tareaId?: number;
}

export interface CreateTemplateRequest {
  name: string;
  campId: string;
  categoryId: string;
  tagId?: string;
  priority: number;
  items: CreateChecklistItemRequest[];
}

export interface UpdateTemplateRequest {
  id: string;
  name: string;
  categoryId: string;
  priority: number;
  isActive: boolean;
  items: CreateChecklistItemRequest[];
}

export interface CreateRuleRequest {
  name: string;
  campId: string;
  templateId: string;
  priority: number;
  triggerType: RuleTriggerType;
  daysInterval?: number;
  onCheckout: boolean;
  onCheckin: boolean;
  appliesTo: RuleAppliesTo;
  targetIds?: string;
  targetJobTag?: JobTagValue | null;
}

export interface UpdateRuleRequest {
  id: string;
  name: string;
  templateId: string;
  priority: number;
  triggerType: RuleTriggerType;
  daysInterval?: number;
  onCheckout: boolean;
  onCheckin: boolean;
  appliesTo: RuleAppliesTo;
  targetIds?: string;
  targetJobTag?: JobTagValue | null;
  isActive: boolean;
}

export interface RecordCensusRequest {
  taskId: string;
  bedsInUse: number;
}

export interface UpdateChecklistRequest {
  taskId: string;
  items: ChecklistItemExecution[];
}

export interface CompleteTaskRequest {
  taskId: string;
}

// ─── RESPONSE DTOs ────────────────────────────────────────────────

export interface AssignTasksResponse {
  tasksCreated: number;
  taskIds: string[];
}

export interface VarianceReportParams {
  campId: string;
  startDate: string;
  endDate: string;
}

// ─── MAINTENANCE ALERTS ───────────────────────────────────────────

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Cancelled';

export interface MaintenanceAlert {
  id: string;
  campId: string;
  roomId: string;
  roomNumber: string;
  blockId?: string;
  blockName?: string;
  title: string;
  description: string;
  category: string;
  severity: AlertSeverity;
  status: AlertStatus;
  assignedTo?: string[];
  assignedToNames?: string[];
  reportedBy: string;
  reportedByName?: string;
  reportedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  photoUrls?: string[];
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── ASSIGNMENT GROUPS ─────────────────────────────────────────────────────

export type AssignmentLevel = 'camp' | 'block' | 'rooms';

export interface OperatorOption {
  id: string;
  fullName: string;
  rut: string;
  email: string;
}

export interface RoomOption {
  id: string;
  number: string;
  blockId: string;
  blockName: string;
  floor?: number;
  bedCount: number;
}

export interface BlockWithCount {
  id: string;
  name: string;
  campId: string;
  roomCount: number;
}

export interface AssignmentGroupListItem {
  id: string;
  level: AssignmentLevel;
  blockName?: string;
  operatorCount: number;
  roomCount: number;
  operatorNames: string[];
  createdAt: string;
}

export interface AssignmentGroupDetail {
  id: string;
  campId: string;
  campName: string;
  level: AssignmentLevel;
  targetBlockId?: string;
  blockName?: string;
  operators: OperatorOption[];
  rooms: RoomOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentGroupRequest {
  /** Must be a numeric camp ID (long on the backend). */
  campId: number;
  level: AssignmentLevel;
  /** Must be a numeric block ID (long on the backend). */
  targetBlockId?: number;
  operatorUserIds: string[];
  /** Must contain numeric room IDs (long[] on the backend). */
  roomIds: number[];
  createdByUserId: string;
}

export interface UpdateAssignmentGroupRequest {
  id: string;
  operatorUserIds: string[];
  roomIds: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface RoomsPagedRequest {
  /** Numeric camp ID (long on the backend). */
  campId: number;
  /** Numeric block ID (long on the backend). */
  blockId?: number;
  floor?: number;
  search?: string;
  page: number;
  pageSize: number;
}
