import TopbarHeader from "@/components/TopbarHeader";
import RowActionMenu from "@/components/ui/RowActionMenu";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { Routes, buildRoute } from "@/utils/routesEnum";
import useUser from "@auth/useUser";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getContractors } from "../contractors/contractorsService";
import AddReservationModal, {
  ReservationData,
} from "./component/AddReservationModal";
import CancelByRutSidebar from "./component/CancelByRutSidebar";
import SearchByGuestModal from "./component/SearchByGuestModal";
import { OptionReservation } from "./enum/optionReservation";
import { BulkReserve } from "./models/BulkReserveResponse";
import { getBulkReserves, validateBulkReservation } from "./reserveService";

// Helper to format dates
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
  "& .FusePageSimple-sidebar": {
    backgroundColor: "#eeeeee",
  },
  "& .FusePageSimple-sidebarHeader": {
    backgroundColor: "#eeeeee",
  },
  "& .FusePageSimple-sidebarContent": {
    backgroundColor: "#eeeeee",
  },
}));

type Order = "asc" | "desc";
type OrderBy = "created" | "checkIn" | "checkOut";

function Reserve() {
  const { t } = useTranslation("reservePage");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { data: user } = useUser();
  const [openModal, setOpenModal] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(15);
  const [reserves, setReserves] = useState<BulkReserve[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [unassignedGuests, setUnassignedGuests] = useState<any[]>([]);
  const [assignableGuests, setAssignableGuests] = useState<any[]>([]);
  const [openUnassignedModal, setOpenUnassignedModal] = useState(false);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("created");
  const [contractors, setContractors] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [validationData, setValidationData] = useState<{
    file: File;
    companyId: number;
    comments?: string;
  } | null>(null);
  const [reservationStatusFilter, setReservationStatusFilter] = useState<
    number | undefined
  >(0);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openRutSidebar, setOpenRutSidebar] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin =
    user?.role === "Sentry_Admin" ||
    (Array.isArray(user?.role) && user?.role.includes("Sentry_Admin"));

  useEffect(() => {
    // Si es admin, cargar contratistas al montar
    if (isAdmin) {
      fetchContractors();
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchReserves();
  }, [page, rowsPerPage, selectedCompanyId, reservationStatusFilter]);

  const fetchContractors = async () => {
    try {
      const response = await getContractors();
      if (response.succeeded && Array.isArray(response.data)) {
        setContractors(response.data);
      } else {
        setContractors([]);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
      setContractors([]);
    }
  };

  const fetchReserves = async () => {
    try {
      setLoading(true);
      const companyId = selectedCompanyId
        ? parseInt(selectedCompanyId)
        : undefined;
      const status = reservationStatusFilter;
      const response = await getBulkReserves(
        page + 1,
        rowsPerPage,
        companyId,
        status,
      );
      if (response.succeeded) {
        setReserves(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching reserves:", error);
    } finally {
      setLoading(false);
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
            fetchReserves();
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

  const handleInfoClick = (reserveId: number) => {
    navigate(buildRoute(Routes.RESERVE_BULK, { id: String(reserveId) }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleCloseUnassignedModal = () => {
    setOpenUnassignedModal(false);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property as OrderBy);
  };

  // Handle company filter change
  const handleCompanyFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedCompanyId(event.target.value);
    setPage(0);
  };

  // Filtro de estado de reserva
  const handleReservationStatusFilterChange = (
    event: SelectChangeEvent<string>,
  ) => {
    const value = event.target.value;
    setReservationStatusFilter(value === "" ? undefined : parseInt(value));
    setPage(0);
  };

  // Ordenamiento
  const sortedReserves = React.useMemo(() => {
    return [...reserves].sort((a, b) => {
      let valueA: Date;
      let valueB: Date;
      const isValidDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date.getTime());
      };
      switch (orderBy) {
        case "created":
          valueA = isValidDate(a.created) ? new Date(a.created) : new Date(0);
          valueB = isValidDate(b.created) ? new Date(b.created) : new Date(0);
          break;
        case "checkIn":
          valueA = isValidDate(a.checkIn) ? new Date(a.checkIn) : new Date(0);
          valueB = isValidDate(b.checkIn) ? new Date(b.checkIn) : new Date(0);
          break;
        case "checkOut":
          valueA = isValidDate(a.checkOut) ? new Date(a.checkOut) : new Date(0);
          valueB = isValidDate(b.checkOut) ? new Date(b.checkOut) : new Date(0);
          break;
        default:
          valueA = isValidDate(a.created) ? new Date(a.created) : new Date(0);
          valueB = isValidDate(b.created) ? new Date(b.created) : new Date(0);
      }
      return order === "asc"
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    });
  }, [reserves, order, orderBy]);

  /* ---------- Filter bar shown above table ---------- */
  const [showFilters, setShowFilters] = useState(false);

  const filterBar = (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
      <Typography variant="h6" fontWeight={700}>
        Reservas
      </Typography>
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            backgroundColor: "#415EDE",
            color: "#fff",
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            "&:hover": { backgroundColor: "#3449B5" },
          }}
        >
          Nueva Reserva
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => setOpenRutSidebar(true)}
          sx={{
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Cancelación por RUT
        </Button>
        <IconButton onClick={() => setShowFilters((v) => !v)}>
          <FilterListIcon />
        </IconButton>
      </div>
    </div>
  );

  const filtersRow = showFilters ? (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      {isAdmin && contractors.length > 0 && (
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="company-filter-label">
            Filtrar por Contratista
          </InputLabel>
          <Select
            labelId="company-filter-label"
            id="company-filter"
            value={selectedCompanyId}
            onChange={handleCompanyFilterChange}
            label="Filtrar por Contratista"
          >
            <MenuItem value="">
              <em>Todos los contratistas</em>
            </MenuItem>
            {contractors.map((contractor) => (
              <MenuItem key={contractor.id} value={contractor.id.toString()}>
                {contractor.name || contractor.companyName || contractor.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControl sx={{ minWidth: 180 }} size="small">
        <InputLabel id="reservation-status-filter-label">
          Estado de Reserva
        </InputLabel>
        <Select
          labelId="reservation-status-filter-label"
          id="reservation-status-filter"
          value={reservationStatusFilter?.toString() || ""}
          label="Estado de Reserva"
          onChange={handleReservationStatusFilterChange}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="0">Activas</MenuItem>
          <MenuItem value="1">Canceladas</MenuItem>
          <MenuItem value="3">Vencidas</MenuItem>
        </Select>
      </FormControl>
    </div>
  ) : null;

  /* ---------- Column definitions ---------- */
  const columns: TableColumnDef<BulkReserve>[] = useMemo(
    () => [
      {
        id: "guid",
        label: "Reserva",
        sortable: false,
        align: "center" as const,
        render: (row: BulkReserve) => row.guid,
      },
      {
        id: "guestCount",
        label: "Huéspedes",
        sortable: false,
        align: "center" as const,
        render: (row: BulkReserve) => row.guestCount,
      },
      {
        id: "companyName",
        label: "Contratista",
        sortable: false,
        align: "center" as const,
        render: (row: BulkReserve) => row.companyName ?? "-",
      },
      {
        id: "solicitante",
        label: "Solicitante",
        sortable: false,
        align: "center" as const,
        render: (row: BulkReserve) => row.solicitante ?? "-",
      },
      {
        id: "numberOfReservations",
        label: "Cant. Reservas",
        sortable: false,
        align: "center" as const,
        render: (row: BulkReserve) =>
          `${row.numberOfReservations} (${row.activeReservations}/${row.cancelledReservations})`,
      },
      {
        id: "created",
        label: "Fecha de Creación",
        sortable: true,
        align: "center" as const,
        render: (row: BulkReserve) =>
          row.created && !isNaN(new Date(row.created).getTime())
            ? formatDate(new Date(row.created))
            : "-",
      },
      {
        id: "status",
        label: "Estado",
        sortable: false,
        align: "center" as const,
        render: (row: BulkReserve) => {
          if (row.status === 0)
            return (
              <Tooltip title="Reservas creadas exitosamente">
                <CheckCircleIcon sx={{ color: "#4caf50" }} />
              </Tooltip>
            );
          if (row.status === 1)
            return (
              <Tooltip title="Procesando reservas">
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
              </Tooltip>
            );
          if (row.status === 2)
            return (
              <Tooltip title="Algunas reservas presentan problemas con la chapa">
                <Badge
                  badgeContent="!"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#ffa726",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      minWidth: "20px",
                      height: "20px",
                      borderRadius: "50%",
                    },
                  }}
                >
                  <span></span>
                </Badge>
              </Tooltip>
            );
          return `${row.status}`;
        },
      },
    ],
    [],
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <Root
      header={<TopbarHeader />}
      content={
        <div className="p-6 w-full">
          {filterBar}
          {filtersRow}

          <StyledTable<BulkReserve>
            columns={columns}
            data={sortedReserves}
            getRowId={(row) => String(row.id)}
            loading={loading}
            loadingMessage="Cargando datos..."
            emptyMessage="No se encontraron datos"
            order={order}
            orderBy={orderBy}
            onSort={handleRequestSort}
            onRowClick={(row) => handleInfoClick(row.id)}
            renderActions={(row) => (
              <RowActionMenu
                onView={() => handleInfoClick(row.id)}
                menuItems={[]}
              />
            )}
            actionsLabel="Acciones"
            pagination={
              totalPages > 1
                ? {
                    count: totalCount,
                    page,
                    rowsPerPage,
                    onPageChange: handleChangePage,
                  }
                : undefined
            }
          />

          <AddReservationModal
            open={openModal}
            onClose={handleCloseModal}
            onAdd={handleAddReservation}
            fetchReserves={fetchReserves}
          />

          <SearchByGuestModal
            open={openSearchModal}
            onClose={() => setOpenSearchModal(false)}
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
  );
}

export default Reserve;
