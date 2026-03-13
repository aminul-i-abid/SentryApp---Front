import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Skeleton,
  Chip,
  Alert,
  Grid,
  useTheme,
} from '@mui/material';

export interface RoomStatusBreakdownCardProps {
  totalRooms: number;
  roomsCompleted: number;
  roomsInProgress: number;
  roomsNotStarted: number;
  roomsNotAssigned: number;
  loading?: boolean;
}

const RoomStatusBreakdownCard: React.FC<RoomStatusBreakdownCardProps> = ({
  totalRooms,
  roomsCompleted,
  roomsInProgress,
  roomsNotStarted,
  roomsNotAssigned,
  loading = false,
}) => {
  const theme = useTheme();

  const getSegmentWidth = (value: number): string => {
    if (value === 0 || totalRooms === 0) return '0%';
    const pct = (value / totalRooms) * 100;
    return `${Math.max(pct, 2)}%`;
  };

  const getPct = (value: number): string => {
    if (totalRooms === 0) return '0.0';
    return ((value / totalRooms) * 100).toFixed(1);
  };

  const statusItems = [
    {
      label: 'Completadas',
      value: roomsCompleted,
      color: theme.palette.success.main,
    },
    {
      label: 'En Progreso',
      value: roomsInProgress,
      color: theme.palette.info.main,
    },
    {
      label: 'Sin Iniciar',
      value: roomsNotStarted,
      color: theme.palette.warning.main,
    },
    {
      label: 'Sin Asignar',
      value: roomsNotAssigned,
      color: theme.palette.grey[400],
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Skeleton variant="text" width={200} height={28} />
              <Skeleton variant="text" width={160} height={20} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="rounded" width={100} height={24} />
          </Box>
          <Skeleton variant="rounded" width="100%" height={12} sx={{ mb: 3, borderRadius: 1 }} />
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map((i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={60} height={36} />
                <Skeleton variant="text" width={40} height={16} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (totalRooms === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Typography variant="body1" color="text.secondary">
              Sin datos de habitaciones
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{
        backgroundColor: "white"
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Estado de Habitaciones
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Cobertura de housekeeping del dia
            </Typography>
          </Box>
          <Chip
            label={`Total: ${totalRooms.toLocaleString('es-ES')}`}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Alert for unmanaged rooms */}
        {roomsNotAssigned > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {`${roomsNotAssigned.toLocaleString('es-ES')} de ${totalRooms.toLocaleString('es-ES')} habitaciones sin gestionar hoy (${getPct(roomsNotAssigned)}%)`}
          </Alert>
        )}

        {/* Stacked Bar */}
        <Box
          sx={{
            display: 'flex',
            height: 12,
            borderRadius: 6,
            overflow: 'hidden',
            mb: 3,
            backgroundColor: theme.palette.grey[200],
          }}
        >
          {statusItems.map((item) => (
            item.value > 0 && (
              <Box
                key={item.label}
                sx={{
                  width: getSegmentWidth(item.value),
                  backgroundColor: item.color,
                  flexShrink: 0,
                  transition: 'width 0.6s ease',
                }}
              />
            )
          ))}
        </Box>

        {/* Legend */}
        <Grid container spacing={2}>
          {statusItems.map((item) => (
            <Grid item xs={6} sm={3} key={item.label}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {item.value.toLocaleString('es-ES')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getPct(item.value)}%
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RoomStatusBreakdownCard;
