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
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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

// ─── Custom Stepper Connector ──────────────────────────────────────────────────
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#9CA3AF',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#9CA3AF',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#D1D5DB',
    borderTopWidth: 2,
    borderTopStyle: 'dashed',
    borderRadius: 1,
  },
}));

// ─── Custom Step Icon ─────────────────────────────────────────────────────────
import { StepIconProps } from '@mui/material';

const CustomStepIcon = (props: StepIconProps) => {
  const { active, completed, className, icon } = props;

  return (
    <Box
      className={className}
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active || completed ? '#415EDE' : '#9CA3AF',
        color: 'white',
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '1px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1 }}>
          {icon}
        </Typography>
      </Box>
    </Box>
  );
};

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
  selectedOperators: [],
  selectedLevel: 'block',
  selectedBlockId: null,
  selectedBlockName: '',
  selectedBlockRoomCount: 0,
  selectedRooms: [],
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

  const campIdStr: string = user?.companyId || '1';
  const campIdNum: number = parseInt(campIdStr, 10);
  const currentUserId: string = user?.id ?? '';
  const campName = 'Campamento';

  const [activeStep, setActiveStep] = useState<number>(0);
  const [formState, setFormState] = useState<AssignmentFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return formState.selectedOperators.length > 0;
      case 1:
        return true;
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

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const effectiveLevel: AssignmentLevel =
        formState.selectedLevel === 'block' ? 'rooms' : formState.selectedLevel;

      const request: CreateAssignmentGroupRequest = {
        campId: campIdNum,
        level: effectiveLevel,
        targetBlockId:
          formState.selectedLevel !== 'block' && formState.selectedBlockId !== null
            ? parseInt(formState.selectedBlockId, 10)
            : undefined,
        operatorUserIds: formState.selectedOperators.map((o) => o.id),
        roomIds: formState.selectedRooms.map((r) => parseInt(r.id, 10)),
        createdByUserId: currentUserId,
      };

      await dispatch(createAssignmentGroup(request)).unwrap();

      setSnackbar({
        open: true,
        message: 'Asignación creada exitosamente.',
        severity: 'success',
      });

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        bgcolor: '#fff',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
          Nueva Asignación de Operarios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sigue los pasos para asignar operarios a habitaciones del campamento.
        </Typography>
      </Box>

      <Box className='p-4 bg-[#f7f7f7] rounded-[8px]'>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: '8px',
            p: { xs: 3, md: 4 },
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: "#fff",
          }}
        >
          <Stepper
            activeStep={activeStep}
            connector={<CustomConnector />}
            sx={{
              mb: 5,
              pb: 4,
              borderBottom: '1px solid #F3F4F6',
              '& .MuiStepLabel-label': {
                fontWeight: 500,
                fontSize: '14px',
              },
              '& .MuiStepLabel-label.Mui-active': {
                color: '#111827',
                fontWeight: 600,
              },
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ flex: 1, mb: activeStep === 2 ? 10 : 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                  Seleccionar Operarios
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
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

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                  Nivel de Asignación
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
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

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
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
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                      Seleccione los pisos del pabellón que se asignarán a los operarios.
                    </Typography>
                    <BlockFloorSelector
                      campId={campIdStr}
                      selectedRooms={formState.selectedRooms}
                      onRoomsChange={(rooms) =>
                        setFormState((prev) => ({
                          ...prev,
                          selectedRooms: rooms,
                          selectedBlockName: rooms.length > 0 ? rooms[0].blockName : '',
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </Box>
                )}

                {formState.selectedLevel === 'rooms' && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
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

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              ...(activeStep === 2 && {
                position: 'fixed',
                bottom: 0,
                left: { xs: 0, lg: '280px' },
                right: 0,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                p: 3,
                borderTop: '1px solid #E5E7EB',
                zIndex: 1000,
                boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.1)',
              })
            }}
          >
            <Button
              disabled={activeStep === 0 || isSubmitting}
              onClick={handleBack}
              sx={{
                bgcolor: '#F3F4F6',
                color: activeStep === 0 ? '#9CA3AF' : '#4B5563',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '8px',
                px: { xs: 2, sm: 3 },
                py: 1,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#E5E7EB', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#F3F4F6', color: '#9CA3AF' },
              }}
            >
              Anterior
            </Button>

            <Button
              disabled={isSubmitting}
              onClick={() => window.history.back()}
              sx={{
                bgcolor: '#F3F4F6',
                color: '#4B5563',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '8px',
                px: { xs: 2, sm: 3 },
                py: 1,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#E5E7EB', boxShadow: 'none' },
              }}
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
                  fontWeight: 500,
                  borderRadius: '8px',
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#354BB1', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#9CA3AF', color: '#F3F4F6' },
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
                  borderRadius: '8px',
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#354BB1', boxShadow: 'none' },
                }}
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar Asignación'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

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
