import React from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Typography,
  Divider,
  Grid,
  Stack,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import type { RuleListItem } from '../types/ruleConfiguratorTypes';

/**
 * Props for RulePreview component
 */
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

/**
 * Helper function to get trigger icon and color
 */
const getTriggerConfig = (triggerType: string): { icon: React.ReactNode; color: 'error' | 'warning' | 'info' | 'success' } => {
  const configs: Record<string, { icon: React.ReactNode; color: 'error' | 'warning' | 'info' | 'success' }> = {
    manual: { icon: <TaskAltIcon />, color: 'info' },
    checkout: { icon: <CheckCircleIcon />, color: 'error' },
    checkin: { icon: <CheckCircleIcon />, color: 'success' },
    interval: { icon: <AutoAwesomeIcon />, color: 'warning' },
  };
  return configs[triggerType] || { icon: <InfoIcon />, color: 'info' };
};

/**
 * Helper function to get priority color
 */
const getPriorityColor = (priority: number): 'error' | 'warning' | 'info' | 'success' => {
  if (priority >= 5) return 'error';
  if (priority >= 4) return 'warning';
  if (priority >= 3) return 'info';
  return 'success';
};

/**
 * Helper function to format application scope
 */
const formatScope = (scope: string): string => {
  const scopes: Record<string, string> = {
    camp: 'Todo el campamento',
    block: 'Pabellones específicos',
    room: 'Habitaciones específicas',
  };
  return scopes[scope] || scope;
};

/**
 * RulePreview - Shows a summary of rule configuration
 * Displays rule details with visual indicators and warnings
 *
 * @component
 * @example
 * const rule = {
 *   name: 'Limpieza post-checkout',
 *   templateName: 'Limpieza Estándar',
 *   triggerDescription: 'Al hacer checkout',
 *   targetDescription: 'Todas las habitaciones',
 *   priority: 4,
 * };
 * return <RulePreview rule={rule} estimatedAffectedRooms={120} />;
 */
const RulePreview: React.FC<RulePreviewProps> = ({
  rule,
  templateName,
  targetDescription,
  estimatedAffectedRooms = 0,
  estimatedTasksPerDay = 0,
}) => {
  // Normalize rule data
  const ruleName = rule.name || '';
  const template = templateName || rule.templateName || 'No especificado';
  const triggerDesc = (rule as any).triggerDescription || 'Trigger manual';
  const targetDesc = targetDescription || (rule as any).targetDescription || 'Sin objetivo definido';
  const scope = (rule as any).appliesTo || 'camp';
  const priority = rule.priority || 0;
  const isActive = (rule as any).isActive ?? true;

  // Determine if rule is too broad (>100 rooms)
  const isTooBoard = estimatedAffectedRooms > 100;

  // Get trigger configuration
  const triggerConfig = getTriggerConfig((rule as any).triggerType || 'manual');
  const priorityColor = getPriorityColor(priority);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Vista Previa de la Regla
      </Typography>

      {/* Wide impact warning */}
      {isTooBoard && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
          action={
            <Chip label={`Afectará ${estimatedAffectedRooms} habitaciones`} size="small" color="warning" />
          }
        >
          Esta regla tiene un alcance muy amplio y afectará a muchas habitaciones. Verifica que sea intencional antes
          de activarla.
        </Alert>
      )}

      {/* Main rule card */}
      <Card sx={{ mb: 3, border: `2px solid ${isActive ? '#4caf50' : '#bdbdbd'}` }}>
        <CardContent sx={{ p: 3 }}>
          {/* Rule Name and Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {ruleName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Regla de limpieza automática
              </Typography>
            </Box>
            <Chip
              label={isActive ? 'Activa' : 'Inactiva'}
              color={isActive ? 'success' : 'default'}
              variant={isActive ? 'filled' : 'outlined'}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Configuration Details */}
          <List sx={{ p: 0 }}>
            {/* Template */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <TaskAltIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Template"
                secondary={template}
                primaryTypographyProps={{ variant: 'caption', sx: { fontWeight: 600 } }}
                secondaryTypographyProps={{ variant: 'body2', sx: { mt: 0.5 } }}
              />
            </ListItem>

            {/* Trigger */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {triggerConfig.icon}
              </ListItemIcon>
              <ListItemText
                primary="Disparador"
                secondary={triggerDesc}
                primaryTypographyProps={{ variant: 'caption', sx: { fontWeight: 600 } }}
                secondaryTypographyProps={{ variant: 'body2', sx: { mt: 0.5 } }}
              />
              <Chip label={(rule as any).triggerType || 'manual'} size="small" color={triggerConfig.color} />
            </ListItem>

            {/* Application Scope */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocationOnIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Alcance"
                secondary={`${formatScope(scope)} - ${targetDesc}`}
                primaryTypographyProps={{ variant: 'caption', sx: { fontWeight: 600 } }}
                secondaryTypographyProps={{ variant: 'body2', sx: { mt: 0.5 } }}
              />
            </ListItem>

            {/* Priority */}
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PriorityHighIcon color={priorityColor} />
              </ListItemIcon>
              <ListItemText
                primary="Prioridad"
                secondary={`Nivel ${priority} de 5`}
                primaryTypographyProps={{ variant: 'caption', sx: { fontWeight: 600 } }}
                secondaryTypographyProps={{ variant: 'body2', sx: { mt: 0.5 } }}
              />
              <Stack direction="row" spacing={0.5}>
                {[1, 2, 3, 4, 5].map((p) => (
                  <Box
                    key={p}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: p <= priority ? getPriorityColor(priority) : 'action.disabled',
                    }}
                  />
                ))}
              </Stack>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Affected Rooms */}
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: 'info.lighter',
              border: '1px solid',
              borderColor: 'info.light',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
              HABITACIONES AFECTADAS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
              {estimatedAffectedRooms}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              habitaciones {isTooBoard ? '(muy amplio)' : '(estimado)'}
            </Typography>
          </Paper>
        </Grid>

        {/* Tasks Per Day */}
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: 'success.lighter',
              border: '1px solid',
              borderColor: 'success.light',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
              TAREAS POR DÍA
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
              {estimatedTasksPerDay}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              tareas que se crearían diariamente
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Information */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <InfoIcon sx={{ color: 'info.main', mt: 0.5, flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Información Importante
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              • La regla se procesará automáticamente basándose en el disparador configurado
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              • El {template} se aplicará a todas las habitaciones que cumplan los criterios
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              • Los cambios entrarán en vigor inmediatamente después de guardar la regla
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Deactivation Notice */}
      {!isActive && (
        <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
          Esta regla está <strong>desactivada</strong>. No se aplicará automáticamente hasta que la actives.
        </Alert>
      )}
    </Box>
  );
};

export default React.memo(RulePreview);
