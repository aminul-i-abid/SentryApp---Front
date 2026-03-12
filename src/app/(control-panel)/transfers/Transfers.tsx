import FusePageSimple from "@fuse/core/FusePageSimple";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, MenuItem, Paper, Select,
    Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, TextField, Typography, useMediaQuery, CircularProgress, Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import './i18n';
import { getTransfers, createTransfer } from "./transferService";
import { MovementDto } from "../receiving/models/Receiving";
import { CreateTransferDto } from "./models/Transfer";
import { 
    getItemsWithStock,
    getLotsByItemWithStock,
    getWarehousesByItemAndLotWithStock,
    getLocationsByItemLotAndWarehouseWithStock
} from "../stocks/stockService";
import { getWarehouses } from "../warehouses/warehousesService";
import { getLocations } from "../locations/locationsService";

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
}));

function Transfers() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation('transfers');

    const [transfers, setTransfers] = useState<MovementDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState<CreateTransferDto>({
        itemId: 0, lotId: 0,
        originWarehouseId: 0, originLocationId: 0,
        destinationWarehouseId: 0, destinationLocationId: 0,
        quantity: 0, notes: ''
    });

    const [items, setItems] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [originWarehouses, setOriginWarehouses] = useState<any[]>([]);
    const [originLocations, setOriginLocations] = useState<any[]>([]);
    const [destWarehouses, setDestWarehouses] = useState<any[]>([]);
    const [destLocations, setDestLocations] = useState<any[]>([]);

    useEffect(() => { fetchTransfers(); }, [page, rowsPerPage, search]);
    useEffect(() => { fetchDropdownData(); }, []);

    const fetchDropdownData = async () => {
        try {
            const [itemsRes, warehousesRes] = await Promise.all([
                getItemsWithStock(),
                getWarehouses(1, 1000)
            ]);
            if (itemsRes.succeeded && Array.isArray(itemsRes.data)) setItems(itemsRes.data);
            if (warehousesRes.succeeded && warehousesRes.data) {
                const warehouses = warehousesRes.data.items || [];
                setDestWarehouses(warehouses);
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

    const fetchOriginWarehousesByItemAndLot = async (itemId: number, lotId: number) => {
        try {
            const response = await getWarehousesByItemAndLotWithStock(itemId, lotId);
            if (response.succeeded && Array.isArray(response.data)) {
                setOriginWarehouses(response.data);
            }
        } catch (error) {
            console.error("Error fetching origin warehouses:", error);
        }
    };

    const fetchOriginLocationsByItemLotAndWarehouse = async (itemId: number, lotId: number, warehouseId: number) => {
        try {
            const response = await getLocationsByItemLotAndWarehouseWithStock(itemId, lotId, warehouseId);
            if (response.succeeded && Array.isArray(response.data)) {
                setOriginLocations(response.data);
            }
        } catch (error) {
            console.error("Error fetching origin locations:", error);
        }
    };

    const fetchDestLocations = async (warehouseId: number) => {
        try {
            const response = await getLocations(1, 1000, warehouseId);
            if (response.succeeded && response.data?.items) {
                setDestLocations(response.data.items);
            }
        } catch (error) {
            console.error("Error fetching dest locations:", error);
        }
    };

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const response = await getTransfers(page + 1, rowsPerPage, undefined, undefined, search || undefined);
            if (response.succeeded && response.data) {
                setTransfers(response.data.items);
                setTotalCount(response.data.totalCount);
            } else {
                setTransfers([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('transfers.messages.loadError'), { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error fetching transfers:", error);
            setTransfers([]);
            setTotalCount(0);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || t('transfers.messages.loadError');
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field: keyof CreateTransferDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Cascading for origin: Item -> Lot -> Warehouse -> Location (all based on stock)
        if (field === 'itemId' && value) {
            fetchLotsByItem(value);
            // Reset all dependent fields
            setFormData(prev => ({ 
                ...prev, 
                lotId: 0, 
                originWarehouseId: 0, 
                originLocationId: 0,
                destinationWarehouseId: 0,
                destinationLocationId: 0
            }));
            setLots([]);
            setOriginWarehouses([]);
            setOriginLocations([]);
            setDestLocations([]);
        }
        
        if (field === 'lotId' && value && formData.itemId) {
            fetchOriginWarehousesByItemAndLot(formData.itemId, value);
            // Reset dependent fields
            setFormData(prev => ({ 
                ...prev, 
                originWarehouseId: 0, 
                originLocationId: 0,
                destinationWarehouseId: 0,
                destinationLocationId: 0
            }));
            setOriginWarehouses([]);
            setOriginLocations([]);
            setDestLocations([]);
        }
        
        if (field === 'originWarehouseId' && value && formData.itemId && formData.lotId) {
            fetchOriginLocationsByItemLotAndWarehouse(formData.itemId, formData.lotId, value);
            // Reset dependent fields
            setFormData(prev => ({ 
                ...prev, 
                originLocationId: 0,
                destinationWarehouseId: 0,
                destinationLocationId: 0
            }));
            setOriginLocations([]);
            setDestLocations([]);
        }
        
        // For destination, just load locations when warehouse is selected
        if (field === 'destinationWarehouseId' && value) {
            fetchDestLocations(value);
            setFormData(prev => ({ ...prev, destinationLocationId: 0 }));
        }
    };

    const handleCreateTransfer = async () => {
        if (!formData.itemId || !formData.lotId || !formData.originWarehouseId || 
            !formData.originLocationId || !formData.destinationWarehouseId || 
            !formData.destinationLocationId || !formData.quantity) {
            enqueueSnackbar(t('transfers.messages.requiredFields'), { variant: "warning" });
            return;
        }

        if (formData.originWarehouseId === formData.destinationWarehouseId && 
            formData.originLocationId === formData.destinationLocationId) {
            enqueueSnackbar(t('transfers.messages.sameOriginDestination'), { variant: "warning" });
            return;
        }

        setCreating(true);
        try {
            const response = await createTransfer(formData);
            if (response.succeeded) {
                enqueueSnackbar(t('transfers.messages.createSuccess'), { variant: "success" });
                setCreateModalOpen(false);
                fetchTransfers();
            } else {
                enqueueSnackbar(response.message || t('transfers.messages.createError'), { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error creating transfer:", error);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || t('transfers.messages.createError');
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
                    <h2 className="text-2xl font-bold">Transferencias</h2>
                </div>
            }
            content={
                <div className="p-6">
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setFormData({
                                    itemId: 0, lotId: 0,
                                    originWarehouseId: 0, originLocationId: 0,
                                    destinationWarehouseId: 0, destinationLocationId: 0,
                                    quantity: 0, notes: ''
                                });
                                setLots([]);
                                setOriginWarehouses([]);
                                setOriginLocations([]);
                                setDestLocations([]);
                                setCreateModalOpen(true);
                            }}
                        >
                            Nueva Transferencia
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
                            <Box display="flex" flex={1} gap={1} alignItems="center">
                                <TextField
                                    fullWidth
                                    placeholder="Buscar"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
                                    size="small"
                                />
                                <IconButton
                                    color="primary"
                                    onClick={() => setSearch(searchInput)}
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
                                    <TableCell>Origen</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Tipo</TableCell>
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
                                ) : transfers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography color="text.secondary">No hay registros</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transfers.map((transfer) => (
                                        <TableRow key={transfer.id} hover>
                                            <TableCell>
                                                {new Date(transfer.movementDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600}>{transfer.itemName}</Typography>
                                            </TableCell>
                                            <TableCell>{transfer.lotNumber}</TableCell>
                                            <TableCell>{transfer.warehouseName} - {transfer.locationName}</TableCell>
                                            <TableCell>{transfer.quantity}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={transfer.type === 1 ? t('transfers.movementType.increase') : t('transfers.movementType.decrease')}
                                                    color={transfer.type === 1 ? 'success' : 'error'}
                                                    size="small"
                                                    sx={{ opacity: 0.7 }}
                                                />
                                            </TableCell>
                                            <TableCell>{transfer.notes || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={totalCount}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            labelRowsPerPage="Filas por página"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </TableContainer>

                    <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="md" fullWidth>
                        <DialogTitle>Nueva Transferencia</DialogTitle>
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

                                <Typography variant="h6">Origen</Typography>
                                <Box display="flex" gap={2}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Almacén</InputLabel>
                                        <Select
                                            value={formData.originWarehouseId}
                                            label="Almacén"
                                            onChange={(e) => handleFormChange('originWarehouseId', e.target.value)}
                                            disabled={!formData.lotId || originWarehouses.length === 0 || creating}
                                        >
                                            {originWarehouses.map((w) => (
                                                <MenuItem key={w.id} value={w.id}>{w.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth required>
                                        <InputLabel>Ubicación</InputLabel>
                                        <Select
                                            value={formData.originLocationId}
                                            label="Ubicación"
                                            disabled={!formData.originWarehouseId || originLocations.length === 0 || creating}
                                            onChange={(e) => handleFormChange('originLocationId', e.target.value)}
                                        >
                                            {originLocations.map((l) => (
                                                <MenuItem key={l.id} value={l.id}>{l.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Typography variant="h6">Destino</Typography>
                                <Box display="flex" gap={2}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Almacén</InputLabel>
                                        <Select
                                            value={formData.destinationWarehouseId}
                                            label="Almacén"
                                            onChange={(e) => handleFormChange('destinationWarehouseId', e.target.value)}
                                            disabled={!formData.originLocationId || creating}
                                        >
                                            {destWarehouses.map((w) => (
                                                <MenuItem key={w.id} value={w.id}>{w.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth required>
                                        <InputLabel>Ubicación</InputLabel>
                                        <Select
                                            value={formData.destinationLocationId}
                                            label="Ubicación"
                                            disabled={!formData.destinationWarehouseId || creating}
                                            onChange={(e) => handleFormChange('destinationLocationId', e.target.value)}
                                        >
                                            {destLocations.map((l) => (
                                                <MenuItem key={l.id} value={l.id}>{l.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

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
                                onClick={() => setCreateModalOpen(false)}
                                disabled={creating}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateTransfer}
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

export default Transfers;
