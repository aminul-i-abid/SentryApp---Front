import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    TextField,
    InputAdornment,
    Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import { getActivityAvailability } from '../activitiesService';
import { ActivityAvailabilitySlot } from '../models/ActivityReservation';
import { ConcurrencyType } from '../models/Activity';

interface ActivityAvailabilityPickerProps {
    activityId: number;
    activityName: string;
    concurrencyType: ConcurrencyType;
    maxAdvanceBookingDays?: number; // Optional - future implementation
    minAdvanceBookingHours?: number; // Optional - future implementation
    onSlotSelect: (date: string, slot: ActivityAvailabilitySlot, participants: number) => void;
}

export default function ActivityAvailabilityPicker({
    activityId,
    activityName,
    concurrencyType,
    maxAdvanceBookingDays = 5, // Default: 5 days advance booking
    minAdvanceBookingHours = 1, // Default: 1 hour minimum
    onSlotSelect
}: ActivityAvailabilityPickerProps) {
    const { t } = useTranslation('activities');
    
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [slots, setSlots] = useState<ActivityAvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<ActivityAvailabilitySlot | null>(null);
    const [participants, setParticipants] = useState(1);

    // Calculate min and max dates in YYYY-MM-DD format
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDateObj = new Date(today);
    maxDateObj.setDate(maxDateObj.getDate() + maxAdvanceBookingDays);
    const maxDate = maxDateObj.toISOString().split('T')[0];

    const isSharedResource = concurrencyType === ConcurrencyType.SharedResource;

    // Set initial date to today
    useEffect(() => {
        setSelectedDate(minDate);
    }, []);

    const handleDateChange = (newDate: string) => {
        // Validate that the date is within allowed range
        if (!newDate) {
            setSelectedDate('');
            return;
        }

        // Check if date is within min and max range
        if (newDate < minDate || newDate > maxDate) {
            // Date is out of range, ignore change
            setError(t('booking.dateOutOfRange', { 
                max: maxAdvanceBookingDays 
            }));
            return;
        }

        // Clear any previous error
        setError(null);
        setSelectedDate(newDate);
    };

    useEffect(() => {
        if (selectedDate) {
            fetchAvailability(selectedDate);
        }
    }, [selectedDate, activityId]);

    const fetchAvailability = async (dateStr: string) => {
        try {
            setLoading(true);
            setError(null);
            setSelectedSlot(null);
            
            const response = await getActivityAvailability(activityId, dateStr);
            
            if (response.succeeded && response.data) {
                const fetchedSlots = response.data.slots || [];
                
                // Filter out past slots if selected date is today
                const isToday = dateStr === minDate;
                if (isToday) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    
                    const filteredSlots = fetchedSlots.map(slot => {
                        // Parse slot start time (format: HH:mm:ss or HH:mm)
                        const [hourStr, minuteStr] = slot.startTime.split(':');
                        const slotHour = parseInt(hourStr);
                        const slotMinute = parseInt(minuteStr);
                        
                        // Check if slot has already passed
                        const hasPassed = slotHour < currentHour || 
                                         (slotHour === currentHour && slotMinute <= currentMinute);
                        
                        // Mark slot as unavailable if it has passed
                        if (hasPassed) {
                            return { ...slot, isAvailable: false };
                        }
                        
                        return slot;
                    });
                    
                    setSlots(filteredSlots);
                } else {
                    setSlots(fetchedSlots);
                }
            } else {
                setError(response.message?.join(', ') || t('errors.loadAvailability'));
                setSlots([]);
            }
        } catch (err) {
            console.error('Error fetching availability:', err);
            setError(t('errors.loadAvailability'));
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot: ActivityAvailabilitySlot) => {
        if (!slot.isAvailable) return;
        
        setSelectedSlot(slot);
        setParticipants(1);
    };

    const handleConfirmSelection = () => {
        if (selectedSlot && selectedDate) {
            onSlotSelect(selectedDate, selectedSlot, participants);
        }
    };

    const handleParticipantsChange = (value: number) => {
        if (selectedSlot) {
            const maxParticipants = (selectedSlot.maxAllowed || 0) - (selectedSlot.currentReservations || 0);
            setParticipants(Math.max(1, Math.min(value, maxParticipants)));
        }
    };

    // Format date for display (from YYYY-MM-DD to "Month DD, YYYY")
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const getSlotStatusColor = (slot: ActivityAvailabilitySlot) => {
        if (!slot.isAvailable) return 'error';
        if (slot.availableCapacity <= 2) return 'warning';
        return 'success';
    };

    const getSlotStatusText = (slot: ActivityAvailabilitySlot) => {
        if (!slot.isAvailable) {
            return isSharedResource ? t('booking.full') : t('booking.unavailable');
        }
        if (isSharedResource && slot.availableCapacity > 0) {
            return t('booking.spotsLeft', { count: slot.availableCapacity });
        }
        return t('booking.available');
    };

    return (
        <Box className="space-y-4">
            {/* Date Picker */}
            <Box>
                <Typography variant="subtitle1" className="mb-2 font-semibold">
                    {t('booking.selectDate')}
                </Typography>
                <TextField
                    label={t('booking.selectDate')}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onClick={(e) => {
                        // Force open calendar picker when clicking anywhere on the input
                        const input = e.currentTarget.querySelector('input[type="date"]');
                        if (input) {
                            (input as HTMLInputElement).showPicker?.();
                        }
                    }}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    inputProps={{
                        min: minDate,
                        max: maxDate
                    }}
                />
                <Typography variant="caption" color="textSecondary" className="mt-1 block">
                    {t('booking.advanceBookingMessage', { days: maxAdvanceBookingDays })}
                </Typography>
            </Box>

            {/* Time Slots */}
            <Box>
                <Typography variant="subtitle1" className="mb-2 font-semibold">
                    {t('booking.selectTime')}
                </Typography>

                {loading ? (
                    <Box className="flex justify-center items-center py-12">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : slots.length === 0 ? (
                    <Alert severity="info">No time slots available for this date</Alert>
                ) : (
                    <Grid container spacing={2}>
                        {slots.map((slot, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                                <Card
                                    className={`cursor-pointer transition-all ${
                                        selectedSlot === slot
                                            ? 'ring-2 ring-primary'
                                            : slot.isAvailable
                                            ? 'hover:shadow-md'
                                            : 'opacity-50'
                                    }`}
                                    onClick={() => handleSlotClick(slot)}
                                    sx={{
                                        backgroundColor: selectedSlot === slot ? 'action.selected' : undefined
                                    }}
                                >
                                    <CardContent className="p-3">
                                        <Box className="flex items-center justify-between mb-2">
                                            <Typography variant="body2" className="font-semibold">
                                                {slot.startTime}
                                            </Typography>
                                            {slot.isAvailable ? (
                                                <CheckCircleIcon
                                                    fontSize="small"
                                                    color={getSlotStatusColor(slot)}
                                                />
                                            ) : (
                                                <CancelIcon fontSize="small" color="error" />
                                            )}
                                        </Box>

                                        <Typography variant="caption" color="textSecondary" className="block mb-1">
                                            {slot.endTime}
                                        </Typography>

                                        <Chip
                                            label={getSlotStatusText(slot)}
                                            size="small"
                                            color={getSlotStatusColor(slot)}
                                            variant="outlined"
                                            className="w-full"
                                            sx={{ fontSize: '0.65rem', height: '20px' }}
                                        />

                                        {isSharedResource && slot.isAvailable && (
                                            <Box className="flex items-center gap-1 mt-2">
                                                <PeopleIcon sx={{ fontSize: 14 }} color="action" />
                                                <Typography variant="caption" color="textSecondary">
                                                    {slot.currentReservations}/{slot.maxAllowed || 0}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Participants Selector (for Shared Resources) */}
            {selectedSlot && isSharedResource && selectedSlot.isAvailable && (
                <Box>
                    <Typography variant="subtitle1" className="mb-2 font-semibold">
                        {t('booking.numberOfPeople')}
                    </Typography>
                    <TextField
                        type="number"
                        value={participants}
                        onChange={(e) => handleParticipantsChange(Number(e.target.value))}
                        size="small"
                        fullWidth
                        inputProps={{
                            min: 1,
                            max: (selectedSlot.maxAllowed || 0) - (selectedSlot.currentReservations || 0)
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon />
                                </InputAdornment>
                            )
                        }}
                        helperText={t('booking.maxParticipantsAvailable', { 
                            count: (selectedSlot.maxAllowed || 0) - (selectedSlot.currentReservations || 0) 
                        })}
                    />
                </Box>
            )}

            {/* Selection Summary */}
            {selectedSlot && (
                <Box className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Typography variant="subtitle2" className="mb-2">
                        {t('booking.selectedTimeSlot')}
                    </Typography>
                    <Box>
                        <Typography variant="body2" className="font-semibold">
                            {formatDisplayDate(selectedDate)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {selectedSlot.startTime} - {selectedSlot.endTime}
                        </Typography>
                        {isSharedResource && (
                            <Typography variant="caption" color="textSecondary">
                                {participants} {t(participants === 1 ? 'booking.person' : 'booking.people')}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleConfirmSelection}
                        size="large"
                    >
                        {t('booking.confirm')}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
