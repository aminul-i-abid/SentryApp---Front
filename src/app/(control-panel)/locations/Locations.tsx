import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Box,
    CircularProgress,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    getLocations, 
    createLocation,
    updateLocation,
    deleteLocation 
} from './locationsService';
import { getWarehouses } from '../warehouses/warehousesService';
import type { LocationResponse, LocationFormData } from './models/Location';
import type { WarehouseResponse } from '../warehouses/models/Warehouse';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import authRoles from '@auth/authRoles';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useSnackbar } from 'notistack';
import './i18n/index';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
}));

function Locations() {
    const { t } = useTranslation('locations');
    const { authState } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationResponse | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<LocationResponse | null>(null);
    const [formData, setFormData] = useState<LocationFormData>({ 
        description: '',
        warehouseId: 0
    });
    const [saving, setSaving] = useState(false);

    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const response = await getLocations(page + 1, rowsPerPage);
            if (response.succeeded && response.data) {
                const items = response.data.items || [];
                setLocations(items);
                setTotalCount(response.data.totalCount || 0);
            } else {
                setLocations([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setLocations([]);
            setTotalCount(0);
            enqueueSnackbar(t('errors.load'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await getWarehouses(1, 1000);
            if (response.succeeded && response.data) {
                const items = response.data.items || [];
                setWarehouses(items);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const applyFilters = (locationsList: LocationResponse[], search: string) => {
        // Filtering is now handled by server-side pagination
    };

    useEffect(() => {
        fetchLocations();
        fetchWarehouses();
    }, [page, rowsPerPage]);

    useEffect(() => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchLocations();
        }
    }, [searchTerm]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (page !== 0) {
                setPage(0);
            } else {
                fetchLocations();
            }
        }
    };

    const handleSearchClick = () => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchLocations();
        }
    };

    const handleOpenAddModal = () => {
        setEditingLocation(null);
        setFormData({ description: '', warehouseId: 0 });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (location: LocationResponse) => {
        setEditingLocation(location);
        setFormData({ 
            description: location.description,
            warehouseId: location.warehouseId
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLocation(null);
        setFormData({ description: '', warehouseId: 0 });
        setSaving(false);
    };

    const handleSave = async () => {
        if (!formData.description.trim()) {
            enqueueSnackbar(t('errors.emptyDescription'), { variant: 'warning' });
            return;
        }

        if (!formData.warehouseId || formData.warehouseId === 0) {
            enqueueSnackbar(t('errors.emptyWarehouse'), { variant: 'warning' });
            return;
        }

        setSaving(true);
        try {
            let response;
            
            if (editingLocation) {
                response = await updateLocation(editingLocation.id, formData);
            } else {
                response = await createLocation(formData);
            }

            if (response.succeeded) {
                enqueueSnackbar(editingLocation ? t('messages.updated') : t('messages.created'), { variant: 'success' });
                handleCloseModal();
                fetchLocations();
            } else {
                enqueueSnackbar(response.errors?.[0] || (editingLocation ? t('errors.update') : t('errors.create')), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error saving location:', error);
            enqueueSnackbar(editingLocation ? t('errors.update') : t('errors.create'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteModal = (location: LocationResponse) => {
        setDeletingLocation(location);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingLocation(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingLocation) return;

        try {
            const response = await deleteLocation(deletingLocation.id);
            if (response.succeeded) {
                enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
                handleCloseDeleteModal();
                fetchLocations();
            } else {
                enqueueSnackbar(response.errors?.[0] || t('errors.delete'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            enqueueSnackbar(t('errors.delete'), { variant: 'error' });
        }
    };

    return (
        <>
            <Root
                scroll="content"
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">{t('title')}</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenAddModal}
                                >
                                    {t('addButton')}
                                </Button>
                            )}
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
                                        placeholder={t('search')}
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
                            </Box>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('columns.id')}</TableCell>
                                        <TableCell>{t('columns.description')}</TableCell>
                                        <TableCell>{t('columns.warehouse')}</TableCell>
                                        {isAdmin && <TableCell align="right">{t('columns.actions')}</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <CircularProgress size={24} />
                                                    <Typography>{t('loading')}</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : locations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography color="text.secondary">{t('noData')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        locations.map((location) => (
                                            <TableRow key={location.id} hover>
                                                <TableCell>{location.id}</TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{location.description}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>{location.warehouseDescription || '-'}</Typography>
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell align="right">
                                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                                            <Tooltip title={t('modal.titleEdit')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenEditModal(location)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('delete.title')}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenDeleteModal(location)}
                                                                    color="error"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalCount}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage={t('pagination.rowsPerPage')}
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} ${t('pagination.of')} ${count !== -1 ? count : `${t('pagination.moreThan')} ${to}`}`
                                }
                            />
                        </TableContainer>
                    </div>
                }
            />

            {/* Add/Edit Modal */}
            <Dialog 
                open={isModalOpen} 
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingLocation ? t('modal.titleEdit') : t('modal.titleCreate')}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField
                            label={t('modal.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            required
                            disabled={saving}
                            placeholder="Ingrese la descripción de la ubicación"
                            multiline
                            rows={2}
                        />
                        
                        <FormControl fullWidth required disabled={saving}>
                            <InputLabel>{t('modal.warehouse')}</InputLabel>
                            <Select
                                value={formData.warehouseId}
                                onChange={(e) => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
                                label={t('modal.warehouse')}
                            >
                                <MenuItem value={0} disabled>
                                    {t('modal.selectWarehouse')}
                                </MenuItem>
                                {warehouses.map((warehouse) => (
                                    <MenuItem key={warehouse.id} value={warehouse.id}>
                                        {warehouse.description}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        color="inherit"
                        onClick={handleCloseModal} 
                        disabled={saving}
                    >
                        {t('modal.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={saving || !formData.description.trim() || formData.warehouseId === 0}
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
                    >
                        {saving ? 'Guardando...' : t('modal.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title={t('delete.title')}
                message={deletingLocation ? t('delete.message', { description: deletingLocation.description }) : ''}
                type="delete"
            />
        </>
    );
}

export default Locations;
