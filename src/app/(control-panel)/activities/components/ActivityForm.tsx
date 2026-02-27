import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
    Alert,
    Typography,
    InputAdornment
} from '@mui/material';
import { ConcurrencyType, ActivityFormData } from '../models/Activity';
import { getCamps } from '../../camps/campsService';
import { useState } from 'react';
import { CampResponse } from '../../camps/models/CampResponse';

// Validation Schema
const activitySchema = z.object({
    name: z.string().min(1, 'Activity name is required').max(100, 'Name too long'),
    description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
    concurrencyType: z.nativeEnum(ConcurrencyType),
    capacity: z.number().min(1, 'Capacity must be at least 1').max(100, 'Capacity too large'),
    slotDuration: z.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    campId: z.number().min(1, 'Camp is required'),
    // Future implementation: Booking policies
    // location: z.string().optional(),
    // imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    // isActive: z.boolean(),
    // requiresApproval: z.boolean(),
    // maxAdvanceBookingDays: z.number().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days'),
    // minAdvanceBookingHours: z.number().min(0, 'Cannot be negative').max(168, 'Maximum 7 days'),
    // allowCancellation: z.boolean(),
    // cancellationDeadlineHours: z.number().min(0, 'Cannot be negative').max(72, 'Maximum 72 hours').optional()
}).refine(
    (data) => {
        const start = data.startTime.split(':').map(Number);
        const end = data.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        return endMinutes > startMinutes;
    },
    {
        message: 'End time must be after start time',
        path: ['endTime']
    }
);

type FormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
    initialData?: ActivityFormData;
    onSubmit: (data: ActivityFormData) => Promise<void>;
    isEdit?: boolean;
}

