import { categoryToRoleMap } from "@/app/(control-panel)/tag/enum/RoleTag";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import RowActionMenu from "@/components/ui/RowActionMenu";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import useUser from "@auth/useUser";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChangeRoomSidebar from "../guests/ChangeRoomSidebar";
import SelectedReservationsSidebar from "../guests/SelectedReservationsSidebar";
import RoomDetailSidebar from "../room/components/RoomDetailSidebar";
import ReserveDetailSidebar from "./component/ReserveDetailSidebar";
import { StatusReservation } from "./enum/statusReservation";
import { ReserveResponse } from "./models/ReserveResponse";
import {
  cancelBulkReservations,
  cancelReserve,
  downloadReservesExcel,
  getReserves,
  resetMultiplePinsTtlock,
} from "./reserveService";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-content > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-header > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

type Order = "asc" | "desc";
type OrderBy = "created" | "checkIn" | "checkOut" | "roomNumber";

function ReservesBulk() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);
  const [reserves, setReserves] = useState<ReserveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [unassignedGuests, setUnassignedGuests] = useState<any[]>([]);
  const [openUnassignedModal, setOpenUnassignedModal] = useState(false);
  const [guid, setGuid] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<OrderBy>("roomNumber");
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reserveToDelete, setReserveToDelete] =
    useState<ReserveResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ReserveResponse[]>([]);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [roomSidebarOpen, setRoomSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const { authState } = useAuth();
  const { data: user } = useUser();
  const hasTTLock = user?.modules?.ttlock === true;

  // Estados para selección múltiple
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSelectedSidebarOpen, setIsSelectedSidebarOpen] = useState(false);
  const [isResettingPins, setIsResettingPins] = useState(false);
  const [isChangeRoomSidebarOpen, setIsChangeRoomSidebarOpen] = useState(false);

  const isSentryAdmin = authState.user?.role === "Sentry_Admin";
  const isCompanyAdmin = authState.user?.role === "Company_Admin";

  // Cantidad de filas seleccionables (solo Activas)
  const selectableCount = React.useMemo(
    () =>
      (searchTerm.length >= 5 ? searchResults : reserves).filter(
        (r) => r.status === StatusReservation.ACTIVE,
      ).length,
    [reserves, searchResults, searchTerm],
  );

  const performSearch = useCallback(
    async (searchValue: string) => {
      if (!searchValue || searchValue.length < 5) return;

      try {
        setIsSearching(true);
        const response = await getReserves(
          page + 1,
          rowsPerPage,
          parseInt(id),
          searchValue,
        );

        if (response.succeeded) {
          setSearchResults(response.data.items);
          setSearchTotalCount(response.data.totalCount);
        } else {
          setSearchResults([]);
          setSearchTotalCount(0);
          enqueueSnackbar("Error en la búsqueda", { variant: "error" });
        }
      } catch (error) {
        console.error("Error searching reserves:", error);
        setSearchResults([]);
        setSearchTotalCount(0);
        enqueueSnackbar("Error en la búsqueda", { variant: "error" });
      } finally {
        setIsSearching(false);
      }
    },
    [id, page, rowsPerPage, enqueueSnackbar],
  );

  useEffect(() => {
    fetchReserves();
  }, [page, rowsPerPage]);

  // Effect para manejar el debounce de la búsqueda
  useEffect(() => {
    if (searchTerm.length >= 5) {
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, performSearch]);

  const fetchReserves = async () => {
    try {
      setLoading(true);
      const response = await getReserves(page + 1, rowsPerPage, parseInt(id));
      if (response.succeeded) {
        setReserves(response.data.items);
        setTotalCount(response.data.totalCount);
        setGuid(response.data.guid);
        setCompanyName(response.data.companyName);
      }
    } catch (error) {
      console.error("Error fetching reserves:", error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar título con GUID del bulk
  useEffect(() => {
    if (guid) {
      document.title = `Reservas ${guid} - SentryApp`;
    } else {
      document.title = "Reservas - SentryApp";
    }
  }, [guid]);

  const handleInfoClick = (reserveId: number) => {
    setSelectedReserveId(reserveId);
    setIsReserveModalOpen(true);
  };

  const handleCloseReserveModal = () => {
    setIsReserveModalOpen(false);
    setSelectedReserveId(null);
  };

  const handleOpenRoomSidebar = (roomId: number) => {
    setSelectedRoomId(roomId);
    setRoomSidebarOpen(true);
  };

  const handleCloseRoomSidebar = () => {
    setRoomSidebarOpen(false);
    setSelectedRoomId(null);
  };

  const handleDeleteClick = (reserve: ReserveResponse) => {
    setReserveToDelete(reserve);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reserveToDelete) return;
    try {
      await cancelReserve(reserveToDelete.id, {
        comments: "Reserva cancelada",
      });
      enqueueSnackbar("La reserva se canceló correctamente", {
        variant: "success",
      });
      fetchReserves();
      setIsDeleteModalOpen(false);
      setReserveToDelete(null);
    } catch (error) {
      enqueueSnackbar("Algo salió mal al cancelar la reserva", {
        variant: "error",
      });
      console.error("Error canceling reservation:", error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setReserveToDelete(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
    if (value.length < 5) {
      setIsSearching(false);
      setSearchResults([]);
      setSearchTotalCount(0);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setSearchResults([]);
    setSearchTotalCount(0);
    setPage(0);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleCloseUnassignedModal = () => {
    setOpenUnassignedModal(false);
  };

  const handleCancelBulkReservations = () => {
    if (selectedRows.size === 0) return;
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelBulkReservations = async () => {
    const selectedReserves = Array.from(selectedRows).map(
      (index) => sortedReserves[index],
    );
    const reserveIds = selectedReserves.map((reserve) => reserve.id);

    try {
      const response = await cancelBulkReservations(reserveIds);

      if (response.succeeded) {
        setSelectedRows(new Set());
        setSelectAll(false);
        await fetchReserves();
        enqueueSnackbar("Se están procesando las cancelaciones de reservas", {
          variant: "success",
        });
      } else {
        console.error("Error al cancelar reservas:", response.errors);
        const errorMessage =
          response.errors?.[0] ||
          response.message?.[0] ||
          "Error al cancelar las reservas";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      console.error("Error al cancelar reservas:", error);
      enqueueSnackbar("Error al cancelar las reservas", { variant: "error" });
    }
  };

  const handleResetPinsBulk = async () => {
    if (selectedRows.size === 0 || isResettingPins) return;
    setIsResettingPins(true);
    try {
      const selected = Array.from(selectedRows).map(
        (index) => sortedReserves[index],
      ) as any[];
      const reservationGuestIds = Array.from(
        new Set(
          selected
            .map(
              (r) =>
                r?.reservationGuestId ??
                r?.guestId ??
                r?.idReservationGuest ??
                r?.reservationGuest?.id ??
                r?.guest?.id,
            )
            .filter((id: any) => typeof id === "number"),
        ),
      );

      if (reservationGuestIds.length === 0) {
        enqueueSnackbar("No hay huéspedes válidos para resetear PIN", {
          variant: "info",
        });
        return;
      }

      const response = await resetMultiplePinsTtlock(reservationGuestIds);
      if (response.succeeded) {
        enqueueSnackbar("Se están procesando los reseteos de PIN", {
          variant: "success",
        });
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.message?.[0] ||
          "Error al resetear PINs";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Error al resetear PINs", { variant: "error" });
    } finally {
      setIsResettingPins(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadReservesExcel(parseInt(id), companyName);
      enqueueSnackbar("Archivo Excel descargado exitosamente", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      enqueueSnackbar("Error al descargar el archivo Excel", {
        variant: "error",
      });
    }
  };

  // Sort the reserves array or search results
  const sortedReserves = React.useMemo(() => {
    const dataToSort = searchTerm.length >= 5 ? searchResults : reserves;
    return [...dataToSort].sort((a, b) => {
      if (orderBy === "roomNumber") {
        const roomA = parseInt(a.roomNumber) || 0;
        const roomB = parseInt(b.roomNumber) || 0;
        return order === "asc" ? roomA - roomB : roomB - roomA;
      } else {
        let valueA: Date;
        let valueB: Date;

        switch (orderBy) {
          case "created":
            valueA = new Date(a.created);
            valueB = new Date(b.created);
            break;
          case "checkIn":
            valueA = new Date(a.checkIn);
            valueB = new Date(b.checkIn);
            break;
          case "checkOut":
            valueA = new Date(a.checkOut);
            valueB = new Date(b.checkOut);
            break;
          default:
            valueA = new Date(a.created);
            valueB = new Date(b.created);
        }

        return order === "asc"
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
    });
  }, [reserves, searchResults, searchTerm, order, orderBy]);

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId as OrderBy);
  };

  /* ---------- StyledTable selection helpers (using row id strings) ---------- */
  const selectedIds = useMemo(() => {
    return Array.from(selectedRows)
      .map((index) => {
        const r = sortedReserves[index];
        return r ? String(r.id) : "";
      })
      .filter(Boolean);
  }, [selectedRows, sortedReserves]);

  const handleStyledSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      const allSelectable = new Set(
        sortedReserves
          .map((reserve, index) =>
            reserve.status === StatusReservation.ACTIVE ? index : null,
          )
          .filter((i) => i !== null) as number[],
      );
      setSelectedRows(allSelectable);
      setSelectAll(true);
    } else {
      setSelectedRows(new Set());
      setSelectAll(false);
    }
  };

  const handleStyledSelectRow = (
    _event: React.MouseEvent<unknown>,
    rowId: string,
  ) => {
    const index = sortedReserves.findIndex((r) => String(r.id) === rowId);
    if (index === -1) return;
    if (sortedReserves[index].status !== StatusReservation.ACTIVE) return;
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    setSelectAll(selectableCount > 0 && newSelected.size === selectableCount);
  };

  /* ---------- Column definitions ---------- */
  const columns: TableColumnDef<ReserveResponse>[] = useMemo(() => {
    const cols: TableColumnDef<ReserveResponse>[] = [
      {
        id: "guest",
        label: "Huésped",
        align: "center" as const,
        render: (row) => `${row.firstName} ${row.lastName}`,
      },
      {
        id: "roomNumber",
        label: "Habitación - Estándar",
        sortable: true,
        align: "center" as const,
        render: (row) =>
          `${row.roomNumber} (${categoryToRoleMap[row.tag] || row.tag || "Sin Estándar"})`,
      },
      {
        id: "checkIn",
        label: "Check In",
        sortable: true,
        align: "center" as const,
        render: (row) => formatDate(new Date(row.checkIn)),
      },
      {
        id: "checkOut",
        label: "Check Out",
        sortable: true,
        align: "center" as const,
        render: (row) => formatDate(new Date(row.checkOut)),
      },
      {
        id: "status",
        label: "Estado",
        align: "center" as const,
        render: (row) =>
          row.status === StatusReservation.ACTIVE ? "Activa" : "Cancelada",
      },
    ];

    if ((isSentryAdmin || isCompanyAdmin) && hasTTLock) {
      cols.push({
        id: "pin",
        label: "PIN",
        align: "center" as const,
        render: (row) => {
          if (row.doorPassword) return row.doorPassword;
          if (!row.created) {
            return (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                Procesando
                <AutorenewIcon
                  sx={{
                    color: "#1976d2",
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </Box>
            );
          }
          const diffInHours =
            (new Date().getTime() - new Date(row.created).getTime()) /
            (1000 * 60 * 60);
          if (diffInHours < 1) {
            return (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                Procesando
                <AutorenewIcon
                  sx={{
                    color: "#1976d2",
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </Box>
            );
          }
          return (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <span>Utilizar App</span>
              <Tooltip title="La chapa actualmente presenta problemas">
                <Box display="flex" alignItems="center">
                  <Badge
                    badgeContent="!"
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#ffa726",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                        minWidth: "16px",
                        height: "16px",
                        borderRadius: "50%",
                      },
                    }}
                  >
                    <span></span>
                  </Badge>
                </Box>
              </Tooltip>
            </Box>
          );
        },
      });
    }

    return cols;
  }, [isSentryAdmin, isCompanyAdmin, hasTTLock]);

  const totalPages = Math.ceil(
    (searchTerm.length >= 5 ? searchTotalCount : totalCount) / rowsPerPage,
  );

  /* ---------- Bulk action toolbar ---------- */
  const bulkToolbar =
    selectedRows.size > 0 ? (
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <Typography variant="body2" fontWeight={600}>
          {selectedRows.size} seleccionada{selectedRows.size > 1 ? "s" : ""}
        </Typography>
        <Tooltip title="Editar seleccionadas">
          <IconButton
            color="primary"
            onClick={() => setIsSelectedSidebarOpen(true)}
            sx={{ border: "1px solid #1976d2" }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cambiar habitaciones">
          <IconButton
            color="primary"
            onClick={() => setIsChangeRoomSidebarOpen(true)}
            sx={{ border: "1px solid #1976d2" }}
          >
            <SwapHorizIcon />
          </IconButton>
        </Tooltip>
        {hasTTLock && (
          <Tooltip title="Resetear PIN TTLock">
            <span>
              <IconButton
                color="warning"
                disabled={isResettingPins}
                onClick={handleResetPinsBulk}
                sx={{
                  border: "1px solid",
                  borderColor: isResettingPins ? "#bdbdbd" : "#ed6c02",
                }}
              >
                <AutorenewIcon
                  sx={
                    isResettingPins
                      ? {
                          animation: "spin 1s linear infinite",
                          "@keyframes spin": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                          },
                        }
                      : undefined
                  }
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
        <Tooltip title="Cancelar reservas">
          <IconButton
            color="error"
            onClick={handleCancelBulkReservations}
            sx={{ border: "1px solid #d32f2f" }}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      </div>
    ) : null;

  return (
    <>
      <Root
        header={
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Detalle: {guid} - {companyName}
            </h2>
          </div>
        }
        content={
          <div className="p-6 w-full">
            {/* Top bar: back + search + action icons */}
            <div className="flex justify-between mb-4 gap-2">
              <IconButton
                sx={{
                  bgcolor: "#e0e0e0",
                  width: 40,
                  height: 40,
                  "&:hover": { bgcolor: "#bdbdbd" },
                }}
                onClick={handleBackClick}
              >
                <ArrowBackIcon sx={{ color: "#1976d2" }} />
              </IconButton>
              <div className="flex gap-2 items-center">
                <div className="flex-1 max-w-md">
                  <TextField
                    fullWidth
                    placeholder="Buscar huésped (mínimo 5 caracteres)..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={clearSearch}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    }}
                  />
                  {isSearching && (
                    <div className="text-sm text-gray-600 mt-1">
                      Buscando...
                    </div>
                  )}
                  {searchTerm.length >= 5 && !isSearching && (
                    <div className="text-sm text-gray-600 mt-1">
                      {searchTotalCount} resultado(s) encontrado(s)
                    </div>
                  )}
                </div>
                <Tooltip title="Descargar Excel">
                  <IconButton
                    color="primary"
                    onClick={handleDownloadExcel}
                    sx={{ border: "1px solid #1976d2" }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            <StyledTable<ReserveResponse>
              columns={columns}
              data={sortedReserves}
              getRowId={(row) => String(row.id)}
              loading={loading}
              loadingMessage="Cargando datos..."
              emptyMessage="No se encontraron datos"
              selectable
              selected={selectedIds}
              onSelectAll={handleStyledSelectAll}
              onSelectRow={handleStyledSelectRow}
              isRowSelectable={(row) => row.status === StatusReservation.ACTIVE}
              order={order}
              orderBy={orderBy}
              onSort={handleRequestSort}
              onRowClick={(row) => handleInfoClick(row.id)}
              renderActions={(row) => (
                <RowActionMenu
                  onView={() => handleInfoClick(row.id)}
                  menuItems={[
                    ...((isSentryAdmin || isCompanyAdmin) &&
                    row.status === StatusReservation.ACTIVE
                      ? [
                          {
                            key: "cancel",
                            label: "Cancelar reserva",
                            icon: <CancelIcon fontSize="small" />,
                            color: "error.main",
                            onClick: () => handleDeleteClick(row),
                          },
                        ]
                      : []),
                  ]}
                />
              )}
              actionsLabel="Acciones"
              pagination={
                totalPages > 1
                  ? {
                      count:
                        searchTerm.length >= 5 ? searchTotalCount : totalCount,
                      page,
                      rowsPerPage,
                      onPageChange: handleChangePage,
                    }
                  : undefined
              }
              bulkToolbar={bulkToolbar}
            />
          </div>
        }
      />

      {/* Sidebar de Detalle de Reserva */}
      <ReserveDetailSidebar
        open={isReserveModalOpen}
        onClose={handleCloseReserveModal}
        reserveId={selectedReserveId}
        onOpenRoomSidebar={handleOpenRoomSidebar}
      />

      {/* Room Detail Sidebar */}
      <RoomDetailSidebar
        open={roomSidebarOpen}
        onClose={handleCloseRoomSidebar}
        roomId={selectedRoomId}
      />

      {/* Modal de Confirmación para Eliminar Reserva */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Cancelar reserva"
        message={
          reserveToDelete
            ? `¿Estás seguro que deseas cancelar la reserva de "${reserveToDelete.firstName} ${reserveToDelete.lastName}" en la habitación ${reserveToDelete.roomNumber}?`
            : ""
        }
        type="delete"
      />

      {/* Modal de Confirmación para Cancelación Masiva */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancelBulkReservations}
        title="Cancelar reservas"
        message={`¿Estás seguro que deseas cancelar ${selectedRows.size} reserva${selectedRows.size > 1 ? "s" : ""}? Esta acción no se puede deshacer.`}
        type="delete"
      />

      {/* Sidebar de reservas seleccionadas */}
      <SelectedReservationsSidebar
        open={isSelectedSidebarOpen}
        onClose={() => {
          setIsSelectedSidebarOpen(false);
          fetchReserves();
        }}
        rows={Array.from(selectedRows).map((index) => ({
          id: sortedReserves[index].id,
          guid: (sortedReserves[index] as any).guid,
          guest: {
            firstName: sortedReserves[index].firstName,
            lastName: sortedReserves[index].lastName,
          },
          roomNumber: sortedReserves[index].roomNumber,
          checkIn: sortedReserves[index].checkIn,
          checkOut: sortedReserves[index].checkOut,
        }))}
      />

      {/* Sidebar de cambio de habitaciones */}
      <ChangeRoomSidebar
        open={isChangeRoomSidebarOpen}
        onClose={() => {
          setIsChangeRoomSidebarOpen(false);
          fetchReserves();
        }}
        rows={Array.from(selectedRows).map((index) => ({
          id: sortedReserves[index].id,
          guid: (sortedReserves[index] as any).guid,
          guest: {
            firstName: sortedReserves[index].firstName,
            lastName: sortedReserves[index].lastName,
          },
          roomNumber: sortedReserves[index].roomNumber,
          checkIn: sortedReserves[index].checkIn,
          checkOut: sortedReserves[index].checkOut,
          jobTitleId: (sortedReserves[index] as any).jobTitleId || 0,
          companyId: (sortedReserves[index] as any).companyId || 0,
        }))}
      />
    </>
  );
}

export default ReservesBulk;
