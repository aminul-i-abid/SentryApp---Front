/**
 * VarianceFilters Component
 *
 * Comprehensive filter panel for variance analysis
 *
 * Features:
 * - DateRangePicker integration
 * - Block selector (Autocomplete)
 * - Group by selector (day/week/month)
 * - Chart type selector (line/bar/area)
 * - Apply/Reset buttons
 * - Collapsible on mobile
 *
 * FASE 5.4 - Variance Analysis Dashboard
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DateRangePicker } from './DateRangePicker';
import type { DashboardFilters, DateRange } from '../../types/dashboardTypes';

/**
 * Component props
 */
interface VarianceFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  blocks: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  onApply?: () => void;
}

/**
 * Chart type options
 */
const CHART_TYPE_OPTIONS = [
  { value: 'line', label: 'Líneas' },
  { value: 'bar', label: 'Barras' },
  { value: 'area', label: 'Área' },
] as const;

/**
 * Group by options
 */
const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Por Día' },
  { value: 'week', label: 'Por Semana' },
  { value: 'month', label: 'Por Mes' },
] as const;

/**
 * VarianceFilters Component
 */
export const VarianceFilters: React.FC<VarianceFiltersProps> = ({
  filters,
  onFiltersChange,
  blocks,
  isLoading = false,
  onApply,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Local state for temporary filter changes
  const [localFilters, setLocalFilters] = useState<DashboardFilters>(filters);
  const [isExpanded, setIsExpanded] = useState<boolean>(!isMobile);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  /**
   * Update local filters when props change
   */
  React.useEffect(() => {
    setLocalFilters(filters);
    setHasChanges(false);
  }, [filters]);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
    setHasChanges(true);
  }, []);

  /**
   * Handle block selection change
   */
  const handleBlockChange = useCallback(
    (_event: any, value: { id: string; name: string } | null) => {
      setLocalFilters((prev) => ({
        ...prev,
        blockId: value?.id || undefined,
      }));
      setHasChanges(true);
    },
    []
  );

  /**
   * Handle group by change
   */
  const handleGroupByChange = useCallback((event: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      groupBy: event.target.value as 'day' | 'week' | 'month',
    }));
    setHasChanges(true);
  }, []);

  /**
   * Handle chart type change
   */
  const handleChartTypeChange = useCallback((event: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      chartType: event.target.value as 'line' | 'bar' | 'area',
    }));
    setHasChanges(true);
  }, []);

  /**
   * Apply filters
   */
  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
    setHasChanges(false);
    if (onApply) {
      onApply();
    }
  }, [localFilters, onFiltersChange, onApply]);

  /**
   * Reset filters to default
   */
  const handleReset = useCallback(() => {
    const defaultFilters: DashboardFilters = {
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
      },
      blockId: undefined,
      groupBy: 'day',
      chartType: 'line',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setHasChanges(false);
  }, [onFiltersChange]);

  /**
   * Toggle collapse on mobile
   */
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /**
   * Get selected block
   */
  const selectedBlock = React.useMemo(() => {
    return blocks.find((b) => b.id === localFilters.blockId) || null;
  }, [blocks, localFilters.blockId]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: isMobile ? 2 : 3,
        mb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: isMobile && !isExpanded ? 0 : 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros
          </Typography>
          {hasChanges && (
            <Chip
              label="Cambios sin aplicar"
              size="small"
              color="warning"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {isMobile && (
          <IconButton onClick={handleToggleExpand} size="small">
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {/* Filters Content */}
      <Collapse in={isExpanded}>
        <Stack spacing={3}>
          {/* Date Range Picker */}
          <Box>
            <DateRangePicker
              startDate={localFilters.dateRange.startDate}
              endDate={localFilters.dateRange.endDate}
              onChange={handleDateRangeChange}
              disabled={isLoading}
            />
          </Box>

          <Divider />

          {/* Block Selector and Group By in Row */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {/* Block Selector */}
            <Box sx={{ flex: 1 }}>
              <Autocomplete
                options={blocks}
                getOptionLabel={(option) => option.name}
                value={selectedBlock}
                onChange={handleBlockChange}
                disabled={isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Bloque"
                    placeholder="Todos los bloques"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{option.name}</Typography>
                    </Box>
                  </li>
                )}
                noOptionsText="No hay bloques disponibles"
              />
            </Box>

            {/* Group By Selector */}
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small" disabled={isLoading}>
                <InputLabel id="group-by-label">Agrupar Por</InputLabel>
                <Select
                  labelId="group-by-label"
                  id="group-by-select"
                  value={localFilters.groupBy}
                  label="Agrupar Por"
                  onChange={handleGroupByChange}
                >
                  {GROUP_BY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Chart Type Selector */}
          <Box>
            <FormControl fullWidth size="small" disabled={isLoading}>
              <InputLabel id="chart-type-label">Tipo de Gráfico</InputLabel>
              <Select
                labelId="chart-type-label"
                id="chart-type-select"
                value={localFilters.chartType}
                label="Tipo de Gráfico"
                onChange={handleChartTypeChange}
              >
                {CHART_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={isLoading}
              fullWidth={isMobile}
            >
              Restablecer
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleApply}
              disabled={isLoading || !hasChanges}
              fullWidth={isMobile}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default VarianceFilters;
