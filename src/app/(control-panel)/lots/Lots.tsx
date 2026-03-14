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
import StyledTable from '@/components/ui/StyledTable';

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

                        <StyledTable<LotResponse>
                            columns={[
                                {
                                    id: 'item',
                                    label: t('table.item'),
                                    render: (row) => (
                                        <Typography sx={{ color: '#334155' }}>
                                            {row.itemDescription || getItemDescription(row.itemId)}
                                        </Typography>
                                    )
                                },
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
                                    id: 'quantity',
                                    label: t('table.quantity'),
                                    align: 'center',
                                    render: (row) => (
                                        <Typography sx={{ color: '#334155' }}>
                                            {row.quantity}
                                        </Typography>
                                    )
                                },
                                {
                                    id: 'expirationDate',
                                    label: t('table.expirationDate'),
                                    align: 'center',
                                    render: (row) => (
                                        <Typography sx={{ color: '#334155' }}>
                                            {formatDate(row.expirationDate)}
                                        </Typography>
                                    )
                                }
                            ]}
                            data={lots}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage="Cargando lotes..."
                            emptyMessage={t('empty.message')}
                            renderActions={(row) => isAdmin && (
                                <Box display="flex" justifyContent="center" gap={1}>
                                    <Tooltip title={t('actions.edit')}>
                                        <IconButton
                                            size="small"
                                            sx={{ color: '#415EDE' }}
                                            onClick={() => handleOpenEditModal(row)}
                                        >
                                            <img src="./assets/icons/edit-black.png" alt="" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('actions.delete')}>
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
                    {editingLot ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('form.item')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <FormControl fullWidth required disabled={saving || loadingItems}>
                                <Select
                                    value={formData.itemId || ''}
                                    displayEmpty
                                    onChange={(e) => setFormData({ ...formData, itemId: Number(e.target.value) })}
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
                                        <em>{t('form.selectItem')}</em>
                                    </MenuItem>
                                    {items.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.description}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('form.description')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <Box
                                component="textarea"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ingrese la descripción del lote"
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
                                {t('form.quantity')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <Box
                                component="input"
                                type="number"
                                value={formData.quantity || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                min={1}
                                sx={{
                                    width: '100%',
                                    height: 44,
                                    px: 2,
                                    borderRadius: 2,
                                    border: '1px solid #E2E8F0',
                                    bgcolor: 'white',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
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
                                {t('form.expirationDate')}
                            </Typography>
                            <Box
                                component="input"
                                type="date"
                                value={expirationDateInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setExpirationDateInput(e.target.value);
                                    setFormData({ ...formData, expirationDate: e.target.value ? new Date(e.target.value) : null });
                                }}
                                sx={{
                                    width: '100%',
                                    height: 44,
                                    px: 2,
                                    borderRadius: 2,
                                    border: '1px solid #E2E8F0',
                                    bgcolor: 'white',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    '&:focus': {
                                        borderColor: '#415EDE',
                                        boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
                                    }
                                }}
                            />
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
                        disabled={saving || !formData.description.trim() || !formData.itemId || !formData.quantity}
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
                title={t('deleteModal.title')}
                message={t('deleteModal.message')}
                type="delete"
            />
        </>
    );
}

export default Lots;
