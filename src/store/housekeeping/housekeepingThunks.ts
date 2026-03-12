/**
 * Housekeeping Thunks - Async Actions
 *
 * Thunks para operaciones asíncronas con la API de Housekeeping
 * Usa axios service configurado en utils/apiService.ts
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, globalHeaders } from '@/utils/apiFetch';
import type {
  ChecklistTemplate,
  CleaningRule,
  HousekeepingRecord,
  DailySummary,
  TemplateTag,
  HousekeepingTarea,
  CreateTareaRequest,
  UpdateTareaRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateRuleRequest,
  UpdateRuleRequest,
  AssignTasksRequest,
  AssignTasksResponse,
  VarianceReportParams,
  ChecklistItemExecution,
} from './housekeepingTypes';

// Create axios instance for housekeeping
// FIXED: baseURL apunta a /housekeeping que coincide con el controller del backend
// Exported so assignmentGroupThunks.ts can reuse the same instance (shared interceptors)
export const housekeepingApi = axios.create({
  baseURL: `${API_BASE_URL}/housekeeping`,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add global headers interceptor
housekeepingApi.interceptors.request.use((request) => {
  Object.entries(globalHeaders).forEach(([key, value]) => {
    request.headers.set(key, value);
  });
  return request;
});

// ─── TEMPLATE THUNKS ──────────────────────────────────────────────

export const fetchTemplates = createAsyncThunk<
  ChecklistTemplate[],
  { campId: string }
>('housekeeping/fetchTemplates', async ({ campId }) => {
  const response = await housekeepingApi.get<{ data: ChecklistTemplate[] }>(
    `/config/templates?campId=${campId}`
  );
  return response.data.data;
});

export const createTemplate = createAsyncThunk<
  ChecklistTemplate,
  CreateTemplateRequest
>('housekeeping/createTemplate', async (request) => {
  const response = await housekeepingApi.post<{ data: ChecklistTemplate }>(
    '/config/templates',
    request
  );
  return response.data.data;
});

export const updateTemplate = createAsyncThunk<
  ChecklistTemplate,
  UpdateTemplateRequest
>('housekeeping/updateTemplate', async (request) => {
  const response = await housekeepingApi.put<{ data: ChecklistTemplate }>(
    `/config/templates/${request.id}`,
    request
  );
  return response.data.data;
});

export const fetchTemplateById = createAsyncThunk<
  ChecklistTemplate,
  { id: string }
>('housekeeping/fetchTemplateById', async ({ id }) => {
  const response = await housekeepingApi.get<{ data: ChecklistTemplate }>(
    `/config/templates/${id}`
  );
  return response.data.data;
});

export const deleteTemplate = createAsyncThunk<string, { id: string }>(
  'housekeeping/deleteTemplate',
  async ({ id }) => {
    await housekeepingApi.delete(`/config/templates/${id}`);
    return id;
  }
);

// ─── RULE THUNKS ──────────────────────────────────────────────────
// NOTA: Rules endpoints no están implementados en backend actualmente
// Deshabilitado temporalmente hasta implementación

export const fetchRules = createAsyncThunk<CleaningRule[], { campId: string }>(
  'housekeeping/fetchRules',
  async ({ campId }) => {
    try {
      const response = await housekeepingApi.get<{ data: CleaningRule[] }>(
        `/config/rules?campId=${campId}`
      );
      return response.data.data;
    } catch {
      // Backend no implementado aún — retornar array vacío sin error
      return [];
    }
  }
);

export const createRule = createAsyncThunk<CleaningRule, CreateRuleRequest>(
  'housekeeping/createRule',
  async (request) => {
    const response = await housekeepingApi.post<{ data: CleaningRule }>(
      '/config/rules',
      request
    );
    return response.data.data;
  }
);

export const updateRule = createAsyncThunk<CleaningRule, UpdateRuleRequest>(
  'housekeeping/updateRule',
  async (request) => {
    const response = await housekeepingApi.put<{ data: CleaningRule }>(
      `/config/rules/${request.id}`,
      request
    );
    return response.data.data;
  }
);

export const deleteRule = createAsyncThunk<string, string>(
  'housekeeping/deleteRule',
  async (ruleId) => {
    await housekeepingApi.delete(`/config/rules/${ruleId}`);
    return ruleId;
  }
);

// ─── TASK THUNKS ──────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk<
  HousekeepingRecord[],
  { campId: string; date: string }
>('housekeeping/fetchTasks', async ({ campId, date }) => {
  const response = await housekeepingApi.get<{ data: HousekeepingRecord[] }>(
    `/tasks?campId=${campId}&date=${date}`
  );
  return response.data.data;
});

export const assignTasks = createAsyncThunk<
  AssignTasksResponse,
  AssignTasksRequest
>('housekeeping/assignTasks', async (request) => {
  const response = await housekeepingApi.post<{ data: AssignTasksResponse }>(
    '/tasks/assign',
    request
  );
  return response.data.data;
});

export const fetchMyTasks = createAsyncThunk<
  HousekeepingRecord[],
  { userId: string; date: string }
>('housekeeping/fetchMyTasks', async ({ userId, date }) => {
  const response = await housekeepingApi.get<{ data: HousekeepingRecord[] }>(
    `/tasks/my-tasks?userId=${userId}&date=${date}`
  );
  return response.data.data;
});

// ─── DASHBOARD & REPORTS THUNKS ───────────────────────────────────

/**
 * Backend DTO structure (flat) from HousekeepingReportsController
 * Matches actual JSON response: { totalRooms, discrepanciesSkip, ... }
 */
