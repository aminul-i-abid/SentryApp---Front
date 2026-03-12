import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskIcon from '@mui/icons-material/Task';
import PeopleIcon from '@mui/icons-material/People';
import type { AssignmentResult as AssignmentResultType } from '../types/assignmentTypes';

interface AssignmentResultProps {
  open: boolean;
  result: AssignmentResultType | null;
  onClose: () => void;
  onViewTasks?: () => void;
  onAssignMore?: () => void;
}

const AssignmentResult: React.FC<AssignmentResultProps> = ({
  open,
  result,
  onClose,
  onViewTasks,
  onAssignMore,
}) => {
  if (!result) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {result.success ? (
            <>
              <CheckCircleIcon color="success" fontSize="large" />
              <Typography variant="h6">Asignación Exitosa</Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" color="error">
                Error en Asignación
              </Typography>
            </>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {result.success ? (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Las tareas han sido asignadas correctamente.
            </Alert>

            <List>
              <ListItem>
                <ListItemIcon>
                  <TaskIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Tareas Creadas"
                  secondary={`${result.tasksCreated} tareas de housekeeping`}
                />
              </ListItem>

              {result.taskIds && result.taskIds.length > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="IDs de Tareas"
                    secondary={
                      <Typography variant="caption" component="div">
                        {result.taskIds.slice(0, 5).join(', ')}
                        {result.taskIds.length > 5 && ` (+${result.taskIds.length - 5} más)`}
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>

            {result.message && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  {result.message}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Alert severity="error">
            <Typography variant="body2">
              {result.message || 'Ocurrió un error al asignar las tareas.'}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {result.success ? (
          <>
            {onViewTasks && (
              <Button onClick={onViewTasks} variant="outlined">
                Ver Tareas
              </Button>
            )}
            {onAssignMore && (
              <Button onClick={onAssignMore} variant="outlined">
                Asignar Más
              </Button>
            )}
            <Button onClick={onClose} variant="contained" color="primary">
              Cerrar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} variant="contained" color="primary">
              Entendido
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentResult;
