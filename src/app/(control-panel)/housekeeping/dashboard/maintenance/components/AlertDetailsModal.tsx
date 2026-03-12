/**
 * AlertDetailsModal Component
 * FASE 5.4 - Alert Details Modal
 *
 * Full-featured modal for viewing and editing maintenance alert details
 * Supports status changes, user assignment, comments, and priority updates
 */

import { useState, memo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  AvatarGroup,
  Tooltip,
  Paper,
  Grid,
  Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RoomIcon from '@mui/icons-material/Room';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { MaintenanceAlert, AlertStatus, AlertSeverity } from '@/store/housekeeping/housekeepingTypes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Props for AlertDetailsModal
 */
interface AlertDetailsModalProps {
  /** Alert to display (null if modal is closed) */
  alert: MaintenanceAlert | null;
  /** Whether modal is open */
  open: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback to update alert */
  onUpdate: (alertId: string, updates: Partial<MaintenanceAlert>) => Promise<void>;
  /** Available users for assignment */
  availableUsers?: Array<{ id: string; name: string }>;
}

/**
 * Styled dialog with custom styling
 */
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: 800,
    width: '100%',
    borderRadius: theme.shape.borderRadius * 2,
  },
}));

/**
 * Styled dialog title
 */
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/**
 * Styled dialog content
 */
const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

/**
 * Styled dialog actions
 */
const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
}));

/**
 * Styled info card
 */
const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  border: `1px solid ${theme.palette.divider}`,
}));

/**
 * Styled comment section
 */
const CommentSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

/**
 * Get severity color
 */
function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    Critical: '#dc2626',
    High: '#f59e0b',
    Medium: '#eab308',
    Low: '#3b82f6',
  };
  return colors[severity] || '#6b7280';
}

/**
 * Get severity icon
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
 * Get severity label
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
 * Get status label
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    Pending: 'Pendiente',
    InProgress: 'En Progreso',
    Resolved: 'Resuelto',
    Cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * AlertDetailsModal Component
 */
