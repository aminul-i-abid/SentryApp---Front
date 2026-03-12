import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
  Stack,
  Chip,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend);

export type DiscrepancyType = 'skip' | 'sleep' | 'count';

export interface DiscrepancyGroup {
  type: DiscrepancyType;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  label: string;
}

export interface DiscrepanciesWidgetProps {
  discrepancies: DiscrepancyGroup[];
  onClick?: () => void;
  loading?: boolean;
}

const DiscrepanciesWidget: React.FC<DiscrepanciesWidgetProps> = ({
  discrepancies,
  onClick,
  loading = false,
}) => {
  const theme = useTheme();

  const getTypeIcon = (type: DiscrepancyType) => {
    switch (type) {
      case 'skip':
        return <ErrorOutlineIcon sx={{ fontSize: 20 }} />;
      case 'sleep':
        return <HotelIcon sx={{ fontSize: 20 }} />;
      case 'count':
        return <PeopleIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getTypeColor = (type: DiscrepancyType) => {
    switch (type) {
      case 'skip':
        return theme.palette.error.main;
      case 'sleep':
        return theme.palette.warning.main;
      case 'count':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSeverityColor = (severity: DiscrepancyGroup['severity']) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.error.light;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
    }
  };

  const totalDiscrepancies = discrepancies.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const criticalCount = discrepancies
    .filter((d) => d.severity === 'critical')
    .reduce((sum, item) => sum + item.count, 0);

  // Prepare Chart.js data
  const chartData = {
    labels: discrepancies.map((item) => item.label),
    datasets: [
      {
        data: discrepancies.map((item) => item.count),
        backgroundColor: discrepancies.map((item) => getTypeColor(item.type)),
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      legend: {
        display: false,
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
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / totalDiscrepancies) * 100).toFixed(1);
            return [`${label}: ${value} (${percentage}%)`];
          },
        },
      },
    },
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Discrepancias
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen por tipo
            </Typography>
          </Box>

          {criticalCount > 0 && (
            <Chip
              icon={<WarningAmberIcon />}
              label={`${criticalCount} crítica${criticalCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {totalDiscrepancies === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 48,
                color: theme.palette.text.disabled,
                mb: 2,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              No hay discrepancias registradas
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                height: 200,
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Doughnut data={chartData} options={chartOptions} />
            </Box>

            <Stack spacing={1.5}>
              {discrepancies.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: alpha(getTypeColor(item.type), 0.05),
                    border: `1px solid ${alpha(getTypeColor(item.type), 0.2)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        backgroundColor: alpha(getTypeColor(item.type), 0.1),
                        color: getTypeColor(item.type),
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.25 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Severidad: {item.severity}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: getTypeColor(item.type),
                      }}
                    >
                      {item.count}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {((item.count / totalDiscrepancies) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<VisibilityIcon />}
          onClick={onClick}
          disabled={totalDiscrepancies === 0}
        >
          Ver Detalles
        </Button>
      </Box>
    </Card>
  );
};

export default DiscrepanciesWidget;
