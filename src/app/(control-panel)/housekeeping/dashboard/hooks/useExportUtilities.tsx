/**
 * useExportUtilities Hook
 *
 * Provides export functionality for dashboard data
 * - Export to Excel (xlsx)
 * - Export to PDF (jspdf)
 * - Export chart as PNG (html2canvas)
 * - Export as CSV
 *
 * FASE 5.4 - Housekeeping Dashboard
 */

import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import type { DailySummary } from '@/store/housekeeping/housekeepingTypes';
import type { DashboardStats } from '../types/dashboardTypes';

/**
 * Export options
 */
interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

/**
 * Chart export options
 */
interface ChartExportOptions extends ExportOptions {
  elementId: string;
  backgroundColor?: string;
  scale?: number;
}

/**
 * Hook state
 */
interface UseExportUtilitiesState {
  isExporting: boolean;
  exportError: string | null;
}

/**
 * Hook return type
 */
interface UseExportUtilitiesReturn extends UseExportUtilitiesState {
  exportToExcel: (data: DailySummary | DailySummary[], options?: ExportOptions) => Promise<void>;
  exportToPDF: (data: DailySummary, stats: DashboardStats, options?: ExportOptions) => Promise<void>;
  exportChartAsPNG: (options: ChartExportOptions) => Promise<void>;
  exportToCSV: (data: DailySummary | DailySummary[], options?: ExportOptions) => Promise<void>;
  resetError: () => void;
}

/**
 * Custom hook for dashboard export utilities
 *
 * Provides comprehensive export functionality for dashboard data
 * Supports Excel, PDF, PNG, and CSV formats
 *
 * @returns Export functions and state
 */
