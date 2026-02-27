import React, { useEffect, useState } from 'react';
import { Modal, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReserveDetailCard from './ReserveDetailCard';
import GuestTable from './GuestTable';
import GuestReservationModal from './GuestReservationModal';
import { getReserveById, deleteReservationGuest } from '../reserveService';
import { ReserveDetailResponse, Guest } from '../models/ReserveDetailResponse';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

interface ReserveDetailModalProps {
    open: boolean;
    onClose: () => void;
    reserveId: number | null;
}

const ReserveDetailModal: React.FC<ReserveDetailModalProps> = ({ open, onClose, reserveId }) => {
    const { authState } = useAuth();
    const [reserve, setReserve] = useState<ReserveDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);

    const isSentryAdmin = authState.user?.role === 'Sentry_Admin';

    const fetchData = async () => {
        if (!reserveId) return;
        setLoading(true);
        try {
            const response = await getReserveById(reserveId);
            if (response.succeeded) {
                setReserve(response.data);
            } else {
                setReserve(null);
            }
        } catch (e) {
            setReserve(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && reserveId) {
            fetchData();
        }
    }, [open, reserveId]);

    const handleAddGuestClick = () => {
        setIsAddGuestModalOpen(true);
    };

    const handleAddGuestClose = () => {
        setIsAddGuestModalOpen(false);
    };

    const handleGuestSuccess = () => {
        fetchData();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ width: '70%', maxWidth: '95vw', margin: 'auto', mt: 10, bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
                {loading ? (
                    <div>Cargando...</div>
                ) : reserve ? (
                    <>
                        <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <h2 className="text-2xl font-bold">Reserva: {reserve.guid} - {reserve.companyName}</h2>
                        </Box>
                        <ReserveDetailCard reserve={reserve} fetchData={fetchData} isModal={true} />
                        <Box mt={3}>
                            <div className="flex justify-end mb-4">
                                {/* {isSentryAdmin && reserve.guests && reserve.guests.length < reserve.beds && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddGuestClick}
                                    >
                                        Agregar huésped
                                    </Button>
                                )} */}
                            </div>
                            <GuestTable 
                                guests={reserve.guests} 
                                onRefreshData={fetchData}
                                reserveInfo={{
                                    campName: reserve.campName,
                                    checkIn: reserve.checkIn,
                                    checkOut: reserve.checkOut,
                                    roomNumber: reserve.roomNumber,
                                    doorPassword: reserve.guests?.[0]?.doorPassword,
                                    guid: reserve.guid,
                                    roomId: reserve.roomId
                                }}
                            />
                        </Box>
                    </>
                ) : (
                    <div>No se encontró la reserva</div>
                )}

                {/* Guest Modal */}
                <GuestReservationModal
                    open={isAddGuestModalOpen}
                    onClose={handleAddGuestClose}
                    onSuccess={handleGuestSuccess}
                    reservationData={reserve}
                />
            </Box>
        </Modal>
    );
};

export default ReserveDetailModal;
