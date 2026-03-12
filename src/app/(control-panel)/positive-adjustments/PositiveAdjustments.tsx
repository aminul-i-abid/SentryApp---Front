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
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
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
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import './i18n';
import { getPositiveAdjustments, createPositiveAdjustment } from "./positiveAdjustmentService";
import { MovementDto, CreateAdjustmentDto } from "./models/PositiveAdjustment";
import { 
    getItemsWithStock,
    getLotsByItemWithStock,
    getWarehousesByItemAndLotWithStock,
    getLocationsByItemLotAndWarehouseWithStock
} from "../stocks/stockService";
import { getMovementReasons } from "../movement-reasons/movementReasonService";

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
}));

function PositiveAdjustments() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation('positiveAdjustments');

    // State
    const [adjustments, setAdjustments] = useState<MovementDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState<number | "">("");
    const [itemFilter, setItemFilter] = useState<number | "">("");

    // Modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState<CreateAdjustmentDto>({
        itemId: 0,
        lotId: 0,
        warehouseId: 0,
        locationId: 0,
        quantity: 0,
        reasonId: 0,
        notes: ''
    });

    // Dropdown data
    const [items, setItems] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [reasons, setReasons] = useState<any[]>([]);

    useEffect(() => {
        fetchAdjustments();
    }, [page, rowsPerPage, search, warehouseFilter, itemFilter]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [itemsRes, reasonsRes] = await Promise.all([
                getItemsWithStock(),
                getMovementReasons(1, 1000)
            ]);

            if (itemsRes.succeeded && Array.isArray(itemsRes.data)) {
                setItems(itemsRes.data);
            }
            if (reasonsRes.succeeded && Array.isArray(reasonsRes.data)) {
                // Filter reasons for positive adjustments
                setReasons(reasonsRes.data.filter((r: any) => r.positiveAdjustment));
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    };

    const fetchLotsByItem = async (itemId: number) => {
        try {
            const response = await getLotsByItemWithStock(itemId);
            if (response.succeeded && Array.isArray(response.data)) {
                setLots(response.data);
            }
        } catch (error) {
            console.error("Error fetching lots:", error);
        }
    };

    const fetchWarehousesByItemAndLot = async (itemId: number, lotId: number) => {
        try {
            const response = await getWarehousesByItemAndLotWithStock(itemId, lotId);
            if (response.succeeded && Array.isArray(response.data)) {
                setWarehouses(response.data);
            }
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        }
    };

    const fetchLocationsByItemLotAndWarehouse = async (itemId: number, lotId: number, warehouseId: number) => {
        try {
            const response = await getLocationsByItemLotAndWarehouseWithStock(itemId, lotId, warehouseId);
            if (response.succeeded && Array.isArray(response.data)) {
                setLocations(response.data);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchAdjustments = async () => {
        setLoading(true);
        try {
            const response = await getPositiveAdjustments(
                page + 1,
                rowsPerPage,
                itemFilter || undefined,
                undefined,
                warehouseFilter || undefined,
                undefined,
                undefined,
                undefined,
                search || undefined
            );

            if (response.succeeded && response.data) {
                setAdjustments(response.data.items);
                setTotalCount(response.data.totalCount);
            } else {
                setAdjustments([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('positiveAdjustments.messages.loadError'), { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error fetching adjustments:", error);
            setAdjustments([]);
            setTotalCount(0);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || t('positiveAdjustments.messages.loadError');
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            setSearch(searchInput);
            setPage(0);
        }
    };

    const handleSearchClick = () => {
        setSearch(searchInput);
        setPage(0);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenCreateModal = () => {
        setFormData({
            itemId: 0,
            lotId: 0,
            warehouseId: 0,
            locationId: 0,
            quantity: 0,
            reasonId: 0,
            notes: ''
        });
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        setCreating(false);
    };

    const handleFormChange = (field: keyof CreateAdjustmentDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Cascading selection: Item -> Lot -> Warehouse -> Location
        if (field === 'itemId' && value) {
            fetchLotsByItem(value);
            // Reset dependent fields
            setFormData(prev => ({ ...prev, lotId: 0, warehouseId: 0, locationId: 0 }));
            setLots([]);
            setWarehouses([]);
            setLocations([]);
        }
        
        if (field === 'lotId' && value && formData.itemId) {
            fetchWarehousesByItemAndLot(formData.itemId, value);
            // Reset dependent fields
            setFormData(prev => ({ ...prev, warehouseId: 0, locationId: 0 }));
            setWarehouses([]);
            setLocations([]);
        }
        
        if (field === 'warehouseId' && value && formData.itemId && formData.lotId) {
            fetchLocationsByItemLotAndWarehouse(formData.itemId, formData.lotId, value);
            // Reset dependent fields
            setFormData(prev => ({ ...prev, locationId: 0 }));
            setLocations([]);
        }
    };

    const handleCreateAdjustment = async () => {
        if (!formData.itemId || !formData.lotId || !formData.warehouseId || 
            !formData.locationId || !formData.quantity || !formData.reasonId) {
            enqueueSnackbar(t('positiveAdjustments.messages.requiredFields'), { variant: "warning" });
            return;
        }

        setCreating(true);
        try {
            const response = await createPositiveAdjustment(formData);
            if (response.succeeded) {
                enqueueSnackbar(t('positiveAdjustments.messages.createSuccess'), { variant: "success" });
                handleCloseCreateModal();
                fetchAdjustments();
            } else {
                enqueueSnackbar(response.message || t('positiveAdjustments.messages.createError'), { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error creating positive adjustment:", error);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || t('positiveAdjustments.messages.createError');
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setCreating(false);
        }
    };

    return (
        <Root
            scroll="content"
            header={
                <div className="p-6 flex items-center justify-between">
                    {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                    <h2 className="text-2xl font-bold">Ajustes Positivos</h2>
                </div>
            }
            content={
                <div className="p-6">
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenCreateModal}
                        >
                            Nuevo Ajuste Positivo
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Box
                            display="flex"
                            flexDirection={{ xs: 'column', md: 'row' }}
                            gap={2}
                            p={2}
                            alignItems={{ xs: 'stretch', md: 'center' }}
                        >
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Almacén</InputLabel>
                                <Select
                                    value={warehouseFilter}
                                    label="Almacén"
                                    onChange={(e) => {
                                        setWarehouseFilter(e.target.value as number | "");
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {warehouses.map((warehouse) => (
                                        <MenuItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Artículo</InputLabel>
                                <Select
                                    value={itemFilter}
                                    label="Artículo"
                                    onChange={(e) => {
                                        setItemFilter(e.target.value as number | "");
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {items.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box display="flex" flex={1} gap={1} alignItems="center">
                                <TextField
                                    fullWidth
                                    placeholder="Buscar"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
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
                        </Box>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Artículo</TableCell>
                                    <TableCell>Lote</TableCell>
                                    <TableCell>Almacén</TableCell>
                                    <TableCell>Ubicación</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Razón</TableCell>
                                    <TableCell>Notas</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                <CircularProgress size={24} />
                                                <Typography>Cargando...</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : adjustments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography color="text.secondary">No hay registros</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    adjustments.map((adjustment) => (
                                        <TableRow key={adjustment.id} hover>
                                            <TableCell>
                                                {new Date(adjustment.movementDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600}>{adjustment.itemName}</Typography>
                                            </TableCell>
                                            <TableCell>{adjustment.lotNumber}</TableCell>
                                            <TableCell>{adjustment.warehouseName}</TableCell>
                                            <TableCell>{adjustment.locationName}</TableCell>
                                            <TableCell>{adjustment.quantity}</TableCell>
                                            <TableCell>{adjustment.reasonName || '-'}</TableCell>
                                            <TableCell>{adjustment.notes || '-'}</TableCell>
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
                            labelRowsPerPage="Filas por página"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </TableContainer>

                    {/* Create Modal */}
                    <Dialog open={createModalOpen} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
                        <DialogTitle>Nuevo Ajuste Positivo</DialogTitle>
                        <DialogContent dividers>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <FormControl fullWidth required>
                                    <InputLabel>Artículo</InputLabel>
                                    <Select
                                        value={formData.itemId}
                                        label="Artículo"
                                        onChange={(e) => handleFormChange('itemId', e.target.value)}
                                        disabled={creating}
                                    >
                                        {items.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Lote</InputLabel>
                                    <Select
                                        value={formData.lotId}
                                        label="Lote"
                                        onChange={(e) => handleFormChange('lotId', e.target.value)}
                                        disabled={!formData.itemId || lots.length === 0 || creating}
                                    >
                                        {lots.map((lot) => (
                                            <MenuItem key={lot.id} value={lot.id}>
                                                {lot.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Almacén</InputLabel>
                                    <Select
                                        value={formData.warehouseId}
                                        label="Almacén"
                                        onChange={(e) => handleFormChange('warehouseId', e.target.value)}
                                        disabled={!formData.lotId || warehouses.length === 0 || creating}
                                    >
                                        {warehouses.map((warehouse) => (
                                            <MenuItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Ubicación</InputLabel>
                                    <Select
                                        value={formData.locationId}
                                        label="Ubicación"
                                        onChange={(e) => handleFormChange('locationId', e.target.value)}
                                        disabled={!formData.warehouseId || locations.length === 0 || creating}
                                    >
                                        {locations.map((location) => (
                                            <MenuItem key={location.id} value={location.id}>
                                                {location.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Razón</InputLabel>
                                    <Select
                                        value={formData.reasonId}
                                        label="Razón"
                                        onChange={(e) => handleFormChange('reasonId', e.target.value)}
                                        disabled={creating}
                                    >
                                        {reasons.map((reason) => (
                                            <MenuItem key={reason.id} value={reason.id}>
                                                {reason.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    required
                                    label="Cantidad"
                                    type="number"
                                    value={formData.quantity || ''}
                                    onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 0)}
                                    disabled={creating}
                                />

                                <TextField
                                    fullWidth
                                    label="Notas"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    disabled={creating}
                                />
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
                                onClick={handleCreateAdjustment}
                                disabled={creating}
                                startIcon={creating ? <CircularProgress size={18} color="inherit" /> : undefined}
                            >
                                {creating ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            }
        />
    );
}

export default PositiveAdjustments;
