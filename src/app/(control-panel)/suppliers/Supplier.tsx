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
    TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from './supplierService';
import { SupplierResponse, SupplierFormData } from './models/Supplier';
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

function Supplier() {
    const { t } = useTranslation('supplier');
    const { authState } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<SupplierResponse | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<SupplierResponse | null>(null);
    const [formData, setFormData] = useState<SupplierFormData>({ description: '' });
    const [saving, setSaving] = useState(false);

    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await getSuppliers(page + 1, rowsPerPage);
            if (response.succeeded && response.data) {
                const items = response.data.items || [];
                setSuppliers(items);
                setTotalCount(response.data.totalCount || 0);
            } else {
                setSuppliers([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setSuppliers([]);
            setTotalCount(0);
            enqueueSnackbar(t('errors.load'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (suppliersList: SupplierResponse[], search: string) => {
        // Filtering is now handled by server-side pagination
    };

    useEffect(() => {
        fetchSuppliers();
    }, [page, rowsPerPage]);

    useEffect(() => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchSuppliers();
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
                fetchSuppliers();
            }
        }
    };

    const handleSearchClick = () => {
        if (page !== 0) {
            setPage(0);
        } else {
            fetchSuppliers();
        }
    };

    const handleOpenAddModal = () => {
        setEditingSupplier(null);
        setFormData({ description: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (supplier: SupplierResponse) => {
        setEditingSupplier(supplier);
        setFormData({ description: supplier.description });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
        setFormData({ description: '' });
        setSaving(false);
    };

    const handleSave = async () => {
        if (!formData.description.trim()) {
            enqueueSnackbar(t('errors.emptyDescription'), { variant: 'warning' });
            return;
        }

        setSaving(true);
        try {
            let response;

            if (editingSupplier) {
                response = await updateSupplier(editingSupplier.id, formData);
            } else {
                response = await createSupplier(formData);
            }

            if (response.succeeded) {
                enqueueSnackbar(editingSupplier ? t('messages.updated') : t('messages.created'), { variant: 'success' });
                handleCloseModal();
                fetchSuppliers();
            } else {
                enqueueSnackbar(response.errors?.[0] || (editingSupplier ? t('errors.update') : t('errors.create')), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error saving supplier:', error);
            enqueueSnackbar(editingSupplier ? t('errors.update') : t('errors.create'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteModal = (supplier: SupplierResponse) => {
        setDeletingSupplier(supplier);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingSupplier(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingSupplier) return;

        try {
            const response = await deleteSupplier(deletingSupplier.id);
            if (response.succeeded) {
                enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
                handleCloseDeleteModal();
                fetchSuppliers();
            } else {
                enqueueSnackbar(response.errors?.[0] || t('errors.delete'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
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

                        <StyledTable<SupplierResponse>
                            columns={[
                                {
                                    id: 'description',
                                    label: t('table.description'),
                                    render: (row) => (
                                        <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                            {row.description}
                                        </Typography>
                                    )
                                }
                            ]}
                            data={suppliers}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage="Cargando proveedores..."
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
                            minWidth={600}
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
                    {editingSupplier ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                                {t('form.description')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                            </Typography>
                            <Box
                                component="input"
                                type="text"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ description: e.target.value })}
                                placeholder="Ingrese la descripción del proveedor"
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
                        disabled={saving || !formData.description.trim()}
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
                message={t('deleteModal.message', { description: deletingSupplier?.description })}
                type="delete"
            />
        </>
    );
}

export default Supplier;