const AlertDetailsModal = memo<AlertDetailsModalProps>(({
  alert,
  open,
  onClose,
  onUpdate,
  availableUsers = [],
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<AlertStatus | ''>('');
  const [newSeverity, setNewSeverity] = useState<AlertSeverity | ''>('');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  // Reset local state when alert changes
  const handleEntered = useCallback(() => {
    if (alert) {
      setNewStatus(alert.status);
      setNewSeverity(alert.severity);
      setAssignedUsers(alert.assignedTo || []);
      setComment('');
    }
  }, [alert]);

  /**
   * Handle status change
   */
  const handleStatusChange = async (status: AlertStatus) => {
    if (!alert) return;

    setIsUpdating(true);
    try {
      await onUpdate(alert.id, { status });
      setNewStatus(status);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle severity change
   */
  const handleSeverityChange = async (severity: AlertSeverity) => {
    if (!alert) return;

    setIsUpdating(true);
    try {
      await onUpdate(alert.id, { severity });
      setNewSeverity(severity);
    } catch (error) {
      console.error('Error updating severity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle user assignment
   */
  const handleAssignUsers = async () => {
    if (!alert) return;

    setIsUpdating(true);
    try {
      await onUpdate(alert.id, { assignedTo: assignedUsers });
    } catch (error) {
      console.error('Error assigning users:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle add comment
   */
  const handleAddComment = async () => {
    if (!alert || !comment.trim()) return;

    setIsUpdating(true);
    try {
      const updatedNotes = alert.notes ? `${alert.notes}\n\n${comment}` : comment;
      await onUpdate(alert.id, { notes: updatedNotes });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle resolve
   */
  const handleResolve = async () => {
    if (!alert) return;

    setIsUpdating(true);
    try {
      await onUpdate(alert.id, {
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error resolving alert:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = async () => {
    if (!alert) return;

    setIsUpdating(true);
    try {
      await onUpdate(alert.id, { status: 'Cancelled' });
      onClose();
    } catch (error) {
      console.error('Error cancelling alert:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!alert) return null;

  const severityColor = getSeverityColor(alert.severity);
  const currentStatus = (newStatus || alert.status) as AlertStatus;
  const currentSeverity = (newSeverity || alert.severity) as AlertSeverity;

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionProps={{ onEntered: handleEntered }}
      maxWidth="md"
      fullWidth
    >
      {/* Title */}
      <StyledDialogTitle>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                icon={getSeverityIcon(currentSeverity)}
                label={getSeverityLabel(currentSeverity)}
                size="small"
                sx={{
                  backgroundColor: alpha(severityColor, 0.1),
                  color: severityColor,
                  borderColor: severityColor,
                  border: '1px solid',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={getStatusLabel(currentStatus)}
                size="small"
                color={currentStatus === 'Resolved' ? 'success' : 'default'}
              />
            </Box>
            <Typography variant="h5" fontWeight={600}>
              {alert.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Habitación {alert.roomNumber}
              {alert.blockName && ` - ${alert.blockName}`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </StyledDialogTitle>

      {/* Content */}
      <StyledDialogContent>
        {/* Key Information */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <InfoCard elevation={0}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <CategoryIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Categoría
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={500}>
                {alert.category}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoCard elevation={0}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <RoomIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Ubicación
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={500}>
                Habitación {alert.roomNumber}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoCard elevation={0}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Reportado por
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={500}>
                {alert.reportedByName || 'Desconocido'}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoCard elevation={0}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Fecha de reporte
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(alert.reportedAt)}
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Description */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Descripción
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {alert.description}
          </Typography>
        </Box>

        {/* Status and Severity Controls */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={currentStatus}
                label="Estado"
                onChange={(e) => handleStatusChange(e.target.value as AlertStatus)}
                disabled={isUpdating}
              >
                <MenuItem value="Pending">Pendiente</MenuItem>
                <MenuItem value="InProgress">En Progreso</MenuItem>
                <MenuItem value="Resolved">Resuelto</MenuItem>
                <MenuItem value="Cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={currentSeverity}
                label="Prioridad"
                onChange={(e) => handleSeverityChange(e.target.value as AlertSeverity)}
                disabled={isUpdating}
              >
                <MenuItem value="Critical">Crítico</MenuItem>
                <MenuItem value="High">Alto</MenuItem>
                <MenuItem value="Medium">Medio</MenuItem>
                <MenuItem value="Low">Bajo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Assigned Users */}
        {availableUsers.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Asignar a
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={assignedUsers}
                onChange={(e) => setAssignedUsers(e.target.value as string[])}
                disabled={isUpdating}
                renderValue={(selected) => (
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {(selected as string[]).map((userId) => {
                      const user = availableUsers.find((u) => u.id === userId);
                      return (
                        <Chip key={userId} label={user?.name || userId} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {assignedUsers.length !== (alert.assignedTo?.length || 0) && (
              <Button
                size="small"
                onClick={handleAssignUsers}
                disabled={isUpdating}
                sx={{ mt: 1 }}
              >
                Guardar asignación
              </Button>
            )}
          </Box>
        )}

        {/* Comments Section */}
        <CommentSection>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Notas y Comentarios
          </Typography>
          {alert.notes && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
            >
              {alert.notes}
            </Typography>
          )}
          <Stack spacing={1}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Agregar comentario..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isUpdating}
              size="small"
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                size="small"
                onClick={handleAddComment}
                disabled={isUpdating || !comment.trim()}
              >
                Agregar comentario
              </Button>
            </Box>
          </Stack>
        </CommentSection>
      </StyledDialogContent>

      {/* Actions */}
      <StyledDialogActions>
        <Box display="flex" gap={1} width="100%" justifyContent="space-between">
          <Button onClick={onClose} color="inherit">
            Cerrar
          </Button>
          <Box display="flex" gap={1}>
            {currentStatus !== 'Cancelled' && (
              <Button
                onClick={handleCancel}
                disabled={isUpdating}
                color="error"
                startIcon={<CancelIcon />}
              >
                Cancelar Alerta
              </Button>
            )}
            {currentStatus !== 'Resolved' && (
              <Button
                onClick={handleResolve}
                disabled={isUpdating}
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
              >
                Resolver
              </Button>
            )}
          </Box>
        </Box>
      </StyledDialogActions>
    </StyledDialog>
  );
});

AlertDetailsModal.displayName = 'AlertDetailsModal';

export default AlertDetailsModal;
