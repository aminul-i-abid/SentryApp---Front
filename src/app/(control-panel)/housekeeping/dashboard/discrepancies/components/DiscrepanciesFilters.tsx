'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormControlLabel,
  Switch,
  Paper,
  Collapse,
  IconButton,
  Tooltip,
  alpha,
  SelectChangeEvent,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import type { DiscrepancyFilters, DiscrepancyType } from '../../types/dashboardTypes';

interface Block {
  id: string;
  name: string;
}

interface DiscrepanciesFiltersProps {
  filters: DiscrepancyFilters;
  onFiltersChange: (filters: DiscrepancyFilters) => void;
  blocks: Block[];
}

const DiscrepanciesFilters: React.FC<DiscrepanciesFiltersProps> = ({
  filters,
  onFiltersChange,
  blocks,
}) => {
  const [expanded, setExpanded] = useState(true);

  // Handle date range change
  const handleStartDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      startDate: date,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      endDate: date,
    });
  };

  // Handle discrepancy type change
  const handleDiscrepancyTypesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      discrepancyTypes: (typeof value === 'string' ? value.split(',') : value) as DiscrepancyType[],
    });
  };

  // Handle blocks change
  const handleBlocksChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      blockIds: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Handle resolved status change
  const handleResolvedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      resolved: event.target.checked ? true : filters.resolved === true ? false : undefined,
    });
  };

  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchTerm: event.target.value,
    });
  };

  // Handle priority change
  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      priorities: (typeof value === 'string' ? value.split(',') : value) as ('high' | 'medium' | 'low')[],
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    onFiltersChange({
      startDate: null,
      endDate: null,
      discrepancyTypes: [],
      blockIds: [],
      resolved: undefined,
      searchTerm: '',
      priorities: [],
    });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      filters.startDate !== null ||
      filters.endDate !== null ||
      (filters.discrepancyTypes && filters.discrepancyTypes.length > 0) ||
      (filters.blockIds && filters.blockIds.length > 0) ||
      filters.resolved !== undefined ||
      (filters.searchTerm && filters.searchTerm.length > 0) ||
      (filters.priorities && filters.priorities.length > 0)
    );
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.discrepancyTypes && filters.discrepancyTypes.length > 0) count++;
    if (filters.blockIds && filters.blockIds.length > 0) count++;
    if (filters.resolved !== undefined) count++;
    if (filters.searchTerm && filters.searchTerm.length > 0) count++;
    if (filters.priorities && filters.priorities.length > 0) count++;
    return count;
  };

  // Get discrepancy type label
  const getDiscrepancyTypeLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'skip':
        return 'Salto';
      case 'sleep':
        return 'Dormida';
      case 'count':
        return 'Recuento';
      default:
        return type;
    }
  };

  // Get block name by ID
  const getBlockName = (blockId: string): string => {
    const block = blocks.find((b) => b.id === blockId);
    return block?.name || blockId;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Filtros
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              color="primary"
              size="small"
              sx={{ fontWeight: 600, minWidth: 24, height: 24 }}
            />
          )}
        </Box>
        <IconButton
          size="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Filter Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Search Term */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Buscar por habitación, bloque, notas..."
                value={filters.searchTerm || ''}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
                size="small"
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha Inicio"
                  value={filters.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: <CalendarIcon sx={{ color: 'action.active', mr: 1 }} />,
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha Fin"
                  value={filters.endDate}
                  onChange={handleEndDateChange}
                  minDate={filters.startDate || undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: <CalendarIcon sx={{ color: 'action.active', mr: 1 }} />,
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Discrepancy Types */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="discrepancy-types-label">Tipo de Discrepancia</InputLabel>
                <Select
                  labelId="discrepancy-types-label"
                  id="discrepancy-types"
                  multiple
                  value={filters.discrepancyTypes}
                  onChange={handleDiscrepancyTypesChange}
                  input={<OutlinedInput label="Tipo de Discrepancia" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={getDiscrepancyTypeLabel(value)}
                          size="small"
                          color={
                            value === 'skip'
                              ? 'warning'
                              : value === 'sleep'
                              ? 'error'
                              : 'info'
                          }
                        />
                      ))}
                    </Box>
                  )}
                  startAdornment={<CategoryIcon sx={{ color: 'action.active', ml: 1, mr: -0.5 }} />}
                >
                  <MenuItem value="skip">
                    <Chip label="Salto" color="warning" size="small" sx={{ mr: 1 }} />
                    Salto
                  </MenuItem>
                  <MenuItem value="sleep">
                    <Chip label="Dormida" color="error" size="small" sx={{ mr: 1 }} />
                    Dormida
                  </MenuItem>
                  <MenuItem value="count">
                    <Chip label="Recuento" color="info" size="small" sx={{ mr: 1 }} />
                    Recuento
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Blocks */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="blocks-label">Bloques</InputLabel>
                <Select
                  labelId="blocks-label"
                  id="blocks"
                  multiple
                  value={filters.blockIds}
                  onChange={handleBlocksChange}
                  input={<OutlinedInput label="Bloques" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getBlockName(value)} size="small" />
                      ))}
                    </Box>
                  )}
                  startAdornment={<BusinessIcon sx={{ color: 'action.active', ml: 1, mr: -0.5 }} />}
                >
                  {blocks.map((block) => (
                    <MenuItem key={block.id} value={block.id}>
                      {block.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="priority-label">Prioridad</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  multiple
                  value={filters.priorities || []}
                  onChange={handlePriorityChange}
                  input={<OutlinedInput label="Prioridad" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            value === 'high' ? 'Alta' : value === 'medium' ? 'Media' : 'Baja'
                          }
                          size="small"
                          color={
                            value === 'high'
                              ? 'error'
                              : value === 'medium'
                              ? 'warning'
                              : 'success'
                          }
                        />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="high">
                    <Chip label="Alta" color="error" size="small" sx={{ mr: 1 }} />
                    Alta
                  </MenuItem>
                  <MenuItem value="medium">
                    <Chip label="Media" color="warning" size="small" sx={{ mr: 1 }} />
                    Media
                  </MenuItem>
                  <MenuItem value="low">
                    <Chip label="Baja" color="success" size="small" sx={{ mr: 1 }} />
                    Baja
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Resolved Status */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.resolved === true}
                    onChange={handleResolvedChange}
                    color="success"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon
                      fontSize="small"
                      color={filters.resolved === true ? 'success' : 'action'}
                    />
                    <Typography variant="body2">
                      Solo discrepancias resueltas
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                FILTROS ACTIVOS
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filters.startDate && (
                  <Chip
                    label={`Desde: ${filters.startDate.toLocaleDateString('es-ES')}`}
                    size="small"
                    onDelete={() => handleStartDateChange(null)}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.endDate && (
                  <Chip
                    label={`Hasta: ${filters.endDate.toLocaleDateString('es-ES')}`}
                    size="small"
                    onDelete={() => handleEndDateChange(null)}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.discrepancyTypes.map((type) => (
                  <Chip
                    key={type}
                    label={getDiscrepancyTypeLabel(type)}
                    size="small"
                    onDelete={() => {
                      onFiltersChange({
                        ...filters,
                        discrepancyTypes: filters.discrepancyTypes.filter((t) => t !== type),
                      });
                    }}
                    color={type === 'skip' ? 'warning' : type === 'sleep' ? 'error' : 'info'}
                  />
                ))}
                {filters.blockIds.map((blockId) => (
                  <Chip
                    key={blockId}
                    label={getBlockName(blockId)}
                    size="small"
                    onDelete={() => {
                      onFiltersChange({
                        ...filters,
                        blockIds: filters.blockIds.filter((id) => id !== blockId),
                      });
                    }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {filters.priorities &&
                  filters.priorities.map((priority) => (
                    <Chip
                      key={priority}
                      label={`Prioridad: ${
                        priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'
                      }`}
                      size="small"
                      onDelete={() => {
                        onFiltersChange({
                          ...filters,
                          priorities: filters.priorities?.filter((p) => p !== priority) || [],
                        });
                      }}
                      color={
                        priority === 'high'
                          ? 'error'
                          : priority === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      variant="outlined"
                    />
                  ))}
                {filters.resolved !== undefined && (
                  <Chip
                    label="Resueltas"
                    size="small"
                    onDelete={() => {
                      onFiltersChange({
                        ...filters,
                        resolved: undefined,
                      });
                    }}
                    color="success"
                  />
                )}
                {filters.searchTerm && filters.searchTerm.length > 0 && (
                  <Chip
                    label={`Búsqueda: ${filters.searchTerm}`}
                    size="small"
                    onDelete={() => handleSearchChange({ target: { value: '' } } as any)}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleResetFilters}
              disabled={!hasActiveFilters()}
            >
              Limpiar Filtros
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DiscrepanciesFilters;
