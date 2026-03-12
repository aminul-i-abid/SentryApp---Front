/**
 * BulkActions Component
 * FASE 5.4 - Bulk Actions for Alerts
 *
 * Provides bulk action buttons for selected alerts:
 * - Assign to user
 * - Change status
 * - Change priority
 * - Export selected
 */

import { memo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { AlertStatus, AlertSeverity } from '@/store/housekeeping/housekeepingTypes';

/**
 * Props for BulkActions component
 */
interface BulkActionsProps {
  /** Array of selected alert IDs */
  selectedAlerts: string[];
  /** Callback when a bulk action is performed */
  onAction: (action: BulkActionType, value: string) => Promise<void>;
  /** Callback to clear selection */
  onClearSelection: () => void;
  /** Available users for assignment */
  availableUsers?: Array<{ id: string; name: string }>;
}

/**
 * Bulk action types
 */
export type BulkActionType = 'assign' | 'status' | 'priority' | 'export';

/**
 * Styled container
 */
const ActionsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
}));

/**
 * Styled actions group
 */
const ActionsGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

/**
 * BulkActions Component
 *
 * Displays action buttons when alerts are selected and handles bulk operations.
 */
const BulkActions = memo<BulkActionsProps>(({
  selectedAlerts,
  onAction,
  onClearSelection,
  availableUsers = [],
}) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus>('Pending');
  const [selectedPriority, setSelectedPriority] = useState<AlertSeverity>('Medium');

  /**
   * Handle assign dialog
   */
  const handleOpenAssignDialog = () => {
    setSelectedUserId('');
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
  };

  const handleConfirmAssign = async () => {
    if (!selectedUserId) return;

    setIsProcessing(true);
    try {
      await onAction('assign', selectedUserId);
      handleCloseAssignDialog();
    } catch (error) {
      console.error('Error assigning users:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle status dialog
   */
  const handleOpenStatusDialog = () => {
    setSelectedStatus('Pending');
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const handleConfirmStatus = async () => {
    setIsProcessing(true);
    try {
      await onAction('status', selectedStatus);
      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle priority dialog
   */
  const handleOpenPriorityDialog = () => {
    setSelectedPriority('Medium');
    setPriorityDialogOpen(true);
  };

  const handleClosePriorityDialog = () => {
    setPriorityDialogOpen(false);
  };

  const handleConfirmPriority = async () => {
    setIsProcessing(true);
    try {
      await onAction('priority', selectedPriority);
      handleClosePriorityDialog();
    } catch (error) {
      console.error('Error changing priority:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle export menu
   */
  const handleOpenExportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: string) => {
    setIsProcessing(true);
    try {
      await onAction('export', format);
      handleCloseExportMenu();
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedAlerts.length === 0) return null;

  return (
    <>
      <ActionsContainer elevation={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`${selectedAlerts.length} seleccionadas`}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
          <Typography variant="body2">
            Acciones en lote
          </Typography>
        </Box>

        <ActionsGroup>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAssignDialog}
            disabled={isProcessing}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Asignar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            onClick={handleOpenStatusDialog}
            disabled={isProcessing}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Estado
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PriorityHighIcon />}
            onClick={handleOpenPriorityDialog}
            disabled={isProcessing}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Prioridad
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleOpenExportMenu}
            disabled={isProcessing}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Exportar
          </Button>
          <IconButton
            size="small"
            onClick={onClearSelection}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </ActionsGroup>
      </ActionsContainer>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Asignar a Usuario</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Asignar {selectedAlerts.length} {selectedAlerts.length === 1 ? 'alerta' : 'alertas'} a:
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Usuario</InputLabel>
            <Select
              value={selectedUserId}
              label="Usuario"
              onChange={(e: SelectChangeEvent) => setSelectedUserId(e.target.value)}
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancelar</Button>
          <Button
            onClick={handleConfirmAssign}
            variant="contained"
            disabled={!selectedUserId || isProcessing}
            startIcon={<CheckCircleIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar Estado</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Cambiar estado de {selectedAlerts.length} {selectedAlerts.length === 1 ? 'alerta' : 'alertas'} a:
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={selectedStatus}
              label="Estado"
              onChange={(e: SelectChangeEvent<AlertStatus>) => setSelectedStatus(e.target.value as AlertStatus)}
            >
              <MenuItem value="Pending">Pendiente</MenuItem>
              <MenuItem value="InProgress">En Progreso</MenuItem>
              <MenuItem value="Resolved">Resuelto</MenuItem>
              <MenuItem value="Cancelled">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancelar</Button>
          <Button
            onClick={handleConfirmStatus}
            variant="contained"
            disabled={isProcessing}
            startIcon={<CheckCircleIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Priority Dialog */}
      <Dialog open={priorityDialogOpen} onClose={handleClosePriorityDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar Prioridad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Cambiar prioridad de {selectedAlerts.length} {selectedAlerts.length === 1 ? 'alerta' : 'alertas'} a:
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={selectedPriority}
              label="Prioridad"
              onChange={(e: SelectChangeEvent<AlertSeverity>) => setSelectedPriority(e.target.value as AlertSeverity)}
            >
              <MenuItem value="Critical">Crítico</MenuItem>
              <MenuItem value="High">Alto</MenuItem>
              <MenuItem value="Medium">Medio</MenuItem>
              <MenuItem value="Low">Bajo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePriorityDialog}>Cancelar</Button>
          <Button
            onClick={handleConfirmPriority}
            variant="contained"
            disabled={isProcessing}
            startIcon={<CheckCircleIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleCloseExportMenu}
      >
        <MenuItem onClick={() => handleExport('excel')}>Exportar a Excel</MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>Exportar a PDF</MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>Exportar a CSV</MenuItem>
      </Menu>
    </>
  );
});

BulkActions.displayName = 'BulkActions';

export default BulkActions;
