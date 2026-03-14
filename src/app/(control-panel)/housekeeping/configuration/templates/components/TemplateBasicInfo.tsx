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
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
              Nombre de la Plantilla <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Box
              component="input"
              type="text"
              placeholder="Ej. Limpieza de Habitación"
              value={template.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value)}
              disabled={disabled}
              maxLength={100}
              sx={{
                width: '100%',
                height: 44,
                px: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: errors.name ? 'error.main' : '#E2E8F0',
                bgcolor: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus': {
                  borderColor: '#415EDE',
                  boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
                },
                '&:hover:not(:focus)': {
                  borderColor: '#415EDE',
                },
                '&:disabled': {
                  bgcolor: '#F8FAFC',
                  cursor: 'not-allowed',
                  borderColor: '#E2E8F0',
                }
              }}
            />
            {errors.name && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.name}
              </Typography>
            )}
            {!errors.name && (
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                Mínimo 3 caracteres, máximo 100
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Priority Field */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
              Prioridad
            </Typography>
            <Box
              component="input"
              type="number"
              placeholder="1-10"
              value={template.priority}
              min={1}
              max={10}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                onChange('priority', value);
              }}
              disabled={disabled}
              sx={{
                width: '100%',
                height: 44,
                px: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: errors.priority ? 'error.main' : '#E2E8F0',
                bgcolor: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus': {
                  borderColor: '#415EDE',
                  boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
                },
                '&:hover:not(:focus)': {
                  borderColor: '#415EDE',
                },
                '&:disabled': {
                  bgcolor: '#F8FAFC',
                  cursor: 'not-allowed',
                  borderColor: '#E2E8F0',
                }
              }}
            />
            {errors.priority && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.priority}
              </Typography>
            )}
            {!errors.priority && (
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                Rango: 1 (baja) a 10 (alta)
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Active Status Toggle */}
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              minHeight: 80,
              px: 2.5,
              py: 2,
              border: '1px solid',
              borderColor: '#E2E8F0',
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#415EDE',
              }
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={template.isActive}
                  onChange={(e) => onChange('isActive', e.target.checked)}
                  disabled={disabled}
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
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {template.isActive ? 'Plantilla Activa' : 'Plantilla Inactiva'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.isActive
                      ? 'Disponible para asignar a usuarios'
                      : 'No se puede asignar a nuevas tareas'}
                  </Typography>
                </Box>
              }
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
