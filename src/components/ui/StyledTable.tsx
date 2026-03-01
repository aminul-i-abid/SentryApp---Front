import CirclePagination from "@/components/ui/CirclePagination";
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Column definition for the StyledTable component.
 */
export interface TableColumnDef<T> {
  /** Unique column identifier (also used for sorting key) */
  id: string;
  /** Header label text */
  label: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Render function for the cell content */
  render: (row: T) => React.ReactNode;
  /** Optional fixed width */
  width?: string | number;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

/**
 * Props for the reusable StyledTable component.
 *
 * Design:
 * - White container with rounded corners and padding on all sides
 * - Header row: white background, #415EDE text, bottom border
 * - Data rows: light gray (#F5F6FA) background with rounded corners and spacing
 */
export interface StyledTableProps<T> {
  /** Column definitions */
  columns: TableColumnDef<T>[];
  /** Data rows */
  data: T[];
  /** Function to extract a unique string id from each row */
  getRowId: (row: T) => string;

  /* Loading / empty states */
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;

  /* Row selection */
  selectable?: boolean;
  selected?: string[];
  onSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow?: (event: React.MouseEvent<unknown>, id: string) => void;

  /* Sorting */
  order?: "asc" | "desc";
  orderBy?: string;
  onSort?: (columnId: string) => void;

  /* Row click */
  onRowClick?: (row: T) => void;

  /* Actions column (rendered as last column) */
  renderActions?: (row: T) => React.ReactNode;
  /** Custom label for the actions column header (default: "Actions") */
  actionsLabel?: string;

  /* Pagination */
  pagination?: {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
  };

  /** Content rendered above the table (e.g. bulk-selection toolbar) */
  bulkToolbar?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function StyledTable<T>({
  columns,
  data,
  getRowId,
  loading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No data found",
  selectable = false,
  selected = [],
  onSelectAll,
  onSelectRow,
  order = "asc",
  orderBy,
  onSort,
  onRowClick,
  renderActions,
  actionsLabel = "Actions",
  pagination,
  bulkToolbar,
}: StyledTableProps<T>) {
  const totalColumns =
    columns.length + (selectable ? 1 : 0) + (renderActions ? 1 : 0);

  const isSelected = (id: string) => selected.includes(id);

  return (
    <>
      {/* Bulk selection toolbar (rendered outside the table container) */}
      {bulkToolbar}

      {/* ---- Table container ---- */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
          p: 2.5,
        }}
      >
        <TableContainer>
          <Table
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 6px",
            }}
          >
            {/* ---------- Header ---------- */}
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "#fff",
                  "& .MuiTableCell-head": {
                    color: "#415EDE",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid #E5E7EB",
                    py: 1.5,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 && selected.length < data.length
                      }
                      checked={
                        data.length > 0 && selected.length === data.length
                      }
                      onChange={onSelectAll}
                      inputProps={{ "aria-label": "select all" }}
                    />
                  </TableCell>
                )}

                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    sx={{ width: col.width }}
                  >
                    {col.sortable && onSort ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => onSort(col.id)}
                        sx={{
                          color: "#415EDE !important",
                          "&.Mui-active": {
                            color: "#415EDE !important",
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: "#415EDE !important",
                          },
                        }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}

                {renderActions && (
                  <TableCell align="right" sx={{ pr: 3 }}>
                    {actionsLabel}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            {/* ---------- Body ---------- */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} sx={{ border: "none" }}>
                    <Box
                      sx={{
                        py: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="subtitle1" color="text.secondary">
                        {loadingMessage}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((row) => {
                  const rowId = getRowId(row);
                  const isItemSelected = isSelected(rowId);

                  return (
                    <TableRow
                      key={rowId}
                      hover={false}
                      role={selectable ? "checkbox" : undefined}
                      aria-checked={selectable ? isItemSelected : undefined}
                      selected={isItemSelected}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      sx={{
                        cursor: onRowClick ? "pointer" : "default",
                        bgcolor: "#F5F6FA",
                        "& .MuiTableCell-root": {
                          borderBottom: "none",
                          py: 1.5,
                          "&:first-of-type": {
                            borderTopLeftRadius: 10,
                            borderBottomLeftRadius: 10,
                          },
                          "&:last-of-type": {
                            borderTopRightRadius: 10,
                            borderBottomRightRadius: 10,
                          },
                        },
                        "&:hover .MuiTableCell-root": {
                          bgcolor: "#EDEEF4",
                        },
                      }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectRow?.(event, rowId);
                            }}
                            inputProps={{
                              "aria-labelledby": `styled-table-checkbox-${rowId}`,
                            }}
                          />
                        </TableCell>
                      )}

                      {columns.map((col) => (
                        <TableCell key={col.id} align={col.align || "left"}>
                          {col.render(row)}
                        </TableCell>
                      ))}

                      {renderActions && (
                        <TableCell align="right" sx={{ pr: 1.5 }}>
                          {renderActions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={totalColumns} sx={{ border: "none" }}>
                    <Box
                      sx={{
                        py: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="subtitle1" color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination && (
          <CirclePagination
            count={pagination.count}
            page={pagination.page}
            rowsPerPage={pagination.rowsPerPage}
            onPageChange={pagination.onPageChange}
          />
        )}
      </Box>
    </>
  );
}

export default StyledTable;
