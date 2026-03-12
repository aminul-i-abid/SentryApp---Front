'use client';

import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
  type MRT_Row,
} from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  alpha,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Discrepancy } from '../../types/dashboardTypes';

interface DiscrepanciesDataGridProps {
  discrepancies: Discrepancy[];
  isLoading?: boolean;
  onRowClick?: (discrepancy: Discrepancy) => void;
  onSelectionChange?: (selectedDiscrepancies: Discrepancy[]) => void;
}

const DiscrepanciesDataGrid: React.FC<DiscrepanciesDataGridProps> = ({
  discrepancies,
  isLoading = false,
  onRowClick,
  onSelectionChange,
}) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  // Handle row selection change
  const handleRowSelectionChange = (updater: MRT_RowSelectionState | ((old: MRT_RowSelectionState) => MRT_RowSelectionState)) => {
    const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    setRowSelection(newSelection);

    // Notify parent of selected discrepancies
    if (onSelectionChange) {
      const selectedRows = Object.keys(newSelection)
        .filter((key) => newSelection[key])
        .map((key) => discrepancies[parseInt(key)]);
      onSelectionChange(selectedRows);
    }
  };

  // Get discrepancy type color
  const getDiscrepancyTypeColor = (type: string): 'warning' | 'error' | 'info' => {
    switch (type.toLowerCase()) {
      case 'skip':
        return 'warning';
      case 'sleep':
        return 'error';
      case 'count':
        return 'info';
      default:
        return 'info';
    }
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

  // Get variance icon
  const getVarianceIcon = (variance: number) => {
    if (variance === 0) return <CheckCircleIcon fontSize="small" color="success" />;
    if (Math.abs(variance) > 5) return <ErrorIcon fontSize="small" color="error" />;
    return <WarningIcon fontSize="small" color="warning" />;
  };

  // Define columns
  const columns = useMemo<MRT_ColumnDef<Discrepancy>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Fecha',
        size: 120,
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return (
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {format(new Date(date), 'dd/MMM/yyyy', { locale: es })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(date), 'HH:mm', { locale: es })}
              </Typography>
            </Box>
          );
        },
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'roomNumber',
        header: 'Habitación',
        size: 100,
        Cell: ({ cell, row }) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {cell.getValue<string>()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.blockName}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'blockName',
        header: 'Bloque',
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        accessorKey: 'discrepancyType',
        header: 'Tipo',
        size: 120,
        Cell: ({ cell }) => {
          const type = cell.getValue<string>();
          return (
            <Chip
              label={getDiscrepancyTypeLabel(type)}
              color={getDiscrepancyTypeColor(type)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          );
        },
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'Salto', value: 'skip' },
          { text: 'Dormida', value: 'sleep' },
          { text: 'Recuento', value: 'count' },
        ],
      },
      {
        accessorKey: 'expectedStatus',
        header: 'Estado Esperado',
        size: 140,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              {cell.getValue<string>()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'actualStatus',
        header: 'Estado Real',
        size: 140,
        Cell: ({ cell }) => (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
              color: 'secondary.main',
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              {cell.getValue<string>()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'varianceValue',
        header: 'Variación',
        size: 120,
        Cell: ({ cell }) => {
          const variance = cell.getValue<number>();
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {getVarianceIcon(variance)}
              <Typography
                variant="body2"
                fontWeight={600}
                color={
                  variance === 0
                    ? 'success.main'
                    : Math.abs(variance) > 5
                    ? 'error.main'
                    : 'warning.main'
                }
              >
                {variance > 0 ? '+' : ''}
                {variance}
              </Typography>
            </Stack>
          );
        },
        sortingFn: 'basic',
      },
      {
        accessorKey: 'resolved',
        header: 'Estado',
        size: 120,
        Cell: ({ cell }) => {
          const resolved = cell.getValue<boolean>();
          return (
            <Chip
              label={resolved ? 'Resuelto' : 'Pendiente'}
              color={resolved ? 'success' : 'default'}
              size="small"
              icon={resolved ? <CheckCircleIcon /> : <WarningIcon />}
              sx={{ fontWeight: 500 }}
            />
          );
        },
        filterVariant: 'checkbox',
      },
      {
        accessorKey: 'priority',
        header: 'Prioridad',
        size: 110,
        Cell: ({ cell }) => {
          const priority = cell.getValue<string>();
          const getPriorityColor = () => {
            switch (priority?.toLowerCase()) {
              case 'high':
              case 'alta':
                return 'error';
              case 'medium':
              case 'media':
                return 'warning';
              case 'low':
              case 'baja':
                return 'success';
              default:
                return 'default';
            }
          };

          const getPriorityLabel = () => {
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

          return (
            <Chip
              label={getPriorityLabel()}
              color={getPriorityColor() as any}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          );
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onRowClick?.(row.original);
              }}
              sx={{
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onRowClick]
  );

  // Handle row click
  const handleRowClick = (row: MRT_Row<Discrepancy>) => {
    onRowClick?.(row.original);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <MaterialReactTable
        columns={columns}
        data={discrepancies}
        localization={MRT_Localization_ES}
        enableRowSelection
        enableMultiRowSelection
        onRowSelectionChange={handleRowSelectionChange}
        state={{
          isLoading,
          rowSelection,
          showAlertBanner: false,
          showProgressBars: isLoading,
        }}
        initialState={{
          pagination: {
            pageSize: 25,
            pageIndex: 0,
          },
          sorting: [
            {
              id: 'date',
              desc: true,
            },
          ],
          density: 'compact',
        }}
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => handleRowClick(row),
          sx: {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
            },
            '&.Mui-selected': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
            '&.Mui-selected:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
            },
          },
        })}
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            fontWeight: 600,
            fontSize: '0.875rem',
            borderBottom: '2px solid',
            borderColor: 'divider',
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
        }}
        muiTopToolbarProps={{
          sx: {
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
        }}
        muiBottomToolbarProps={{
          sx: {
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
          },
        }}
        muiTableContainerProps={{
          sx: {
            maxHeight: 'calc(100vh - 400px)',
            minHeight: '400px',
          },
        }}
        muiPaginationProps={{
          rowsPerPageOptions: [10, 25, 50, 100],
          showFirstButton: true,
          showLastButton: true,
        }}
        enableStickyHeader
        enableColumnResizing
        enableColumnOrdering
        enablePinning
        enableDensityToggle
        enableFullScreenToggle
        enableGlobalFilter
        enableColumnFilters
        enableColumnFilterModes
        enableSorting
        enableMultiSort
        positionGlobalFilter="left"
        renderTopToolbarCustomActions={({ table }) => {
          const selectedCount = Object.keys(rowSelection).length;
          return selectedCount > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
              <Typography variant="body2" color="primary" fontWeight={600}>
                {selectedCount} {selectedCount === 1 ? 'discrepancia seleccionada' : 'discrepancias seleccionadas'}
              </Typography>
            </Box>
          ) : null;
        }}
      />
    </Box>
  );
};

export default DiscrepanciesDataGrid;
