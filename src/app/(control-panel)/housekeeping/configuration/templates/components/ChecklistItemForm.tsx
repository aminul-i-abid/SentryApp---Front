/**
 * ChecklistItemForm Component - Redesigned to match Image 3
 * Card-based layout: Entry Type + Mandatory on top, Description below, actions at bottom
 */

import React, { useMemo } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';

interface ChecklistItemFormProps {
  item: ChecklistItemEditor;
  index: number;
  onItemChange: (fieldName: string, value: any) => void;
  onRemoveItem: () => void;
  onDuplicate: () => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const selectSx = {
  width: '100%',
  height: 40,
  px: 2,
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  bgcolor: 'white',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  color: '#111827',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  pr: 4,
  transition: 'all 0.2s ease',
  '&:focus': {
    borderColor: '#415EDE',
    boxShadow: '0 0 0 3px rgba(65, 94, 222, 0.1)',
  },
};

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
    if (item.isDeleted) {
      return null;
    }

    return (
      <Box
        className="bg-[#F7F7F7] border-1 border-[#F0F0F0]"
        sx={{
          p: 3,
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          bgcolor: 'white',
        }}
      >
        {/* Top row: Entry Type + Mandatory */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>

            <Box className="flex justify-between items-center">
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#000', display: 'block', mb: 0.75 }}>
                Tipo de Entrada
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#000' }}>
                  Obligatorio
                </Typography>
                <Checkbox
                  checked={item.isMandatory}
                  onChange={(e) => onItemChange('isMandatory', e.target.checked)}
                  disabled={disabled}
                  size="small"
                  sx={{
                    color: '#415EDE',
                    '&.Mui-checked': { color: '#415EDE' },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src="./assets/icons/input-short-text.png" alt="" />
              <Box
                component="select"
                value={item.inputType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onItemChange('inputType', e.target.value)}
                disabled={disabled}
                sx={selectSx}
                className='text-[#6B7280]'
              >
                <option value="checkbox">Texto Libre</option>
                <option value="text">Texto Libre</option>
                <option value="number">Número</option>
              </Box>
            </Box>
          </Box>

        </Box>

        {/* Description */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#000' }}>
              Descripción del Ítem
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Máximo 255 caracteres
            </Typography>
          </Box>
          <Box
            component="textarea"
            placeholder="Escribe una descripción..."
            value={item.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onItemChange('description', e.target.value)}
            disabled={disabled}
            maxLength={255}
            rows={3}
            sx={{
              width: '100%',
              minHeight: 80,
              px: 2,
              py: 1.5,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: errors[`item_${index}_description`] ? '#EF4444' : '#E5E7EB',
              bgcolor: 'white',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'vertical',
              color: '#6B7280',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: '#415EDE',
                boxShadow: '0 0 0 3px rgba(65, 94, 222, 0.1)',
              },
              '&::placeholder': { color: '#9CA3AF' },
            }}
          />
          {errors[`item_${index}_description`] && (
            <Typography variant="caption" sx={{ color: '#EF4444', mt: 0.5, display: 'block' }}>
              {errors[`item_${index}_description`]}
            </Typography>
          )}
        </Box>

        {/* Bottom action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Duplicar este ítem">
            <IconButton
              size="medium"
              onClick={onDuplicate}
              disabled={disabled}
              sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', p: 1 }}
            >
              <img src="./assets/icons/clipboard.png" alt="" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar este ítem">
            <IconButton
              size="medium"
              onClick={onRemoveItem}
              disabled={disabled}
              sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', p: 1 }}
            >
              <img src="./assets/icons/delete.png" alt="" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }
);

ChecklistItemForm.displayName = 'ChecklistItemForm';

export default ChecklistItemForm;
