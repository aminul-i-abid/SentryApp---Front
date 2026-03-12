/**
 * AlertFilters Component
 * FASE 5.4 - Alert Filters Panel
 *
 * Filter panel for maintenance alerts with multiple filter options:
 * - Severity (multi-select)
 * - Category (autocomplete)
 * - Room number search
 * - Assigned to selector
 * - Search term input
 */

import { memo, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Autocomplete,
  OutlinedInput,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import type { AlertFilters } from '../../types/dashboardTypes';
import type { AlertSeverity } from '@/store/housekeeping/housekeepingTypes';

/**
 * Props for AlertFilters component
 */
interface AlertFiltersProps {
  /** Current filter values */
  filters: AlertFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: AlertFilters) => void;
  /** Available categories for filtering */
  availableCategories?: string[];
  /** Available users for filtering */
  availableUsers?: Array<{ id: string; name: string }>;
}

/**
 * Styled container for filters
 */
const FiltersContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

/**
 * Styled header
 */
const FiltersHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

/**
 * Styled actions container
 */
const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

/**
 * Severity options
 */
const SEVERITY_OPTIONS: Array<{ value: AlertSeverity; label: string; color: string }> = [
  { value: 'Critical', label: 'Crítico', color: '#dc2626' },
  { value: 'High', label: 'Alto', color: '#f59e0b' },
  { value: 'Medium', label: 'Medio', color: '#eab308' },
  { value: 'Low', label: 'Bajo', color: '#3b82f6' },
];

/**
 * Default categories
 */
const DEFAULT_CATEGORIES = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Pintura',
  'Limpieza',
  'Climatización',
  'Mobiliario',
  'Cerraduras',
  'Ventanas',
  'Otros',
];

/**
 * AlertFilters Component
 *
 * Provides a comprehensive filter panel for maintenance alerts.
 */
const AlertFilters = memo<AlertFiltersProps>(({
  filters,
  onFiltersChange,
  availableCategories = DEFAULT_CATEGORIES,
  availableUsers = [],
}) => {
  // Local state for filters
  const [localFilters, setLocalFilters] = useState<AlertFilters>(filters);
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([]);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalFilters(filters);
    if (filters.severity) {
      setSelectedSeverities([filters.severity]);
    } else {
      setSelectedSeverities([]);
    }
  }, [filters]);

  /**
   * Handle severity change
   */
  const handleSeverityChange = (event: SelectChangeEvent<AlertSeverity[]>) => {
    const value = event.target.value as AlertSeverity[];
    setSelectedSeverities(value);

    // For simplicity, use the first selected severity
    // In a real implementation, you might want to support multiple severities
    const newFilters: AlertFilters = {
      ...localFilters,
      severity: value.length > 0 ? value[0] : undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Handle category change
   */
  const handleCategoryChange = (_event: any, value: string | null) => {
    const newFilters: AlertFilters = {
      ...localFilters,
      category: value || undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Handle room number change
   */
  const handleRoomNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters: AlertFilters = {
      ...localFilters,
      roomNumber: event.target.value || undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Handle assigned to change
   */
  const handleAssignedToChange = (event: SelectChangeEvent) => {
    const newFilters: AlertFilters = {
      ...localFilters,
      assignedTo: event.target.value || undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Handle search term change
   */
  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters: AlertFilters = {
      ...localFilters,
      searchTerm: event.target.value || undefined,
    };
    setLocalFilters(newFilters);
  };

  /**
   * Apply filters
   */
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  /**
   * Reset filters
   */
  const handleResetFilters = () => {
    const emptyFilters: AlertFilters = {
      severity: undefined,
      category: undefined,
      roomNumber: undefined,
      assignedTo: undefined,
      searchTerm: undefined,
    };
    setLocalFilters(emptyFilters);
    setSelectedSeverities([]);
    onFiltersChange(emptyFilters);
  };

  /**
   * Check if filters are active
   */
  const hasActiveFilters = () => {
    return (
      selectedSeverities.length > 0 ||
      !!localFilters.category ||
      !!localFilters.roomNumber ||
      !!localFilters.assignedTo ||
      !!localFilters.searchTerm
    );
  };

  return (
    <FiltersContainer elevation={1}>
      {/* Header */}
      <FiltersHeader>
        <FilterListIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Filtros
        </Typography>
        {hasActiveFilters() && (
          <Chip
            label={`${Object.values(localFilters).filter(Boolean).length} activos`}
            size="small"
            color="primary"
          />
        )}
      </FiltersHeader>

      {/* Search Term */}
      <Box mb={3}>
        <TextField
          fullWidth
          size="small"
          label="Buscar"
          placeholder="Buscar en título o descripción..."
          value={localFilters.searchTerm || ''}
          onChange={handleSearchTermChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Severity Filter */}
      <Box mb={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Severidad</InputLabel>
          <Select
            multiple
            value={selectedSeverities}
            onChange={handleSeverityChange}
            input={<OutlinedInput label="Severidad" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const option = SEVERITY_OPTIONS.find((opt) => opt.value === value);
                  return (
                    <Chip
                      key={value}
                      label={option?.label}
                      size="small"
                      sx={{
                        backgroundColor: option?.color,
                        color: 'white',
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {SEVERITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                    }}
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Category Filter */}
      <Box mb={3}>
        <Autocomplete
          size="small"
          options={availableCategories}
          value={localFilters.category || null}
          onChange={handleCategoryChange}
          renderInput={(params) => (
            <TextField {...params} label="Categoría" placeholder="Seleccionar categoría" />
          )}
          freeSolo
        />
      </Box>

      {/* Room Number Filter */}
      <Box mb={3}>
        <TextField
          fullWidth
          size="small"
          label="Número de Habitación"
          placeholder="Ej: 101, 202..."
          value={localFilters.roomNumber || ''}
          onChange={handleRoomNumberChange}
        />
      </Box>

      {/* Assigned To Filter */}
      {availableUsers.length > 0 && (
        <Box mb={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Asignado a</InputLabel>
            <Select
              value={localFilters.assignedTo || ''}
              label="Asignado a"
              onChange={handleAssignedToChange}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              <MenuItem value="unassigned">Sin asignar</MenuItem>
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Actions */}
      <ActionsContainer>
        <Button
          fullWidth
          variant="contained"
          onClick={handleApplyFilters}
          startIcon={<FilterListIcon />}
        >
          Aplicar Filtros
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleResetFilters}
          startIcon={<ClearIcon />}
          disabled={!hasActiveFilters()}
        >
          Limpiar
        </Button>
      </ActionsContainer>
    </FiltersContainer>
  );
});

AlertFilters.displayName = 'AlertFilters';

export default AlertFilters;
