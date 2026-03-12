/**
 * MaintenanceKanbanScreen Component
 * FASE 5.4 - Maintenance Kanban Screen
 *
 * Main screen for the maintenance Kanban board
 * Integrates all maintenance components with data management
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { MaintenanceAlert, AlertStatus } from '@/store/housekeeping/housekeepingTypes';
import type { AlertFilters as AlertFiltersType } from '../types/dashboardTypes';
import KanbanBoard from './components/KanbanBoard';
import AlertDetailsModal from './components/AlertDetailsModal';
import AlertFiltersComponent from './components/AlertFilters';
import BulkActions, { type BulkActionType } from './components/BulkActions';

/**
 * Styled container for the screen
 */
const ScreenContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
}));

/**
 * Styled toolbar
 */
const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: 10,
}));

/**
 * Styled main content area
 */
const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
}));

/**
 * Styled drawer
 */
const FiltersDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 320,
    padding: theme.spacing(2),
  },
}));

/**
 * Styled bulk actions container
 */
const BulkActionsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  width: '90%',
  maxWidth: 900,
}));

/**
 * Styled loading overlay
 */
const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  zIndex: 1001,
}));

/**
 * Mock data for demonstration
 * In production, this would come from API/Redux
 */
const MOCK_ALERTS: MaintenanceAlert[] = [
  {
    id: '1',
    campId: 'camp-1',
    roomId: 'room-101',
    roomNumber: '101',
    blockId: 'block-a',
    blockName: 'Bloque A',
    title: 'Fuga de agua en baño',
    description: 'Se detectó una fuga de agua en el lavabo del baño principal',
    category: 'Plomería',
    severity: 'Critical',
    status: 'Pending',
    assignedTo: [],
    assignedToNames: [],
    reportedBy: 'user-1',
    reportedByName: 'Juan Pérez',
    reportedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    campId: 'camp-1',
    roomId: 'room-205',
    roomNumber: '205',
    blockId: 'block-b',
    blockName: 'Bloque B',
    title: 'Luz fundida en pasillo',
    description: 'La luz del pasillo no enciende',
    category: 'Electricidad',
    severity: 'Low',
    status: 'InProgress',
    assignedTo: ['user-2'],
    assignedToNames: ['María González'],
    reportedBy: 'user-3',
    reportedByName: 'Carlos Ruiz',
    reportedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    campId: 'camp-1',
    roomId: 'room-310',
    roomNumber: '310',
    blockId: 'block-c',
    blockName: 'Bloque C',
    title: 'Puerta no cierra correctamente',
    description: 'La puerta principal de la habitación no cierra bien, problemas con la cerradura',
    category: 'Cerraduras',
    severity: 'High',
    status: 'Pending',
    assignedTo: [],
    assignedToNames: [],
    reportedBy: 'user-4',
    reportedByName: 'Ana Martínez',
    reportedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const MOCK_USERS = [
  { id: 'user-1', name: 'Juan Pérez' },
  { id: 'user-2', name: 'María González' },
  { id: 'user-3', name: 'Carlos Ruiz' },
  { id: 'user-4', name: 'Ana Martínez' },
];

/**
 * MaintenanceKanbanScreen Component
 *
 * Main screen component that orchestrates the Kanban board functionality.
 */
const MaintenanceKanbanScreen = () => {
  // State management
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(MOCK_ALERTS);
  const [filters, setFilters] = useState<AlertFiltersType>({});
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<MaintenanceAlert | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Filter alerts based on current filters
   */
  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    // Apply severity filter
    if (filters.severity) {
      result = result.filter((alert) => alert.severity === filters.severity);
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter((alert) =>
        alert.category.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }

    // Apply room number filter
    if (filters.roomNumber) {
      result = result.filter((alert) =>
        alert.roomNumber.includes(filters.roomNumber!)
      );
    }

    // Apply assigned to filter
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter((alert) => !alert.assignedTo || alert.assignedTo.length === 0);
      } else {
        result = result.filter((alert) =>
          alert.assignedTo?.includes(filters.assignedTo!)
        );
      }
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        (alert) =>
          alert.title.toLowerCase().includes(searchLower) ||
          alert.description.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [alerts, filters]);

  /**
   * Get available categories from alerts
   */
  const availableCategories = useMemo(() => {
    const categories = new Set(alerts.map((alert) => alert.category));
    return Array.from(categories).sort();
  }, [alerts]);

  /**
   * Handle drag end - update alert status
   */
  const handleDragEnd = useCallback(async (alertId: string, newStatus: AlertStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: newStatus, updatedAt: new Date().toISOString() }
            : alert
        )
      );

      // In production, call API here
      // await updateAlertStatus(alertId, newStatus);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error updating alert status:', err);
      setError('Error al actualizar el estado de la alerta');

      // Rollback on error
      setAlerts(MOCK_ALERTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle alert click - open details modal
   */
  const handleAlertClick = useCallback((alert: MaintenanceAlert) => {
    setSelectedAlert(alert);
    setIsDetailsModalOpen(true);
  }, []);

  /**
   * Handle alert update
   */
  const handleAlertUpdate = useCallback(
    async (alertId: string, updates: Partial<MaintenanceAlert>) => {
      setIsLoading(true);
      setError(null);

      try {
        // Optimistic update
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, ...updates, updatedAt: new Date().toISOString() }
              : alert
          )
        );

        // Update selected alert if it's the one being edited
        if (selectedAlert?.id === alertId) {
          setSelectedAlert((prev) =>
            prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null
          );
        }

        // In production, call API here
        // await updateAlert(alertId, updates);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Error updating alert:', err);
        setError('Error al actualizar la alerta');

        // Rollback on error
        setAlerts(MOCK_ALERTS);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAlert]
  );

  /**
   * Handle bulk action
   */
  const handleBulkAction = useCallback(
    async (action: BulkActionType, value: string) => {
      setIsLoading(true);
      setError(null);

      try {
        switch (action) {
          case 'assign':
            setAlerts((prevAlerts) =>
              prevAlerts.map((alert) =>
                selectedAlerts.includes(alert.id)
                  ? {
                      ...alert,
                      assignedTo: [...(alert.assignedTo || []), value],
                      updatedAt: new Date().toISOString(),
                    }
                  : alert
              )
            );
            break;

          case 'status':
            setAlerts((prevAlerts) =>
              prevAlerts.map((alert) =>
                selectedAlerts.includes(alert.id)
                  ? {
                      ...alert,
                      status: value as AlertStatus,
                      updatedAt: new Date().toISOString(),
                    }
                  : alert
              )
            );
            break;

          case 'priority':
            setAlerts((prevAlerts) =>
              prevAlerts.map((alert) =>
                selectedAlerts.includes(alert.id)
                  ? {
                      ...alert,
                      severity: value as any,
                      updatedAt: new Date().toISOString(),
                    }
                  : alert
              )
            );
            break;

          case 'export':
            // Handle export
            console.log('Exporting to', value);
            break;
        }

        // In production, call API here
        // await bulkUpdateAlerts(selectedAlerts, action, value);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Clear selection after successful action
        setSelectedAlerts([]);
      } catch (err) {
        console.error('Error performing bulk action:', err);
        setError('Error al realizar la acción');

        // Rollback on error
        setAlerts(MOCK_ALERTS);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedAlerts]
  );

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, fetch from API
      // const data = await fetchMaintenanceAlerts();
      // setAlerts(data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAlerts(MOCK_ALERTS);
    } catch (err) {
      console.error('Error refreshing alerts:', err);
      setError('Error al actualizar las alertas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle filters change
   */
  const handleFiltersChange = useCallback((newFilters: AlertFiltersType) => {
    setFilters(newFilters);
    setIsFiltersDrawerOpen(false);
  }, []);

  return (
    <ScreenContainer>
      {/* Toolbar */}
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Filtros">
            <IconButton
              onClick={() => setIsFiltersDrawerOpen(true)}
              color="primary"
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Actualizar">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <MainContent>
        <KanbanBoard
          alerts={filteredAlerts}
          onDragEnd={handleDragEnd}
          onAlertClick={handleAlertClick}
          isLoading={isLoading}
        />

        {/* Bulk Actions */}
        <BulkActionsContainer>
          <BulkActions
            selectedAlerts={selectedAlerts}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedAlerts([])}
            availableUsers={MOCK_USERS}
          />
        </BulkActionsContainer>

        {/* Loading Overlay */}
        {isLoading && (
          <LoadingOverlay>
            <CircularProgress size={48} />
          </LoadingOverlay>
        )}
      </MainContent>

      {/* Filters Drawer */}
      <FiltersDrawer
        anchor="right"
        open={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
      >
        <AlertFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableCategories={availableCategories}
          availableUsers={MOCK_USERS}
        />
      </FiltersDrawer>

      {/* Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlert}
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAlert(null);
        }}
        onUpdate={handleAlertUpdate}
        availableUsers={MOCK_USERS}
      />
    </ScreenContainer>
  );
};

export default MaintenanceKanbanScreen;