export interface BackendDailySummaryDto {
  date: string;
  lastUpdated: string;
  totalRooms: number;
  roomsCompleted: number;
  roomsInProgress: number;
  roomsNotStarted: number;
  roomsNotAssigned: number;
  expectedOccupiedRooms: number;
  actualOccupiedRooms: number;
  occupancyRate: number;
  variancePercent: number;
  discrepanciesSkip: number;
  discrepanciesSleep: number;
  discrepanciesCount: number;
  discrepanciesCountType?: number;
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksInProgress: number;
  completionRate: number;
  newAlerts: number;
  resolvedAlerts: number;
  criticalPending: number;
  vsYesterdayCompletionRate: number | null;
  vsYesterdayDiscrepanciesCount: number | null;
  vsYesterdayRoomsCompleted: number | null;
  censusBeds?: number;
  reservationBeds?: number;
}

/**
 * Map flat backend DTO to the nested DailySummary structure used by the frontend
 *
 * Fallback logic handles backends that haven't yet deployed the roomsXxx fields
 * (they use the equivalent tasksXxx fields which carry the same values).
 */
export const transformDailySummaryDto = (dto: BackendDailySummaryDto): DailySummary => {
  // Fallbacks for older backend responses that don't include the room-breakdown fields
  const roomsCompleted  = dto.roomsCompleted  ?? dto.tasksCompleted  ?? 0;
  const roomsInProgress = dto.roomsInProgress ?? dto.tasksInProgress ?? 0;
  const roomsNotStarted = dto.roomsNotStarted ?? 0;
  // roomsNotAssigned: derive from totalRooms - total records assigned if field absent
  const roomsNotAssigned = dto.roomsNotAssigned
    ?? Math.max(0, (dto.totalRooms ?? 0) - (dto.totalTasksAssigned ?? 0));

  return {
    id: '',
    campId: '',
    date: dto.date ?? '',
    occupancy: {
      totalRooms: dto.totalRooms ?? 0,
      roomsCompleted,
      roomsInProgress,
      roomsNotStarted,
      roomsNotAssigned,
      expectedOccupiedRooms: dto.expectedOccupiedRooms ?? 0,
      actualOccupiedRooms: dto.actualOccupiedRooms ?? 0,
      occupancyRate: dto.occupancyRate ?? 0,
      variancePercent: dto.variancePercent ?? 0,
    },
    discrepancies: {
      skip: dto.discrepanciesSkip ?? 0,
      sleep: dto.discrepanciesSleep ?? 0,
      count: dto.discrepanciesCountType ?? 0,
      censusBeds: dto.censusBeds ?? 0,
      // Fallback: old backend uses expectedOccupiedRooms (= activeReservations count),
      // which equals what the new backend computes as ReservationBeds.
      reservationBeds: dto.reservationBeds ?? dto.expectedOccupiedRooms ?? 0,
    },
    housekeeping: {
      totalTasksAssigned: dto.totalTasksAssigned ?? 0,
      tasksCompleted: dto.tasksCompleted ?? 0,
      tasksPending: dto.tasksPending ?? 0,
      tasksInProgress: dto.tasksInProgress ?? 0,
      completionRate: dto.completionRate ?? 0,
    },
    maintenance: {
      newAlerts: dto.newAlerts ?? 0,
      resolvedAlerts: dto.resolvedAlerts ?? 0,
      criticalPending: dto.criticalPending ?? 0,
    },
    lastUpdated: dto.lastUpdated ?? '',
    vsYesterdayCompletionRate: dto.vsYesterdayCompletionRate ?? null,
    vsYesterdayDiscrepanciesCount: dto.vsYesterdayDiscrepanciesCount ?? null,
    vsYesterdayRoomsCompleted: dto.vsYesterdayRoomsCompleted ?? null,
  };
};

export const fetchDailySummary = createAsyncThunk<
  DailySummary,
  { campId: string; date: string }
