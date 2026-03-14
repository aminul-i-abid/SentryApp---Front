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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    getItems,
    createItem,
    updateItem,
    deleteItem
} from './itemsService';
import { ItemResponse, ItemFormData } from './models/Item';
import { getItemUnitOfMeasures } from '../item-unit-of-measure/itemUnitOfMeasureService';
import { ItemUnitOfMeasureResponse } from '../item-unit-of-measure/models/ItemUnitOfMeasure';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import authRoles from '@auth/authRoles';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useSnackbar } from 'notistack';
import StyledTable from '@/components/ui/StyledTable';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
}));

function Items() {
    const { t } = useTranslation('items');
    const { authState } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [items, setItems] = useState<ItemResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemResponse | null>(null);
    const [deletingItem, setDeletingItem] = useState<ItemResponse | null>(null);
    const [formData, setFormData] = useState<ItemFormData>({
        description: '',
        hasLot: false,
        unitOfMeasureId: 0
    });
    const [saving, setSaving] = useState(false);
    const [unitOfMeasures, setUnitOfMeasures] = useState<ItemUnitOfMeasureResponse[]>([]);
    const [loadingUnitOfMeasures, setLoadingUnitOfMeasures] = useState(false);

    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    const fetchUnitOfMeasures = async () => {
        setLoadingUnitOfMeasures(true);
        try {
            const response = await getItemUnitOfMeasures(1, 1000);
            if (response.succeeded && response.data) {
                const items = response.data.items || [];
                setUnitOfMeasures(items);
            } else {
                setUnitOfMeasures([]);
            }
        } catch (error) {
            console.error('Error fetching unit of measures:', error);
            setUnitOfMeasures([]);
        } finally {
            setLoadingUnitOfMeasures(false);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await getItems(page + 1, rowsPerPage);
            if (response.succeeded && response.data) {
                const items = response.data.items || [];
                setItems(items);
                setTotalCount(response.data.totalCount || 0);
            } else {
                setItems([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
            setTotalCount(0);
            enqueueSnackbar(t('errors.load'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (itemsList: ItemResponse[], search: string) => {
        // Filtering is now handled by server-side pagination
    };

    useEffect(() => {
        fetchItems();
        fetchUnitOfMeasures();
    }, [page, rowsPerPage]);

    useEffect(() => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchItems();
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
                fetchItems();
            }
        }
    };

    const handleSearchClick = () => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchItems();
        }
    };

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setFormData({
            description: '',
            hasLot: false,
            unitOfMeasureId: 0
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: ItemResponse) => {
        setEditingItem(item);
        setFormData({
            description: item.description,
            hasLot: item.hasLot,
            unitOfMeasureId: item.unitOfMeasureId
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            description: '',
            hasLot: false,
            unitOfMeasureId: 0
        });
        setSaving(false);
    };

    const handleSave = async () => {
        if (!formData.description.trim()) {
            enqueueSnackbar(t('errors.emptyDescription'), { variant: 'warning' });
            return;
        }

        if (!formData.unitOfMeasureId || formData.unitOfMeasureId === 0) {
            enqueueSnackbar(t('errors.emptyUnitOfMeasure'), { variant: 'warning' });
            return;
        }

        setSaving(true);
        try {
            let response;

            if (editingItem) {
                response = await updateItem(editingItem.id, formData);
            } else {
                response = await createItem(formData);
            }

            if (response.succeeded) {
                enqueueSnackbar(editingItem ? t('messages.updated') : t('messages.created'), { variant: 'success' });
                handleCloseModal();
                fetchItems();
            } else {
                enqueueSnackbar(response.errors?.[0] || (editingItem ? t('errors.update') : t('errors.create')), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error saving item:', error);
            enqueueSnackbar(editingItem ? t('errors.update') : t('errors.create'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteModal = (item: ItemResponse) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingItem) return;

        try {
            const response = await deleteItem(deletingItem.id);
            if (response.succeeded) {
                enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
                handleCloseDeleteModal();
                fetchItems();
            } else {
                enqueueSnackbar(response.errors?.[0] || t('errors.delete'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            enqueueSnackbar(t('errors.delete'), { variant: 'error' });
        }
    };

    const getUnitOfMeasureDescription = (unitOfMeasureId: number): string => {
        const unit = unitOfMeasures.find(u => u.id === unitOfMeasureId);
        return unit?.description || '-';
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
                                    {t('addNew')}
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

                        <StyledTable<ItemResponse>
                            columns={[
                                {
                                    id: 'description',
                                    label: t('table.description'),
                                    render: (row) => (
                                        <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                            {row.description}
                                        </Typography>
                                    )
                                },
                                {
                                    id: 'hasLot',
                                    label: t('table.hasLot'),
                                    align: 'center',
                                    render: (row) => (
                                        <Typography sx={{ color: '#334155' }}>
                                            {row.hasLot ? t('table.yes') : t('table.no')}
                                        </Typography>
                                    )
                                },
                                {
                                    id: 'unitOfMeasure',
                                    label: t('table.unitOfMeasure'),
                                    render: (row) => (
                                        <Typography sx={{ color: '#334155' }}>
                                            {row.unitOfMeasureDescription || getUnitOfMeasureDescription(row.unitOfMeasureId)}
                                        </Typography>
                                    )
                                }
                            ]}
                            data={items}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage="Cargando items..."
                            emptyMessage={t('empty.message')}
                            renderActions={(row) => isAdmin && (
                                <Box display="flex" justifyContent="center" gap={1}>
                                    <Tooltip title={t('actions.edit')}>
                                        <IconButton
                                            size="small"
                                            sx={{ color: '#415EDE' }}
                                            onClick={() => handleOpenEditModal(row)}
                                        >
                                            <img src="./assets/icons/edit-black.png" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('actions.delete')}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteModal(row)}
                                            sx={{ color: '#EF4444' }}
                                        >
                                            <img src="./assets/icons/delete.png" />
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
                            minWidth={1000}
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
                    {editingItem ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('form.description')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <Box
                                component="textarea"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ingrese la descripción del item"
                                rows={3}
                                sx={{
                                    width: '100%',
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid #E2E8F0',
                                    bgcolor: 'white',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                    '&:focus': {
                                        borderColor: '#415EDE',
                                        boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
                                    }
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('form.unitOfMeasure')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <FormControl fullWidth required disabled={saving || loadingUnitOfMeasures}>
                                <Select
                                    value={formData.unitOfMeasureId || ''}
                                    displayEmpty
                                    onChange={(e) => setFormData({ ...formData, unitOfMeasureId: Number(e.target.value) })}
                                    sx={{
                                        height: 44,
                                        borderRadius: 2,
                                        bgcolor: 'white',
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#415EDE',
                                            borderWidth: '2px',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#415EDE',
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>{t('form.selectUnitOfMeasure')}</em>
                                    </MenuItem>
                                    {unitOfMeasures.map((unit) => (
                                        <MenuItem key={unit.id} value={unit.id}>
                                            {unit.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.hasLot}
                                    onChange={(e) => setFormData({ ...formData, hasLot: e.target.checked })}
                                    disabled={saving}
                                    sx={{
                                        color: '#E2E8F0',
                                        '&.Mui-checked': {
                                            color: '#415EDE',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                    {t('form.hasLot')}
                                </Typography>
                            }
                        />
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
                        disabled={saving || !formData.description.trim() || !formData.unitOfMeasureId}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            bgcolor: '#415EDE',
                            color: 'white',
                            fontWeight: 600,
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
                title={t('deleteModal.title')}
                message={t('deleteModal.message')}
                type="delete"
            />
        </>
    );
}

export default Items;
