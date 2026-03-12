'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  TextField,
  Grid,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CompareArrows as CompareArrowsIcon,
  Event as EventIcon,
  Room as RoomIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Discrepancy } from '../../types/dashboardTypes';

interface DiscrepancyDetailsModalProps {
  discrepancy: Discrepancy | null;
  open: boolean;
  onClose: () => void;
  onResolve?: (discrepancyId: string, notes: string) => Promise<void>;
}

const DiscrepancyDetailsModal: React.FC<DiscrepancyDetailsModalProps> = ({
  discrepancy,
  open,
  onClose,
  onResolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  const handleClose = () => {
    setResolutionNotes('');
    setRootCauseAnalysis('');
    setCorrectiveActions('');
    setError(null);
    onClose();
  };

  // Handle resolve action
  const handleResolve = async () => {
    if (!discrepancy || !onResolve) return;

    if (!resolutionNotes.trim()) {
      setError('Por favor, ingrese notas de resolución antes de marcar como resuelto.');
      return;
    }

    setIsResolving(true);
    setError(null);

    try {
      const fullNotes = `
Notas de Resolución: ${resolutionNotes}

${rootCauseAnalysis ? `Análisis de Causa Raíz: ${rootCauseAnalysis}` : ''}

${correctiveActions ? `Acciones Correctivas: ${correctiveActions}` : ''}
      `.trim();

      await onResolve(discrepancy.id, fullNotes);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resolver la discrepancia');
    } finally {
      setIsResolving(false);
    }
  };

  if (!discrepancy) return null;

  // Get discrepancy type info
  const getDiscrepancyTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'skip':
        return {
          label: 'Salto',
          color: 'warning' as const,
          icon: <WarningIcon />,
          description: 'Habitación marcada como "Saltada" pero con diferencias en el estado',
        };
      case 'sleep':
        return {
          label: 'Dormida',
          color: 'error' as const,
          icon: <ErrorIcon />,
          description: 'Habitación marcada como "Dormida" pero con ocupación real diferente',
        };
      case 'count':
        return {
          label: 'Recuento',
          color: 'info' as const,
          icon: <TrendingUpIcon />,
          description: 'Diferencia en el recuento de items vs estado esperado',
        };
      default:
        return {
          label: type,
          color: 'default' as const,
          icon: <WarningIcon />,
          description: 'Tipo de discrepancia no especificado',
        };
    }
  };

  const typeInfo = getDiscrepancyTypeInfo(discrepancy.discrepancyType);

  // Get priority info
  const getPriorityInfo = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'alta':
        return { label: 'Alta', color: 'error' as const, icon: <ErrorIcon /> };
      case 'medium':
      case 'media':
        return { label: 'Media', color: 'warning' as const, icon: <WarningIcon /> };
      case 'low':
      case 'baja':
        return { label: 'Baja', color: 'success' as const, icon: <CheckCircleIcon /> };
      default:
        return { label: priority || '-', color: 'default' as const, icon: <WarningIcon /> };
    }
  };

  const priorityInfo = getPriorityInfo(discrepancy.priority);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette[typeInfo.color].main, 0.1),
              color: `${typeInfo.color}.main`,
            }}
          >
            {typeInfo.icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Detalles de Discrepancia
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {discrepancy.roomNumber} - {discrepancy.blockName}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Status Badge */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Chip
            label={discrepancy.resolved ? 'Resuelto' : 'Pendiente'}
            color={discrepancy.resolved ? 'success' : 'warning'}
            icon={discrepancy.resolved ? <CheckCircleIcon /> : <WarningIcon />}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`Prioridad: ${priorityInfo.label}`}
            color={priorityInfo.color}
            icon={priorityInfo.icon}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Basic Information */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RoomIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Habitación
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {discrepancy.roomNumber}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BusinessIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Bloque
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {discrepancy.blockName}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {format(new Date(discrepancy.date), "dd 'de' MMMM, yyyy", { locale: es })}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hora
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {format(new Date(discrepancy.date), 'HH:mm', { locale: es })}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Discrepancy Type Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Tipo de Discrepancia
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette[typeInfo.color].main, 0.05),
              border: '1px solid',
              borderColor: `${typeInfo.color}.main`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette[typeInfo.color].main, 0.2),
                  color: `${typeInfo.color}.main`,
                }}
              >
                {typeInfo.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600} color={`${typeInfo.color}.main`}>
                  {typeInfo.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {typeInfo.description}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Status Comparison */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareArrowsIcon fontSize="small" />
            Comparación de Estados
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Estado Esperado
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mt: 1 }}>
                  {discrepancy.expectedStatus}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CompareArrowsIcon color="action" sx={{ fontSize: 40 }} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.05),
                  border: '1px solid',
                  borderColor: 'secondary.main',
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Estado Real
                </Typography>
                <Typography variant="h6" color="secondary.main" fontWeight={700} sx={{ mt: 1 }}>
                  {discrepancy.actualStatus}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Variance */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: (theme) =>
                discrepancy.varianceValue === 0
                  ? alpha(theme.palette.success.main, 0.05)
                  : Math.abs(discrepancy.varianceValue) > 5
                  ? alpha(theme.palette.error.main, 0.05)
                  : alpha(theme.palette.warning.main, 0.05),
              border: '1px solid',
              borderColor:
                discrepancy.varianceValue === 0
                  ? 'success.main'
                  : Math.abs(discrepancy.varianceValue) > 5
                  ? 'error.main'
                  : 'warning.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <TrendingUpIcon
              color={
                discrepancy.varianceValue === 0
                  ? 'success'
                  : Math.abs(discrepancy.varianceValue) > 5
                  ? 'error'
                  : 'warning'
              }
            />
            <Typography variant="body2" fontWeight={600}>
              Variación:
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={
                discrepancy.varianceValue === 0
                  ? 'success.main'
                  : Math.abs(discrepancy.varianceValue) > 5
                  ? 'error.main'
                  : 'warning.main'
              }
            >
              {discrepancy.varianceValue > 0 ? '+' : ''}
              {discrepancy.varianceValue}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Root Cause Analysis */}
        {!discrepancy.resolved && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon fontSize="small" />
                Análisis de Causa Raíz
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ingrese el análisis de la causa raíz de esta discrepancia..."
                value={rootCauseAnalysis}
                onChange={(e) => setRootCauseAnalysis(e.target.value)}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Corrective Actions */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon fontSize="small" />
                Acciones Correctivas Tomadas
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Describa las acciones correctivas implementadas..."
                value={correctiveActions}
                onChange={(e) => setCorrectiveActions(e.target.value)}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Resolution Notes */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SaveIcon fontSize="small" />
                Notas de Resolución *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Ingrese las notas de resolución (obligatorio para marcar como resuelto)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                variant="outlined"
                required
                sx={{ mt: 1 }}
                error={error !== null && !resolutionNotes.trim()}
              />
            </Box>
          </>
        )}

        {/* Existing Resolution Info */}
        {discrepancy.resolved && discrepancy.resolutionNotes && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.main">
              Información de Resolución
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
                border: '1px solid',
                borderColor: 'success.main',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {discrepancy.resolutionNotes}
              </Typography>
              {discrepancy.resolvedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Resuelto el {format(new Date(discrepancy.resolvedAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <Button onClick={handleClose} color="inherit">
          {discrepancy.resolved ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!discrepancy.resolved && onResolve && (
          <Button
            variant="contained"
            color="success"
            startIcon={isResolving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            onClick={handleResolve}
            disabled={isResolving}
          >
            {isResolving ? 'Resolviendo...' : 'Marcar como Resuelto'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DiscrepancyDetailsModal;
