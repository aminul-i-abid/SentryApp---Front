import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export interface DashboardFiltersData {
  dateFrom: Date | null;
  dateTo: Date | null;
  campId: string;
  autoRefresh: boolean;
  refreshInterval?: number;
}

export interface Camp {
  id: string;
  name: string;
  code?: string;
}

export interface DashboardFiltersProps {
  filters: DashboardFiltersData;
  onFiltersChange: (filters: DashboardFiltersData) => void;
  onRefreshToggle: (enabled: boolean) => void;
  onManualRefresh?: () => void;
  camps?: Camp[];
  loading?: boolean;
  lastRefresh?: Date;
}

const defaultCamps: Camp[] = [
  { id: 'all', name: 'Todos los Campamentos', code: 'ALL' },
  { id: '1', name: 'Campamento Norte', code: 'CN' },
  { id: '2', name: 'Campamento Sur', code: 'CS' },
  { id: '3', name: 'Campamento Este', code: 'CE' },
];

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefreshToggle,
  onManualRefresh,
  camps = defaultCamps,
  loading = false,
  lastRefresh,
}) => {
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDateFromChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateFrom: date,
    });
  };

  const handleDateToChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateTo: date,
    });
  };

  const handleCampChange = (event: SelectChangeEvent) => {
    onFiltersChange({
      ...filters,
      campId: event.target.value,
    });
  };

  const handleAutoRefreshChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enabled = event.target.checked;
    onFiltersChange({
      ...filters,
      autoRefresh: enabled,
    });
    onRefreshToggle(enabled);
  };

  const handleManualRefresh = async () => {
    if (onManualRefresh) {
      setIsRefreshing(true);
      await onManualRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({
      dateFrom: null,
      dateTo: null,
      campId: 'all',
      autoRefresh: false,
    });
  };

  const hasActiveFilters =
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.campId !== 'all';

  const getLastRefreshText = () => {
    if (!lastRefresh) return 'Nunca';

    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes < 1) return 'Hace un momento';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    return lastRefresh.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ backgroundColor: "white" }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filtros
            </Typography>
            {hasActiveFilters && (
              <Chip
                label="Activos"
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {lastRefresh && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mr: 1,
                }}
              >
                <AccessTimeIcon
                  sx={{ fontSize: 16, color: theme.palette.text.disabled }}
                />
                <Typography variant="caption" color="text.secondary">
                  {getLastRefreshText()}
                </Typography>
              </Box>
            )}

            {hasActiveFilters && (
              <Tooltip title="Limpiar filtros">
                <IconButton
                  size="small"
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Actualizar ahora">
              <span>
                <IconButton
                  size="small"
                  onClick={handleManualRefresh}
                  disabled={loading || isRefreshing}
                  sx={{
                    animation:
                      isRefreshing || loading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Stack spacing={2.5}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <DatePicker
                label="Fecha Desde"
                value={filters.dateFrom}
                onChange={handleDateFromChange}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: {
                      backgroundColor: 'white',
                      '& .MuiInputBase-root': { backgroundColor: 'white' },
                    },
                    InputProps: {
                      startAdornment: (
                        <CalendarTodayIcon
                          sx={{
                            fontSize: 20,
                            color: theme.palette.action.active,
                            mr: 1,
                          }}
                        />
                      ),
                    },
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': { backgroundColor: 'white !important' }
                    }
                  },
                  desktopPaper: {
                    sx: { backgroundColor: 'white !important' }
                  },
                  mobilePaper: {
                    sx: { backgroundColor: 'white !important' }
                  },
                  dialog: {
                    sx: {
                      '& .MuiPaper-root': { backgroundColor: 'white !important' }
                    }
                  }
                }}
              />

              {/* <DatePicker
                label="Fecha Hasta"
                value={filters.dateTo}
                onChange={handleDateToChange}
                disabled={loading}
                minDate={filters.dateFrom || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    InputProps: {
                      startAdornment: (
                        <CalendarTodayIcon
                          sx={{
                            fontSize: 20,
                            color: theme.palette.action.active,
                            mr: 1,
                          }}
                        />
                      ),
                    },
                  },
                }}
              /> */}
              <FormControl fullWidth size="small">
                <InputLabel id="camp-select-label" sx={{ backgroundColor: 'white', pr: 1 }}>Campamento</InputLabel>
                <Select
                  labelId="camp-select-label"
                  id="camp-select"
                  value={filters.campId}
                  label="Campamento"
                  onChange={handleCampChange}
                  disabled={loading}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      backgroundColor: 'transparent',
                    },
                    '& .MuiSelect-select': {
                      backgroundColor: 'white',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: 'white !important' }
                    }
                  }}
                  startAdornment={
                    <BusinessIcon
                      sx={{
                        fontSize: 20,
                        color: theme.palette.action.active,
                        ml: 1,
                        mr: -0.5,
                      }}
                    />
                  }
                >
                  {camps.map((camp) => (
                    <MenuItem key={camp.id} value={camp.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{camp.name}</Typography>
                        {camp.code && (
                          <Chip
                            label={camp.code}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                            }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </LocalizationProvider>


          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 1,
              backgroundColor: filters.autoRefresh
                ? alpha(theme.palette.primary.main, 0.05)
                : alpha(theme.palette.grey[500], 0.05),
              border: `1px solid ${filters.autoRefresh
                ? alpha(theme.palette.primary.main, 0.2)
                : theme.palette.divider
                }`,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: filters.autoRefresh
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                }}
              >
                Actualización Automática
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filters.autoRefresh
                  ? `Cada ${filters.refreshInterval || 30} segundos`
                  : 'Desactivada'}
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={filters.autoRefresh}
                  onChange={handleAutoRefreshChange}
                  disabled={loading}
                  color="primary"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>

          {filters.autoRefresh && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.success.main,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Actualización automática activa
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;
