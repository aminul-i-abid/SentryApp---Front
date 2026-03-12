/**
 * KanbanBoard Component
 * FASE 5.4 - Maintenance Kanban Board
 *
 * Implements drag-and-drop functionality for maintenance alerts
 * using react-beautiful-dnd with 4 columns:
 * - Pending, In Progress, Resolved, Cancelled
 */

import { memo } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { MaintenanceAlert, AlertStatus } from '@/store/housekeeping/housekeepingTypes';
import KanbanColumn from './KanbanColumn';

/**
 * Props for KanbanBoard component
 */
interface KanbanBoardProps {
  /** Array of maintenance alerts to display */
  alerts: MaintenanceAlert[];
  /** Callback when an alert is dragged to a new status */
  onDragEnd: (alertId: string, newStatus: AlertStatus) => void;
  /** Callback when an alert card is clicked */
  onAlertClick: (alert: MaintenanceAlert) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Styled container for the Kanban board
 */
const BoardContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

/**
 * Styled header for the board
 */
const BoardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

/**
 * Styled container for columns with horizontal scroll
 */
const ColumnsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  overflowX: 'auto',
  overflowY: 'hidden',
  flex: 1,
  minHeight: 0,
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    },
  },
}));

/**
 * Column definitions with display names and colors
 */
const COLUMN_CONFIG: Array<{
  status: AlertStatus;
  title: string;
  color: string;
}> = [
  {
    status: 'Pending',
    title: 'Pendiente',
    color: '#f59e0b', // Amber
  },
  {
    status: 'InProgress',
    title: 'En Progreso',
    color: '#3b82f6', // Blue
  },
  {
    status: 'Resolved',
    title: 'Resuelto',
    color: '#10b981', // Green
  },
  {
    status: 'Cancelled',
    title: 'Cancelado',
    color: '#6b7280', // Gray
  },
];

/**
 * KanbanBoard Component
 *
 * Main Kanban board component that manages drag-and-drop functionality
 * and renders columns for each alert status.
 */
const KanbanBoard = memo<KanbanBoardProps>(({
  alerts,
  onDragEnd,
  onAlertClick,
  isLoading = false,
}) => {
  /**
   * Handle drag end event
   * Updates alert status when dropped in a new column
   */
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination or dropped in same position
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extract alert ID and new status
    const alertId = draggableId;
    const newStatus = destination.droppableId as AlertStatus;

    // Call parent handler
    onDragEnd(alertId, newStatus);
  };

  /**
   * Get alerts for a specific status
   */
  const getAlertsByStatus = (status: AlertStatus): MaintenanceAlert[] => {
    return alerts.filter((alert) => alert.status === status);
  };

  /**
   * Calculate total alerts count
   */
  const totalAlerts = alerts.length;

  return (
    <BoardContainer elevation={0}>
      {/* Board Header */}
      <BoardHeader>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Tablero de Mantenimiento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'} en total
            </Typography>
          </Box>
        </Box>
      </BoardHeader>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <ColumnsContainer>
          {COLUMN_CONFIG.map((column) => {
            const columnAlerts = getAlertsByStatus(column.status);

            return (
              <Droppable key={column.status} droppableId={column.status}>
                {(provided, snapshot) => (
                  <KanbanColumn
                    status={column.status}
                    title={column.title}
                    color={column.color}
                    alerts={columnAlerts}
                    onAlertClick={onAlertClick}
                    isLoading={isLoading}
                    isDraggingOver={snapshot.isDraggingOver}
                    droppableProvided={provided}
                  />
                )}
              </Droppable>
            );
          })}
        </ColumnsContainer>
      </DragDropContext>
    </BoardContainer>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;
