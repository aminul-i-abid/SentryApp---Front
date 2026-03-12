// @ts-nocheck
/**
 * OccupancyComparisonChart Component
 *
 * TODO: Convert to Chart.js (currently uses recharts - incompatible with Tailwind CSS 4.0)
 * Displays a comparison chart between expected and actual occupancy
 * using Recharts ComposedChart with two lines
 *
 * Features:
 * - Expected vs Actual occupancy lines
 * - Custom tooltip showing variance
 * - Responsive design
 * - Click handlers for data points
 * - Legend and grid
 *
 * FASE 5.4 - Variance Analysis Dashboard
 */

import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Skeleton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import type { VarianceDataPoint } from '../../types/dashboardTypes';

/**
 * Component props
 */
interface OccupancyComparisonChartProps {
  data: VarianceDataPoint[];
  height?: number;
  onDataPointClick?: (dataPoint: VarianceDataPoint) => void;
  isLoading?: boolean;
  showVarianceArea?: boolean;
}

/**
 * Custom tooltip content
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const expectedValue = payload.find((p) => p.dataKey === 'expectedOccupied')?.value || 0;
  const actualValue = payload.find((p) => p.dataKey === 'actualOccupied')?.value || 0;
  const variance = actualValue - expectedValue;
  const variancePercent =
    expectedValue > 0 ? ((variance / expectedValue) * 100).toFixed(1) : '0.0';

  const isPositive = variance >= 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 200,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {label}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: payload[0]?.color || '#8884d8',
            }}
          />
          <Typography variant="body2">
            Esperado: <strong>{expectedValue}</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: payload[1]?.color || '#82ca9d',
            }}
          />
          <Typography variant="body2">
            Real: <strong>{actualValue}</strong>
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isPositive ? 'success.main' : 'error.main',
              fontWeight: 600,
            }}
          >
            Varianza: {isPositive ? '+' : ''}
            {variance} ({isPositive ? '+' : ''}
            {variancePercent}%)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

/**
 * OccupancyComparisonChart Component
 */
export const OccupancyComparisonChart: React.FC<OccupancyComparisonChartProps> = ({
  data,
  height = 400,
  onDataPointClick,
  isLoading = false,
  showVarianceArea = false,
}) => {
  const theme = useTheme();

  /**
   * Format X-axis labels
   */
  const formatXAxis = useCallback((dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM');
    } catch (err) {
      return dateStr;
    }
  }, []);

  /**
   * Handle click on data point
   */
  const handleDataPointClick = useCallback(
    (dataPoint: any) => {
      if (onDataPointClick && dataPoint) {
        const variancePoint = data.find((d) => d.date === dataPoint.date);
        if (variancePoint) {
          onDataPointClick(variancePoint);
        }
      }
    },
    [data, onDataPointClick]
  );

  /**
   * Format data for variance area
   */
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      varianceAbs: Math.abs(point.variance),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, height }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles para mostrar
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Comparación de Ocupación
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ocupación esperada vs. real
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={handleDataPointClick}
          >
            <defs>
              <linearGradient id="varianceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.warning.main}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.warning.main}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke={theme.palette.text.secondary}
              style={{
                fontSize: '12px',
                fontFamily: theme.typography.fontFamily,
              }}
              tick={{ fill: theme.palette.text.secondary }}
            />

            <YAxis
              stroke={theme.palette.text.secondary}
              style={{
                fontSize: '12px',
                fontFamily: theme.typography.fontFamily,
              }}
              tick={{ fill: theme.palette.text.secondary }}
              label={{
                value: 'Habitaciones',
                angle: -90,
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: theme.palette.text.secondary,
                  fontSize: '12px',
                },
              }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: theme.palette.divider }} />

            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontFamily: theme.typography.fontFamily,
                fontSize: '14px',
              }}
              iconType="line"
            />

            {showVarianceArea && (
              <Area
                type="monotone"
                dataKey="varianceAbs"
                fill="url(#varianceGradient)"
                stroke="none"
                name="Varianza Absoluta"
              />
            )}

            <Line
              type="monotone"
              dataKey="expectedOccupied"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="Ocupación Esperada"
              dot={{
                fill: theme.palette.primary.main,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                cursor: onDataPointClick ? 'pointer' : 'default',
              }}
            />

            <Line
              type="monotone"
              dataKey="actualOccupied"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              name="Ocupación Real"
              dot={{
                fill: theme.palette.success.main,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                cursor: onDataPointClick ? 'pointer' : 'default',
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <MuiTooltip title="Ocupación total esperada en el período">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Total Esperado:{' '}
              <strong>
                {data.reduce((sum, d) => sum + d.expectedOccupied, 0)}
              </strong>
            </Typography>
          </Box>
        </MuiTooltip>

        <MuiTooltip title="Ocupación total real en el período">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.palette.success.main,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Total Real:{' '}
              <strong>
                {data.reduce((sum, d) => sum + d.actualOccupied, 0)}
              </strong>
            </Typography>
          </Box>
        </MuiTooltip>

        <MuiTooltip title="Varianza total en el período">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Varianza Total:{' '}
              <strong>
                {data.reduce((sum, d) => sum + d.variance, 0)}
              </strong>
            </Typography>
          </Box>
        </MuiTooltip>
      </Box>
    </Paper>
  );
};

export default OccupancyComparisonChart;
