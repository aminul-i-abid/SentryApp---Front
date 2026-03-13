/**
 * TemplateBasicInfo Component
 *
 * Form component for editing basic template information
 * - Template name with validation
 * - Priority (1-10 numeric input)
 * - Active status toggle
 *
 * @component
 * @example
 * <TemplateBasicInfo
 *   template={templateData}
 *   onChange={handleChange}
 *   errors={validationErrors}
 * />
 */

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  Divider,
} from '@mui/material';

interface TemplateBasicInfoProps {
  /** Template data object */
  template: {
    name: string;
    categoryId: string;
    tagId?: string;
    priority: number;
    isActive: boolean;
  };
  /** Callback for field changes: (fieldName, value) */
  onChange: (field: string, value: any) => void;
  /** Validation errors map: { fieldName: errorMessage } */
  errors?: Record<string, string>;
  /** Available categories for selection (kept for prop compatibility, not rendered) */
  categories?: unknown[];
  /** Optional disabled state */
  disabled?: boolean;
}

/**
 * TemplateBasicInfo Component
 *
 * Displays and manages basic template information with real-time validation
 * and error display for each field.
 */
const TemplateBasicInfo: React.FC<TemplateBasicInfoProps> = ({
  template,
  onChange,
  errors = {},
  disabled = false,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box mb={2}>
        <Typography variant="h6" component="h2" gutterBottom>
          Información Básica
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Configure los datos principales de la plantilla de verificación
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        {/* Template Name Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre de la Plantilla"
            placeholder="Ej. Limpieza de Habitación"
            value={template.name}
            onChange={(e) => onChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name || 'Mínimo 3 caracteres, máximo 100'}
            disabled={disabled}
            variant="outlined"
            size="medium"
            aria-label="Nombre de la plantilla"
            sx={{
              '& .MuiOutlinedInput-root': { backgroundColor: 'white' }
            }}
            inputProps={{
              maxLength: 100,
              'aria-describedby': 'name-helper',
            }}
          />
        </Grid>

        {/* Priority Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Prioridad"
            type="number"
            placeholder="1-10"
            value={template.priority}
            onChange={(e) => {
              const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
              onChange('priority', value);
            }}
            error={!!errors.priority}
            helperText={errors.priority || 'Rango: 1 (baja) a 10 (alta)'}
            disabled={disabled}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': { backgroundColor: 'white' }
            }}
            inputProps={{
              min: 1,
              max: 10,
              'aria-describedby': 'priority-helper',
            }}
            aria-label="Prioridad de la plantilla"
          />
        </Grid>

        {/* Active Status Toggle */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              minHeight: '56px',
              px: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              backgroundColor: 'white',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={template.isActive}
                  onChange={(e) => onChange('isActive', e.target.checked)}
                  disabled={disabled}
                  aria-label="Activar plantilla"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {template.isActive ? 'Plantilla Activa' : 'Plantilla Inactiva'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {template.isActive
                      ? 'Disponible para asignar a usuarios'
                      : 'No se puede asignar a nuevas tareas'}
                  </Typography>
                </Box>
              }
              slotProps={{
                typography: { component: 'div' },
              }}
            />
          </Box>
        </Grid>

        {/* Summary Info */}
        {!disabled && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'action.hover',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="body2">
                <strong>Estado:</strong> Los cambios se guardarán automáticamente en 2 segundos
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TemplateBasicInfo;
