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
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenAddModal}
                                >
                                    {t('addNew')}
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
                                        <TableCell>{t('table.description')}</TableCell>
                                        <TableCell>{t('table.hasLot')}</TableCell>
                                        <TableCell>{t('table.unitOfMeasure')}</TableCell>
                                        {isAdmin && <TableCell align="right">{t('table.actions')}</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <CircularProgress size={24} />
                                                    <Typography>Cargando items...</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography color="text.secondary">{t('empty.message')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{item.description}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {item.hasLot ? t('table.yes') : t('table.no')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>
                                                        {item.unitOfMeasureDescription || getUnitOfMeasureDescription(item.unitOfMeasureId)}
                                                    </Typography>
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell align="right">
                                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                                            <Tooltip title={t('actions.edit')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenEditModal(item)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('actions.delete')}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenDeleteModal(item)}
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
                    {editingItem ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField
                            label={t('form.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            required
                            disabled={saving}
                            placeholder="Ingrese la descripción del item"
                            multiline
                            rows={3}
                        />
                        
                        <FormControl fullWidth required disabled={saving || loadingUnitOfMeasures}>
                            <InputLabel id="unit-of-measure-label">{t('form.unitOfMeasure')}</InputLabel>
                            <Select
                                labelId="unit-of-measure-label"
                                value={formData.unitOfMeasureId || ''}
                                label={t('form.unitOfMeasure')}
                                onChange={(e) => setFormData({ ...formData, unitOfMeasureId: Number(e.target.value) })}
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

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.hasLot}
                                    onChange={(e) => setFormData({ ...formData, hasLot: e.target.checked })}
                                    disabled={saving}
                                />
                            }
                            label={t('form.hasLot')}
                        />
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
                        disabled={saving || !formData.description.trim() || !formData.unitOfMeasureId}
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
                title={t('deleteModal.title')}
                message={t('deleteModal.message')}
                type="delete"
            />
        </>
    );
}

export default Items;
