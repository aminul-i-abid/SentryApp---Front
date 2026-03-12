import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import PendingIcon from '@mui/icons-material/Pending';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

export type AlertStatus = 'pending' | 'in_progress' | 'resolved';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceAlert {
  id: string;
  status: AlertStatus;
  priority: AlertPriority;
  type: string;
  room?: string;
  createdAt: Date;
}

export interface MaintenanceStatusWidgetProps {
  alerts: MaintenanceAlert[];
  onClick?: () => void;
  loading?: boolean;
}

const MaintenanceStatusWidget: React.FC<MaintenanceStatusWidgetProps> = ({
  alerts,
  onClick,
  loading = false,
}) => {
  const theme = useTheme();

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'pending':
        return <PendingIcon sx={{ fontSize: 20 }} />;
      case 'in_progress':
        return <AutorenewIcon sx={{ fontSize: 20 }} />;
      case 'resolved':
        return <CheckCircleIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'in_progress':
        return theme.palette.info.main;
      case 'resolved':
        return theme.palette.success.main;
    }
  };

  const getStatusLabel = (status: AlertStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'resolved':
        return 'Resuelto';
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.error.light;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
    }
  };

  const countByStatus = (status: AlertStatus) =>
    alerts.filter((alert) => alert.status === status).length;

  const criticalCount = alerts.filter(
    (alert) => alert.priority === 'critical' && alert.status !== 'resolved'
  ).length;

  const pendingCount = countByStatus('pending');
  const inProgressCount = countByStatus('in_progress');
  const resolvedCount = countByStatus('resolved');
  const totalCount = alerts.length;

  const statusGroups = [
    {
      status: 'pending' as AlertStatus,
      count: pendingCount,
      label: 'Pendientes',
    },
    {
      status: 'in_progress' as AlertStatus,
      count: inProgressCount,
      label: 'En Progreso',
    },
    {
      status: 'resolved' as AlertStatus,
      count: resolvedCount,
      label: 'Resueltos',
    },
  ];

  const completionRate =
    totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(0) : 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Estado de Mantenimiento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen de alertas
            </Typography>
          </Box>

          {criticalCount > 0 && (
            <Chip
              icon={<WarningAmberIcon />}
              label={`${criticalCount} crítica${criticalCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {totalCount === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <BuildIcon
              sx={{
                fontSize: 48,
                color: theme.palette.text.disabled,
                mb: 2,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              No hay alertas de mantenimiento
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Tasa de Resolución
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  }}
                >
                  {completionRate}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.grey[500], 0.1),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${completionRate}%`,
                    height: '100%',
                    backgroundColor: theme.palette.primary.main,
                    transition: 'width 0.5s ease-in-out',
                  }}
                />
              </Box>
            </Box>

            <List sx={{ p: 0 }}>
              {statusGroups.map((group, index) => (
                <React.Fragment key={group.status}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          backgroundColor: alpha(
                            getStatusColor(group.status),
                            0.1
                          ),
                          color: getStatusColor(group.status),
                        }}
                      >
                        {getStatusIcon(group.status)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {group.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {group.status === 'pending' && 'Requieren atención'}
                          {group.status === 'in_progress' &&
                            'En proceso de resolución'}
                          {group.status === 'resolved' && 'Completadas'}
                        </Typography>
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: getStatusColor(group.status),
                        }}
                      >
                        {group.count}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {totalCount > 0
                          ? ((group.count / totalCount) * 100).toFixed(0)
                          : 0}
                        %
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < statusGroups.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ViewKanbanIcon />}
          onClick={onClick}
          disabled={totalCount === 0}
        >
          Ver Kanban
        </Button>
      </Box>
    </Card>
  );
};

export default MaintenanceStatusWidget;
