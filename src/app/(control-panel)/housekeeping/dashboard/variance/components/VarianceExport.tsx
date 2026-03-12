/**
 * VarianceExport Component
 *
 * Export button group for variance data and charts
 * Supports Excel, PDF, CSV formats for data and PNG for charts
 *
 * Features:
 * - Export variance data as Excel/PDF/CSV
 * - Export charts as PNG
 * - Loading states and progress indicators
 * - Uses useExportUtilities hook
 * - Error handling
 *
 * FASE 5.4 - Variance Analysis Dashboard
 */

import React, { useState, useCallback, RefObject } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useExportUtilities } from '../../hooks/useExportUtilities';
import type { VarianceDataPoint } from '../../types/dashboardTypes';

/**
 * Component props
 */
interface VarianceExportProps {
  data: VarianceDataPoint[];
  chartRef?: RefObject<HTMLDivElement>;
  filename?: string;
  disabled?: boolean;
  showChartExport?: boolean;
}

/**
 * Export format type
 */
type ExportFormat = 'excel' | 'pdf' | 'csv' | 'png';

/**
 * VarianceExport Component
 */
export const VarianceExport: React.FC<VarianceExportProps> = ({
  data,
  chartRef,
  filename = 'varianza_ocupacion',
  disabled = false,
  showChartExport = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Export utilities hook
  const {
    isExporting,
    exportError,
    exportToExcel,
    exportToPDF,
    exportToCSV,
    exportChartAsPNG,
    resetError,
  } = useExportUtilities();

  // Local state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [exportProgress, setExportProgress] = useState<number>(0);

  const menuOpen = Boolean(anchorEl);

  /**
   * Handle menu open
   */
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  /**
   * Handle menu close
   */
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  /**
   * Handle export
   */
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      handleMenuClose();
      setExportProgress(0);

      try {
        switch (format) {
          case 'excel':
            setExportProgress(25);
            await exportToExcel(transformDataForExport(data), {
              filename,
              includeTimestamp: true,
            });
            setSuccessMessage('Datos exportados a Excel exitosamente');
            break;

          case 'pdf':
            setExportProgress(25);
            // Convert variance data to DailySummary format for PDF export
            const summaryData = transformToDailySummary(data[0]);
            const stats = calculateStats(data);
            await exportToPDF(summaryData, stats, {
              filename,
              includeTimestamp: true,
            });
            setSuccessMessage('Datos exportados a PDF exitosamente');
            break;

          case 'csv':
            setExportProgress(25);
            await exportToCSV(transformDataForExport(data), {
              filename,
              includeTimestamp: true,
            });
            setSuccessMessage('Datos exportados a CSV exitosamente');
            break;

          case 'png':
            if (!chartRef?.current) {
              throw new Error('Chart reference not found');
            }
            setExportProgress(25);
            await exportChartAsPNG({
              elementId: chartRef.current.id || 'variance-chart',
              filename: `${filename}_grafico`,
              includeTimestamp: true,
              backgroundColor: theme.palette.background.paper,
              scale: 2,
            });
            setSuccessMessage('Gráfico exportado como PNG exitosamente');
            break;

          default:
            break;
        }
        setExportProgress(100);
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setTimeout(() => setExportProgress(0), 1000);
      }
    },
    [
      data,
      filename,
      chartRef,
      exportToExcel,
      exportToPDF,
      exportToCSV,
      exportChartAsPNG,
      handleMenuClose,
      theme.palette.background.paper,
    ]
  );

  /**
   * Transform variance data for export
   */
  const transformDataForExport = (data: VarianceDataPoint[]): any => {
    return data.map((point) => ({
      date: point.date,
      expectedOccupied: point.expectedOccupied,
      actualOccupied: point.actualOccupied,
      variance: point.variance,
      variancePercent: point.variancePercent,
      discrepanciesCount: point.discrepanciesCount,
    }));
  };

  /**
   * Transform variance data to DailySummary format (for PDF)
   */
  const transformToDailySummary = (point: VarianceDataPoint): any => {
    return {
      date: point.date,
      occupancy: {
        totalRooms: point.expectedOccupied + point.actualOccupied,
        expectedOccupiedRooms: point.expectedOccupied,
        actualOccupiedRooms: point.actualOccupied,
        variancePercent: point.variancePercent,
      },
      discrepancies: {
        skip: Math.floor(point.discrepanciesCount / 3),
        sleep: Math.floor(point.discrepanciesCount / 3),
        count: Math.floor(point.discrepanciesCount / 3),
      },
      housekeeping: {
        totalTasksAssigned: 0,
        tasksCompleted: 0,
        tasksPending: 0,
        tasksInProgress: 0,
        completionRate: 0,
      },
      maintenance: {
        newAlerts: 0,
        resolvedAlerts: 0,
        criticalPending: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  };

  /**
   * Calculate statistics from variance data
   */
  const calculateStats = (data: VarianceDataPoint[]): any => {
    const totalExpected = data.reduce((sum, d) => sum + d.expectedOccupied, 0);
    const totalActual = data.reduce((sum, d) => sum + d.actualOccupied, 0);
    const totalDiscrepancies = data.reduce((sum, d) => sum + d.discrepanciesCount, 0);
    const avgVariance = data.length > 0
      ? data.reduce((sum, d) => sum + d.variancePercent, 0) / data.length
      : 0;

    return {
      totalRooms: totalExpected,
      occupiedRooms: totalActual,
      cleanRooms: 0,
      dirtyRooms: 0,
      maintenanceRooms: 0,
      tasksCompleted: 0,
      tasksTotal: 0,
      discrepanciesCount: totalDiscrepancies,
      averageVariance: avgVariance,
    };
  };

  /**
   * Close success message
   */
  const handleCloseSuccess = useCallback(() => {
    setSuccessMessage('');
  }, []);

  /**
   * Close error message
   */
  const handleCloseError = useCallback(() => {
    resetError();
  }, [resetError]);

  /**
   * Check if data is available
   */
  const hasData = data && data.length > 0;

  return (
    <>
      {isMobile ? (
        // Mobile: Single button with menu
        <>
          <Button
            variant="contained"
            startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={handleMenuOpen}
            disabled={disabled || isExporting || !hasData}
            fullWidth
          >
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </>
      ) : (
        // Desktop: Button group
        <ButtonGroup variant="contained" disabled={disabled || isExporting || !hasData}>
          <Tooltip title="Exportar a Excel">
            <Button
              startIcon={isExporting ? <CircularProgress size={16} /> : <InsertDriveFileIcon />}
              onClick={() => handleExport('excel')}
            >
              Excel
            </Button>
          </Tooltip>
          <Tooltip title="Exportar a CSV">
            <Button
              startIcon={<TableChartIcon />}
              onClick={() => handleExport('csv')}
            >
              CSV
            </Button>
          </Tooltip>
          {showChartExport && chartRef && (
            <Tooltip title="Exportar gráfico como imagen">
              <Button
                startIcon={<ImageIcon />}
                onClick={() => handleExport('png')}
              >
                PNG
              </Button>
            </Tooltip>
          )}
          <Button onClick={handleMenuOpen}>
            <ExpandMoreIcon />
          </Button>
        </ButtonGroup>
      )}

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a PDF</ListItemText>
        </MenuItem>
        {showChartExport && chartRef && (
          <>
            <Divider />
            <MenuItem onClick={() => handleExport('png')}>
              <ListItemIcon>
                <ImageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exportar Gráfico (PNG)</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Progress Indicator */}
      {isExporting && exportProgress > 0 && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} variant="determinate" value={exportProgress} />
          <Box sx={{ minWidth: 35 }}>
            <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
              {`${Math.round(exportProgress)}%`}
            </Box>
          </Box>
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!exportError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {exportError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VarianceExport;
