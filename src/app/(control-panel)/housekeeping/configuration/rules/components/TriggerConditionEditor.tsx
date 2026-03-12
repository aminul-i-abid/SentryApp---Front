import React from 'react';
import {
  Box,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Typography,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { TriggerType, TriggerCondition } from '../types/ruleConfiguratorTypes';

/**
 * Props for TriggerConditionEditor component
 */
interface TriggerConditionEditorProps {
  triggerType: TriggerType;
  daysInterval?: number;
  onCheckout: boolean;
  onCheckin: boolean;
  onTriggerChange: (trigger: TriggerCondition) => void;
  errors?: Record<string, string>;
}

/**
 * Trigger type configuration
 */
interface TriggerTypeOption {
  type: TriggerType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresInterval: boolean;
}

/**
 * Available trigger types with their configurations
 */
const TRIGGER_TYPES: TriggerTypeOption[] = [
  {
    type: 'manual',
    label: 'Manual',
    description: 'La regla se ejecuta solo cuando se dispara manualmente',
    icon: <ScheduleIcon sx={{ fontSize: 24 }} />,
    requiresInterval: false,
  },
  {
    type: 'checkout',
    label: 'Al Realizar Checkout',
    description: 'La regla se ejecuta automáticamente cuando un huésped realiza checkout',
    icon: <ExitToAppIcon sx={{ fontSize: 24 }} />,
    requiresInterval: false,
  },
  {
    type: 'checkin',
    label: 'Al Realizar Checkin',
    description: 'La regla se ejecuta automáticamente cuando un huésped realiza checkin',
    icon: <LoginIcon sx={{ fontSize: 24 }} />,
    requiresInterval: false,
  },
  {
    type: 'interval',
    label: 'Por Intervalo de Días',
    description: 'La regla se ejecuta periódicamente cada X días especificados',
    icon: <AccessTimeIcon sx={{ fontSize: 24 }} />,
    requiresInterval: true,
  },
];

/**
 * TriggerConditionEditor - Visual editor for trigger conditions
 * Allows selection of trigger type and configuration of trigger parameters
 *
 * @component
 * @example
 * const [trigger, setTrigger] = React.useState({
 *   type: 'checkout',
 *   onCheckout: true,
 *   onCheckin: false,
 * });
 * return (
 *   <TriggerConditionEditor
 *     triggerType={trigger.type}
 *     onCheckout={trigger.onCheckout}
 *     onCheckin={trigger.onCheckin}
 *     onTriggerChange={setTrigger}
 *   />
 * );
 */
const TriggerConditionEditor: React.FC<TriggerConditionEditorProps> = ({
  triggerType,
  daysInterval,
  onCheckout,
  onCheckin,
  onTriggerChange,
  errors = {},
}) => {
  const handleTriggerTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as TriggerType;

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Condición de Activación
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Selecciona cuándo se debe ejecutar automáticamente esta regla de limpieza
      </Typography>

      <RadioGroup
        value={triggerType}
        onChange={handleTriggerTypeChange}
        sx={{ mb: 3 }}
      >
        <Grid container spacing={2}>
          {TRIGGER_TYPES.map((option) => (
            <Grid item xs={12} sm={6} md={3} key={option.type}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: triggerType === option.type ? 'primary.main' : 'divider',
                  backgroundColor:
                    triggerType === option.type ? 'primary.lighter' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 1,
                  },
                }}
              >
                <FormControlLabel
                  value={option.type}
                  control={<Radio />}
                  label={
                    <Box sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex', pt: 0.5 }}>
                          {option.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.label}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          lineHeight: 1.4,
                          mb: 1,
                        }}
                      >
                        {option.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>

      {/* Divider */}
      <Divider sx={{ my: 3 }} />

      {/* Conditional Fields - Days Interval Input */}
      {triggerType === 'interval' && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Configuración del Intervalo
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Días de Intervalo"
                placeholder="7"
                value={daysInterval || 7}
                onChange={handleDaysIntervalChange}
                error={!!errors.daysInterval}
                helperText={
                  errors.daysInterval ||
                  'Intervalo entre 1 y 30 días. La regla se ejecutará cada X días'
                }
                inputProps={{ min: 1, max: 30, step: 1 }}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={8}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'info.lighter',
                  border: '1px solid',
                  borderColor: 'info.light',
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    INFORMACIÓN
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {daysInterval === 1
                      ? 'La regla se ejecutará diariamente'
                      : daysInterval === 7
                        ? 'La regla se ejecutará semanalmente'
                        : `La regla se ejecutará cada ${daysInterval} días`}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Current Selection Summary */}
      {currentTriggerOption && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            CONFIGURACIÓN ACTUAL
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Tipo de Activación:</strong> {currentTriggerOption.label}
          </Typography>
          {triggerType === 'interval' && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Intervalo:</strong> Cada {daysInterval || 7} días
            </Typography>
          )}
          {triggerType === 'checkout' && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Se ejecutará:</strong> Al realizar checkout de habitación
            </Typography>
          )}
          {triggerType === 'checkin' && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Se ejecutará:</strong> Al realizar checkin de huésped
            </Typography>
          )}
          {triggerType === 'manual' && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Se ejecutará:</strong> Solo cuando se dispare manualmente
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TriggerConditionEditor;
