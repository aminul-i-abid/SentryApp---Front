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
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
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

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Skeleton variant="text" width="80%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
              borderColor: colorMap[color],
              borderWidth: 2,
              borderStyle: 'solid',
            }
          : {},
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          backgroundColor: colorMap[color],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: alpha(colorMap[color], 0.1),
              color: colorMap[color],
              mr: 2,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.disabled">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Fade in={true} timeout={500}>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 700,
                color: colorMap[color],
                display: 'flex',
                alignItems: 'baseline',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {prefix}
              {value.toLocaleString('es-ES', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}
              {suffix && (
                <Typography
                  component="span"
                  variant="h5"
                  sx={{ ml: 0.5, fontWeight: 600 }}
                >
                  {suffix}
                </Typography>
              )}
            </Typography>
          </Fade>
        </Box>

        {/* {(trend || trendValue !== undefined) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 1,
            }}
          >
            {trend && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: getTrendColor(),
                  mr: 1,
                }}
              >
                {getTrendIcon()}
              </Box>
            )}
            {trendValue !== undefined && (
              <Typography
                variant="body2"
                sx={{
                  color: getTrendColor(),
                  fontWeight: 600,
                }}
              >
                {trendValue > 0 ? '+' : ''}
                {trendValue}%
              </Typography>
            )}
            {trendValue !== undefined && showTrendLabel !== false && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs. periodo anterior
              </Typography>
            )}
          </Box>
        )} */}
      </CardContent>
    </Card>
  );
};

export default KPICard;
