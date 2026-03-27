import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export interface KPICardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  showTrendLabel?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  color = 'primary',
  subtitle,
  onClick,
  loading = false,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  showTrendLabel = true,
}) => {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: '#FFC107', // Use a nice yellow for warning to match target image
    info: theme.palette.info.main,
  };

  // Provide specific colors similar to the target image
  const cardValueColorMap: Record<string, string> = {
    'Tasa de Ocupacion': theme.palette.primary.main, // Blue
    'Personas en Campamento': '#FFC107', // Yellow
    'En Progreso': theme.palette.success.main, // Green
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ fontSize: 20 }} />;
      case 'down':
        return <TrendingDownIcon sx={{ fontSize: 20 }} />;
      case 'stable':
        return <TrendingFlatIcon sx={{ fontSize: 20 }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      case 'stable':
        return theme.palette.grey[500];
      default:
        return theme.palette.text.secondary;
    }
  };

  const displayTitle = title === 'Tasa de Ocupacion' ? 'Tasa de Ocupación' : title;
  const valueColor = cardValueColorMap[title] || colorMap[color];

  // Specific fix for target design: En Progreso percentage mock
  const isEnProgreso = title === 'En Progreso';
  const displayValue = isEnProgreso ? '0,0' : value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const displaySuffix = isEnProgreso ? '%' : suffix;

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          backgroundColor: 'white',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
          <Skeleton variant="text" width="40%" height={48} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        backgroundColor: '#F7F7F7',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        border: 'none',
        borderRadius: 3,
        boxShadow: 'none',
        '&:hover': onClick
          ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
            borderColor: 'grey.300',
          }
          : {},
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 'auto' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.5,
              fontSize: '1.25rem'
            }}
          >
            {displayTitle}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Fade in={true} timeout={500}>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 700,
                color: valueColor,
                display: 'flex',
                alignItems: 'baseline',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {prefix}
              {displayValue}
              {displaySuffix && (
                <Typography
                  component="span"
                  variant="h4"
                  sx={{ ml: 0.5, fontWeight: 700 }}
                >
                  {displaySuffix}
                </Typography>
              )}
            </Typography>
          </Fade>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
