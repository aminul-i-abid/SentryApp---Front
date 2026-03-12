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
    TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    getLots, 
    createLot,
    updateLot,
    deleteLot 
} from './lotsService';
import { LotResponse, LotFormData } from './models/Lot';
import { getItems } from '../items/itemsService';
import { ItemResponse } from '../items/models/Item';
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

function Lots() {
    const { t } = useTranslation('lots');
    const { authState } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [lots, setLots] = useState<LotResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingLot, setEditingLot] = useState<LotResponse | null>(null);
    const [deletingLot, setDeletingLot] = useState<LotResponse | null>(null);
    const [formData, setFormData] = useState<LotFormData>({ 
        itemId: 0,
        description: '',
        quantity: 0,
        expirationDate: null
    });
    const [expirationDateInput, setExpirationDateInput] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState<ItemResponse[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    const fetchItems = async () => {
        setLoadingItems(true);
        try {
            const response = await getItems(1, 1000);
            if (response.succeeded && response.data) {
                const allItems = response.data.items || [];
                // Filtrar solo los items que tienen hasLot en true
                const itemsWithLot = allItems.filter(item => item.hasLot === true);
                setItems(itemsWithLot);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const fetchLots = async () => {
        setLoading(true);
        try {
            const response = await getLots(page + 1, rowsPerPage);
            if (response.succeeded && response.data) {
                const lotsData = response.data.items || [];
                setLots(lotsData);
                setTotalCount(response.data.totalCount || 0);
            } else {
                setLots([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching lots:', error);
            setLots([]);
            setTotalCount(0);
            enqueueSnackbar(t('errors.load'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (lotsList: LotResponse[], search: string) => {
        // Filtering is now handled by server-side pagination
        // This function can be removed or kept for future local filtering needs
    };

    useEffect(() => {
        fetchLots();
        fetchItems();
    }, [page, rowsPerPage]);

    useEffect(() => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchLots();
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
                fetchLots();
            }
        }
    };

    const handleSearchClick = () => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchLots();
        }
    };

    const handleOpenAddModal = () => {
        setEditingLot(null);
        setExpirationDateInput('');
        setFormData({ 
            itemId: 0,
            description: '',
            quantity: 0,
            expirationDate: null
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (lot: LotResponse) => {
        setEditingLot(lot);
        const dateStr = lot.expirationDate ? new Date(lot.expirationDate).toISOString().split('T')[0] : '';
        setExpirationDateInput(dateStr);
        setFormData({ 
            itemId: lot.itemId,
            description: lot.description,
            quantity: lot.quantity,
            expirationDate: lot.expirationDate ? null : null
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLot(null);
        setExpirationDateInput('');
        setFormData({ 
            itemId: 0,
            description: '',
            quantity: 0,
            expirationDate: null
        });
        setSaving(false);
    };

    const handleSave = async () => {
        if (!formData.description.trim()) {
            enqueueSnackbar(t('errors.emptyDescription'), { variant: 'warning' });
            return;
        }

        if (!formData.itemId || formData.itemId === 0) {
            enqueueSnackbar(t('errors.emptyItem'), { variant: 'warning' });
            return;
        }

        if (!formData.quantity || formData.quantity <= 0) {
            enqueueSnackbar(t('errors.emptyQuantity'), { variant: 'warning' });
            return;
        }

        setSaving(true);
        try {
            let response;
            
            if (editingLot) {
                response = await updateLot(editingLot.id, formData);
            } else {
                response = await createLot(formData);
            }

            if (response.succeeded) {
                enqueueSnackbar(editingLot ? t('messages.updated') : t('messages.created'), { variant: 'success' });
                handleCloseModal();
                fetchLots();
            } else {
                enqueueSnackbar(response.errors?.[0] || (editingLot ? t('errors.update') : t('errors.create')), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error saving lot:', error);
            enqueueSnackbar(editingLot ? t('errors.update') : t('errors.create'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteModal = (lot: LotResponse) => {
        setDeletingLot(lot);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingLot(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingLot) return;

        try {
            const response = await deleteLot(deletingLot.id);
            if (response.succeeded) {
                enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
                handleCloseDeleteModal();
                fetchLots();
            } else {
                enqueueSnackbar(response.errors?.[0] || t('errors.delete'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error deleting lot:', error);
            enqueueSnackbar(t('errors.delete'), { variant: 'error' });
        }
    };

    const getItemDescription = (itemId: number): string => {
        const item = items.find(i => i.id === itemId);
        return item?.description || '-';
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
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
                                        <TableCell>{t('table.item')}</TableCell>
                                        <TableCell>{t('table.description')}</TableCell>
                                        <TableCell>{t('table.quantity')}</TableCell>
                                        <TableCell>{t('table.expirationDate')}</TableCell>
                                        {isAdmin && <TableCell align="right">{t('table.actions')}</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <CircularProgress size={24} />
                                                    <Typography>Cargando lotes...</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : lots.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography color="text.secondary">{t('empty.message')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lots.map((lot) => (
                                            <TableRow key={lot.id} hover>
                                                <TableCell>
                                                    <Typography>
                                                        {lot.itemDescription || getItemDescription(lot.itemId)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{lot.description}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>{lot.quantity}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>{formatDate(lot.expirationDate)}</Typography>
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell align="right">
                                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                                            <Tooltip title={t('actions.edit')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenEditModal(lot)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('actions.delete')}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenDeleteModal(lot)}
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
                    {editingLot ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                            <FormControl fullWidth required disabled={saving || loadingItems}>
                                <InputLabel id="item-label">{t('form.item')}</InputLabel>
                                <Select
                                    labelId="item-label"
                                    value={formData.itemId || ''}
                                    label={t('form.item')}
                                    onChange={(e) => setFormData({ ...formData, itemId: Number(e.target.value) })}
                                >
                                    <MenuItem value="">
                                        <em>{t('form.selectItem')}</em>
                                    </MenuItem>
                                    {items.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label={t('form.description')}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                                required
                                disabled={saving}
                                placeholder="Ingrese la descripción del lote"
                                multiline
                                rows={3}
                            />

                            <TextField
                                label={t('form.quantity')}
                                type="number"
                                value={formData.quantity || ''}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                fullWidth
                                required
                                disabled={saving}
                                inputProps={{ min: 1 }}
                            />

                            <TextField
                                label={t('form.expirationDate')}
                                type="date"
                                value={expirationDateInput}
                                onChange={(e) => {
                                    setExpirationDateInput(e.target.value);
                                    setFormData({ ...formData, expirationDate: e.target.value ? new Date(e.target.value) : null });
                                }}
                                fullWidth
                                disabled={saving}
                                InputLabelProps={{ shrink: true }}
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
                        disabled={saving || !formData.description.trim() || !formData.itemId || !formData.quantity}
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

export default Lots;
