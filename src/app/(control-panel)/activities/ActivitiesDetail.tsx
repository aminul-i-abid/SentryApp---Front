import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import FusePageSimple from "@fuse/core/FusePageSimple";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch } from "src/store/hooks";
import { Routes } from "src/utils/routesEnum";
import {
  createActivity,
  getActivityById,
  updateActivity,
} from "./activitiesService";
import ActivityForm from "./components/ActivityForm";
import { ActivityFormData, ActivityResponse } from "./models/Activity";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
}));

function ActivitiesDetail() {
  const { t } = useTranslation("activities");
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isNew = id === "new";
  const isEdit = !isNew && id;

  useEffect(() => {
    if (isEdit) {
      fetchActivity();
    }
  }, [id]);

  const fetchActivity = async () => {
    if (!id || id === "new") return;

    try {
      setLoading(true);
      const response = await getActivityById(Number(id));
      if (response.succeeded && response.data) {
        setActivity(response.data);
      } else {
        dispatch(
          showMessage({
            message: t("errors.loadActivities"),
            variant: "error",
          }),
        );
        navigate(Routes.ACTIVITIES);
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      dispatch(
        showMessage({
          message: t("errors.loadActivities"),
          variant: "error",
        }),
      );
      navigate(Routes.ACTIVITIES);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ActivityFormData) => {
    try {
      setSaving(true);

      if (isNew) {
        const response = await createActivity(data);
        if (response.succeeded) {
          dispatch(
            showMessage({
              message: t("messages.activityCreated"),
              variant: "success",
            }),
          );
          navigate(Routes.ACTIVITIES);
        } else {
          dispatch(
            showMessage({
              message:
                response.message?.join(", ") || t("errors.createActivity"),
              variant: "error",
            }),
          );
        }
      } else if (id) {
        const response = await updateActivity(Number(id), data);
        if (response.succeeded) {
          dispatch(
            showMessage({
              message: t("messages.activityUpdated"),
              variant: "success",
            }),
          );
          navigate(Routes.ACTIVITIES);
        } else {
          dispatch(
            showMessage({
              message:
                response.message?.join(", ") || t("errors.updateActivity"),
              variant: "error",
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      dispatch(
        showMessage({
          message: isNew
            ? t("errors.createActivity")
            : t("errors.updateActivity"),
          variant: "error",
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(Routes.ACTIVITIES);
  };

  const handleSave = () => {
    // Trigger form submission
    const form = document.querySelector("form");
    if (form) {
      form.requestSubmit();
    }
  };

  return (
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
                {isNew ? t("form.title.create") : t("form.title.edit")}
              </Typography>
              {activity && (
                <Typography variant="caption" className="text-gray-500">
                  {activity.name}
                </Typography>
              )}
            </div>
          </div>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={saving || loading}
          >
            {t("form.save")}
          </Button>
        </div>
      }
      content={
        <div className="p-6">
          {loading ? (
            <Box className="flex justify-center items-center h-64">
              <CircularProgress />
            </Box>
          ) : (
            <Paper
              sx={{
                p: 4,
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <ActivityForm
                initialData={
                  activity
                    ? {
                        name: activity.name,
                        description: activity.description,
                        concurrencyType: activity.concurrencyType,
                        capacity: activity.capacity,
                        slotDuration: activity.slotDuration,
                        startTime: activity.startTime,
                        endTime: activity.endTime,
                        campId: activity.campId,
                        location: activity.location,
                        imageUrl: activity.imageUrl,
                        isActive: activity.isActive,
                        requiresApproval: activity.requiresApproval,
                        maxAdvanceBookingDays: activity.maxAdvanceBookingDays,
                        minAdvanceBookingHours: activity.minAdvanceBookingHours,
                        allowCancellation: activity.allowCancellation,
                        cancellationDeadlineHours:
                          activity.cancellationDeadlineHours,
                      }
                    : undefined
                }
                onSubmit={handleSubmit}
                isEdit={!isNew}
              />
            </Paper>
          )}
        </div>
      }
    />
  );
}

export default ActivitiesDetail;
