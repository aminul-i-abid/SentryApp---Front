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

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
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
                                        {isAdmin && <TableCell align="right">{t('table.actions')}</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <CircularProgress size={24} />
                                                    <Typography>Cargando proveedores...</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : suppliers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">
                                                <Typography color="text.secondary">{t('empty.message')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <TableRow key={supplier.id} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{supplier.description}</Typography>
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell align="right">
                                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                                            <Tooltip title={t('actions.edit')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenEditModal(supplier)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('actions.delete')}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenDeleteModal(supplier)}
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
                    {editingSupplier ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField
                            label={t('form.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ description: e.target.value })}
                            fullWidth
                            required
                            disabled={saving}
                            placeholder="Ingrese la descripción del proveedor"
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
                        disabled={saving || !formData.description.trim()}
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
                message={t('deleteModal.message', { description: deletingSupplier?.description })}
                type="delete"
            />
        </>
    );
}

export default Supplier;
