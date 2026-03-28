import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import CloudQueueOutlinedIcon from '@mui/icons-material/CloudQueueOutlined';

import type { TriggerType, TriggerCondition } from '../types/ruleConfiguratorTypes';

interface TriggerConditionEditorProps {
  triggerType: TriggerType;
  daysInterval?: number;
  onCheckout: boolean;
  onCheckin: boolean;
  onTriggerChange: (trigger: TriggerCondition) => void;
  errors?: Record<string, string>;
}

interface TriggerTypeOption {
  type: TriggerType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresInterval: boolean;
  summaryText: string;
}

const TRIGGER_TYPES: TriggerTypeOption[] = [
  {
    type: 'manual',
    label: 'Manual.',
    description: 'Selecciona esto cuando la regla de limpieza deba ejecutarse de forma manual.',
    icon: <img src="./assets/icons/time-quarter.png" alt="" />,
    requiresInterval: false,
    summaryText: 'Se ejecutará solo cuando se dispare manualmente.',
  },
  {
    type: 'checkout',
    label: 'Al Realizar Checkout.',
    description: 'La regla se ejecuta automáticamente cuando un huésped realiza el checkout.',
    icon: <img src="./assets/icons/shopping-basket-check-in-03.png" alt="" />,
    requiresInterval: false,
    summaryText: 'Al realizar checkout del huésped.',
  },
  {
    type: 'checkin',
    label: 'Al Realizar Checkin.',
    description: 'La regla se ejecuta automáticamente cuando un huésped realiza checkin.',
    icon: <img src="./assets/icons/shopping-basket-check-out-03.png" alt="" />,
    requiresInterval: false,
    summaryText: 'Al realizar check-in del huésped.',
  },
  {
    type: 'interval',
    label: 'Por Intervalo de Días.',
    description: 'La regla se ejecuta periódicamente cada X días especificados.',
    icon: <img src="./assets/icons/sun-cloud-01.png" alt="" />,
    requiresInterval: true,
    summaryText: 'Periódicamente según el intervalo.',
  },
];

const TriggerConditionEditor: React.FC<TriggerConditionEditorProps> = ({
  triggerType,
  daysInterval,
  onTriggerChange,
  errors = {},
}) => {
  const handleTriggerTypeChange = (newType: TriggerType) => {
    const newTrigger: TriggerCondition = {
      type: newType,
      onCheckout: newType === 'checkout',
      onCheckin: newType === 'checkin',
      ...(newType === 'interval' && { daysInterval: daysInterval || 7 }),
    };
    onTriggerChange(newTrigger);
  };

  const handleDaysIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 30) {
      onTriggerChange({
        type: 'interval',
        daysInterval: value,
        onCheckout: false,
        onCheckin: false,
      });
    }
  };

  const currentTriggerOption = TRIGGER_TYPES.find((t) => t.type === triggerType);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
          Condición de Activación.
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Selecciona cuándo se debe ejecutar automáticamente esta regla de limpieza.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'stretch' }}>

        {/* Left Side: Cards */}
        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(auto-fit, minmax(200px, 1fr))' }, gap: 1 }}>
          {TRIGGER_TYPES.map((option) => {
            const isSelected = triggerType === option.type;
            return (
              <Box
                key={option.type}
                onClick={() => handleTriggerTypeChange(option.type)}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: isSelected ? '#415EDE' : '#E5E7EB',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0px 0px 0px 1px #415EDE' : 'none',
                  '&:hover': {
                    borderColor: '#415EDE',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{
                    color: isSelected ? '#415EDE' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {option.icon}
                  </Box>
                  {isSelected ? (
                    <RadioButtonCheckedIcon sx={{ color: '#415EDE', fontSize: 20 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: '#D1D5DB', fontSize: 20 }} />
                  )}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                  {option.label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#686868', lineHeight: 1.4 }}>
                  {option.description}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Right Side: Current Configuration Card */}
        <Box sx={{
          width: {
            xs: '100%',
            lg: '450px'
          }
        }}>
          <Box
            sx={{
              p: 3,
              borderRadius: '12px',
              bgcolor: 'white',
              border: '1px solid #E5E7EB',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#415EDE' }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#415EDE' }}>
                Configuración Actual
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#111827', display: 'block', mb: 0.5, fontSize: '13px' }}>
                  Tipo de Activación
                </Typography>
                <Typography variant="body2" sx={{ color: '#686868' }}>
                  {currentTriggerOption?.label?.replace('.', '') || 'Manual'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#111827', display: 'block', mb: 0.5, fontSize: '13px' }}>
                  Se ejecutará
                </Typography>
                <Typography variant="body2" sx={{ color: '#686868' }}>
                  {currentTriggerOption?.summaryText}
                </Typography>
              </Box>
            </Box>

            {triggerType === 'interval' && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #E5E7EB' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#374151' }}>
                  Días de Intervalo
                </Typography>
                <Box
                  component="input"
                  type="number"
                  placeholder="7"
                  value={daysInterval || 7}
                  min={1}
                  max={30}
                  onChange={handleDaysIntervalChange}
                  sx={{
                    width: '100%',
                    height: 48,
                    px: 2,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.daysInterval ? 'error.main' : '#E5E7EB',
                    bgcolor: 'white',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:focus': {
                      borderColor: '#415EDE',
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: errors.daysInterval ? 'error.main' : '#9CA3AF', mt: 0.5, display: 'block' }}>
                  {errors.daysInterval || 'La regla se ejecutará cada X días'}
                </Typography>
              </Box>
            )}

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TriggerConditionEditor;
