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
    TableRow,
    TextField,
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
        // Placeholder para funcionalidad de escaneo
        enqueueSnackbar('Funcionalidad de escaneo en desarrollo', { variant: "info" });
    };

    const handleSupplierLotChange = (supplierLotId: number) => {
        const selectedLot = supplierLots.find(lot => lot.id === supplierLotId);
        setSelectedSupplierLot(selectedLot || null);
        
        if (selectedLot) {
            // Auto-llenar los datos del lote de proveedor
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

        // Encontrar nombres para mostrar
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
                    console.error("Error creating receiving:", response.message);
                }
            } catch (error) {
                failCount++;
                console.error("Error creating receiving:", error);
            }
        }

        setLoadingMovements(false);

        if (failCount === 0) {
            enqueueSnackbar(t('receiving.messages.allMovementsLoaded'), { variant: "success" });
            setAddedProducts([]);
        } else if (successCount > 0) {
            enqueueSnackbar(t('receiving.messages.someMovementsFailed'), { variant: "warning" });
            // Mantener solo los que fallaron (esto requeriría un tracking más complejo)
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
                    <Box display="flex" gap={2} mb={3}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<QrCodeScannerIcon />}
                            onClick={handleScanProduct}
                        >
                            {t('receiving.scan')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={handleOpenCreateModal}
                        >
                            {t('receiving.manualEntry')}
                        </Button>
                    </Box>

                    {/* Added Products Panel */}
                    <Paper sx={{ mb: 3 }}>
                        <Box p={2} borderBottom={1} borderColor="divider">
                            <Typography variant="h6" fontWeight={600}>
                                {t('receiving.addedProducts')}
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('receiving.table.item')}</TableCell>
                                        <TableCell>{t('receiving.table.supplierLot')}</TableCell>
                                        <TableCell>{t('receiving.table.supplier')}</TableCell>
                                        <TableCell>{t('receiving.table.warehouse')}</TableCell>
                                        <TableCell>{t('receiving.table.location')}</TableCell>
                                        <TableCell>{t('receiving.table.quantity')}</TableCell>
                                        <TableCell>{t('receiving.table.notes')}</TableCell>
                                        <TableCell align="center">{t('receiving.table.actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {addedProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Typography color="text.secondary" py={3}>
                                                    {t('receiving.noAddedProducts')}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        addedProducts.map((product) => (
                                            <TableRow key={product.tempId} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{product.itemName}</Typography>
                                                </TableCell>
                                                <TableCell>{product.supplierLotName}</TableCell>
                                                <TableCell>{product.supplierName}</TableCell>
                                                <TableCell>{product.warehouseName}</TableCell>
                                                <TableCell>{product.locationName}</TableCell>
                                                <TableCell>{product.quantity}</TableCell>
                                                <TableCell>{product.notes || '-'}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveProduct(product.tempId)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {addedProducts.length > 0 && (
                            <Box p={2} display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleLoadMovements}
                                    disabled={loadingMovements}
                                    startIcon={loadingMovements ? <CircularProgress size={18} color="inherit" /> : undefined}
                                >
                                    {loadingMovements ? 'Cargando...' : t('receiving.loadMovement')}
                                </Button>
                            </Box>
                        )}
                    </Paper>

                    {/* Add Product Modal */}
                    <Dialog open={createModalOpen} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
                        <DialogTitle>{t('receiving.form.title')}</DialogTitle>
                        <DialogContent dividers>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <FormControl fullWidth required>
                                    <InputLabel>{t('receiving.form.supplierLot')}</InputLabel>
                                    <Select
                                        value={formData.supplierLotId || ''}
                                        label={t('receiving.form.supplierLot')}
                                        onChange={(e) => handleSupplierLotChange(e.target.value as number)}
                                        disabled={creating}
                                    >
                                        {supplierLots.map((lot) => (
                                            <MenuItem key={lot.id} value={lot.id}>
                                                {lot.description} - {lot.itemDescription} ({lot.supplierDescription})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>{t('receiving.form.item')}</InputLabel>
                                    <Select
                                        value={formData.itemId || ''}
                                        label={t('receiving.form.item')}
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
                                    <InputLabel>{t('receiving.form.supplier')}</InputLabel>
                                    <Select
                                        value={formData.supplierId || ''}
                                        label={t('receiving.form.supplier')}
                                        onChange={(e) => handleFormChange('supplierId', e.target.value)}
                                        disabled={creating}
                                    >
                                        {suppliers.map((supplier) => (
                                            <MenuItem key={supplier.id} value={supplier.id}>
                                                {supplier.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    required
                                    label={t('receiving.form.quantity')}
                                    type="number"
                                    value={formData.quantity || ''}
                                    onChange={(e) => handleFormChange('quantity', parseInt(e.target.value) || 0)}
                                    disabled={creating}
                                />

                                                                <FormControl fullWidth required>
                                    <InputLabel>{t('receiving.form.warehouse')}</InputLabel>
                                    <Select
                                        value={formData.warehouseId || ''}
                                        label={t('receiving.form.warehouse')}
                                        onChange={(e) => handleWarehouseChange(e.target.value as number)}
                                        disabled={creating}
                                    >
                                        {warehouses.map((warehouse) => (
                                            <MenuItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>{t('receiving.form.location')}</InputLabel>
                                    <Select
                                        value={formData.locationId || ''}
                                        label={t('receiving.form.location')}
                                        onChange={(e) => handleFormChange('locationId', e.target.value)}
                                        disabled={creating || !formData.warehouseId}
                                    >
                                        {locations.map((location) => (
                                            <MenuItem key={location.id} value={location.id}>
                                                {location.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label={t('receiving.form.notes')}
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
                                {t('receiving.form.cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddProduct}
                                disabled={creating}
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
