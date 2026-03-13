/**
 * TaskAssignmentScreen — Phase 5 Rewrite
 *
 * 4-step MUI Stepper for creating housekeeping assignment groups.
 * Steps: Operarios → Nivel → Objetivo → Confirmar
 *
 * Uses Phase 4 components:
 *   - OperatorMultiSelector
 *   - AssignmentLevelPicker
 *   - BlockSelectorWithCount
 *   - RoomSelectorWithFilters
 *   - ConfirmAssignmentSummary (new, Phase 5)
 */

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { useAppDispatch } from '@/store/hooks';
import { createAssignmentGroup } from '@/store/housekeeping/assignmentGroupThunks';
import useUser from '@auth/useUser';
import type {
  AssignmentLevel,
  CreateAssignmentGroupRequest,
  OperatorOption,
  RoomOption,
} from '@/store/housekeeping/housekeepingTypes';
import OperatorMultiSelector from './components/OperatorMultiSelector';
import AssignmentLevelPicker from './components/AssignmentLevelPicker';
import BlockFloorSelector from './components/BlockFloorSelector';
import RoomSelectorWithFilters from './components/RoomSelectorWithFilters';
import ConfirmAssignmentSummary from './components/ConfirmAssignmentSummary';

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEPS = ['Seleccionar Operarios', 'Nivel de Asignación', 'Objetivo', 'Confirmar'];

// ─── Dummy data for demo ──────────────────────────────────────────────────────

const DUMMY_OPERATORS: OperatorOption[] = [
  { id: 'op-1', fullName: 'Carlos Rodríguez', rut: '12.345.678-9', email: 'carlos@camp.cl' },
  { id: 'op-2', fullName: 'María González', rut: '14.567.890-1', email: 'maria@camp.cl' },
  { id: 'op-3', fullName: 'Juan Pérez', rut: '16.789.012-3', email: 'juan@camp.cl' },
];

