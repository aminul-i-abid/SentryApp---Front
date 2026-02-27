import React, { useEffect, useState } from 'react';
import {
    Drawer,
    Box,
    Button,
    IconButton,
    Typography,
    Divider,
    Card,
    CardContent,
    Avatar,
    Chip,
    TextField,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Alert,
    Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery6BarIcon from '@mui/icons-material/Battery6Bar';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';
import Battery2BarIcon from '@mui/icons-material/Battery2Bar';
import Battery0BarIcon from '@mui/icons-material/Battery0Bar';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getRoomById, updateRoomDisabledStatus, getRoomCompanyHistory, getRoomDisabledHistory, createRoomPinUnique, getLastPinUnique, getPinUniqueHistory, getRoomIncidents, updateRoomIncident, unlockRoom } from '../roomService';
import AddPinModal from './AddPinModal';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { getLastReservationsByRoom } from '../../reserve/reserveService';
import { getRoomData, getRoomTTLockId } from '../../badge/badgeService';
import { RoomResponse } from '../models/RoomResponse';
import { getLockRecordTypeTranslation } from '../models/LockRecordTypes';
import { getRecordTypeStrTranslation } from '../models/RecordTypeStr';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { useSnackbar } from 'notistack';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';

interface RoomDetailSidebarProps {
    open: boolean;
    onClose: () => void;
    roomId: number | null;
    onRefreshData?: () => void;
    onGoBackToReserve?: (reserveId: number) => void;
    reserveId?: number | null;
}

