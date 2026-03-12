/**
 * CategoryFormDialog Component
 * Dialog for creating/editing task categories
 * FASE 5.3.11 - Housekeeping Configuration
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import apiService from '@/utils/apiService';
import type { TaskCategory } from '../templates/types/templateEditorTypes';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: TaskCategory;
  campId: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  basePriority?: string;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  onSave,
  category,
  campId,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePriority: 3,
    isActive: true,
  });

  // Load category data when editing
  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        basePriority: category.basePriority || 3,
        isActive: category.isActive ?? true,
      });
      setValidationErrors({});
    } else if (open) {
      // Reset form when adding new category
      setFormData({
        name: '',
        description: '',
        basePriority: 3,
        isActive: true,
      });
      setValidationErrors({});
    }
  }, [category, open]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'El nombre no puede exceder 50 caracteres';
    }

    // Validate description
    if (formData.description && formData.description.trim().length > 200) {
      errors.description = 'La descripción no puede exceder 200 caracteres';
    }

    // Validate basePriority
    const priority = Number(formData.basePriority);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      errors.basePriority = 'La prioridad debe ser un número entre 1 y 5';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form field changes
   */
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (validationErrors[field as keyof FormErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        basePriority: Number(formData.basePriority),
        isActive: formData.isActive,
        campId,
      };

      if (category) {
        // Update existing category
        await apiService.put(
          `/HousekeepingConfig/UpdateCategory/${category.id}`,
          payload
        );
        enqueueSnackbar('Categoría actualizada exitosamente', {
          variant: 'success',
        });
      } else {
        // Create new category
        await apiService.post('/HousekeepingConfig/CreateCategory', payload);
        enqueueSnackbar('Categoría creada exitosamente', {
          variant: 'success',
        });
      }

      handleClose();
      onSave();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        (category
          ? 'Error al actualizar la categoría'
          : 'Error al crear la categoría');

      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      basePriority: 3,
      isActive: true,
    });
    setValidationErrors({});
    onClose();
  };

  /**
   * Get button text based on mode
   */
  const getButtonText = () => {
    if (loading) {
      return category ? 'Actualizando...' : 'Creando...';
    }
    return category ? 'Actualizar' : 'Crear';
  };

  /**
   * Check if form is valid for submission
   */
  const isFormValid = formData.name.trim().length >= 3 && !loading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
        {category ? 'Editar categoría' : 'Crear nueva categoría'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Name Field */}
          <Box>
            <TextField
              fullWidth
              label="Nombre de la categoría"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Limpieza de habitaciones"
              error={Boolean(validationErrors.name)}
              helperText={validationErrors.name}
              inputProps={{
                maxLength: 50,
              }}
              disabled={loading}
              size="small"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {formData.name.length}/50 caracteres
            </Typography>
          </Box>

          {/* Description Field */}
          <Box>
            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción de la categoría"
              error={Boolean(validationErrors.description)}
              helperText={validationErrors.description}
              multiline
              rows={3}
              inputProps={{
                maxLength: 200,
              }}
              disabled={loading}
              size="small"
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {formData.description.length}/200 caracteres
            </Typography>
          </Box>

          {/* Base Priority Field */}
          <Box>
            <TextField
              fullWidth
              label="Prioridad base"
              type="number"
              value={formData.basePriority}
              onChange={(e) => handleChange('basePriority', parseInt(e.target.value, 10))}
              error={Boolean(validationErrors.basePriority)}
              helperText={validationErrors.basePriority || 'Rango: 1-5 (1=Mínima, 5=Máxima)'}
              inputProps={{
                min: 1,
                max: 5,
              }}
              disabled={loading}
              size="small"
            />
          </Box>

          {/* Is Active Switch */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">Estado</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  disabled={loading}
                  size="small"
                />
              }
              label={formData.isActive ? 'Activa' : 'Inactiva'}
              sx={{ ml: 2 }}
            />
          </Box>

          {/* Info Alert */}
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            {category ? (
              <>
                Estás editando la categoría <strong>{category.name}</strong>. Los cambios se aplicarán
                a todas las plantillas asociadas.
              </>
            ) : (
              <>
                Se creará una nueva categoría con la prioridad base especificada. Las plantillas pueden
                tener prioridades individuales.
              </>
            )}
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          sx={{ flex: 1, mr: 2, bgcolor: '#F5F7FA' }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
          disabled={!isFormValid}
        >
          {getButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;
