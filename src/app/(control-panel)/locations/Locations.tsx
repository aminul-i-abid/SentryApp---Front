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
import StyledTable from '@/components/ui/StyledTable';
import './i18n/index';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
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
                        <Box display="flex" justifyContent="flex-end" mb={4}>
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenAddModal}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3
                                    }}
                                >
                                    {t('addButton')}
                                </Button>
                            )}
                        </Box>

                        <Box mb={3}>
                            <Box display="flex" gap={1} alignItems="center" sx={{ maxWidth: 400 }}>
                                <Box
                                    component="input"
                                    type="text"
                                    placeholder={t('search')}
                                    value={searchTerm}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
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

                        <StyledTable<LocationResponse>
                            columns={[
                                {
                                    id: 'id',
                                    label: t('columns.id'),
                                    render: (row) => row.id
                                },
                                {
                                    id: 'description',
                                    label: t('columns.description'),
                                    render: (row) => (
                                        <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                            {row.description}
                                        </Typography>
                                    )
                                },
                                {
                                    id: 'warehouseDescription',
                                    label: t('columns.warehouse'),
                                    render: (row) => row.warehouseDescription || '-'
                                }
                            ]}
                            data={locations}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage={t('loading')}
                            emptyMessage={t('noData')}
                            renderActions={(row) => isAdmin && (
                                <Box display="flex" justifyContent="center" gap={1}>
                                    <Tooltip title={t('modal.titleEdit')}>
                                        <IconButton
                                            size="small"
                                            sx={{ color: '#415EDE' }}
                                            onClick={() => handleOpenEditModal(row)}
                                        >
                                            <img src="./assets/icons/edit-black.png" alt="" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('delete.title')}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteModal(row)}
                                            sx={{ color: '#EF4444' }}
                                        >
                                            <img src="./assets/icons/delete.png" alt="" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                            pagination={{
                                count: totalCount,
                                page: page,
                                rowsPerPage: rowsPerPage,
                                onPageChange: handleChangePage
                            }}
                            minWidth={800}
                        />
                    </div>
                }
            />

            {/* Add/Edit Modal */}
            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: 'white'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>
                    {editingLocation ? t('modal.titleEdit') : t('modal.titleCreate')}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('modal.description')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <Box
                                component="textarea"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ingrese la descripción de la ubicación"
                                rows={2}
                                sx={{
                                    width: '100%',
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid #E2E8F0',
                                    bgcolor: 'white',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    '&:focus': {
                                        borderColor: '#415EDE',
                                        boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
                                    }
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('modal.warehouse')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <FormControl fullWidth required disabled={saving} size="small">
                                <Select
                                    value={formData.warehouseId}
                                    displayEmpty
                                    onChange={(e) => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
                                    sx={{
                                        height: 40,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#415EDE',
                                            borderWidth: '2px',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#415EDE',
                                        }
                                    }}
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
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseModal}
                        disabled={saving}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            color: 'text.secondary',
                            fontWeight: 600
                        }}
                    >
                        {t('modal.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !formData.description.trim() || formData.warehouseId === 0}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            bgcolor: '#415EDE',
                            fontWeight: 600,
                            color: 'white',
                            '&:hover': {
                                bgcolor: '#354db1'
                            }
                        }}
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
