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
            <TextField
              fullWidth
              label="Descripción del Ítem"
              placeholder="Ej. Cambiar sábanas"
              multiline
              minRows={2}
              maxRows={4}
              value={item.description}
              onChange={(e) => onItemChange('description', e.target.value)}
              error={!!errors[`item_${index}_description`]}
              helperText={
                errors[`item_${index}_description`] ||
                'Máximo 255 caracteres'
              }
              disabled={disabled}
              variant="outlined"
              inputProps={{
                maxLength: 255,
                'aria-describedby': `description-${index}-helper`,
              }}
              aria-label={`Descripción del ítem ${index + 1}`}
              sx={{
                '& .MuiOutlinedInput-root': { backgroundColor: 'white' }
              }}
            />
          </Grid>

          {/* Input Type Selection */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth disabled={disabled}>
              <InputLabel id={`input-type-${index}-label`}>Tipo de Entrada</InputLabel>
              <Select
                labelId={`input-type-${index}-label`}
                value={item.inputType}
                label="Tipo de Entrada"
                onChange={(e) =>
                  onItemChange('inputType', e.target.value as any)
                }
                aria-label={`Tipo de entrada del ítem ${index + 1}`}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    backgroundColor: 'transparent',
                  },
                  '& .MuiSelect-select': {
                    backgroundColor: 'white',
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: 'white !important' }
                  }
                }}
              >
                <MenuItem value="checkbox">
                  <Box display="flex" alignItems="center" gap={1}>
                    ☑ Casilla de verificación
                  </Box>
                </MenuItem>
                <MenuItem value="text">
                  <Box display="flex" alignItems="center" gap={1}>
                    ✎ Texto libre
                  </Box>
                </MenuItem>
                <MenuItem value="number">
                  <Box display="flex" alignItems="center" gap={1}>
                    # Número
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
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
