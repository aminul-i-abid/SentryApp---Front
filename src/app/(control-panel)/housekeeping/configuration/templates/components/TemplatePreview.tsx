/**
 * TemplatePreview Component - Redesigned to match Image 4 exactly
 * Clean card-based preview with stats, distribution bars, and verification elements
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CalculateIcon from '@mui/icons-material/Calculate';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';

interface TemplatePreviewProps {
  template?: {
    name?: string;
    categoryId?: string;
    priority?: number;
    isActive?: boolean;
  };
  items: ChecklistItemEditor[];
  categoryName?: string;
  minutesPerItem?: number;
  className?: string;
}

const TemplatePreview = React.memo<TemplatePreviewProps>(
  ({
    template = {},
    items = [],
    categoryName = 'Sin categoría',
    minutesPerItem = 5,
  }) => {
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
      };
    }, [items, minutesPerItem]);

    const activeItems = useMemo(
      () => items.filter((item) => !item.isDeleted),
      [items]
    );

    const getInputTypeLabel = (inputType: string): string => {
      switch (inputType) {
        case 'checkbox': return 'Casilla';
        case 'text': return 'Texto';
        case 'number': return 'Número';
        default: return 'Entrada';
      }
    };

    return (
      <Box>
        {/* ─── Template Header Card ─── */}
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            background: 'url(/assets/icons/general-cleaning.jpg) no-repeat center center',
            border: '1px solid #E5E7EB',
          }}
        >
          {/* Name + Category */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img src="./assets/icons/file-2-fill.png" alt="" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                {template.name || 'Nombre de la Plantilla'}{' '}
                <Typography component="span" sx={{ fontWeight: 400, color: '#9CA3AF', fontSize: '0.875rem' }}>
                  ({categoryName})
                </Typography>
              </Typography>
            </Box>
          </Box>

          {/* Meta info row — single horizontal line */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Priority */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>Prioridad:</Typography>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <img src="./assets/icons/star-bold-duotone.png" alt="" />
                ))}
              </Box>
            </Box>

            <Typography sx={{ color: '#D1D5DB', mx: 0.5 }}>|</Typography>

            {/* Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>Estado:</Typography>
              <Chip
                label={template.isActive ? 'Activa' : 'Inactiva'}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: template.isActive ? '#34A853' : '#FEE2E2',
                  color: template.isActive ? '#fff' : '#991B1B',
                  fontWeight: 600, fontSize: '0.75rem',
                }}
                className='rounded-full'
              />
            </Box>

            <Typography sx={{ color: '#D1D5DB', mx: 0.5 }}>|</Typography>

            {/* Elements */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>Elementos:</Typography>
              <Chip
                label={String(stats.totalItems).padStart(2, '0')}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: 'transparent', color: '#415EDE',
                  fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem',
                }}
              />
            </Box>

            <Typography sx={{ color: '#D1D5DB', mx: 0.5 }}>|</Typography>

            {/* Est Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>Tiempo Est.:</Typography>
              <img src="./assets/icons/gridicons_time.png" alt="" />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#415EDE' }}>
                {stats.estimatedMinutes}m
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ─── Statistics Cards (4 in a row) ─── */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mb: 4,
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            bgcolor: 'white',
            overflow: 'hidden',
            p: 2
          }}
        >
          {[
            { icon: <img src="./assets/icons/list-tree.png" alt="" />, value: String(stats.totalItems).padStart(2, '0'), label: 'Total de elementos' },
            { icon: <img src="./assets/icons/align-key-object.png" alt="" />, value: String(stats.mandatoryItems).padStart(2, '0'), label: 'Elementos obligatorios' },
            { icon: <img src="./assets/icons/file-box.png" alt="" />, value: String(stats.optionalItems).padStart(2, '0'), label: 'Elementos opcionales' },
            { icon: <img src="./assets/icons/time-quarter-vista.png" alt="" />, value: `${stats.estimatedMinutes}m`, label: 'Tiempo estimado' },
          ].map((card, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: "#F7F7F7",
                borderRadius: "8px"
              }}
            >
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '10px',
                  bgcolor: '#fff', border: '1px solid #F0F0F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 0.5,
                  p: 1
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                {card.value}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#686868', fontSize: '0.75rem' }}>
                {card.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ─── Distribution of Input Types ─── */}
        <Box sx={{ mb: 4 }} className="bg-white p-4 rounded-[12px]">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <img src="./assets/icons/solar_pin-list-bold.png" alt="" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Distribución de Tipos de Entrada
            </Typography>
          </Box>
          <Grid container spacing={0}>
            {[
              { icon: <img src="./assets/icons/file-validation.png" alt="" />, label: 'Casillas de verificación', count: stats.checkboxItems, barColor: 'linear-gradient(91.77deg, #2661EB 54.66%, #F06225 113.08%)' },
              { icon: <img src="./assets/icons/input-short-text-blue.png" alt="" />, label: 'Campos de texto', count: stats.textItems, barColor: '#415EDE' },
              { icon: <img src="./assets/icons/arrange-by-numbers-1-9.png" alt="" />, label: 'Campos numéricos', count: stats.numberItems, barColor: '#415EDE' },
            ].map((dist, i) => (
              <Grid item xs={12} sm={4} key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: '12px',
                    bgcolor: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {dist.icon}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#686868' }}>
                        {dist.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={dist.count}
                      size="small"
                      sx={{
                        height: 22, minWidth: 28,
                        bgcolor: '#EFF6FF', color: '#415EDE',
                        fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalItems > 0 ? (dist.count / stats.totalItems) * 100 : 0}
                    sx={{
                      height: 10, borderRadius: "3px", bgcolor: '#F3F4F6',
                      '& .MuiLinearProgress-bar': { borderRadius: 3, background: dist.barColor },
                    }}
                  />
                </Box>
                {i < 2 && (
                  <Divider orientation="vertical" flexItem sx={{ height: '50px', my: 'auto', borderRightWidth: 1.5, borderColor: '#D1D5DB' }} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ─── Verification Elements ─── */}
        <Box sx={{ mb: 4 }} className="bg-white p-4 rounded-[12px]">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <img src="./assets/icons/solar_pin-list-bold.png" alt="" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Elementos de Verificación ({activeItems.length})
            </Typography>
          </Box>
          {activeItems.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { height: 4 },
              }}
            >
              {activeItems.map((item) => (
                <Box
                  key={item.tempId || item.id}
                  className="border-1 border-[#fofofo]"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '10px',
                    bgcolor: '#FAFAFA',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content',
                    flex: '1 0 auto',
                  }}
                >
                  <img src="./assets/icons/solar_check-read-bold.png" alt="" />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#000' }}>
                    {item.description || '(Sin descripción)'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#686868' }}>
                    • {getInputTypeLabel(item.inputType)}
                  </Typography>
                  <Chip
                    label={item.isMandatory ? 'Obligatorio' : 'Opcional'}
                    size="small"
                    className='rounded-full border-1 border-[#F0F0F0]'
                    sx={{
                      height: 22,
                      bgcolor: item.isMandatory ? '#fff' : '#fff',
                      color: item.isMandatory ? '#415EDE' : '#34A853',
                      fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem',
                      ml: 'auto',
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: 'white' }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                No hay elementos para mostrar en la vista previa
              </Typography>
            </Box>
          )}
        </Box>

        {/* ─── Footer info bar ─── */}
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            bgcolor: '#415EDE14',
            border: '1px solid #F2F2F2',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <img src="./assets/icons/information-diamond.png" alt="" />
          <Typography variant="body2" sx={{ color: '#415EDE' }}>
            Esta es una vista previa de cómo los operadores verán la plantilla en la aplicación móvil.
            Los tiempos estimados son aproximaciones basadas en {minutesPerItem} minutos por elemento.
          </Typography>
        </Box>
      </Box>
    );
  }
);

TemplatePreview.displayName = 'TemplatePreview';

export default TemplatePreview;
