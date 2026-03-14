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
    Select,
    Typography,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import './i18n';
import { getNegativeAdjustments, createNegativeAdjustment } from "./negativeAdjustmentService";
import { MovementDto, CreateAdjustmentDto } from "./models/NegativeAdjustment";
import {
    getItemsWithStock,
    getLotsByItemWithStock,
    getWarehousesByItemAndLotWithStock,
    getLocationsByItemLotAndWarehouseWithStock
} from "../stocks/stockService";
import { getMovementReasons } from "../movement-reasons/movementReasonService";
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

function NegativeAdjustments() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation('negativeAdjustments');

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
                setReasons(reasonsRes.data.filter((r: any) => r.negativeAdjustment));
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
            const response = await getNegativeAdjustments(
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
                enqueueSnackbar(response.errors?.[0] || t('negativeAdjustments.messages.loadError'), { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error fetching negative adjustments:", error);
            setAdjustments([]);
            setTotalCount(0);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || t('negativeAdjustments.messages.loadError');
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

        if (field === 'itemId' && value) {
            fetchLotsByItem(value);
            setFormData(prev => ({ ...prev, lotId: 0, warehouseId: 0, locationId: 0 }));
            setLots([]);
            setWarehouses([]);
            setLocations([]);
        }

        if (field === 'lotId' && value && formData.itemId) {
            fetchWarehousesByItemAndLot(formData.itemId, value);
            setFormData(prev => ({ ...prev, warehouseId: 0, locationId: 0 }));
            setWarehouses([]);
            setLocations([]);
        }

        if (field === 'warehouseId' && value && formData.itemId && formData.lotId) {
            fetchLocationsByItemLotAndWarehouse(formData.itemId, formData.lotId, value);
            setFormData(prev => ({ ...prev, locationId: 0 }));
            setLocations([]);
        }
    };

    const handleCreateAdjustment = async () => {
        if (!formData.itemId || !formData.lotId || !formData.warehouseId ||
            !formData.locationId || !formData.quantity || !formData.reasonId) {
            enqueueSnackbar(t('negativeAdjustments.messages.requiredFields'), { variant: "warning" });
            return;
        }

        setCreating(true);
        try {
            const response = await createNegativeAdjustment(formData);
            if (response.succeeded) {
                enqueueSnackbar(t('negativeAdjustments.messages.createSuccess'), { variant: "success" });
                handleCloseCreateModal();
                fetchAdjustments();
            } else {
                enqueueSnackbar(response.message || t('negativeAdjustments.messages.createError'), { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error creating negative adjustment:", error);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || t('negativeAdjustments.messages.createError');
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
                    <h2 className="text-2xl font-bold">Ajustes Negativos</h2>
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
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center" mb={3}>
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                    Almacén
                                </Typography>
                                <Select
                                    value={warehouseFilter}
                                    displayEmpty
                                    onChange={(e) => {
                                        setWarehouseFilter(e.target.value as number | "");
                                        setPage(0);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        height: 40,
                                        bgcolor: 'white',
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#415EDE',
                                            borderWidth: '2px',
                                        }
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
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                    Artículo
                                </Typography>
                                <Select
                                    value={itemFilter}
                                    displayEmpty
                                    onChange={(e) => {
                                        setItemFilter(e.target.value as number | "");
                                        setPage(0);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        height: 40,
                                        bgcolor: 'white',
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#415EDE',
                                            borderWidth: '2px',
                                        }
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

                            <Box display="flex" flex={1} gap={1} alignItems="center" sx={{ mt: 'auto' }}>
                                <Box
                                    component="input"
                                    type="text"
                                    placeholder="Buscar"
                                    value={searchInput}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
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
                                    onClick={handleSearchClick}
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
                        </Box>

                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                onClick={handleOpenCreateModal}
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
                                Nuevo Ajuste Negativo
                            </Button>
                        </Box>
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
                                id: 'warehouse',
                                label: 'Almacén',
                                render: (row) => row.warehouseName
                            },
                            {
                                id: 'location',
                                label: 'Ubicación',
                                render: (row) => row.locationName
                            },
                            {
                                id: 'quantity',
                                label: 'Cantidad',
                                align: 'center',
                                render: (row) => row.quantity
                            },
                            {
                                id: 'reason',
                                label: 'Razón',
                                render: (row) => row.reasonName || '-'
                            },
                            {
                                id: 'notes',
                                label: 'Notas',
                                render: (row) => row.notes || '-'
                            }
                        ]}
                        data={adjustments}
                        getRowId={(row) => String(row.id)}
                        loading={loading}
                        loadingMessage="Cargando ajustes..."
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
                        onClose={handleCloseCreateModal}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: '24px',
                                p: 1
                            }
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1E293B', pb: 1 }}>
                            Nuevo Ajuste Negativo
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

                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>Almacén</InputLabel>
                                    <Select
                                        value={formData.warehouseId}
                                        label="Almacén"
                                        onChange={(e) => handleFormChange('warehouseId', e.target.value)}
                                        disabled={!formData.lotId || warehouses.length === 0 || creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {warehouses.map((warehouse) => (
                                            <MenuItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>Ubicación</InputLabel>
                                    <Select
                                        value={formData.locationId}
                                        label="Ubicación"
                                        onChange={(e) => handleFormChange('locationId', e.target.value)}
                                        disabled={!formData.warehouseId || locations.length === 0 || creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {locations.map((location) => (
                                            <MenuItem key={location.id} value={location.id}>
                                                {location.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>Razón</InputLabel>
                                    <Select
                                        value={formData.reasonId}
                                        label="Razón"
                                        onChange={(e) => handleFormChange('reasonId', e.target.value)}
                                        disabled={creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {reasons.map((reason) => (
                                            <MenuItem key={reason.id} value={reason.id}>
                                                {reason.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

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
                                onClick={handleCloseCreateModal}
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
                                onClick={handleCreateAdjustment}
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

export default NegativeAdjustments;
