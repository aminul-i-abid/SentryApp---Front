import { ConfirmationModal } from "@/components/ConfirmationModal";
import TopbarHeader from "@/components/TopbarHeader";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import useUser from "@auth/useUser";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getBlocks } from "../block/blockService";
import AddReservationModal, {
  ReservationData,
} from "../reserve/component/AddReservationModal";
import CancelByRutSidebar from "../reserve/component/CancelByRutSidebar";
import ReserveDetailSidebar from "../reserve/component/ReserveDetailSidebar";
import { OptionReservation } from "../reserve/enum/optionReservation";
import {
  cancelBulkReservations,
  resetMultiplePinsTtlock,
  searchByGuest,
  validateBulkReservation,
} from "../reserve/reserveService";
import RoomDetailSidebar from "../room/components/RoomDetailSidebar";
import ChangeRoomSidebar from "./ChangeRoomSidebar";
import SelectedReservationsSidebar from "./SelectedReservationsSidebar";

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

function getStatusText(status: number) {
  switch (status) {
    case 0:
      return "Activo";
    case 1:
      return "Cancelada";
    case 2:
      return "CheckIn";
    case 3:
      return "Vencida";
    default:
      return "Desconocido";
  }
}

function Guests() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [searchValue, setSearchValue] = useState("");
  const [guests, setGuests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [contractors, setContractors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [statusFilter, setStatusFilter] = useState("0");
  const [pinFilter, setPinFilter] = useState("");
  const { authState } = useAuth();
  const { data: user } = useUser();
  const hasTTLock = user?.modules?.ttlock === true;
  const isSentryAdmin = authState.user?.role === "Sentry_Admin";
  const isCompanyAdmin = authState.user?.role === "Company_Admin";
  const { enqueueSnackbar } = useSnackbar();
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState(null);
  const [roomSidebarOpen, setRoomSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Estados para selección múltiple
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // AbortController para cancelar peticiones anteriores
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [isSelectedSidebarOpen, setIsSelectedSidebarOpen] = useState(false);
  const [isResettingPins, setIsResettingPins] = useState(false);
  const [isChangeRoomSidebarOpen, setIsChangeRoomSidebarOpen] = useState(false);
  // Estados para agregar reservas
  const [openModal, setOpenModal] = useState(false);
  const [validationData, setValidationData] = useState<{
    file: File;
    companyId: number;
    comments?: string;
  } | null>(null);
  const [unassignedGuests, setUnassignedGuests] = useState<any[]>([]);
  const [assignableGuests, setAssignableGuests] = useState<any[]>([]);
  const [openUnassignedModal, setOpenUnassignedModal] = useState(false);

  // Estado para el sidebar de cancelación por RUT
  const [openRutSidebar, setOpenRutSidebar] = useState(false);

  // Cantidad de filas seleccionables (estado Activo)
  const selectableCount = useMemo(
    () => guests.filter((g) => g.status === 0).length,
    [guests],
  );

  useEffect(() => {
    // Si es admin, cargar compañías al montar
    if (isSentryAdmin) {
      import("../contractors/contractorsService").then(({ getContractors }) => {
        getContractors()
          .then((response) => {
            if (response.succeeded && Array.isArray(response.data)) {
              setContractors(response.data);
            } else {
              setContractors([]);
            }
          })
          .catch(() => setContractors([]));
      });
    }

    // Cargar bloques para todos los usuarios
    getBlocks()
      .then((response) => {
        if (response.succeeded && Array.isArray(response.data)) {
          setBlocks(response.data);
        } else {
          setBlocks([]);
        }
      })
      .catch(() => setBlocks([]));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchGuests(
      searchValue,
      page,
      rowsPerPage,
      selectedCompanyId,
      statusFilter,
      selectedBlockId,
      pinFilter,
    );
    // eslint-disable-next-line
  }, [
    searchValue,
    page,
    rowsPerPage,
    selectedCompanyId,
    statusFilter,
    selectedBlockId,
    pinFilter,
  ]);

  const fetchGuests = async (
    searchValue = "",
    pageNumber = 0,
    pageSize = 10,
    companyId = "",
    status = "",
    blockId = "",
    pinFilter = "",
  ) => {
    // Cancelar la petición anterior si existe
    if (abortController) {
      abortController.abort();
    }

    // Crear nuevo AbortController para esta petición
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    try {
      setLoading(true);
      const validPage =
        Number.isFinite(pageNumber) && pageNumber >= 0 ? pageNumber + 1 : 1;
      const validSize =
        Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;

      // Preparar los parámetros opcionales
      const param: {
        companyId?: number;
        status?: string;
        blockId?: number;
        withoutPin?: boolean;
      } = {};
      if (companyId) {
        param.companyId = parseInt(companyId);
      }
      if (status) {
        param.status = status;
      }
      if (blockId) {
        param.blockId = parseInt(blockId);
      }
      if (pinFilter) {
        param.withoutPin = pinFilter === "without";
      }

      const response = await searchByGuest(
        searchValue,
        validPage,
        validSize,
        param,
        newAbortController.signal,
      );

      if (response.succeeded && Array.isArray(response.data.items)) {
        const flatGuests = [];
        response.data.items.forEach((reserve) => {
          reserve.guests.forEach((guest) => {
            flatGuests.push({
              id: reserve.id,
              guid: reserve.guid,
              guest,
              roomNumber: reserve.roomNumber,
              companyName: reserve.companyName,
              companyId: reserve.companyId,
              created: reserve.created,
              checkIn: reserve.checkIn,
              checkOut: reserve.checkOut,
              status: reserve.status,
            });
          });
        });
        setGuests(flatGuests);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setGuests([]);
        setTotalCount(0);
      }
    } catch (error) {
      setGuests([]);
      setTotalCount(0);
      // No mostrar error si la petición fue cancelada
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("Error fetching guests:", error);
    } finally {
      setLoading(false);
      // Limpiar el AbortController si es el mismo que creamos
      setAbortController((prev) => (prev === newAbortController ? null : prev));
    }
  };

  const handleSearch = () => {
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleCloseUnassignedModal = () => {
    setOpenUnassignedModal(false);
  };

  const handleOpenRoomSidebar = (roomId: number) => {
    setSelectedRoomId(roomId);
    setRoomSidebarOpen(true);
  };

  const handleCloseRoomSidebar = () => {
    setRoomSidebarOpen(false);
    setSelectedRoomId(null);
  };

  /* ---------- StyledTable selection helpers ---------- */
  const getRowId = useCallback(
    (row: any) => `${row.id}-${row.guest?.id ?? row.guest?.firstName}`,
    [],
  );

  const selectedIds = useMemo(() => {
    return Array.from(selectedRows)
      .map((index) => {
        const g = guests[index];
        return g ? getRowId(g) : "";
      })
      .filter(Boolean);
  }, [selectedRows, guests, getRowId]);

  const handleStyledSelectAll = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      const allSelectable = new Set(
        guests
          .map((guest, index) => (guest.status === 0 ? index : null))
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
    const index = guests.findIndex((g) => getRowId(g) === rowId);
    if (index === -1) return;
    if (guests[index].status !== 0) return;
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    setSelectAll(selectableCount > 0 && newSelected.size === selectableCount);
  };

  const handleCancelReservations = () => {
    if (selectedRows.size === 0) return;
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelReservations = async () => {
    const selectedGuests = Array.from(selectedRows).map(
      (index) => guests[index],
    );
    const reserveIds = [...new Set(selectedGuests.map((guest) => guest.id))];

    try {
      const response = await cancelBulkReservations(reserveIds);

      if (response.succeeded) {
        // Después de cancelar exitosamente, limpiar selección y recargar datos
        setSelectedRows(new Set());
        setSelectAll(false);
        await fetchGuests(
          searchValue,
          page,
          rowsPerPage,
          selectedCompanyId,
          statusFilter,
          selectedBlockId,
          pinFilter,
        );
        enqueueSnackbar("Se estan procesando las cancelaciones de reservas", {
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

  const handleResetPins = async () => {
    if (selectedRows.size === 0 || isResettingPins) return;
    setIsResettingPins(true);
    try {
      const selectedGuests = Array.from(selectedRows).map(
        (index) => guests[index],
      );
      // Tomar los IDs de los ReservationGuest
      const reservationGuestIds = Array.from(
        new Set(
          selectedGuests
            .map((g) => g?.guest?.id)
            .filter((id) => typeof id === "number"),
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

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleAddReservation = async (
    type: OptionReservation,
    data?: ReservationData,
    file?: File,
  ) => {
    if (type === OptionReservation.BULK && file) {
      try {
        // Obtener los valores del formulario de reserva masiva
        const companyId = data?.companyId || 0;
        const comments = data?.comments || "";

        // Store validation data for later use
        setValidationData({
          file,
          companyId,
          comments,
        });

        // Llamar a la API para crear reservas masivas
        const response = await validateBulkReservation(
          file,
          companyId,
          comments,
        );

        if (response.succeeded) {
          // Verificar si hay huéspedes sin asignar
          if (
            response.data?.unassignableGuests &&
            response.data.unassignableGuests.length > 0
          ) {
            setUnassignedGuests(response.data.unassignableGuests);
            setAssignableGuests(response.data.assignableGuests);
            setOpenUnassignedModal(true);
          } else {
            enqueueSnackbar("Reservas creadas exitosamente", {
              variant: "success",
            });
            // Recargar la lista de reservas
            fetchGuests();
          }
        } else {
          enqueueSnackbar(`Error al crear las reservas: ${response.message}`, {
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Error creating bulk reservations:", error);
        enqueueSnackbar("Error al crear las reservas", { variant: "error" });
      }
    }
    // Cerrar el modal después de procesar
    setOpenModal(false);
  };

  /* ---------- Column definitions ---------- */
  const columns: TableColumnDef<any>[] = useMemo(() => {
    const cols: TableColumnDef<any>[] = [
      {
        id: "guid",
        label: "ID Reserva",
        width: "130px",
        render: (row) => row.guid,
      },
      {
        id: "guest",
        label: "Huésped",
        width: "250px",
        render: (row) =>
          `${row.guest?.firstName ?? ""} ${row.guest?.lastName ?? ""}`,
      },
      {
        id: "roomNumber",
        label: "Habitación",
        width: "110px",
        render: (row) => row.roomNumber,
      },
      {
        id: "companyName",
        label: "Compañía",
        width: "160px",
        render: (row) => row.companyName,
      },
      {
        id: "checkIn",
        label: "Check In",
        width: "110px",
        render: (row) =>
          row.checkIn ? formatDate(new Date(row.checkIn)) : "-",
      },
      {
        id: "checkOut",
        label: "Check Out",
        width: "110px",
        render: (row) =>
          row.checkOut ? formatDate(new Date(row.checkOut)) : "-",
      },
      {
        id: "status",
        label: "Estado",
        width: "100px",
        render: (row) => getStatusText(row.status),
      },
    ];

    if ((isSentryAdmin || isCompanyAdmin) && hasTTLock) {
      cols.push({
        id: "pin",
        label: "PIN",
        width: "120px",
        render: (row) => {
          if (row.guest?.doorPassword) return row.guest.doorPassword;

          if (!row.created) {
            return (
              <Box display="flex" alignItems="center" gap={1}>
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

          const createdDate = new Date(row.created);
          const now = new Date();
          const diffInHours =
            (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

          if (diffInHours < 1) {
            return (
              <Box display="flex" alignItems="center" gap={1}>
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
            <Box display="flex" alignItems="center" gap={1}>
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
                onClick={handleResetPins}
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
            onClick={handleCancelReservations}
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
        header={<TopbarHeader />}
        content={
          <div className="p-6 w-full">
            {/* Top actions */}
            <div className="flex justify-end mb-4" style={{ gap: 12 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenModal}
              >
                Nueva Reserva
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CancelIcon />}
                onClick={() => setOpenRutSidebar(true)}
              >
                Cancelacion por RUT
              </Button>
            </div>

            {/* Filters */}
            <Box
              sx={(t) => {
                const isDark = t.palette.mode === "dark";
                return {
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  flexWrap: "wrap",
                  alignItems: { xs: "stretch", md: "center" },
                  gap: 1.5,
                  mb: 3,
                  backgroundColor: isDark ? "#1e1e1e" : "#fff",
                  border: `1px solid ${isDark ? "#444" : "#e6e3e3"}`,
                  borderRadius: "12px",
                  p: 2,
                };
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Nombre, Apellido, RUT o Habitación..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={(t) => {
                  const isDark = t.palette.mode === "dark";
                  return {
                    flex: { xs: "1 1 100%", md: "1 1 220px" },
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                      "& fieldset": {
                        borderColor: isDark ? "#444" : "#e6e3e3",
                      },
                      "&:hover fieldset": { borderColor: "#415EDE" },
                      "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                    },
                  };
                }}
              />
              {isSentryAdmin && (
                <TextField
                  select
                  label="Contratista"
                  size="small"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    select: { native: true },
                  }}
                  sx={(t) => {
                    const isDark = t.palette.mode === "dark";
                    return {
                      minWidth: 160,
                      flex: { xs: "1 1 100%", sm: "0 1 auto" },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                        "& fieldset": {
                          borderColor: isDark ? "#444" : "#e6e3e3",
                        },
                        "&:hover fieldset": { borderColor: "#415EDE" },
                        "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 500,
                        "&.Mui-focused": { color: "#415EDE" },
                      },
                    };
                  }}
                >
                  <option value="">Todas</option>
                  {contractors.map((c) => (
                    <option key={c.id || c.rut} value={c.id || c.rut}>
                      {c.name}
                    </option>
                  ))}
                </TextField>
              )}
              <TextField
                select
                label="Estado"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { native: true },
                }}
                sx={(t) => {
                  const isDark = t.palette.mode === "dark";
                  return {
                    minWidth: 130,
                    flex: { xs: "1 1 100%", sm: "0 1 auto" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                      "& fieldset": {
                        borderColor: isDark ? "#444" : "#e6e3e3",
                      },
                      "&:hover fieldset": { borderColor: "#415EDE" },
                      "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 500,
                      "&.Mui-focused": { color: "#415EDE" },
                    },
                  };
                }}
              >
                <option value="">Todos</option>
                <option value={0}>Activo</option>
                <option value={1}>Cancelada</option>
                <option value={3}>Vencida</option>
              </TextField>
              <TextField
                select
                label="Pabellón"
                size="small"
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { native: true },
                }}
                sx={(t) => {
                  const isDark = t.palette.mode === "dark";
                  return {
                    minWidth: 130,
                    flex: { xs: "1 1 100%", sm: "0 1 auto" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                      "& fieldset": {
                        borderColor: isDark ? "#444" : "#e6e3e3",
                      },
                      "&:hover fieldset": { borderColor: "#415EDE" },
                      "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 500,
                      "&.Mui-focused": { color: "#415EDE" },
                    },
                  };
                }}
              >
                <option value="">Todos</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                label="PIN"
                size="small"
                value={pinFilter}
                onChange={(e) => setPinFilter(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  select: { native: true },
                }}
                sx={(t) => {
                  const isDark = t.palette.mode === "dark";
                  return {
                    minWidth: 120,
                    flex: { xs: "1 1 100%", sm: "0 1 auto" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                      "& fieldset": {
                        borderColor: isDark ? "#444" : "#e6e3e3",
                      },
                      "&:hover fieldset": { borderColor: "#415EDE" },
                      "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 500,
                      "&.Mui-focused": { color: "#415EDE" },
                    },
                  };
                }}
              >
                <option value="">Todos</option>
                <option value="without">Sin PIN</option>
              </TextField>
            </Box>

            {/* StyledTable */}
            <StyledTable<any>
              columns={columns}
              data={guests}
              getRowId={getRowId}
              loading={loading}
              loadingMessage="Cargando..."
              emptyMessage="No se encontraron datos"
              selectable
              selected={selectedIds}
              onSelectAll={handleStyledSelectAll}
              onSelectRow={handleStyledSelectRow}
              isRowSelectable={(row) => row.status === 0}
              onRowClick={(row) => {
                setSelectedReserveId(row.id);
                setModalOpen(true);
              }}
              pagination={{
                count: Math.ceil(totalCount / rowsPerPage),
                page,
                rowsPerPage,
                onPageChange: handleChangePage,
              }}
              bulkToolbar={bulkToolbar}
            />
            {/* Sidebar para detalle de reserva */}
            <ReserveDetailSidebar
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              reserveId={selectedReserveId}
              onOpenRoomSidebar={handleOpenRoomSidebar}
              onGuestUpdate={() =>
                fetchGuests(
                  searchValue,
                  page,
                  rowsPerPage,
                  selectedCompanyId,
                  statusFilter,
                  selectedBlockId,
                  pinFilter,
                )
              }
            />

            {/* Room Detail Sidebar */}
            <RoomDetailSidebar
              open={roomSidebarOpen}
              onClose={handleCloseRoomSidebar}
              roomId={selectedRoomId}
            />

            {/* Modal de Confirmación para Cancelación Masiva */}
            <ConfirmationModal
              isOpen={isCancelModalOpen}
              onClose={() => setIsCancelModalOpen(false)}
              onConfirm={handleConfirmCancelReservations}
              title="Cancelar reservas"
              message={`¿Estás seguro que deseas cancelar ${selectedRows.size} reserva${selectedRows.size > 1 ? "s" : ""}? Esta acción no se puede deshacer.`}
              type="delete"
            />

            {/* Sidebar de reservas seleccionadas */}
            <SelectedReservationsSidebar
              open={isSelectedSidebarOpen}
              onClose={() => setIsSelectedSidebarOpen(false)}
              rows={Array.from(selectedRows).map((index) => ({
                id: guests[index].id,
                guid: guests[index].guid,
                guest: guests[index].guest,
                roomNumber: guests[index].roomNumber,
                // Pass through original strings; formatting is handled in the sidebar
                checkIn: guests[index].checkIn,
                checkOut: guests[index].checkOut,
              }))}
            />
            {/* Sidebar de datos de reservas seleccionadas */}
            <ChangeRoomSidebar
              open={isChangeRoomSidebarOpen}
              onClose={() => setIsChangeRoomSidebarOpen(false)}
              rows={Array.from(selectedRows).map((index) => ({
                id: guests[index].id,
                guid: guests[index].guid,
                guest: guests[index].guest,
                roomNumber: guests[index].roomNumber,
                checkIn: guests[index].checkIn,
                checkOut: guests[index].checkOut,
                jobTitleId: guests[index].guest?.jobTitleId || 0,
                companyId: guests[index].companyId || 0,
              }))}
            />
            {/* Modal para crear nueva reserva*/}
            <AddReservationModal
              open={openModal}
              onClose={handleCloseModal}
              onAdd={handleAddReservation}
              fetchReserves={fetchGuests}
            />

            {/* Modal para mostrar huéspedes sin asignar */}
            <Dialog
              open={openUnassignedModal}
              onClose={handleCloseUnassignedModal}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Huéspedes sin asignar</DialogTitle>
              <DialogContent>
                <TableContainer
                  component={Paper}
                  sx={{ backgroundColor: "white" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Correo</TableCell>
                        <TableCell>Cargo</TableCell>
                        <TableCell>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unassignedGuests.map((guest, index) => (
                        <TableRow key={index}>
                          <TableCell>{guest.fullName}</TableCell>
                          <TableCell>{guest.email || ""}</TableCell>
                          <TableCell>{guest.jobTitle || ""}</TableCell>
                          <TableCell>{guest.reason || ""}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions
                sx={{ px: 3, pb: 2, pt: 0, flexDirection: "column" }}
              >
                <div style={{ display: "flex", width: "100%", gap: "16px" }}>
                  <Button
                    onClick={handleCloseUnassignedModal}
                    variant="outlined"
                    color="inherit"
                    sx={{ flex: 1, bgcolor: "#F5F7FA" }}
                  >
                    Volver
                  </Button>
                </div>
              </DialogActions>
            </Dialog>
          </div>
        }
        rightSidebarContent={
          <CancelByRutSidebar
            open={openRutSidebar}
            onClose={() => setOpenRutSidebar(false)}
          />
        }
        rightSidebarOpen={openRutSidebar}
        rightSidebarOnClose={() => setOpenRutSidebar(false)}
        rightSidebarVariant="temporary"
        rightSidebarWidth={1140}
      />
    </>
  );
}

export default Guests;
