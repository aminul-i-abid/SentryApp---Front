import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  FormControl,
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
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

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

  // The custom input background color mapped to target design "#F7F7F7" or '#FAFAFA'
  const inputBgColor = '#f7f7f7';

  return (
    <Card sx={{
      backgroundColor: "#f7f7f7",
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: 'none'
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="./assets/icons/filter-vertical.png" className='mr-0.5' alt="" />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
              Filtros
            </Typography>
            <Chip
              label="Assets"
              size="small"
              color="primary"
              sx={{ fontWeight: 600, borderRadius: 1.5, fontSize: '0.75rem', height: 24 }}
            />
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
                <Box
                  onClick={!loading ? handleClearFilters : undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor: loading ? "#fff" : 'grey.200',
                    },
                    backgroundColor: "#fff",
                    borderRadius: "6px"
                  }}
                >
                  <img src="./assets/icons/cancel-circle.png" alt="" />
                </Box>
              </Tooltip>
            )}

            <Tooltip title="Actualizar ahora">
              <Box
                onClick={(!loading && !isRefreshing) ? handleManualRefresh : undefined}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (loading || isRefreshing) ? 'default' : 'pointer',
                  '&:hover': {
                    backgroundColor: (loading || isRefreshing) ? "#fff" : 'grey.200',
                  },
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  animation:
                    isRefreshing || loading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <img src="./assets/icons/refresh-01.png" alt="" />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        <Stack spacing={3} sx={{
          padding: 2,
          backgroundColor: "white",
          borderRadius: "8px"
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '0.875rem' }}>
                  Fecha Desde
                </Typography>
                <DatePicker
                  value={filters.dateFrom}
                  onChange={handleDateFromChange}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: {
                        '& .MuiInputBase-root': { backgroundColor: inputBgColor, borderRadius: 1.5, height: 44 },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'transparent',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: "#415EDE",
                        },
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: "#415EDE",
                        },
                      },
                      InputProps: {
                        endAdornment: (
                          <img src="./assets/icons/calendar-02.png" alt="" />
                        ),
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', fontSize: '0.875rem' }}>
                  Campamento
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.campId}
                    onChange={handleCampChange}
                    disabled={loading}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <Typography color="text.secondary">Seleccionar</Typography>;
                      }
                      const camp = camps.find((c) => c.id === selected);
                      if (camp) {
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{camp.name}</Typography>
                          </Box>
                        );
                      }
                      return selected;
                    }}
                    sx={{
                      backgroundColor: inputBgColor,
                      borderRadius: 1.5,
                      height: 44,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: "#415EDE",
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: "#415EDE",
                      },
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                      }
                    }}
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
            </Box>
          </LocalizationProvider>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: "#f7f7f7",
              padding: 2,
              borderRadius: "8px",
              transition: 'all 0.3s ease-in-out',
            }}
          >
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '1rem'
                }}
              >
                Actualización Automática
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filters.autoRefresh
                  ? `Activada`
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
                mt: -1,
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
