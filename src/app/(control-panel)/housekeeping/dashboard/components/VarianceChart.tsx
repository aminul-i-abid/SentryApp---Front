import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

export interface VarianceDataPoint {
  date: string;
  expected: number;
  actual: number;
  variance: number;
  percentageVariance: number;
  period?: string;
}

export interface VarianceChartProps {
  data: VarianceDataPoint[];
  height?: number;
  onDataPointClick?: (dataPoint: VarianceDataPoint) => void;
  title?: string;
  showLegend?: boolean;
}

const VarianceChart: React.FC<VarianceChartProps> = ({
  data,
  height = 400,
  onDataPointClick,
  title = 'Variación de Ocupación',
  showLegend = true,
}) => {
  const theme = useTheme();

  const calculateAverageVariance = () => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, point) => acc + point.percentageVariance, 0);
    return sum / data.length;
  };

  const averageVariance = calculateAverageVariance();
  const isPositiveAverage = averageVariance >= 0;

  // Prepare Chart.js data
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'Esperado',
        data: data.map((d) => d.expected),
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Real',
        data: data.map((d) => d.actual),
        borderColor: theme.palette.secondary.main,
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: theme.palette.secondary.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onClick: (event: any, elements: any[]) => {
      if (onDataPointClick && elements.length > 0) {
        const index = elements[0].index;
        onDataPointClick(data[index]);
      }
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: theme.typography.fontFamily,
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: 600 as const,
        },
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            const index = items[0].dataIndex;
            return data[index]?.period || items[0].label;
          },
          afterLabel: (context: TooltipItem<'line'>) => {
            const index = context.dataIndex;
            const dataPoint = data[index];
            if (dataPoint) {
              const variance = dataPoint.variance;
              const percentageVariance = dataPoint.percentageVariance;
              return [
                '',
                `Variación: ${variance > 0 ? '+' : ''}${variance.toFixed(0)}`,
                `Porcentaje: ${percentageVariance > 0 ? '+' : ''}${percentageVariance.toFixed(1)}%`,
              ];
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(theme.palette.divider, 0.5),
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
        },
        title: {
          display: true,
          text: 'Ocupación',
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comparación de ocupación esperada vs real
            </Typography>
          </Box>

          {data.length > 0 && (
            <Chip
              icon={
                isPositiveAverage ? (
                  <TrendingUpIcon />
                ) : (
                  <TrendingDownIcon />
                )
              }
              label={`${averageVariance > 0 ? '+' : ''}${averageVariance.toFixed(1)}% promedio`}
              size="small"
              sx={{
                backgroundColor: alpha(
                  isPositiveAverage
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  0.1
                ),
                color: isPositiveAverage
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Box sx={{ position: 'relative', height }}>
          {data.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            </Box>
          ) : (
            <Line data={chartData} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VarianceChart;
