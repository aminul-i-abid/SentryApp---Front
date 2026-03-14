import FusePageSimple from "@fuse/core/FusePageSimple";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, MenuItem, Select,
    Typography, useMediaQuery, CircularProgress, Chip,
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
import StyledTable from "@/components/ui/StyledTable";

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
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

        if (field === 'itemId' && value) {
            fetchLotsByItem(value);
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
            setFormData(prev => ({
                ...prev,
                originLocationId: 0,
                destinationWarehouseId: 0,
                destinationLocationId: 0
            }));
            setOriginLocations([]);
            setDestLocations([]);
        }

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
                    <Box
                        sx={{
                            bgcolor: 'white',
                            borderRadius: '16px',
                            p: 3,
                            mb: 3,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                            justifyContent: 'space-between',
                            alignItems: { xs: 'stretch', md: 'center' }
                        }}
                    >
                        <Box display="flex" flex={1} gap={1} alignItems="center" sx={{ maxWidth: 400 }}>
                            <Box
                                component="input"
                                type="text"
                                placeholder="Buscar"
                                value={searchInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && setSearch(searchInput)}
                                sx={{
                                    width: '100%',
                                    height: 40,
                                    px: 2,
                                    borderRadius: 2,
                                    border: '1px solid #E2E8F0',
                                    bgcolor: 'white',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    '&:focus': {
                                        borderColor: '#415EDE',
                                        boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                                    }
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={() => setSearch(searchInput)}
                                sx={{
                                    bgcolor: 'white',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 2,
                                    height: 40,
                                    width: 40,
                                    '&:hover': {
                                        borderColor: '#415EDE',
                                        bgcolor: 'rgba(65, 94, 222, 0.04)'
                                    }
                                }}
                            >
                                <SearchIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Box>

                        <Button
                            variant="contained"
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
                            sx={{
                                bgcolor: '#415EDE',
                                color: 'white',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                    bgcolor: '#354BB0'
                                }
                            }}
                        >
                            Nueva Transferencia
                        </Button>
                    </Box>

                    <StyledTable<MovementDto>
                        columns={[
                            {
                                id: 'date',
                                label: 'Fecha',
                                render: (row) => new Date(row.movementDate).toLocaleDateString()
                            },
                            {
                                id: 'article',
                                label: 'Artículo',
                                render: (row) => (
                                    <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                        {row.itemName}
                                    </Typography>
                                )
                            },
                            {
                                id: 'lot',
                                label: 'Lote',
                                render: (row) => row.lotNumber
                            },
                            {
                                id: 'origin',
                                label: 'Origen',
                                render: (row) => `${row.warehouseName} - ${row.locationName}`
                            },
                            {
                                id: 'quantity',
                                label: 'Cantidad',
                                align: 'center',
                                render: (row) => row.quantity
                            },
                            {
                                id: 'type',
                                label: 'Tipo',
                                align: 'center',
                                render: (row) => (
                                    <Chip
                                        label={row.type === 1 ? t('transfers.movementType.increase') : t('transfers.movementType.decrease')}
                                        color={row.type === 1 ? 'success' : 'error'}
                                        size="small"
                                        sx={{
                                            opacity: 0.8,
                                            fontWeight: 600,
                                            borderRadius: '6px'
                                        }}
                                    />
                                )
                            },
                            {
                                id: 'notes',
                                label: 'Notas',
                                render: (row) => row.notes || '-'
                            }
                        ]}
                        data={transfers}
                        getRowId={(row) => String(row.id)}
                        loading={loading}
                        loadingMessage="Cargando transferencias..."
                        emptyMessage="No hay registros"
                        pagination={{
                            count: totalCount,
                            page: page,
                            rowsPerPage: rowsPerPage,
                            onPageChange: (_, newPage) => setPage(newPage)
                        }}
                        minWidth={1100}
                    />

                    <Dialog
                        open={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: '24px',
                                p: 1
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1E293B', pb: 1 }}>
                            Nueva Transferencia
                        </DialogTitle>
                        <DialogContent>
                            <Box display="flex" flexDirection="column" gap={3} pt={2}>
                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>Artículo</InputLabel>
                                    <Select
                                        value={formData.itemId}
                                        label="Artículo"
                                        onChange={(e) => handleFormChange('itemId', e.target.value)}
                                        disabled={creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {items.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>Lote</InputLabel>
                                    <Select
                                        value={formData.lotId}
                                        label="Lote"
                                        onChange={(e) => handleFormChange('lotId', e.target.value)}
                                        disabled={!formData.itemId || lots.length === 0 || creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {lots.map((lot) => (
                                            <MenuItem key={lot.id} value={lot.id}>
                                                {lot.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Typography variant="h6" fontWeight={700} sx={{ color: '#475569', mt: 1 }}>Origen</Typography>
                                <Box display="flex" gap={2}>
                                    <FormControl fullWidth required>
                                        <InputLabel sx={{ fontWeight: 500 }}>Almacén</InputLabel>
                                        <Select
                                            value={formData.originWarehouseId}
                                            label="Almacén"
                                            onChange={(e) => handleFormChange('originWarehouseId', e.target.value)}
                                            disabled={!formData.lotId || originWarehouses.length === 0 || creating}
                                            sx={{
                                                borderRadius: '12px',
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                }
                                            }}
                                        >
                                            {originWarehouses.map((w) => (
                                                <MenuItem key={w.id} value={w.id}>{w.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth required>
                                        <InputLabel sx={{ fontWeight: 500 }}>Ubicación</InputLabel>
                                        <Select
                                            value={formData.originLocationId}
                                            label="Ubicación"
                                            disabled={!formData.originWarehouseId || originLocations.length === 0 || creating}
                                            onChange={(e) => handleFormChange('originLocationId', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                }
                                            }}
                                        >
                                            {originLocations.map((l) => (
                                                <MenuItem key={l.id} value={l.id}>{l.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Typography variant="h6" fontWeight={700} sx={{ color: '#475569', mt: 1 }}>Destino</Typography>
                                <Box display="flex" gap={2}>
                                    <FormControl fullWidth required>
                                        <InputLabel sx={{ fontWeight: 500 }}>Almacén</InputLabel>
                                        <Select
                                            value={formData.destinationWarehouseId}
                                            label="Almacén"
                                            onChange={(e) => handleFormChange('destinationWarehouseId', e.target.value)}
                                            disabled={!formData.originLocationId || creating}
                                            sx={{
                                                borderRadius: '12px',
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                }
                                            }}
                                        >
                                            {destWarehouses.map((w) => (
                                                <MenuItem key={w.id} value={w.id}>{w.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth required>
                                        <InputLabel sx={{ fontWeight: 500 }}>Ubicación</InputLabel>
                                        <Select
                                            value={formData.destinationLocationId}
                                            label="Ubicación"
                                            disabled={!formData.destinationWarehouseId || creating}
                                            onChange={(e) => handleFormChange('destinationLocationId', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                }
                                            }}
                                        >
                                            {destLocations.map((l) => (
                                                <MenuItem key={l.id} value={l.id}>{l.description}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: '#64748B', mb: 0.5, display: 'block' }}>
                                        Cantidad *
                                    </Typography>
                                    <Box
                                        component="input"
                                        type="number"
                                        value={formData.quantity || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange('quantity', parseInt(e.target.value) || 0)}
                                        disabled={creating}
                                        placeholder="0"
                                        sx={{
                                            width: '100%',
                                            height: 48,
                                            px: 2,
                                            borderRadius: '12px',
                                            border: '1px solid #E2E8F0',
                                            bgcolor: 'white',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            '&:focus': {
                                                borderColor: '#415EDE',
                                                boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                                            }
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: '#64748B', mb: 0.5, display: 'block' }}>
                                        Notas
                                    </Typography>
                                    <Box
                                        component="textarea"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFormChange('notes', e.target.value)}
                                        disabled={creating}
                                        sx={{
                                            width: '100%',
                                            p: 2,
                                            borderRadius: '12px',
                                            border: '1px solid #E2E8F0',
                                            bgcolor: 'white',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            resize: 'none',
                                            transition: 'all 0.2s',
                                            '&:focus': {
                                                borderColor: '#415EDE',
                                                boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, gap: 1 }}>
                            <Button
                                onClick={() => setCreateModalOpen(false)}
                                disabled={creating}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    color: '#64748B'
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCreateTransfer}
                                disabled={creating}
                                sx={{
                                    bgcolor: '#415EDE',
                                    color: 'white',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4,
                                    '&:hover': {
                                        bgcolor: '#354BB0'
                                    }
                                }}
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
