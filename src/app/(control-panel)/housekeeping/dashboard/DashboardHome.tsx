/**
 * DashboardHome Component
 *
 * Main dashboard home screen for Housekeeping module
 * Displays KPIs, charts, widgets, and quick actions
 * Supports real-time updates and responsive layout
 *
 * Layout:
 * - Top: Filters (date, auto-refresh, block filter)
 * - Row 1: KPI Cards (4-6 cards)
 * - Row 2: Variance Chart (full width)
 * - Row 3: Discrepancies Widget + Maintenance Status Widget (50/50)
 * - Sidebar: Quick Actions
 *
 * FASE 5.4 - Housekeeping Dashboard
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Grid,
  Alert,
  AlertTitle,
  Skeleton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useUser from '@auth/useUser';
import { getCamps, getCampsByCompanyId } from '@/app/(control-panel)/camps/campsService';
import type { CampResponse } from '@/app/(control-panel)/camps/models/CampResponse';
// Hooks
import { useDashboardData, useRealTimeUpdates } from './hooks';

// Components
import {
  KPICard,
  VarianceChart,
  DiscrepanciesWidget,
  MaintenanceStatusWidget,
  QuickActions,
  DashboardFilters,
  RoomStatusBreakdownCard,
} from './components';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * KPI cards to hide from the dashboard.
 * Add or remove titles here to control which cards are displayed.
 * The skeleton count and grid layout are derived automatically from this list.
 *
 * Available titles:
 *  'Tasa de Ocupacion' | 'Cumplimiento de Tareas' | 'Variacion de Ocupacion'
 *  'Personas en Campamento' | 'Alertas de Mantenimiento' | 'En Progreso'
 */
const HIDDEN_KPI_TITLES: string[] = [
  'Cumplimiento de Tareas',
  'Variacion de Ocupacion',
  'Alertas de Mantenimiento',
];

/** Total number of KPI cards defined in useDashboardData */
const TOTAL_KPI_COUNT = 6;

/**
 * DashboardHome Component
 */
