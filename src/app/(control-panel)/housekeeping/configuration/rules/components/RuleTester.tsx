import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { format } from 'date-fns';
import type { CleaningRule, RuleAppliesTo } from '@/store/housekeeping/housekeepingTypes';
import type { RuleTestParams, RuleTestResult } from '../types/ruleConfiguratorTypes';

/**
 * Props for RuleTester component
 */
interface RuleTesterProps {
  rule: CleaningRule | {
    name: string;
    appliesTo: RuleAppliesTo;
    targetIds?: string;
    triggerType: string;
    onCheckout?: boolean;
    onCheckin?: boolean;
  };
  onTest: (params: RuleTestParams) => Promise<RuleTestResult | undefined>;
  isLoading?: boolean;
  testResult?: RuleTestResult | null;
  error?: string | null;
  onTestResultChange?: (result: RuleTestResult | null) => void;
}

/**
 * RuleTester - Real-time rule testing panel
 * Allows testing rule application against specific scenarios
 *
 * @component
 * @example
 * const handleTest = async (params) => {
 *   const result = await testRule(params);
 *   return result;
 * };
 * return (
 *   <RuleTester
 *     rule={myRule}
 *     onTest={handleTest}
 *   />
 * );
 */
const RuleTester: React.FC<RuleTesterProps> = ({
  rule,
  onTest,
  isLoading = false,
  testResult = null,
  error = null,
  onTestResultChange,
}) => {
  const [roomId, setRoomId] = useState('');
  const [testDate, setTestDate] = useState<Date>(new Date());
  const [hasCheckout, setHasCheckout] = useState(false);
  const [hasCheckin, setHasCheckin] = useState(false);
  const [daysSinceLastCleaning, setDaysSinceLastCleaning] = useState('');
  const [daysSinceCheckin, setDaysSinceCheckin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  /**
   * Validate test inputs
   */
  const validateInputs = (): boolean => {
    if (!roomId.trim()) {
      setLocalError('El ID o número de habitación es requerido');
      return false;
    }
    return true;
  };

  /**
   * Handle test execution
   */
  const handleTestExecution = async () => {
    setLocalError(null);

    if (!validateInputs()) {
      return;
    }

    try {
      setLocalLoading(true);

      const testParams: RuleTestParams = {
        roomId: roomId.trim(),
        date: format(testDate, 'yyyy-MM-dd'),
        hasCheckout,
        hasCheckin,
        daysSinceLastCleaning: daysSinceLastCleaning ? parseInt(daysSinceLastCleaning, 10) : undefined,
        daysSinceCheckin: daysSinceCheckin ? parseInt(daysSinceCheckin, 10) : undefined,
      };

      const result = await onTest(testParams);

      if (result) {
        onTestResultChange?.(result);
      } else {
        setLocalError('No se pudo obtener el resultado de la prueba');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al probar la regla';
      setLocalError(errorMessage);
      onTestResultChange?.(null);
    } finally {
      setLocalLoading(false);
    }
  };

  /**
   * Reset test form
   */
  const handleReset = () => {
    setRoomId('');
    setTestDate(new Date());
    setHasCheckout(false);
    setHasCheckin(false);
    setDaysSinceLastCleaning('');
    setDaysSinceCheckin('');
    setLocalError(null);
    onTestResultChange?.(null);
  };

  const displayError = error || localError;
  const isTestLoading = isLoading || localLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={require('date-fns/locale/es').default}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Prueba de Regla
        </Typography>

        {/* Test Input Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlayArrowIcon fontSize="small" />
              Parámetros de Prueba
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Room ID Input */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="ID o Número de Habitación"
                  placeholder="Ej: ROOM-001 o 101"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    setLocalError(null);
                  }}
                  error={!!localError && !roomId}
                  helperText={!!localError && !roomId ? 'Este campo es requerido' : 'ID único o número de habitación'}
                  disabled={isTestLoading}
                  variant="outlined"
                />
              </Grid>

              {/* Test Date Picker */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha de Prueba"
                  value={testDate}
                  onChange={(date) => setTestDate(date || new Date())}
                  disabled={isTestLoading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      variant: 'outlined',
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Scenario Checkboxes */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              ESCENARIOS DE SIMULACIÓN
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasCheckout}
                    onChange={(e) => setHasCheckout(e.target.checked)}
                    disabled={isTestLoading}
                  />
                }
                label="Huésped hace checkout"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasCheckin}
                    onChange={(e) => setHasCheckin(e.target.checked)}
                    disabled={isTestLoading}
                  />
                }
                label="Huésped hace checkin"
              />
            </Stack>

            {/* Advanced Parameters */}
            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              PARÁMETROS AVANZADOS (OPCIONAL)
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Días desde última limpieza"
                  placeholder="Ej: 2"
                  value={daysSinceLastCleaning}
                  onChange={(e) => setDaysSinceLastCleaning(e.target.value)}
                  disabled={isTestLoading}
                  inputProps={{ min: 0, max: 999 }}
                  helperText="Para reglas de intervalo"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Días desde checkin"
                  placeholder="Ej: 3"
                  value={daysSinceCheckin}
                  onChange={(e) => setDaysSinceCheckin(e.target.value)}
                  disabled={isTestLoading}
                  inputProps={{ min: 0, max: 999 }}
                  helperText="Duración de la estancia"
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Error Display */}
            {displayError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {displayError}
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTestExecution}
                disabled={isTestLoading}
                startIcon={isTestLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                size="small"
              >
                {isTestLoading ? 'Probando...' : 'Ejecutar Prueba'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isTestLoading}
                size="small"
              >
                Limpiar
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Test Results Section */}
        {testResult && (
          <Card sx={{ border: `2px solid ${testResult.ruleApplies ? '#4caf50' : '#f44336'}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {testResult.ruleApplies ? (
                  <>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                    Regla Aplica
                  </>
                ) : (
                  <>
                    <CancelIcon sx={{ color: 'error.main' }} />
                    Regla No Aplica
                  </>
                )}
              </Typography>

              {/* Result Status Chip */}
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={testResult.ruleApplies ? 'APLICA' : 'NO APLICA'}
                  color={testResult.ruleApplies ? 'success' : 'error'}
                  variant="filled"
                  size="small"
                />
              </Box>

              {/* Result Reason */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: testResult.ruleApplies ? 'success.lighter' : 'error.lighter',
                  border: '1px solid',
                  borderColor: testResult.ruleApplies ? 'success.light' : 'error.light',
                  mb: 2,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  RAZÓN
                </Typography>
                <Typography variant="body2">{testResult.reason}</Typography>
              </Paper>

              {/* Condition Details */}
              {testResult.details && (
                <>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                    EVALUACIÓN DE CONDICIONES
                  </Typography>

                  <List sx={{ p: 0, mb: 2 }}>
                    {/* Trigger Match */}
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {testResult.details.triggerMatched ? (
                          <CheckCircleIcon sx={{ color: 'success.main' }} />
                        ) : (
                          <CancelIcon sx={{ color: 'error.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Disparador"
                        secondary="El tipo de evento coincide con la regla"
                        primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 500 } }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip
                        label={testResult.details.triggerMatched ? 'Cumple' : 'No cumple'}
                        color={testResult.details.triggerMatched ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>

                    {/* Target Match */}
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {testResult.details.targetMatched ? (
                          <CheckCircleIcon sx={{ color: 'success.main' }} />
                        ) : (
                          <CancelIcon sx={{ color: 'error.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Objetivo"
                        secondary="La habitación está dentro del alcance de la regla"
                        primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 500 } }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip
                        label={testResult.details.targetMatched ? 'Cumple' : 'No cumple'}
                        color={testResult.details.targetMatched ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                  </List>

                  {/* Conditions Met */}
                  {testResult.details.conditionsMet.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main', display: 'block', mb: 1 }}>
                        CONDICIONES CUMPLIDAS
                      </Typography>
                      <Stack spacing={0.5}>
                        {testResult.details.conditionsMet.map((condition, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                            <Typography variant="body2">{condition}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Conditions Not Met */}
                  {testResult.details.conditionsNotMet.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main', display: 'block', mb: 1 }}>
                        CONDICIONES NO CUMPLIDAS
                      </Typography>
                      <Stack spacing={0.5}>
                        {testResult.details.conditionsNotMet.map((condition, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CancelIcon sx={{ color: 'error.main', fontSize: '1rem' }} />
                            <Typography variant="body2">{condition}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </>
              )}

              {/* Impact Metrics */}
              {testResult.ruleApplies && (
                <>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    IMPACTO ESTIMADO
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 1.5,
                          backgroundColor: 'info.lighter',
                          border: '1px solid',
                          borderColor: 'info.light',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                          Habitaciones
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                          {testResult.affectedRooms}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper
                        sx={{
                          p: 1.5,
                          backgroundColor: 'success.lighter',
                          border: '1px solid',
                          borderColor: 'success.light',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                          Tareas
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {testResult.estimatedTasks}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Template Info */}
                  {testResult.templateSelected && (
                    <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TaskAltIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Template que se aplicará
                        </Typography>
                      </Box>
                      <Typography variant="body2">{testResult.templateSelected.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {testResult.templateSelected.items.length} items
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Message when no results */}
        {!testResult && !testResult && (
          <Alert icon={<InfoIcon />} sx={{ mt: 1 }}>
            Ejecuta una prueba para ver si la regla se aplicaría bajo los parámetros especificados.
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default React.memo(RuleTester);
