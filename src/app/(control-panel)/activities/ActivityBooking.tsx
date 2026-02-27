import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Paper,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    Switch,
    FormControlLabel,
    Autocomplete
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { 
    getActivityById, 
    createReservation 
} from './activitiesService';
import { ActivityResponse, ConcurrencyType } from './models/Activity';
import { ActivityAvailabilitySlot } from './models/ActivityReservation';
import ActivityAvailabilityPicker from './components/ActivityAvailabilityPicker';
import { Routes } from 'src/utils/routesEnum';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'src/store/hooks';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import authRoles from '@auth/authRoles';
import { searchByRut } from '../reserve/reserveService';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    }
}));

function ActivityBooking() {
    const { t } = useTranslation('activities');
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { authState } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [activity, setActivity] = useState<ActivityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<{
        date: string;
        slot: ActivityAvailabilitySlot;
        participants: number;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [reservationError, setReservationError] = useState<string>('');
    
    // States for booking for others (admin only)
    const [isForOther, setIsForOther] = useState(false);
    const [rutSearchValue, setRutSearchValue] = useState<string>('');
    const [isSearchingRut, setIsSearchingRut] = useState(false);
    const [rutOptions, setRutOptions] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    
    // Check if user is admin
    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    useEffect(() => {
        if (id) {
            fetchActivity();
        }
    }, [id]);

    const fetchActivity = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await getActivityById(Number(id));
            if (response.succeeded && response.data) {
                setActivity(response.data);
            } else {
                dispatch(showMessage({
                    message: t('errors.loadActivities'),
                    variant: 'error'
                }));
                navigate(Routes.ACTIVITIES);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
            dispatch(showMessage({
                message: t('errors.loadActivities'),
                variant: 'error'
            }));
            navigate(Routes.ACTIVITIES);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotSelect = (date: string, slot: ActivityAvailabilitySlot, participants: number) => {
        setSelectedBooking({ date, slot, participants });
        setConfirmModalOpen(true);
    };
    
    const handleRutSearch = async (rut: string) => {
        if (rut.length < 3) {
            setRutOptions([]);
            return;
        }
        
        try {
            setIsSearchingRut(true);
            const response = await searchByRut(rut);
            if (response.succeeded && response.data) {
                setRutOptions(response.data);
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

    const handleConfirmReservation = async () => {
        if (!selectedBooking || !activity) return;
        
        // Clear previous errors
        setReservationError('');
        
        // Validate if booking for other and user is selected
        if (isForOther && !selectedUser) {
            setReservationError(t('booking.selectUserForOther'));
            return;
        }

        try {
            setSubmitting(true);

            const response = await createReservation({
                activityId: activity.id,
                userId: (authState?.user?.id as string) || undefined,
                reservationDate: selectedBooking.date,
                startTime: selectedBooking.slot.startTime,
                endTime: selectedBooking.slot.endTime,
                participantsCount: selectedBooking.participants,
                notes: notes || undefined,
                reservedForUserId: isForOther && selectedUser ? selectedUser.id : undefined
            });

            if (response.succeeded) {
                dispatch(showMessage({
                    message: activity.requiresApproval 
                        ? 'Reservation created and pending approval'
                        : t('messages.reservationCreated'),
                    variant: 'success'
                }));
                setConfirmModalOpen(false);
                navigate(Routes.ACTIVITIES_RESERVATIONS);
            } else {
                // Handle specific errors - Show in modal instead of toast
                // Handle both string and array messages from backend
                let errorMessage = '';
                if (response.message) {
                    if (Array.isArray(response.message)) {
                        errorMessage = response.message.join(' ');
                    } else if (typeof response.message === 'string') {
                        errorMessage = response.message;
                    }
                }
                
                // Fallback to generic error if no message
                if (!errorMessage) {
                    errorMessage = t('errors.createReservation');
                }
                
                setReservationError(errorMessage);
                
                // If it's a conflict, also refresh availability after showing error
                if (response.errors?.includes('409') || errorMessage.includes('conflict') || errorMessage.includes('no longer available')) {
                    if (id) fetchActivity();
                }
            }
        } catch (error: any) {
            console.error('Error creating reservation:', error);
            
            // Handle 409 Conflict (Double Booking)
            if (error?.response?.status === 409 || error?.status === 409) {
                setReservationError(t('messages.notAvailable') + ' This time slot was just booked by another user. Please select a different time.');
                // Refresh availability
                if (id) fetchActivity();
            } else {
                setReservationError(t('errors.createReservation'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseConfirmModal = () => {
        if (!submitting) {
            setConfirmModalOpen(false);
            setNotes('');
            setSelectedBooking(null);
            setIsForOther(false);
            setSelectedUser(null);
            setRutSearchValue('');
            setRutOptions([]);
            setReservationError('');
        }
    };

    const handleBack = () => {
        navigate(Routes.ACTIVITIES);
    };

    const getConcurrencyIcon = (type: ConcurrencyType) => {
        return type === ConcurrencyType.ExclusiveTime ? (
            <SportsTennisIcon fontSize="large" />
        ) : (
            <FitnessCenterIcon fontSize="large" />
        );
    };

    const getConcurrencyLabel = (type: ConcurrencyType) => {
        return type === ConcurrencyType.ExclusiveTime
            ? t('types.exclusive')
            : t('types.shared');
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                            <IconButton onClick={handleBack}>
                                <ArrowBackIcon />
                            </IconButton>
                            <div>
                                <Typography variant="h5" className="font-bold">
                                    {t('booking.title')}
                                </Typography>
                                {activity && (
                                    <Typography variant="caption" className="text-gray-500">
                                        {activity.name}
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </div>
                }
                content={
                    <div className="p-6">
                        {loading ? (
                            <Box className="flex justify-center items-center h-64">
                                <CircularProgress />
                            </Box>
                        ) : activity ? (
                            <Box className="space-y-6">
                                {/* Activity Details */}
                                <Paper className="p-6">
                                    <Box className="flex items-start gap-4">
                                        <Box className="p-4 bg-primary-50 rounded-lg">
                                            {getConcurrencyIcon(activity.concurrencyType)}
                                        </Box>
                                        <Box className="flex-1">
                                            <Box className="flex items-center gap-2 mb-2">
                                                <Typography variant="h5" className="font-bold">
                                                    {activity.name}
                                                </Typography>
                                                <Chip
                                                    label={getConcurrencyLabel(activity.concurrencyType)}
                                                    size="small"
                                                    color={activity.concurrencyType === ConcurrencyType.ExclusiveTime ? 'primary' : 'secondary'}
                                                />
                                            </Box>

                                            <Typography variant="body1" color="textSecondary" className="mb-4">
                                                {activity.description}
                                            </Typography>

                                            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {activity.location && (
                                                    <Box className="flex items-center gap-2">
                                                        <LocationOnIcon color="action" />
                                                        <Typography variant="body2">{activity.location}</Typography>
                                                    </Box>
                                                )}

                                                <Box className="flex items-center gap-2">
                                                    <AccessTimeIcon color="action" />
                                                    <Typography variant="body2">
                                                        {activity.startTime} - {activity.endTime}
                                                    </Typography>
                                                </Box>

                                                {activity.concurrencyType === ConcurrencyType.SharedResource && (
                                                    <Box className="flex items-center gap-2">
                                                        <InfoIcon color="action" />
                                                        <Typography variant="body2">
                                                            {t('details.capacity')}: {activity.maxCapacityTotal} {t('booking.people')}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {activity.requiresApproval && (
                                                <Alert severity="info" className="mt-4">
                                                    This activity requires admin approval. You will be notified once approved.
                                                </Alert>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>

                                {/* Admin: Book for others */}
                                {isAdmin && (
                                    <Paper className="p-6">
                                        <Box className="space-y-3">
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={isForOther}
                                                        onChange={(e) => {
                                                            setIsForOther(e.target.checked);
                                                            if (!e.target.checked) {
                                                                setSelectedUser(null);
                                                                setRutSearchValue('');
                                                                setRutOptions([]);
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={isForOther ? t('booking.bookForOther') : t('booking.bookForSelf')}
                                            />

                                            {isForOther && (
                                                <>
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
                                                                label={t('booking.searchByRut')}
                                                                placeholder={t('booking.rutPlaceholder')}
                                                                size="small"
                                                                fullWidth
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
                                                        loadingText={t('booking.searching')}
                                                        noOptionsText={t('booking.noResults')}
                                                    />

                                                    {selectedUser && (
                                                        <Alert severity="info">
                                                            <strong>{t('booking.bookingFor')}</strong> {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.dni})
                                                        </Alert>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </Paper>
                                )}

                                {/* Availability Picker */}
                                <Paper className="p-6">
                                    <ActivityAvailabilityPicker
                                        activityId={activity.id}
                                        activityName={activity.name}
                                        concurrencyType={activity.concurrencyType}
                                        onSlotSelect={handleSlotSelect}
                                    />
                                </Paper>
                            </Box>
                        ) : null}
                    </div>
                }
            />

            {/* Confirmation Modal */}
            <Dialog
                open={confirmModalOpen}
                onClose={handleCloseConfirmModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('booking.confirm')}</DialogTitle>
                <DialogContent>
                    <Box className="space-y-4">
                        {/* Error Alert */}
                        {reservationError && (
                            <Alert 
                                severity="error" 
                                onClose={() => setReservationError('')}
                                sx={{ 
                                    '& .MuiAlert-message': { 
                                        fontSize: '0.95rem',
                                        fontWeight: 500
                                    },
                                    backgroundColor: '#ffebee',
                                    border: '1px solid #f44336',
                                    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)'
                                }}
                            >
                                {reservationError}
                            </Alert>
                        )}
                        
                        <Typography variant="body2" color="textSecondary">
                            {t('booking.confirmDetails')}
                        </Typography>

                        {activity && selectedBooking && (
                            <Box className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <Typography variant="subtitle2" className="font-semibold">
                                    {activity.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('booking.dateLabel')}:</strong> {selectedBooking.date}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>{t('booking.timeLabel')}:</strong> {selectedBooking.slot.startTime} - {selectedBooking.slot.endTime}
                                </Typography>
                                {activity.concurrencyType === ConcurrencyType.SharedResource && (
                                    <Typography variant="body2">
                                        <strong>{t('booking.participantsLabel')}:</strong> {selectedBooking.participants}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Show who the booking is for if admin is booking for another user */}
                        {isAdmin && isForOther && selectedUser && (
                            <Alert severity="info">
                                <strong>{t('booking.bookingFor')}</strong> {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.dni})
                            </Alert>
                        )}

                        <TextField
                            label={t('booking.notes')}
                            placeholder={t('booking.notesPlaceholder')}
                            multiline
                            rows={3}
                            fullWidth
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmModal} disabled={submitting}>
                        {t('booking.cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirmReservation}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : t('booking.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ActivityBooking;
