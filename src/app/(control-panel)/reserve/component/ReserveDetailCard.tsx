import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LayersIcon from '@mui/icons-material/Layers';
import HotelIcon from '@mui/icons-material/Hotel';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { cancelReserve, deleteReserve } from '../reserveService';
import AddReservationModal from './AddReservationModal';
import { OptionReservation } from '../enum/optionReservation';
import { ReserveDetailResponse } from '../models/ReserveDetailResponse';
import { useSnackbar } from 'notistack';

interface ReserveDetailCardProps {
    reserve: ReserveDetailResponse | null;
    fetchData: () => void;
    isModal?: boolean;
    onRoomNumberClick?: () => void;
}

function ReserveDetailCard({ reserve, fetchData, isModal = false, onRoomNumberClick }: ReserveDetailCardProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!reserve) return;
        try {
            await cancelReserve(reserve.id, { comments: 'Reserva cancelada' });
            enqueueSnackbar('La reserva se canceló correctamente', { variant: 'success' });
            fetchData();
            setIsDeleteModalOpen(false);
            window.history.back();
        } catch (error) {
            enqueueSnackbar('Algo salió mal al cancelar la reserva', { variant: 'error' });
            console.error('Error canceling reservation:', error);
        }
    };

    const handleEditSuccess = () => {
        fetchData();
    };

    const handleBackClick = () => {
        window.history.back();
    };

    const handleRoomSelectionClick = () => {
        if (onRoomNumberClick) {
            onRoomNumberClick();
        }
    };

    if (!reserve) {
        return null; // Or return a loading state or placeholder
    }

    return (
        <>
            {!isModal && (
                <div className="flex justify-between mb-4 gap-2">
                    <div>
                        <IconButton
                            sx={{
                                bgcolor: '#e0e0e0',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    bgcolor: '#bdbdbd',
                                }
                            }}
                            onClick={handleBackClick}
                        >
                            <ArrowBackIcon sx={{ color: '#1976d2' }} />
                        </IconButton>
                    </div>
                    {/*<div className="flex gap-2">
                        <IconButton
                            sx={{
                                bgcolor: '#e0e0e0',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    bgcolor: '#bdbdbd',
                                }
                            }}
                            onClick={handleDeleteClick}
                        >
                            <DeleteIcon sx={{ color: '#f44336' }} />
                        </IconButton>
                    </div>*/}
                </div>
            )}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: 'white' }}>
                <CardContent>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pl: 2 
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            Información de la Habitación
                        </Typography>
                        {onRoomNumberClick && (
                            <IconButton
                                onClick={handleRoomSelectionClick}
                                sx={{
                                    bgcolor: '#f5f5f5',
                                    width: 36,
                                    height: 36,
                                    '&:hover': {
                                        bgcolor: '#e0e0e0',
                                    }
                                }}
                                title="Seleccionar habitación"
                            >
                                <ArrowForwardIosIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                            </IconButton>
                        )}
                    </Box>
                    
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
                                            color: '#1976d2'
                                        }}
                                    >
                                        {reserve.roomNumber}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Cantidad de camas
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        {reserve.beds}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 7.5, mb: 2, flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Campamento
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        {reserve.campName}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Bloque
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        {reserve.blockName}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Piso
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                        {reserve.floorNumber}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Cancelar reserva"
                message={`¿Estás seguro que deseas cancelar la reserva de "${reserve.guests[0].firstName} ${reserve.guests[0].lastName}"?`}
                type="delete"
            />

            <AddReservationModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onAdd={(type, data) => {
                    handleEditSuccess();
                }}
                fetchReserves={fetchData}
            />
        </>
    );
}

export default ReserveDetailCard;