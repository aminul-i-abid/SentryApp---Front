import FusePageSimple from "@fuse/core/FusePageSimple";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import SearchIcon from "@mui/icons-material/Search";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { getIncidents, IncidentItem, resolveIncident } from "./IncidentsService";
import { getRooms } from "../room/roomService";
import { RoomResponse } from "../room/models/RoomResponse";

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
    "& .FusePageSimple-content": {},
    "& .FusePageSimple-sidebarHeader": {},
    "& .FusePageSimple-sidebarContent": {},
}));

const INCIDENT_STATUS = [
    { value: -1, label: "Todos" },
    { value: 0, label: "Abierto" },
    { value: 1, label: "Resuelto" },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const formatDateSafely = (value?: string | number | null) => {
    if (!value) {
        return "-";
    }

    const numeric = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;

    try {
        const dateObj = new Date(numeric);
        if (Number.isNaN(dateObj.getTime())) {
            return "Fecha inválida";
        }
        const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${dateStr} ${timeStr}`;
    } catch (error) {
        return "Fecha inválida";
    }
};

function Incidents() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();

    const [incidents, setIncidents] = useState<IncidentItem[]>([]);
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [roomFilter, setRoomFilter] = useState<number | "">("");
    const [statusFilter, setStatusFilter] = useState<number>(-1);

    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
    const [resolutionComment, setResolutionComment] = useState("");
    const [resolving, setResolving] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

    const hasFilters = useMemo(
        () => searchTerm.trim().length > 0 || roomFilter !== "" || statusFilter !== -1,
        [searchTerm, roomFilter, statusFilter]
    );

    const fetchRooms = async () => {
        try {
            const response = await getRooms();
            if (response.succeeded && Array.isArray(response.data)) {
                setRooms(response.data);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const response = await getIncidents({
                pageNumber: page + 1,
                pageSize: rowsPerPage,
                roomId: roomFilter === "" ? null : Number(roomFilter),
                status: statusFilter,
                searchTerm: searchTerm.trim() || undefined,
            });

            if (response.succeeded && response.data) {
                setIncidents(response.data.items);
                setTotalCount(response.data.totalCount ?? 0);
            } else {
                setIncidents([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || "Error al obtener los problemas", { variant: "error" });
            }
        } catch (error) {
            console.error("Error getting incidents:", error);
            setIncidents([]);
            setTotalCount(0);
            enqueueSnackbar("Error al obtener los problemas", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        fetchIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, roomFilter, statusFilter]);

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setPage(0);
            fetchIncidents();
        }
    };

    const handleSearchClick = () => {
        setPage(0);
        fetchIncidents();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRoomFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setRoomFilter(value === "" ? "" : Number(value));
        setPage(0);
    };

    const handleStatusFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
        setStatusFilter(Number(event.target.value));
        setPage(0);
    };

    const handleOpenResolveDialog = (incident: IncidentItem) => {
        setSelectedIncident(incident);
        setResolutionComment(incident.commentsResolution ?? "");
        setResolveDialogOpen(true);
    };

    const handleCloseResolveDialog = () => {
        setResolveDialogOpen(false);
        setSelectedIncident(null);
        setResolutionComment("");
        setResolving(false);
    };

    const handleResolveIncident = async () => {
        if (!selectedIncident) {
            return;
        }

        setResolving(true);
        try {
            const response = await resolveIncident(selectedIncident.id, resolutionComment.trim() || null);
            if (response.succeeded) {
                enqueueSnackbar("Problema resuelto correctamente", { variant: "success" });
                handleCloseResolveDialog();
                fetchIncidents();
            } else {
                enqueueSnackbar(response.errors?.[0] || "Error al resolver el problema", { variant: "error" });
            }
        } catch (error) {
            console.error("Error resolving incident:", error);
            enqueueSnackbar("Error al resolver el problema", { variant: "error" });
        } finally {
            setResolving(false);
        }
    };

    const openImagePreview = (imageBase64?: string | null) => {
        if (!imageBase64) return;
        // If the backend already provides a data URL, use it; otherwise assume PNG base64
        const src = imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}`;
        setPreviewImageSrc(src);
        setPreviewDialogOpen(true);
    };

    const closeImagePreview = () => {
        setPreviewDialogOpen(false);
        setPreviewImageSrc(null);
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">Problemas</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <TableContainer component={Paper}>
                            <Box
                                display="flex"
                                flexDirection={{ xs: "column", md: "row" }}
                                gap={2}
                                p={2}
                                alignItems={{ xs: "stretch", md: "center" }}
                            >
                                <Box display="flex" flex={1} gap={1} alignItems="center">
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar por título o descripción"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        size="small"
                                    />
                                    <IconButton
                                        color="primary"
                                        onClick={handleSearchClick}
                                        sx={{
                                            border: `1px solid ${theme.palette.primary.main}`,
                                        }}
                                        aria-label="Buscar"
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Box>
                                <TextField
                                    select
                                    label="Habitación"
                                    size="small"
                                    value={roomFilter === "" ? "" : String(roomFilter)}
                                    onChange={handleRoomFilterChange}
                                    slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                                    sx={{ minWidth: { xs: "100%", md: 160 } }}
                                >
                                    <option value="">Todas</option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.roomNumber}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Estado"
                                    size="small"
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                                    sx={{ minWidth: { xs: "100%", md: 160 } }}
                                >
                                    {INCIDENT_STATUS.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </TextField>
                            </Box>

                            {hasFilters && (
                                <Box px={2} display="flex" justifyContent="space-between" alignItems="center" pb={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        {`Mostrando ${incidents.length} de ${totalCount} resultados`}
                                    </Typography>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setRoomFilter("");
                                            setStatusFilter(-1);
                                            setPage(0);
                                            fetchIncidents();
                                        }}
                                    >
                                        Limpiar filtros
                                    </Button>
                                </Box>
                            )}

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Título</TableCell>
                                        <TableCell>Descripción</TableCell>
                                        <TableCell>Habitación</TableCell>
                                        <TableCell>Creado</TableCell>
                                        <TableCell>Creado por</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <CircularProgress size={24} />
                                                    <Typography>Cargando problemas...</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : incidents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography color="text.secondary">No se encontraron problemas</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        incidents.map((incident) => {
                                            const isResolved = incident.status === 1;
                                            return (
                                                <TableRow key={incident.id} hover>
                                                    <TableCell>
                                                        <Typography fontWeight={600}>{incident.title || "Sin título"}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography color="text.secondary">
                                                            {incident.description || "Sin descripción"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident.roomNumber || (incident.roomId && rooms.find(room => room.id === incident.roomId)?.roomNumber) || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(incident.created).toLocaleDateString('es-ES')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {incident.createdName || "Desconocido"}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            color={isResolved ? 'success' : 'warning'}
                                                            onClick={() => handleOpenResolveDialog(incident)}
                                                            sx={{
                                                                border: '1px solid',
                                                                borderColor: isResolved ? 'success.main' : 'warning.main'
                                                            }}
                                                            aria-label={isResolved ? 'Problema resuelto' : 'Problema activo'}
                                                        >
                                                            {!isResolved ? (
                                                                <FuseSvgIcon>heroicons-outline:exclamation-triangle</FuseSvgIcon>
                                                            ) : (
                                                                <FuseSvgIcon>heroicons-outline:check-circle</FuseSvgIcon>
                                                            )}
                                                        </IconButton>
                                                        {incident.imageBase64 && (
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => openImagePreview(incident.imageBase64)}
                                                                sx={{ ml: 1, border: '1px solid', borderColor: 'primary.main' }}
                                                                aria-label="Ver imagen"
                                                            >
                                                                <FuseSvgIcon>heroicons-outline:photo</FuseSvgIcon>
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>

                            <TablePagination
                                component="div"
                                count={totalCount}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                                labelRowsPerPage="Filas por página"
                                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                            />
                        </TableContainer>
                    </div>
                }
            />

            <Dialog
                open={resolveDialogOpen}
                onClose={handleCloseResolveDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {selectedIncident?.status === 1 ? "Problema resuelto" : "Resolver problema"}
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {selectedIncident?.title || "Problema"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedIncident?.description || "Sin descripción"}
                    </Typography>
                    {selectedIncident?.status === 1 ? (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Comentarios de resolución
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedIncident?.commentsResolution?.trim()
                                    ? selectedIncident?.commentsResolution
                                    : "Sin comentarios"}
                            </Typography>
                        </Box>
                    ) : (
                        <TextField
                            label="Comentarios de resolución"
                            value={resolutionComment}
                            onChange={(event) => setResolutionComment(event.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            placeholder="Ingrese comentarios opcionales"
                            disabled={resolving}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedIncident?.status === 1 ? (
                        <Button variant="contained" color="primary" onClick={handleCloseResolveDialog}>
                            Cerrar
                        </Button>
                    ) : (
                        <>
                            <Button color="inherit" onClick={handleCloseResolveDialog} disabled={resolving}>
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleResolveIncident}
                                disabled={resolving}
                                startIcon={resolving ? <CircularProgress size={18} color="inherit" /> : undefined}
                            >
                                {resolving ? "Resolviendo..." : "Resolver"}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Image preview dialog */}
            <Dialog
                open={previewDialogOpen}
                onClose={closeImagePreview}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Vista previa de imagen</DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    {previewImageSrc ? (
                        <Box component="img" src={previewImageSrc} alt="Imagen" sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
                    ) : (
                        <Typography color="text.secondary">No hay imagen disponible</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeImagePreview}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Incidents;
