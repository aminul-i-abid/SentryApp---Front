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
import DeleteIcon from "@mui/icons-material/Delete";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import './i18n';
import { createReceiving } from "./receivingService";
import { CreateReceivingDto } from "./models/Receiving";
import { getItems } from "../items/itemsService";
import { getSuppliers } from "../suppliers/supplierService";
import { getSupplierLots } from "../supplier-lots/supplierLotsService";
import { getWarehouses } from "../warehouses/warehousesService";
import { getLocations } from "../locations/locationsService";
import type { SupplierLotResponse } from "../supplier-lots/models/SupplierLot";
import StyledTable from "@/components/ui/StyledTable";

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
}));

interface AddedProduct extends CreateReceivingDto {
    tempId: number;
    itemName: string;
    supplierName: string;
    supplierLotName: string;
    warehouseName: string;
    locationName: string;
}

function Receiving() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation('receiving');

    // State for added products (temporal)
    const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([]);
    const [nextTempId, setNextTempId] = useState(1);
    const [loadingMovements, setLoadingMovements] = useState(false);

    // Modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState<CreateReceivingDto>({
        itemId: 0,
        warehouseId: 0,
        locationId: 0,
        quantity: 0,
        supplierId: 0,
        supplierLotId: 0,
        reasonId: undefined,
        notes: ''
    });

    // Dropdown data
    const [items, setItems] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [supplierLots, setSupplierLots] = useState<SupplierLotResponse[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedSupplierLot, setSelectedSupplierLot] = useState<SupplierLotResponse | null>(null);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [itemsRes, suppliersRes, supplierLotsRes, warehousesRes] = await Promise.all([
                getItems(1, 1000),
                getSuppliers(1, 1000),
                getSupplierLots(),
                getWarehouses(1, 1000)
            ]);

            if (itemsRes.succeeded && itemsRes.data?.items) {
                setItems(itemsRes.data.items);
            }
            if (suppliersRes.succeeded && suppliersRes.data?.items) {
                setSuppliers(suppliersRes.data.items);
            }
            if (supplierLotsRes.succeeded && Array.isArray(supplierLotsRes.data)) {
                setSupplierLots(supplierLotsRes.data);
            }
            if (warehousesRes.succeeded && warehousesRes.data?.items) {
                setWarehouses(warehousesRes.data.items);
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    };

    const fetchLocationsByWarehouse = async (warehouseId: number) => {
        try {
            const response = await getLocations(1, 1000, warehouseId);
            if (response.succeeded && response.data?.items) {
                setLocations(response.data.items);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const handleOpenCreateModal = () => {
        setFormData({
            itemId: 0,
            warehouseId: 0,
            locationId: 0,
            quantity: 0,
            supplierId: 0,
            supplierLotId: 0,
            reasonId: undefined,
            notes: ''
        });
        setSelectedSupplierLot(null);
        setLocations([]);
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        setCreating(false);
    };

    const handleScanProduct = () => {
        enqueueSnackbar('Funcionalidad de escaneo en desarrollo', { variant: "info" });
    };

    const handleSupplierLotChange = (supplierLotId: number) => {
        const selectedLot = supplierLots.find(lot => lot.id === supplierLotId);
        setSelectedSupplierLot(selectedLot || null);
        
        if (selectedLot) {
            setFormData(prev => ({
                ...prev,
                supplierLotId: selectedLot.id,
                itemId: selectedLot.itemId,
                supplierId: selectedLot.supplierId,
                quantity: selectedLot.portionQuantity
            }));
        }
    };

    const handleWarehouseChange = (warehouseId: number) => {
        setFormData(prev => ({ ...prev, warehouseId, locationId: 0 }));
        setLocations([]);
        if (warehouseId > 0) {
            fetchLocationsByWarehouse(warehouseId);
        }
    };

    const handleFormChange = (field: keyof CreateReceivingDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddProduct = () => {
        if (!formData.itemId || !formData.quantity || !formData.supplierId || !formData.supplierLotId || !formData.warehouseId || !formData.locationId) {
            enqueueSnackbar(t('receiving.messages.requiredFields'), { variant: "warning" });
            return;
        }

        const item = items.find(i => i.id === formData.itemId);
        const supplier = suppliers.find(s => s.id === formData.supplierId);
        const supplierLot = supplierLots.find(sl => sl.id === formData.supplierLotId);
        const warehouse = warehouses.find(w => w.id === formData.warehouseId);
        const location = locations.find(l => l.id === formData.locationId);

        const newProduct: AddedProduct = {
            ...formData,
            tempId: nextTempId,
            itemName: item?.description || '',
            supplierName: supplier?.description || '',
            supplierLotName: supplierLot?.description || '',
            warehouseName: warehouse?.description || '',
            locationName: location?.description || ''
        };

        setAddedProducts(prev => [...prev, newProduct]);
        setNextTempId(prev => prev + 1);
        enqueueSnackbar(t('receiving.messages.productAdded'), { variant: "success" });
        handleCloseCreateModal();
    };

    const handleRemoveProduct = (tempId: number) => {
        setAddedProducts(prev => prev.filter(p => p.tempId !== tempId));
        enqueueSnackbar(t('receiving.messages.productRemoved'), { variant: "info" });
    };

    const handleLoadMovements = async () => {
        if (addedProducts.length === 0) {
            enqueueSnackbar(t('receiving.messages.noProductsToLoad'), { variant: "warning" });
            return;
        }

        setLoadingMovements(true);
        let successCount = 0;
        let failCount = 0;

        for (const product of addedProducts) {
            try {
                const { tempId, itemName, supplierName, supplierLotName, warehouseName, locationName, ...productData } = product;
                const response = await createReceiving(productData);
                
                if (response.succeeded) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        setLoadingMovements(false);

        if (failCount === 0) {
            enqueueSnackbar(t('receiving.messages.allMovementsLoaded'), { variant: "success" });
            setAddedProducts([]);
        } else if (successCount > 0) {
            enqueueSnackbar(t('receiving.messages.someMovementsFailed'), { variant: "warning" });
            setAddedProducts([]);
        } else {
            enqueueSnackbar(t('receiving.messages.createError'), { variant: "error" });
        }
    };

    return (
        <Root
            scroll="content"
            header={
                <div className="p-6 flex items-center justify-between">
                    {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                    <h2 className="text-2xl font-bold">{t('receiving.title')}</h2>
                </div>
            }
            content={
                <div className="p-6">
                    {/* Action Buttons */}
                    <Box display="flex" gap={2} mb={4}>
                        <Button
                            variant="outlined"
                            onClick={handleScanProduct}
                            sx={{
                                color: '#415EDE',
                                borderColor: '#415EDE',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                    borderColor: '#415EDE',
                                    bgcolor: 'rgba(65, 94, 222, 0.04)'
                                }
                            }}
                            startIcon={<QrCodeScannerIcon />}
                        >
                            {t('receiving.scan')}
                        </Button>
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
                            startIcon={<EditIcon />}
                        >
                            {t('receiving.manualEntry')}
                        </Button>
                    </Box>

                    {/* Added Products Table */}
                    <Box sx={{ mb: 4 }}>
                        <Box p={2} sx={{ bgcolor: 'white', borderRadius: '16px 16px 0 0', border: '1px solid #E2E8F0', borderBottom: 'none' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
                                {t('receiving.addedProducts')}
                            </Typography>
                        </Box>
                        <StyledTable<AddedProduct>
                            columns={[
                                {
                                    id: 'item',
                                    label: t('receiving.table.item'),
                                    render: (row) => (
                                        <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                            {row.itemName}
                                        </Typography>
                                    )
                                },
                                {
                                    id: 'supplierLot',
                                    label: t('receiving.table.supplierLot'),
                                    render: (row) => row.supplierLotName
                                },
                                {
                                    id: 'supplier',
                                    label: t('receiving.table.supplier'),
                                    render: (row) => row.supplierName
                                },
                                {
                                    id: 'warehouse',
                                    label: t('receiving.table.warehouse'),
                                    render: (row) => row.warehouseName
                                },
                                {
                                    id: 'location',
                                    label: t('receiving.table.location'),
                                    render: (row) => row.locationName
                                },
                                {
                                    id: 'quantity',
                                    label: t('receiving.table.quantity'),
                                    render: (row) => row.quantity
                                },
                                {
                                    id: 'notes',
                                    label: t('receiving.table.notes'),
                                    render: (row) => row.notes || '-'
                                }
                            ]}
                            data={addedProducts}
                            getRowId={(row) => String(row.tempId)}
                            emptyMessage={t('receiving.noAddedProducts')}
                            renderActions={(row) => (
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveProduct(row.tempId)}
                                    sx={{
                                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                            minWidth={1000}
                        />
                        {addedProducts.length > 0 && (
                            <Box 
                                p={3} 
                                display="flex" 
                                justifyContent="flex-end" 
                                sx={{ 
                                    bgcolor: 'white', 
                                    borderRadius: '0 0 16px 16px', 
                                    border: '1px solid #E2E8F0', 
                                    borderTop: 'none' 
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleLoadMovements}
                                    disabled={loadingMovements}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        boxShadow: 'none',
                                        '&:hover': {
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }
                                    }}
                                    startIcon={loadingMovements ? <CircularProgress size={18} color="inherit" /> : undefined}
                                >
                                    {loadingMovements ? 'Cargando...' : t('receiving.loadMovement')}
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Add Product Modal */}
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
                            {t('receiving.form.title')}
                        </DialogTitle>
                        <DialogContent>
                            <Box display="flex" flexDirection="column" gap={3} pt={2}>
                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>{t('receiving.form.supplierLot')}</InputLabel>
                                    <Select
                                        value={formData.supplierLotId || ''}
                                        label={t('receiving.form.supplierLot')}
                                        onChange={(e) => handleSupplierLotChange(e.target.value as number)}
                                        disabled={creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {supplierLots.map((lot) => (
                                            <MenuItem key={lot.id} value={lot.id}>
                                                {lot.description} - {lot.itemDescription} ({lot.supplierDescription})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>{t('receiving.form.item')}</InputLabel>
                                    <Select
                                        value={formData.itemId || ''}
                                        label={t('receiving.form.item')}
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
                                    <InputLabel sx={{ fontWeight: 500 }}>{t('receiving.form.supplier')}</InputLabel>
                                    <Select
                                        value={formData.supplierId || ''}
                                        label={t('receiving.form.supplier')}
                                        onChange={(e) => handleFormChange('supplierId', e.target.value)}
                                        disabled={creating}
                                        sx={{
                                            borderRadius: '12px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#415EDE',
                                                borderWidth: '2px',
                                            }
                                        }}
                                    >
                                        {suppliers.map((supplier) => (
                                            <MenuItem key={supplier.id} value={supplier.id}>
                                                {supplier.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box>
                                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: '#64748B', mb: 0.5, display: 'block' }}>
                                        {t('receiving.form.quantity')} *
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
                                            bgcolor: '#F8FAFC',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            '&:focus': {
                                                borderColor: '#415EDE',
                                                bgcolor: 'white',
                                                boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                                            }
                                        }}
                                    />
                                </Box>

                                <FormControl fullWidth required>
                                    <InputLabel sx={{ fontWeight: 500 }}>{t('receiving.form.warehouse')}</InputLabel>
                                    <Select
                                        value={formData.warehouseId || ''}
                                        label={t('receiving.form.warehouse')}
                                        onChange={(e) => handleWarehouseChange(e.target.value as number)}
                                        disabled={creating}
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
                                    <InputLabel sx={{ fontWeight: 500 }}>{t('receiving.form.location')}</InputLabel>
                                    <Select
                                        value={formData.locationId || ''}
                                        label={t('receiving.form.location')}
                                        onChange={(e) => handleFormChange('locationId', e.target.value)}
                                        disabled={creating || !formData.warehouseId}
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

                                <Box>
                                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color: '#64748B', mb: 0.5, display: 'block' }}>
                                        {t('receiving.form.notes')}
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
                                            bgcolor: '#F8FAFC',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            resize: 'none',
                                            transition: 'all 0.2s',
                                            '&:focus': {
                                                borderColor: '#415EDE',
                                                bgcolor: 'white',
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
                                {t('receiving.form.cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleAddProduct}
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
                            >
                                {t('receiving.form.save')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            }
        />
    );
}

export default Receiving;
