import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { getCamps } from "../../camps/campsService";
import { CampResponse } from "../../camps/models/CampResponse";
import { ActivityFormData, ConcurrencyType } from "../models/Activity";

// Validation Schema
const activitySchema = z
  .object({
    name: z
      .string()
      .min(1, "Activity name is required")
      .max(100, "Name too long"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description too long"),
    concurrencyType: z.nativeEnum(ConcurrencyType),
    capacity: z
      .number()
      .min(1, "Capacity must be at least 1")
      .max(100, "Capacity too large"),
    slotDuration: z
      .number()
      .min(15, "Minimum 15 minutes")
      .max(480, "Maximum 8 hours"),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)",
      ),
    campId: z.number().min(1, "Camp is required"),
    // Future implementation: Booking policies
    // location: z.string().optional(),
    // imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    // isActive: z.boolean(),
    // requiresApproval: z.boolean(),
    // maxAdvanceBookingDays: z.number().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days'),
    // minAdvanceBookingHours: z.number().min(0, 'Cannot be negative').max(168, 'Maximum 7 days'),
    // allowCancellation: z.boolean(),
    // cancellationDeadlineHours: z.number().min(0, 'Cannot be negative').max(72, 'Maximum 72 hours').optional()
  })
  .refine(
    (data) => {
      const start = data.startTime.split(":").map(Number);
      const end = data.endTime.split(":").map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

type FormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  initialData?: ActivityFormData;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  isEdit?: boolean;
}

export default function ActivityForm({
  initialData,
  onSubmit,
  isEdit = false,
}: ActivityFormProps) {
  const { t } = useTranslation("activities");
  const [camps, setCamps] = useState<CampResponse[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      concurrencyType: ConcurrencyType.SharedResource,
      capacity: 10,
      slotDuration: 60,
      startTime: "08:00",
      endTime: "20:00",
      campId: 0,
      // Future implementation: Booking policies
      // location: '',
      // imageUrl: '',
      // isActive: true,
      // requiresApproval: false,
      // maxAdvanceBookingDays: 30,
      // minAdvanceBookingHours: 2,
      // allowCancellation: true,
      // cancellationDeadlineHours: 24
    },
  });

  const concurrencyType = watch("concurrencyType");

  const labelSx = {
    fontWeight: 600,
    fontSize: "13px",
    mb: 0.5,
    color: "#344054",
  };
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#F5F7FA",
      borderRadius: "8px",
      "& fieldset": { border: "1px solid #E5E7EB" },
      "&:hover fieldset": { borderColor: "#d0d5dd" },
      "&.Mui-focused fieldset": {
        borderColor: "#415EDE",
        borderWidth: "1.5px",
      },
    },
  };
  const selectSx = {
    backgroundColor: "#F5F7FA",
    borderRadius: "8px",
    "& fieldset": { border: "1px solid #E5E7EB" },
    "&:hover fieldset": { borderColor: "#d0d5dd" },
    "&.Mui-focused fieldset": { borderColor: "#415EDE", borderWidth: "1.5px" },
  };

  // Fetch camps
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await getCamps();
        if (response.succeeded && response.data) {
          setCamps(response.data);
        }
      } catch (error) {
        console.error("Error fetching camps:", error);
      } finally {
        setLoadingCamps(false);
      }
    };
    fetchCamps();
  }, []);

  // Auto-set capacity to 1 for ExclusiveTime
  useEffect(() => {
    if (concurrencyType === ConcurrencyType.ExclusiveTime) {
      setValue("capacity", 1);
    }
  }, [concurrencyType, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      // Cast to ActivityFormData since FormData is validated and complete
      await onSubmit(data as ActivityFormData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {/* Basic Information */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#415EDE", mb: 2 }}
        >
          {t("details.basicInfo")}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={labelSx}>{t("form.name")} *</Typography>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder={t("form.namePlaceholder")}
                  fullWidth
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={inputSx}
                />
              )}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>{t("form.description")} *</Typography>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder={t("form.descriptionPlaceholder")}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={5}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{
                    ...inputSx,
                    "& .MuiOutlinedInput-root": {
                      ...inputSx["& .MuiOutlinedInput-root"],
                      padding: "10px 14px",
                      alignItems: "flex-start",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: 0,
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                    },
                  }}
                />
              )}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography sx={labelSx}>{t("form.camp")} *</Typography>
              <Controller
                name="campId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.campId}>
                    <Select
                      {...field}
                      displayEmpty
                      disabled={loadingCamps}
                      sx={selectSx}
                    >
                      <MenuItem value={0} disabled>
                        <em>{t("form.camp")}</em>
                      </MenuItem>
                      {camps.map((camp) => (
                        <MenuItem key={camp.id} value={camp.id}>
                          {camp.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.campId && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        {errors.campId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Resource Configuration */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#415EDE", mb: 2 }}
        >
          {t("details.schedule")}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography sx={labelSx}>
                {t("form.concurrencyType")} *
              </Typography>
              <Controller
                name="concurrencyType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select {...field} sx={selectSx}>
                      <MenuItem value={ConcurrencyType.ExclusiveTime}>
                        {t("types.exclusive")}
                      </MenuItem>
                      <MenuItem value={ConcurrencyType.SharedResource}>
                        {t("types.shared")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={labelSx}>{t("form.capacity")} *</Typography>
              <Controller
                name="capacity"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    size="small"
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.capacity}
                    helperText={
                      errors.capacity?.message || t("form.capacityHelp")
                    }
                    disabled={concurrencyType === ConcurrencyType.ExclusiveTime}
                    sx={inputSx}
                  />
                )}
              />
              {concurrencyType === ConcurrencyType.ExclusiveTime && (
                <Alert severity="info" sx={{ mt: 1, borderRadius: "8px" }}>
                  Exclusive resources are locked to capacity = 1
                </Alert>
              )}
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography sx={labelSx}>{t("form.slotDuration")} *</Typography>
              <Controller
                name="slotDuration"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    size="small"
                    onChange={(e) => onChange(Number(e.target.value))}
                    error={!!errors.slotDuration}
                    helperText={errors.slotDuration?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">min</InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={labelSx}>{t("form.startTime")} *</Typography>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    fullWidth
                    size="small"
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={labelSx}>{t("form.endTime")} *</Typography>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    fullWidth
                    size="small"
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
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