export default function ActivityForm({ initialData, onSubmit, isEdit = false }: ActivityFormProps) {
    const { t } = useTranslation('activities');
    const [camps, setCamps] = useState<CampResponse[]>([]);
    const [loadingCamps, setLoadingCamps] = useState(true);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(activitySchema),
        defaultValues: initialData || {
            name: '',
            description: '',
            concurrencyType: ConcurrencyType.SharedResource,
            capacity: 10,
            slotDuration: 60,
            startTime: '08:00',
            endTime: '20:00',
            campId: 0
            // Future implementation: Booking policies
            // location: '',
            // imageUrl: '',
            // isActive: true,
            // requiresApproval: false,
            // maxAdvanceBookingDays: 30,
            // minAdvanceBookingHours: 2,
            // allowCancellation: true,
            // cancellationDeadlineHours: 24
        }
    });

    const concurrencyType = watch('concurrencyType');

    // Fetch camps
    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const response = await getCamps();
                if (response.succeeded && response.data) {
                    setCamps(response.data);
                }
            } catch (error) {
                console.error('Error fetching camps:', error);
            } finally {
                setLoadingCamps(false);
            }
        };
        fetchCamps();
    }, []);

    // Auto-set capacity to 1 for ExclusiveTime
    useEffect(() => {
        if (concurrencyType === ConcurrencyType.ExclusiveTime) {
            setValue('capacity', 1);
        }
    }, [concurrencyType, setValue]);

    const handleFormSubmit = async (data: FormData) => {
        try {
            // Cast to ActivityFormData since FormData is validated and complete
            await onSubmit(data as ActivityFormData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
        >
            {/* Basic Information */}
            <Box>
                <Typography variant="h6" className="mb-4">
                    {t('details.basicInfo')}
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('form.name')}
                                    placeholder={t('form.namePlaceholder')}
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    required
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('form.description')}
                                    placeholder={t('form.descriptionPlaceholder')}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                    required
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="campId"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.campId} required>
                                    <InputLabel>{t('form.camp')}</InputLabel>
                                    <Select
                                        {...field}
                                        label={t('form.camp')}
                                        disabled={loadingCamps}
                                    >
                                        {camps.map((camp) => (
                                            <MenuItem key={camp.id} value={camp.id}>
                                                {camp.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.campId && (
                                        <Typography variant="caption" color="error" className="mt-1">
                                            {errors.campId.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    {/* Future Implementation: Location field
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('form.location')}
                                    placeholder={t('form.locationPlaceholder')}
                                    fullWidth
                                    error={!!errors.location}
                                    helperText={errors.location?.message}
                                />
                            )}
                        />
                    </Grid>
                    */}

                    {/* <Grid item xs={12}>
                        <Controller
                            name="imageUrl"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('form.imageUrl')}
                                    fullWidth
                                    error={!!errors.imageUrl}
                                    helperText={errors.imageUrl?.message}
                                />
                            )}
                        />
                    </Grid> */}
                </Grid>
            </Box>

            {/* Resource Configuration */}
            <Box>
                <Typography variant="h6" className="mb-4">
                    {t('details.schedule')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="concurrencyType"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth required>
                                    <InputLabel>{t('form.concurrencyType')}</InputLabel>
                                    <Select
                                        {...field}
                                        label={t('form.concurrencyType')}
                                    >
                                        <MenuItem value={ConcurrencyType.ExclusiveTime}>
                                            {t('types.exclusive')}
                                        </MenuItem>
                                        <MenuItem value={ConcurrencyType.SharedResource}>
                                            {t('types.shared')}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="capacity"
                            control={control}
                            render={({ field: { onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    label={t('form.capacity')}
                                    type="number"
                                    fullWidth
                                    onChange={(e) => onChange(Number(e.target.value))}
                                    error={!!errors.capacity}
                                    helperText={errors.capacity?.message || t('form.capacityHelp')}
                                    disabled={concurrencyType === ConcurrencyType.ExclusiveTime}
                                    required
                                />
                            )}
                        />
                        {concurrencyType === ConcurrencyType.ExclusiveTime && (
                            <Alert severity="info" className="mt-2">
                                Exclusive resources are locked to capacity = 1
                            </Alert>
                        )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Controller
                            name="slotDuration"
                            control={control}
                            render={({ field: { onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    label={t('form.slotDuration')}
                                    type="number"
                                    fullWidth
                                    onChange={(e) => onChange(Number(e.target.value))}
                                    error={!!errors.slotDuration}
                                    helperText={errors.slotDuration?.message}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">min</InputAdornment>
                                    }}
                                    required
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Controller
                            name="startTime"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('form.startTime')}
                                    type="time"
                                    fullWidth
                                    error={!!errors.startTime}
                                    helperText={errors.startTime?.message}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Controller
                            name="endTime"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={t('form.endTime')}
                                    type="time"
                                    fullWidth
                                    error={!!errors.endTime}
                                    helperText={errors.endTime?.message}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* 
            ============================================
            FUTURE IMPLEMENTATION: Reservation Policies
            ============================================
            This section will be implemented in a future phase
            
            <Box>
                <Typography variant="h6" className="mb-4">
                    {t('details.policies')}
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="maxAdvanceBookingDays"
                            control={control}
                            render={({ field: { onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    label={t('form.maxAdvanceBookingDays')}
                                    type="number"
                                    fullWidth
                                    onChange={(e) => onChange(Number(e.target.value))}
                                    error={!!errors.maxAdvanceBookingDays}
                                    helperText={errors.maxAdvanceBookingDays?.message}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">days</InputAdornment>
                                    }}
                                    required
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="minAdvanceBookingHours"
                            control={control}
                            render={({ field: { onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    label={t('form.minAdvanceBookingHours')}
                                    type="number"
                                    fullWidth
                                    onChange={(e) => onChange(Number(e.target.value))}
                                    error={!!errors.minAdvanceBookingHours}
                                    helperText={errors.minAdvanceBookingHours?.message}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">hours</InputAdornment>
                                    }}
                                    required
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="allowCancellation"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={value}
                                            onChange={(e) => onChange(e.target.checked)}
                                        />
                                    }
                                    label={t('form.allowCancellation')}
                                />
                            )}
                        />
                    </Grid>

                    {allowCancellation && (
                        <Grid item xs={12} md={6}>
                            <Controller
                                name="cancellationDeadlineHours"
                                control={control}
                                render={({ field: { onChange, ...field } }) => (
                                    <TextField
                                        {...field}
                                        label={t('form.cancellationDeadlineHours')}
                                        type="number"
                                        fullWidth
                                        onChange={(e) => onChange(Number(e.target.value))}
                                        error={!!errors.cancellationDeadlineHours}
                                        helperText={errors.cancellationDeadlineHours?.message}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">hours</InputAdornment>
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="requiresApproval"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={value}
                                            onChange={(e) => onChange(e.target.checked)}
                                        />
                                    }
                                    label={t('form.requiresApproval')}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="isActive"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={value}
                                            onChange={(e) => onChange(e.target.checked)}
                                        />
                                    }
                                    label={t('form.isActive')}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>
            */}
        </Box>
    );
}
