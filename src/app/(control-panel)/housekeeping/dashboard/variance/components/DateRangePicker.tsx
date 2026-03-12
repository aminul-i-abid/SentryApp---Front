/**
 * DateRangePicker Component
 *
 * Date range selector with quick select buttons
 * Uses MUI DatePicker with Spanish locale
 *
 * Features:
 * - Start and end date pickers
 * - Quick select buttons (Today, Last 7 days, Last 30 days, This Month)
 * - Spanish locale (es) from date-fns
 * - Validation for date ranges
 * - Min/Max date constraints
 *
 * FASE 5.4 - Variance Analysis Dashboard
 */

import React, { useCallback } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import {
  startOfToday,
  startOfMonth,
  endOfMonth,
  subDays,
  endOfDay,
} from 'date-fns';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Component props
 */
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

/**
 * Quick select button type
 */
type QuickSelectType = 'today' | 'last7' | 'last30' | 'thisMonth';

/**
 * DateRangePicker Component
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate = new Date(),
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /**
   * Handle start date change
   */
  const handleStartDateChange = useCallback(
    (newStartDate: Date | null) => {
      if (!newStartDate) return;

      // Ensure start date is not after end date
      if (newStartDate > endDate) {
        onChange(newStartDate, newStartDate);
      } else {
        onChange(newStartDate, endDate);
      }
    },
    [endDate, onChange]
  );

  /**
   * Handle end date change
   */
  const handleEndDateChange = useCallback(
    (newEndDate: Date | null) => {
      if (!newEndDate) return;

      // Ensure end date is not before start date
      if (newEndDate < startDate) {
        onChange(newEndDate, newEndDate);
      } else {
        onChange(startDate, newEndDate);
      }
    },
    [startDate, onChange]
  );

  /**
   * Handle quick select button click
   */
  const handleQuickSelect = useCallback(
    (type: QuickSelectType) => {
      const today = startOfToday();
      let newStartDate: Date;
      let newEndDate: Date;

      switch (type) {
        case 'today':
          newStartDate = today;
          newEndDate = endOfDay(today);
          break;

        case 'last7':
          newStartDate = subDays(today, 6);
          newEndDate = endOfDay(today);
          break;

        case 'last30':
          newStartDate = subDays(today, 29);
          newEndDate = endOfDay(today);
          break;

        case 'thisMonth':
          newStartDate = startOfMonth(today);
          newEndDate = endOfMonth(today);
          // Don't go beyond today
          if (newEndDate > today) {
            newEndDate = endOfDay(today);
          }
          break;

        default:
          return;
      }

      onChange(newStartDate, newEndDate);
    },
    [onChange]
  );

  /**
   * Check if quick select is active
   */
  const isQuickSelectActive = useCallback(
    (type: QuickSelectType): boolean => {
      const today = startOfToday();
      let checkStartDate: Date;
      let checkEndDate: Date;

      switch (type) {
        case 'today':
          checkStartDate = today;
          checkEndDate = endOfDay(today);
          break;

        case 'last7':
          checkStartDate = subDays(today, 6);
          checkEndDate = endOfDay(today);
          break;

        case 'last30':
          checkStartDate = subDays(today, 29);
          checkEndDate = endOfDay(today);
          break;

        case 'thisMonth':
          checkStartDate = startOfMonth(today);
          checkEndDate = endOfMonth(today);
          if (checkEndDate > today) {
            checkEndDate = endOfDay(today);
          }
          break;

        default:
          return false;
      }

      // Compare dates (ignore time)
      return (
        startDate.toDateString() === checkStartDate.toDateString() &&
        endDate.toDateString() === checkEndDate.toDateString()
      );
    },
    [startDate, endDate]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Quick Select Buttons */}
        <Box>
          <Typography
            variant="caption"
            sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 500 }}
          >
            Selección Rápida
          </Typography>
          {isMobile ? (
            <Stack spacing={1}>
              <Button
                variant={isQuickSelectActive('today') ? 'contained' : 'outlined'}
                size="small"
                startIcon={<TodayIcon />}
                onClick={() => handleQuickSelect('today')}
                disabled={disabled}
                fullWidth
              >
                Hoy
              </Button>
              <Button
                variant={isQuickSelectActive('last7') ? 'contained' : 'outlined'}
                size="small"
                startIcon={<DateRangeIcon />}
                onClick={() => handleQuickSelect('last7')}
                disabled={disabled}
                fullWidth
              >
                Últimos 7 días
              </Button>
              <Button
                variant={isQuickSelectActive('last30') ? 'contained' : 'outlined'}
                size="small"
                startIcon={<DateRangeIcon />}
                onClick={() => handleQuickSelect('last30')}
                disabled={disabled}
                fullWidth
              >
                Últimos 30 días
              </Button>
              <Button
                variant={isQuickSelectActive('thisMonth') ? 'contained' : 'outlined'}
                size="small"
                startIcon={<CalendarMonthIcon />}
                onClick={() => handleQuickSelect('thisMonth')}
                disabled={disabled}
                fullWidth
              >
                Este Mes
              </Button>
            </Stack>
          ) : (
            <ButtonGroup variant="outlined" size="small" disabled={disabled}>
              <Button
                variant={isQuickSelectActive('today') ? 'contained' : 'outlined'}
                startIcon={<TodayIcon />}
                onClick={() => handleQuickSelect('today')}
              >
                Hoy
              </Button>
              <Button
                variant={isQuickSelectActive('last7') ? 'contained' : 'outlined'}
                startIcon={<DateRangeIcon />}
                onClick={() => handleQuickSelect('last7')}
              >
                Últimos 7 días
              </Button>
              <Button
                variant={isQuickSelectActive('last30') ? 'contained' : 'outlined'}
                startIcon={<DateRangeIcon />}
                onClick={() => handleQuickSelect('last30')}
              >
                Últimos 30 días
              </Button>
              <Button
                variant={isQuickSelectActive('thisMonth') ? 'contained' : 'outlined'}
                startIcon={<CalendarMonthIcon />}
                onClick={() => handleQuickSelect('thisMonth')}
              >
                Este Mes
              </Button>
            </ButtonGroup>
          )}
        </Box>

        {/* Date Pickers */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 500 }}
            >
              Fecha Inicio
            </Typography>
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, display: 'block', color: 'text.secondary', fontWeight: 500 }}
            >
              Fecha Fin
            </Typography>
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate}
              maxDate={maxDate}
              disabled={disabled}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
