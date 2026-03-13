import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CancelIcon from '@mui/icons-material/Cancel';
import BugReportIcon from '@mui/icons-material/BugReport';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Props for RuleActions component
 */
interface RuleActionsProps {
  onSave: () => void | Promise<void>;
  onSaveDraft: () => void | Promise<void>;
  onCancel: () => void;
  onTest: () => void | Promise<void>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isValid: boolean;
  isTesting: boolean;
  isEditMode?: boolean;
}

/**
 * Dialog state for confirmation
 */
interface ConfirmationDialogState {
  open: boolean;
  action: 'save' | 'saveDraft' | 'cancel' | null;
}

/**
 * RuleActions - Action buttons for rule configurator
 * Provides save, draft, test, and cancel buttons with proper state management
 *
 * @component
 * @example
 * const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
 * const [isSaving, setIsSaving] = React.useState(false);
 * const [isValid, setIsValid] = React.useState(false);
 *
 * const handleSave = async () => {
 *   setIsSaving(true);
 *   await saveRule();
 *   setIsSaving(false);
 * };
 *
 * return (
 *   <RuleActions
 *     onSave={handleSave}
 *     onSaveDraft={handleDraft}
 *     onCancel={handleCancel}
 *     onTest={handleTest}
 *     hasUnsavedChanges={hasUnsavedChanges}
 *     isSaving={isSaving}
 *     isValid={isValid}
 *     isTesting={false}
 *   />
 * );
 */
const RuleActions: React.FC<RuleActionsProps> = ({
  onSave,
  onSaveDraft,
  onCancel,
  onTest,
  hasUnsavedChanges,
  isSaving,
  isValid,
  isTesting,
  isEditMode = false,
}) => {
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmationDialogState>({
    open: false,
    action: null,
  });

  const handleOpenConfirmDialog = (action: 'save' | 'saveDraft' | 'cancel') => {
    if (action === 'cancel' && hasUnsavedChanges) {
      setConfirmDialog({ open: true, action });
    } else if (action === 'save' && !isValid) {
      setConfirmDialog({ open: true, action });
    } else {
      executeAction(action);
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, action: null });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action) {
      executeAction(confirmDialog.action);
    }
    handleCloseConfirmDialog();
  };

  const executeAction = (action: 'save' | 'saveDraft' | 'cancel') => {
    switch (action) {
      case 'save':
        if (isValid) {
          onSave();
        }
        break;
      case 'saveDraft':
        onSaveDraft();
        break;
      case 'cancel':
        onCancel();
        break;
      default:
        break;
    }
  };

  const getConfirmDialogContent = () => {
    switch (confirmDialog.action) {
      case 'cancel':
        return {
          title: 'Descartar cambios',
          content: '¿Estás seguro que deseas descartar los cambios sin guardar?',
          confirmText: 'Descartar',
          confirmColor: 'error' as const,
        };
      case 'save':
        return {
          title: 'Validación requerida',
          content:
            'La regla tiene errores de validación. Por favor, corrige los campos resaltados antes de guardar.',
          confirmText: 'Entendido',
          confirmColor: 'primary' as const,
        };
      default:
        return {
          title: '',
          content: '',
          confirmText: '',
          confirmColor: 'primary' as const,
        };
    }
  };

  const dialogContent = getConfirmDialogContent();

  return (
    <>
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Left side - Unsaved changes warning */}
        {hasUnsavedChanges && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge
              color="warning"
              overlap="circular"
              badgeContent={<WarningIcon sx={{ fontSize: 16 }} />}
            >
              <Box />
            </Badge>
            <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
              Hay cambios sin guardar
            </Typography>
          </Box>
        )}

        {/* Center - Empty space for responsiveness */}
        <Box sx={{ flex: 1 }} />

        {/* Right side - Action buttons */}
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {/* Cancel Button */}
          <Tooltip
            title={
              hasUnsavedChanges
                ? 'Se te pedirá confirmación para descartar los cambios'
                : 'Volver atrás'
            }
          >
            <span>
              <Button
                startIcon={<CancelIcon />}
                onClick={() => handleOpenConfirmDialog('cancel')}
                variant="outlined"
                color="inherit"
                disabled={isSaving || isTesting}
                sx={{
                  color: "red"
                }}
              >
                Cancelar
              </Button>
            </span>
          </Tooltip>

          {/* Test Button */}
          <Tooltip title="Simula la ejecución de esta regla para validar su comportamiento">
            <span>
              <Button
                startIcon={
                  isTesting ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <BugReportIcon />
                  )
                }
                onClick={onTest}
                variant="outlined"
                color="info"
                disabled={isSaving || isTesting || !isValid}
              >
                {isTesting ? 'Probando...' : 'Probar Regla'}
              </Button>
            </span>
          </Tooltip>

          {/* Button Group - Save Actions */}
          <ButtonGroup variant="contained" sx={{ flexWrap: 'wrap', gap: 0 }}>
            {/* Save Draft Button */}
            <Tooltip title="Guarda la regla como borrador. No se activará hasta que la publiques">
              <Button
                startIcon={
                  isSaving && confirmDialog.action !== 'save' ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <SaveAsIcon />
                  )
                }
                onClick={() => handleOpenConfirmDialog('saveDraft')}
                disabled={isSaving || isTesting}
                sx={{
                  backgroundColor: 'grey.500',
                  '&:hover': { backgroundColor: 'grey.600' },
                  '&.Mui-disabled': { backgroundColor: 'grey.300' },
                }}
              >
                Borrador
              </Button>
            </Tooltip>

            {/* Save & Activate Button */}
            <Tooltip
              title={
                !isValid
                  ? 'Completa los campos requeridos para activar la regla'
                  : 'Guarda y activa la regla inmediatamente'
              }
            >
              <span>
                <Button
                  startIcon={
                    isSaving && confirmDialog.action === 'save' ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={() => handleOpenConfirmDialog('save')}
                  disabled={isSaving || isTesting || !isValid}
                  color="success"
                  sx={{
                    backgroundColor: "#415EDE",
                    color: "white"
                  }}
                >
                  Guardar y Activar
                </Button>
              </span>
            </Tooltip>
          </ButtonGroup>
        </Stack>
      </Box>

      {/* Validation Alert - if invalid and not during save */}
      {!isValid && !isSaving && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => { }} icon={<WarningIcon />}>
          <Typography variant="body2">
            La regla tiene errores de validación. Por favor, revisa los campos señalados y
            corrígelos antes de guardar.
          </Typography>
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
          {dialogContent.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ mt: 1 }}>
            {dialogContent.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            {confirmDialog.action === 'save' ? 'Aceptar' : 'Cancelar'}
          </Button>
          {confirmDialog.action !== 'save' && (
            <Button
              onClick={handleConfirmAction}
              color={dialogContent.confirmColor}
              variant="contained"
              autoFocus
            >
              {dialogContent.confirmText}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RuleActions;
