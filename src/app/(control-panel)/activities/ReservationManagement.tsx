import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import RowActionMenu from "@/components/ui/RowActionMenu";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import FusePageSimple from "@fuse/core/FusePageSimple";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "src/store/hooks";
import { searchByRut } from "../reserve/reserveService";
import {
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
} from "./activitiesService";
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

function ReservationManagement() {
  const { t } = useTranslation("activities");
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [reservations, setReservations] = useState<
    ActivityReservationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ActivityReservationResponse | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "cancel">("cancel");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Date filter state
  const [fromDateFilter, setFromDateFilter] = useState<string>("");

  // RUT filter state
  const [rutSearchValue, setRutSearchValue] = useState<string>("");
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
        statusParam,
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

  const handleRutSearch = async (input: string) => {
    if (!input || input.length < 3) {
      setRutOptions([]);
      return;
    }
    setIsSearchingRut(true);
    try {
      const response = await searchByRut(input);
      if (response.succeeded && response.data) {
        setRutOptions(
          Array.isArray(response.data) ? response.data : [response.data],
        );
      } else {
        setRutOptions([]);
      }
    } catch (error) {
      console.error("Error searching by RUT:", error);
      setRutOptions([]);
    } finally {
      setIsSearchingRut(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenActionModal = (
    reservation: ActivityReservationResponse,
    action: "confirm" | "cancel",
  ) => {
    setSelectedReservation(reservation);
    setActionType(action);
    setReason("");
    setActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
    if (!processing) {
      setActionModalOpen(false);
      setSelectedReservation(null);
      setReason("");
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedReservation) return;

    try {
      setProcessing(true);

      if (actionType === "cancel") {
        const response = await cancelReservation(
          selectedReservation.id,
          reason || undefined,
        );

        if (response.succeeded) {
          dispatch(
            showMessage({
              message: t("messages.reservationCancelled"),
              variant: "success",
            }),
          );
        } else {
          dispatch(
            showMessage({
              message:
                response.message?.join(", ") || t("errors.cancelReservation"),
              variant: "error",
            }),
          );
        }
      } else {
        // Confirm action
        const response = await updateReservationStatus(selectedReservation.id, {
          status: ActivityReservationStatus.InProgress,
        });

        if (response.succeeded) {
          dispatch(
            showMessage({
              message: t("messages.reservationConfirmed"),
              variant: "success",
            }),
          );
        } else {
          dispatch(
            showMessage({
              message:
                response.message?.join(", ") || t("errors.confirmReservation"),
              variant: "error",
            }),
          );
        }
      }

      setActionModalOpen(false);
      setSelectedReservation(null);
      setReason("");
      fetchReservations();
    } catch (error) {
      console.error(`Error ${actionType}ing reservation:`, error);
      dispatch(
        showMessage({
          message: t(`errors.${actionType}Reservation`),
          variant: "error",
        }),
      );
    } finally {
      setProcessing(false);
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

  const canConfirmReservation = (reservation: ActivityReservationResponse) => {
    return reservation.status === ActivityReservationStatus.Pending;
  };

  const canCancelReservation = (reservation: ActivityReservationResponse) => {
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
      id: "beneficiary",
      label: t("management.table.beneficiary"),
      render: (row) => (
        <div>
          <Typography variant="body2" className="font-medium">
            {row.beneficiaryFullName || row.beneficiaryEmail}
          </Typography>
          {row.beneficiaryRut && (
            <Typography variant="caption" color="textSecondary">
              {row.beneficiaryRut}
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
                {t("management.title")}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {t("management.subtitle")}
              </Typography>
            </div>
          </div>
        }
        content={
          <div className="p-6">
            {/* Filters */}
            <Box className="mb-6 flex items-center gap-4 flex-wrap bg-white p-3 rounded-lg shadow-sm">
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel id="status-filter-label">
                  {t("management.filters.status")}
                </InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter ?? ""}
                  label={t("management.filters.status")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStatusFilter(
                      value === "" ? undefined : (value as number),
                    );
                    setPage(0);
                  }}
                >
                  <MenuItem value="">
                    {t("management.filters.statusOptions.all")}
                  </MenuItem>
                  <MenuItem value={0}>
                    {t("management.filters.statusOptions.pending")}
                  </MenuItem>
                  <MenuItem value={1}>
                    {t("management.filters.statusOptions.inProgress")}
                  </MenuItem>
                  <MenuItem value={2}>
                    {t("management.filters.statusOptions.completed")}
                  </MenuItem>
                  <MenuItem value={3}>
                    {t("management.filters.statusOptions.cancelled")}
                  </MenuItem>
                </Select>
              </FormControl>

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

              <Autocomplete
                freeSolo
                options={rutOptions}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return `${option.dni || ""} - ${option.firstName || ""} ${option.lastName || ""}`.trim();
                }}
                value={selectedUser}
                onChange={(_, newValue) => {
                  if (typeof newValue === "object" && newValue) {
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
                    label={t("management.filters.searchByRut")}
                    placeholder={t("management.filters.rutPlaceholder")}
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isSearchingRut ? (
                            <CircularProgress size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={isSearchingRut}
                loadingText={t("management.filters.searching")}
                noOptionsText={t("management.filters.noResults")}
                sx={{ width: 300 }}
              />

              {(fromDateFilter || selectedUser) && (
                <Button
                  size="small"
                  onClick={() => {
                    setFromDateFilter("");
                    setSelectedUser(null);
                    setRutSearchValue("");
                    setRutOptions([]);
                    setStatusFilter(undefined);
                    setPage(0);
                  }}
                  variant="outlined"
                >
                  {t("reservations.filters.clearFilter")}
                </Button>
              )}
              {(fromDateFilter || selectedUser) && (
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
              emptyMessage={t("management.noReservations")}
              renderActions={(row) => (
                <RowActionMenu
                  menuItems={[
                    {
                      key: "confirm",
                      label: t("management.actions.confirm"),
                      icon: <CheckCircleIcon fontSize="small" />,
                      color: "success.main",
                      onClick: () => handleOpenActionModal(row, "confirm"),
                      hidden: !canConfirmReservation(row),
                    },
                    {
                      key: "cancel",
                      label: t("management.actions.cancel"),
                      icon: <CancelIcon fontSize="small" />,
                      color: "error.main",
                      onClick: () => handleOpenActionModal(row, "cancel"),
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

      {/* Action Confirmation Modal */}
      <Dialog
        open={actionModalOpen}
        onClose={handleCloseActionModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === "confirm"
            ? t("management.confirmModal.title")
            : t("management.cancelModal.title")}
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4">
            <Typography variant="body2">
              {actionType === "confirm"
                ? t("management.confirmModal.message")
                : t("management.cancelModal.message")}
            </Typography>

            {selectedReservation && (
              <Box className="p-4 bg-gray-50 rounded-lg space-y-2">
                <Typography variant="subtitle2" className="font-semibold">
                  {selectedReservation.activityName}
                </Typography>
                <Typography variant="body2">
                  <strong>{t("management.modal.beneficiary")}:</strong>{" "}
                  {selectedReservation.beneficiaryFullName ||
                    selectedReservation.beneficiaryEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>{t("management.modal.date")}:</strong>{" "}
                  {formatDate(selectedReservation.reservationDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>{t("management.modal.time")}:</strong>{" "}
                  {selectedReservation.startTime} -{" "}
                  {selectedReservation.endTime}
                </Typography>
              </Box>
            )}

            {actionType === "cancel" && (
              <TextField
                label={t("management.cancelModal.reason")}
                placeholder={t("management.cancelModal.reasonPlaceholder")}
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
            {t("management.modal.cancel")}
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionType === "confirm" ? "success" : "error"}
            disabled={processing}
          >
            {processing ? (
              <CircularProgress size={20} color="inherit" />
            ) : actionType === "confirm" ? (
              t("management.modal.confirmAction")
            ) : (
              t("management.modal.cancelAction")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReservationManagement;
