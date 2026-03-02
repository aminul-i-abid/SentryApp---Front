import TopbarHeader from "@/components/TopbarHeader";
import { Routes, buildRoute } from "@/utils/routesEnum";
import useUser from "@auth/useUser";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Badge,
  Box,
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
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
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
  "& .FusePageSimple-content": {
    backgroundImage: "url(/assets/dashbg1.png), url(/assets/dashbg2.png)",
    backgroundPosition: "top left, bottom right",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundSize: "30% auto, 70% auto",
  },
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
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
  >(0); // Default to 'Activas' (status 0)
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

  const handleInfoClick = (id) => {
    navigate(buildRoute(Routes.RESERVE_BULK, { id: id }));
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    rowId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action: string) => {
    if (selectedRow) {
      // TODO: Implement the actual actions
    }
    handleMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseUnassignedModal = () => {
    setOpenUnassignedModal(false);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle company filter change
  const handleCompanyFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedCompanyId(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // Filtro de estado de reserva
  const handleReservationStatusFilterChange = (
    event: SelectChangeEvent<string>,
  ) => {
    const value = event.target.value;
    setReservationStatusFilter(value === "" ? undefined : parseInt(value));
    setPage(0); // Reset to first page when filter changes
  };

  // Como ahora los filtros se manejan en el servidor, no necesitamos filtrar del lado del cliente
  // Solo aplicamos el ordenamiento a los datos que vienen del servidor
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

  return (
    <Root
      header={<TopbarHeader />}
      content={
        <div className="p-6">
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
            {/* <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<SearchIcon />}
                            onClick={() => setOpenSearchModal(true)}
                        >
                            Búsqueda de huéspedes
                        </Button> */}
          </div>
          <TableContainer component={Paper}>
            <Toolbar
              sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
              }}
            >
              <Typography
                sx={{ flex: "1 1 100%" }}
                variant="h6"
                id="tableTitle"
                component="div"
              >
                Reservas
              </Typography>

              {isAdmin && contractors.length > 0 && (
                <FormControl sx={{ minWidth: 200, mr: 2 }} size="small">
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
                      <MenuItem
                        key={contractor.id}
                        value={contractor.id.toString()}
                      >
                        {contractor.name ||
                          contractor.companyName ||
                          contractor.title}
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
            </Toolbar>
            {/* Tabla con los datos de reservas */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.8rem" }}>Reserva</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>Huéspedes</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>Contratista</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>Solicitante</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>
                    Cantidad de Reservas
                    <Tooltip title="Cantidad total de reservas (activas/canceladas)">
                      <InfoOutlinedIcon
                        fontSize="small"
                        sx={{
                          ml: 0.5,
                          verticalAlign: "middle",
                          color: "action.active",
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>
                    <TableSortLabel
                      active={orderBy === "created"}
                      direction={orderBy === "created" ? order : "asc"}
                      onClick={() => handleRequestSort("created")}
                    >
                      Fecha de creación
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                    Estado
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "40px 0",
                        }}
                      >
                        <span style={{ color: "#888" }}>Cargando datos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedReserves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "40px 0",
                        }}
                      >
                        <span style={{ color: "#888" }}>
                          No se encontraron datos
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedReserves.map((reserve) => (
                    <TableRow key={reserve.id}>
                      <TableCell
                        sx={{ fontSize: "0.8rem" }}
                        align="center"
                      >{`${reserve.guid}`}</TableCell>
                      <TableCell
                        sx={{ fontSize: "0.8rem" }}
                        align="center"
                      >{`${reserve.guestCount}`}</TableCell>
                      <TableCell
                        sx={{ fontSize: "0.8rem" }}
                        align="center"
                      >{`${reserve.companyName}`}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                        {reserve.solicitante}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                        {reserve.numberOfReservations} (
                        {reserve.activeReservations}/
                        {reserve.cancelledReservations})
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                        {reserve.created &&
                        !isNaN(new Date(reserve.created).getTime())
                          ? formatDate(new Date(reserve.created))
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                        {reserve.status === 0 ? (
                          <Tooltip title="Reservas creadas exitosamente">
                            <CheckCircleIcon sx={{ color: "#4caf50" }} />
                          </Tooltip>
                        ) : reserve.status === 1 ? (
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
                        ) : reserve.status === 2 ? (
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
                        ) : (
                          `${reserve.status}`
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }} align="center">
                        <Box display="flex" justifyContent="center">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleInfoClick(reserve.id)}
                          >
                            <InfoOutlinedIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
              mt={1}
            >
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count}`
                }
              />
            </Box>
          </TableContainer>
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
                {/*<Button 
                                    onClick={async () => {
                                        if (!validationData) {
                                            enqueueSnackbar('Error: No hay datos de validación disponibles', { variant: 'error' });
                                            return;
                                        }

                                        try {
                                            const response = await createBulkReservation(
                                                validationData.file,
                                                validationData.companyId,
                                                validationData.comments,
                                                assignableGuests,
                                                unassignedGuests
                                            );

                                            if (response.succeeded) {
                                                enqueueSnackbar('Reservas creadas exitosamente', { variant: 'success' });
                                                handleCloseUnassignedModal();
                                                fetchReserves();
                                                setValidationData(null);
                                            } else {
                                                enqueueSnackbar(`Error al crear las reservas: ${response.message}`, { variant: 'error' });
                                            }
                                        } catch (error) {
                                            console.error('Error creating reservations:', error);
                                            enqueueSnackbar('Error al crear las reservas', { variant: 'error' });
                                        }
                                    }} 
                                    variant="contained" 
                                    color="primary" 
                                    sx={{ flex: 1 }}
                                >
                                    Reservar
                                </Button>*/}
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
