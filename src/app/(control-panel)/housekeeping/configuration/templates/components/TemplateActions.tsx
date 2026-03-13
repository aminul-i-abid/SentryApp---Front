/**
 * TemplateActions Component
 *
 * Action buttons bar for template editor
 * - Save & Activate button (primary action)
 * - Save Draft button
 * - Cancel button
 * - Export/Import buttons
 * - Unsaved changes warning badge
 * - Loading indicators and disabled states
 * - Confirmation dialogs for destructive actions
 *
 * @component
 * @example
 * <TemplateActions
 *   onSave={handleSave}
 *   onSaveDraft={handleSaveDraft}
 *   onCancel={handleCancel}
 *   onExport={handleExport}
 *   onImport={handleImport}
 *   hasUnsavedChanges={true}
 *   isSaving={false}
 *   isValid={true}
 * />
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Paper,
  Typography,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TemplateActionsProps {
  /** Callback for save and activate action */
  onSave: () => Promise<void>;
  /** Callback for save draft action */
  onSaveDraft: () => Promise<void>;
  /** Callback for cancel action */
  onCancel: () => void;
  /** Callback for export action */
  onExport: () => void;
  /** Callback for import action */
  onImport: () => void;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** Whether form is valid for saving */
  isValid?: boolean;
  /** Optional custom error message */
  error?: string;
  /** Optional loading message during save */
  savingMessage?: string;
}

/**
 * TemplateActions Component
 *
 * Displays action buttons for template editor with loading states,
 * validation warnings, and confirmation dialogs for destructive actions.
 */
