import { ConfirmationModal } from "@/components/ConfirmationModal";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import WarningIcon from "@mui/icons-material/Warning";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  Portal,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import RoomDetailSidebar from "../../room/components/RoomDetailSidebar";
import GuestDetailModal from "./GuestDetailModal";
import GuestReservationModal from "./GuestReservationModal";
import ReserveDetailCard from "./ReserveDetailCard";

import useUser from "@auth/useUser";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import { useSnackbar } from "notistack";
import { differenceInDays, formatDate } from "src/utils/dateHelpers";
import { getContractorById } from "../../contractors/contractorsService";
import { ContractorResponse } from "../../contractors/models/ContractorResponse";
import { StatusReservation } from "../enum/statusReservation";
import { Guest, ReserveDetailResponse } from "../models/ReserveDetailResponse";
import {
  cancelReserve,
  getGuestMessagingStatus,
  getReserveById,
  getStatusMessage,
  resendMessaging,
  resetPinTtlock,
} from "../reserveService";

interface ReserveDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  reserveId: number | null;
  onOpenRoomSidebar?: (roomId: number) => void;
  onGuestUpdate?: () => void;
}

const ReserveDetailSidebar: React.FC<ReserveDetailSidebarProps> = ({
  open,
  onClose,
  reserveId,
  onOpenRoomSidebar,
  onGuestUpdate,
}) => {
  const { authState } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { data: user } = useUser();
  const hasTTLock = user?.modules?.ttlock === true;
  const [reserve, setReserve] = useState<ReserveDetailResponse | null>(null);
  const [companyData, setCompanyData] = useState<ContractorResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGuestDetailModalOpen, setIsGuestDetailModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [messagingStatus, setMessagingStatus] = useState<any>(null);
  const [loadingMessagingStatus, setLoadingMessagingStatus] = useState(false);
  const [isRoomSidebarOpen, setIsRoomSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successOpen) {
      return;
    }
    const timer = setTimeout(() => {
      setSuccessOpen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [successOpen]);

  useEffect(() => {
    if (!errorOpen) {
      return;
    }
    const timer = setTimeout(() => {
      setErrorOpen(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [errorOpen]);

  const isSentryAdmin = authState.user?.role === "Sentry_Admin";
  const isCompanyAdmin = authState.user?.role === "Company_Admin";

  const fetchData = async () => {
    if (!reserveId) return;
    setLoading(true);
    try {
      const response = await getReserveById(reserveId);
      if (response.succeeded) {
        setReserve(response.data);

        // Obtener datos de la compañía si hay companyId
        if (response.data.companyId) {
          try {
            const companyResponse = await getContractorById(
              response.data.companyId,
            );
            if (companyResponse.succeeded) {
              setCompanyData(companyResponse.data);
            } else {
              setCompanyData(null);
            }
          } catch (companyError) {
            console.error("Error fetching company data:", companyError);
            setCompanyData(null);
          }
        } else {
          setCompanyData(null);
        }
      } else {
        setReserve(null);
        setCompanyData(null);
      }
    } catch (e) {
      setReserve(null);
      setCompanyData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagingStatus = async () => {
    if (!reserve?.guests?.[0]?.id) return;

    setLoadingMessagingStatus(true);
    try {
      const response = await getGuestMessagingStatus(reserve.guests[0].id);
      if (response.succeeded) {
        setMessagingStatus(response.data);
      } else {
        setMessagingStatus(null);
      }
    } catch (error) {
      console.error("Error fetching messaging status:", error);
      setMessagingStatus(null);
    } finally {
      setLoadingMessagingStatus(false);
    }
  };

  useEffect(() => {
    if (open && reserveId) {
      fetchData();
    }
  }, [open, reserveId]);

  useEffect(() => {
    if (reserve?.guests?.[0]?.id) {
      fetchMessagingStatus();
    }
  }, [reserve?.guests?.[0]?.id]);

  const handleAddGuestClick = () => {
    setIsAddGuestModalOpen(true);
  };

  const handleAddGuestClose = () => {
    setIsAddGuestModalOpen(false);
  };

  const handleGuestSuccess = () => {
    fetchData();
  };

  const handleGuestClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsGuestDetailModalOpen(true);
  };

  const handleGuestDetailClose = () => {
    setIsGuestDetailModalOpen(false);
    setSelectedGuest(null);
  };

  const handleRoomNumberClick = () => {
    if (reserve?.roomId) {
      // Siempre usar el sidebar interno para tener navegación de vuelta
      setSelectedRoomId(reserve.roomId);
      setIsRoomSidebarOpen(true);
    }
  };

  const handleRoomSidebarClose = () => {
    setIsRoomSidebarOpen(false);
    setSelectedRoomId(null);
  };

  const handleGoBackToReserve = (reserveIdFromRoom: number) => {
    setIsRoomSidebarOpen(false);
    setSelectedRoomId(null);
    // El sidebar de reserva ya está abierto, no necesitamos hacer nada más
  };

  // Función para calcular la duración en días (solo fechas, ignora horas)
  const calculateDuration = (checkIn: string, checkOut: string) => {
    try {
      const startDate = new Date(checkIn.split(" ")[0]);
      const endDate = new Date(checkOut.split(" ")[0]);
      return differenceInDays(endDate, startDate);
    } catch (error) {
      return 0;
    }
  };

  // Función para obtener el estado de la reserva
  const getReservationStatus = (status: number) => {
    switch (status) {
      case StatusReservation.ACTIVE:
        return { text: "Activa", color: "#4caf50", bgColor: "#e8f5e8" };
      case StatusReservation.CANCELLED:
        return { text: "Cancelada", color: "#f44336", bgColor: "#ffebee" };
      case StatusReservation.EXPIRED:
        return { text: "Vencida", color: "#757575", bgColor: "#ffebee" };
      default:
        return { text: "Desconocido", color: "#757575", bgColor: "#f5f5f5" };
    }
  };

  // Initialize guest data when reserve changes
  useEffect(() => {
    if (reserve?.guests && reserve.guests.length > 0) {
      setPhoneNumber(reserve.guests[0].mobileNumber || "");
      setEmail(reserve.guests[0].email || "");
    }
  }, [reserve]);

  const handleWhatsAppResend = async () => {
    if (!reserve?.guests?.[0] || !phoneNumber.trim()) {
      setErrorMessage("Faltan datos para el reenvío por WhatsApp");
      setErrorOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resendMessaging({
        reservationGuestId: reserve.guests[0].id,
        messageType: 1,
        phoneNumber: phoneNumber.trim(),
      });

      if (response.succeeded) {
        setSuccessMessage("Mensaje de WhatsApp reenviado exitosamente");
        setSuccessOpen(true);
        // Actualizar usuario con nuevo teléfono
        const updateResult = await import("../reserveService").then((mod) =>
          mod.updateUserInfo(reserve.guests[0].rutVatId, {
            PhoneNumber: phoneNumber.trim(),
          }),
        );
        if (!updateResult.succeeded) {
          enqueueSnackbar("No se pudo actualizar el teléfono del usuario", {
            variant: "warning",
          });
        }
        // Refresh messaging status
        await fetchMessagingStatus();
        // Actualizar la lista de huéspedes en el componente padre
        onGuestUpdate?.();
      } else {
        const errMsg =
          response.message?.length > 0
            ? response.message.join(", ")
            : "Error al reenviar mensaje por WhatsApp";
        setErrorMessage(errMsg);
        setErrorOpen(true);
      }
    } catch (error) {
      console.error("Error resending WhatsApp:", error);
      setErrorMessage("Error al reenviar mensaje por WhatsApp");
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailResend = async () => {
    if (!reserve?.guests?.[0] || !email.trim()) {
      setErrorMessage("Faltan datos para el reenvío por email");
      setErrorOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resendMessaging({
        reservationGuestId: reserve.guests[0].id,
        messageType: 3,
        email: email.trim(),
      });

      if (response.succeeded) {
        setSuccessMessage("Email reenviado exitosamente");
        setSuccessOpen(true);
        // Actualizar usuario con nuevo email
        const updateResult = await import("../reserveService").then((mod) =>
          mod.updateUserInfo(reserve.guests[0].rutVatId, {
            Email: email.trim(),
          }),
        );
        if (!updateResult.succeeded) {
          enqueueSnackbar("No se pudo actualizar el correo del usuario", {
            variant: "warning",
          });
        }
        // Refresh messaging status
        await fetchMessagingStatus();
        // Actualizar la lista de huéspedes en el componente padre
        onGuestUpdate?.();
      } else {
        const errMsg =
          response.message?.length > 0
            ? response.message.join(", ")
            : "Error al reenviar email";
        setErrorMessage(errMsg);
        setErrorOpen(true);
      }
    } catch (error) {
      console.error("Error resending email:", error);
      setErrorMessage("Error al reenviar email");
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetUser = () => {
    if (!email.trim()) {
      enqueueSnackbar("Falta el correo electrónico para resetear usuario", {
        variant: "error",
      });
      return;
    }
    setConfirmResetOpen(true);
  };

  const handleConfirmReset = async () => {
    setConfirmResetOpen(false);
    setIsResetting(true);
    try {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const hostname = url.hostname;
      const port = url.port;
      const tenant = port ? `${hostname}:${port}` : hostname;
      const response = await import("../reserveService").then((mod) =>
        mod.resetUserPassword(email.trim(), tenant),
      );
      if (response.succeeded) {
        enqueueSnackbar("Usuario reseteado y correo enviado exitosamente", {
          variant: "success",
        });
        if (reserve?.guests?.[0]) {
          const updateResult = await import("../reserveService").then((mod) =>
            mod.updateUserInfo(reserve.guests[0].rutVatId, {
              Email: email.trim(),
            }),
          );
          if (!updateResult.succeeded) {
            enqueueSnackbar("No se pudo actualizar el correo del usuario", {
              variant: "warning",
            });
          }
        }
        // Actualizar la lista de huéspedes en el componente padre
        onGuestUpdate?.();
      } else {
        const errorMessage =
          response.message && response.message.length > 0
            ? response.message.join(", ")
            : "Error al resetear usuario";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      console.error("Error resetting user:", error);
      enqueueSnackbar("Error al resetear usuario", { variant: "error" });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPin = async () => {
    if (!reserve?.guests?.[0]) {
      setErrorMessage("No hay información del huésped");
      setErrorOpen(true);
      return;
    }

    setIsResettingPin(true);
    try {
      const response = await resetPinTtlock(reserve.guests[0].id);
      if (response.succeeded) {
        setSuccessMessage("PIN reseteado exitosamente");
        setSuccessOpen(true);
        // Refresh messaging status
        await fetchMessagingStatus();
        // Refrescar los datos del sidebar para obtener el nuevo PIN
        await fetchData();
        // Actualizar la lista de huéspedes en el componente padre
        onGuestUpdate?.();
      } else {
        const errMsg =
          response.message && response.message.length > 0
            ? response.message.join(", ")
            : "Error al resetear PIN";
        setErrorMessage(errMsg);
        setErrorOpen(true);
      }
    } catch (error) {
      console.error("Error resetting PIN:", error);
      setErrorMessage("Error al resetear PIN");
      setErrorOpen(true);
    } finally {
      setIsResettingPin(false);
    }
  };

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!reserve) return;
    try {
      await cancelReserve(reserve.id, { comments: "Reserva cancelada" });
      enqueueSnackbar("La reserva se canceló correctamente", {
        variant: "success",
      });
      fetchData();
      setIsCancelModalOpen(false);
      onClose(); // Close the sidebar
    } catch (error) {
      enqueueSnackbar("Algo salió mal al cancelar la reserva", {
        variant: "error",
      });
      console.error("Error canceling reservation:", error);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "70vw", md: "70vw" },
            maxWidth: "1000px",
            boxShadow: "-4px 0 8px rgba(0,0,0,0.1)",
            bgcolor: "#f5f5f5",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)",
              color: "black",
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: "bold" }}
                >
                  Detalle de Reserva - {reserve?.guid}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "black",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                }}
              >
                <Typography>Cargando...</Typography>
              </Box>
            ) : reserve ? (
              <>
                {/* Two-column layout for the first 4 cards */}
                <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
                  {/* Left Column - Room Information */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Card - Información de la reserva masiva */}
                    <Card
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        bgcolor: "white",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pl: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#1976d2" }}
                          >
                            Información de la reserva masiva
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 2,
                            bgcolor: "white",
                            borderRadius: 2,
                          }}
                        >
                          {/* Information section */}
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 8,
                                mb: 4,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Número de reserva
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {reserve.guid}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Cantidad de huéspedes
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {reserve.guests?.length || 0}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Creado por
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {reserve.guests[0].createdByUserName}
                                </Typography>
                              </Box>
                              {reserve.guests[0].lastModifiedByUserName && (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.secondary", mb: 0.5 }}
                                  >
                                    Modificado por
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 600, color: "#1976d2" }}
                                  >
                                    {reserve.guests[0].lastModifiedByUserName}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Card - Detalle de la compañía */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        bgcolor: "white",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pl: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#1976d2" }}
                          >
                            Detalle de la compañía
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 2,
                            bgcolor: "white",
                            borderRadius: 2,
                          }}
                        >
                          {/* Information section */}
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 4,
                                mb: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Nombre de la compañía
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {companyData?.name ||
                                    reserve.companyName ||
                                    "No disponible"}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  RUT de la compañía
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {companyData?.rut || "No disponible"}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                gap: 6,
                                mb: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Persona de contacto
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {companyData?.contactPerson ||
                                    "No disponible"}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Número de contacto
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {companyData?.contactPhone ||
                                    companyData?.phone ||
                                    "No disponible"}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Email de contacto
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {companyData?.contactEmail ||
                                    companyData?.email ||
                                    "No disponible"}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Right Column - Reservation Details Section */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Card - Detalle de reserva */}
                    <Card
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        bgcolor: "white",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pl: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#1976d2" }}
                          >
                            Detalle de reserva
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCancelClick}
                            sx={{
                              color: "#d32f2f",
                              borderColor: "#d32f2f",
                              "&:hover": {
                                borderColor: "#b71c1c",
                                backgroundColor: "rgba(211, 47, 47, 0.04)",
                              },
                            }}
                          >
                            Cancelar
                          </Button>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 2,
                            bgcolor: "white",
                            borderRadius: 2,
                          }}
                        >
                          {/* Information section */}
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 4,
                                mb: 4,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Check-in
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {formatDate(new Date(reserve.checkIn))}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Check-out
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {formatDate(new Date(reserve.checkOut))}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Duración
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {calculateDuration(
                                    reserve.checkIn,
                                    reserve.checkOut,
                                  )}{" "}
                                  días
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  Jornada
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {reserve.guests[0].shiftType === 1
                                    ? "Diurno"
                                    : "Nocturno"}
                                </Typography>
                              </Box>
                            </Box>
                            <Box
                              sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                            >
                              {/* Status badge */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                {(() => {
                                  const status = getReservationStatus(
                                    reserve.status,
                                  );
                                  return (
                                    <Box
                                      sx={{
                                        bgcolor: status.bgColor,
                                        color: status.color,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        height: "25px",
                                      }}
                                    >
                                      {status.text}
                                    </Box>
                                  );
                                })()}
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  ID de reserva
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {reserve.id}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary", mb: 0.5 }}
                                >
                                  ID de reserva del huesped
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#1976d2" }}
                                >
                                  {reserve.guests[0].id}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    <ReserveDetailCard
                      reserve={reserve}
                      fetchData={fetchData}
                      isModal={true}
                      onRoomNumberClick={handleRoomNumberClick}
                    />
                  </Box>
                </Box>

                {/* Full-width guest card with integrated actions */}
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    bgcolor: "white",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pl: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "#1976d2" }}
                      >
                        Huésped
                      </Typography>
                      {/*{isSentryAdmin && reserve.guests && reserve.guests.length < reserve.beds && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={handleAddGuestClick}
                                                    sx={{
                                                        bgcolor: '#1976d2',
                                                        '&:hover': {
                                                            bgcolor: '#1565c0'
                                                        }
                                                    }}
                                                >
                                                    Agregar huésped
                                                </Button>
                                            )}*/}
                    </Box>

                    {reserve.guests && reserve.guests.length > 0 ? (
                      <>
                        {/* Guest Information Section */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 2,
                            bgcolor: "white",
                            borderRadius: 2,
                            mb: 3,
                          }}
                        >
                          {/* Information section - Two columns layout */}
                          <Box sx={{ flex: 1, display: "flex", gap: 3 }}>
                            {/* Left Column - Guest Information */}
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: "#1976d2",
                                  mb: 1,
                                }}
                              >
                                {reserve.guests[0].firstName}{" "}
                                {reserve.guests[0].lastName}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary", mb: 2 }}
                              >
                                <strong>RUT/ID:</strong>{" "}
                                {reserve.guests[0].rutVatId}
                              </Typography>

                              {/* Badges/Labels */}
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Box
                                  sx={{
                                    bgcolor: "#e3f2fd",
                                    color: "#1976d2",
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  {reserve.guests[0].jobTitle}
                                </Box>
                                {(isSentryAdmin || isCompanyAdmin) &&
                                  hasTTLock &&
                                  reserve.guests[0].doorPassword && (
                                    <Box
                                      sx={{
                                        bgcolor: "#fff3e0",
                                        color: "#f57c00",
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                      }}
                                    >
                                      PIN: {reserve.guests[0].doorPassword}
                                    </Box>
                                  )}
                              </Box>
                            </Box>

                            {/* Right Column - Contact Fields */}
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  color: "#1976d2",
                                  mb: 2,
                                  letterSpacing: 0.3,
                                }}
                              >
                                Datos de contacto
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1.5,
                                }}
                              >
                                {/* Phone Input */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    bgcolor: "#f0f7ff",
                                    border: "1.5px solid #bbdefb",
                                    borderRadius: "12px",
                                    px: 1.5,
                                    py: 0.5,
                                    transition: "all 0.2s",
                                    "&:focus-within": {
                                      border: "1.5px solid #1976d2",
                                      bgcolor: "#fff",
                                      boxShadow:
                                        "0 0 0 3px rgba(25,118,210,0.1)",
                                    },
                                  }}
                                >
                                  <PhoneIcon
                                    sx={{
                                      color: "#1976d2",
                                      fontSize: 18,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.65rem",
                                        color: "#1976d2",
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                        userSelect: "none",
                                      }}
                                    >
                                      Número de teléfono
                                    </Typography>
                                    <Box
                                      component="input"
                                      value={phoneNumber}
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                      ) => setPhoneNumber(e.target.value)}
                                      sx={{
                                        width: "100%",
                                        border: "none",
                                        outline: "none",
                                        background: "transparent",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#1e293b",
                                        fontFamily: "inherit",
                                        lineHeight: 1.6,
                                      }}
                                    />
                                  </Box>
                                </Box>
                                {/* Email Input */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    bgcolor: "#f0f7ff",
                                    border: "1.5px solid #bbdefb",
                                    borderRadius: "12px",
                                    px: 1.5,
                                    py: 0.5,
                                    transition: "all 0.2s",
                                    "&:focus-within": {
                                      border: "1.5px solid #1976d2",
                                      bgcolor: "#fff",
                                      boxShadow:
                                        "0 0 0 3px rgba(25,118,210,0.1)",
                                    },
                                  }}
                                >
                                  <AlternateEmailIcon
                                    sx={{
                                      color: "#1976d2",
                                      fontSize: 18,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.65rem",
                                        color: "#1976d2",
                                        fontWeight: 600,
                                        lineHeight: 1.2,
                                        userSelect: "none",
                                      }}
                                    >
                                      Correo electrónico
                                    </Typography>
                                    <Box
                                      component="input"
                                      type="email"
                                      value={email}
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                      ) => setEmail(e.target.value)}
                                      sx={{
                                        width: "100%",
                                        border: "none",
                                        outline: "none",
                                        background: "transparent",
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#1e293b",
                                        fontFamily: "inherit",
                                        lineHeight: 1.6,
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* Communication Status Cards - 2x2 Grid */}
                        <Grid container spacing={2}>
                          {/* WhatsApp Card */}
                          <Grid item xs={6}>
                            <Card
                              sx={{
                                bgcolor: "#f8f9fa",
                                border: "1px solid #e0e0e0",
                                borderRadius: 2,
                                position: "relative",
                                overflow: "hidden",
                                height: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  bgcolor: "#1976d2",
                                }}
                              />
                              <CardContent
                                sx={{
                                  p: 2,
                                  pl: 3,
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <WhatsAppIcon
                                      sx={{ color: "#1976d2", fontSize: 20 }}
                                    />
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 600, color: "#1976d2" }}
                                    >
                                      WhatsApp
                                    </Typography>
                                  </Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleWhatsAppResend}
                                    disabled={
                                      !phoneNumber.trim() ||
                                      isSubmitting ||
                                      isResetting ||
                                      isResettingPin
                                    }
                                    sx={{
                                      bgcolor: "#1976d2",
                                      color: "white",
                                      fontSize: "0.75rem",
                                      px: 2,
                                      py: 0.5,
                                      minWidth: "auto",
                                      "&:hover": {
                                        bgcolor: "#115293",
                                      },
                                      "&:disabled": {
                                        bgcolor: "#ccc",
                                        color: "#666",
                                      },
                                    }}
                                  >
                                    {isSubmitting ? "Enviando..." : "Reenviar"}
                                  </Button>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.75rem",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Número:
                                  </Box>{" "}
                                  {phoneNumber || "No especificado"}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      Estado:
                                    </Box>{" "}
                                    {loadingMessagingStatus
                                      ? "Cargando..."
                                      : messagingStatus
                                        ? getStatusMessage(
                                            messagingStatus.whatsappSent,
                                            messagingStatus.whatsappMessage,
                                            "whatsapp",
                                          )
                                        : phoneNumber.trim()
                                          ? "Listo para enviar"
                                          : "Falta número de teléfono"}
                                  </Typography>
                                  {messagingStatus &&
                                    messagingStatus.whatsappSent === 0 && (
                                      <WarningIcon
                                        sx={{
                                          color: "#f57c00",
                                          fontSize: "24px",
                                          ml: 1,
                                        }}
                                      />
                                    )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>

                          {/* Email Card */}
                          <Grid item xs={6}>
                            <Card
                              sx={{
                                bgcolor: "#f8f9fa",
                                border: "1px solid #e0e0e0",
                                borderRadius: 2,
                                position: "relative",
                                overflow: "hidden",
                                height: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  bgcolor: "#1976d2",
                                }}
                              />
                              <CardContent
                                sx={{
                                  p: 2,
                                  pl: 3,
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <EmailIcon
                                      sx={{ color: "#1976d2", fontSize: 20 }}
                                    />
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 600, color: "#1976d2" }}
                                    >
                                      Email
                                    </Typography>
                                  </Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleEmailResend}
                                    disabled={
                                      !email.trim() ||
                                      isSubmitting ||
                                      isResetting ||
                                      isResettingPin
                                    }
                                    sx={{
                                      bgcolor: "#1976d2",
                                      color: "white",
                                      fontSize: "0.75rem",
                                      px: 2,
                                      py: 0.5,
                                      minWidth: "auto",
                                      "&:hover": {
                                        bgcolor: "#115293",
                                      },
                                      "&:disabled": {
                                        bgcolor: "#ccc",
                                        color: "#666",
                                      },
                                    }}
                                  >
                                    {isSubmitting ? "Enviando..." : "Reenviar"}
                                  </Button>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.75rem",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Email:
                                  </Box>{" "}
                                  {email || "No especificado"}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      Estado:
                                    </Box>{" "}
                                    {loadingMessagingStatus
                                      ? "Cargando..."
                                      : messagingStatus
                                        ? getStatusMessage(
                                            messagingStatus.emailSent,
                                            messagingStatus.emailMessage,
                                            "email",
                                          )
                                        : email.trim()
                                          ? "Listo para enviar"
                                          : "Falta correo electrónico"}
                                  </Typography>
                                  {messagingStatus &&
                                    messagingStatus.emailSent === 0 && (
                                      <WarningIcon
                                        sx={{
                                          color: "#f57c00",
                                          fontSize: "24px",
                                          ml: 1,
                                        }}
                                      />
                                    )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>

                          {/* Reset User Card */}
                          <Grid item xs={6}>
                            <Card
                              sx={{
                                bgcolor: "#f8f9fa",
                                border: "1px solid #e0e0e0",
                                borderRadius: 2,
                                position: "relative",
                                overflow: "hidden",
                                height: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 4,
                                  bgcolor: "#1976d2",
                                }}
                              />
                              <CardContent
                                sx={{
                                  p: 2,
                                  pl: 3,
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <PersonIcon
                                      sx={{ color: "#1976d2", fontSize: 20 }}
                                    />
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 600, color: "#1976d2" }}
                                    >
                                      Resetear Usuario
                                    </Typography>
                                  </Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleResetUser}
                                    disabled={
                                      !email.trim() ||
                                      isSubmitting ||
                                      isResetting ||
                                      isResettingPin
                                    }
                                    sx={{
                                      bgcolor: "#1976d2",
                                      color: "white",
                                      fontSize: "0.75rem",
                                      px: 2,
                                      py: 0.5,
                                      minWidth: "auto",
                                      "&:hover": {
                                        bgcolor: "#115293",
                                      },
                                      "&:disabled": {
                                        bgcolor: "#ccc",
                                        color: "#666",
                                      },
                                    }}
                                  >
                                    {isResetting ? "Reseteando..." : "Resetear"}
                                  </Button>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.75rem",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Email:
                                  </Box>{" "}
                                  {email || "No especificado"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  <Box
                                    component="span"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Estado:
                                  </Box>{" "}
                                  {email.trim()
                                    ? "Listo para resetear"
                                    : "Falta correo electrónico"}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>

                          {/* Reset PIN Card */}
                          {hasTTLock && (
                            <Grid item xs={6}>
                              <Card
                                sx={{
                                  bgcolor: "#f8f9fa",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 2,
                                  position: "relative",
                                  overflow: "hidden",
                                  height: "100%",
                                }}
                              >
                                <Box
                                  sx={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 4,
                                    bgcolor: "#1976d2",
                                  }}
                                />
                                <CardContent
                                  sx={{
                                    p: 2,
                                    pl: 3,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      mb: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          width: 20,
                                          height: 20,
                                          borderRadius: "50%",
                                          bgcolor: "#1976d2",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: "12px",
                                          color: "white",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        #
                                      </Box>
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontWeight: 600,
                                          color: "#1976d2",
                                        }}
                                      >
                                        Resetear PIN
                                      </Typography>
                                    </Box>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={handleResetPin}
                                      disabled={
                                        isSubmitting ||
                                        isResetting ||
                                        isResettingPin
                                      }
                                      sx={{
                                        bgcolor: "#1976d2",
                                        color: "white",
                                        fontSize: "0.75rem",
                                        px: 2,
                                        py: 0.5,
                                        minWidth: "auto",
                                        "&:hover": {
                                          bgcolor: "#115293",
                                        },
                                        "&:disabled": {
                                          bgcolor: "#ccc",
                                          color: "#666",
                                        },
                                      }}
                                    >
                                      {isResettingPin
                                        ? "Reseteando..."
                                        : "Resetear"}
                                    </Button>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: "0.75rem",
                                      mb: 0.5,
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      Huésped:
                                    </Box>{" "}
                                    {reserve.guests[0].firstName}{" "}
                                    {reserve.guests[0].lastName}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "text.secondary",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      <Box
                                        component="span"
                                        sx={{ fontWeight: 600 }}
                                      >
                                        Estado:
                                      </Box>{" "}
                                      {loadingMessagingStatus
                                        ? "Cargando..."
                                        : messagingStatus
                                          ? getStatusMessage(
                                              messagingStatus.doorPasswordSent,
                                              undefined,
                                              "pin",
                                            )
                                          : "Listo para resetear PIN"}
                                    </Typography>
                                    {messagingStatus &&
                                      messagingStatus.doorPasswordSent ===
                                        0 && (
                                        <WarningIcon
                                          sx={{
                                            color: "#f57c00",
                                            fontSize: "24px",
                                            ml: 1,
                                          }}
                                        />
                                      )}
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          )}
                        </Grid>
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "200px",
                          bgcolor: "#f8f9fa",
                          borderRadius: 1,
                          border: "1px dashed #e0e0e0",
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No hay huéspedes registrados
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                }}
              >
                <Typography color="text.secondary">
                  No se encontró la reserva
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Success Portal Snackbar */}
      <Portal>
        {successOpen && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 200000,
              maxWidth: 360,
            }}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setSuccessOpen(false)}
              sx={{ width: "100%" }}
            >
              {successMessage}
            </Alert>
          </Box>
        )}
      </Portal>

      {/* Guest Detail Modal */}
      <GuestDetailModal
        open={isGuestDetailModalOpen}
        onClose={handleGuestDetailClose}
        guest={selectedGuest}
        reserveInfo={
          reserve
            ? {
                campName: reserve.campName,
                checkIn: reserve.checkIn,
                checkOut: reserve.checkOut,
                roomNumber: reserve.roomNumber,
                doorPassword: reserve.guests?.[0]?.doorPassword,
                guid: reserve.guid,
                roomId: reserve.roomId,
              }
            : undefined
        }
        onRefreshData={fetchData}
      />

      {/* Error Portal Snackbar */}
      <Portal>
        {errorOpen && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 200000,
              maxWidth: 360,
            }}
          >
            <Alert
              severity="error"
              variant="filled"
              onClose={() => setErrorOpen(false)}
              sx={{ width: "100%" }}
            >
              {errorMessage}
            </Alert>
          </Box>
        )}
      </Portal>

      {/* Guest Reservation Modal */}
      <GuestReservationModal
        open={isAddGuestModalOpen}
        onClose={handleAddGuestClose}
        onSuccess={handleGuestSuccess}
        reservationData={reserve}
      />

      {/* Confirmation Dialog for User Reset */}
      <Dialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
      >
        <DialogTitle>¿Estás seguro de resetear al usuario?</DialogTitle>
        <DialogContent>
          <Typography>
            Se reseteará el acceso del usuario{" "}
            <strong>
              {reserve?.guests?.[0]?.firstName} {reserve?.guests?.[0]?.lastName}
            </strong>{" "}
            con el correo <strong>{email}</strong>.<br />
            El acceso a la aplicación será con este correo y se le reseteará la
            contraseña.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmResetOpen(false)}
            color="inherit"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReset}
            color="warning"
            variant="contained"
            autoFocus
          >
            Sí, resetear usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal for Cancel Reservation */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancelar reserva"
        message={
          reserve
            ? `¿Estás seguro que deseas cancelar la reserva de "${reserve.guests?.[0]?.firstName} ${reserve.guests?.[0]?.lastName}"?`
            : ""
        }
        type="delete"
      />

      {/* Room Detail Sidebar */}
      <RoomDetailSidebar
        open={isRoomSidebarOpen}
        onClose={handleRoomSidebarClose}
        roomId={selectedRoomId}
        onGoBackToReserve={handleGoBackToReserve}
        reserveId={reserveId}
      />
    </>
  );
};

export default ReserveDetailSidebar;
