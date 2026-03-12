'use client';

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Divider,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CloudDownload as CloudDownloadIcon,
  InsertDriveFile as InsertDriveFileIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable types not available
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Discrepancy, DiscrepancyFilters } from '../../types/dashboardTypes';

interface DiscrepanciesExportProps {
  discrepancies: Discrepancy[];
  filters: DiscrepancyFilters;
  filename?: string;
}

const DiscrepanciesExport: React.FC<DiscrepanciesExportProps> = ({
  discrepancies,
  filters,
  filename = 'discrepancias',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Get discrepancy type label
  const getDiscrepancyTypeLabel = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'skip':
        return 'Salto';
      case 'sleep':
        return 'Dormida';
      case 'count':
        return 'Recuento';
      default:
        return type;
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority || '-';
    }
  };

  // Calculate summary statistics
  const calculateStatistics = () => {
    const total = discrepancies.length;
    const resolved = discrepancies.filter((d) => d.resolved).length;
    const pending = total - resolved;

    const byType = {
      skip: discrepancies.filter((d) => d.discrepancyType.toLowerCase() === 'skip').length,
      sleep: discrepancies.filter((d) => d.discrepancyType.toLowerCase() === 'sleep').length,
      count: discrepancies.filter((d) => d.discrepancyType.toLowerCase() === 'count').length,
    };

    const byPriority = {
      high: discrepancies.filter((d) => d.priority?.toLowerCase() === 'high').length,
      medium: discrepancies.filter((d) => d.priority?.toLowerCase() === 'medium').length,
      low: discrepancies.filter((d) => d.priority?.toLowerCase() === 'low').length,
    };

    const totalVariance = discrepancies.reduce((sum, d) => sum + Math.abs(d.varianceValue), 0);
    const avgVariance = total > 0 ? totalVariance / total : 0;

    return {
      total,
      resolved,
      pending,
      byType,
      byPriority,
      avgVariance,
    };
  };

  // Export to Excel
  const exportToExcel = async () => {
    setIsExporting(true);
    handleClose();

    try {
      const stats = calculateStatistics();

      // Prepare data for Excel
      const excelData = discrepancies.map((d) => ({
        Fecha: format(new Date(d.date), 'dd/MM/yyyy HH:mm'),
        Habitación: d.roomNumber,
        Bloque: d.blockName,
        Tipo: getDiscrepancyTypeLabel(d.discrepancyType),
        'Estado Esperado': d.expectedStatus,
        'Estado Real': d.actualStatus,
        Variación: d.varianceValue,
        Prioridad: getPriorityLabel(d.priority),
        Estado: d.resolved ? 'Resuelto' : 'Pendiente',
        'Notas de Resolución': d.resolutionNotes || '-',
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['RESUMEN DE DISCREPANCIAS'],
        [''],
        ['Total de Discrepancias', stats.total],
        ['Resueltas', stats.resolved],
        ['Pendientes', stats.pending],
        [''],
        ['POR TIPO'],
        ['Saltos', stats.byType.skip],
        ['Dormidas', stats.byType.sleep],
        ['Recuentos', stats.byType.count],
        [''],
        ['POR PRIORIDAD'],
        ['Alta', stats.byPriority.high],
        ['Media', stats.byPriority.medium],
        ['Baja', stats.byPriority.low],
        [''],
        ['MÉTRICAS'],
        ['Variación Promedio', stats.avgVariance.toFixed(2)],
        [''],
        ['FILTROS APLICADOS'],
        [
          'Rango de Fechas',
          filters.startDate && filters.endDate
            ? `${format(filters.startDate, 'dd/MM/yyyy')} - ${format(filters.endDate, 'dd/MM/yyyy')}`
            : 'Todas las fechas',
        ],
        ['Tipos', filters.discrepancyTypes.length > 0 ? filters.discrepancyTypes.join(', ') : 'Todos'],
        ['Bloques', filters.blockIds.length > 0 ? `${filters.blockIds.length} seleccionados` : 'Todos'],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

      // Data sheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 16 }, // Fecha
        { wch: 12 }, // Habitación
        { wch: 15 }, // Bloque
        { wch: 12 }, // Tipo
        { wch: 16 }, // Estado Esperado
        { wch: 16 }, // Estado Real
        { wch: 10 }, // Variación
        { wch: 12 }, // Prioridad
        { wch: 12 }, // Estado
        { wch: 40 }, // Notas
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Discrepancias');

      // Generate filename with date
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fullFilename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error al exportar a Excel. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    setIsExporting(true);
    handleClose();

    try {
      const stats = calculateStatistics();
      const doc = new jsPDF('landscape');

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Discrepancias', 14, 20);

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado: ${format(new Date(), "dd 'de' MMMM, yyyy 'a las' HH:mm")}`, 14, 28);

      // Summary statistics
      let yPos = 38;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen', 14, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryLines = [
        `Total de Discrepancias: ${stats.total}`,
        `Resueltas: ${stats.resolved} (${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%)`,
        `Pendientes: ${stats.pending} (${stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)`,
        '',
        `Por Tipo - Saltos: ${stats.byType.skip}, Dormidas: ${stats.byType.sleep}, Recuentos: ${stats.byType.count}`,
        `Por Prioridad - Alta: ${stats.byPriority.high}, Media: ${stats.byPriority.medium}, Baja: ${stats.byPriority.low}`,
        `Variación Promedio: ${stats.avgVariance.toFixed(2)}`,
      ];

      summaryLines.forEach((line) => {
        doc.text(line, 14, yPos);
        yPos += 6;
      });

      // Filters
      if (filters.startDate || filters.endDate || filters.discrepancyTypes.length > 0 || filters.blockIds.length > 0) {
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros Aplicados:', 14, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');

        if (filters.startDate && filters.endDate) {
          doc.text(
            `Rango: ${format(filters.startDate, 'dd/MM/yyyy')} - ${format(filters.endDate, 'dd/MM/yyyy')}`,
            14,
            yPos
          );
          yPos += 6;
        }
        if (filters.discrepancyTypes.length > 0) {
          doc.text(`Tipos: ${filters.discrepancyTypes.map(getDiscrepancyTypeLabel).join(', ')}`, 14, yPos);
          yPos += 6;
        }
      }

      // Table
      yPos += 5;

      const tableData = discrepancies.map((d) => [
        format(new Date(d.date), 'dd/MM/yyyy'),
        d.roomNumber,
        d.blockName,
        getDiscrepancyTypeLabel(d.discrepancyType),
        d.expectedStatus,
        d.actualStatus,
        d.varianceValue.toString(),
        getPriorityLabel(d.priority),
        d.resolved ? 'Resuelto' : 'Pendiente',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          [
            'Fecha',
            'Habitación',
            'Bloque',
            'Tipo',
            'Esperado',
            'Real',
            'Var.',
            'Prioridad',
            'Estado',
          ],
        ],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 22 },
          4: { cellWidth: 28 },
          5: { cellWidth: 28 },
          6: { cellWidth: 15 },
          7: { cellWidth: 20 },
          8: { cellWidth: 20 },
        },
        didDrawPage: (data) => {
          // Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        },
      });

      // Save PDF
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const fullFilename = `${filename}_${timestamp}.pdf`;
      doc.save(fullFilename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error al exportar a PDF. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    setIsExporting(true);
    handleClose();

    try {
      // Prepare CSV data
      const headers = [
        'Fecha',
        'Habitación',
        'Bloque',
        'Tipo',
        'Estado Esperado',
        'Estado Real',
        'Variación',
        'Prioridad',
        'Estado',
        'Notas de Resolución',
      ];

      const rows = discrepancies.map((d) => [
        format(new Date(d.date), 'dd/MM/yyyy HH:mm'),
        d.roomNumber,
        d.blockName,
        getDiscrepancyTypeLabel(d.discrepancyType),
        d.expectedStatus,
        d.actualStatus,
        d.varianceValue.toString(),
        getPriorityLabel(d.priority),
        d.resolved ? 'Resuelto' : 'Pendiente',
        d.resolutionNotes ? `"${d.resolutionNotes.replace(/"/g, '""')}"` : '-',
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);

      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const fullFilename = `${filename}_${timestamp}.csv`;
      link.setAttribute('download', fullFilename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Error al exportar a CSV. Por favor, intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
        onClick={handleClick}
        disabled={isExporting || discrepancies.length === 0}
        sx={{
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 220,
            boxShadow: 3,
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Exportar Discrepancias
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {discrepancies.length} {discrepancies.length === 1 ? 'registro' : 'registros'}
          </Typography>
        </Box>

        <MenuItem
          onClick={exportToExcel}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
            },
          }}
        >
          <ListItemIcon>
            <TableChartIcon fontSize="small" sx={{ color: 'success.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="Excel"
            secondary="Con formato y resumen"
            primaryTypographyProps={{ fontWeight: 500 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <MenuItem
          onClick={exportToPDF}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="PDF"
            secondary="Reporte imprimible"
            primaryTypographyProps={{ fontWeight: 500 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <MenuItem
          onClick={exportToCSV}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
            },
          }}
        >
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" sx={{ color: 'info.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="CSV"
            secondary="Para análisis de datos"
            primaryTypographyProps={{ fontWeight: 500 }}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default DiscrepanciesExport;
