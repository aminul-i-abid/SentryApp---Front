/**
 * TemplateBasicInfo Component - Redesigned to match Image 2
 */

import React from 'react';
import {
  Box,
  Grid,
  Switch,
  Typography,
} from '@mui/material';

interface TemplateBasicInfoProps {
  template: {
    name: string;
    categoryId: string;
    tagId?: string;
    priority: number;
    isActive: boolean;
  };
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
  categories?: unknown[];
  disabled?: boolean;
}

// Shared input style
const inputSx = (hasError?: boolean) => ({
  width: '100%',
  height: 44,
  px: 2,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: hasError ? '#EF4444' : '#E5E7EB',
  bgcolor: 'white',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  outline: 'none',
  color: '#111827',
  transition: 'all 0.2s ease',
  '&:focus': {
    borderColor: '#415EDE',
    boxShadow: '0 0 0 3px rgba(65, 94, 222, 0.1)',
  },
  '&:hover:not(:focus)': {
    borderColor: '#D1D5DB',
  },
  '&:disabled': {
    bgcolor: '#F9FAFB',
    cursor: 'not-allowed',
    borderColor: '#E5E7EB',
  },
});

const selectSx = (hasError?: boolean) => ({
  ...inputSx(hasError),
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  pr: 4,
});

const TemplateBasicInfo: React.FC<TemplateBasicInfoProps> = ({
  template,
  onChange,
  errors = {},
  disabled = false,
}) => {
  return (
    <Box>
      {/* Section Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
          Información Básica
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Configure los datos principales de la plantilla de verificación
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Template Name */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              Nombre de la Plantilla <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
            </Typography>
            <Box
              component="input"
              type="text"
              placeholder="Ej. Limpieza de Habitación"
              value={template.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('name', e.target.value)}
              disabled={disabled}
              maxLength={100}
              sx={inputSx(!!errors.name)}
            />
            {errors.name ? (
              <Typography variant="caption" sx={{ color: '#EF4444', mt: 0.5, display: 'block' }}>
                {errors.name}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
                Mínimo 3 caracteres, máximo 100
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Priority */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              Prioridad
            </Typography>
            <Box
              component="select"
              value={template.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onChange('priority', parseInt(e.target.value) || 1);
              }}
              disabled={disabled}
              sx={selectSx(!!errors.priority)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                <option key={p} value={p}>
                  {p} - {p <= 3 ? 'Muy Baja' : p <= 5 ? 'Baja' : p <= 7 ? 'Media' : p <= 9 ? 'Alta' : 'Muy Alta'}
                </option>
              ))}
            </Box>
            {errors.priority ? (
              <Typography variant="caption" sx={{ color: '#EF4444', mt: 0.5, display: 'block' }}>
                {errors.priority}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
                Prioridad relativa de la plantilla (1=muy baja, 10=muy alta)
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Template de Checklist (read-only info row for category) */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              Template de Checklist <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
            </Typography>
            <Box
              component="select"
              value={template.categoryId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onChange('categoryId', e.target.value || null);
              }}
              disabled={disabled}
              sx={selectSx()}
            >
              <option value="">Seleccionar template...</option>
            </Box>
          </Box>
        </Grid>

        {/* Room Category (TAG) */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              Categoría de Habitación (TAG)
            </Typography>
            <Box
              component="select"
              value={template.tagId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onChange('tagId', e.target.value || null);
              }}
              disabled={disabled}
              sx={selectSx()}
            >
              <option value="">Todos (sin filtro)</option>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Automatic Update / Active Toggle Section */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          bgcolor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
            Actualización Automática.
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {template.isActive
              ? 'La regla está activa y se aplicará automáticamente.'
              : 'La regla está inactiva. No se aplicará hasta que la actives.'}
          </Typography>
        </Box>
        <Switch
          checked={template.isActive}
          onChange={(e) => onChange('isActive', e.target.checked)}
          disabled={disabled}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#415EDE' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#415EDE' },
          }}
        />
      </Box>

      {/* Auto-save info */}
      {!disabled && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: '8px',
            border: '1px solid #F2F2F2',
            bgcolor: "#415EDE14"
          }}
        >
          <Typography variant="body2" sx={{ color: '#686868', }}>
            <strong className='text-black'>Estado:</strong> Los cambios se guardarán automáticamente en 2 segundos
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TemplateBasicInfo;
