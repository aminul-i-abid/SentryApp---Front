import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import DetailPanel, {
  DetailSection,
  InfoRow,
  MiniCard,
} from "@/components/ui/DetailPanel";
import useUser from "@auth/useUser";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useSnackbar } from "notistack";
import { getRoomData, getRoomTTLockId } from "../../badge/badgeService";
import { getLastReservationsByRoom } from "../../reserve/reserveService";
import { getLockRecordTypeTranslation } from "../models/LockRecordTypes";
import { getRecordTypeStrTranslation } from "../models/RecordTypeStr";
import { RoomResponse } from "../models/RoomResponse";
import {
  createRoomPinUnique,
  getLastPinUnique,
  getPinUniqueHistory,
  getRoomById,
  getRoomCompanyHistory,
  getRoomDisabledHistory,
  getRoomIncidents,
  unlockRoom,
  updateRoomDisabledStatus,
  updateRoomIncident,
} from "../roomService";
import AddPinModal from "./AddPinModal";

interface RoomDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  roomId: number | null;
  onRefreshData?: () => void;
  onGoBackToReserve?: (reserveId: number) => void;
  reserveId?: number | null;
}

const RoomDetailSidebar: React.FC<RoomDetailSidebarProps> = ({
  open,
  onClose,
  roomId,
  onRefreshData,
  onGoBackToReserve,
  reserveId,
}) => {
  const { authState } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { data: user } = useUser();
  const hasTTLock = user?.modules?.ttlock === true;
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [disableComments, setDisableComments] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const [disabledHistory, setDisabledHistory] = useState<any[]>([]);
  const [companyHistory, setCompanyHistory] = useState<any[]>([]);
  const [lastReservations, setLastReservations] = useState<any[]>([]);
  const [roomData, setRoomData] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  // Estado para modal de agregar PIN
  const [isAddPinOpen, setIsAddPinOpen] = useState(false);
  const [addingPin, setAddingPin] = useState(false);
  const [ttlockId, setTtlockId] = useState<any>(null);
  const [showAllLockActivity, setShowAllLockActivity] = useState(false);
  const [_lastPinUnique, setLastPinUnique] = useState<string | null>(null);
  const [pinUniqueHistory, setPinUniqueHistory] = useState<any[]>([]);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [incidentComments, setIncidentComments] = useState("");
  const [resolvingIncident, setResolvingIncident] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockAlert, setUnlockAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const isSentryAdmin = authState.user?.role === "Sentry_Admin";
  const isCompanyAdmin = authState.user?.role === "Company_Admin";

  // Helper function to safely format dates (only date, no time)
  const formatDateSafely = (dateString: string | null | undefined): string => {
    if (!dateString) return "Fecha inválida";

    // Si el string es un número (timestamp), conviértelo a número
    let parsed: number;

    if (/^\d+$/.test(dateString.trim())) {
      parsed = Number(dateString);
    } else {
      parsed = Date.parse(dateString);
    }

    if (isNaN(parsed)) return "Fecha inválida";

    try {
      const date = new Date(parsed);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const handleIncidentIconClick = (incident: any) => {
    setSelectedIncident(incident);
    setIncidentComments(incident?.commentsResolution ?? "");
    setIncidentDialogOpen(true);
  };

  const handleCloseIncidentDialog = () => {
    setIncidentDialogOpen(false);
    setSelectedIncident(null);
    setIncidentComments("");
    setResolvingIncident(false);
  };

  const handleResolveIncident = async () => {
    if (!selectedIncident || !roomId) return;

    setResolvingIncident(true);
    try {
      const payload = {
        id: selectedIncident.id,
        status: 1,
        commentsResolution: incidentComments.trim()
          ? incidentComments.trim()
          : null,
      };
      const result = await updateRoomIncident(selectedIncident.id, payload);

      if (result.succeeded) {
        enqueueSnackbar("Problema actualizado correctamente", {
          variant: "success",
        });
        await refreshIncidents(roomId);
        handleCloseIncidentDialog();

        if (onRefreshData) onRefreshData();
      } else {
        enqueueSnackbar(
          result.errors?.[0] || "Error al actualizar el problema",
          { variant: "error" },
        );
      }
    } catch (error) {
      enqueueSnackbar("Error al actualizar el problema", { variant: "error" });
    } finally {
      setResolvingIncident(false);
    }
  };

  const handleUnlockRoom = async () => {
    if (!roomId) return;

    setIsUnlocking(true);
    setUnlockAlert({ show: false, type: "success", message: "" });
    try {
      const result = await unlockRoom(roomId);
      console.log("Unlock result:", result);

      if (result.succeeded) {
        setUnlockAlert({
          show: true,
          type: "success",
          message: "Puerta desbloqueada exitosamente",
        });
        setTimeout(() => {
          setUnlockAlert({ show: false, type: "success", message: "" });
        }, 5000);
      } else {
        const errorMessage =
          result.messages?.[0] ||
          result.errors?.[0] ||
          "Error al desbloquear la puerta";
        setUnlockAlert({
          show: true,
          type: "error",
          message: errorMessage,
        });
        setTimeout(() => {
          setUnlockAlert({ show: false, type: "error", message: "" });
        }, 8000);
      }
    } catch (error) {
      console.error("Unlock error:", error);
      setUnlockAlert({
        show: true,
        type: "error",
        message: "Error al desbloquear la puerta",
      });
      setTimeout(() => {
        setUnlockAlert({ show: false, type: "error", message: "" });
      }, 8000);
    } finally {
      setIsUnlocking(false);
    }
  };

  // Helper function to format date and time from milliseconds
  const formatDateTimeFromMs = (
    milliseconds: number | null | undefined,
  ): string => {
    if (!milliseconds) return "Fecha inválida";

    try {
      const date = new Date(milliseconds);
      const dateStr = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeStr = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return `${dateStr} ${timeStr}`;
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const refreshIncidents = async (targetRoomId?: number) => {
    const idToUse = targetRoomId ?? roomId;

    if (!idToUse) return;

    try {
      const incidentsResponse = await getRoomIncidents(idToUse);

      if (incidentsResponse.succeeded && incidentsResponse.data) {
        setIncidents(incidentsResponse.data);
      } else {
        setIncidents([]);
      }
    } catch (error) {
      setIncidents([]);
    }
  };

  const fetchData = async () => {
    if (!roomId) return;

    setLoading(true);
    try {
      const response = await getRoomById(roomId.toString());

      if (response.succeeded) {
        setRoom(response.data);
        // Fetch disabled history separately
        const historyResponse = await getRoomDisabledHistory(roomId);

        if (historyResponse.succeeded) {
          setDisabledHistory(historyResponse.data);
        } else {
          setDisabledHistory([]);
        }

        // Fetch company history separately
        const companyHistoryResponse = await getRoomCompanyHistory(roomId);

        if (companyHistoryResponse.succeeded) {
          setCompanyHistory(companyHistoryResponse.data);
        } else {
          setCompanyHistory([]);
        }

        // Fetch last reservations separately
        const lastReservationsResponse =
          await getLastReservationsByRoom(roomId);

        if (lastReservationsResponse.succeeded) {
          setLastReservations(lastReservationsResponse.data);
        } else {
          setLastReservations([]);
        }

        // Fetch room data from DoorLocks endpoint
        if (hasTTLock) {
          const roomDataResponse = await getRoomData(roomId);

          if (roomDataResponse.succeeded) {
            console.log(roomDataResponse.data);
            setRoomData(roomDataResponse.data);
          } else {
            setRoomData(null);
          }

          // Fetch TTLock ID from new endpoint
          const ttlockResponse = await getRoomTTLockId(roomId);

          if (ttlockResponse.succeeded) {
            setTtlockId(ttlockResponse.data);
          } else {
            setTtlockId(null);
          }

          // Fetch last PIN unique
          const pinUniqueResponse = await getLastPinUnique(roomId);

          if (pinUniqueResponse.succeeded && pinUniqueResponse.data) {
            setLastPinUnique(pinUniqueResponse.data);
          } else {
            setLastPinUnique(null);
          }

          // Fetch PIN unique history
          const pinHistoryResponse = await getPinUniqueHistory(roomId, 3, 1);

          if (pinHistoryResponse.succeeded && pinHistoryResponse.data?.items) {
            setPinUniqueHistory(pinHistoryResponse.data.items);
          } else {
            setPinUniqueHistory([]);
          }
        } else {
          setRoomData(null);
          setTtlockId(null);
          setLastPinUnique(null);
          setPinUniqueHistory([]);
        }

        await refreshIncidents(roomId);
      } else {
        setRoom(null);
        enqueueSnackbar("Error al cargar la información de la habitación", {
          variant: "error",
        });
      }
    } catch (e) {
      setRoom(null);
      enqueueSnackbar("Error al cargar la información de la habitación", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && roomId) {
      fetchData();
    }
  }, [open, roomId]);

  const handleDisableRoom = () => {
    if (!room) return;

    setConfirmDisableOpen(true);
  };

  const handleConfirmDisable = async () => {
    if (!room) return;

    setConfirmDisableOpen(false);
    setIsDisabling(true);
    try {
      const action = room.disabled ? 0 : 1; // 0 para habilitar, 1 para deshabilitar
      const response = await updateRoomDisabledStatus(
        room.id,
        action,
        disableComments,
      );

      if (response.succeeded) {
        enqueueSnackbar(
          room.disabled
            ? "Habitación habilitada exitosamente"
            : "Habitación deshabilitada exitosamente",
          { variant: "success" },
        );
        // Refresh all data including history
        fetchData();

        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        const errorMessage =
          response.errors?.join(", ") ||
          "Error al actualizar el estado de la habitación";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      console.error("Error updating room status:", error);
      enqueueSnackbar("Error al actualizar el estado de la habitación", {
        variant: "error",
      });
    } finally {
      setIsDisabling(false);
      setDisableComments("");
    }
  };

  const handleGoBackToReserve = () => {
    if (onGoBackToReserve && reserveId) {
      onClose(); // Cerrar el sidebar de habitación
      onGoBackToReserve(reserveId); // Abrir el sidebar de reserva
    }
  };

  return (
    <DetailPanel
      open={open}
      onClose={onClose}
      title={`Habitación ${room?.roomNumber || ""}`}
      loading={loading}
      loadingMessage="Cargando detalles de la habitación..."
      emptyMessage="Habitación no encontrada"
      hasData={!!room}
      onBack={
        onGoBackToReserve && reserveId ? handleGoBackToReserve : undefined
      }
      width={{ xs: "100%", sm: "560px", md: "640px" }}
      maxWidth={640}
      extraContent={
        <>
          {/* Incident detail dialog */}
          <Dialog
            open={incidentDialogOpen}
            onClose={handleCloseIncidentDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FuseSvgIcon>heroicons-outline:exclamation-triangle</FuseSvgIcon>
              Detalle del problema
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedIncident?.title || "Problema"}
              </Typography>
              <Typography variant="body2">
                {selectedIncident?.description || "Sin descripción"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Creado:{" "}
                {selectedIncident
                  ? formatDateSafely(selectedIncident.created)
                  : ""}
              </Typography>
              {selectedIncident?.status === 1 ? (
                <TextField
                  label="Comentarios de resolución"
                  value={selectedIncident?.commentsResolution || ""}
                  fullWidth
                  multiline
                  minRows={3}
                  InputProps={{ readOnly: true }}
                  helperText={
                    selectedIncident?.commentsResolution
                      ? undefined
                      : "Sin comentarios registrados"
                  }
                />
              ) : (
                <TextField
                  label="Comentarios de resolución"
                  placeholder="Ingresa comentarios para resolver el problema"
                  fullWidth
                  multiline
                  minRows={3}
                  value={incidentComments}
                  onChange={(e) => setIncidentComments(e.target.value)}
                  disabled={resolvingIncident}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseIncidentDialog}
                color="inherit"
                disabled={resolvingIncident}
              >
                {selectedIncident?.status === 1 ? "Cerrar" : "Cancelar"}
              </Button>
              {selectedIncident?.status === 0 && (
                <Button
                  onClick={handleResolveIncident}
                  variant="contained"
                  color="primary"
                  disabled={resolvingIncident}
                >
                  {resolvingIncident
                    ? "Actualizando..."
                    : "Marcar como resuelto"}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Add PIN modal */}
          <AddPinModal
            open={isAddPinOpen}
            onClose={() => setIsAddPinOpen(false)}
            roomId={roomId}
            loading={addingPin}
            onSave={async (data) => {
              setAddingPin(true);
              try {
                const result = await createRoomPinUnique({
                  name: data.name,
                  phoneNumber: data.phoneNumber,
                  roomId: roomId,
                });

                if (result.succeeded) {
                  enqueueSnackbar("PIN creado correctamente", {
                    variant: "success",
                  });
                  setIsAddPinOpen(false);

                  if (onRefreshData) onRefreshData();
                } else {
                  enqueueSnackbar(
                    result.errors?.[0] || "Error al crear el PIN",
                    {
                      variant: "error",
                    },
                  );
                }
              } catch (_e) {
                enqueueSnackbar("Error al crear el PIN", { variant: "error" });
              } finally {
                setAddingPin(false);
              }
            }}
          />

          {/* Disable/Enable confirmation dialog */}
          <Dialog
            open={confirmDisableOpen}
            onClose={() => setConfirmDisableOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {room?.disabled
                ? "¿Habilitar habitación?"
                : "¿Deshabilitar habitación?"}
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ mb: 2 }}>
                {room?.disabled
                  ? "¿Estás seguro de que deseas habilitar la habitación?"
                  : "¿Estás seguro de que deseas deshabilitar la habitación?"}
              </Typography>
              <TextField
                fullWidth
                label="Comentarios (opcional)"
                value={disableComments}
                onChange={(e) => setDisableComments(e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Ingresa un comentario sobre el cambio de estado..."
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setConfirmDisableOpen(false)}
                color="inherit"
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDisable}
                color={room?.disabled ? "success" : "error"}
                variant="contained"
                autoFocus
                disabled={isDisabling}
              >
                {isDisabling
                  ? "Procesando..."
                  : room?.disabled
                    ? "Sí, habilitar"
                    : "Sí, deshabilitar"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      }
    >
      {room && (
        <>
          {/* ============ Room Information ============ */}
          <DetailSection title="Información de la habitación">
            {/* Unlock alert */}
            <Collapse in={unlockAlert.show}>
              <Alert
                severity={unlockAlert.type}
                onClose={() =>
                  setUnlockAlert({ show: false, type: "success", message: "" })
                }
                sx={{ mb: 2 }}
              >
                {unlockAlert.message}
              </Alert>
            </Collapse>

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <InfoRow
                  icon={<img src="./assets/icons/roomspavi.png" />}
                  label="Número de habitación"
                  value={room.roomNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoRow
                  icon={<img src="./assets/icons/nob.png" />}
                  label="Número de camas"
                  value={String(room.beds).padStart(2, "0")}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoRow
                  icon={<img src="./assets/icons/camp.png" />}
                  label="Campamento"
                  value={room.company?.name || "N/A"}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoRow
                  icon={<img src="./assets/icons/block.png" />}
                  label="Bloque"
                  value={room.block?.name || "N/A"}
                />
              </Grid>
              <Grid item xs={6}>
                <InfoRow
                  icon={<img src="./assets/icons/floors.png" />}
                  label="Piso"
                  value={String(room.floorNumber).padStart(2, "0")}
                />
              </Grid>
            </Grid>

            {/* Action buttons */}
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              {isSentryAdmin && hasTTLock && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setIsAddPinOpen(true)}
                  startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: "#415EDE",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { bgcolor: "#415EDE" },
                  }}
                >
                  Generar PIN único
                </Button>
              )}
              {isSentryAdmin && hasTTLock && roomData?.hasGateway == 1 && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={isUnlocking || !roomId}
                  onClick={handleUnlockRoom}
                  startIcon={
                    isUnlocking ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : undefined
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  {isUnlocking ? "Desbloqueando..." : "Desbloqueo remoto"}
                </Button>
              )}
            </Box>
          </DetailSection>

          {/* ============ Lock Information ============ */}
          {isSentryAdmin && hasTTLock && (
            <DetailSection title="Información de la cerradura">
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <InfoRow
                    icon={<LockIcon sx={{ fontSize: 16 }} />}
                    label="ID TTLock"
                    value={roomData?.doorLock?.ttlockId || "Not configured"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoRow
                    icon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
                    label="PIN administrador"
                    value={roomData?.pinAdmin || "Not configured"}
                  />
                </Grid>
              </Grid>

              {/* Status chips */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={
                    roomData?.hasGateway == 1
                      ? "Gateway conectado"
                      : "Sin gateway"
                  }
                  size="small"
                  sx={{
                    bgcolor: roomData?.hasGateway == 1 ? "#DCFCE7" : "#FEF2F2",
                    color: roomData?.hasGateway == 1 ? "#16a34a" : "#EF4444",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    border: "1px solid",
                    borderColor:
                      roomData?.hasGateway == 1 ? "#BBF7D0" : "#FECACA",
                  }}
                />
                <Chip
                  label={
                    roomData?.doorLock?.id > 0
                      ? "Cerradura instalada"
                      : "Sin cerradura"
                  }
                  size="small"
                  sx={{
                    bgcolor: roomData?.doorLock?.id > 0 ? "#DCFCE7" : "#FEF2F2",
                    color: roomData?.doorLock?.id > 0 ? "#166534" : "#EF4444",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    border: "1px solid",
                    borderColor:
                      roomData?.doorLock?.id > 0 ? "#15803d" : "#FECACA",
                  }}
                />
              </Box>
            </DetailSection>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Diamond at first */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                mr: 1,
                flexShrink: 0,
              }}
            />

            {/* Dotted Line */}
            <Box
              sx={{
                flex: 1,
                borderTop: "1px dashed #415EDE",
              }}
            />

            {/* Diamond at end */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                ml: 1,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* ============ Lock Activity ============ */}
          {isSentryAdmin && hasTTLock && ttlockId && ttlockId.length > 0 && (
            <DetailSection
              title="Actividad del candado:"
              action={
                ttlockId.length > 3 ? (
                  <Typography
                    variant="caption"
                    onClick={() => setShowAllLockActivity(!showAllLockActivity)}
                    sx={{
                      color: "#415EDE",
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {showAllLockActivity ? "Mostrar menos" : "Mostrar todo"} →
                  </Typography>
                ) : undefined
              }
            >
              <Grid container spacing={1.5}>
                {(showAllLockActivity ? ttlockId : ttlockId.slice(0, 3)).map(
                  (record: any, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <MiniCard
                        accentColor="#415EDE"
                        icon={
                          <Box
                            component="img"
                            src="/assets/icons/lock-activity.png"
                            alt=""
                            sx={{ width: 20, height: 20 }}
                          />
                        }
                        title={
                          getRecordTypeStrTranslation(record.recordTypeStr) ||
                          "Unknown"
                        }
                        titleColor="#415EDE"
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#000",
                              lineHeight: 1.4,
                              fontSize: "0.8rem",
                            }}
                          >
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              Usuario:
                            </Box>{" "}
                            {record.username || "N/A"}
                          </Typography>
                          {record.keyboardPwd && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#000",
                                lineHeight: 1.4,
                                fontSize: "0.8rem",
                              }}
                            >
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                Contraseña:
                              </Box>{" "}
                              <Box component="span" sx={{ color: "#EF4444" }}>
                                {record.keyboardPwd}
                              </Box>
                            </Typography>
                          )}
                          {record.recordTypeFromLockStr && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#000",
                                lineHeight: 1.4,
                                fontSize: "0.8rem",
                              }}
                            >
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                Origen:
                              </Box>{" "}
                              {getLockRecordTypeTranslation(
                                record.recordTypeFromLockStr,
                              )}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#000",
                              lineHeight: 1.4,
                              fontSize: "0.8rem",
                            }}
                          >
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              Fecha:
                            </Box>{" "}
                            {
                              formatDateTimeFromMs(record.lockDate)?.split(
                                " ",
                              )[0]
                            }{" "}
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              Hora:
                            </Box>{" "}
                            {formatDateTimeFromMs(record.lockDate)?.split(
                              " ",
                            )[1] || ""}
                          </Typography>
                        </Box>
                      </MiniCard>
                    </Grid>
                  ),
                )}
              </Grid>
            </DetailSection>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Diamond at first */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                mr: 1,
                flexShrink: 0,
              }}
            />

            {/* Dotted Line */}
            <Box
              sx={{
                flex: 1,
                borderTop: "1px dashed #415EDE",
              }}
            />

            {/* Diamond at end */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                ml: 1,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* ============ Status Change History ============ */}
          <DetailSection
            title="Historial de cambios de estado"
            icon={
              <Box
                component="img"
                src="/assets/icons/sch.png"
                alt="status history"
                sx={{ width: 20, height: 20, objectFit: "contain" }}
              />
            }
            subtitle={
              disabledHistory.length === 0
                ? "No se han registrado cambios de estado."
                : undefined
            }
          >
            {disabledHistory.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {disabledHistory.map((history, index) => (
                  <MiniCard
                    key={index}
                    accentColor={history.action ? "#EF4444" : "#415EDE"}
                    icon={
                      <Box
                        component="img"
                        src="/assets/icons/lock-activity.png"
                        alt=""
                        sx={{ width: 20, height: 20 }}
                      />
                    }
                    title={history.action ? "Deshabilitado" : "Habilitado"}
                    titleColor={history.action ? "#EF4444" : "#415EDE"}
                  >
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Fecha:
                      </Box>{" "}
                      {formatDateSafely(history.created)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B", display: "block" }}
                    >
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        Comentario:
                      </Box>{" "}
                      {history.comments || "Sin comentarios"}
                    </Typography>
                  </MiniCard>
                ))}
              </Box>
            )}
          </DetailSection>

          {/* ============ Unique Pin History ============ */}
          {hasTTLock && (
            <DetailSection
              title="Historial de PINs únicos"
              icon={
                <Box
                  component="img"
                  src="/assets/icons/uph.png"
                  alt="unique pin history"
                  sx={{ width: 20, height: 20, objectFit: "contain" }}
                />
              }
              subtitle={
                pinUniqueHistory.length === 0
                  ? "No hay PINs únicos registrados para esta habitación."
                  : undefined
              }
            >
              {pinUniqueHistory.length > 0 && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {pinUniqueHistory.map((pinItem, index) => (
                    <MiniCard
                      key={pinItem.id || index}
                      accentColor="#415EDE"
                      icon={
                        <Box
                          component="img"
                          src="/assets/icons/lock-activity.png"
                          alt=""
                          sx={{ width: 20, height: 20 }}
                        />
                      }
                      title={`PIN: ${pinItem.pin}`}
                      titleColor="#415EDE"
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            Nombre:
                          </Box>{" "}
                          {pinItem.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            Teléfono:
                          </Box>{" "}
                          {pinItem.phoneNumber}
                        </Typography>
                      </Box>
                    </MiniCard>
                  ))}
                </Box>
              )}
            </DetailSection>
          )}

          {/* ============ Issues ============ */}
          <DetailSection
            title="Incidencias"
            icon={
              <Box
                component="img"
                src="/assets/icons/issue.png"
                alt="issues"
                sx={{ width: 20, height: 20, objectFit: "contain" }}
              />
            }
            subtitle={
              incidents.length === 0
                ? "No hay incidencias registradas para esta habitación."
                : undefined
            }
          >
            {incidents.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {incidents.map((incidentItem, index) => {
                  const isActive = incidentItem.status === 0;
                  return (
                    <MiniCard
                      key={incidentItem.id || index}
                      accentColor={isActive ? "#F59E0B" : "#415EDE"}
                      icon={
                        <Box
                          component="img"
                          src="/assets/icons/lock-activity.png"
                          alt=""
                          sx={{ width: 20, height: 20 }}
                        />
                      }
                      title={incidentItem.title || "Incidencia sin título"}
                      titleColor={isActive ? "#F59E0B" : "#415EDE"}
                      action={
                        <IconButton
                          size="small"
                          onClick={() => handleIncidentIconClick(incidentItem)}
                          sx={{
                            border: "1px solid",
                            borderColor: isActive ? "#F59E0B" : "#22c55e",
                            color: isActive ? "#F59E0B" : "#22c55e",
                            width: 28,
                            height: 28,
                          }}
                        >
                          {isActive ? (
                            <FuseSvgIcon size={16}>
                              heroicons-outline:exclamation-triangle
                            </FuseSvgIcon>
                          ) : (
                            <FuseSvgIcon size={16}>
                              heroicons-outline:check-circle
                            </FuseSvgIcon>
                          )}
                        </IconButton>
                      }
                    >
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        {incidentItem.description || "Sin descripción"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#000", display: "block" }}
                      >
                        Creado: {formatDateSafely(incidentItem.created)}
                      </Typography>
                    </MiniCard>
                  );
                })}
              </Box>
            )}
          </DetailSection>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Diamond at first */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                mr: 1,
                flexShrink: 0,
              }}
            />

            {/* Dotted Line */}
            <Box
              sx={{
                flex: 1,
                borderTop: "1px dashed #415EDE",
              }}
            />

            {/* Diamond at end */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                ml: 1,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* ============ Latest Bookings ============ */}
          <DetailSection title="Últimas reservas:">
            {lastReservations && lastReservations.length > 0 ? (
              <Grid container spacing={1.5}>
                {lastReservations.map((reservation, index) => (
                  <Grid item xs={12} sm={6} key={reservation.id || index}>
                    <MiniCard
                      accentColor="#415EDE"
                      icon={
                        <Box
                          component="img"
                          src="/assets/icons/latests-bookings.png"
                          alt=""
                          sx={{ width: 20, height: 20 }}
                        />
                      }
                      title={`Reserva # ${reservation.id}`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#1a1a1a",
                            lineHeight: 1.5,
                            fontSize: "0.8rem",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "#9e9d9d",
                              fontWeight: 600,
                            }}
                          >
                            Huésped:
                          </Box>{" "}
                          {reservation.guestName || "No name"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#1a1a1a",
                            lineHeight: 1.5,
                            fontSize: "0.8rem",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ color: "#9e9d9d", fontWeight: 600 }}
                          >
                            Check-in:
                          </Box>{" "}
                          {formatDateSafely(reservation.checkIn)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#1a1a1a",
                            lineHeight: 1.5,
                            fontSize: "0.8rem",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ color: "#9e9d9d", fontWeight: 600 }}
                          >
                            Check-out:
                          </Box>{" "}
                          {formatDateSafely(reservation.checkOut)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#1a1a1a",
                            lineHeight: 1.5,
                            fontSize: "0.8rem",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ color: "#9e9d9d", fontWeight: 600 }}
                          >
                            Estado:
                          </Box>{" "}
                          {reservation.status === 0 ? "Activa" : "Completada"}
                        </Typography>
                      </Box>
                    </MiniCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="caption" sx={{ color: "#000" }}>
                No hay reservas registradas para esta habitación.
              </Typography>
            )}
          </DetailSection>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Diamond at first */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                mr: 1,
                flexShrink: 0,
              }}
            />

            {/* Dotted Line */}
            <Box
              sx={{
                flex: 1,
                borderTop: "1px dashed #415EDE",
              }}
            />

            {/* Diamond at end */}
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: "#415EDE",
                transform: "rotate(45deg)",
                ml: 1,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* ============ Contractor Change History ============ */}
          {isSentryAdmin && companyHistory && companyHistory.length > 0 && (
            <DetailSection
              title="Historial de cambios de contratista:"
              hideSeparator
            >
              <Grid container spacing={1.5}>
                {companyHistory.map((history, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <MiniCard
                      accentColor="#415EDE"
                      icon={
                        <Box
                          component="img"
                          src="/assets/icons/contractor-change-history.png"
                          alt=""
                          sx={{ width: 20, height: 20 }}
                        />
                      }
                      title={history.companyName || "Contratista desconocido"}
                      titleColor="#415EDE"
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#000",
                          display: "block",
                          lineHeight: 1.4,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{ color: "#9e9d9d", fontWeight: 600 }}
                        >
                          Fecha:
                        </Box>{" "}
                        {formatDateSafely(history.date)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#000",
                          display: "block",
                          lineHeight: 1.4,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{ color: "#9e9d9d", fontWeight: 600 }}
                        >
                          Comentario:
                        </Box>{" "}
                        {history.comments || "Sin comentarios"}
                      </Typography>
                    </MiniCard>
                  </Grid>
                ))}
              </Grid>
            </DetailSection>
          )}
        </>
      )}
    </DetailPanel>
  );
};

export default RoomDetailSidebar;
