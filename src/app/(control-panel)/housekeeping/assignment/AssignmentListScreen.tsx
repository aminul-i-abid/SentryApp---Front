/**
 * AssignmentListScreen
 *
 * Lists all existing housekeeping assignment groups for the current camp.
 * Allows supervisors to review, inspect (detail modal) and delete assignment groups.
 *
 * Route: /housekeeping/assignments
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import StyledTable, { TableColumnDef } from '@/components/ui/StyledTable';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getAssignmentGroups,
  getAssignmentGroupDetail,
  deleteAssignmentGroup,
} from '@/store/housekeeping/assignmentGroupThunks';
import useUser from '@auth/useUser';
import { Routes } from 'src/utils/routesEnum';
import type {
  AssignmentLevel,
  AssignmentGroupListItem,
  AssignmentGroupDetail,
  RoomOption,
} from '@/store/housekeeping/housekeepingTypes';

// ─── Level display config ─────────────────────────────────────────────────────

const LEVEL_LABELS: Record<AssignmentLevel, string> = {
  camp: 'Campamento',
  block: 'Pabellón',
  rooms: 'Específicas',
};

type LevelChipColor = 'default' | 'primary' | 'secondary';

const LEVEL_COLORS: Record<AssignmentLevel, LevelChipColor> = {
  camp: 'secondary',
  block: 'primary',
  rooms: 'default',
};

// ─── Snackbar state helper ────────────────────────────────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

// ─── Component ────────────────────────────────────────────────────────────────

const AssignmentListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: user } = useUser();

  const campId: string = user?.companyId || '1';

  // Redux state
  const assignmentGroups = useAppSelector(
    (state) => state.housekeeping.assignmentGroups
  );
  const isLoading = useAppSelector(
    (state) => state.housekeeping.assignmentGroupsLoading
  );
  const storeError = useAppSelector(
    (state) => state.housekeeping.assignmentGroupsError
  );

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<AssignmentGroupDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [groupToDelete, setGroupToDelete] = useState<AssignmentGroupListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ─── Load on mount ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!campId) return;
    void dispatch(getAssignmentGroups({ campId }));
  }, [dispatch, campId]);

  // ─── Detail dialog handlers ─────────────────────────────────────────────────

  const handleViewDetail = async (group: AssignmentGroupListItem) => {
    setDetailData(null);
    setDetailError(null);
    setIsLoadingDetail(true);
    setDetailDialogOpen(true);
    try {
      const result = await dispatch(getAssignmentGroupDetail(group.id)).unwrap();
      setDetailData(result);
    } catch {
      setDetailError('No se pudo cargar el detalle de la asignación.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setDetailData(null);
    setDetailError(null);
  };

  // ─── Rooms grouped by block (for detail modal) ──────────────────────────────

  const roomsByBlock = useMemo<Record<string, RoomOption[]>>(() => {
    if (!detailData || detailData.rooms.length === 0) return {};
    return detailData.rooms.reduce<Record<string, RoomOption[]>>((acc, room) => {
      const key = room.blockName || 'Sin pabellón';
      if (!acc[key]) acc[key] = [];
      acc[key].push(room);
      return acc;
    }, {});
  }, [detailData]);

  // ─── Other handlers ─────────────────────────────────────────────────────────

  const handleRefresh = () => {
    void dispatch(getAssignmentGroups({ campId }));
  };

  const handleNavigateToCreate = () => {
    navigate(Routes.HOUSEKEEPING_ASSIGNMENT);
  };

  const handleDeleteClick = (group: AssignmentGroupListItem) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteAssignmentGroup(groupToDelete.id)).unwrap();
      setSnackbar({
        open: true,
        message: 'Asignación eliminada correctamente.',
        severity: 'success',
      });
      void dispatch(getAssignmentGroups({ campId }));
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al eliminar la asignación. Intente nuevamente.',
        severity: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ─── Scope cell: merged target + room count ─────────────────────────────────

  const renderScope = (group: AssignmentGroupListItem) => {
    if (group.level === 'camp') {
      return (
        <Typography variant="body2" color="text.secondary">
          Todo el campamento
        </Typography>
      );
    }
    if (group.level === 'block') {
      return (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {group.blockName ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {group.roomCount} habitación{group.roomCount !== 1 ? 'es' : ''}
          </Typography>
        </Box>
      );
    }
    // rooms
    return (
      <Typography variant="body2">
        {group.roomCount} habitación{group.roomCount !== 1 ? 'es' : ''}
      </Typography>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h1">
            Asignaciones de Operarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestiona los grupos de asignación de operarios a habitaciones.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Recargar lista">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNavigateToCreate}
            sx={{
              backgroundColor: "#415EDE",
              color: "#fff",
              borderRadius: "24px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              px: 3,
              py: 1.5,
              "&:hover": {
                backgroundColor: "#4338ca",
              },
            }}
          >
            New Assignment
          </Button>
        </Box>
      </Box>

      {/* Store error */}
      {storeError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {storeError}
        </Alert>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && assignmentGroups.length === 0 && !storeError && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay asignaciones registradas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea la primera asignación para comenzar a organizar al personal de limpieza.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNavigateToCreate}
            sx={{
              backgroundColor: "#415EDE",
              color: "#fff",
              borderRadius: "24px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              px: 3,
              py: 1.5,
              "&:hover": {
                backgroundColor: "#4338ca",
              },
            }}
          >
            New Assignment
          </Button>
        </Paper>
      )}

      {/* Table */}
      {!isLoading && assignmentGroups.length > 0 && (
        <StyledTable
          loading={isLoading}
          data={assignmentGroups}
          getRowId={(row) => row.id}
          columns={[
            {
              id: 'level',
              label: 'Level',
              render: (row) => (
                <Chip
                  label={LEVEL_LABELS[row.level]}
                  color={LEVEL_COLORS[row.level]}
                  size="small"
                />
              ),
            },
            {
              id: 'scope',
              label: 'Reach',
              render: (row) => renderScope(row),
            },
            {
              id: 'operators',
              label: 'Workers',
              render: (row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {row.operatorNames.slice(0, 3).map((name) => (
                    <Chip key={name} label={name} size="small" variant="outlined" />
                  ))}
                  {row.operatorNames.length > 3 && (
                    <Chip
                      label={`+${row.operatorNames.length - 3} más`}
                      size="small"
                    />
                  )}
                  {row.operatorNames.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Sin operarios
                    </Typography>
                  )}
                </Box>
              ),
            },
            {
              id: 'createdAt',
              label: 'Creation date',
              render: (row) => (
                <Typography variant="body2">
                  {format(new Date(row.createdAt), 'dd/MM/yyyy')}
                </Typography>
              ),
            },
          ]}
          actionsLabel="Actions"
          renderActions={(row) => (
            <>
              <Tooltip title="Ver detalle">
                <IconButton
                  size="small"
                  onClick={() => void handleViewDetail(row)}
                >
                  <VisibilityIcon fontSize="small" sx={{ color: '#415EDE' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar asignación">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(row)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      )}

      {/* ─── Detail dialog ─────────────────────────────────────────────────────── */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleDetailClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {detailData && (
              <Chip
                label={LEVEL_LABELS[detailData.level as AssignmentLevel]}
                color={LEVEL_COLORS[detailData.level as AssignmentLevel]}
                size="small"
              />
            )}
            <Typography variant="h6" component="span">
              Detalle de Asignación
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Loading */}
          {isLoadingDetail && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {detailError && (
            <Alert severity="error">{detailError}</Alert>
          )}

          {/* Content */}
          {detailData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Camp + dates */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Creado el {format(new Date(detailData.createdAt), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Box>

              <Divider />

              {/* Operators section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Operarios ({detailData.operators.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {detailData.operators.map((op) => (
                    <Chip
                      key={op.id}
                      label={op.fullName}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {detailData.operators.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Sin operarios asignados
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Rooms section */}
              {detailData.level === 'camp' && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Alcance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Todas las habitaciones del campamento
                    </Typography>
                  </Box>
                </>
              )}

              {detailData.level !== 'camp' && detailData.rooms.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Habitaciones ({detailData.rooms.length})
                    </Typography>

                    {/* Rooms grouped by block */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {Object.entries(roomsByBlock)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([blockName, rooms]) => (
                          <Box key={blockName}>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color="text.secondary"
                              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                            >
                              Pabellón {blockName} — {rooms.length} hab.
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {rooms
                                .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
                                .map((room) => (
                                  <Chip
                                    key={room.id}
                                    label={room.number}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                  />
                                ))}
                            </Box>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDetailClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete confirmation dialog ─────────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar asignación</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Está seguro de que desea eliminar esta asignación? Esta acción no
            se puede deshacer.
          </Typography>
          {groupToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Nivel: {LEVEL_LABELS[groupToDelete.level]}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Operarios: {groupToDelete.operatorCount}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Habitaciones: {groupToDelete.roomCount}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteConfirm()}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssignmentListScreen;
