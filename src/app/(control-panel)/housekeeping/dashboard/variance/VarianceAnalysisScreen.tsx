/**
 * VarianceAnalysisScreen Component
 *
 * Main screen for variance analysis dashboard
 * Displays variance trends and occupancy comparisons with advanced filtering
 *
 * Layout:
 * - Top: Filters panel with date range, block, grouping, and chart type
 * - Row 1: Export buttons
 * - Row 2: Two charts side by side (Occupancy Comparison + Variance Trend)
 * - Row 3: Data grid with variance details
 *
 * Features:
 * - Real-time variance calculations
 * - Multiple chart views
 * - Export to Excel/PDF/CSV/PNG
 * - Responsive layout
 * - Loading and error states
 *
 * FASE 5.4 - Variance Analysis Dashboard
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Skeleton,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useUser from '@auth/useUser';

// Hooks
import { useVarianceData } from './hooks/useVarianceData';
import { useChartExport } from './hooks/useChartExport';

// Components
import {
  OccupancyComparisonChart,
  VarianceTrendChart,
  VarianceFilters,
  VarianceExport,
} from './components';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Types
import type { DashboardFilters, VarianceDataPoint } from '../types/dashboardTypes';
import { format } from 'date-fns';

/**
 * Mock blocks data (replace with actual API call)
 */
const MOCK_BLOCKS = [
  { id: 'B1', name: 'Bloque A' },
  { id: 'B2', name: 'Bloque B' },
  { id: 'B3', name: 'Bloque C' },
];

/**
 * VarianceAnalysisScreen Component
 */
