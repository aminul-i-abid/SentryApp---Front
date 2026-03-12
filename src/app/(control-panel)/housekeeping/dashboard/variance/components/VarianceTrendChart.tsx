// @ts-nocheck
/**
 * VarianceTrendChart Component
 *
 * TODO: Convert to Chart.js (currently uses recharts - incompatible with Tailwind CSS 4.0)
 * Displays variance trend over time using Recharts AreaChart
 * with color gradient based on positive/negative variance
 *
 * Features:
 * - Variance area chart with gradient
 * - Threshold line at 0
 * - Color changes based on positive/negative variance
 * - Responsive design
 * - Custom tooltip
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
  Chip,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { VarianceDataPoint } from '../../types/dashboardTypes';

/**
 * Component props
 */
interface VarianceTrendChartProps {
  data: VarianceDataPoint[];
  height?: number;
  isLoading?: boolean;
  showThreshold?: boolean;
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
  const theme = useTheme();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const variance = payload[0]?.value || 0;
  const isPositive = variance >= 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 180,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {label}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: isPositive ? 'success.main' : 'error.main',
            fontWeight: 600,
          }}
        >
          Varianza: {isPositive ? '+' : ''}
          {variance}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {isPositive
            ? 'Ocupación por encima de lo esperado'
            : 'Ocupación por debajo de lo esperado'}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * VarianceTrendChart Component
 */
export const VarianceTrendChart: React.FC<VarianceTrendChartProps> = ({
  data,
  height = 400,
  isLoading = false,
  showThreshold = true,
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
   * Calculate statistics
   */
  const stats = React.useMemo(() => {
    if (!data || data.length === 0) {
      return {
        avgVariance: 0,
        maxVariance: 0,
        minVariance: 0,
        positiveCount: 0,
        negativeCount: 0,
      };
    }

    const variances = data.map((d) => d.variance);
    const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;
    const maxVariance = Math.max(...variances);
    const minVariance = Math.min(...variances);
    const positiveCount = variances.filter((v) => v > 0).length;
    const negativeCount = variances.filter((v) => v < 0).length;

    return {
      avgVariance: Math.round(avgVariance * 10) / 10,
      maxVariance,
      minVariance,
      positiveCount,
      negativeCount,
    };
  }, [data]);

  /**
   * Prepare chart data with positive/negative separation
   */
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      positiveVariance: point.variance > 0 ? point.variance : 0,
      negativeVariance: point.variance < 0 ? point.variance : 0,
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
          No hay datos de varianza disponibles
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
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tendencia de Varianza
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Diferencia entre ocupación esperada y real
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<TrendingUpIcon />}
            label={`${stats.positiveCount} días +`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<TrendingDownIcon />}
            label={`${stats.negativeCount} días -`}
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.success.main}
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.success.main}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.error.main}
                  stopOpacity={0.05}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.error.main}
                  stopOpacity={0.5}
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
                value: 'Varianza',
                angle: -90,
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: theme.palette.text.secondary,
                  fontSize: '12px',
                },
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontFamily: theme.typography.fontFamily,
                fontSize: '14px',
              }}
            />

            {showThreshold && (
              <ReferenceLine
                y={0}
                stroke={theme.palette.divider}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: 'Línea Base',
                  position: 'right',
                  fill: theme.palette.text.secondary,
                  fontSize: 12,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="positiveVariance"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              fill="url(#positiveGradient)"
              name="Varianza Positiva"
            />

            <Area
              type="monotone"
              dataKey="negativeVariance"
              stroke={theme.palette.error.main}
              strokeWidth={2}
              fill="url(#negativeGradient)"
              name="Varianza Negativa"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="text.secondary">
            Varianza Promedio
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color:
                stats.avgVariance > 0
                  ? 'success.main'
                  : stats.avgVariance < 0
                  ? 'error.main'
                  : 'text.primary',
            }}
          >
            {stats.avgVariance > 0 ? '+' : ''}
            {stats.avgVariance}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="text.secondary">
            Varianza Máxima
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
            +{stats.maxVariance}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="text.secondary">
            Varianza Mínima
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
            {stats.minVariance}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" color="text.secondary">
            Días Analizados
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {data.length}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default VarianceTrendChart;
