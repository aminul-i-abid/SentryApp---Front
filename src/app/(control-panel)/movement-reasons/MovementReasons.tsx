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

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
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
                                        <TableCell align="center">{t('table.positiveAdjustment')}</TableCell>
                                        <TableCell align="center">{t('table.negativeAdjustment')}</TableCell>
                                        <TableCell align="center">{t('table.scrap')}</TableCell>
                                        {isAdmin && <TableCell align="right">{t('table.actions')}</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    <CircularProgress size={24} />
                                                    <Typography>Cargando motivos de movimiento...</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredReasons.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography color="text.secondary">{t('empty.message')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReasons.map((reason) => (
                                            <TableRow key={reason.id} hover>
                                                <TableCell>
                                                    <Typography fontWeight={600}>{reason.description}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <BooleanIcon value={reason.positiveAdjustment} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <BooleanIcon value={reason.negativeAdjustment} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <BooleanIcon value={reason.scrap} />
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell align="right">
                                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                                            <Tooltip title={t('actions.edit')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenEditModal(reason)}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={t('actions.delete')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color='error'
                                                                    onClick={() => handleOpenDeleteModal(reason)}
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
                        </TableContainer>
                    </div>
                }
            />

            {/* Modal Agregar/Editar */}
            <Dialog 
                open={isModalOpen} 
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingReason ? t('modal.editTitle') : t('modal.addTitle')}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            fullWidth
                            label={t('form.description')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={saving}
                            autoFocus
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.positiveAdjustment}
                                    onChange={(e) => setFormData({ ...formData, positiveAdjustment: e.target.checked })}
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
                                    disabled={saving}
                                />
                            }
                            label={t('form.scrap')}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} disabled={saving}>
                        {t('modal.cancel')}
                    </Button>
                    <Button onClick={handleSave} variant="contained" color='primary' disabled={saving}>
                        {saving ? <CircularProgress size={24} /> : t('modal.save')}
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
