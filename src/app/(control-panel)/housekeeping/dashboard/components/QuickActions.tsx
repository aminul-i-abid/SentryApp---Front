import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  path: string;
  badge?: number;
  disabled?: boolean;
}

export interface QuickActionsProps {
  actions?: QuickActionItem[];
  onActionClick?: (action: QuickActionItem) => void;
}

const defaultActions: QuickActionItem[] = [
  {
    id: 'assign-tasks',
    label: 'Asignar Tareas',
    description: 'Asignar tareas de limpieza al personal',
    icon: <AssignmentIcon />,
    color: 'primary',
    path: '/housekeeping/tasks',
  },
  {
    id: 'view-alerts',
    label: 'Ver Alertas',
    description: 'Revisar alertas de mantenimiento',
    icon: <NotificationsActiveIcon />,
    color: 'warning',
    path: '/housekeeping/alerts',
  },
  {
    id: 'generate-report',
    label: 'Generar Reporte',
    description: 'Crear reportes y análisis',
    icon: <AssessmentIcon />,
    color: 'success',
    path: '/housekeeping/reports',
  },
  {
    id: 'settings',
    label: 'Configuración',
    description: 'Ajustes y preferencias del sistema',
    icon: <SettingsIcon />,
    color: 'info',
    path: '/housekeeping/settings',
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  onActionClick,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getColorValue = (
    color: QuickActionItem['color']
  ): string => {
    const colorMap = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      warning: theme.palette.warning.main,
      info: theme.palette.info.main,
    };
    return colorMap[color];
  };

  const handleActionClick = (action: QuickActionItem) => {
    if (action.disabled) return;

    if (onActionClick) {
      onActionClick(action);
    } else {
      navigate(action.path);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Acciones Rápidas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accesos directos a funciones principales
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {actions.map((action) => {
            const actionColor = getColorValue(action.color);

            return (
              <Grid item xs={12} sm={6} key={action.id}>
                <Tooltip
                  title={action.disabled ? 'No disponible' : action.description}
                  arrow
                  placement="top"
                >
                  <span>
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled={action.disabled}
                      onClick={() => handleActionClick(action)}
                      sx={{
                        height: '100%',
                        minHeight: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        p: 2,
                        textAlign: 'left',
                        textTransform: 'none',
                        borderColor: alpha(actionColor, 0.3),
                        borderWidth: 1.5,
                        backgroundColor: alpha(actionColor, 0.02),
                        transition: 'all 0.3s ease-in-out',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: actionColor,
                          backgroundColor: alpha(actionColor, 0.08),
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                          '& .action-arrow': {
                            transform: 'translateX(4px)',
                          },
                        },
                        '&:disabled': {
                          backgroundColor: alpha(theme.palette.grey[500], 0.05),
                          borderColor: theme.palette.divider,
                        },
                        '&::before': action.badge
                          ? {
                              content: '""',
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.error.main,
                            }
                          : {},
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              backgroundColor: alpha(actionColor, 0.1),
                              color: actionColor,
                            }}
                          >
                            {action.icon}
                          </Box>

                          {action.badge && action.badge > 0 && (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                backgroundColor: theme.palette.error.main,
                                color: theme.palette.error.contrastText,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700 }}
                              >
                                {action.badge > 99 ? '99+' : action.badge}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: action.disabled
                              ? theme.palette.text.disabled
                              : theme.palette.text.primary,
                            mb: 0.5,
                          }}
                        >
                          {action.label}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: action.disabled
                              ? theme.palette.text.disabled
                              : theme.palette.text.secondary,
                            display: 'block',
                            mb: 1,
                          }}
                        >
                          {action.description}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <ArrowForwardIcon
                          className="action-arrow"
                          sx={{
                            fontSize: 16,
                            color: action.disabled
                              ? theme.palette.text.disabled
                              : actionColor,
                            transition: 'transform 0.2s ease-in-out',
                          }}
                        />
                      </Box>
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