export const useExportUtilities = (): UseExportUtilitiesReturn => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /**
   * Generate filename with timestamp
   */
  const generateFilename = useCallback(
    (baseName: string, extension: string, includeTimestamp: boolean = true): string => {
      const timestamp = includeTimestamp
        ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}`
        : '';
      return `${baseName}${timestamp}.${extension}`;
    },
    []
  );

  /**
   * Export data to Excel format
   */
  const exportToExcel = useCallback(
    async (
      data: DailySummary | DailySummary[],
      options: ExportOptions = {}
    ): Promise<void> => {
      setIsExporting(true);
      setExportError(null);

      try {
        const dataArray = Array.isArray(data) ? data : [data];

        // Prepare data for Excel
        const excelData = dataArray.map((summary) => ({
          Date: format(new Date(summary.date), 'yyyy-MM-dd'),
          'Total Rooms': summary.occupancy.totalRooms,
          'Expected Occupied': summary.occupancy.expectedOccupiedRooms,
          'Actual Occupied': summary.occupancy.actualOccupiedRooms,
          'Variance %': summary.occupancy.variancePercent.toFixed(2),
          'Skip Discrepancies': summary.discrepancies.skip,
          'Sleep Discrepancies': summary.discrepancies.sleep,
          'Count Discrepancies': summary.discrepancies.count,
          'Total Tasks': summary.housekeeping.totalTasksAssigned,
          'Tasks Completed': summary.housekeeping.tasksCompleted,
          'Tasks Pending': summary.housekeeping.tasksPending,
          'Tasks In Progress': summary.housekeeping.tasksInProgress,
          'Completion Rate %': summary.housekeeping.completionRate.toFixed(2),
          'New Alerts': summary.maintenance.newAlerts,
          'Resolved Alerts': summary.maintenance.resolvedAlerts,
          'Critical Pending': summary.maintenance.criticalPending,
          'Last Updated': format(new Date(summary.lastUpdated), 'yyyy-MM-dd HH:mm:ss'),
        }));

        // Create workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard Data');

        // Auto-size columns
        const maxWidth = 20;
        const columnWidths = Object.keys(excelData[0] || {}).map((key) => ({
          wch: Math.min(key.length + 2, maxWidth),
        }));
        worksheet['!cols'] = columnWidths;

        // Generate filename
        const filename = options.filename
          ? `${options.filename}.xlsx`
          : generateFilename(
              'housekeeping_dashboard',
              'xlsx',
              options.includeTimestamp ?? true
            );

        // Write file
        XLSX.writeFile(workbook, filename);

        console.log(`[useExportUtilities] Excel export successful: ${filename}`);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to export to Excel';
        setExportError(error);
        console.error('[useExportUtilities] Excel export error:', err);
        throw new Error(error);
      } finally {
        setIsExporting(false);
      }
    },
    [generateFilename]
  );

  /**
   * Export data to PDF format
   */
  const exportToPDF = useCallback(
    async (
      data: DailySummary,
      stats: DashboardStats,
      options: ExportOptions = {}
    ): Promise<void> => {
      setIsExporting(true);
      setExportError(null);

      try {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 20;

        // Title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Housekeeping Dashboard Report', pageWidth / 2, yPosition, {
          align: 'center',
        });
        yPosition += 15;

        // Date
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Report Date: ${format(new Date(data.date), 'MMMM dd, yyyy')}`,
          pageWidth / 2,
          yPosition,
          { align: 'center' }
        );
        yPosition += 15;

        // Occupancy Section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Occupancy Overview', 15, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total Rooms: ${data.occupancy.totalRooms}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Expected Occupied: ${data.occupancy.expectedOccupiedRooms}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Actual Occupied: ${data.occupancy.actualOccupiedRooms}`, 20, yPosition);
        yPosition += 6;
        pdf.text(
          `Variance: ${data.occupancy.variancePercent.toFixed(2)}%`,
          20,
          yPosition
        );
        yPosition += 12;

        // Discrepancies Section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Discrepancies', 15, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Skip Discrepancies: ${data.discrepancies.skip}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Sleep Discrepancies: ${data.discrepancies.sleep}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Count Discrepancies: ${data.discrepancies.count}`, 20, yPosition);
        yPosition += 12;

        // Housekeeping Section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Housekeeping Tasks', 15, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total Tasks Assigned: ${data.housekeeping.totalTasksAssigned}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Tasks Completed: ${data.housekeeping.tasksCompleted}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Tasks Pending: ${data.housekeeping.tasksPending}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Tasks In Progress: ${data.housekeeping.tasksInProgress}`, 20, yPosition);
        yPosition += 6;
        pdf.text(
          `Completion Rate: ${data.housekeeping.completionRate.toFixed(2)}%`,
          20,
          yPosition
        );
        yPosition += 12;

        // Maintenance Section
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Maintenance Alerts', 15, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`New Alerts: ${data.maintenance.newAlerts}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Resolved Alerts: ${data.maintenance.resolvedAlerts}`, 20, yPosition);
        yPosition += 6;
        pdf.text(`Critical Pending: ${data.maintenance.criticalPending}`, 20, yPosition);
        yPosition += 12;

        // Footer
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );

        // Generate filename
        const filename = options.filename
          ? `${options.filename}.pdf`
          : generateFilename(
              'housekeeping_dashboard',
              'pdf',
              options.includeTimestamp ?? true
            );

        // Save PDF
        pdf.save(filename);

        console.log(`[useExportUtilities] PDF export successful: ${filename}`);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to export to PDF';
        setExportError(error);
        console.error('[useExportUtilities] PDF export error:', err);
        throw new Error(error);
      } finally {
        setIsExporting(false);
      }
    },
    [generateFilename]
  );

  /**
   * Export chart as PNG image
   */
  const exportChartAsPNG = useCallback(
    async (options: ChartExportOptions): Promise<void> => {
      setIsExporting(true);
      setExportError(null);

      try {
        const element = document.getElementById(options.elementId);

        if (!element) {
          throw new Error(`Element with ID "${options.elementId}" not found`);
        }

        // Capture element as canvas
        const canvas = await html2canvas(element, {
          backgroundColor: options.backgroundColor || '#ffffff',
          scale: options.scale || 2,
          logging: false,
          useCORS: true,
        });

        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Failed to generate image blob');
          }

          // Generate filename
          const filename = options.filename
            ? `${options.filename}.png`
            : generateFilename(
                'dashboard_chart',
                'png',
                options.includeTimestamp ?? true
              );

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();

          // Cleanup
          URL.revokeObjectURL(url);

          console.log(`[useExportUtilities] PNG export successful: ${filename}`);
          setIsExporting(false);
        }, 'image/png');
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to export chart as PNG';
        setExportError(error);
        console.error('[useExportUtilities] PNG export error:', err);
        setIsExporting(false);
        throw new Error(error);
      }
    },
    [generateFilename]
  );

  /**
   * Export data to CSV format
   */
  const exportToCSV = useCallback(
    async (
      data: DailySummary | DailySummary[],
      options: ExportOptions = {}
    ): Promise<void> => {
      setIsExporting(true);
      setExportError(null);

      try {
        const dataArray = Array.isArray(data) ? data : [data];

        // Prepare CSV headers
        const headers = [
          'Date',
          'Total Rooms',
          'Expected Occupied',
          'Actual Occupied',
          'Variance %',
          'Skip Discrepancies',
          'Sleep Discrepancies',
          'Count Discrepancies',
          'Total Tasks',
          'Tasks Completed',
          'Tasks Pending',
          'Tasks In Progress',
          'Completion Rate %',
          'New Alerts',
          'Resolved Alerts',
          'Critical Pending',
          'Last Updated',
        ];

        // Prepare CSV rows
        const rows = dataArray.map((summary) => [
          format(new Date(summary.date), 'yyyy-MM-dd'),
          summary.occupancy.totalRooms,
          summary.occupancy.expectedOccupiedRooms,
          summary.occupancy.actualOccupiedRooms,
          summary.occupancy.variancePercent.toFixed(2),
          summary.discrepancies.skip,
          summary.discrepancies.sleep,
          summary.discrepancies.count,
          summary.housekeeping.totalTasksAssigned,
          summary.housekeeping.tasksCompleted,
          summary.housekeeping.tasksPending,
          summary.housekeeping.tasksInProgress,
          summary.housekeeping.completionRate.toFixed(2),
          summary.maintenance.newAlerts,
          summary.maintenance.resolvedAlerts,
          summary.maintenance.criticalPending,
          format(new Date(summary.lastUpdated), 'yyyy-MM-dd HH:mm:ss'),
        ]);

        // Build CSV content
        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.join(',')),
        ].join('\n');

        // Create blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Generate filename
        const filename = options.filename
          ? `${options.filename}.csv`
          : generateFilename(
              'housekeeping_dashboard',
              'csv',
              options.includeTimestamp ?? true
            );

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);

        console.log(`[useExportUtilities] CSV export successful: ${filename}`);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to export to CSV';
        setExportError(error);
        console.error('[useExportUtilities] CSV export error:', err);
        throw new Error(error);
      } finally {
        setIsExporting(false);
      }
    },
    [generateFilename]
  );

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    isExporting,
    exportError,
    exportToExcel,
    exportToPDF,
    exportChartAsPNG,
    exportToCSV,
    resetError,
  };
};

export default useExportUtilities;
