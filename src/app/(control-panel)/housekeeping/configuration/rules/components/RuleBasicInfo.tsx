import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  FormHelperText,
  Switch,
  Typography,
  Stack,
  Paper,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { ChecklistTemplate, JobTagValue } from '@/store/housekeeping/housekeepingTypes';

/**
 * Props for RuleBasicInfo component
 */
interface RuleBasicInfoProps {
  ruleName: string;
  templateId: string;
  priority: number;
  isActive: boolean;
  targetJobTag?: JobTagValue | null;
  availableTemplates: ChecklistTemplate[];
  errors?: Record<string, string>;
  onChange: (field: string, value: unknown) => void;
}

/**
 * RuleBasicInfo - Form component for basic rule information
 * Handles rule name, template selection, priority, and active status
 *
 * @component
 * @example
 * const [rule, setRule] = React.useState({ name: '', templateId: '', priority: 1, isActive: true });
 * const handleChange = (field, value) => setRule({ ...rule, [field]: value });
 * return (
 *   <RuleBasicInfo
 *     ruleName={rule.name}
 *     templateId={rule.templateId}
 *     priority={rule.priority}
 *     isActive={rule.isActive}
 *     availableTemplates={templates}
 *     onChange={handleChange}
 *   />
 * );
 */
const RuleBasicInfo: React.FC<RuleBasicInfoProps> = ({
  ruleName,
  templateId,
  priority,
  isActive,
  targetJobTag = null,
  availableTemplates,
  errors = {},
  onChange,
}) => {
  const selectedTemplate = availableTemplates.find((t) => t.id === templateId);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange('name', event.target.value);
  };

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    onChange('templateId', event.target.value);
  };

  const handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 5) {
      onChange('priority', value);
    }
  };

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange('isActive', event.target.checked);
  };

  const handleJobTagChange = (event: SelectChangeEvent<string>) => {
    const raw = event.target.value;
    onChange('targetJobTag', raw === '' ? null : (raw as JobTagValue));
  };

  return (
    <Box>
      <Grid container spacing={4}>
        {/* Rule Name Field */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
              Nombre de la Regla <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Box
              component="input"
              type="text"
              placeholder="Ej: Limpieza después de checkout"
              value={ruleName}
              onChange={handleNameChange}
              maxLength={100}
              sx={{
                width: '100%',
                height: 48,
                px: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: errors.name ? 'error.main' : '#E5E7EB',
                bgcolor: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus': {
                  borderColor: '#415EDE',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: errors.name ? 'error.main' : '#9CA3AF', mt: 0.5, display: 'block' }}>
              {errors.name || 'Asigne un nombre descriptivo para la regla'}
            </Typography>
          </Box>
        </Grid>

        {/* Priority Field */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
              Prioridad
            </Typography>
            <Box
              component="select"
              value={priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePriorityChange(e as any)}
              sx={{
                width: '100%',
                height: 48,
                px: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: errors.priority ? 'error.main' : '#E5E7EB',
                bgcolor: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '16px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus': {
                  borderColor: '#415EDE',
                },
              }}
            >
              <option value={1}>1 - Muy Baja</option>
              <option value={2}>2 - Baja</option>
              <option value={3}>3 - Media</option>
              <option value={4}>4 - Alta</option>
              <option value={5}>5 - Muy Alta</option>
            </Box>
            <Typography variant="caption" sx={{ color: errors.priority ? 'error.main' : '#9CA3AF', mt: 0.5, display: 'block' }}>
              {errors.priority || 'Prioridad relativa de la regla (1=muy baja, 5=muy alta)'}
            </Typography>
          </Box>
        </Grid>

        {/* Template Selection */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
              Template de Checklist <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <Box
              component="select"
              value={templateId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('templateId', e.target.value)}
              sx={{
                width: '100%',
                height: 48,
                px: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: errors.templateId ? 'error.main' : '#E5E7EB',
                bgcolor: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '16px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus': {
                  borderColor: '#415EDE',
                },
              }}
            >
              <option value="">Seleccionar un template...</option>
              {availableTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.categoryName ? `(${template.categoryName})` : ''}
                </option>
              ))}
            </Box>
            {errors.templateId && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.templateId}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* TargetJobTag Selector */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
              Categoría de Habitación (TAG)
            </Typography>
            <Box
              component="select"
              value={targetJobTag ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const raw = e.target.value;
                onChange('targetJobTag', raw === '' ? null : (raw as JobTagValue));
              }}
              sx={{
                width: '100%',
                height: 48,
                px: 2,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: '#E5E7EB',
                bgcolor: 'white',
                fontSize: '0.9375rem',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '16px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus': {
                  borderColor: '#415EDE',
                },
              }}
            >
              <option value="">Todos (sin filtro)</option>
              <option value="CategoriaA">CategoriaA — Gerente</option>
              <option value="CategoriaB">CategoriaB — Supervisor</option>
              <option value="CategoriaC">CategoriaC — Trabajador</option>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, display: 'block' }}>
              {errors.targetJobTag || 'Define a qué categoría de habitación aplica esta regla'}
            </Typography>
          </Box>
        </Grid>

        {/* Active Status Toggle Container */}
        <Grid item xs={12}>
          <Box
            sx={{
              p: 3,
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: "white",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                Actualización Automática.
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                {isActive
                  ? 'La regla está activa y se aplicará automáticamente.'
                  : 'La regla está inactiva y debe ser aplicada manualmente.'}
              </Typography>
            </Box>
            
            <Switch
              checked={isActive}
              onChange={handleActiveChange}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#415EDE',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#415EDE',
                  opacity: 0.5,
                },
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RuleBasicInfo;