const TemplateActions: React.FC<TemplateActionsProps> = ({
  onSave,
  onSaveDraft,
  onCancel,
  onExport,
  onImport,
  hasUnsavedChanges = false,
  isSaving = false,
  isValid = false,
  error,
  savingMessage = 'Guardando plantilla...',
}) => {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmExportOpen, setConfirmExportOpen] = useState(false);

  // Handle cancel with confirmation if there are unsaved changes
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setConfirmCancelOpen(true);
    } else {
      onCancel();
    }
  };

  // Confirm cancel action
  const handleConfirmCancel = () => {
    setConfirmCancelOpen(false);
    onCancel();
  };

  // Handle save with validation
  const handleSaveClick = async () => {
    if (!isValid) {
      console.warn('Cannot save: Form validation failed');
      return;
    }
    try {
      await onSave();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Handle save draft
  const handleSaveDraftClick = async () => {
    try {
      await onSaveDraft();
    } catch (err) {
      console.error('Save draft failed:', err);
    }
  };

  // Handle export action
  const handleExportClick = () => {
    if (hasUnsavedChanges) {
      setConfirmExportOpen(true);
    } else {
      onExport();
    }
  };

  // Confirm export with unsaved changes
  const handleConfirmExport = () => {
    setConfirmExportOpen(false);
    onExport();
  };

  return (
    <>
      {/* Main Actions Paper */}
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Left Section - Primary Actions */}
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Badge
            badgeContent={hasUnsavedChanges ? '1' : 0}
            color="warning"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                right: -3,
                top: 13,
                padding: '0 4px',
                fontSize: '0.75rem',
              },
            }}
          >
            <ButtonGroup variant="outlined" size="small">
              {/* Save & Activate Button */}
              <Tooltip
                title={
                  isValid
                    ? 'Guardar y activar plantilla'
                    : 'Corrige los errores antes de guardar'
                }
              >
                <span>
                  <Button
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={handleSaveClick}
                    disabled={isSaving || !isValid}
                    color="success"
                    variant={hasUnsavedChanges ? 'contained' : 'outlined'}
                    aria-label="Guardar y activar plantilla"
                    sx={{
                      backgroundColor: "#415EDE",
                      color: "white",
                      "&.Mui-disabled": {
                        backgroundColor: "#415EDE",
                        color: "white",
                        opacity: 0.6
                      }
                    }}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </span>
              </Tooltip>

              {/* Save Draft Button */}
              <Tooltip title="Guardar como borrador sin activar">
                <span>
                  <Button
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SaveAsIcon />
                      )
                    }
                    onClick={handleSaveDraftClick}
                    disabled={isSaving}
                    aria-label="Guardar como borrador"
                  >
                    Borrador
                  </Button>
                </span>
              </Tooltip>

              {/* Cancel Button */}
              <Tooltip title={
                hasUnsavedChanges
                  ? 'Se perderán los cambios no guardados'
                  : 'Cancelar edición'
              }>
                <span>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancelClick}
                    disabled={isSaving}
                    color="inherit"
                    aria-label="Cancelar"
                    sx={{
                      color: "red"
                    }}
                  >
                    Cancelar
                  </Button>
                </span>
              </Tooltip>
            </ButtonGroup>
          </Badge>

          {/* Status Indicators */}
          <Box display="flex" alignItems="center" gap={1}>
            {isSaving && (
              <Typography variant="caption" color="textSecondary">
                {savingMessage}
              </Typography>
            )}
            {!isSaving && !hasUnsavedChanges && isValid && (
              <Box display="flex" alignItems="center" gap={0.5} color="success.main">
                <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                <Typography variant="caption">Cambios guardados</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Divider */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: 'none', sm: 'block' },
            my: 1,
          }}
        />

        {/* Right Section - Secondary Actions */}
        <Box
          display="flex"
          gap={1}
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          flexWrap="wrap"
        >
          {/* Export Button */}
          {/* <Tooltip title="Exportar plantilla como archivo JSON">
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExportClick}
              disabled={isSaving}
              variant="outlined"
              size="small"
              aria-label="Exportar plantilla"
            >
              Exportar
            </Button>
          </Tooltip> */}

          {/* Import Button */}
          {/* <Tooltip title="Importar plantilla desde archivo JSON">
            <Button
              startIcon={<UploadIcon />}
              onClick={onImport}
              disabled={isSaving}
              variant="outlined"
              size="small"
              aria-label="Importar plantilla"
            >
              Importar
            </Button>
          </Tooltip> */}
        </Box>
      </Paper>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && !isSaving && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mt: 2 }}
          onClose={() => { }}
        >
          <Typography variant="body2">
            <strong>Cambios sin guardar</strong> — Se guardarán automáticamente en 2 segundos,
            o guarda ahora haciendo clic en "Guardar"
          </Typography>
        </Alert>
      )}

      {/* Validation Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Error al guardar:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Form Invalid Alert */}
      {!isValid && !isSaving && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Plantilla incompleta:</strong> Completa todos los campos requeridos
            antes de guardar
          </Typography>
        </Alert>
      )}

      {/* Confirm Cancel Dialog */}
      <Dialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        aria-labelledby="confirm-cancel-dialog-title"
        aria-describedby="confirm-cancel-dialog-description"
      >
        <DialogTitle id="confirm-cancel-dialog-title">
          Descartar cambios
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-cancel-dialog-description">
            Tienes cambios sin guardar. ¿Estás seguro de que deseas cancelar sin guardar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmCancelOpen(false)}
            aria-label="Continuar editando"
          >
            Continuar
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            aria-label="Descartar cambios"
          >
            Descartar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Export with Unsaved Changes Dialog */}
      <Dialog
        open={confirmExportOpen}
        onClose={() => setConfirmExportOpen(false)}
        aria-labelledby="confirm-export-dialog-title"
        aria-describedby="confirm-export-dialog-description"
      >
        <DialogTitle id="confirm-export-dialog-title">
          Exportar con cambios sin guardar
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-export-dialog-description">
            Tienes cambios sin guardar. ¿Deseas exportar el estado actual o
            guardar primero?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmExportOpen(false)}
            aria-label="Cancelar exportación"
          >
            Cancelar
          </Button>
          {/* <Button
            onClick={handleConfirmExport}
            color="primary"
            aria-label="Exportar sin guardar"
          >
            Exportar
          </Button> */}
          <Button
            onClick={async () => {
              await handleSaveDraftClick();
              setConfirmExportOpen(false);
              onExport();
            }}
            color="success"
            variant="contained"
            aria-label="Guardar y exportar"
          >
            Guardar y Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplateActions;
