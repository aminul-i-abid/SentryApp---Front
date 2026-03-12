/**
 * CategoriesListScreen Component
 * Main screen for category CRUD operations
 * FASE 5.3.11 - Housekeeping Configuration
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Paper,
  Stack,
  Skeleton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FolderIcon from '@mui/icons-material/Folder';
import { useSnackbar } from 'notistack';
import useUser from '@auth/useUser';
import apiService from '@/utils/apiService';
import CategoryFormDialog from './CategoryFormDialog';
import type { TaskCategory } from '../templates/types/templateEditorTypes';

/**
 * Extended TaskCategory with template count
 */
interface TaskCategoryWithCount extends TaskCategory {
  templateCount?: number;
}

const CategoriesListScreen: React.FC = () => {
  const { data: user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const campId = user?.companyId || '1';

  // State Management
  const [categories, setCategories] = useState<TaskCategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TaskCategoryWithCount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /**
   * Fetch categories from API
   */
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get(
        `/HousekeepingConfig/TaskCategories?campId=${campId}`
      );

      const data = response.data?.data || response.data || [];
      const categoryList = (Array.isArray(data) ? data : data?.items || []) as TaskCategoryWithCount[];

      setCategories(categoryList);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al cargar las categorías';

      enqueueSnackbar(errorMessage, { variant: 'error' });
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch categories on mount and when campId changes
   */
  useEffect(() => {
    fetchCategories();
  }, [campId]);

  /**
   * Handle create category button click
   */
  const handleCreate = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  /**
   * Handle edit category button click
   */
  const handleEdit = (category: TaskCategoryWithCount) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  /**
   * Handle delete confirmation dialog open
   */
  const handleDeleteOpen = (category: TaskCategoryWithCount) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(true);

      await apiService.delete(`/HousekeepingConfig/DeleteCategory/${categoryToDelete.id}`);

      enqueueSnackbar('Categoría eliminada exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al eliminar la categoría';

      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handle delete cancel
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  /**
   * Handle form save success
   */
  const handleSave = () => {
    setDialogOpen(false);
    fetchCategories();
  };

  /**
   * Render loading skeleton cards
   */
  const renderLoadingSkeleton = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="80%" height={30} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ));
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Grid item xs={12}>
      <Paper
        sx={{
          p: 5,
          textAlign: 'center',
          backgroundColor: '#F5F7FA',
          border: '2px dashed #E0E6ED',
          borderRadius: 2,
        }}
      >
        <FolderIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
          No hay categorías creadas
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
          Comienza creando una nueva categoría para organizar tus plantillas de tareas.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Crear primera categoría
        </Button>
      </Paper>
    </Grid>
  );

  /**
   * Render category cards
   */
  const renderCategoryCards = () => {
    if (isLoading) {
      return renderLoadingSkeleton();
    }

    if (categories.length === 0) {
      return renderEmptyState();
    }

    return categories.map((category) => (
      <Grid item xs={12} sm={6} md={4} key={category.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            {/* Header with status */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1.5,
              }}
            >
              <Typography variant="h6" component="div" sx={{ pr: 1, wordBreak: 'break-word' }}>
                {category.name}
              </Typography>
              <Chip
                icon={category.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                label={category.isActive ? 'Activa' : 'Inactiva'}
                color={category.isActive ? 'success' : 'default'}
                size="small"
                variant="outlined"
                sx={{ ml: 1, flexShrink: 0 }}
              />
            </Box>

            {/* Description */}
            {category.description && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {category.description}
              </Typography>
            )}

            {/* Priority and Template Count */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Prioridad Base
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Box
                        key={`priority-${i}`}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            i < category.basePriority ? 'primary.main' : '#E0E6ED',
                        }}
                      />
                    ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Plantillas
                </Typography>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                  {category.templateCount ?? 0}
                </Typography>
              </Box>
            </Box>

            {/* Category ID (optional, for reference) */}
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                display: 'block',
                fontFamily: 'monospace',
              }}
            >
              ID: {category.id}
            </Typography>
          </CardContent>

          {/* Actions */}
          <CardActions sx={{ pt: 0, gap: 1 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleEdit(category)}
              variant="outlined"
              fullWidth
            >
              Editar
            </Button>
            <IconButton
              size="small"
              onClick={() => handleDeleteOpen(category)}
              color="error"
              sx={{ p: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Categorías de Tareas
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Gestiona las categorías de tareas para tus plantillas de limpieza
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoading}
          sx={{ mb: 2 }}
        >
          Crear Categoría
        </Button>
      </Box>

      {/* Loading State */}
      {isLoading && categories.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {renderCategoryCards()}
      </Grid>

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        category={selectedCategory}
        campId={campId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ py: 2 }}>
            ¿Está seguro que desea eliminar la categoría <strong>{categoryToDelete?.name}</strong>?
            {categoryToDelete?.templateCount && categoryToDelete.templateCount > 0 && (
              <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#FFF3CD', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#856404' }}>
                  Advertencia: Esta categoría tiene{' '}
                  <strong>{categoryToDelete.templateCount} plantilla(s)</strong> asociada(s).
                  Considere reasignarlas a otra categoría antes de eliminar.
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
            disabled={deleteLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats Footer (optional) */}
      {!isLoading && categories.length > 0 && (
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E0E6ED' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total de categorías
              </Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {categories.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Categorías activas
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                {categories.filter((c) => c.isActive).length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total de plantillas
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {categories.reduce((sum, cat) => sum + (cat.templateCount ?? 0), 0)}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default CategoriesListScreen;
