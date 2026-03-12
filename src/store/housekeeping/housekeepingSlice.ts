/**
 * Housekeeping Slice - Redux State Management
 *
 * Gestiona el estado de:
 * - Templates de checklist
 * - Reglas de limpieza
 * - Tareas asignadas
 * - Dashboard y reportes
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  ChecklistTemplate,
  CleaningRule,
  HousekeepingRecord,
  DailySummary,
  TaskCategory,
  TemplateTag,
  HousekeepingTarea,
  AssignmentGroupListItem,
  AssignmentGroupDetail,
  PagedResult,
  RoomOption,
} from './housekeepingTypes';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchRules,
  createRule,
  updateRule,
  deleteRule,
  fetchTasks,
  assignTasks,
  fetchMyTasks,
  fetchDailySummary,
  fetchVarianceReport,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchTareas,
  createTarea,
  updateTarea,
  deleteTarea,
} from './housekeepingThunks';
import {
  getAssignmentGroups,
  getAssignmentGroupDetail,
  createAssignmentGroup,
  updateAssignmentGroup,
  deleteAssignmentGroup,
  getRoomsPaged,
  getBlockRoomCount,
} from './assignmentGroupThunks';

// ─── STATE INTERFACE ──────────────────────────────────────────────

export interface HousekeepingState {
  // Configuration
  templates: ChecklistTemplate[];
  rules: CleaningRule[];
  categories: TaskCategory[]; // deprecated — usar tags
  tags: TemplateTag[];
  tareas: HousekeepingTarea[];

  // Operational tasks
  tasks: HousekeepingRecord[];
  myTasks: HousekeepingRecord[]; // For operators

  // Dashboard data
  dailySummary: DailySummary | null;
  varianceData: DailySummary[];

  // Assignment Groups
  assignmentGroups: AssignmentGroupListItem[];
  assignmentGroupDetail: AssignmentGroupDetail | null;
  assignmentGroupsLoading: boolean;
  assignmentGroupsError: string | null;
  roomsPage: PagedResult<RoomOption> | null;
  roomsLoading: boolean;

  // UI State
  loading: boolean;
  error: string | null;
  selectedDate: string; // ISO format YYYY-MM-DD
  filters: {
    status: string;
    assignedTo: string;
    roomId: string;
    blockId: string;
  };
}

// ─── INITIAL STATE ────────────────────────────────────────────────

const initialState: HousekeepingState = {
  templates: [],
  rules: [],
  categories: [],
  tags: [],
  tareas: [],
  tasks: [],
  myTasks: [],
  dailySummary: null,
  varianceData: [],
  assignmentGroups: [],
  assignmentGroupDetail: null,
  assignmentGroupsLoading: false,
  assignmentGroupsError: null,
  roomsPage: null,
  roomsLoading: false,
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
  filters: {
    status: '',
    assignedTo: '',
    roomId: '',
    blockId: '',
  },
};

// ─── SLICE ────────────────────────────────────────────────────────

const housekeepingSlice = createSlice({
  name: 'housekeeping',
  initialState,
  reducers: {
    // Templates
    setTemplates(state, action: PayloadAction<ChecklistTemplate[]>) {
      state.templates = action.payload;
    },
    addTemplate(state, action: PayloadAction<ChecklistTemplate>) {
      state.templates.push(action.payload);
    },
    updateTemplateInState(state, action: PayloadAction<ChecklistTemplate>) {
      const index = state.templates.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },

    // Rules
    setRules(state, action: PayloadAction<CleaningRule[]>) {
      state.rules = action.payload;
    },
    addRule(state, action: PayloadAction<CleaningRule>) {
      state.rules.push(action.payload);
    },
    updateRuleInState(state, action: PayloadAction<CleaningRule>) {
      const index = state.rules.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.rules[index] = action.payload;
      }
    },

    // Tasks
    setTasks(state, action: PayloadAction<HousekeepingRecord[]>) {
      state.tasks = action.payload;
    },
    updateTaskStatus(
      state,
      action: PayloadAction<{ taskId: string; status: HousekeepingRecord['status'] }>
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
      }
      const myTask = state.myTasks.find((t) => t.id === action.payload.taskId);
      if (myTask) {
        myTask.status = action.payload.status;
      }
    },

    // My Tasks (for operators)
    setMyTasks(state, action: PayloadAction<HousekeepingRecord[]>) {
      state.myTasks = action.payload;
    },

    // Dashboard
    setDailySummary(state, action: PayloadAction<DailySummary>) {
      state.dailySummary = action.payload;
    },
    setVarianceData(state, action: PayloadAction<DailySummary[]>) {
      state.varianceData = action.payload;
    },

    // Categories (deprecated)
    setCategories(state, action: PayloadAction<TaskCategory[]>) {
      state.categories = action.payload;
    },

    // Tags
    setTags(state, action: PayloadAction<TemplateTag[]>) {
      state.tags = action.payload;
    },

    // Tareas Maestras
    setTareas(state, action: PayloadAction<HousekeepingTarea[]>) {
      state.tareas = action.payload;
    },

    // Filters & UI
    setFilters(
      state,
      action: PayloadAction<Partial<HousekeepingState['filters']>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },

  // ─── EXTRA REDUCERS (Async Thunks) ───────────────────────────────

  extraReducers: (builder) => {
    // Fetch Templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
        state.loading = false;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar templates';
      });

    // Create Template
    builder
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
        state.loading = false;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear template';
      });

    // Update Template
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar template';
      });

    // Delete Template
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter((t) => t.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar template';
      });

    // Fetch Rules
    builder
      .addCase(fetchRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.rules = action.payload;
        state.loading = false;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar reglas';
      });

    // Create Rule
    builder
      .addCase(createRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRule.fulfilled, (state, action) => {
        state.rules.push(action.payload);
        state.loading = false;
      })
      .addCase(createRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear regla';
      });

    // Update Rule
    builder
      .addCase(updateRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRule.fulfilled, (state, action) => {
        const index = state.rules.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.rules[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar regla';
      });

    // Delete Rule
    builder
      .addCase(deleteRule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRule.fulfilled, (state, action) => {
        state.rules = state.rules.filter((r) => r.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteRule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar regla';
      });

    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar tareas';
      });

    // Assign Tasks
    builder
      .addCase(assignTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTasks.fulfilled, (state) => {
        state.loading = false;
        // After assignment, tasks will be refetched by the component
      })
      .addCase(assignTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al asignar tareas';
      });

    // Fetch My Tasks
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar mis tareas';
      });

    // Fetch Daily Summary
    builder
      .addCase(fetchDailySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailySummary.fulfilled, (state, action) => {
        state.dailySummary = action.payload;
        state.loading = false;
      })
      .addCase(fetchDailySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar resumen diario';
      });

    // Fetch Variance Report
    builder
      .addCase(fetchVarianceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVarianceReport.fulfilled, (state, action) => {
        state.varianceData = action.payload;
        state.loading = false;
      })
      .addCase(fetchVarianceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar reporte de varianza';
      });

    // Fetch Tags
    builder
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      });

    // Create Tag
    builder
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      });

    // Update Tag
    builder
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tags[index] = action.payload;
        }
      });

    // Delete Tag
    builder
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter((t) => t.id !== action.payload);
      });

    // Fetch Tareas
    builder
      .addCase(fetchTareas.fulfilled, (state, action) => {
        state.tareas = action.payload;
      });

    // Create Tarea
    builder
      .addCase(createTarea.fulfilled, (state, action) => {
        state.tareas.push(action.payload);
      });

    // Update Tarea
    builder
      .addCase(updateTarea.fulfilled, (state, action) => {
        const index = state.tareas.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tareas[index] = action.payload;
        }
      });

    // Delete Tarea
    builder
      .addCase(deleteTarea.fulfilled, (state, action) => {
        state.tareas = state.tareas.filter((t) => t.id !== action.payload);
      });

    // ─── ASSIGNMENT GROUP REDUCERS ──────────────────────────────────

    // Get Assignment Groups
    builder
      .addCase(getAssignmentGroups.pending, (state) => {
        state.assignmentGroupsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(getAssignmentGroups.fulfilled, (state, action) => {
        state.assignmentGroups = action.payload;
        state.assignmentGroupsLoading = false;
      })
      .addCase(getAssignmentGroups.rejected, (state, action) => {
        state.assignmentGroupsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al cargar grupos de asignación';
      });

    // Get Assignment Group Detail
    builder
      .addCase(getAssignmentGroupDetail.pending, (state) => {
        state.assignmentGroupsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(getAssignmentGroupDetail.fulfilled, (state, action) => {
        state.assignmentGroupDetail = action.payload;
        state.assignmentGroupsLoading = false;
      })
      .addCase(getAssignmentGroupDetail.rejected, (state, action) => {
        state.assignmentGroupsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al cargar detalle del grupo de asignación';
      });

    // Create Assignment Group
    builder
      .addCase(createAssignmentGroup.pending, (state) => {
        state.assignmentGroupsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(createAssignmentGroup.fulfilled, (state) => {
        state.assignmentGroupsLoading = false;
        // List will be refreshed by the component after creation
      })
      .addCase(createAssignmentGroup.rejected, (state, action) => {
        state.assignmentGroupsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al crear grupo de asignación';
      });

    // Update Assignment Group
    builder
      .addCase(updateAssignmentGroup.pending, (state) => {
        state.assignmentGroupsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(updateAssignmentGroup.fulfilled, (state) => {
        state.assignmentGroupsLoading = false;
        // List will be refreshed by the component after update
      })
      .addCase(updateAssignmentGroup.rejected, (state, action) => {
        state.assignmentGroupsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al actualizar grupo de asignación';
      });

    // Delete Assignment Group
    builder
      .addCase(deleteAssignmentGroup.pending, (state) => {
        state.assignmentGroupsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(deleteAssignmentGroup.fulfilled, (state) => {
        state.assignmentGroupsLoading = false;
      })
      .addCase(deleteAssignmentGroup.rejected, (state, action) => {
        state.assignmentGroupsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al eliminar grupo de asignación';
      });

    // Get Rooms Paged
    builder
      .addCase(getRoomsPaged.pending, (state) => {
        state.roomsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(getRoomsPaged.fulfilled, (state, action) => {
        state.roomsPage = action.payload;
        state.roomsLoading = false;
      })
      .addCase(getRoomsPaged.rejected, (state, action) => {
        state.roomsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al cargar habitaciones';
      });

    // Get Block Room Count
    builder
      .addCase(getBlockRoomCount.pending, (state) => {
        state.assignmentGroupsLoading = true;
        state.assignmentGroupsError = null;
      })
      .addCase(getBlockRoomCount.fulfilled, (state) => {
        state.assignmentGroupsLoading = false;
        // BlockWithCount is used transiently by components; not stored in slice
      })
      .addCase(getBlockRoomCount.rejected, (state, action) => {
        state.assignmentGroupsLoading = false;
        state.assignmentGroupsError =
          (action.payload as string) ?? 'Error al cargar conteo de habitaciones del bloque';
      });
  },
});

// ─── EXPORTS ──────────────────────────────────────────────────────

export const {
  setTemplates,
  addTemplate,
  updateTemplateInState,
  setRules,
  addRule,
  updateRuleInState,
  setTasks,
  updateTaskStatus,
  setMyTasks,
  setDailySummary,
  setVarianceData,
  setCategories,
  setTags,
  setTareas,
  setFilters,
  setSelectedDate,
  clearError,
} = housekeepingSlice.actions;

export default housekeepingSlice.reducer;
