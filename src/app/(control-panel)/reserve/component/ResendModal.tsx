import React, { useState, useEffect } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Grid } from "@mui/material"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import EmailIcon from "@mui/icons-material/Email"
import { useSnackbar } from "notistack"
import useUser from "@auth/useUser"
import { Guest } from "../models/ReserveDetailResponse"
import { resendMessaging, resetPinTtlock } from "../reserveService"

interface ResendModalProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
    guest: Guest | null
    reserveInfo?: {
        campName: string
        checkIn: string
        checkOut: string
        roomNumber: string
        doorPassword?: string
        guid: string
        roomId: number
    }
}

const ResendModal: React.FC<ResendModalProps> = ({ open, onClose, onSuccess, guest, reserveInfo }) => {
    const { enqueueSnackbar } = useSnackbar()
    const { data: user } = useUser()
    const hasTTLock = user?.modules?.ttlock === true
    const [phoneNumber, setPhoneNumber] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [isResettingPin, setIsResettingPin] = useState(false)
    const [confirmResetOpen, setConfirmResetOpen] = useState(false)

    useEffect(() => {
        if (guest) {
            setPhoneNumber(guest.mobileNumber || "")
            setEmail(guest.email || "")
        }
    }, [guest])

    const handleWhatsAppResend = async () => {
        if (!guest || !phoneNumber.trim()) {
            enqueueSnackbar("Faltan datos para el reenvío por WhatsApp", { variant: "error" })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await resendMessaging({
                reservationGuestId: guest.id,
                messageType: 1,
                phoneNumber: phoneNumber.trim(),
            })

            if (response.succeeded) {
                enqueueSnackbar("Mensaje de WhatsApp reenviado exitosamente", { variant: "success" })
                // Actualizar usuario con nuevo teléfono
                const updateResult = await import("../reserveService").then((mod) => mod.updateUserInfo(guest.rutVatId, { PhoneNumber: phoneNumber.trim() }))
                if (!updateResult.succeeded) {
                    enqueueSnackbar("No se pudo actualizar el teléfono del usuario", { variant: "warning" })
                }
                // No llamar a onSuccess para evitar que el modal se cierre
            } else {
                const errorMessage = response.message?.length > 0 ? response.message.join(", ") : "Error al reenviar mensaje por WhatsApp"
                enqueueSnackbar(errorMessage, { variant: "error" })
            }
        } catch (error) {
            console.error("Error resending WhatsApp:", error)
            enqueueSnackbar("Error al reenviar mensaje por WhatsApp", { variant: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEmailResend = async () => {
        if (!guest || !email.trim()) {
            enqueueSnackbar("Faltan datos para el reenvío por email", { variant: "error" })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await resendMessaging({
                reservationGuestId: guest.id,
                messageType: 3,
                email: email.trim(),
            })

            if (response.succeeded) {
                enqueueSnackbar("Email reenviado exitosamente", { variant: "success" })
                // Actualizar usuario con nuevo email
                const updateResult = await import("../reserveService").then((mod) => mod.updateUserInfo(guest.rutVatId, { Email: email.trim() }))
                if (!updateResult.succeeded) {
                    enqueueSnackbar("No se pudo actualizar el correo del usuario", { variant: "warning" })
                }
            } else {
                const errorMessage = response.message?.length > 0 ? response.message.join(", ") : "Error al reenviar email"
                enqueueSnackbar(errorMessage, { variant: "error" })
            }
        } catch (error) {
            console.error("Error resending email:", error)
            enqueueSnackbar("Error al reenviar email", { variant: "error" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
        onSuccess()
    }

    const handleResetUser = () => {
        if (!email.trim()) {
            enqueueSnackbar("Falta el correo electrónico para resetear usuario", { variant: "error" })
            return
        }
        setConfirmResetOpen(true)
    }

    const handleConfirmReset = async () => {
        setConfirmResetOpen(false)
        setIsResetting(true)
        try {
            const currentUrl = window.location.href
            const url = new URL(currentUrl)
            const hostname = url.hostname
            const port = url.port
            const tenant = port ? `${hostname}:${port}` : hostname
            const response = await import("../reserveService").then((mod) => mod.resetUserPassword(email.trim(), tenant))
            if (response.succeeded) {
                enqueueSnackbar("Usuario reseteado y correo enviado exitosamente", { variant: "success" })
                if (guest) {
                    const updateResult = await import("../reserveService").then((mod) => mod.updateUserInfo(guest.rutVatId, { Email: email.trim() }))
                    if (!updateResult.succeeded) {
                        enqueueSnackbar("No se pudo actualizar el correo del usuario", { variant: "warning" })
                    }
                }
            } else {
                const errorMessage = response.message && response.message.length > 0 ? response.message.join(", ") : "Error al resetear usuario"
                enqueueSnackbar(errorMessage, { variant: "error" })
            }
        } catch (error) {
            console.error("Error resetting user:", error)
            enqueueSnackbar("Error al resetear usuario", { variant: "error" })
        } finally {
            setIsResetting(false)
        }
    }

    const handleResetPin = async () => {
        if (!guest) {
            enqueueSnackbar("No hay información del huésped", { variant: "error" })
            return
        }

        setIsResettingPin(true)
        try {
            const response = await resetPinTtlock(guest.id)
            if (response.succeeded) {
                enqueueSnackbar("PIN reseteado exitosamente", { variant: "success" })
            } else {
                const errorMessage = response.message && response.message.length > 0 ? response.message.join(", ") : "Error al resetear PIN"
                enqueueSnackbar(errorMessage, { variant: "error" })
            }
        } catch (error) {
            console.error("Error resetting PIN:", error)
            enqueueSnackbar("Error al resetear PIN", { variant: "error" })
        } finally {
            setIsResettingPin(false)
        }
    }

    if (!guest) return null

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, fontSize: "1.2rem", pb: 2 }}>
                    Reenviar información - {guest.firstName} {guest.lastName}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Puedes editar los datos de contacto antes de reenviar la información
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Información del huésped
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Nombre:</strong> {guest.firstName} {guest.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>RUT/ID:</strong> {guest.rutVatId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    <strong>Cargo:</strong> {guest.jobTitle}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField fullWidth label="Número de teléfono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} variant="outlined" size="small" />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField fullWidth label="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" size="small" type="email" />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 2, flexDirection: "column" }}>
                    <Box sx={{ display: "flex", gap: 2, width: "100%", flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            onClick={handleWhatsAppResend}
                            startIcon={<WhatsAppIcon />}
                            disabled={!phoneNumber.trim() || isSubmitting || isResetting || isResettingPin}
                            sx={{
                                flex: 1,
                                minWidth: 150,
                                backgroundColor: "#25D366",
                                "&:hover": {
                                    backgroundColor: "#1DA851",
                                },
                            }}
                        >
                            {isSubmitting ? "Enviando..." : "Reenviar WhatsApp"}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleEmailResend}
                            startIcon={<EmailIcon />}
                            disabled={!email.trim() || isSubmitting || isResetting || isResettingPin}
                            sx={{
                                flex: 1,
                                minWidth: 150,
                                backgroundColor: "#1976d2",
                                "&:hover": {
                                    backgroundColor: "#115293",
                                },
                            }}
                        >
                            {isSubmitting ? "Enviando..." : "Reenviar Correo"}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleResetUser}
                            disabled={!email.trim() || isSubmitting || isResetting || isResettingPin}
                            sx={{
                                flex: 1,
                                minWidth: 150,
                                backgroundColor: "#ff9800",
                                color: "#fff",
                                "&:hover": {
                                    backgroundColor: "#f57c00",
                                },
                            }}
                        >
                            {isResetting ? "Reseteando..." : "Resetear Usuario"}
                        </Button>
                        {hasTTLock && (
                            <Button
                                variant="contained"
                                onClick={handleResetPin}
                                disabled={isSubmitting || isResetting || isResettingPin}
                                sx={{
                                    flex: 1,
                                    minWidth: 150,
                                    backgroundColor: "#e91e63",
                                    color: "#fff",
                                    "&:hover": {
                                        backgroundColor: "#c2185b",
                                    },
                                }}
                            >
                                {isResettingPin ? "Reseteando..." : "Resetear PIN"}
                            </Button>
                        )}
                    </Box>
                    <Button onClick={handleClose} variant="outlined" color="inherit" disabled={isSubmitting} sx={{ width: "100%", bgcolor: "#F5F7FA" }}>
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={confirmResetOpen} onClose={() => setConfirmResetOpen(false)}>
                <DialogTitle>¿Estás seguro de resetear al usuario?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Se reseteará el acceso del usuario{" "}
                        <strong>
                            {guest?.firstName} {guest?.lastName}
                        </strong>{" "}
                        con el correo <strong>{email}</strong>.<br />
                        El acceso a la aplicación será con este correo y se le reseteará la contraseña.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmResetOpen(false)} color="inherit" variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmReset} color="warning" variant="contained" autoFocus>
                        Sí, resetear usuario
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ResendModal
