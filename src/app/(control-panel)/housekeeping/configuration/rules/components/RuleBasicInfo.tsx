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
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Información Básica de la Regla
      </Typography>

      <Grid container spacing={3}>
        {/* Rule Name Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre de la Regla"
            placeholder="Ej: Limpieza después de checkout"
            value={ruleName}
            onChange={handleNameChange}
            error={!!errors.name}
            helperText={errors.name || 'Asigne un nombre descriptivo para la regla'}
            inputProps={{ maxLength: 100 }}
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* Priority Field */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Prioridad"
            placeholder="1-5"
            value={priority}
            onChange={handlePriorityChange}
            error={!!errors.priority}
            helperText={
              errors.priority ||
              'Prioridad relativa de la regla (1=muy baja, 5=muy alta)'
            }
            inputProps={{ min: 1, max: 5, pattern: '[1-5]' }}
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* Template Selection */}
        <Grid item xs={12} md={8}>
          <FormControl fullWidth size="small" error={!!errors.templateId}>
            <InputLabel id="template-select-label">Template de Checklist</InputLabel>
            <Select
              labelId="template-select-label"
              id="template-select"
              value={templateId}
              onChange={handleTemplateChange}
              label="Template de Checklist"
            >
              <MenuItem value="">
                <em>Seleccionar un template...</em>
              </MenuItem>
              {availableTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">{template.name}</Typography>
                    {template.categoryName && (
                      <Chip
                        label={template.categoryName}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {errors.templateId && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                {errors.templateId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Template Description */}
        {selectedTemplate && (
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.light',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                TEMPLATE SELECCIONADO
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
                {selectedTemplate.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={`${selectedTemplate.items.length} items`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Prioridad: ${selectedTemplate.priority}`}
                  size="small"
                  variant="outlined"
                  color={selectedTemplate.priority >= 4 ? 'error' : 'default'}
                />
                {selectedTemplate.isActive && (
                  <Chip label="Activo" size="small" color="success" />
                )}
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* TargetJobTag Selector */}
        <Grid item xs={12} md={8}>
          <FormControl fullWidth size="small" error={!!errors.targetJobTag}>
            <InputLabel id="target-job-tag-label">Categoría de Habitación (TAG)</InputLabel>
            <Select
              labelId="target-job-tag-label"
              id="target-job-tag-select"
              value={targetJobTag ?? ''}
              onChange={handleJobTagChange}
              label="Categoría de Habitación (TAG)"
            >
              <MenuItem value="">Todos (sin filtro)</MenuItem>
              <MenuItem value="CategoriaA">CategoriaA — Gerente</MenuItem>
              <MenuItem value="CategoriaB">CategoriaB — Supervisor</MenuItem>
              <MenuItem value="CategoriaC">CategoriaC — Trabajador</MenuItem>
            </Select>
            <FormHelperText>
              {errors.targetJobTag || 'Define a qué categoría de habitación aplica esta regla'}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Active Status Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={handleActiveChange}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Regla Activa
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {isActive
                    ? 'La regla está activa y se aplicará automáticamente'
                    : 'La regla está inactiva. Puedes activarla cuando esté lista'}
                </Typography>
              </Box>
            }
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: isActive ? 'success.lighter' : 'warning.lighter',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RuleBasicInfo;
