import React from 'react';
import {
    Modal,
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Divider,
    Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';
import { Guest } from '../models/ReserveDetailResponse';
import ResendModal from './ResendModal';
import useUser from '@auth/useUser';

interface GuestDetailModalProps {
    open: boolean;
    onClose: () => void;
    guest: Guest | null;
    reserveInfo?: {
        campName: string;
        checkIn: string;
        checkOut: string;
        roomNumber: string;
        doorPassword?: string;
        guid: string;
        roomId: number;
    };
    onRefreshData?: () => void;
}

const GuestDetailModal: React.FC<GuestDetailModalProps> = ({ 
    open, 
    onClose, 
    guest, 
    reserveInfo,
    onRefreshData 
}) => {
    const { data: user } = useUser();
    const isSentryAdmin = user?.role === 'Sentry_Admin';
    const isCompanyAdmin = user?.role === 'Company_Admin';
    const hasTTLock = user?.modules?.ttlock === true;

    const handleResendClick = () => {
        // Implementar lógica de reenvío
        console.log('Reenviar información a:', guest?.email);
    };

    if (!guest) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 600,
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'relative',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: 'white',
                        p: 3,
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                width: 48,
                                height: 48
                            }}
                        >
                            <PersonIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {guest.firstName} {guest.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Detalles del huésped
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: 'white' }}
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3 }}>
                    {/* Guest Info */}
                    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                Información Personal
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <EmailIcon sx={{ color: '#1976d2' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {guest.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <PhoneIcon sx={{ color: '#1976d2' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Teléfono
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {guest.mobileNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <BadgeIcon sx={{ color: '#1976d2' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                RUT/ID
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {guest.rutVatId}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <WorkIcon sx={{ color: '#1976d2' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Cargo
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {guest.jobTitle}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                {(isSentryAdmin || isCompanyAdmin) && hasTTLock && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LockIcon sx={{ color: '#1976d2' }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    PIN de Acceso
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {guest.doorPassword}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Reservation Info */}
                    {reserveInfo && (
                        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                                    Información de Reserva
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                bgcolor: '#1976d2' 
                                            }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Campamento
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {reserveInfo.campName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                bgcolor: '#1976d2' 
                                            }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Habitación
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {reserveInfo.roomNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                bgcolor: '#1976d2' 
                                            }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Check In
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {reserveInfo.checkIn}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                bgcolor: '#1976d2' 
                                            }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Check Out
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {reserveInfo.checkOut}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <IconButton
                            onClick={handleResendClick}
                            sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#1565c0'
                                },
                                px: 3,
                                py: 1
                            }}
                        >
                            <SendIcon sx={{ mr: 1 }} />
                            <Typography variant="body2">Reenviar Información</Typography>
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default GuestDetailModal; 