const VarianceAnalysisScreen: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: user } = useUser();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Chart refs for export
  const comparisonChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);

  // Get campId from user
  const campId = user?.camps?.[0]?.id || '';

  // State for filters
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: new Date(),
      endDate: new Date(),
    },
    blockId: undefined,
    groupBy: 'day',
    chartType: 'line',
  });

  // Fetch variance data
  const {
    data: varianceData,
    isLoading,
    error,
    refetch,
    stats,
  } = useVarianceData({
    campId,
    dateRange: filters.dateRange,
    groupBy: filters.groupBy,
  });

  // Chart export hooks
  const { exportAsPNG: exportComparisonChart, isExporting: isExportingComparison } =
    useChartExport(comparisonChartRef, 'ocupacion_comparacion');
  const { exportAsPNG: exportTrendChart, isExporting: isExportingTrend } = useChartExport(
    trendChartRef,
    'tendencia_varianza'
  );

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback(
    (newFilters: DashboardFilters) => {
      setFilters(newFilters);
    },
    []
  );

  /**
   * Handle apply filters (trigger refetch)
   */
  const handleApplyFilters = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    navigate('/housekeeping/dashboard');
  }, [navigate]);

  /**
   * Handle breadcrumb navigation
   */
  const handleBreadcrumbClick = useCallback(
    (path: string) => (event: React.MouseEvent) => {
      event.preventDefault();
      navigate(path);
    },
    [navigate]
  );

  /**
   * Data grid columns
   */
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'date',
        headerName: 'Fecha',
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => {
          try {
            return format(new Date(params.value), 'dd/MM/yyyy');
          } catch {
            return params.value;
          }
        },
      },
      {
        field: 'expectedOccupied',
        headerName: 'Esperado',
        flex: 1,
        minWidth: 100,
        type: 'number',
      },
      {
        field: 'actualOccupied',
        headerName: 'Real',
        flex: 1,
        minWidth: 100,
        type: 'number',
      },
      {
        field: 'variance',
        headerName: 'Varianza',
        flex: 1,
        minWidth: 100,
        type: 'number',
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as number;
          const isPositive = value > 0;
          const isZero = value === 0;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isZero ? (
                <RemoveIcon fontSize="small" color="disabled" />
              ) : isPositive ? (
                <TrendingUpIcon fontSize="small" color="success" />
              ) : (
                <TrendingDownIcon fontSize="small" color="error" />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: isZero
                    ? 'text.secondary'
                    : isPositive
                    ? 'success.main'
                    : 'error.main',
                  fontWeight: 600,
                }}
              >
                {isPositive ? '+' : ''}
                {value}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'variancePercent',
        headerName: 'Varianza %',
        flex: 1,
        minWidth: 120,
        type: 'number',
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as number;
          const isPositive = value > 0;
          const isZero = value === 0;

          return (
            <Typography
              variant="body2"
              sx={{
                color: isZero
                  ? 'text.secondary'
                  : isPositive
                  ? 'success.main'
                  : 'error.main',
                fontWeight: 600,
              }}
            >
              {isPositive ? '+' : ''}
              {value.toFixed(1)}%
            </Typography>
          );
        },
      },
      {
        field: 'discrepanciesCount',
        headerName: 'Discrepancias',
        flex: 1,
        minWidth: 120,
        type: 'number',
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as number;
          return (
            <Typography
              variant="body2"
              sx={{
                color: value === 0 ? 'success.main' : value <= 3 ? 'warning.main' : 'error.main',
                fontWeight: value > 0 ? 600 : 400,
              }}
            >
              {value}
            </Typography>
          );
        },
      },
    ],
    []
  );

  /**
   * Render content based on loading/error states
   */
  const renderContent = () => {
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error al cargar datos</AlertTitle>
          {error}
          <Button onClick={refetch} size="small" sx={{ mt: 1 }}>
            Reintentar
          </Button>
        </Alert>
      );
    }

    return (
      <>
        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Occupancy Comparison Chart */}
          <Grid item xs={12} lg={6}>
            <Box ref={comparisonChartRef} id="comparison-chart">
              <OccupancyComparisonChart
                data={varianceData}
                height={400}
                isLoading={isLoading}
                showVarianceArea={filters.chartType === 'area'}
              />
            </Box>
          </Grid>

          {/* Variance Trend Chart */}
          <Grid item xs={12} lg={6}>
            <Box ref={trendChartRef} id="trend-chart">
              <VarianceTrendChart
                data={varianceData}
                height={400}
                isLoading={isLoading}
                showThreshold
              />
            </Box>
          </Grid>
        </Grid>

        {/* Statistics Summary */}
        {!isLoading && varianceData.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Resumen Estadístico
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Varianza Promedio
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color:
                        stats.averageVariance > 0
                          ? 'success.main'
                          : stats.averageVariance < 0
                          ? 'error.main'
                          : 'text.primary',
                    }}
                  >
                    {stats.averageVariance > 0 ? '+' : ''}
                    {stats.averageVariance.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Esperado
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {varianceData.reduce((sum, d) => sum + d.expectedOccupied, 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Real
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {varianceData.reduce((sum, d) => sum + d.actualOccupied, 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Discrepancias
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {stats.discrepanciesCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Data Grid */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detalle de Varianza por Período
            </Typography>
            <VarianceExport
              data={varianceData}
              chartRef={comparisonChartRef}
              filename="analisis_varianza"
              disabled={isLoading || varianceData.length === 0}
              showChartExport
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={varianceData.map((item, index) => ({ id: index, ...item }))}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[5, 10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        </Paper>
      </>
    );
  };

  return (
    <FusePageSimple
      header={
        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              href="/"
              onClick={handleBreadcrumbClick('/')}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
            >
              <HomeIcon fontSize="small" />
              Inicio
            </Link>
            <Link
              href="/housekeeping/dashboard"
              onClick={handleBreadcrumbClick('/housekeeping/dashboard')}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
            >
              <DashboardIcon fontSize="small" />
              Dashboard
            </Link>
            <Typography color="text.primary">Análisis de Varianza</Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                size={isMobile ? 'small' : 'medium'}
              >
                {!isMobile && 'Volver'}
              </Button>
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
                  Análisis de Varianza
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comparación de ocupación esperada vs. real
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      }
      content={
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          {/* Filters */}
          <VarianceFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            blocks={MOCK_BLOCKS}
            isLoading={isLoading}
            onApply={handleApplyFilters}
          />

          {/* Content */}
          {renderContent()}
        </Box>
      }
    />
  );
};

export default VarianceAnalysisScreen;
