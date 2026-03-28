import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import type { RuleListItem } from '../types/ruleConfiguratorTypes';

interface RulePreviewProps {
  rule: RuleListItem | {
    name: string;
    templateName: string;
    triggerType: string;
    triggerDescription: string;
    appliesTo: string;
    targetDescription: string;
    priority: number;
    isActive?: boolean;
  };
  templateName?: string;
  targetDescription?: string;
  estimatedAffectedRooms?: number;
  estimatedTasksPerDay?: number;
}

const getTriggerConfig = (triggerType: string): { icon: React.ReactNode; color: 'error' | 'warning' | 'info' | 'success' } => {
  const configs: Record<string, { icon: React.ReactNode; color: 'error' | 'warning' | 'info' | 'success' }> = {
    manual: { icon: <TaskAltIcon fontSize="small" />, color: 'info' },
    checkout: { icon: <CheckCircleIcon fontSize="small" />, color: 'error' },
    checkin: { icon: <CheckCircleIcon fontSize="small" />, color: 'success' },
    interval: { icon: <AutoAwesomeIcon fontSize="small" />, color: 'warning' },
  };
  return configs[triggerType] || { icon: <InfoIcon fontSize="small" />, color: 'info' };
};

const formatScope = (scope: string): string => {
  const scopes: Record<string, string> = {
    camp: 'Todo el campamento',
    block: 'Pabellones específicos',
    room: 'Habitaciones específicas',
  };
  return scopes[scope] || scope;
};

const RulePreview: React.FC<RulePreviewProps> = ({
  rule,
  templateName,
  targetDescription,
  estimatedAffectedRooms = 0,
  estimatedTasksPerDay = 0,
}) => {
  const ruleName = rule.name || '';
  const template = templateName || rule.templateName || 'No especificado';
  const triggerDesc = (rule as any).triggerDescription || 'Trigger manual';
  const targetDesc = targetDescription || (rule as any).targetDescription || 'Sin objetivo definido';
  const scope = (rule as any).appliesTo || 'camp';
  const priority = rule.priority || 0;
  const isActive = (rule as any).isActive ?? true;

  const isTooBoard = estimatedAffectedRooms > 100;
  const triggerConfig = getTriggerConfig((rule as any).triggerType || 'manual');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
          Vista Previa de la Regla.
        </Typography>
        <Chip
          label={isActive ? 'Activa' : 'Borrador'}
          sx={{
            bgcolor: isActive ? '#DCFCE7' : '#F3F4F6',
            color: isActive ? '#166534' : '#4B5563',
            fontWeight: 600,
            borderRadius: '6px'
          }}
          size="small"
        />
      </Box>

      {isTooBoard && (
        <Alert
          severity="warning"
          icon={<WarningIcon fontSize="small" />}
          sx={{ mb: 3, borderRadius: '8px', alignItems: 'center', bgcolor: '#FEF3C7', color: '#92400E', '& .MuiAlert-icon': { color: '#D97706' } }}
          action={
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#D97706', px: 2 }}>
              Afectará {estimatedAffectedRooms} habs
            </Typography>
          }
        >
          Esta regla tiene un alcance muy amplio. Verifica que sea intencional antes de activarla.
        </Alert>
      )}

      {!isActive && (
        <Alert severity="info" icon={<InfoIcon fontSize="small" />} sx={{ mb: 3, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#1E40AF', '& .MuiAlert-icon': { color: '#3B82F6' } }}>
          Esta regla está <strong>desactivada</strong>. No se aplicará automáticamente hasta que la actives.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB', height: '100%' }}>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                {ruleName || 'Regla sin nombre'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Resumen de configuración
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: '8px', bgcolor: '#F9FAFB' }}>
                <Box sx={{ color: '#415EDE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TaskAltIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', display: 'block' }}>TEMPLATE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>{template}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: '8px', bgcolor: '#F9FAFB' }}>
                <Box sx={{ color: triggerConfig.color === 'error' ? '#EF4444' : triggerConfig.color === 'warning' ? '#F59E0B' : triggerConfig.color === 'success' ? '#10B981' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {triggerConfig.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', display: 'block' }}>DISPARADOR</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>{triggerDesc}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: '8px', bgcolor: '#F9FAFB' }}>
                <Box sx={{ color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LocationOnIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', display: 'block' }}>ALCANCE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>{formatScope(scope)} - {targetDesc}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: '8px', bgcolor: '#F9FAFB' }}>
                <Box sx={{ color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PriorityHighIcon />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', display: 'block' }}>PRIORIDAD</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>Nivel {priority} de 5</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((p) => (
                      <Box key={p} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: p <= priority ? '#8B5CF6' : '#D1D5DB' }} />
                    ))}
                  </Box>
                </Box>
              </Box>
              
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'block' }}>
              HABITACIONES AFECTADAS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
              {estimatedAffectedRooms}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              habitaciones {isTooBoard ? '(muy amplio)' : '(estimado)'}
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'block' }}>
              TAREAS POR DÍA
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#415EDE', mb: 0.5 }}>
              {estimatedTasksPerDay}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              estimado de tareas diarias
            </Typography>
          </Box>

          <Box sx={{ p: 3, borderRadius: '12px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <InfoIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                Nota
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', lineHeight: 1.5 }}>
              • El {template} se aplicará a todas las habitaciones que cumplan con la configuración seleccionada.<br />
              • Los cambios aplicarán inmediatamente al guardar.
            </Typography>
          </Box>

        </Grid>
      </Grid>
    </Box>
  );
};

export default RulePreview;
