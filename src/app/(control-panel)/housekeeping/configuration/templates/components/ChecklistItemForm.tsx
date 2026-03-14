/**
 * ChecklistItemForm Component
 *
 * Form component for editing a single checklist item within a template
 * - Item description with validation
 * - Input type selection (checkbox, text, number)
 * - Mandatory flag toggle
 * - Drag handle for reordering
 * - Action buttons (duplicate, delete)
 * - Real-time validation errors
 *
 * @component
 * @example
 * <ChecklistItemForm
 *   item={checklistItem}
 *   index={0}
 *   onItemChange={handleChange}
 *   onRemoveItem={handleRemove}
 *   onDuplicate={handleDuplicate}
 *   errors={validationErrors}
 * />
 */

import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';

interface ChecklistItemFormProps {
  /** The checklist item data */
  item: ChecklistItemEditor;
  /** Index of the item in the list */
  index: number;
  /** Callback for item field changes: (fieldName, value) */
  onItemChange: (fieldName: string, value: any) => void;
  /** Callback when item is deleted */
  onRemoveItem: () => void;
  /** Callback to duplicate the item */
  onDuplicate: () => void;
  /** Validation errors map for this item */
  errors?: Record<string, string>;
  /** Optional disabled state */
  disabled?: boolean;
}

/**
 * ChecklistItemForm Component
 *
 * Displays a form for editing a single checklist item.
 * Memoized for performance to prevent unnecessary re-renders
 * when sibling items change.
 */
const ChecklistItemForm = React.memo<ChecklistItemFormProps>(
  ({
    item,
    index,
    onItemChange,
    onRemoveItem,
    onDuplicate,
    errors = {},
    disabled = false,
  }) => {
    // Determine visual status based on item state
    const itemStatus = useMemo(() => {
      if (item.isDeleted) return 'deleted';
      if (item.isNew) return 'new';
      if (item.isModified) return 'modified';
      return 'saved';
    }, [item.isDeleted, item.isNew, item.isModified]);

    // Get status badge color
    const statusColor = useMemo(() => {
      switch (itemStatus) {
        case 'new':
          return 'success';
        case 'modified':
          return 'warning';
        case 'deleted':
          return 'error';
        default:
          return 'default';
      }
    }, [itemStatus]);

    // Get status label
    const statusLabel = useMemo(() => {
      switch (itemStatus) {
        case 'new':
          return 'Nuevo';
        case 'modified':
          return 'Modificado';
        case 'deleted':
          return 'Eliminado';
        default:
          return '';
      }
    }, [itemStatus]);

    if (item.isDeleted) {
      return (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            opacity: 0.5,
            backgroundColor: 'action.disabledBackground',
            border: '1px dashed',
            borderColor: 'error.light',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <DragIndicatorIcon sx={{ color: 'action.disabled' }} />
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'textSecondary' }}
              >
                {item.description || '(Elemento vacío)'}
              </Typography>
            </Box>
            <Chip label="Marcado para eliminar" size="small" color="error" />
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        sx={{
          p: 2,
          mb: 2,
          border: itemStatus !== 'saved' ? '1px solid' : '1px solid',
          borderColor:
            itemStatus === 'new'
              ? 'success.light'
              : itemStatus === 'modified'
                ? 'warning.light'
                : 'divider',
          backgroundColor:
            itemStatus === 'new'
              ? 'success.lighter'
              : itemStatus === 'modified'
                ? 'warning.lighter'
                : 'background.paper',
        }}
      >
        {/* Header with index and status */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mb={2}
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Arrastra para reordenar">
              <DragIndicatorIcon
                sx={{
                  cursor: 'grab',
                  color: 'action.active',
                  '&:active': { cursor: 'grabbing' },
                }}
              />
            </Tooltip>
            <Typography variant="subtitle2" fontWeight={600} sx={{ minWidth: '30px' }}>
              #{index + 1}
            </Typography>
            {statusLabel && (
              <Chip
                label={statusLabel}
                size="small"
                color={statusColor as any}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Form Fields Grid */}
        <Grid container spacing={2}>
          {/* Description Field */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
                Descripción del Ítem
              </Typography>
              <Box
                component="textarea"
                placeholder="Ej. Cambiar sábanas"
                value={item.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onItemChange('description', e.target.value)}
                disabled={disabled}
                maxLength={255}
                sx={{
                  width: '100%',
                  minHeight: 80,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: errors[`item_${index}_description`] ? 'error.main' : '#E2E8F0',
                  bgcolor: 'white',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
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
                  }
                }}
              />
              {errors[`item_${index}_description`] && (
                <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
                  {errors[`item_${index}_description`]}
                </Typography>
              )}
              {!errors[`item_${index}_description`] && (
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                  Máximo 255 caracteres
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Input Type Selection */}
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, color: 'text.secondary' }}>
                Tipo de Entrada
              </Typography>
              <Box
                component="select"
                value={item.inputType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onItemChange('inputType', e.target.value as any)}
                disabled={disabled}
                sx={{
                  width: '100%',
                  height: 44,
                  px: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: 'white',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px',
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
                  }
                }}
              >
                <option value="checkbox">☑ Casilla de verificación</option>
                <option value="text">✎ Texto libre</option>
                <option value="number"># Número</option>
              </Box>
            </Box>
          </Grid>

          {/* Mandatory Checkbox */}
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                minHeight: '56px',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.isMandatory}
                    onChange={(e) =>
                      onItemChange('isMandatory', e.target.checked)
                    }
                    disabled={disabled}
                    aria-label={`Ítem obligatorio ${index + 1}`}
                    sx={{
                      "& .MuiSvgIcon-root": {
                        color: "#415EDE"
                      }
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Obligatorio
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>

          {/* Action Buttons Row */}
          <Grid item xs={12}>
            <Box
              display="flex"
              gap={1}
              justifyContent="flex-end"
              alignItems="center"
            >
              {item.isMandatory && (
                <Chip
                  label="Requerido"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title="Duplicar este ítem">
                <span>
                  <IconButton
                    size="small"
                    onClick={onDuplicate}
                    disabled={disabled}
                    aria-label={`Duplicar ítem ${index + 1}`}
                    color="primary"
                  >
                    <FileCopyIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Eliminar este ítem">
                <span>
                  <IconButton
                    size="small"
                    onClick={onRemoveItem}
                    disabled={disabled}
                    aria-label={`Eliminar ítem ${index + 1}`}
                    color="error"
                  >
                    <img src="./assets/icons/delete.png" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }
);

ChecklistItemForm.displayName = 'ChecklistItemForm';

export default ChecklistItemForm;