>('housekeeping/fetchDailySummary', async ({ campId, date }) => {
  const timestamp = new Date().getTime();
  const response = await housekeepingApi.get<{ succeeded: boolean; data: BackendDailySummaryDto }>(
    `/reports/daily-summary?campId=${campId}&date=${date}&_t=${timestamp}`
  );

  if (!response.data.succeeded || !response.data.data) {
    throw new Error('No se pudo cargar el resumen diario');
  }

  const transformedData = transformDailySummaryDto(response.data.data);

  transformedData.campId = campId; // Add campId from params

  return transformedData;
});

export const fetchVarianceReport = createAsyncThunk<
  DailySummary[],
  VarianceReportParams
>('housekeeping/fetchVarianceReport', async (params) => {
  const response = await housekeepingApi.get<{ data: DailySummary[] }>(
    `/reports/variance`,
    { params }
  );
  return response.data.data;
});

// ─── TAG THUNKS ───────────────────────────────────────────────────

export const fetchTags = createAsyncThunk<TemplateTag[], { campId: string }>(
  'housekeeping/fetchTags',
  async ({ campId }) => {
    try {
      const response = await housekeepingApi.get<{ data: TemplateTag[] }>(
        `/config/tags?campId=${campId}`
      );
      return response.data.data;
    } catch {
      return [];
    }
  }
);

export const createTag = createAsyncThunk<
  TemplateTag,
  Omit<TemplateTag, 'id'>
>('housekeeping/createTag', async (tag) => {
  const response = await housekeepingApi.post<{ data: TemplateTag }>('/config/tags', tag);
  return response.data.data;
});

export const updateTag = createAsyncThunk<
  TemplateTag,
  TemplateTag
>('housekeeping/updateTag', async (tag) => {
  const response = await housekeepingApi.put<{ data: TemplateTag }>(`/config/tags/${tag.id}`, tag);
  return response.data.data;
});

export const deleteTag = createAsyncThunk<string, string>(
  'housekeeping/deleteTag',
  async (tagId) => {
    await housekeepingApi.delete(`/config/tags/${tagId}`);
    return tagId;
  }
);

// ─── TASK OPERATION THUNKS ────────────────────────────────────────

export const recordCensus = createAsyncThunk<
  void,
  { taskId: string; bedsInUse: number }
>('housekeeping/recordCensus', async ({ taskId, bedsInUse }) => {
  await housekeepingApi.post(`/tasks/${taskId}/census`, { bedsInUse });
});

export const updateChecklist = createAsyncThunk<
  void,
  { taskId: string; items: ChecklistItemExecution[] }
>('housekeeping/updateChecklist', async ({ taskId, items }) => {
  await housekeepingApi.post(`/tasks/${taskId}/checklist`, { items });
});

export const completeTask = createAsyncThunk<void, { taskId: string }>(
  'housekeeping/completeTask',
  async ({ taskId }) => {
    await housekeepingApi.post(`/tasks/${taskId}/complete`);
  }
);

// ─── THUNKS: TAREAS MAESTRAS ──────────────────────────────────────────────────

export const fetchTareas = createAsyncThunk<
  HousekeepingTarea[],
  { campId: string }
>('housekeeping/fetchTareas', async ({ campId }) => {
  try {
    const response = await housekeepingApi.get<{ data: HousekeepingTarea[] }>(
      `/config/tareas?campId=${campId}`
    );
    return response.data.data;
  } catch {
    return [];
  }
});

export const createTarea = createAsyncThunk<
  HousekeepingTarea,
  CreateTareaRequest
>('housekeeping/createTarea', async (request) => {
  const response = await housekeepingApi.post<{ data: string }>(
    '/config/tareas',
    request
  );
  return {
    id: String(response.data.data),
    campId: request.campId,
    nombre: request.nombre,
    descripcion: request.descripcion || '',
    color: request.color,
    isActive: request.isActive,
    createdAt: new Date().toISOString(),
  };
});

export const updateTarea = createAsyncThunk<
  HousekeepingTarea,
  UpdateTareaRequest
>('housekeeping/updateTarea', async (request, { getState }) => {
  await housekeepingApi.put(
    `/config/tareas/${request.id}`,
    request
  );

  const state = getState() as { housekeeping: { tareas: HousekeepingTarea[] } };
  const existing = state.housekeeping?.tareas?.find((t: HousekeepingTarea) => String(t.id) === String(request.id)) || {};

  return {
    ...existing,
    id: request.id,
    nombre: request.nombre,
    descripcion: request.descripcion || '',
    color: request.color,
    isActive: request.isActive,
  } as HousekeepingTarea;
});

export const deleteTarea = createAsyncThunk<string, string>(
  'housekeeping/deleteTarea',
  async (tareaId) => {
    await housekeepingApi.delete(`/config/tareas/${tareaId}`);
    return tareaId;
  }
);
