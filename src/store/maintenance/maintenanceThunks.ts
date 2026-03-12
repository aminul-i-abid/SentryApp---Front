/**
 * Maintenance Thunks - Async Actions
 *
 * Thunks para operaciones asíncronas con la API de Maintenance
 * Gestiona alertas y categorías de mantenimiento
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, globalHeaders } from '@/utils/apiFetch';
import type {
  MaintenanceAlert,
  MaintenanceCategory,
  CreateAlertRequest,
  UpdateAlertStatusRequest,
  AssignAlertRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  MaintenanceFilters,
} from './maintenanceTypes';

// Create axios instance for maintenance
const maintenanceApi = axios.create({
  baseURL: `${API_BASE_URL}/maintenance`,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add global headers interceptor
maintenanceApi.interceptors.request.use((request) => {
  Object.entries(globalHeaders).forEach(([key, value]) => {
    request.headers.set(key, value);
  });
  return request;
});

// ─── ALERT THUNKS ─────────────────────────────────────────────────

export const fetchAlerts = createAsyncThunk<
  MaintenanceAlert[],
  MaintenanceFilters
>('maintenance/fetchAlerts', async (filters) => {
  const params = new URLSearchParams();

  params.append('campId', filters.campId);

  if (filters.status) params.append('status', filters.status);
  if (filters.severity) params.append('severity', filters.severity);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.roomId) params.append('roomId', filters.roomId);
  if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);

  const response = await maintenanceApi.get<{ data: MaintenanceAlert[] }>(
    `/alerts?${params.toString()}`
  );
  return response.data.data;
});

export const createAlert = createAsyncThunk<
  MaintenanceAlert,
  CreateAlertRequest
>('maintenance/createAlert', async (request) => {
  const response = await maintenanceApi.post<{ data: MaintenanceAlert }>(
    '/alerts',
    request
  );
  return response.data.data;
});

export const updateAlertStatus = createAsyncThunk<
  MaintenanceAlert,
  UpdateAlertStatusRequest
>('maintenance/updateAlertStatus', async (request) => {
  const response = await maintenanceApi.put<{ data: MaintenanceAlert }>(
    `/alerts/${request.alertId}/status`,
    {
      newStatus: request.newStatus,
      comment: request.comment,
      changedBy: request.changedBy,
    }
  );
  return response.data.data;
});

export const assignAlert = createAsyncThunk<
  MaintenanceAlert,
  AssignAlertRequest
>('maintenance/assignAlert', async (request) => {
  const response = await maintenanceApi.post<{ data: MaintenanceAlert }>(
    `/alerts/${request.alertId}/assign`,
    {
      assignedTo: request.assignedTo,
      assignedBy: request.assignedBy,
    }
  );
  return response.data.data;
});

// ─── CATEGORY THUNKS ──────────────────────────────────────────────

export const fetchCategories = createAsyncThunk<
  MaintenanceCategory[],
  { campId: string }
>('maintenance/fetchCategories', async ({ campId }) => {
  const response = await maintenanceApi.get<{ data: MaintenanceCategory[] }>(
    `/categories?campId=${campId}`
  );
  return response.data.data;
});

export const createCategory = createAsyncThunk<
  MaintenanceCategory,
  CreateCategoryRequest
>('maintenance/createCategory', async (request) => {
  const response = await maintenanceApi.post<{ data: MaintenanceCategory }>(
    '/categories',
    request
  );
  return response.data.data;
});

export const updateCategory = createAsyncThunk<
  MaintenanceCategory,
  UpdateCategoryRequest
>('maintenance/updateCategory', async (request) => {
  const response = await maintenanceApi.put<{ data: MaintenanceCategory }>(
    `/categories/${request.id}`,
    request
  );
  return response.data.data;
});
