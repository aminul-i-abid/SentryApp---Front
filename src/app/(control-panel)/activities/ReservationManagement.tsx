import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Box,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    TablePagination,
    Autocomplete,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { 
    getAllReservations,
    cancelReservation,
    updateReservationStatus
} from './activitiesService';
import { searchByRut } from '../reserve/reserveService';
import { ActivityReservationResponse } from './models/ActivityReservation';
import { ActivityReservationStatus } from './models/Activity';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'src/store/hooks';

// Helper function to format dates
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    }
}));

function ReservationManagement() {
    const { t } = useTranslation('activities');
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [reservations, setReservations] = useState<ActivityReservationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<ActivityReservationResponse | null>(null);
    const [actionType, setActionType] = useState<'confirm' | 'cancel'>('cancel');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    
    // Date filter state
    const [fromDateFilter, setFromDateFilter] = useState<string>('');
    
    // RUT filter state
    const [rutSearchValue, setRutSearchValue] = useState<string>('');
    const [isSearchingRut, setIsSearchingRut] = useState(false);
    const [rutOptions, setRutOptions] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    
    // Status filter state (default: 0 = Pending)
    const [statusFilter, setStatusFilter] = useState<number | undefined>(0);

    useEffect(() => {
        fetchReservations();
    }, [page, rowsPerPage, fromDateFilter, selectedUser, statusFilter]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const fromDateParam = fromDateFilter ? fromDateFilter : undefined;
            const beneficiaryUserId = selectedUser?.id || undefined;
            const statusParam = statusFilter !== undefined ? statusFilter : undefined;
            const response = await getAllReservations(
                fromDateParam,
                rowsPerPage,
                page + 1,
                beneficiaryUserId,
                statusParam
            );
            if (response.succeeded && response.data) {
                setReservations(response.data.items);
                setTotalCount(response.data.totalCount);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            dispatch(showMessage({
                message: t('errors.loadReservations'),
                variant: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleRutSearch = async (input: string) => {
        if (!input || input.length < 3) {
            setRutOptions([]);
            return;
        }
        setIsSearchingRut(true);
        try {
            const response = await searchByRut(input);
            if (response.succeeded && response.data) {
                setRutOptions(Array.isArray(response.data) ? response.data : [response.data]);
            } else {
                setRutOptions([]);
            }
        } catch (error) {
            console.error('Error searching by RUT:', error);
            setRutOptions([]);
        } finally {
            setIsSearchingRut(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenActionModal = (reservation: ActivityReservationResponse, action: 'confirm' | 'cancel') => {
        setSelectedReservation(reservation);
        setActionType(action);
        setReason('');
        setActionModalOpen(true);
    };

    const handleCloseActionModal = () => {
        if (!processing) {
            setActionModalOpen(false);
            setSelectedReservation(null);
            setReason('');
        }
    };

    const handleConfirmAction = async () => {
        if (!selectedReservation) return;
                
        try {
            setProcessing(true);
            
            if (actionType === 'cancel') {
                const response = await cancelReservation(
                    selectedReservation.id,
                    reason || undefined
                );

                if (response.succeeded) {
                    dispatch(showMessage({
                        message: t('messages.reservationCancelled'),
                        variant: 'success'
                    }));
                } else {
                    dispatch(showMessage({
                        message: response.message?.join(', ') || t('errors.cancelReservation'),
                        variant: 'error'
                    }));
                }
            } else {
                // Confirm action
                const response = await updateReservationStatus(
                    selectedReservation.id,
                    {
                        status: ActivityReservationStatus.InProgress
                    }
                );

                if (response.succeeded) {
                    dispatch(showMessage({
                        message: t('messages.reservationConfirmed'),
                        variant: 'success'
                    }));
                } else {
                    dispatch(showMessage({
                        message: response.message?.join(', ') || t('errors.confirmReservation'),
                        variant: 'error'
                    }));
                }
            }
            
            setActionModalOpen(false);
            setSelectedReservation(null);
            setReason('');
            fetchReservations();
        } catch (error) {
            console.error(`Error ${actionType}ing reservation:`, error);
            dispatch(showMessage({
                message: t(`errors.${actionType}Reservation`),
                variant: 'error'
            }));
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: ActivityReservationStatus) => {
        switch (status) {
            case ActivityReservationStatus.Pending:
                return 'warning';
            case ActivityReservationStatus.InProgress:
                return 'info';
            case ActivityReservationStatus.Completed:
                return 'success';
            case ActivityReservationStatus.Cancelled:
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: ActivityReservationStatus) => {
        switch (status) {
            case ActivityReservationStatus.Pending:
                return t('reservations.status.pending');
            case ActivityReservationStatus.InProgress:
                return t('reservations.status.inProgress');
            case ActivityReservationStatus.Completed:
                return t('reservations.status.completed');
            case ActivityReservationStatus.Cancelled:
                return t('reservations.status.cancelled');
            default:
                return 'Unknown';
        }
    };

    const canConfirmReservation = (reservation: ActivityReservationResponse) => {
        return reservation.status === ActivityReservationStatus.Pending;
    };

    const canCancelReservation = (reservation: ActivityReservationResponse) => {
        return (
            reservation.status === ActivityReservationStatus.Pending ||
            reservation.status === ActivityReservationStatus.InProgress
        );
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <div>
                            <Typography variant="h5" className="font-bold">
                                {t('management.title')}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                {t('management.subtitle')}
                            </Typography>
                        </div>
                    </div>
                }
                content={
                    <div className="p-6">
                        {/* Filters */}
                        <Box className="mb-6 flex items-center gap-4 flex-wrap">
                            <FormControl size="small" sx={{ width: 200 }}>
                                <InputLabel id="status-filter-label">{t('management.filters.status')}</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    value={statusFilter ?? ''}
                                    label={t('management.filters.status')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setStatusFilter(value === '' ? undefined : value as number);
                                        setPage(0);
                                    }}
                                >
                                    <MenuItem value="">{t('management.filters.statusOptions.all')}</MenuItem>
                                    <MenuItem value={0}>{t('management.filters.statusOptions.pending')}</MenuItem>
                                    <MenuItem value={1}>{t('management.filters.statusOptions.inProgress')}</MenuItem>
                                    <MenuItem value={2}>{t('management.filters.statusOptions.completed')}</MenuItem>
                                    <MenuItem value={3}>{t('management.filters.statusOptions.cancelled')}</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <TextField
                                label={t('reservations.filters.fromDate')}
                                type="date"
                                value={fromDateFilter}
                                onChange={(e) => {
                                    setFromDateFilter(e.target.value);
                                    setPage(0);
                                }}
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{ width: 250 }}
                            />
                            
                            <Autocomplete
                                freeSolo
                                options={rutOptions}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    return `${option.dni || ''} - ${option.firstName || ''} ${option.lastName || ''}`.trim();
                                }}
                                value={selectedUser}
                                onChange={(_, newValue) => {
                                    if (typeof newValue === 'object' && newValue) {
                                        setSelectedUser(newValue);
                                        setPage(0);
                                    } else {
                                        setSelectedUser(null);
                                    }
                                }}
                                onInputChange={(_, value) => {
                                    setRutSearchValue(value);
                                    handleRutSearch(value);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={t('management.filters.searchByRut')}
                                        placeholder={t('management.filters.rutPlaceholder')}
                                        size="small"
                                        sx={{ width: 300 }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isSearchingRut ? <CircularProgress size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                loading={isSearchingRut}
                                loadingText={t('management.filters.searching')}
                                noOptionsText={t('management.filters.noResults')}
                                sx={{ width: 300 }}
                            />
                            
                            {(fromDateFilter || selectedUser) && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setFromDateFilter('');
                                        setSelectedUser(null);
                                        setRutSearchValue('');
                                        setRutOptions([]);
                                        setStatusFilter(undefined);
                                        setPage(0);
                                    }}
                                    variant="outlined"
                                >
                                    {t('reservations.filters.clearFilter')}
                                </Button>
                            )}
                            {(fromDateFilter || selectedUser) && (
                                <Typography variant="caption" color="textSecondary">
                                    {t('reservations.filters.showing')} {totalCount} {t('reservations.filters.results')}
                                </Typography>
                            )}
                        </Box>

                        {loading ? (
                            <Box className="flex justify-center items-center h-64">
                                <CircularProgress />
                            </Box>
                        ) : reservations.length === 0 ? (
                            <Box className="flex flex-col items-center justify-center h-64">
                                <Typography variant="h6" color="textSecondary">
                                    {t('management.noReservations')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" className="mt-2">
                                    {t('management.noReservationsSubtitle')}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('reservations.table.activity')}</TableCell>
                                                <TableCell>{t('management.table.beneficiary')}</TableCell>
                                                <TableCell>{t('reservations.table.date')}</TableCell>
                                                <TableCell>{t('reservations.table.time')}</TableCell>
                                                <TableCell>{t('reservations.table.people')}</TableCell>
                                                <TableCell>{t('reservations.table.status')}</TableCell>
                                                <TableCell align="right">{t('reservations.table.actions')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reservations.map((reservation) => (
                                                <TableRow key={reservation.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" className="font-semibold">
                                                            {reservation.activityName}
                                                        </Typography>
                                                        {reservation.campName && (
                                                            <Typography variant="caption" color="textSecondary">
                                                                {reservation.campName}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" className="font-medium">
                                                            {reservation.beneficiaryFullName || reservation.beneficiaryEmail}
                                                        </Typography>
                                                        {reservation.beneficiaryRut && (
                                                            <Typography variant="caption" color="textSecondary">
                                                                {reservation.beneficiaryRut}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(reservation.reservationDate)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {reservation.startTime} - {reservation.endTime}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {reservation.participantsCount}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getStatusLabel(reservation.status)}
                                                            size="small"
                                                            color={getStatusColor(reservation.status)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {reservation.notes && (
                                                            <Tooltip title={reservation.notes}>
                                                                <IconButton size="small">
                                                                    <InfoIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {canConfirmReservation(reservation) && (
                                                            <Tooltip title={t('management.actions.confirm')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => handleOpenActionModal(reservation, 'confirm')}
                                                                >
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {canCancelReservation(reservation) && (
                                                            <Tooltip title={t('management.actions.cancel')}>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleOpenActionModal(reservation, 'cancel')}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    component="div"
                                    count={totalCount}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[10, 25]}
                                    labelRowsPerPage={t('reservations.pagination.rowsPerPage')}
                                    labelDisplayedRows={({ from, to, count }) => 
                                        `${from}-${to} ${t('reservations.pagination.of')} ${count}`
                                    }
                                />
                            </>
                        )}
                    </div>
                }
            />

            {/* Action Confirmation Modal */}
            <Dialog
                open={actionModalOpen}
                onClose={handleCloseActionModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {actionType === 'confirm' 
                        ? t('management.confirmModal.title')
                        : t('management.cancelModal.title')
                    }
                </DialogTitle>
                <DialogContent>
                    <Box className="space-y-4">
                        <Typography variant="body2">
                            {actionType === 'confirm'
                                ? t('management.confirmModal.message')
                                : t('management.cancelModal.message')
                            }
                        </Typography>

                        {selectedReservation && (
                            <Box className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <Typography variant="subtitle2" className="font-semibold">
                                    {selectedReservation.activityName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('management.modal.beneficiary')}:</strong> {selectedReservation.beneficiaryFullName || selectedReservation.beneficiaryEmail}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('management.modal.date')}:</strong> {formatDate(selectedReservation.reservationDate)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('management.modal.time')}:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}
                                </Typography>
                            </Box>
                        )}

                        {actionType === 'cancel' && (
                            <TextField
                                label={t('management.cancelModal.reason')}
                                placeholder={t('management.cancelModal.reasonPlaceholder')}
                                multiline
                                rows={3}
                                fullWidth
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActionModal} disabled={processing}>
                        {t('management.modal.cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={actionType === 'confirm' ? 'success' : 'error'}
                        disabled={processing}
                    >
                        {processing ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            actionType === 'confirm' 
                                ? t('management.modal.confirmAction')
                                : t('management.modal.cancelAction')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ReservationManagement;
