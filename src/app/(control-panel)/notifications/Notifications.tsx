import FusePageSimple from "@fuse/core/FusePageSimple";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState, useMemo } from "react";
import { useSnackbar } from "notistack";
import {
    getNotifications,
    createMobileNotification,
    MobileNotificationDto,
    AudienceNotification,
    GetNotificationsParams,
    CreateMobileNotificationCommand
} from "./NotificationService";
import { getBlocks } from '../block/blockService';
import { BlockResponse } from '../block/models/BlockResponse';
import { getContractors } from "../contractors/contractorsService";
import { ContractorResponse } from "../contractors/models/ContractorResponse";

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

function Notifications() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();
    // Notifications list state
    const [notifications, setNotifications] = useState<MobileNotificationDto[]>([]);
    const [contractors, setContractors] = useState<ContractorResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

    const AUDIENCE_OPTIONS = [
        { value: -1, label: "" },
        { value: AudienceNotification.All, label: "Todos" },
        { value: AudienceNotification.Company, label: "Compañía" },
        { value: AudienceNotification.InTheCamp, label: "En el campamento" },
        { value: AudienceNotification.InTheCampByCompany, label: "En el campamento por compañía" },
        { value: AudienceNotification.InTheCampByBlock, label: "En el campamento por pabellon" },
    ];
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [audienceFilter, setAudienceFilter] = useState<AudienceNotification | number>(-1);
    const [companyFilter, setCompanyFilter] = useState<number | "">("");

    // Modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationDescription, setNotificationDescription] = useState("");
    const [selectedAudience, setSelectedAudience] = useState<AudienceNotification | -1>(-1);
    const [selectedCompany, setSelectedCompany] = useState<number | "">("");
    const [creating, setCreating] = useState(false);
    const [blocks, setBlocks] = useState<BlockResponse[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<number | "">("");
    const hasFilters = useMemo(
        () => searchTerm.trim().length > 0 || audienceFilter !== -1 || companyFilter !== "",
        [searchTerm, audienceFilter, companyFilter]
    );

    const fetchContractors = async () => {
        try {
            const response = await getContractors();
            if (response.succeeded && Array.isArray(response.data)) {
                setContractors(response.data);
            }
        } catch (error) {
            console.error("Error fetching contractors:", error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params: GetNotificationsParams = {
                pageNumber: page + 1,
                pageSize: rowsPerPage,
            };
            
            if (audienceFilter !== -1) {
                params.audiencia = audienceFilter as AudienceNotification;
            }
            if (companyFilter !== "") {
                params.companyId = companyFilter as number;
            }
            if (searchTerm.trim()) {
                params.searchTerm = searchTerm.trim();
            }

            const response = await getNotifications(params);
            if (response.succeeded && response.data) {
                setNotifications(response.data.items);
                setTotalCount(response.data.totalCount);
            } else {
                setNotifications([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || "Error al obtener las notificaciones", { variant: "error" });
            }
        } catch (error) {
            console.error("Error getting notifications:", error);
            setNotifications([]);
            setTotalCount(0);
            enqueueSnackbar("Error al obtener las notificaciones", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContractors();
    }, []);

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, audienceFilter, companyFilter]);

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setPage(0);
            fetchNotifications();
        }
    };

    const handleSearchClick = () => {
        setPage(0);
        fetchNotifications();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleAudienceFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAudienceFilter(Number(event.target.value));
        setPage(0);
    };

    const handleCompanyFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setCompanyFilter(value === "" ? "" : Number(value));
        setPage(0);
    };

    const handleOpenCreateModal = () => {
        setNotificationTitle("");
        setNotificationDescription("");
        setSelectedAudience(-1);
        setSelectedCompany("");
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        setNotificationTitle("");
        setNotificationDescription("");
        setSelectedAudience(-1);
        setSelectedCompany("");
        setCreating(false);
    };

    const handleAudienceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        setSelectedAudience(value === -1 ? -1 : value as AudienceNotification);
        // Reset company selection when audience changes unless it's a company-scoped audience
        if (value !== AudienceNotification.Company && value !== AudienceNotification.InTheCampByCompany && value !== AudienceNotification.InTheCampByBlock) {
            setSelectedCompany("");
            setSelectedBlock("");
        }
        // If audience is by block, load blocks
        if (value === AudienceNotification.InTheCampByBlock) {
            // fetch blocks
            (async () => {
                try {
                    const resp = await getBlocks();
                    if (resp.succeeded && Array.isArray(resp.data)) {
                        setBlocks(resp.data);
                    } else {
                        setBlocks([]);
                    }
                } catch (err) {
                    console.error('Error fetching blocks:', err);
                    setBlocks([]);
                }
            })();
        }
    };

    const handleCompanyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedCompany(value === "" ? "" : Number(value));
    };

    const handleBlockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedBlock(value === "" ? "" : Number(value));
    };

    const isFormValid = () => {
        if (!notificationTitle.trim() || !notificationDescription.trim() || selectedAudience === -1) {
            return false;
        }
        // If audience is Company, company must be selected
        if ((selectedAudience === AudienceNotification.Company || selectedAudience === AudienceNotification.InTheCampByCompany) && selectedCompany === "") {
            return false;
        }
        // If audience is InTheCampByBlock, block must be selected
        if (selectedAudience === AudienceNotification.InTheCampByBlock && selectedBlock === "") {
            return false;
        }
        return true;
    };

    const handleCreateNotification = async () => {
        if (!isFormValid()) {
            enqueueSnackbar("Por favor complete todos los campos requeridos", { variant: "warning" });
            return;
        }

        setCreating(true);
        try {
            const command: CreateMobileNotificationCommand = {
                Title: notificationTitle.trim(),
                Description: notificationDescription.trim(),
                Audiencia: selectedAudience as AudienceNotification,
                    CompanyId: (selectedAudience === AudienceNotification.Company || selectedAudience === AudienceNotification.InTheCampByCompany) ? selectedCompany as number : null,
                    BlockId: selectedAudience === AudienceNotification.InTheCampByBlock ? (selectedBlock as number) : null
            };

            const result = await createMobileNotification(command);
            
            if (result.succeeded) {
                enqueueSnackbar("Notificación enviada correctamente", { variant: "success" });
                handleCloseCreateModal();
                fetchNotifications(); // Refresh the list
            } else {
                enqueueSnackbar(result.errors?.[0] || "Error al enviar la notificación", { variant: "error" });
            }
        } catch (error) {
            console.error("Error creating notification:", error);
            enqueueSnackbar("Error al enviar la notificación", { variant: "error" });
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'sent': return 'Enviada';
            case 'pending': return 'Pendiente';
            case 'failed': return 'Fallida';
            default: return status;
        }
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">Notificaciones</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setCreateModalOpen(true)}
                            >
                                Crear Notificación
                            </Button>
                        </Box>
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
                                label="Audiencia"
                                size="small"
                                value={audienceFilter}
                                onChange={handleAudienceFilterChange}
                                slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                                sx={{ minWidth: { xs: "100%", md: 160 } }}
                            >
                                {AUDIENCE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Empresa"
                                size="small"
                                value={companyFilter === "" ? "" : String(companyFilter)}
                                onChange={handleCompanyFilterChange}
                                slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                                sx={{ minWidth: { xs: "100%", md: 160 } }}
                            >
                                <option value="">Todas</option>
                                {contractors.map((contractor) => (
                                    <option key={contractor.id} value={contractor.id}>
                                        {contractor.name}
                                    </option>
                                ))}
                            </TextField>
                        </Box>

                        {hasFilters && (
                            <Box px={2} display="flex" justifyContent="space-between" alignItems="center" pb={1}>
                                <Typography variant="body2" color="text.secondary">
                                    {`Mostrando ${notifications.length} de ${totalCount} resultados`}
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setAudienceFilter(-1);
                                        setCompanyFilter("");
                                        setPage(0);
                                        fetchNotifications();
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
                                    <TableCell>Fecha de Envío</TableCell>
                                    <TableCell>Audiencia</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                <CircularProgress size={24} />
                                                <Typography>Cargando notificaciones...</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : notifications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="text.secondary">No se encontraron notificaciones</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notifications.map((notification) => (
                                        <TableRow key={notification.id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>{notification.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    color="text.secondary"
                                                    sx={{ 
                                                        maxWidth: 200, 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {notification.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(notification.created)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.audiencia !== undefined ? (
                                                        notification.audiencia === AudienceNotification.All ? 'Todos' :
                                                        notification.audiencia === AudienceNotification.Company ? 'Compañía' :
                                                        notification.audiencia === AudienceNotification.InTheCamp ? 'En el campamento' :
                                                        notification.audiencia === AudienceNotification.InTheCampByCompany ? 'En el campamento por compañía' :
                                                        notification.audiencia === AudienceNotification.InTheCampByBlock ? 'En el campamento por pabellon' :
                                                        'N/A'
                                                    ) : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
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

        {/* Create Notification Modal */}
        <Dialog
            open={createModalOpen}
            onClose={handleCloseCreateModal}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Crear Nueva Notificación
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                        label="Título"
                        value={notificationTitle}
                        onChange={(event) => setNotificationTitle(event.target.value)}
                        fullWidth
                        required
                        disabled={creating}
                        placeholder="Ingrese el título de la notificación"
                    />
                    
                    <TextField
                        label="Descripción"
                        value={notificationDescription}
                        onChange={(event) => setNotificationDescription(event.target.value)}
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        disabled={creating}
                        placeholder="Ingrese la descripción de la notificación"
                    />

                    <TextField
                        select
                        label="Audiencia"
                        value={selectedAudience}
                        onChange={handleAudienceChange}
                        fullWidth
                        required
                        disabled={creating}
                        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                    >
                        <option value={-1}>Seleccione una audiencia</option>
                        <option value={AudienceNotification.All}>Todos</option>
                        <option value={AudienceNotification.Company}>Compañía</option>
                        <option value={AudienceNotification.InTheCamp}>En el campamento</option>
                        <option value={AudienceNotification.InTheCampByCompany}>En el campamento por compañía</option>
                        <option value={AudienceNotification.InTheCampByBlock}>En el campamento por pabellon</option>
                    </TextField>

                    {(selectedAudience === AudienceNotification.Company || selectedAudience === AudienceNotification.InTheCampByCompany) && (
                        <TextField
                            select
                            label="Empresa"
                            value={selectedCompany === "" ? "" : String(selectedCompany)}
                            onChange={handleCompanyChange}
                            fullWidth
                            required
                            disabled={creating}
                            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                        >
                            <option value="">Seleccione una empresa</option>
                            {contractors.map((contractor) => (
                                <option key={contractor.id} value={contractor.id}>
                                    {contractor.name}
                                </option>
                            ))}
                        </TextField>
                    )}

                    {selectedAudience === AudienceNotification.InTheCampByBlock && (
                        <TextField
                            select
                            label="Pabellón"
                            value={selectedBlock === "" ? "" : String(selectedBlock)}
                            onChange={handleBlockChange}
                            fullWidth
                            required
                            disabled={creating}
                            slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                        >
                            <option value="">Seleccione un pabellón</option>
                            {blocks.map((block) => (
                                <option key={block.id} value={block.id}>
                                    {block.name}
                                </option>
                            ))}
                        </TextField>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    color="inherit" 
                    onClick={handleCloseCreateModal} 
                    disabled={creating}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateNotification}
                    disabled={creating || !isFormValid()}
                    startIcon={creating ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                    {creating ? "Enviando..." : "Enviar Notificación"}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}

export default Notifications;
