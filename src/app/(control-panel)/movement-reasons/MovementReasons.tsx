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
    FormControlLabel,
    Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
    getMovementReasons,
    createMovementReason,
    updateMovementReason,
    deleteMovementReason
} from './movementReasonService';
import { MovementReasonResponse, MovementReasonFormData } from './models/MovementReason';
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

function MovementReasons() {
    const { t } = useTranslation('movementReasons');
    const { authState } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [reasons, setReasons] = useState<MovementReasonResponse[]>([]);
    const [filteredReasons, setFilteredReasons] = useState<MovementReasonResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingReason, setEditingReason] = useState<MovementReasonResponse | null>(null);
    const [deletingReason, setDeletingReason] = useState<MovementReasonResponse | null>(null);
    const [formData, setFormData] = useState<MovementReasonFormData>({
        description: '',
        positiveAdjustment: false,
        negativeAdjustment: false,
        scrap: false
    });
    const [saving, setSaving] = useState(false);

    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    const fetchReasons = async () => {
        setLoading(true);
        try {
            const response = await getMovementReasons(1, 1000);
            if (response.succeeded && response.data) {
                const items = Array.isArray(response.data) ? response.data : [];
                setReasons(items);
                applyFilters(items, searchTerm);
            } else {
                setReasons([]);
                setFilteredReasons([]);
                enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching movement reasons:', error);
            setReasons([]);
            setFilteredReasons([]);
            enqueueSnackbar(t('errors.load'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (reasonsList: MovementReasonResponse[], search: string) => {
        let filtered = reasonsList;

        if (search.trim()) {
            const query = search.toLowerCase();
            filtered = filtered.filter(reason =>
                reason.description.toLowerCase().includes(query)
            );
        }

        setFilteredReasons(filtered);
    };

    useEffect(() => {
        fetchReasons();
    }, []);

    useEffect(() => {
        applyFilters(reasons, searchTerm);
    }, [searchTerm, reasons]);

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            applyFilters(reasons, searchTerm);
        }
    };

    const handleSearchClick = () => {
        applyFilters(reasons, searchTerm);
    };

    const handleOpenAddModal = () => {
        setEditingReason(null);
        setFormData({
            description: '',
            positiveAdjustment: false,
            negativeAdjustment: false,
            scrap: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (reason: MovementReasonResponse) => {
        setEditingReason(reason);
        setFormData({
            description: reason.description,
            positiveAdjustment: reason.positiveAdjustment,
            negativeAdjustment: reason.negativeAdjustment,
            scrap: reason.scrap
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReason(null);
        setFormData({
            description: '',
            positiveAdjustment: false,
            negativeAdjustment: false,
            scrap: false
        });
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

            if (editingReason) {
                response = await updateMovementReason(editingReason.id, formData);
            } else {
                response = await createMovementReason(formData);
            }

            if (response.succeeded) {
                enqueueSnackbar(editingReason ? t('messages.updated') : t('messages.created'), { variant: 'success' });
                handleCloseModal();
                fetchReasons();
            } else {
                enqueueSnackbar(response.errors?.[0] || (editingReason ? t('errors.update') : t('errors.create')), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error saving movement reason:', error);
            enqueueSnackbar(editingReason ? t('errors.update') : t('errors.create'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteModal = (reason: MovementReasonResponse) => {
        setDeletingReason(reason);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingReason(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingReason) return;

        try {
            const response = await deleteMovementReason(deletingReason.id);
            if (response.succeeded) {
                enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
                handleCloseDeleteModal();
                fetchReasons();
            } else {
                enqueueSnackbar(response.errors?.[0] || t('errors.delete'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error deleting movement reason:', error);
            enqueueSnackbar(t('errors.delete'), { variant: 'error' });
        }
    };

    const BooleanIcon = ({ value }: { value: boolean }) => (
        value ? (
            <CheckIcon fontSize="small" color="success" />
        ) : (
            <CloseIcon fontSize="small" color="error" />
        )
    );

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

                        <StyledTable<MovementReasonResponse>
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
                                    id: 'positiveAdjustment',
                                    label: t('table.positiveAdjustment'),
                                    align: 'center',
                                    render: (row) => (
                                        <BooleanIcon value={row.positiveAdjustment} />
                                    )
                                },
                                {
                                    id: 'negativeAdjustment',
                                    label: t('table.negativeAdjustment'),
                                    align: 'center',
                                    render: (row) => (
                                        <BooleanIcon value={row.negativeAdjustment} />
                                    )
                                },
                                {
                                    id: 'scrap',
                                    label: t('table.scrap'),
                                    align: 'center',
                                    render: (row) => (
                                        <BooleanIcon value={row.scrap} />
                                    )
                                }
                            ]}
                            data={filteredReasons}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage="Cargando motivos de movimiento..."
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
                                            sx={{ color: '#EF4444' }}
                                            onClick={() => handleOpenDeleteModal(row)}
                                        >
                                            <img src="./assets/icons/delete.png" alt="" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                            minWidth={1000}
                        />
                    </div>
                }
            />

            {/* Modal Agregar/Editar */}
            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: 'white'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>
                    {editingReason ? t('modal.editTitle') : t('modal.addTitle')}
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ingrese la descripción del motivo"
                                sx={{
                                    width: '100%',
                                    height: 48,
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

                        <Box display="flex" flexDirection="column" gap={1}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.positiveAdjustment}
                                        onChange={(e) => setFormData({ ...formData, positiveAdjustment: e.target.checked })}
                                        sx={{
                                            color: '#E2E8F0',
                                            '&.Mui-checked': {
                                                color: '#415EDE',
                                            },
                                        }}
                                        disabled={saving}
                                    />
                                }
                                label={t('form.positiveAdjustment')}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.negativeAdjustment}
                                        onChange={(e) => setFormData({ ...formData, negativeAdjustment: e.target.checked })}
                                        sx={{
                                            color: '#E2E8F0',
                                            '&.Mui-checked': {
                                                color: '#415EDE',
                                            },
                                        }}
                                        disabled={saving}
                                    />
                                }
                                label={t('form.negativeAdjustment')}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.scrap}
                                        onChange={(e) => setFormData({ ...formData, scrap: e.target.checked })}
                                        sx={{
                                            color: '#E2E8F0',
                                            '&.Mui-checked': {
                                                color: '#415EDE',
                                            },
                                        }}
                                        disabled={saving}
                                    />
                                }
                                label={t('form.scrap')}
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

            {/* Modal Eliminar */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title={t('deleteModal.title')}
                message={t('deleteModal.message', { description: deletingReason?.description || '' })}
                type="delete"
            />
        </>
    );
}

export default MovementReasons;
