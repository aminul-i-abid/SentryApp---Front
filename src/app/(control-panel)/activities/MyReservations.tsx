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
    TablePagination
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { 
    getMyReservations,
    cancelReservation 
} from './activitiesService';
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

function MyReservations() {
    const { t } = useTranslation('activities');
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [reservations, setReservations] = useState<ActivityReservationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<ActivityReservationResponse | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(0); // MUI TablePagination usa 0-based
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    
    // Date filter state (optional) - format: YYYY-MM-DD
    const [fromDateFilter, setFromDateFilter] = useState<string>('');

    useEffect(() => {
        fetchReservations();
    }, [page, rowsPerPage, fromDateFilter]);

    const fetchReservations = async () => {
        try {
            setLoading(true);
            // Use fromDateFilter directly if not empty, otherwise undefined
            const fromDateParam = fromDateFilter ? fromDateFilter : undefined;
            const response = await getMyReservations(
                fromDateParam,
                rowsPerPage,
                page + 1 // API usa 1-based, MUI usa 0-based
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

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenCancelModal = (reservation: ActivityReservationResponse) => {
        setSelectedReservation(reservation);
        setCancellationReason('');
        setCancelModalOpen(true);
    };

    const handleCloseCancelModal = () => {
        if (!cancelling) {
            setCancelModalOpen(false);
            setSelectedReservation(null);
            setCancellationReason('');
        }
    };

    const handleCancelReservation = async () => {
        if (!selectedReservation) return;
                
        try {
            setCancelling(true);
            const response = await cancelReservation(
                selectedReservation.id,
                cancellationReason || undefined
            );

            if (response.succeeded) {
                dispatch(showMessage({
                    message: t('messages.reservationCancelled'),
                    variant: 'success'
                }));
                setCancelModalOpen(false);
                setSelectedReservation(null);
                setCancellationReason('');
                fetchReservations(); // Refresh list
            } else {
                dispatch(showMessage({
                    message: response.message?.join(', ') || t('errors.cancelReservation'),
                    variant: 'error'
                }));
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            dispatch(showMessage({
                message: t('errors.cancelReservation'),
                variant: 'error'
            }));
        } finally {
            setCancelling(false);
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

    const canCancelReservation = (reservation: ActivityReservationResponse) => {
        // Can only cancel pending or in-progress reservations
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
                                {t('reservations.myReservations')}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                                View and manage your activity reservations
                            </Typography>
                        </div>
                    </div>
                }
                content={
                    <div className="p-6">
                        {/* Date Filter */}
                        <Box className="mb-6 flex items-center gap-4">
                            <TextField
                                label={t('reservations.filters.fromDate')}
                                type="date"
                                value={fromDateFilter}
                                onChange={(e) => {
                                    setFromDateFilter(e.target.value);
                                    setPage(0); // Reset to first page when filter changes
                                }}
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{ width: 250 }}
                            />
                            {fromDateFilter && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setFromDateFilter('');
                                        setPage(0);
                                    }}
                                    variant="outlined"
                                >
                                    {t('reservations.filters.clearFilter')}
                                </Button>
                            )}
                            {fromDateFilter && (
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
                                    No reservations found
                                </Typography>
                                <Typography variant="body2" color="textSecondary" className="mt-2">
                                    Book an activity to see your reservations here
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('reservations.table.activity')}</TableCell>
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
                                                        {canCancelReservation(reservation) && (
                                                            <Tooltip title="Cancel Reservation">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleOpenCancelModal(reservation)}
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

            {/* Cancel Confirmation Modal */}
            <Dialog
                open={cancelModalOpen}
                onClose={handleCloseCancelModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('cancelReservationModal.title')}</DialogTitle>
                <DialogContent>
                    <Box className="space-y-4">
                        <Typography variant="body2">
                            {t('cancelReservationModal.message')}
                        </Typography>

                        {selectedReservation && (
                            <Box className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <Typography variant="subtitle2" className="font-semibold">
                                    {selectedReservation.activityName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Date:</strong> {formatDate(selectedReservation.reservationDate)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Time:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            label={t('cancelReservationModal.reason')}
                            placeholder={t('cancelReservationModal.reasonPlaceholder')}
                            multiline
                            rows={3}
                            fullWidth
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCancelModal} disabled={cancelling}>
                        {t('cancelReservationModal.cancel')}
                    </Button>
                    <Button
                        onClick={handleCancelReservation}
                        variant="contained"
                        color="error"
                        disabled={cancelling}
                    >
                        {cancelling ? <CircularProgress size={20} color="inherit" /> : t('cancelReservationModal.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default MyReservations;
