/**
 * KanbanColumn Component
 * FASE 5.4 - Maintenance Kanban Column
 *
 * Represents a single column in the Kanban board
 * Contains a list of alert cards for a specific status
 */

import { memo } from 'react';
import { DroppableProvided } from 'react-beautiful-dnd';
import { Box, Typography, Chip, Paper, CircularProgress } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import InboxIcon from '@mui/icons-material/Inbox';
import type { MaintenanceAlert, AlertStatus } from '@/store/housekeeping/housekeepingTypes';
import AlertCard from './AlertCard';

/**
 * Props for KanbanColumn component
 */
interface KanbanColumnProps {
  /** Status of this column */
  status: AlertStatus;
  /** Display title for the column */
  title: string;
  /** Color for the column header */
  color: string;
  /** Alerts to display in this column */
  alerts: MaintenanceAlert[];
  /** Callback when an alert is clicked */
  onAlertClick: (alert: MaintenanceAlert) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Whether an item is being dragged over this column */
  isDraggingOver?: boolean;
  /** Provided props from react-beautiful-dnd */
  droppableProvided: DroppableProvided;
}

/**
 * Styled container for the column
 */
const ColumnContainer = styled(Box)<{ $isDraggingOver?: boolean }>(({ theme, $isDraggingOver }) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 320,
  maxWidth: 380,
  width: '100%',
  height: '100%',
  backgroundColor: $isDraggingOver
    ? alpha(theme.palette.primary.main, 0.05)
    : 'transparent',
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease',
}));

/**
 * Styled header for the column
 */
const ColumnHeader = styled(Paper)<{ $color: string }>(({ theme, $color }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: alpha($color, 0.1),
  border: `2px solid ${alpha($color, 0.3)}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
}));

/**
 * Styled container for alert cards
 */
const CardsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingRight: theme.spacing(1),
  minHeight: 200,
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    borderRadius: 3,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    },
  },
}));

/**
 * Styled empty state container
 */
const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  minHeight: 200,
}));

/**
 * Styled loading container
 */
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  minHeight: 200,
}));

/**
 * Get count badge color based on status
 */
const getCountBadgeColor = (status: AlertStatus): 'warning' | 'info' | 'success' | 'default' => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'InProgress':
      return 'info';
    case 'Resolved':
      return 'success';
    case 'Cancelled':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * KanbanColumn Component
 *
 * Renders a column in the Kanban board with a header and list of alert cards.
 * Supports drag-and-drop via react-beautiful-dnd.
 */
const KanbanColumn = memo<KanbanColumnProps>(({
  status,
  title,
  color,
  alerts,
  onAlertClick,
  isLoading = false,
  isDraggingOver = false,
  droppableProvided,
}) => {
  const alertCount = alerts.length;
  const countBadgeColor = getCountBadgeColor(status);

  return (
    <ColumnContainer $isDraggingOver={isDraggingOver}>
      {/* Column Header */}
      <ColumnHeader elevation={0} $color={color}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color }}>
            {title}
          </Typography>
        </Box>
        <Chip
          label={alertCount}
          size="small"
          color={countBadgeColor}
          sx={{
            fontWeight: 600,
            minWidth: 32,
          }}
        />
      </ColumnHeader>

      {/* Cards Container */}
      <CardsContainer
        ref={droppableProvided.innerRef}
        {...droppableProvided.droppableProps}
      >
        {isLoading ? (
          <LoadingContainer>
            <CircularProgress size={32} />
          </LoadingContainer>
        ) : alerts.length === 0 ? (
          <EmptyState>
            <InboxIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">
              No hay alertas en esta columna
            </Typography>
          </EmptyState>
        ) : (
          alerts.map((alert, index) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              index={index}
              onClick={() => onAlertClick(alert)}
            />
          ))
        )}
        {droppableProvided.placeholder}
      </CardsContainer>
    </ColumnContainer>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;
