import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define aquí la estructura de los filtros de auditoría
export interface AuditoryFiltersState {
  fechaDesde: string | null;
  fechaHasta: string | null;
  user: string;
  table: string;
  [key: string]: any; // Para permitir flexibilidad
}

const initialState: AuditoryFiltersState = {
  fechaDesde: null,
  fechaHasta: null,
  user: '',
  table: '',
};

const auditoryFiltersSlice = createSlice({
  name: 'auditoryFilters',
  initialState,
  reducers: {
    setAuditoryFilters(state, action: PayloadAction<Partial<AuditoryFiltersState>>) {
      Object.assign(state, action.payload);
    },
    resetAuditoryFilters() {
      return initialState;
    },
  },
});

export const { setAuditoryFilters, resetAuditoryFilters } = auditoryFiltersSlice.actions;
export default auditoryFiltersSlice.reducer;
