'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Stack,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExitToApp as ExitToAppIcon,
  EventNote as EventNoteIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  CleaningServices as CleaningServicesIcon,
  Restaurant as RestaurantIcon,
  LocalLaundryService as LaundryIcon,
} from '@mui/icons-material';
import type { Discrepancy } from '../../types/dashboardTypes';
import { useCorrectiveActions } from '../hooks/useCorrectiveActions';

interface CorrectiveAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  icon: string;
  color: string;
  autoExecutable: boolean;
  category: string;
}

interface CorrectiveActionsSuggesterProps {
  discrepancy: Discrepancy | null;
  onActionExecute?: (actionId: string, discrepancyId: string) => Promise<void>;
}

const CorrectiveActionsSuggester: React.FC<CorrectiveActionsSuggesterProps> = ({
  discrepancy,
  onActionExecute,
}) => {
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [actionErrors, setActionErrors] = useState<Map<string, string>>(new Map());

  const { executeAction, isExecuting } = useCorrectiveActions();

  // Icon mapping
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Search: <SearchIcon />,
      ExitToApp: <ExitToAppIcon />,
      EventNote: <EventNoteIcon />,
      Notification: <NotificationsIcon />,
      Refresh: <RefreshIcon />,
      CheckCircle: <CheckCircleIcon />,
      Assignment: <AssignmentIcon />,
      Phone: <PhoneIcon />,
      Lock: <LockIcon />,
      CleaningServices: <CleaningServicesIcon />,
      Restaurant: <RestaurantIcon />,
      Laundry: <LaundryIcon />,
      Info: <InfoIcon />,
    };
    return icons[iconName] || <InfoIcon />;
  };

  // Get suggested actions based on discrepancy type
  const suggestedActions = useMemo<CorrectiveAction[]>(() => {
    if (!discrepancy) return [];

    switch (discrepancy.discrepancyType.toLowerCase()) {
      case 'skip':
        return [
          {
            id: 'check_room',
            type: 'inspection',
            title: 'Verificar Habitación Físicamente',
            description: 'Enviar personal para verificar el estado real de la habitación marcada como saltada',
            priority: 'high',
            estimatedTime: '10-15 min',
            icon: 'Search',
            color: '#FF6B6B',
            autoExecutable: false,
            category: 'Inspección',
          },
          {
            id: 'verify_checkout',
            type: 'verification',
            title: 'Verificar Check-out',
            description: 'Confirmar si el huésped realizó check-out y actualizar el sistema',
            priority: 'high',
            estimatedTime: '5 min',
            icon: 'ExitToApp',
            color: '#4ECDC4',
            autoExecutable: true,
            category: 'Verificación',
          },
          {
            id: 'update_pms',
            type: 'system',
            title: 'Actualizar Estado en PMS',
            description: 'Sincronizar el estado de la habitación con el sistema de gestión',
            priority: 'medium',
            estimatedTime: '2 min',
            icon: 'Refresh',
            color: '#95E1D3',
            autoExecutable: true,
            category: 'Sistema',
          },
          {
            id: 'notify_supervisor',
            type: 'communication',
            title: 'Notificar al Supervisor',
            description: 'Alertar al supervisor de housekeeping sobre la discrepancia',
            priority: 'medium',
            estimatedTime: '1 min',
            icon: 'Notification',
            color: '#F38181',
            autoExecutable: true,
            category: 'Comunicación',
          },
        ];

      case 'sleep':
        return [
          {
            id: 'verify_reservation',
            type: 'verification',
            title: 'Verificar Reservación',
            description: 'Revisar el estado de la reservación y confirmar la ocupación',
            priority: 'high',
            estimatedTime: '5 min',
            icon: 'EventNote',
            color: '#FF6B6B',
            autoExecutable: true,
            category: 'Verificación',
          },
          {
            id: 'notify_guest',
            type: 'communication',
            title: 'Contactar Huésped',
            description: 'Llamar o enviar mensaje al huésped para confirmar su estancia',
            priority: 'high',
            estimatedTime: '10 min',
            icon: 'Phone',
            color: '#4ECDC4',
            autoExecutable: false,
            category: 'Comunicación',
          },
          {
            id: 'check_room_status',
            type: 'inspection',
            title: 'Verificar Estado de Habitación',
            description: 'Inspección física para confirmar si la habitación está ocupada',
            priority: 'high',
            estimatedTime: '10 min',
            icon: 'Search',
            color: '#95E1D3',
            autoExecutable: false,
            category: 'Inspección',
          },
          {
            id: 'update_occupancy',
            type: 'system',
            title: 'Actualizar Ocupación',
            description: 'Ajustar el estado de ocupación en el sistema',
            priority: 'medium',
            estimatedTime: '2 min',
            icon: 'Refresh',
            color: '#F38181',
            autoExecutable: true,
            category: 'Sistema',
          },
          {
            id: 'review_checkout_time',
            type: 'verification',
            title: 'Revisar Hora de Check-out',
            description: 'Verificar si el check-out está programado correctamente',
            priority: 'low',
            estimatedTime: '3 min',
            icon: 'ExitToApp',
            color: '#AA96DA',
            autoExecutable: true,
            category: 'Verificación',
          },
        ];

      case 'count':
        return [
          {
            id: 'recount_items',
            type: 'inspection',
            title: 'Re-contar Items',
            description: 'Realizar un nuevo recuento de los items en la habitación',
            priority: 'high',
            estimatedTime: '15 min',
            icon: 'Assignment',
            color: '#FF6B6B',
            autoExecutable: false,
            category: 'Inspección',
          },
          {
            id: 'verify_inventory',
            type: 'verification',
            title: 'Verificar Inventario',
            description: 'Cruzar el conteo con el inventario del sistema',
            priority: 'high',
            estimatedTime: '10 min',
            icon: 'CheckCircle',
            color: '#4ECDC4',
            autoExecutable: true,
            category: 'Verificación',
          },
          {
            id: 'check_minibar',
            type: 'inspection',
            title: 'Revisar Minibar',
            description: 'Verificar el consumo del minibar si aplica',
            priority: 'medium',
            estimatedTime: '5 min',
            icon: 'Restaurant',
            color: '#95E1D3',
            autoExecutable: false,
            category: 'Inspección',
          },
          {
            id: 'verify_laundry',
            type: 'inspection',
            title: 'Verificar Lavandería',
            description: 'Confirmar el conteo de toallas y ropa de cama',
            priority: 'medium',
            estimatedTime: '8 min',
            icon: 'Laundry',
            color: '#F38181',
            autoExecutable: false,
            category: 'Inspección',
          },
          {
            id: 'update_count_system',
            type: 'system',
            title: 'Actualizar Conteo en Sistema',
            description: 'Registrar el conteo correcto en el sistema',
            priority: 'medium',
            estimatedTime: '3 min',
            icon: 'Refresh',
            color: '#AA96DA',
            autoExecutable: true,
            category: 'Sistema',
          },
          {
            id: 'notify_housekeeping',
            type: 'communication',
            title: 'Notificar a Housekeeping',
            description: 'Informar al equipo sobre la necesidad de reponer items',
            priority: 'low',
            estimatedTime: '2 min',
            icon: 'CleaningServices',
            color: '#FCBAD3',
            autoExecutable: true,
            category: 'Comunicación',
          },
        ];

      default:
        return [
          {
            id: 'investigate',
            type: 'inspection',
            title: 'Investigar Discrepancia',
            description: 'Realizar una investigación completa de la discrepancia',
            priority: 'high',
            estimatedTime: '20 min',
            icon: 'Search',
            color: '#FF6B6B',
            autoExecutable: false,
            category: 'Inspección',
          },
          {
            id: 'document',
            type: 'documentation',
            title: 'Documentar Hallazgos',
            description: 'Registrar todos los detalles de la discrepancia',
            priority: 'medium',
            estimatedTime: '10 min',
            icon: 'Assignment',
            color: '#4ECDC4',
            autoExecutable: false,
            category: 'Documentación',
          },
        ];
    }
  }, [discrepancy]);

  // Handle action execution
  const handleExecuteAction = async (action: CorrectiveAction) => {
    if (!discrepancy || !action.autoExecutable) return;

    const actionId = action.id;

    setExecutingActions((prev) => new Set(prev).add(actionId));
    setActionErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(actionId);
      return newMap;
    });

    try {
      if (onActionExecute) {
        await onActionExecute(actionId, discrepancy.id);
      } else {
        // TODO: Implement executeAction properly
        // await executeAction(actionId, discrepancy.id);
      }

      setCompletedActions((prev) => new Set(prev).add(actionId));
    } catch (error) {
      setActionErrors((prev) => {
        const newMap = new Map(prev);
        newMap.set(actionId, error instanceof Error ? error.message : 'Error al ejecutar la acción');
        return newMap;
      });
    } finally {
      setExecutingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  // Get priority info
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'Alta', color: 'error' as const, icon: <ErrorIcon fontSize="small" /> };
      case 'medium':
        return { label: 'Media', color: 'warning' as const, icon: <WarningIcon fontSize="small" /> };
      case 'low':
        return { label: 'Baja', color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> };
      default:
        return { label: 'Normal', color: 'default' as const, icon: <InfoIcon fontSize="small" /> };
    }
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (suggestedActions.length === 0) return 0;
    return (completedActions.size / suggestedActions.length) * 100;
  }, [suggestedActions.length, completedActions.size]);

  if (!discrepancy) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: (theme) => alpha(theme.palette.grey[100], 0.5),
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Seleccione una discrepancia para ver las acciones correctivas sugeridas
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Acciones Correctivas Sugeridas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recomendaciones basadas en el tipo de discrepancia detectada
        </Typography>

        {/* Overall Progress */}
        {completedActions.size > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Progreso General
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedActions.size} de {suggestedActions.length} completadas
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Actions Grid */}
      <Grid container spacing={2}>
        {suggestedActions.map((action) => {
          const priorityInfo = getPriorityInfo(action.priority);
          const isExecuting = executingActions.has(action.id);
          const isCompleted = completedActions.has(action.id);
          const error = actionErrors.get(action.id);

          return (
            <Grid item xs={12} md={6} key={action.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: isCompleted ? 'success.main' : 'divider',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'visible',
                  bgcolor: isCompleted
                    ? (theme) => alpha(theme.palette.success.main, 0.02)
                    : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Action Header */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha(action.color, 0.1),
                        color: action.color,
                        flexShrink: 0,
                      }}
                    >
                      {getIconComponent(action.icon)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
                        {action.title}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={priorityInfo.label}
                          color={priorityInfo.color}
                          size="small"
                          icon={priorityInfo.icon}
                          sx={{ fontWeight: 500 }}
                        />
                        <Chip
                          label={action.category}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>

                  {/* Metadata */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tiempo estimado:
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {action.estimatedTime}
                    </Typography>
                  </Box>

                  {/* Error Message */}
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => {
                      setActionErrors((prev) => {
                        const newMap = new Map(prev);
                        newMap.delete(action.id);
                        return newMap;
                      });
                    }}>
                      {error}
                    </Alert>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  {isCompleted ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      disabled
                    >
                      Completada
                    </Button>
                  ) : action.autoExecutable ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={
                        isExecuting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PlayArrowIcon />
                        )
                      }
                      onClick={() => handleExecuteAction(action)}
                      disabled={isExecuting}
                    >
                      {isExecuting ? 'Ejecutando...' : 'Ejecutar Acción'}
                    </Button>
                  ) : (
                    <Tooltip title="Esta acción requiere intervención manual">
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<InfoIcon />}
                      >
                        Acción Manual
                      </Button>
                    </Tooltip>
                  )}
                </CardActions>

                {/* Completed Badge */}
                {isCompleted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 2,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary */}
      {suggestedActions.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay acciones correctivas disponibles para este tipo de discrepancia.
        </Alert>
      )}
    </Box>
  );
};

export default CorrectiveActionsSuggester;
