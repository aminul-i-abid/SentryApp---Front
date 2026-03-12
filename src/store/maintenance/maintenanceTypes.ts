/**
 * Maintenance Module - TypeScript Types
 *
 * Definiciones de tipos para alertas de mantenimiento
 * Incluye alertas, categorías, configuración de severidad
 */

// ─── MAINTENANCE ALERT ────────────────────────────────────────────

export type AlertSeverity = 'Low' | 'Medium' | 'Critical';
export type AlertStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Cancelled';

export interface MaintenanceAlertHistory {
  id: string;
  alertId: string;
  previousStatus: AlertStatus;
  newStatus: AlertStatus;
  changedBy: string;
  changedByUserName?: string;
  changedAt: string;
  comment?: string;
}

export interface MaintenanceAlert {
  id: string;
  campId: string;
  roomId: string;
  roomNumber: string;
  blockId?: string;
  blockName?: string;
  categoryId: string;
  category?: MaintenanceCategory;
  categoryName?: string;
  severity: AlertSeverity;
  description: string;
  reportedBy: string;
  reportedByUserName?: string;
  reportedAt: string;
  relatedHousekeepingId?: string;
  currentStatus: AlertStatus;
  assignedTo?: string;
  assignedToUserName?: string;
  assignedAt?: string;
  roomBlocked: boolean;
  history: MaintenanceAlertHistory[];
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── MAINTENANCE CATEGORY ─────────────────────────────────────────

export interface MaintenanceSeverityConfig {
  severity: AlertSeverity;
  shouldBlockRoom: boolean;
  color: string;
  icon?: string;
}

export interface MaintenanceCategory {
  id: string;
  campId: string;
  name: string;
  description?: string;
  isActive: boolean;
  severityConfigs: MaintenanceSeverityConfig[];
  createdAt: string;
  updatedAt: string;
}

// ─── REQUEST DTOs ─────────────────────────────────────────────────

export interface CreateAlertRequest {
  roomId: string;
  categoryId: string;
  severity: AlertSeverity;
  description: string;
  relatedHousekeepingId?: string;
  reportedBy?: string; // Auto from JWT in backend
}

export interface UpdateAlertStatusRequest {
  alertId: string;
  newStatus: AlertStatus;
  comment?: string;
  changedBy?: string; // Auto from JWT in backend
}

export interface AssignAlertRequest {
  alertId: string;
  assignedTo: string; // User ID
  assignedBy?: string; // Auto from JWT in backend
}

export interface CreateCategoryRequest {
  campId: string;
  name: string;
  description?: string;
  severityConfigs: MaintenanceSeverityConfig[];
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  severityConfigs: MaintenanceSeverityConfig[];
}

// ─── FILTER PARAMS ────────────────────────────────────────────────

export interface MaintenanceFilters {
  status?: AlertStatus;
  severity?: AlertSeverity;
  categoryId?: string;
  roomId?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  campId: string;
}

// ─── RESPONSE DTOs ────────────────────────────────────────────────

export interface AlertsByStatusResponse {
  pending: MaintenanceAlert[];
  inProgress: MaintenanceAlert[];
  resolved: MaintenanceAlert[];
  cancelled: MaintenanceAlert[];
}

export interface MaintenanceStatsResponse {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
  criticalPending: number;
  blockedRooms: number;
}
