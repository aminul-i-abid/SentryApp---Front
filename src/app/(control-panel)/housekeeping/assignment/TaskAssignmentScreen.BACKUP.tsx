import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns as AdapterDateFnsV3 } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { format, isAfter, startOfToday } from 'date-fns';
import { useAppDispatch } from '@/store/hooks';
import { assignTasks } from '@/store/housekeeping';
import type { AssignTasksRequest } from '@/store/housekeeping/housekeepingTypes';
import useUser from '@auth/useUser';
import LevelSelector from './components/LevelSelector';
import BlockMultiSelector from './components/BlockMultiSelector';
import RoomMultiSelector from './components/RoomMultiSelector';
import UserMultiSelector from './components/UserMultiSelector';
import AssignmentPreview from './components/AssignmentPreview';
import AssignmentResult from './components/AssignmentResult';
import type {
  AssignmentLevel,
  TaskAssignmentState,
  AssignmentResult as AssignmentResultType,
} from './types/assignmentTypes';

const TaskAssignmentScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  // Get user info (using companyId as campId since the app uses companies as camps)
  const currentCampId = user?.companyId || '1'; // Fallback to '1' if not available
  const currentUserId = user?.id || '';
  const campName = 'Campamento'; // Could be enhanced to fetch actual camp/company name

  // Component state
  const [state, setState] = useState<TaskAssignmentState>({
    selectedDate: new Date(),
    selectedLevel: 'block',
    selectedTargets: [],
    selectedUsers: [],
    isPreviewVisible: false,
    isSubmitting: false,
  });

  const [assignmentResult, setAssignmentResult] = useState<AssignmentResultType | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Calculate total rooms based on level
  const totalRooms = useMemo(() => {
    // This is a simplified calculation
    // In production, you'd fetch actual room counts
    return state.selectedTargets.length;
  }, [state.selectedTargets]);

  // Validation
  const isValid = useMemo(() => {
    const isPastDate = !isAfter(state.selectedDate, startOfToday());
    const hasTargets = state.selectedTargets.length > 0;
    const hasUsers = state.selectedUsers.length > 0;
    const withinLimit = totalRooms <= 50;

    return !isPastDate && hasTargets && hasUsers && withinLimit;
  }, [state.selectedDate, state.selectedTargets, state.selectedUsers, totalRooms]);

  // Error messages
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!isAfter(state.selectedDate, startOfToday())) {
      errors.push('La fecha debe ser hoy o futura');
    }
    if (state.selectedTargets.length === 0) {
      errors.push('Debe seleccionar al menos un objetivo');
    }
    if (state.selectedUsers.length === 0) {
      errors.push('Debe seleccionar al menos un operario');
    }
    if (totalRooms > 50) {
      errors.push('Máximo 50 habitaciones por asignación');
    }

    return errors;
  }, [state.selectedDate, state.selectedTargets, state.selectedUsers, totalRooms]);

  // Handlers
  const handleLevelChange = useCallback((level: AssignmentLevel) => {
    setState((prev) => ({
      ...prev,
      selectedLevel: level,
      selectedTargets: [], // Reset targets when level changes
    }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setState((prev) => ({ ...prev, selectedDate: date }));
    }
  }, []);

  const handleTargetsChange = useCallback((targets: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedTargets: targets,
      isPreviewVisible: targets.length > 0 && prev.selectedUsers.length > 0,
    }));
  }, []);

  const handleUsersChange = useCallback((users: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedUsers: users,
      isPreviewVisible: prev.selectedTargets.length > 0 && users.length > 0,
    }));
  }, []);

  const handleAssignTasks = async () => {
    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const request: AssignTasksRequest = {
        campId: currentCampId,
        date: format(state.selectedDate, 'yyyy-MM-dd'),
        roomIds: state.selectedTargets,
        assignedToUserIds: state.selectedUsers,
        assignedBy: currentUserId,
      };

      const result = await dispatch(assignTasks(request)).unwrap();

      setAssignmentResult({
        success: true,
        tasksCreated: result.tasksCreated || state.selectedTargets.length,
        taskIds: result.taskIds || [],
        message: `Se asignaron exitosamente ${result.tasksCreated} tareas`,
      });
      setShowResult(true);

      // Reset form
      setState({
        selectedDate: new Date(),
        selectedLevel: 'block',
        selectedTargets: [],
        selectedUsers: [],
        isPreviewVisible: false,
        isSubmitting: false,
      });
    } catch (error: unknown) {
      const err = error as { message?: string; data?: { message?: string } };
      const errorMessage =
        err?.message ||
        err?.data?.message ||
        'Error al asignar tareas';

      setAssignmentResult({
        success: false,
        tasksCreated: 0,
        taskIds: [],
        message: errorMessage,
      });
      setShowResult(true);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleCancel = () => {
    // TODO: Navigate to tasks list when implemented
    // navigate('/housekeeping/tasks');
    window.history.back();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFnsV3}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Asignar Tareas de Housekeeping
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selecciona la fecha, nivel y operarios para asignar tareas de limpieza
          </Typography>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            {/* Date Picker */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Fecha de Asignación
              </Typography>
              <DatePicker
                label="Seleccionar Fecha"
                value={state.selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Paper>

            {/* Level Selector */}
            <Box mb={3}>
              <LevelSelector
                selectedLevel={state.selectedLevel}
                onLevelChange={handleLevelChange}
                campName={campName}
              />
            </Box>

            {/* Target Selectors */}
            {state.selectedLevel === 'block' && (
              <BlockMultiSelector
                campId={currentCampId}
                selectedBlocks={state.selectedTargets}
                onBlocksChange={handleTargetsChange}
                disabled={state.isSubmitting}
              />
            )}

            {state.selectedLevel === 'room' && (
              <RoomMultiSelector
                campId={currentCampId}
                selectedRooms={state.selectedTargets}
                onRoomsChange={handleTargetsChange}
                disabled={state.isSubmitting}
              />
            )}

            {state.selectedLevel === 'camp' && (
              <Alert severity="info">
                Se asignarán tareas a todas las habitaciones del campamento
              </Alert>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            {/* User Selector */}
            <Box mb={3}>
              <UserMultiSelector
                campId={currentCampId}
                role="Cleaning_Staff"
                selectedUsers={state.selectedUsers}
                onUsersChange={handleUsersChange}
                showWorkload
              />
            </Box>

            {/* Preview */}
            {state.isPreviewVisible && (
              <Box mb={3}>
                <AssignmentPreview
                  selectedTargets={state.selectedTargets}
                  selectedUsers={state.selectedUsers}
                  level={state.selectedLevel}
                  date={state.selectedDate}
                  totalRooms={totalRooms}
                  visible={state.isPreviewVisible}
                />
              </Box>
            )}

            {/* Validation Errors */}
            {!isValid && validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2" component="div">
                  <strong>Errores de validación:</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={state.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignTasks}
                  disabled={!isValid || state.isSubmitting}
                >
                  {state.isSubmitting ? 'Asignando...' : 'Asignar Tareas'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Result Dialog */}
        <AssignmentResult
          open={showResult}
          result={assignmentResult}
          onClose={() => setShowResult(false)}
          onViewTasks={() => {
            setShowResult(false);
          }}
          onAssignMore={() => {
            setShowResult(false);
            setAssignmentResult(null);
          }}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default TaskAssignmentScreen;