const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: user } = useUser();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [filters, setFilters] = useState({
    dateFrom: new Date(),
    dateTo: new Date(),
    campId: '',
    autoRefresh: false,
    refreshInterval: 30,
  });

  // State for camps data
  const [camps, setCamps] = useState<CampResponse[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(false);
  const [campsError, setCampsError] = useState<string | null>(null);

  // Get companyId from user
  const companyId = user?.companyId;

  // Check if user is Sentry_Admin (has access to all camps)
  const isSentryAdmin = useMemo(() => {
    if (!user?.role) return false;
    return Array.isArray(user.role)
      ? user.role.includes('Sentry_Admin')
      : user.role === 'Sentry_Admin';
  }, [user?.role]);

  // Selected campId from filters
  const campId = filters.campId;

  /**
   * Load camps from API when component mounts
   * - Sentry_Admin: Gets ALL camps (getCamps)
   * - Other roles: Gets camps by companyId (getCampsByCompanyId)
   */
  useEffect(() => {

    const loadCamps = async () => {
      // Sentry_Admin doesn't have companyId, but can access ALL camps
      if (!isSentryAdmin && !companyId) {
        setCampsError('No se encontró el ID de la compañía del usuario');
        return;
      }

      setLoadingCamps(true);
      setCampsError(null);

      try {
        let response;

        if (isSentryAdmin) {
          // Sentry_Admin: Get ALL camps from the system
          response = await getCamps();
        } else {
          // Regular user: Get camps from their company
          response = await getCampsByCompanyId(Number(companyId));
        }

        if (response.succeeded && response.data) {
          setCamps(response.data);

          // Auto-select first camp if available
          if (response.data.length > 0 && !filters.campId) {
            setFilters((prev) => ({
              ...prev,
              campId: String(response.data[0].id),
            }));
          }
        } else {
          console.warn('[DashboardHome] API response not successful or no data:', response);
          setCampsError('No se pudieron cargar los campamentos');
        }
      } catch (error) {
        console.error('[DashboardHome] Error loading camps:', error);
        setCampsError('Error al cargar campamentos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      } finally {
        setLoadingCamps(false);
      }
    };

    loadCamps();
  }, [companyId, isSentryAdmin]);

  /**
   * Fetch dashboard data — API → local state → cards (no Redux in display path).
   */
  const {
    dailySummary,
    stats,
    kpis,
    isLoading: isDashboardLoading,
    isRefetching: isDashboardRefetching,
    error: dashboardError,
    resetError,
    refetch,
  } = useDashboardData({
    campId,
    date: filters.dateFrom || new Date(),
    autoFetch: true,
  });

  /**
   * Filtered KPI list — derived from the HIDDEN_KPI_TITLES config above.
   * Skeleton count uses the same expected length so loading state matches final layout.
   */
  const visibleKpis = useMemo(
    () => kpis.filter((k) => !HIDDEN_KPI_TITLES.includes(k.title)),
    [kpis]
  );

  const visibleKpiCount = TOTAL_KPI_COUNT - HIDDEN_KPI_TITLES.length;

  /** Grid column span per card — adapts automatically to the number of visible cards */
  const kpiColSpan = useMemo(() => {
    if (visibleKpiCount <= 2) return { xs: 12, sm: 6 };
    if (visibleKpiCount === 3) return { xs: 12, sm: 4 };
    if (visibleKpiCount === 4) return { xs: 12, sm: 6, md: 3 };
    return { xs: 12, sm: 6, md: 4 }; // 5–6 cards
  }, [visibleKpiCount]);

  /** Timestamp of the last successful refresh (manual or auto) */
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  /**
   * Real-time updates — the onUpdate callback calls refetch so that
   * useDashboardData local state (KPI cards) is updated after every poll cycle.
   */
  const {
    isRealTime,
    setIsRealTime,
    isRefreshing,
    error: realTimeError,
  } = useRealTimeUpdates({
    campId,
    date: filters.dateFrom || new Date(),
    interval: (filters.refreshInterval || 30) * 1000,
    enabled: filters.autoRefresh,
    onRefetch: refetch,
    onUpdate: (timestamp) => {
      setLastUpdate(timestamp);
    },
    onError: (error) => {
      console.error('Real-time update error:', error);
    },
  });

  /**
   * Handle filters change
   */
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Handle auto-refresh toggle
   */
  const handleAutoRefreshToggle = useCallback(
    (enabled: boolean) => {
      setIsRealTime(enabled);
    },
    [setIsRealTime]
  );

  /**
   * Manual refresh — calls refetch (updates KPI cards local state) and records timestamp
   */
  const handleForceRefresh = useCallback(async () => {
    await refetch();
    setLastUpdate(new Date());
  }, [refetch]);

  /**
   * Navigation handlers
   */
  const handleNavigateToVariance = useCallback(() => {
    navigate('/housekeeping/dashboard/variance');
  }, [navigate]);

  const handleNavigateToMaintenance = useCallback(() => {
    navigate('/housekeeping/dashboard/maintenance');
  }, [navigate]);

  const handleNavigateToDiscrepancies = useCallback(() => {
    navigate('/housekeeping/dashboard/discrepancies');
  }, [navigate]);

  const handleNavigateToTasks = useCallback(() => {
    navigate('/housekeeping/tasks');
  }, [navigate]);

  const handleNavigateToReports = useCallback(() => {
    navigate('/housekeeping/reports');
  }, [navigate]);

  const handleNavigateToHistory = useCallback(() => {
    navigate('/housekeeping/history');
  }, [navigate]);

  /**
   * Get KPI icon component
   */
  const getKPIIcon = (iconName: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      'heroicons-outline:home': <HomeIcon />,
      'heroicons-outline:check-circle': <CheckCircleIcon />,
      'heroicons-outline:chart-bar': <TrendingUpIcon />,
      'heroicons-outline:exclamation-circle': <WarningIcon />,
      'heroicons-outline:wrench': <BuildIcon />,
      'heroicons-outline:clock': <AccessTimeIcon />,
    };
    return iconMap[iconName] || <HomeIcon />;
  };

  /**
   * Calculate maintenance count for quick actions
   */
  const maintenanceCount = useMemo(() => {
    return dailySummary?.maintenance.criticalPending || 0;
  }, [dailySummary]);

  /**
   * Calculate discrepancy count for quick actions
   */
  const discrepancyCount = useMemo(() => {
    if (!dailySummary) return 0;
    const { discrepancies } = dailySummary;
    return discrepancies.skip + discrepancies.sleep + discrepancies.count;
  }, [dailySummary]);

  /**
   * Check if camps are loaded and camp is selected
   */
  if (loadingCamps) {
    return (
      <FusePageSimple
        content={
          <Box sx={{ py: 4, px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Skeleton variant="rectangular" width={300} height={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Cargando campamentos...
                </Typography>
              </Box>
            </Box>
          </Box>
        }
      />
    );
  }

  if (camps.length === 0 && !loadingCamps) {
    return (
      <FusePageSimple
        content={
          <Box sx={{ py: 4, px: 3, maxWidth: 1200, mx: 'auto' }}>
            <Alert severity="warning">
              <AlertTitle>No hay campamentos disponibles</AlertTitle>
              {isSentryAdmin
                ? 'No se encontraron campamentos en el sistema. Debe crear al menos un campamento para usar Housekeeping.'
                : 'No se encontraron campamentos asociados a su cuenta. Contacte al administrador.'
              }
              {campsError && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    Error: {campsError}
                  </Typography>
                </Box>
              )}
              <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  Rol: {Array.isArray(user?.role) ? user.role.join(', ') : user?.role || 'N/A'}
                  {isSentryAdmin && ' (Acceso a todos los campamentos)'}
                </Typography>
                {companyId && (
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                    CompanyId: {companyId}
                  </Typography>
                )}
              </Box>
            </Alert>
          </Box>
        }
      />
    );
  }

  if (!campId) {
    return (
      <FusePageSimple
        content={
          <Box sx={{ py: 4, px: 3, maxWidth: 1200, mx: 'auto' }}>
            <Alert severity="info">
              <AlertTitle>Seleccione un Campamento</AlertTitle>
              Por favor seleccione un campamento de la lista para ver el dashboard.
            </Alert>
          </Box>
        }
      />
    );
  }

  /**
   * Error state
   */
  const hasError = dashboardError || realTimeError;

  return (
    <FusePageSimple
      header={
        <Box
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Housekeeping Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard de gestión de tareas de housekeeping. Monitorea KPIs y discrepancias en tiempo real.
          </Typography>
        </Box>
      }
      content={
        <Box sx={{ py: 3, px: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Filters Section */}
            <DashboardFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefreshToggle={handleAutoRefreshToggle}
              onManualRefresh={handleForceRefresh}
              camps={camps.map(camp => ({
                id: String(camp.id),
                name: camp.name,
                code: camp.name.substring(0, 3).toUpperCase(), // Generate code from first 3 letters
              }))}
              lastRefresh={lastUpdate || undefined}
              loading={isDashboardLoading || isDashboardRefetching || isRefreshing || loadingCamps}
            />

            {/* Error Alert */}
            {hasError && (
              <Alert
                severity="error"
                onClose={resetError}
                sx={{ mb: 2 }}
              >
                <AlertTitle>Error al Cargar el Dashboard</AlertTitle>
                {dashboardError || realTimeError}
              </Alert>
            )}

            {/* Estado de Habitaciones */}
            <Grid item xs={12}>
              <RoomStatusBreakdownCard
                totalRooms={dailySummary?.occupancy.totalRooms ?? 0}
                roomsCompleted={dailySummary?.occupancy.roomsCompleted ?? 0}
                roomsInProgress={dailySummary?.occupancy.roomsInProgress ?? 0}
                roomsNotStarted={dailySummary?.occupancy.roomsNotStarted ?? 0}
                roomsNotAssigned={dailySummary?.occupancy.roomsNotAssigned ?? 0}
                loading={isDashboardLoading}
              />
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
              {/* KPI Cards Row */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {isDashboardLoading ? (
                    // Skeleton count matches expected visible cards
                    Array.from({ length: visibleKpiCount }).map((_, index) => (
                      <Grid item {...kpiColSpan} key={`skeleton-${index}`}>
                        <Skeleton
                          variant="rectangular"
                          height={180}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                    ))
                  ) : (
                    // Only visible KPI cards — filtered by HIDDEN_KPI_TITLES above
                    visibleKpis.map((kpi, index) => (
                      <Grid item {...kpiColSpan} key={`kpi-${index}`}
                      >
                        <KPICard
                          title={kpi.title}
                          value={
                            typeof kpi.value === 'string'
                              ? parseFloat(kpi.value)
                              : kpi.value
                          }
                          trend={kpi.trend?.direction}
                          trendValue={kpi.trend?.value}
                          icon={getKPIIcon(kpi.icon)}
                          color={kpi.color}
                          subtitle={kpi.subtitle}
                          suffix={kpi.unit}
                          loading={isDashboardLoading}
                          decimals={kpi.decimals}
                          showTrendLabel={kpi.showTrendLabel}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Grid>

              {/* Variance Chart Row */}
              {/* <Grid item xs={12}>
                <VarianceChart
                  data={[]}
                  height={400}
                  onDataPointClick={(dataPoint) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: new Date(dataPoint.date),
                      dateTo: new Date(dataPoint.date),
                    }));
                  }}
                  title="Variación de Ocupación"
                  showLegend={true}
                />
              </Grid> */}

              {/* Widgets Row */}
              <Grid item xs={12} lg={8}>
                <Grid container spacing={3}>
                  {/* Discrepancies Widget */}
                  {/* <Grid item xs={12} md={6}>
                    <DiscrepanciesWidget
                      discrepancies={dailySummary ? [
                        { type: 'skip', count: dailySummary.discrepancies.skip, severity: 'high', label: 'Skip' },
                        { type: 'sleep', count: dailySummary.discrepancies.sleep, severity: 'medium', label: 'Sleep' },
                        { type: 'count', count: dailySummary.discrepancies.count, severity: 'low', label: 'Count' },
                      ] : []}
                      onClick={handleNavigateToDiscrepancies}
                      loading={isDashboardLoading}
                    />
                  </Grid> */}

                  {/* Maintenance Status Widget */}
                  {/* <Grid item xs={12} md={6}>
                    <MaintenanceStatusWidget
                      alerts={[]}
                      onClick={handleNavigateToMaintenance}
                      loading={isDashboardLoading}
                    />
                  </Grid> */}
                </Grid>
              </Grid>

              {/* Quick Actions Sidebar */}
              {/* <Grid item xs={12} lg={4}>
                <QuickActions
                  actions={[
                    {
                      id: 'variance',
                      label: 'Análisis de Variación',
                      description: 'Módulo en desarrollo',
                      icon: <TrendingUpIcon />,
                      color: 'primary',
                      path: '/housekeeping/dashboard/variance',
                      disabled: true, // TODO: Habilitar cuando se convierta a Chart.js
                    },
                    {
                      id: 'maintenance',
                      label: 'Mantenimiento',
                      description: 'Módulo en desarrollo',
                      icon: <BuildIcon />,
                      color: 'warning',
                      path: '/housekeeping/dashboard/maintenance',
                      badge: maintenanceCount > 0 ? maintenanceCount : undefined,
                      disabled: true, // TODO: Habilitar cuando se convierta a Chart.js
                    },
                    {
                      id: 'discrepancies',
                      label: 'Discrepancias',
                      description: 'Módulo en desarrollo',
                      icon: <WarningIcon />,
                      color: 'error',
                      path: '/housekeeping/dashboard/discrepancies',
                      badge: discrepancyCount > 0 ? discrepancyCount : undefined,
                      disabled: true, // TODO: Habilitar cuando se convierta a Chart.js
                    },
                    {
                      id: 'tasks',
                      label: 'Asignar Tareas',
                      description: 'Asignar tareas al personal',
                      icon: <CheckCircleIcon />,
                      color: 'success',
                      path: '/housekeeping/assignment',
                    },
                  ]}
                  onActionClick={(action) => {
                    if (!action.disabled) {
                      navigate(action.path);
                    }
                  }}
                />
              </Grid> */}
            </Grid>

            {/* Footer Stats */}
            {/* {stats && !isDashboardLoading && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Total Habitaciones
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {stats.totalRooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Ocupadas
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {stats.occupiedRooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Tareas Completadas
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {stats.tasksCompleted} / {stats.tasksTotal}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Variacion Promedio
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {stats.averageVariance.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )} */}
          </Box>
        </Box>
      }
    />
  );
};

export default DashboardHome;
