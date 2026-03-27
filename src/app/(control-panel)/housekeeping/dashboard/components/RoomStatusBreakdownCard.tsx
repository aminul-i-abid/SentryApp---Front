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
      outerColor: "#34A85314",
    },
    {
      label: 'En Progreso',
      value: roomsInProgress,
      color: theme.palette.info.main,
      outerColor: "#415EDE14",
    },
    {
      label: 'Sin Iniciar',
      value: roomsNotStarted,
      color: theme.palette.warning.main,
      outerColor: "#F0622514",
    },
    {
      label: 'Sin Asignar',
      value: roomsNotAssigned,
      color: theme.palette.grey[600],
      outerColor: "#68686814",
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
    <Card sx={{
      backgroundColor: "#f7f7f7",
      borderRadius: "8px",
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: 'none',
      padding: 2,
    }}>
      <CardContent sx={{ backgroundColor: "#fff", borderRadius: "8px" }}>
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
            sx={{
              backgroundColor: "#f7f7f7",
              borderRadius: "6px",
              fontWeight: 500,
              borderColor: "#EAEAEA",
              fontSize: "13px"
            }}
          />
        </Box>

        {/* Alert for unmanaged rooms */}
        {roomsNotAssigned > 0 && (
          <Alert severity="warning" sx={{ mb: 2, backgroundColor: "#F0622514", color: "#F06225" }}>
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
                  background: "linear-gradient(91.77deg, #2661EB 54.66%, #F06225 113.08%)",
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
              <Box
                sx={{
                  border: 'none',
                  borderRadius: 3,
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#F7F7F7',
                }}
              >
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                  {item.value.toLocaleString('es-ES')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {getPct(item.value)}%
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', backgroundColor: "white", width: "fit-content", padding: 1, borderRadius: "100px" }}>
                  <div className={`p-1.5 rounded-full`} style={{
                    backgroundColor: item.outerColor
                  }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <Typography variant="body2" fontWeight={500} color={item.color}>
                    {item.label === 'Completadas' ? 'Camas Ocupadas' : item.label}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RoomStatusBreakdownCard;
