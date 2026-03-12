/**
 * TemplatePreview Component
 *
 * Live preview of how a template will appear to operators
 * - Shows template metadata (name, category, priority)
 * - Lists all items with visual indicators for input types
 * - Distinguishes mandatory vs optional items with badges
 * - Displays summary statistics (total items, mandatory count, estimated time)
 * - Mobile-responsive design for preview on any device
 * - Uses MUI Card, List, Chip components for consistency
 * - Real-time updates as template data changes
 *
 * @component
 * @example
 * <TemplatePreview
 *   template={templateData}
 *   items={checklistItems}
 *   categoryName="Limpieza de Habitaciones"
 * />
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Divider,
  Container,
  Badge,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CalculateIcon from '@mui/icons-material/Calculate';
import StarIcon from '@mui/icons-material/Star';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';

interface TemplatePreviewProps {
  /** Template data object */
  template?: {
    name?: string;
    categoryId?: string;
    priority?: number;
    isActive?: boolean;
  };
  /** Array of checklist items to preview */
  items: ChecklistItemEditor[];
  /** Category name for display */
  categoryName?: string;
  /** Estimated minutes per item (for calculation) */
  minutesPerItem?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * TemplatePreview Component
 *
 * Provides a realistic preview of how the template will appear to operators
 * in the field. Memoized for performance optimization.
 */
