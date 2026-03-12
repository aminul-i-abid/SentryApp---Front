/**
 * Maintenance Slice - Redux State Management
 *
 * Gestiona el estado de:
 * - Alertas de mantenimiento
 * - Categorías de mantenimiento
 * - Filtros y selección
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  MaintenanceAlert,
  MaintenanceCategory,
  AlertStatus,
  AlertSeverity,
} from './maintenanceTypes';
import {
  fetchAlerts,
  createAlert,
  updateAlertStatus,
  assignAlert,
  fetchCategories,
  createCategory,
  updateCategory,
} from './maintenanceThunks';

// ─── STATE INTERFACE ──────────────────────────────────────────────

export interface MaintenanceState {
  alerts: MaintenanceAlert[];
  categories: MaintenanceCategory[];
  selectedAlert: MaintenanceAlert | null;

  // Filters
  filters: {
    status: AlertStatus | '';
    severity: AlertSeverity | '';
    categoryId: string;
    roomId: string;
    assignedTo: string;
  };

  // UI State
  loading: boolean;
  error: string | null;
}

// ─── INITIAL STATE ────────────────────────────────────────────────

const initialState: MaintenanceState = {
  alerts: [],
  categories: [],
  selectedAlert: null,
  filters: {
    status: '',
    severity: '',
    categoryId: '',
    roomId: '',
    assignedTo: '',
  },
  loading: false,
  error: null,
};

// ─── SLICE ────────────────────────────────────────────────────────

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    // Alerts
    setAlerts(state, action: PayloadAction<MaintenanceAlert[]>) {
      state.alerts = action.payload;
    },
    addAlert(state, action: PayloadAction<MaintenanceAlert>) {
      state.alerts.push(action.payload);
    },
    updateAlertInState(state, action: PayloadAction<MaintenanceAlert>) {
      const index = state.alerts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
      // Update selected alert if it's the same
      if (state.selectedAlert?.id === action.payload.id) {
        state.selectedAlert = action.payload;
      }
    },

    // Categories
    setCategories(state, action: PayloadAction<MaintenanceCategory[]>) {
      state.categories = action.payload;
    },
    addCategory(state, action: PayloadAction<MaintenanceCategory>) {
      state.categories.push(action.payload);
    },
    updateCategoryInState(state, action: PayloadAction<MaintenanceCategory>) {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },

    // Selected Alert
    setSelectedAlert(state, action: PayloadAction<MaintenanceAlert | null>) {
      state.selectedAlert = action.payload;
    },

    // Filters
    setFilters(
      state,
      action: PayloadAction<Partial<MaintenanceState['filters']>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },

    // UI
    clearError(state) {
      state.error = null;
    },
  },

  // ─── EXTRA REDUCERS (Async Thunks) ───────────────────────────────

  extraReducers: (builder) => {
    // Fetch Alerts
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
        state.loading = false;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar alertas';
      });

    // Create Alert
    builder
      .addCase(createAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alerts.push(action.payload);
        state.loading = false;
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear alerta';
      });

    // Update Alert Status
    builder
      .addCase(updateAlertStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAlertStatus.fulfilled, (state, action) => {
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
        if (state.selectedAlert?.id === action.payload.id) {
          state.selectedAlert = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateAlertStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar estado';
      });

    // Assign Alert
    builder
      .addCase(assignAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
        if (state.selectedAlert?.id === action.payload.id) {
          state.selectedAlert = action.payload;
        }
        state.loading = false;
      })
      .addCase(assignAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al asignar alerta';
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar categorías';
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.loading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear categoría';
      });

    // Update Category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar categoría';
      });
  },
});

// ─── EXPORTS ──────────────────────────────────────────────────────

export const {
  setAlerts,
  addAlert,
  updateAlertInState,
  setCategories,
  addCategory,
  updateCategoryInState,
  setSelectedAlert,
  setFilters,
  clearFilters,
  clearError,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
