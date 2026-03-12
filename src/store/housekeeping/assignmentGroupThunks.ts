/**
 * Assignment Group Thunks - Async Actions
 *
 * Thunks para operaciones asíncronas sobre grupos de asignación de housekeeping.
 * Usa la misma instancia axios que housekeepingThunks.ts.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type {
  AssignmentGroupListItem,
  AssignmentGroupDetail,
  CreateAssignmentGroupRequest,
  UpdateAssignmentGroupRequest,
  PagedResult,
  RoomOption,
  RoomsPagedRequest,
  BlockWithCount,
} from './housekeepingTypes';
import { housekeepingApi } from './housekeepingThunks';

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
// Re-uses the shared instance exported from housekeepingThunks.ts so both files
// share the same base URL, credentials and auth-token interceptor.

// ─── ASSIGNMENT GROUP THUNKS ──────────────────────────────────────────────────

/**
 * Fetches a paginated list of assignment groups for a given camp.
 * GET /api/housekeeping/assignments?campId=X&page=1&pageSize=20
 */
export const getAssignmentGroups = createAsyncThunk<
  AssignmentGroupListItem[],
  { campId: string; page?: number; pageSize?: number }
>(
  'housekeeping/getAssignmentGroups',
  async ({ campId, page = 1, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const response = await housekeepingApi.get<{ data: AssignmentGroupListItem[] }>(
        `/assignments?campId=${campId}&page=${page}&pageSize=${pageSize}`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al cargar grupos de asignación'
        );
      }
      return rejectWithValue('Error desconocido al cargar grupos de asignación');
    }
  }
);

/**
 * Fetches the full detail of a single assignment group.
 * GET /api/housekeeping/assignments/{id}
 */
export const getAssignmentGroupDetail = createAsyncThunk<
  AssignmentGroupDetail,
  string
>(
  'housekeeping/getAssignmentGroupDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await housekeepingApi.get<{ data: AssignmentGroupDetail }>(
        `/assignments/${id}`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al cargar detalle del grupo de asignación'
        );
      }
      return rejectWithValue('Error desconocido al cargar detalle del grupo de asignación');
    }
  }
);

/**
 * Creates a new assignment group.
 * POST /api/housekeeping/assignments
 * Returns the ID of the created group.
 */
export const createAssignmentGroup = createAsyncThunk<
  string,
  CreateAssignmentGroupRequest
>(
  'housekeeping/createAssignmentGroup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await housekeepingApi.post<{ data: string }>(
        '/assignments',
        data
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al crear grupo de asignación'
        );
      }
      return rejectWithValue('Error desconocido al crear grupo de asignación');
    }
  }
);

/**
 * Updates the operators and rooms of an existing assignment group.
 * PUT /api/housekeeping/assignments/{id}
 */
export const updateAssignmentGroup = createAsyncThunk<
  boolean,
  UpdateAssignmentGroupRequest
>(
  'housekeeping/updateAssignmentGroup',
  async (data, { rejectWithValue }) => {
    try {
      await housekeepingApi.put(`/assignments/${data.id}`, data);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al actualizar grupo de asignación'
        );
      }
      return rejectWithValue('Error desconocido al actualizar grupo de asignación');
    }
  }
);

/**
 * Deletes an assignment group by ID.
 * DELETE /api/housekeeping/assignments/{id}
 */
export const deleteAssignmentGroup = createAsyncThunk<
  boolean,
  string
>(
  'housekeeping/deleteAssignmentGroup',
  async (id, { rejectWithValue }) => {
    try {
      await housekeepingApi.delete(`/assignments/${id}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al eliminar grupo de asignación'
        );
      }
      return rejectWithValue('Error desconocido al eliminar grupo de asignación');
    }
  }
);

/**
 * Fetches a paginated list of rooms with optional block/floor/search filters.
 * GET /api/housekeeping/rooms?campId=X&blockId=Y&floor=Z&search=W&page=N&pageSize=50
 */
export const getRoomsPaged = createAsyncThunk<
  PagedResult<RoomOption>,
  RoomsPagedRequest
>(
  'housekeeping/getRoomsPaged',
  async (params, { rejectWithValue }) => {
    try {
      // URLSearchParams requires string values — convert numerics with String()
      const queryParams = new URLSearchParams({
        campId: String(params.campId),
        page: String(params.page),
        pageSize: String(params.pageSize),
      });

      if (params.blockId !== undefined) {
        queryParams.set('blockId', String(params.blockId));
      }
      if (params.floor !== undefined) {
        queryParams.set('floor', String(params.floor));
      }
      if (params.search !== undefined && params.search.trim() !== '') {
        queryParams.set('search', params.search.trim());
      }

      const response = await housekeepingApi.get<{ data: PagedResult<RoomOption> }>(
        `/rooms?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al cargar habitaciones'
        );
      }
      return rejectWithValue('Error desconocido al cargar habitaciones');
    }
  }
);

/**
 * Fetches block info along with its room count.
 * GET /api/housekeeping/blocks/{blockId}/room-count
 */
export const getBlockRoomCount = createAsyncThunk<
  BlockWithCount,
  string
>(
  'housekeeping/getBlockRoomCount',
  async (blockId, { rejectWithValue }) => {
    try {
      const response = await housekeepingApi.get<{ data: BlockWithCount }>(
        `/blocks/${blockId}/room-count`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message ?? 'Error al cargar conteo de habitaciones del bloque'
        );
      }
      return rejectWithValue('Error desconocido al cargar conteo de habitaciones del bloque');
    }
  }
);
