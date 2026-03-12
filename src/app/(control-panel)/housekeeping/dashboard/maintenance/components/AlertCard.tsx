/**
 * AlertCard Component
 * FASE 5.4 - Maintenance Alert Card
 *
 * Card component for displaying maintenance alert details
 * Draggable via react-beautiful-dnd
 */

import { memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { MaintenanceAlert } from '@/store/housekeeping/housekeepingTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Props for AlertCard component
 */
interface AlertCardProps {
  /** Alert data to display */
  alert: MaintenanceAlert;
  /** Index in the list (for drag-and-drop) */
  index: number;
  /** Callback when card is clicked */
  onClick: () => void;
}

/**
 * Styled card container
 */
const StyledCard = styled(Card)<{ $severity: string; $isDragging?: boolean }>(
  ({ theme, $severity, $isDragging }) => ({
    marginBottom: theme.spacing(1.5),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `2px solid ${getSeverityColor($severity, theme.palette.mode)}`,
    backgroundColor: $isDragging
      ? alpha(theme.palette.primary.main, 0.1)
      : theme.palette.background.paper,
    transform: $isDragging ? 'rotate(2deg)' : 'none',
    boxShadow: $isDragging ? theme.shadows[8] : theme.shadows[1],
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
    },
  })
);

/**
 * Styled card content
 */
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

/**
 * Get severity color based on alert severity
 */
function getSeverityColor(severity: string, mode: 'light' | 'dark'): string {
  const colors: Record<string, string> = {
    Critical: '#dc2626', // Red
    High: '#f59e0b', // Orange
    Medium: '#eab308', // Yellow
    Low: '#3b82f6', // Blue
  };
  return colors[severity] || '#6b7280';
}

/**
 * Get severity icon based on alert severity
 */
function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'Critical':
      return <ErrorIcon fontSize="small" />;
    case 'High':
      return <WarningIcon fontSize="small" />;
    case 'Medium':
      return <InfoIcon fontSize="small" />;
    case 'Low':
      return <InfoIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
}

/**
 * Get severity label in Spanish
 */
function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    Critical: 'Crítico',
    High: 'Alto',
    Medium: 'Medio',
    Low: 'Bajo',
  };
  return labels[severity] || severity;
}

/**
 * Truncate text to specified length
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format date to relative or absolute format
 */
function formatAlertDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm', { locale: es });
    } else {
      return format(date, 'dd/MM/yyyy', { locale: es });
    }
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * AlertCard Component
 *
 * Renders a draggable card with maintenance alert information including:
 * - Severity badge with color coding
 * - Category chip
 * - Room number
 * - Description (truncated)
 * - Assigned users
 * - Created date
 */
const AlertCard = memo<AlertCardProps>(({ alert, index, onClick }) => {
  const severityColor = getSeverityColor(alert.severity, 'light');
  const severityIcon = getSeverityIcon(alert.severity);
  const severityLabel = getSeverityLabel(alert.severity);
  const formattedDate = formatAlertDate(alert.reportedAt);
  const truncatedDescription = truncateText(alert.description, 80);

  return (
    <Draggable draggableId={alert.id} index={index}>
      {(provided, snapshot) => (
        <StyledCard
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          $severity={alert.severity}
          $isDragging={snapshot.isDragging}
          elevation={snapshot.isDragging ? 8 : 1}
        >
          <StyledCardContent>
            {/* Header: Severity and Category */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Chip
                icon={severityIcon}
                label={severityLabel}
                size="small"
                sx={{
                  backgroundColor: alpha(severityColor, 0.1),
                  color: severityColor,
                  borderColor: severityColor,
                  border: '1px solid',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: severityColor,
                  },
                }}
              />
              <Chip
                label={alert.category}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'divider',
                  fontWeight: 500,
                }}
              />
            </Box>

            {/* Room Number */}
            <Typography variant="h6" fontWeight={600} mb={1}>
              Habitación {alert.roomNumber}
            </Typography>

            {/* Title */}
            <Typography variant="subtitle2" fontWeight={500} mb={0.5} color="text.primary">
              {alert.title}
            </Typography>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 40 }}>
              {truncatedDescription}
            </Typography>

            {/* Footer: Assigned and Date */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {/* Assigned Users */}
              <Box display="flex" alignItems="center" gap={1}>
                {alert.assignedToNames && alert.assignedToNames.length > 0 ? (
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                    {alert.assignedToNames.map((name, idx) => (
                      <Tooltip key={idx} title={name} arrow>
                        <Avatar sx={{ fontSize: 12, bgcolor: 'primary.main' }}>
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                ) : (
                  <Chip
                    icon={<PersonIcon />}
                    label="Sin asignar"
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>

              {/* Date */}
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </StyledCardContent>
        </StyledCard>
      )}
    </Draggable>
  );
});

AlertCard.displayName = 'AlertCard';

export default AlertCard;
