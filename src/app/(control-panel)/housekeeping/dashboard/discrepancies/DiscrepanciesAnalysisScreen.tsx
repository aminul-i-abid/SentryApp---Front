'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Fab,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  alpha,
  Zoom,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import DiscrepanciesDataGrid from './components/DiscrepanciesDataGrid';
import DiscrepancyDetailsModal from './components/DiscrepancyDetailsModal';
import CorrectiveActionsSuggester from './components/CorrectiveActionsSuggester';
import DiscrepanciesFilters from './components/DiscrepanciesFilters';
import DiscrepanciesExport from './components/DiscrepanciesExport';
import { useDiscrepanciesData } from './hooks/useDiscrepanciesData';
import { useCorrectiveActions } from './hooks/useCorrectiveActions';
import type { Discrepancy, DiscrepancyFilters } from '../types/dashboardTypes';

const DiscrepanciesAnalysisScreen: React.FC = () => {
  // State
  const [filters, setFilters] = useState<DiscrepancyFilters>({
    startDate: null,
    endDate: null,
    discrepancyTypes: [],
    blockIds: [],
    resolved: undefined,
    searchTerm: '',
    priorities: [],
  });
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<Discrepancy | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<Discrepancy[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Hooks
  const {
    discrepancies,
    isLoading,
    error,
    refetch,
  } = useDiscrepanciesData('', filters);

  const { executeAction } = useCorrectiveActions();

  // Filter discrepancies based on filters
  const filteredDiscrepancies = useMemo(() => {
    let filtered = [...discrepancies];

    // Apply search term
    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.roomNumber.toLowerCase().includes(searchLower) ||
          d.blockName.toLowerCase().includes(searchLower) ||
          d.discrepancyType.toLowerCase().includes(searchLower) ||
          d.expectedStatus.toLowerCase().includes(searchLower) ||
          d.actualStatus.toLowerCase().includes(searchLower) ||
          (d.resolutionNotes && d.resolutionNotes.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [discrepancies, filters.searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredDiscrepancies.length;
    const resolved = filteredDiscrepancies.filter((d) => d.resolved).length;
    const pending = total - resolved;
    const critical = filteredDiscrepancies.filter(
      (d) => !d.resolved && d.priority?.toLowerCase() === 'high'
    ).length;

    const byType = {
      skip: filteredDiscrepancies.filter((d) => d.discrepancyType.toLowerCase() === 'skip').length,
      sleep: filteredDiscrepancies.filter((d) => d.discrepancyType.toLowerCase() === 'sleep').length,
      count: filteredDiscrepancies.filter((d) => d.discrepancyType.toLowerCase() === 'count').length,
    };

    const avgVariance =
      total > 0
        ? filteredDiscrepancies.reduce((sum, d) => sum + Math.abs(d.varianceValue), 0) / total
        : 0;

    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

    return {
      total,
      resolved,
      pending,
      critical,
      byType,
      avgVariance,
      resolutionRate,
    };
  }, [filteredDiscrepancies]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: DiscrepancyFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRowClick = useCallback((discrepancy: Discrepancy) => {
    setSelectedDiscrepancy(discrepancy);
    setDetailsModalOpen(true);
  }, []);

  const handleDetailsModalClose = useCallback(() => {
    setDetailsModalOpen(false);
    setSelectedDiscrepancy(null);
  }, []);

  const handleResolveDiscrepancy = async (discrepancyId: string, notes: string) => {
    try {
      // await resolveDiscrepancy(discrepancyId, notes); // TODO: Implement when API is ready
      setSnackbarMessage('Discrepancia resuelta exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleDetailsModalClose();
      await refetch();
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Error al resolver la discrepancia');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      throw error;
    }
  };

  const handleBulkResolve = async () => {
    if (selectedDiscrepancies.length === 0) {
      setSnackbarMessage('No hay discrepancias seleccionadas');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      const discrepancyIds = selectedDiscrepancies.map((d) => d.id);
      // await bulkResolveDiscrepancies(discrepancyIds, 'Resolución masiva desde el panel de discrepancias'); // TODO: Implement when API is ready
      setSnackbarMessage(`${discrepancyIds.length} discrepancias resueltas exitosamente`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setSelectedDiscrepancies([]);
      await refetch();
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Error al resolver las discrepancias');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSelectionChange = useCallback((selected: Discrepancy[]) => {
    setSelectedDiscrepancies(selected);
  }, []);

  const handleActionExecute = async (actionId: string, discrepancyId: string) => {
    try {
      // TODO: Implement when executeAction signature is properly defined
      // await executeAction(actionId, discrepancyId);
      setSnackbarMessage('Acción ejecutada exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await refetch();
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Error al ejecutar la acción');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      throw error;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRefresh = async () => {
    setSnackbarMessage('Actualizando datos...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
    await refetch();
    setSnackbarMessage('Datos actualizados exitosamente');
    setSnackbarSeverity('success');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, gap: 3 }}>
      {/* Header */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Análisis de Discrepancias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitoreo y gestión de discrepancias en el servicio de housekeeping
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualizar datos">
              <Fab
                size="small"
                color="primary"
                onClick={handleRefresh}
                disabled={isLoading}
                sx={{ boxShadow: 2 }}
              >
                <RefreshIcon />
              </Fab>
            </Tooltip>
            <DiscrepanciesExport
              discrepancies={filteredDiscrepancies}
              filters={filters}
              filename="discrepancias_housekeeping"
            />
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => refetch()}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <TrendingUpIcon fontSize="large" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {statistics.total}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.02),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                  }}
                >
                  <CheckCircleIcon fontSize="large" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Resueltas
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {statistics.resolved}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.resolutionRate.toFixed(1)}% del total
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.02),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main',
                  }}
                >
                  <WarningIcon fontSize="large" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Pendientes
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {statistics.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.total > 0 ? ((statistics.pending / statistics.total) * 100).toFixed(1) : 0}% del total
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.02),
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                  }}
                >
                  <ErrorIcon fontSize="large" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Críticas
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {statistics.critical}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Prioridad alta
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <DiscrepanciesFilters filters={filters} onFiltersChange={handleFiltersChange} blocks={[]} />

      {/* Main Content */}
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* Data Grid */}
        <Grid item xs={12} lg={selectedDiscrepancy ? 7 : 12}>
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 400,
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <DiscrepanciesDataGrid
                discrepancies={filteredDiscrepancies}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onSelectionChange={handleSelectionChange}
              />
            )}
          </Paper>
        </Grid>

        {/* Corrective Actions Panel */}
        {selectedDiscrepancy && (
          <Grid item xs={12} lg={5}>
            <Zoom in={selectedDiscrepancy !== null}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  p: 3,
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 400px)',
                }}
              >
                <CorrectiveActionsSuggester
                  discrepancy={selectedDiscrepancy}
                  onActionExecute={handleActionExecute}
                />
              </Paper>
            </Zoom>
          </Grid>
        )}
      </Grid>

      {/* Details Modal */}
      <DiscrepancyDetailsModal
        discrepancy={selectedDiscrepancy}
        open={detailsModalOpen}
        onClose={handleDetailsModalClose}
        onResolve={handleResolveDiscrepancy}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DiscrepanciesAnalysisScreen;
