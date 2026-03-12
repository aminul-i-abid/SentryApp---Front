import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import type { AssignmentLevel } from '../types/assignmentTypes';

interface AssignmentPreviewProps {
  selectedTargets: string[];
  selectedUsers: string[];
  level: AssignmentLevel;
  date: Date;
  totalRooms: number;
  visible: boolean;
}

const AssignmentPreview: React.FC<AssignmentPreviewProps> = ({
  selectedTargets,
  selectedUsers,
  level,
  date,
  totalRooms,
  visible,
}) => {
  const roomsPerUser = useMemo(() => {
    if (selectedUsers.length === 0) return 0;
    return Math.ceil(totalRooms / selectedUsers.length);
  }, [totalRooms, selectedUsers]);

  const estimatedTimeMinutes = useMemo(() => {
    // Estimate: 15 minutes per room
    return roomsPerUser * 15;
  }, [roomsPerUser]);

  const hasWorkloadImbalance = useMemo(() => {
    return roomsPerUser > 25; // More than 25 rooms per user
  }, [roomsPerUser]);

  if (!visible || selectedTargets.length === 0 || selectedUsers.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, backgroundColor: 'info.lighter' }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <InfoIcon color="info" />
        <Typography variant="h6">Vista Previa de Asignación</Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List dense>
        <ListItem>
          <ListItemText
            primary="Fecha"
            secondary={date.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Nivel de Asignación"
            secondary={
              level === 'camp'
                ? 'Campamento Completo'
                : level === 'block'
                ? 'Por Pabellón'
                : 'Habitaciones Específicas'
            }
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Total de Habitaciones"
            secondary={
              <Chip label={`${totalRooms} habitaciones`} size="small" color="primary" />
            }
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Operarios Asignados"
            secondary={
              <Chip
                label={`${selectedUsers.length} operarios`}
                size="small"
                color="secondary"
              />
            }
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Promedio por Operario"
            secondary={
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  label={`~${roomsPerUser} habitaciones/operario`}
                  size="small"
                  color={hasWorkloadImbalance ? 'warning' : 'success'}
                />
              </Box>
            }
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Tiempo Estimado"
            secondary={`~${Math.floor(estimatedTimeMinutes / 60)}h ${
              estimatedTimeMinutes % 60
            }m por operario`}
          />
        </ListItem>
      </List>

      {hasWorkloadImbalance && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Carga Alta:</strong> Cada operario tendrá más de 25 habitaciones.
            Considera asignar más operarios para balancear la carga de trabajo.
          </Typography>
        </Alert>
      )}

      {totalRooms > 50 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Límite Excedido:</strong> Máximo 50 habitaciones por asignación.
            Reduce la selección o divide en múltiples asignaciones.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default AssignmentPreview;
