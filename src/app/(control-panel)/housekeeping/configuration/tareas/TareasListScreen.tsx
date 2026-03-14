/**
 * TareasListScreen
 * TASK-FE-3 - Refactorizado para usar la entidad HousekeepingTarea
 *
 * Pantalla de gestión de Tareas Maestras de Limpieza.
 * Usa los thunks correctos: fetchTareas, createTarea, updateTarea, deleteTarea.
 * Selector: state.housekeeping.tareas / HousekeepingTarea.
 *
 * Estilos: SOLO MUI (sx={}, styled(), Paper, Box, Stack, Chip, Dialog, etc.)
 * Sin Tailwind, sin className con estilos de utilidad.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTareas,
  createTarea,
  updateTarea,
  deleteTarea,
} from '@/store/housekeeping/housekeepingThunks';
import useUser from '@auth/useUser';
import type { HousekeepingTarea } from '@/store/housekeeping/housekeepingTypes';

// ─── TAREA FORM DIALOG ────────────────────────────────────────────

interface TareaFormData {
  nombre: string;
  descripcion: string;
  color: string;
  isActive: boolean;
}

interface TareaFormDialogProps {
  open: boolean;
  tarea: HousekeepingTarea | null;
  onClose: () => void;
  onSave: (data: TareaFormData) => Promise<void>;
  isSaving: boolean;
}

const TAREA_FORM_INITIAL: TareaFormData = {
  nombre: '',
  descripcion: '',
  color: '#1976d2',
  isActive: true,
};

const TareaFormDialog: React.FC<TareaFormDialogProps> = ({
  open,
  tarea,
  onClose,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState<TareaFormData>(TAREA_FORM_INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tarea) {
      setFormData({
        nombre: tarea.nombre,
        descripcion: tarea.descripcion || '',
        color: tarea.color || '#1976d2',
        isActive: tarea.isActive,
      });
    } else {
      setFormData(TAREA_FORM_INITIAL);
    }
    setErrors({});
  }, [tarea, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede superar los 100 caracteres';
    }
    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'Ingrese un color hexadecimal válido (ej. #1976d2)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(formData);
  };

  const handleFieldChange = <K extends keyof TareaFormData>(
    field: K,
    value: TareaFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {tarea ? 'Editar Tarea' : 'Nueva Tarea'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1.5 }}>
          {/* Nombre */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
              Nombre de la tarea <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Box
              component="input"
              type="text"
              placeholder="Ej. Limpieza General"
              value={formData.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('nombre', e.target.value)}
              disabled={isSaving}
              maxLength={100}
              sx={{
                width: '100%',
                height: 40,
                px: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: errors.nombre ? 'error.main' : 'divider',
                bgcolor: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                '&:focus': {
                  borderColor: '#415EDE',
                  boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                },
                '&:hover:not(:focus)': {
                  borderColor: '#415EDE',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                  cursor: 'not-allowed',
                }
              }}
            />
            {errors.nombre && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.nombre}
              </Typography>
            )}
            {!errors.nombre && (
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                Nombre único de la tarea de limpieza
              </Typography>
            )}
          </Box>

          {/* Descripcion */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
              Descripción
            </Typography>
            <Box
              component="textarea"
              placeholder="Descripción opcional de la tarea..."
              value={formData.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('descripcion', e.target.value)}
              disabled={isSaving}
              rows={3}
              sx={{
                width: '100%',
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'white',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                transition: 'all 0.2s',
                display: 'block',
                '&:focus': {
                  borderColor: '#415EDE',
                  boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                },
                '&:hover:not(:focus)': {
                  borderColor: '#415EDE',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                  cursor: 'not-allowed',
                }
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
              Descripción opcional de la tarea
            </Typography>
          </Box>

          {/* Color de tarea */}
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
              Color de tarea (opcional)
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flexGrow: 1, maxWidth: 200 }}>
                <Box
                  component="input"
                  type="text"
                  placeholder="#1976d2"
                  value={formData.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('color', e.target.value)}
                  disabled={isSaving}
                  maxLength={7}
                  sx={{
                    width: '100%',
                    height: 40,
                    px: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: errors.color ? 'error.main' : 'divider',
                    bgcolor: 'white',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    '&:focus': {
                      borderColor: '#415EDE',
                      boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                    },
                    '&:hover:not(:focus)': {
                      borderColor: '#415EDE',
                    }
                  }}
                />
              </Box>
              <Box
                component="input"
                type="color"
                value={formData.color}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange('color', e.target.value)
                }
                disabled={isSaving}
                sx={{
                  width: 40,
                  height: 40,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  padding: '2px',
                  bgcolor: 'white',
                }}
              />
            </Stack>
            {errors.color && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.color}
              </Typography>
            )}
          </Box>

          {/* Estado activo */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                disabled={isSaving}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#415EDE',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#415EDE',
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formData.isActive ? 'Tarea activa' : 'Tarea inactiva'}
              </Typography>
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={18} /> : undefined}
          sx={{
            backgroundColor: "#415EDE",
            color: "white",
          }}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────

const TareasListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';

  // Redux state — tareas maestras de housekeeping
  const tareas = useAppSelector((state) => state.housekeeping.tareas);
  const loading = useAppSelector((state) => state.housekeeping.loading);
  const storeError = useAppSelector((state) => state.housekeeping.error);

  // Local UI state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<HousekeepingTarea | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tareaToDelete, setTareaToDelete] = useState<HousekeepingTarea | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load tareas on mount
  useEffect(() => {
    if (campId) {
      dispatch(fetchTareas({ campId: String(campId) }));
    }
  }, [dispatch, campId]);

  // Handlers
  const handleCreate = () => {
    setSelectedTarea(null);
    setFormDialogOpen(true);
  };

  const handleEdit = useCallback((tarea: HousekeepingTarea) => {
    setSelectedTarea(tarea);
    setFormDialogOpen(true);
  }, []);

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setSelectedTarea(null);
  };

  const handleSave = useCallback(
    async (formData: TareaFormData) => {
      setIsSaving(true);
      try {
        if (selectedTarea) {
          await dispatch(
            updateTarea({
              id: selectedTarea.id,
              nombre: formData.nombre,
              descripcion: formData.descripcion || undefined,
              color: formData.color || undefined,
              isActive: formData.isActive,
            })
          ).unwrap();
          enqueueSnackbar('Tarea actualizada exitosamente', { variant: 'success' });
        } else {
          await dispatch(
            createTarea({
              campId: String(campId),
              nombre: formData.nombre,
              descripcion: formData.descripcion || undefined,
              color: formData.color || undefined,
              isActive: formData.isActive,
            })
          ).unwrap();
          enqueueSnackbar('Tarea creada exitosamente', { variant: 'success' });
        }
        setFormDialogOpen(false);
        setSelectedTarea(null);

        // Ensure the list is reloaded fully from the server
        if (campId) {
          dispatch(fetchTareas({ campId: String(campId) }));
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        enqueueSnackbar(`Error al guardar: ${message}`, { variant: 'error' });
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch, selectedTarea, campId, enqueueSnackbar]
  );

  const handleDeleteOpen = useCallback((tarea: HousekeepingTarea) => {
    setTareaToDelete(tarea);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTareaToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!tareaToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTarea(tareaToDelete.id)).unwrap();
      enqueueSnackbar('Tarea eliminada exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      setTareaToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      enqueueSnackbar(`Error al eliminar: ${message}`, { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Render loading skeleton
  const renderSkeletons = () =>
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1.5 }} />
              <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1.5 }} />
            </CardContent>
          </Card>
        </Grid>
      ));

  // Render empty state
  const renderEmpty = () => (
    <Grid item xs={12}>
      <Paper
        sx={{
          p: 8,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 4,
          bgcolor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}
      >
        <Box
          component="img"
          src="/assets/icons/assignment.png"
          sx={{ width: 80, height: 80, mb: 3, opacity: 0.5, mx: 'auto', display: 'block' }}
        />
        <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
          No hay tareas de limpieza configuradas
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
          Configura las tareas maestras que luego podrás incluir en tus plantillas de checklist.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            backgroundColor: "#415EDE",
            color: "white",
            borderRadius: 2,
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#354db3'
            }
          }}
        >
          Nueva Tarea
        </Button>
      </Paper>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 6,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B', mb: 1 }}>
            Tareas de Limpieza
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de tareas maestras para el sistema de Housekeeping
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={loading}
          sx={{
            backgroundColor: "#415EDE",
            color: "white",
            borderRadius: 2,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(65, 94, 222, 0.4)',
            '&:hover': {
              backgroundColor: '#354db3'
            }
          }}
        >
          Nueva Tarea
        </Button>
      </Box>

        {/* Store error */}
        {storeError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {storeError}
          </Alert>
        )}

        {/* Tareas Grid */}
        <Grid container spacing={3}>
          {loading && tareas.length === 0
            ? renderSkeletons()
            : tareas.length === 0
              ? renderEmpty()
              : tareas.map((tarea) => (
                <Grid item xs={12} sm={6} md={4} key={tarea.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'white',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: '#E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                        borderColor: '#415EDE',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Nombre y estado */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ wordBreak: 'break-word', pr: 1 }}
                        >
                          {tarea.color && (
                            <Box
                              component="span"
                              sx={{
                                width: 14, height: 14, borderRadius: '50%',
                                backgroundColor: tarea.color,
                                border: '1px solid', borderColor: 'divider',
                                flexShrink: 0, display: 'inline-block',
                                mr: 1, verticalAlign: 'middle',
                              }}
                            />
                          )}
                          {tarea.nombre}
                        </Typography>
                        <Chip
                          icon={
                            tarea.isActive ? <CheckCircleIcon /> : <CancelIcon />
                          }
                          label={tarea.isActive ? 'Activa' : 'Inactiva'}
                          color={tarea.isActive ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>

                      {/* Descripcion */}
                      {tarea.descripcion && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {tarea.descripcion}
                        </Typography>
                      )}
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ pt: 0, px: 2, pb: 2, gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<img src="/assets/icons/edit-black.png" alt="Edit" />}
                        onClick={() => handleEdit(tarea)}
                        variant="outlined"
                        fullWidth
                      >
                        Editar
                      </Button>
                      <Tooltip title="Eliminar tarea">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteOpen(tarea)}
                        >
                          <img src="/assets/icons/delete.png" alt="Delete" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>

        {/* Stats footer */}
        {!loading && tareas.length > 0 && (
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de tareas
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight={700}>
                  {tareas.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tareas activas
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight={700}>
                  {tareas.filter((t) => t.isActive).length}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Tarea Form Dialog */}
        <TareaFormDialog
          open={formDialogOpen}
          tarea={selectedTarea}
          onClose={handleFormClose}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle fontWeight={700}>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Eliminar esta tarea?{' '}
              <strong>{tareaToDelete?.nombre}</strong>
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Los templates asociados a esta tarea perderán la referencia.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={18} /> : undefined}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
};

export default TareasListScreen;
