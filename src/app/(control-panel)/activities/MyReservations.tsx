import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import RowActionMenu from "@/components/ui/RowActionMenu";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import FusePageSimple from "@fuse/core/FusePageSimple";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { styled, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "src/store/hooks";
import { cancelReservation, getMyReservations } from "./activitiesService";
import { ActivityReservationStatus } from "./models/Activity";
import { ActivityReservationResponse } from "./models/ActivityReservation";

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-content > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-header > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
  },
}));

function MyReservations() {
  const { t } = useTranslation("activities");
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [reservations, setReservations] = useState<
    ActivityReservationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ActivityReservationResponse | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0); // MUI TablePagination usa 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Date filter state (optional) - format: YYYY-MM-DD
  const [fromDateFilter, setFromDateFilter] = useState<string>("");

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
        page + 1, // API usa 1-based, MUI usa 0-based
      );
      if (response.succeeded && response.data) {
        setReservations(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      dispatch(
        showMessage({
          message: t("errors.loadReservations"),
          variant: "error",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenCancelModal = (reservation: ActivityReservationResponse) => {
    setSelectedReservation(reservation);
    setCancellationReason("");
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (!cancelling) {
      setCancelModalOpen(false);
      setSelectedReservation(null);
      setCancellationReason("");
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    try {
      setCancelling(true);
      const response = await cancelReservation(
        selectedReservation.id,
        cancellationReason || undefined,
      );

      if (response.succeeded) {
        dispatch(
          showMessage({
            message: t("messages.reservationCancelled"),
            variant: "success",
          }),
        );
        setCancelModalOpen(false);
        setSelectedReservation(null);
        setCancellationReason("");
        fetchReservations(); // Refresh list
      } else {
        dispatch(
          showMessage({
            message:
              response.message?.join(", ") || t("errors.cancelReservation"),
            variant: "error",
          }),
        );
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      dispatch(
        showMessage({
          message: t("errors.cancelReservation"),
          variant: "error",
        }),
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: ActivityReservationStatus) => {
    switch (status) {
      case ActivityReservationStatus.Pending:
        return "warning";
      case ActivityReservationStatus.InProgress:
        return "info";
      case ActivityReservationStatus.Completed:
        return "success";
      case ActivityReservationStatus.Cancelled:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: ActivityReservationStatus) => {
    switch (status) {
      case ActivityReservationStatus.Pending:
        return t("reservations.status.pending");
      case ActivityReservationStatus.InProgress:
        return t("reservations.status.inProgress");
      case ActivityReservationStatus.Completed:
        return t("reservations.status.completed");
      case ActivityReservationStatus.Cancelled:
        return t("reservations.status.cancelled");
      default:
        return "Unknown";
    }
  };

  const canCancelReservation = (reservation: ActivityReservationResponse) => {
    // Can only cancel pending or in-progress reservations
    return (
      reservation.status === ActivityReservationStatus.Pending ||
      reservation.status === ActivityReservationStatus.InProgress
    );
  };

  const columns: TableColumnDef<ActivityReservationResponse>[] = [
    {
      id: "activityName",
      label: t("reservations.table.activity"),
      render: (row) => (
        <div>
          <Typography variant="body2" className="font-semibold">
            {row.activityName}
          </Typography>
          {row.campName && (
            <Typography variant="caption" color="textSecondary">
              {row.campName}
            </Typography>
          )}
        </div>
      ),
    },
    {
      id: "reservationDate",
      label: t("reservations.table.date"),
      render: (row) => (
        <Typography variant="body2">
          {formatDate(row.reservationDate)}
        </Typography>
      ),
    },
    {
      id: "time",
      label: t("reservations.table.time"),
      render: (row) => (
        <Typography variant="body2">
          {row.startTime} - {row.endTime}
        </Typography>
      ),
    },
    {
      id: "participantsCount",
      label: t("reservations.table.people"),
      render: (row) => (
        <Typography variant="body2">{row.participantsCount}</Typography>
      ),
    },
    {
      id: "status",
      label: t("reservations.table.status"),
      render: (row) => (
        <Chip
          label={getStatusLabel(row.status)}
          size="small"
          color={getStatusColor(row.status)}
        />
      ),
    },
  ];

  return (
    <>
      <Root
        header={
          <div className="p-6 flex items-center justify-between">
            {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
            <div>
              <Typography variant="h5" className="font-bold">
                {t("reservations.myReservations")}
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
                label={t("reservations.filters.fromDate")}
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
              {fromDateFilter && (
                <Button
                  size="small"
                  onClick={() => {
                    setFromDateFilter("");
                    setPage(0);
                  }}
                  variant="outlined"
                >
                  {t("reservations.filters.clearFilter")}
                </Button>
              )}
              {fromDateFilter && (
                <Typography variant="caption" color="textSecondary">
                  {t("reservations.filters.showing")} {totalCount}{" "}
                  {t("reservations.filters.results")}
                </Typography>
              )}
            </Box>

            <StyledTable<ActivityReservationResponse>
              columns={columns}
              data={reservations}
              getRowId={(row) => row.id.toString()}
              loading={loading}
              loadingMessage="Cargando reservas..."
              emptyMessage="No se encontraron reservas"
              renderActions={(row) => (
                <RowActionMenu
                  menuItems={[
                    {
                      key: "cancel",
                      label: t("reservations.table.cancelAction") || "Cancelar",
                      icon: <CancelIcon fontSize="small" />,
                      color: "error.main",
                      onClick: () => handleOpenCancelModal(row),
                      hidden: !canCancelReservation(row),
                    },
                  ]}
                />
              )}
              actionsLabel={t("reservations.table.actions")}
              pagination={{
                count: totalCount,
                page,
                rowsPerPage,
                onPageChange: handleChangePage,
              }}
            />
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
        <DialogTitle>{t("cancelReservationModal.title")}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4">
            <Typography variant="body2">
              {t("cancelReservationModal.message")}
            </Typography>

            {selectedReservation && (
              <Box className="p-4 bg-gray-50 rounded-lg space-y-2">
                <Typography variant="subtitle2" className="font-semibold">
                  {selectedReservation.activityName}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedReservation.reservationDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {selectedReservation.startTime} -{" "}
                  {selectedReservation.endTime}
                </Typography>
              </Box>
            )}

            <TextField
              label={t("cancelReservationModal.reason")}
              placeholder={t("cancelReservationModal.reasonPlaceholder")}
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
            {t("cancelReservationModal.cancel")}
          </Button>
          <Button
            onClick={handleCancelReservation}
            variant="contained"
            color="error"
            disabled={cancelling}
          >
            {cancelling ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("cancelReservationModal.confirm")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyReservations;