const RoomDetailSidebar: React.FC<RoomDetailSidebarProps> = ({ open, onClose, roomId, onRefreshData, onGoBackToReserve, reserveId }) => {
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
    const [lastPinUnique, setLastPinUnique] = useState<string | null>(null);
    const [pinUniqueHistory, setPinUniqueHistory] = useState<any[]>([]);
    const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
    const [incidentComments, setIncidentComments] = useState('');
    const [resolvingIncident, setResolvingIncident] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [unlockAlert, setUnlockAlert] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ 
        show: false, 
        type: 'success', 
        message: '' 
    });

    const isSentryAdmin = authState.user?.role === 'Sentry_Admin';
    const isCompanyAdmin = authState.user?.role === 'Company_Admin';

    // Helper function to safely format dates (only date, no time)
    const formatDateSafely = (dateString: string | null | undefined): string => {
        if (!dateString) return 'Fecha inválida';
        // Si el string es un número (timestamp), conviértelo a número
        let parsed: number;
        if (/^\d+$/.test(dateString.trim())) {
            parsed = Number(dateString);
        } else {
            parsed = Date.parse(dateString);
        }
        if (isNaN(parsed)) return 'Fecha inválida';
        try {
            const date = new Date(parsed);
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const handleIncidentIconClick = (incident: any) => {
        setSelectedIncident(incident);
        setIncidentComments(incident?.commentsResolution ?? '');
        setIncidentDialogOpen(true);
    };

    const handleCloseIncidentDialog = () => {
        setIncidentDialogOpen(false);
        setSelectedIncident(null);
        setIncidentComments('');
        setResolvingIncident(false);
    };

    const handleResolveIncident = async () => {
        if (!selectedIncident || !roomId) return;
        setResolvingIncident(true);
        try {
            const payload = {
                id: selectedIncident.id,
                status: 1,
                commentsResolution: incidentComments.trim() ? incidentComments.trim() : null
            };
            const result = await updateRoomIncident(selectedIncident.id, payload);
            if (result.succeeded) {
                enqueueSnackbar('Problema actualizado correctamente', { variant: 'success' });
                await refreshIncidents(roomId);
                handleCloseIncidentDialog();
                if (onRefreshData) onRefreshData();
            } else {
                enqueueSnackbar(result.errors?.[0] || 'Error al actualizar el problema', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Error al actualizar el problema', { variant: 'error' });
        } finally {
            setResolvingIncident(false);
        }
    };

    const handleUnlockRoom = async () => {
        if (!roomId) return;
        setIsUnlocking(true);
        setUnlockAlert({ show: false, type: 'success', message: '' });
        try {
            const result = await unlockRoom(roomId);
            console.log('Unlock result:', result);
            if (result.succeeded) {
                setUnlockAlert({ 
                    show: true, 
                    type: 'success', 
                    message: 'Puerta desbloqueada exitosamente' 
                });
                setTimeout(() => {
                    setUnlockAlert({ show: false, type: 'success', message: '' });
                }, 5000);
            } else {
                const errorMessage = result.messages?.[0] || result.errors?.[0] || 'Error al desbloquear la puerta';
                setUnlockAlert({ 
                    show: true, 
                    type: 'error', 
                    message: errorMessage 
                });
                setTimeout(() => {
                    setUnlockAlert({ show: false, type: 'error', message: '' });
                }, 8000);
            }
        } catch (error) {
            console.error('Unlock error:', error);
            setUnlockAlert({ 
                show: true, 
                type: 'error', 
                message: 'Error al desbloquear la puerta' 
            });
            setTimeout(() => {
                setUnlockAlert({ show: false, type: 'error', message: '' });
            }, 8000);
        } finally {
            setIsUnlocking(false);
        }
    };

    // Helper function to format date and time from milliseconds
    const formatDateTimeFromMs = (milliseconds: number | null | undefined): string => {
        if (!milliseconds) return 'Fecha inválida';
        try {
            const date = new Date(milliseconds);
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return `${dateStr} ${timeStr}`;
        } catch (error) {
            return 'Fecha inválida';
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

    // Helper function to get battery icon based on level
    const getBatteryIcon = (level: number | null | undefined) => {
        if (!level || level <= 0) return <Battery0BarIcon sx={{ fontSize: '0.8rem' }} />;
        if (level <= 20) return <Battery2BarIcon sx={{ fontSize: '0.8rem' }} />;
        if (level <= 40) return <Battery4BarIcon sx={{ fontSize: '0.8rem' }} />;
        if (level <= 60) return <Battery6BarIcon sx={{ fontSize: '0.8rem' }} />;
        return <BatteryFullIcon sx={{ fontSize: '0.8rem' }} />;
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
                const lastReservationsResponse = await getLastReservationsByRoom(roomId);
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
                enqueueSnackbar("Error al cargar la información de la habitación", { variant: "error" });
            }
        } catch (e) {
            setRoom(null);
            enqueueSnackbar("Error al cargar la información de la habitación", { variant: "error" });
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
            const response = await updateRoomDisabledStatus(room.id, action, disableComments);
            if (response.succeeded) {
                enqueueSnackbar(
                    room.disabled ? "Habitación habilitada exitosamente" : "Habitación deshabilitada exitosamente",
                    { variant: "success" }
                );
                // Refresh all data including history
                fetchData();
                if (onRefreshData) {
                    onRefreshData();
                }
            } else {
                const errorMessage = response.errors?.join(", ") || "Error al actualizar el estado de la habitación";
                enqueueSnackbar(errorMessage, { variant: "error" });
            }
        } catch (error) {
            console.error("Error updating room status:", error);
            enqueueSnackbar("Error al actualizar el estado de la habitación", { variant: "error" });
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
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                sx={{
                    zIndex: 1200,
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: '70vw', md: '70vw' },
                        maxWidth: '1000px',
                        boxShadow: '-4px 0 8px rgba(0,0,0,0.1)',
                        bgcolor: '#f5f5f5',
                    },
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{
                        background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)',
                        color: 'black',
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {onGoBackToReserve && reserveId && (
                                <IconButton
                                    onClick={handleGoBackToReserve}
                                    size="small"
                                    sx={{
                                        color: 'black',
                                        '&:hover': {
                                            bgcolor: 'rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            )}
                            <Box>
                                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                    Habitación {room?.roomNumber}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                color: 'black',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2
                    }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                <Typography>Cargando...</Typography>
                            </Box>
                        ) : room ? (
                            <>
                                {/* Two-column layout */}
                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                                    {/* Left Column - Room Information */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        {/* Card - Información de la Habitación */}
                                        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white' }}>
                                            <CardContent>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    pl: 2,
                                                    mb: 2
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                        Información de la Habitación
                                                    </Typography>
                                                </Box>

                                                {/* Alert notification for unlock status */}
                                                <Collapse in={unlockAlert.show}>
                                                    <Alert 
                                                        severity={unlockAlert.type} 
                                                        onClose={() => setUnlockAlert({ show: false, type: 'success', message: '' })}
                                                        sx={{ mx: 2, mb: 2 }}
                                                    >
                                                        {unlockAlert.message}
                                                    </Alert>
                                                </Collapse>

                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 2,
                                                    p: 2,
                                                    bgcolor: 'white',
                                                    borderRadius: 2
                                                }}>
                                                    {/* Information section */}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', gap: 4, mb: 2, flexWrap: 'wrap' }}>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                    Número de habitación
                                                                </Typography>
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                        color: '#1976d2',
                                                                    }}
                                                                >
                                                                    {room.roomNumber}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                    Cantidad de camas
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                    {room.beds}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 11, mb: 2, flexWrap: 'wrap' }}>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                    Campamento
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                    {room.company.name || 'No disponible'}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                    Bloque
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                    {room.block.name}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                    Piso
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                    {room.floorNumber}
                                                                </Typography>
                                                            </Box>
                                                            {isSentryAdmin && hasTTLock && (
                                                                <Button
                                                                    variant="contained"
                                                                    color="primary"
                                                                    size="small"
                                                                    onClick={() => setIsAddPinOpen(true)}
                                                                    sx={{ textTransform: 'none', fontWeight: 600, height: '32px' }}
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
                                                                    startIcon={isUnlocking ? <CircularProgress size={16} color="inherit" /> : undefined}
                                                                    sx={{ textTransform: 'none', fontWeight: 600, height: '32px' }}
                                                                >
                                                                    {isUnlocking ? 'Desbloqueando...' : 'Apertura Remota'}
                                                                </Button>
                                                            )}
                                                            {lastPinUnique && hasTTLock && (
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                        PIN único
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                        {lastPinUnique}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        {/* Card - Últimas reservas */}
                                        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white' }}>
                                            <CardContent>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    pl: 2
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                        Últimas reservas
                                                    </Typography>
                                                </Box>

                                                {lastReservations && lastReservations.length > 0 ? (
                                                    <Box sx={{ mt: 2 }}>
                                                        {lastReservations.map((reservation, index) => (
                                                            <Box key={reservation.id || index} sx={{ mb: 2 }}>
                                                                <Card sx={{
                                                                    bgcolor: '#f8f9fa',
                                                                    border: '1px solid #e0e0e0',
                                                                    borderRadius: 2,
                                                                    position: 'relative',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        left: 0,
                                                                        top: 0,
                                                                        bottom: 0,
                                                                        width: 4,
                                                                        bgcolor: '#1976d2'
                                                                    }} />
                                                                    <CardContent sx={{ p: 2, pl: 3, display: 'flex', flexDirection: 'column' }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <Box sx={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: '#1976d2',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '12px',
                                                                                    color: 'white',
                                                                                    fontWeight: 'bold'
                                                                                }}>
                                                                                    <PersonIcon sx={{ fontSize: '12px', color: 'white' }} />
                                                                                </Box>
                                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                                    Reserva #{reservation.id}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        
                                                                        {/* Dos columnas para los datos de la reserva */}
                                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                                            {/* Columna izquierda */}
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                                                                                    <Box component="span" sx={{ fontWeight: 600 }}>Huésped:</Box> {reservation.guestName || 'Sin nombre'}
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                                                                                    <Box component="span" sx={{ fontWeight: 600 }}>Check-in:</Box> {formatDateSafely(reservation.checkIn)}
                                                                                </Typography>
                                                                            </Box>
                                                                            
                                                                            {/* Columna derecha */}
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                                                                                    <Box component="span" sx={{ fontWeight: 600 }}>Check-out:</Box> {formatDateSafely(reservation.checkOut)}
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                                                    <Box component="span" sx={{ fontWeight: 600 }}>Estado:</Box> {reservation.status === 0 ? 'Activa' : 'Completada'}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            No hay reservas registradas para esta habitación
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Card - Historial de cambios de contratista */}
                                        {isSentryAdmin && companyHistory && companyHistory.length > 0 && (
                                            <Card sx={{ borderRadius: 2, mt: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white' }}>
                                                <CardContent>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        pl: 2
                                                    }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                            Historial de cambios de contratista
                                                        </Typography>
                                                    </Box>

                                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                                        {companyHistory.map((history, index) => (
                                                            <Grid item xs={12} key={index}>
                                                                <Card sx={{
                                                                    bgcolor: '#f8f9fa',
                                                                    border: '1px solid #e0e0e0',
                                                                    borderRadius: 2,
                                                                    position: 'relative',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        left: 0,
                                                                        top: 0,
                                                                        bottom: 0,
                                                                        width: 4,
                                                                        bgcolor: '#1976d2' // Siempre azul para contratista
                                                                    }} />
                                                                    <CardContent sx={{ p: 2, pl: 3, display: 'flex', flexDirection: 'column' }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <Box sx={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: '#1976d2',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '12px',
                                                                                    color: 'white',
                                                                                    fontWeight: 'bold'
                                                                                }}>
                                                                                    <BusinessIcon sx={{ fontSize: '12px', color: 'white' }} />
                                                                                </Box>
                                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                                    {history.companyName || 'Contratista no especificado'}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                                                                            <Box component="span" sx={{ fontWeight: 600 }}>Fecha:</Box> {formatDateSafely(history.date)}
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                                            <Box component="span" sx={{ fontWeight: 600 }}>Comentario:</Box> {history.comments || 'Sin comentarios'}
                                                                        </Typography>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Box>

                                    {/* Right Column - Lock Information */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        {/* Card - Información de cerradura */}
                                        {isSentryAdmin && hasTTLock && (
                                            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white' }}>
                                                <CardContent>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        pl: 2
                                                    }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                            Información de cerradura
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 2,
                                                        p: 2,
                                                        bgcolor: 'white',
                                                        borderRadius: 2
                                                    }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', gap: 17, mb: 3, flexWrap: 'wrap' }}>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                        ID TTLock
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                        {roomData?.doorLock.ttlockId || 'No configurado'}
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                                        PIN Admin
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                        {roomData?.pinAdmin || 'No configurado'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>

                                                                <Box sx={{
                                                                    bgcolor: roomData?.hasGateway == 1 ? '#e8f5e8' : '#ffebee',
                                                                    color: roomData?.hasGateway == 1 ? '#4caf50' : '#f44336',
                                                                    px: 2,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 500,
                                                                    height: '30px'
                                                                }}>
                                                                    {roomData?.hasGateway == 1 ? 'Gateway conectado' : 'Sin gateway'}
                                                                </Box>
                                                                <Box sx={{
                                                                    bgcolor: roomData?.doorLock.id > 0 ? '#e8f5e8' : '#ffebee',
                                                                    color: roomData?.doorLock.id > 0 ? '#4caf50' : '#f44336',
                                                                    px: 2,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 500,
                                                                    height: '30px'
                                                                }}>
                                                                    {roomData?.doorLock.id > 0 ? 'Cerradura instalada' : 'Sin cerradura'}
                                                                </Box>
                                                            </Box>

                                                            {/* TTLock Records Cards */}
                                                            {ttlockId && ttlockId.length > 0 && (
                                                                <Box sx={{ mt: 3 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1.5, fontSize: '0.875rem' }}>
                                                                        Actividad de la cerradura
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                        {(showAllLockActivity ? ttlockId : ttlockId.slice(0, 3)).map((record: any, index: number) => (
                                                                            <Card key={index} sx={{
                                                                                bgcolor: '#f8f9fa',
                                                                                border: '1px solid #e0e0e0',
                                                                                borderRadius: 1.5,
                                                                                position: 'relative',
                                                                                overflow: 'hidden',
                                                                                transition: 'all 0.2s ease',
                                                                                '&:hover': {
                                                                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
                                                                                }
                                                                            }}>
                                                                                <Box sx={{
                                                                                    position: 'absolute',
                                                                                    left: 0,
                                                                                    top: 0,
                                                                                    bottom: 0,
                                                                                    width: 3,
                                                                                    bgcolor: '#1976d2'
                                                                                }} />
                                                                                <CardContent sx={{ p: 1.5, pl: 2 }}>
                                                                                    {/* Header with main info */}
                                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                            <Box sx={{
                                                                                                width: 16,
                                                                                                height: 16,
                                                                                                borderRadius: '50%',
                                                                                                bgcolor: '#1976d2',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'center',
                                                                                                fontSize: '10px',
                                                                                                color: 'white',
                                                                                                fontWeight: 'bold'
                                                                                            }}>
                                                                                                <LockIcon sx={{ fontSize: '10px', color: 'white' }} />
                                                                                            </Box>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.8rem' }}>
                                                                                                {getRecordTypeStrTranslation(record.recordTypeStr) || 'Sin tipo'}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    {hasTTLock && (
                                                                                        <Chip
                                                                                            icon={getBatteryIcon(record.electricQuantity)}
                                                                                            label={record.electricQuantity ? `${record.electricQuantity}%` : 'Sin batería'}
                                                                                            size="small"
                                                                                            sx={{
                                                                                                height: 20,
                                                                                                fontSize: '0.7rem',
                                                                                                bgcolor: record.electricQuantity > 20 ? '#e8f5e8' : '#ffebee',
                                                                                                color: record.electricQuantity > 20 ? '#4caf50' : '#f44336',
                                                                                                fontWeight: 600,
                                                                                                '& .MuiChip-icon': {
                                                                                                    color: record.electricQuantity > 20 ? '#4caf50' : '#f44336',
                                                                                                    fontSize: '0.8rem'
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                        <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                                                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                                                                                                Usuario
                                                                                            </Typography>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: '#333', lineHeight: 1.2 }}>
                                                                                                {record.username || 'N/A'}
                                                                                            </Typography>
                                                                                        </Box>

                                                                                        <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                                                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                                                                                                Fecha
                                                                                            </Typography>
                                                                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: '#333', lineHeight: 1.2 }}>
                                                                                                {formatDateTimeFromMs(record.lockDate)}
                                                                                            </Typography>
                                                                                        </Box>

                                                                                        {record.recordTypeFromLockStr && (
                                                                                            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                                                                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                                                                                                    Origen
                                                                                                </Typography>
                                                                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: '#333', lineHeight: 1.2 }}>
                                                                                                    {getLockRecordTypeTranslation(record.recordTypeFromLockStr)}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        )}

                                                                                        {record.recordType === 4 && record.keyboardPwd && (
                                                                                            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                                                                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                                                                                                    Contraseña
                                                                                                </Typography>
                                                                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: '#333', lineHeight: 1.2 }}>
                                                                                                    {record.keyboardPwd}
                                                                                                </Typography>
                                                                                            </Box>
                                                                                        )}
                                                                                    </Box>
                                                                                </CardContent>
                                                                            </Card>
                                                                        ))}
                                                                        
                                                                        {/* Show More/Less Button */}
                                                                        {ttlockId.length > 3 && (
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    onClick={() => setShowAllLockActivity(!showAllLockActivity)}
                                                                                    sx={{
                                                                                        color: '#1976d2',
                                                                                        borderColor: '#1976d2',
                                                                                        '&:hover': {
                                                                                            borderColor: '#1565c0',
                                                                                            bgcolor: 'rgba(25, 118, 210, 0.04)'
                                                                                        },
                                                                                        fontSize: '0.75rem',
                                                                                        px: 2,
                                                                                        py: 0.5
                                                                                    }}
                                                                                >
                                                                                    {showAllLockActivity ? 'Ver menos' : `Ver más`}
                                                                                </Button>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            )}

                                                            {/* Door lock status */}
                                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Card - Historial de cambios de estado */}
                                        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white', mb: 3 }}>
                                            <CardContent>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    pl: 2,
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                        Historial de cambios de estado
                                                    </Typography>
                                                </Box>

                                                {disabledHistory && disabledHistory.length > 0 ? (
                                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                                        {disabledHistory.map((history, index) => (
                                                            <Grid item xs={12} key={index}>
                                                                <Card sx={{
                                                                    bgcolor: '#f8f9fa',
                                                                    border: '1px solid #e0e0e0',
                                                                    borderRadius: 2,
                                                                    position: 'relative',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        left: 0,
                                                                        top: 0,
                                                                        bottom: 0,
                                                                        width: 4,
                                                                        bgcolor: history.action ? '#f44336' : '#1976d2' // Rojo para deshabilitada, azul para habilitada
                                                                    }} />
                                                                    <CardContent sx={{ p: 2, pl: 3, display: 'flex', flexDirection: 'column' }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <Box sx={{
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    borderRadius: '50%',
                                                                                    bgcolor: history.action ? '#f44336' : '#1976d2',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '12px',
                                                                                    color: 'white',
                                                                                    fontWeight: 'bold'
                                                                                }}>
                                                                                    {history.action ? '✗' : '✓'}
                                                                                </Box>
                                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: history.action ? '#f44336' : '#1976d2' }}>
                                                                                    {history.action ? 'Deshabilitada' : 'Habilitada'}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                                                                            <Box component="span" sx={{ fontWeight: 600 }}>Fecha:</Box> {formatDateSafely(history.created)}
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                                            <Box component="span" sx={{ fontWeight: 600 }}>Comentario:</Box> {history.comments || 'Sin comentarios'}
                                                                        </Typography>
                                                                    </CardContent>
                                                                </Card>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : (
                                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            No hay cambios de estado registrados
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Card - Historial de pines únicos - Only show if hasTTLock */}
                                        {hasTTLock && (
                                            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white',mb:3 }}>
                                                <CardContent>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        pl: 2
                                                    }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                            Historial de pines únicos
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ mt: 2 }}>
                                                        {pinUniqueHistory && pinUniqueHistory.length > 0 ? (
                                                            pinUniqueHistory.map((pinItem, index) => (
                                                                <Box key={pinItem.id || index} sx={{ mb: 2 }}>
                                                                    <Card sx={{
                                                                        bgcolor: '#f8f9fa',
                                                                        border: '1px solid #e0e0e0',
                                                                        borderRadius: 2,
                                                                        position: 'relative',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <Box sx={{
                                                                            position: 'absolute',
                                                                            left: 0,
                                                                            top: 0,
                                                                            bottom: 0,
                                                                            width: 4,
                                                                            bgcolor: '#1976d2'
                                                                        }} />
                                                                        <CardContent sx={{ p: 2, pl: 3, display: 'flex', flexDirection: 'column' }}>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                    <Box sx={{
                                                                                        width: 20,
                                                                                        height: 20,
                                                                                        borderRadius: '50%',
                                                                                        bgcolor: '#1976d2',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        fontSize: '12px',
                                                                                        color: 'white',
                                                                                        fontWeight: 'bold'
                                                                                    }}>
                                                                                        <DialpadIcon sx={{ fontSize: '12px', color: 'white' }} />
                                                                                    </Box>
                                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                                                                        PIN: {pinItem.pin}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                            
                                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                                <Box sx={{ flex: 1 }}>
                                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 }}>
                                                                                        <Box component="span" sx={{ fontWeight: 600 }}>Nombre:</Box> {pinItem.name}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{ flex: 1 }}>
                                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                                                        <Box component="span" sx={{ fontWeight: 600 }}>Teléfono:</Box> {pinItem.phoneNumber}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Box>
                                                            ))
                                                        ) : (
                                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                    No hay pines únicos registrados para esta habitación
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Card - Problemas */}
                                        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white' }}>
                                            <CardContent>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    pl: 2
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                        Problemas
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ mt: 2 }}>
                                                    {incidents && incidents.length > 0 ? (
                                                        incidents.map((incidentItem, index) => {
                                                            const isActiveIncident = incidentItem.status === 0;
                                                            return (
                                                                <Box key={incidentItem.id || index} sx={{ mb: 2 }}>
                                                                    <Card sx={{
                                                                        bgcolor: '#f8f9fa',
                                                                        border: '1px solid #e0e0e0',
                                                                        borderRadius: 2,
                                                                        position: 'relative',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <Box sx={{
                                                                            position: 'absolute',
                                                                            left: 0,
                                                                            top: 0,
                                                                            bottom: 0,
                                                                            width: 4,
                                                                            bgcolor: isActiveIncident ? '#fb8c00' : '#1976d2'
                                                                        }} />
                                                                        <CardContent sx={{ p: 2, pl: 3, pr: 6, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                                                            <IconButton
                                                                                size="small"
                                                                                color={isActiveIncident ? 'warning' : 'success'}
                                                                                onClick={() => handleIncidentIconClick(incidentItem)}
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    right: 16,
                                                                                    transform: 'translateY(-50%)',
                                                                                    border: '1px solid',
                                                                                    borderColor: isActiveIncident ? 'warning.main' : 'success.main'
                                                                                }}
                                                                                aria-label={isActiveIncident ? 'Problema activo' : 'Problema resuelto'}
                                                                            >
                                                                                {isActiveIncident ? (
                                                                                    <FuseSvgIcon>heroicons-outline:exclamation-triangle</FuseSvgIcon>
                                                                                ) : (
                                                                                    <FuseSvgIcon>heroicons-outline:check-circle</FuseSvgIcon>
                                                                                )}
                                                                            </IconButton>
                                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isActiveIncident ? 'warning.main' : 'primary.main' }}>
                                                                                {incidentItem.title || 'Problema sin título'}
                                                                            </Typography>
                                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                                {incidentItem.description || 'Sin descripción'}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                                                                Creado: {formatDateSafely(incidentItem.created)}
                                                                            </Typography>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Box>
                                                            );
                                                        })
                                                    ) : (
                                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                No hay pines únicos registrados para esta habitación
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Box>




                            </>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                <Typography color="text.secondary">
                                    No se encontró la habitación
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Drawer>

            <Dialog open={incidentDialogOpen} onClose={handleCloseIncidentDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FuseSvgIcon>heroicons-outline:exclamation-triangle</FuseSvgIcon>
                    Detalle del problema
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedIncident?.title || 'Problema'}
                    </Typography>
                    <Typography variant="body2">
                        {selectedIncident?.description || 'Sin descripción'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Creado: {selectedIncident ? formatDateSafely(selectedIncident.created) : ''}
                    </Typography>
                    {selectedIncident?.status === 1 ? (
                        <TextField
                            label="Comentarios de resolución"
                            value={selectedIncident?.commentsResolution || ''}
                            fullWidth
                            multiline
                            minRows={3}
                            InputProps={{ readOnly: true }}
                            helperText={selectedIncident?.commentsResolution ? undefined : 'Sin comentarios registrados'}
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
                    <Button onClick={handleCloseIncidentDialog} color="inherit" disabled={resolvingIncident}>
                        {selectedIncident?.status === 1 ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {selectedIncident?.status === 0 && (
                        <Button
                            onClick={handleResolveIncident}
                            variant="contained"
                            color="primary"
                            disabled={resolvingIncident}
                        >
                            {resolvingIncident ? 'Actualizando...' : 'Marcar como resuelto'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Modal para agregar PIN */}
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
                            roomId: roomId
                        });
                        if (result.succeeded) {
                            enqueueSnackbar('PIN creado correctamente', { variant: 'success' });
                            setIsAddPinOpen(false);
                            if (onRefreshData) onRefreshData();
                        } else {
                            enqueueSnackbar(result.errors?.[0] || 'Error al crear el PIN', { variant: 'error' });
                        }
                    } catch (e) {
                        enqueueSnackbar('Error al crear el PIN', { variant: 'error' });
                    } finally {
                        setAddingPin(false);
                    }
                }}
            />
            {/* Confirmation Dialog for Room Disable/Enable */}
            <Dialog open={confirmDisableOpen} onClose={() => setConfirmDisableOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {room?.disabled ? '¿Habilitar habitación?' : '¿Deshabilitar habitación?'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        {room?.disabled
                            ? '¿Estás seguro de que deseas habilitar la habitación?'
                            : '¿Estás seguro de que deseas deshabilitar la habitación?'
                        }
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
                    <Button onClick={() => setConfirmDisableOpen(false)} color="inherit" variant="outlined">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDisable}
                        color={room?.disabled ? "success" : "error"}
                        variant="contained"
                        autoFocus
                        disabled={isDisabling}
                    >
                        {isDisabling ? "Procesando..." : (room?.disabled ? "Sí, habilitar" : "Sí, deshabilitar")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RoomDetailSidebar; 