const TemplatePreview = React.memo<TemplatePreviewProps>(
  ({
    template = {},
    items = [],
    categoryName = 'Sin categoría',
    minutesPerItem = 5,
    className,
  }) => {
    // Compute preview statistics
    const stats = useMemo(() => {
      const activeItems = items.filter((item) => !item.isDeleted);
      const mandatoryItems = activeItems.filter((item) => item.isMandatory);
      const optionalItems = activeItems.filter((item) => !item.isMandatory);
      const checkboxItems = activeItems.filter((item) => item.inputType === 'checkbox');
      const textItems = activeItems.filter((item) => item.inputType === 'text');
      const numberItems = activeItems.filter((item) => item.inputType === 'number');

      const estimatedMinutes = activeItems.length * minutesPerItem;

      return {
        totalItems: activeItems.length,
        mandatoryItems: mandatoryItems.length,
        optionalItems: optionalItems.length,
        checkboxItems: checkboxItems.length,
        textItems: textItems.length,
        numberItems: numberItems.length,
        estimatedMinutes,
        completion: mandatoryItems.length > 0 && optionalItems.length >= 0 ? 100 : 0,
      };
    }, [items, minutesPerItem]);

    // Filter active items for preview
    const activeItems = useMemo(
      () => items.filter((item) => !item.isDeleted),
      [items]
    );

    // Get icon for input type
    const getInputTypeIcon = (inputType: string) => {
      switch (inputType) {
        case 'checkbox':
          return <CheckBoxIcon color="primary" />;
        case 'text':
          return <TextFieldsIcon color="secondary" />;
        case 'number':
          return <CalculateIcon color="success" />;
        default:
          return <AssignmentIcon />;
      }
    };

    // Get label for input type
    const getInputTypeLabel = (inputType: string): string => {
      switch (inputType) {
        case 'checkbox':
          return 'Casilla de verificación';
        case 'text':
          return 'Texto libre';
        case 'number':
          return 'Número';
        default:
          return 'Entrada';
      }
    };

    // Priority star display
    const PriorityStars = ({ priority }: { priority?: number }) => {
      const p = priority || 1;
      return (
        <Box display="flex" alignItems="center" gap={0.5}>
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon
              key={i}
              sx={{
                fontSize: '1.2rem',
                color: i <= p ? 'warning.main' : 'action.disabled',
              }}
            />
          ))}
        </Box>
      );
    };

    return (
      <Container maxWidth="md" className={className} sx={{ py: 2 }}>
        {/* Header Card with Template Info */}
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardHeader
            avatar={<AssignmentIcon />}
            title={
              template.name || 'Nombre de la Plantilla'
            }
            subheader={
              <Box sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {categoryName}
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Prioridad
                  </Typography>
                  <Box mt={1}>
                    <PriorityStars priority={template.priority} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Estado
                  </Typography>
                  <Chip
                    label={template.isActive ? 'Activa' : 'Inactiva'}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: template.isActive
                        ? 'rgba(76, 175, 80, 0.8)'
                        : 'rgba(244, 67, 54, 0.8)',
                      color: 'white',
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Elementos
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {stats.totalItems}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Tiempo Est.
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" mt={1} gap={0.5}>
                    <AccessTimeIcon sx={{ fontSize: '1.2rem' }} />
                    <Typography variant="body2">
                      {stats.estimatedMinutes}m
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Total Items Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'primary.lighter',
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <ChecklistIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {stats.totalItems}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total de elementos
              </Typography>
            </Paper>
          </Grid>

          {/* Mandatory Items Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'error.lighter',
                border: '1px solid',
                borderColor: 'error.light',
              }}
            >
              <TaskAltIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {stats.mandatoryItems}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Elementos obligatorios
              </Typography>
            </Paper>
          </Grid>

          {/* Optional Items Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'success.lighter',
                border: '1px solid',
                borderColor: 'success.light',
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {stats.optionalItems}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Elementos opcionales
              </Typography>
            </Paper>
          </Grid>

          {/* Estimated Time Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                {stats.estimatedMinutes}m
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Tiempo estimado
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Input Type Distribution */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Distribución de Tipos de Entrada"
            avatar={<ChecklistIcon />}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckBoxIcon color="primary" fontSize="small" />
                    <Typography variant="body2">Casillas de verificación</Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={stats.checkboxItems}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.totalItems > 0
                        ? (stats.checkboxItems / stats.totalItems) * 100
                        : 0
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextFieldsIcon color="secondary" fontSize="small" />
                    <Typography variant="body2">Campos de texto</Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={stats.textItems}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.totalItems > 0
                        ? (stats.textItems / stats.totalItems) * 100
                        : 0
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalculateIcon color="success" fontSize="small" />
                    <Typography variant="body2">Campos numéricos</Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={stats.numberItems}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      stats.totalItems > 0
                        ? (stats.numberItems / stats.totalItems) * 100
                        : 0
                    }
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Items List Preview */}
        {activeItems.length > 0 ? (
          <Card>
            <CardHeader
              title={`Elementos de Verificación (${activeItems.length})`}
              avatar={<ChecklistIcon />}
            />
            <Divider />
            <List disablePadding>
              {activeItems.map((item, index) => (
                <React.Fragment key={item.tempId || item.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      p: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      width="100%"
                      gap={2}
                      mb={1}
                    >
                      <Badge
                        badgeContent={`#${index + 1}`}
                        color="primary"
                        overlap="circular"
                      >
                        <ListItemIcon sx={{ minWidth: 'unset' }}>
                          {getInputTypeIcon(item.inputType)}
                        </ListItemIcon>
                      </Badge>

                      <Box flex={1} minWidth={0}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.description || '(Sin descripción)'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getInputTypeLabel(item.inputType)}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={0.5}>
                        {item.isMandatory && (
                          <Tooltip title="Este elemento es obligatorio">
                            <Chip
                              label="Obligatorio"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                        {!item.isMandatory && (
                          <Tooltip title="Este elemento es opcional">
                            <Chip
                              label="Opcional"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                  {index < activeItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <ChecklistIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  No hay elementos para mostrar en la vista previa
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Agrega elementos a tu plantilla para ver la vista previa
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary" display="block" mb={1}>
            Esta es una vista previa de cómo los operadores verán la plantilla en la aplicación
            móvil. Los tiempos estimados son aproximaciones basadas en {minutesPerItem} minutos
            por elemento.
          </Typography>
        </Box>
      </Container>
    );
  }
);

TemplatePreview.displayName = 'TemplatePreview';

export default TemplatePreview;
