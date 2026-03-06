import CirclePagination from "@/components/ui/CirclePagination";
import {
  Box,
  Checkbox,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export interface TableColumnDef<T> {
  id: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render: (row: T) => ReactNode;
}

interface PaginationConfig {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
}

export interface StyledTableProps<T> {
  columns: TableColumnDef<T>[];
  data: T[];
  getRowId: (row: T) => string;

  /* loading / empty */
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;

  /* selection */
  selectable?: boolean;
  selected?: string[];
  onSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow?: (event: React.MouseEvent<unknown>, id: string) => void;
  isRowSelectable?: (row: T) => boolean;

  /* sorting */
  order?: "asc" | "desc";
  orderBy?: string;
  onSort?: (columnId: string) => void;

  /* row interaction */
  onRowClick?: (row: T) => void;

  /* actions column */
  renderActions?: (row: T) => ReactNode;
  actionsLabel?: string;

  /* layout */
  minWidth?: number;

  /* pagination */
  pagination?: PaginationConfig;

  /* bulk toolbar rendered above the table when items are selected */
  bulkToolbar?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StyledTable<T>({
  columns,
  data,
  getRowId,
  loading = false,
  loadingMessage = "Cargando...",
  emptyMessage = "No se encontraron datos",
  selectable = false,
  selected = [],
  onSelectAll,
  onSelectRow,
  isRowSelectable,
  order,
  orderBy,
  onSort,
  onRowClick,
  renderActions,
  actionsLabel = "Acciones",
  minWidth = 1200,
  pagination,
  bulkToolbar,
}: StyledTableProps<T>) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const hasActions = !!renderActions;
  const totalColumns =
    columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);

  /* ---- helpers ---- */
  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const selectableData = isRowSelectable ? data.filter(isRowSelectable) : data;
  const selectableCount = selectableData.length;

  /* ---- derive visible data (pagination done externally or here) ---- */
  const visibleData = data;

  /* ---- shared colgroup so both header & body tables have identical column widths ---- */
  const colGroup = (
    <colgroup>
      {selectable && <col style={{ width: 50 }} />}
      {columns.map((col) => (
        <col key={col.id} style={col.width ? { width: col.width } : {}} />
      ))}
      {hasActions && <col style={{ width: 120 }} />}
    </colgroup>
  );

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "none",
        boxShadow: "none",
        backgroundColor: "transparent",
        overflowX: "auto",
      }}
    >
      {/* Bulk toolbar */}
      {bulkToolbar && selected.length > 0 && bulkToolbar}

      {/* Outer wrapper – single minWidth keeps header & body aligned when scrolling */}
      <Box sx={{ minWidth }}>
        {/* HEADER TABLE – px offsets match body wrapper border(1px) + padding(6px) */}
        {/* px:7px compensates for body wrapper border(1px) + padding(6px) = 7px per side */}
        <Box sx={{ px: "0px" }}>
          <Table
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 4px",
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            {colGroup}
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: isDark ? "#1e1e1e" : "#fff",
                    py: "10px",
                    borderTop: `1px solid ${isDark ? "#444" : "#e6e3e3"}`,
                    borderBottom: `1px solid ${isDark ? "#444" : "#e6e3e3"}`,
                    "&:first-of-type": {
                      borderLeft: `1px solid ${isDark ? "#444" : "#e6e3e3"}`,
                      borderTopLeftRadius: "12px",
                      borderBottomLeftRadius: "12px",
                    },
                    "&:last-of-type": {
                      borderRight: `1px solid ${isDark ? "#444" : "#e6e3e3"}`,
                      borderTopRightRadius: "12px",
                      borderBottomRightRadius: "12px",
                    },
                  },
                }}
              >
                {selectable && (
                  <TableCell padding="checkbox" sx={{ width: 50 }}>
                    <Checkbox
                      indeterminate={
                        selected.length > 0 && selected.length < selectableCount
                      }
                      checked={
                        selectableCount > 0 &&
                        selected.length === selectableCount
                      }
                      onChange={onSelectAll}
                      sx={{
                        color: "#415EDE",
                        "&.Mui-checked": { color: "#415EDE" },
                        "&.MuiCheckbox-indeterminate": { color: "#415EDE" },
                      }}
                    />
                  </TableCell>
                )}

                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    sx={{
                      color: "#415EDE",
                      fontWeight: 600,
                      ...(col.width ? { width: col.width } : {}),
                    }}
                    sortDirection={orderBy === col.id ? order : false}
                  >
                    {col.sortable && onSort ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => onSort(col.id)}
                        sx={{
                          color: "#415EDE !important",
                          "&.Mui-active": { color: "#415EDE !important" },
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

                {hasActions && (
                  <TableCell
                    align="center"
                    sx={{ color: "#415EDE", fontWeight: 600, width: 120 }}
                  >
                    {actionsLabel}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
          </Table>
        </Box>

        {/* BODY WRAPPER */}
        <div
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            border: `1px solid ${isDark ? "#444" : "#eaeaea"}`,
            borderRadius: "12px",
            padding: "4px 6px",
          }}
        >
          <Table
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 5px",
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            {colGroup}
            <TableBody>
              {/* Loading state */}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        py: 5,
                      }}
                    >
                      <CircularProgress size={32} />
                      <span style={{ color: "#888" }}>{loadingMessage}</span>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                /* Empty state */
                <TableRow>
                  <TableCell colSpan={totalColumns} align="center">
                    <div style={{ padding: "40px 0", color: "#888" }}>
                      {emptyMessage}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* Data rows */
                visibleData.map((row) => {
                  const rowId = getRowId(row);
                  const rowSelected = isSelected(rowId);

                  return (
                    <TableRow
                      key={rowId}
                      hover
                      selected={rowSelected}
                      onClick={() => onRowClick?.(row)}
                      sx={{
                        cursor: onRowClick ? "pointer" : "default",
                        "& td": {
                          backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                          borderBottom: "none",
                          py: "3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          "&:first-of-type": {
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                          },
                          "&:last-of-type": {
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                          },
                        },
                      }}
                    >
                      {selectable && (
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isRowSelectable && !isRowSelectable(row))
                              return;
                            onSelectRow?.(e, rowId);
                          }}
                        >
                          <Checkbox
                            checked={rowSelected}
                            disabled={
                              isRowSelectable ? !isRowSelectable(row) : false
                            }
                            sx={{
                              color: "#415EDE",
                              "&.Mui-checked": { color: "#415EDE" },
                            }}
                          />
                        </TableCell>
                      )}

                      {columns.map((col) => (
                        <TableCell key={col.id} align={col.align || "left"}>
                          {col.render(row)}
                        </TableCell>
                      ))}

                      {hasActions && (
                        <TableCell
                          align="center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderActions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Box>
      {/* end outer minWidth wrapper */}

      {pagination && (
        <CirclePagination
          count={pagination.count}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          onPageChange={pagination.onPageChange}
        />
      )}
    </TableContainer>
  );
}