const DUMMY_ROOMS: RoomOption[] = [
  { id: '101', number: '101', blockId: 'b1', blockName: 'Pabellón A', floor: 1, bedCount: 2 },
  { id: '102', number: '102', blockId: 'b1', blockName: 'Pabellón A', floor: 1, bedCount: 3 },
  { id: '103', number: '103', blockId: 'b1', blockName: 'Pabellón A', floor: 1, bedCount: 2 },
  { id: '201', number: '201', blockId: 'b1', blockName: 'Pabellón A', floor: 2, bedCount: 2 },
  { id: '202', number: '202', blockId: 'b1', blockName: 'Pabellón A', floor: 2, bedCount: 4 },
  { id: '301', number: '301', blockId: 'b2', blockName: 'Pabellón B', floor: 1, bedCount: 4 },
  { id: '302', number: '302', blockId: 'b2', blockName: 'Pabellón B', floor: 1, bedCount: 2 },
  { id: '401', number: '401', blockId: 'b2', blockName: 'Pabellón B', floor: 2, bedCount: 3 },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface AssignmentFormState {
  selectedOperators: OperatorOption[];
  selectedLevel: AssignmentLevel;
  selectedBlockId: string | null;
  selectedBlockName: string;
  selectedBlockRoomCount: number;
  selectedRooms: RoomOption[];
}

const initialFormState: AssignmentFormState = {
  selectedOperators: DUMMY_OPERATORS,
  selectedLevel: 'block',
  selectedBlockId: 'b1',
  selectedBlockName: 'Pabellón A',
  selectedBlockRoomCount: 5,
  selectedRooms: DUMMY_ROOMS,
};

// ─── Snackbar state ───────────────────────────────────────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

// ─── Component ────────────────────────────────────────────────────────────────

const TaskAssignmentScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  // Current camp and user derived from auth.
  // companyId IS the campId in this single-camp-per-company model (consistent with
  // RulesListScreen, TareasListScreen and all other housekeeping screens).
  // Parsed to number because the backend expects long CampId / long RoomIds.
  const campIdStr: string = user?.companyId || '1';
  const campIdNum: number = parseInt(campIdStr, 10);
  const currentUserId: string = user?.id ?? '';
  const campName = 'Campamento';

  // Stepper state
  const [activeStep, setActiveStep] = useState<number>(0);

  // Form values
  const [formState, setFormState] = useState<AssignmentFormState>(initialFormState);

  // Submission flag
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Snackbars
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ─── Step validation ──────────────────────────────────────────────────────

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return formState.selectedOperators.length > 0;
      case 1:
        return true; // level always has a default
      case 2:
        if (formState.selectedLevel === 'camp') return true;
        if (formState.selectedLevel === 'block') return formState.selectedRooms.length > 0;
        if (formState.selectedLevel === 'rooms') return formState.selectedRooms.length > 0;
        return false;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // ─── Navigation handlers ──────────────────────────────────────────────────

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // ─── Level change: reset downstream selections ────────────────────────────

  const handleLevelChange = (level: AssignmentLevel) => {
    setFormState((prev) => ({
      ...prev,
      selectedLevel: level,
      selectedBlockId: null,
      selectedBlockName: '',
      selectedBlockRoomCount: 0,
      selectedRooms: [],
    }));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // When the user selected 'block' level and picked floors via BlockFloorSelector,
      // the form produces explicit roomIds — not a single targetBlockId.
      // The backend validator requires targetBlockId when level === 'block', so we
      // submit level 'rooms' instead, which is semantically correct for explicit room lists.
      const effectiveLevel: AssignmentLevel =
        formState.selectedLevel === 'block' ? 'rooms' : formState.selectedLevel;

      const request: CreateAssignmentGroupRequest = {
        campId: campIdNum,
        level: effectiveLevel,
        // targetBlockId is only needed for true block-level assignments (not floor-based)
        targetBlockId:
          formState.selectedLevel !== 'block' && formState.selectedBlockId !== null
            ? parseInt(formState.selectedBlockId, 10)
            : undefined,
        operatorUserIds: formState.selectedOperators.map((o) => o.id),
        // roomIds are long[] on the backend — parse each string ID to number
        roomIds: formState.selectedRooms.map((r) => parseInt(r.id, 10)),
        createdByUserId: currentUserId,
      };

      await dispatch(createAssignmentGroup(request)).unwrap();

      setSnackbar({
        open: true,
        message: 'Asignación creada exitosamente.',
        severity: 'success',
      });

      // Reset form and return to step 0
      setFormState(initialFormState);
      setActiveStep(0);
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al crear la asignación. Intente nuevamente.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      }}
    >
      {/* Sticky header: title + stepper */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          px: 4,
          pt: 4,
          pb: 0,
          bgcolor: 'white',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Nueva Asignación de Operarios
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sigue los pasos para asignar operarios a habitaciones del campamento.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Step content */}
      <Box sx={{ flex: 1, px: 4, py: 3, bgcolor: 'white' }}>
        {/* Step 0 — Seleccionar Operarios */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Seleccionar Operarios
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Busque y agregue los operarios que recibirán esta asignación.
            </Typography>
            <OperatorMultiSelector
              campId={campIdStr}
              selectedOperators={formState.selectedOperators}
              onOperatorsChange={(operators) =>
                setFormState((prev) => ({ ...prev, selectedOperators: operators }))
              }
              disabled={isSubmitting}
            />
          </Box>
        )}

        {/* Step 1 — Nivel de Asignación */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Nivel de Asignación
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Seleccione el alcance de la asignación.
            </Typography>
            <AssignmentLevelPicker
              selectedLevel={formState.selectedLevel}
              onLevelChange={handleLevelChange}
              campName={campName}
              disabled={isSubmitting}
            />
          </Box>
        )}

        {/* Step 2 — Objetivo (conditional by level) */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Objetivo
            </Typography>

            {formState.selectedLevel === 'camp' && (
              <Alert severity="info" icon={<InfoIcon />}>
                Se asignarán{' '}
                <strong>{formState.selectedOperators.length}</strong> operario
                {formState.selectedOperators.length !== 1 ? 's' : ''} a{' '}
                <strong>TODAS</strong> las habitaciones del campamento{' '}
                <strong>{campName}</strong>. No es necesario seleccionar un
                objetivo adicional.
              </Alert>
            )}

            {formState.selectedLevel === 'block' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Seleccione los pisos del pabellón que se asignarán a los operarios.
                </Typography>
                <BlockFloorSelector
                  campId={campIdStr}
                  selectedRooms={formState.selectedRooms}
                  onRoomsChange={(rooms) =>
                    setFormState((prev) => ({
                      ...prev,
                      selectedRooms: rooms,
                      // Keep selectedBlockName in sync with the first room's block (for confirmation step)
                      selectedBlockName: rooms.length > 0 ? rooms[0].blockName : '',
                    }))
                  }
                  disabled={isSubmitting}
                />
              </Box>
            )}

            {formState.selectedLevel === 'rooms' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Seleccione las habitaciones individuales para esta asignación.
                </Typography>
                <RoomSelectorWithFilters
                  campId={campIdStr}
                  selectedRooms={formState.selectedRooms}
                  onRoomsChange={(rooms) =>
                    setFormState((prev) => ({ ...prev, selectedRooms: rooms }))
                  }
                  disabled={isSubmitting}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Step 3 — Confirmar */}
        {activeStep === 3 && (
          <ConfirmAssignmentSummary
            operators={formState.selectedOperators}
            level={formState.selectedLevel}
            campName={campName}
            blockId={formState.selectedBlockId}
            blockName={formState.selectedBlockName || undefined}
            blockRoomCount={formState.selectedBlockRoomCount}
            rooms={formState.selectedRooms}
          />
        )}
      </Box>

      {/* Sticky bottom navigation — stays visible while page scrolls */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          px: 3,
          py: 2,
          pb: { xs: 10, sm: 3 },
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'white',
        }}
      >
        <Button
          disabled={activeStep === 0 || isSubmitting}
          onClick={handleBack}
          variant="outlined"
        >
          Anterior
        </Button>

        <Button
          variant="outlined"
          disabled={isSubmitting}
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!isStepValid(activeStep)}
            onClick={handleNext}
            sx={{
              bgcolor: '#415EDE',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#354bb1' },
              '&.Mui-disabled': { bgcolor: '#b0b0b0', color: '#fff' },
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{
              bgcolor: '#415EDE',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#354bb1' },
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar Asignación'}
          </Button>
        )}
      </Box>

      {/* Success / error snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskAssignmentScreen;
