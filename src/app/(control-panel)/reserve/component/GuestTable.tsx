import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { Guest } from '../models/ReserveDetailResponse';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import ResendModal from './ResendModal';
import useUser from '@auth/useUser';

interface GuestTableProps {
    guests: Guest[];
    onDeleteGuest?: (guestId: number) => Promise<void>;
    onEditGuest?: (guest: Guest) => void;
    onRefreshData?: () => void;
    reserveInfo?: {
        campName: string;
        checkIn: string;
        checkOut: string;
        roomNumber: string;
        doorPassword?: string;
        guid: string;
        roomId: number;
    };
}

function GuestTable({ guests, onDeleteGuest, onEditGuest, onRefreshData, reserveInfo }: GuestTableProps) {
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResendModalOpen, setIsResendModalOpen] = useState(false);
    const { data: user } = useUser();
    
    // Verificar si el módulo TTlock está habilitado
    const hasTTLock = user?.modules?.ttlock === true;

    // If there are no additional guests (beyond the first one)
    if (guests.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">No hay huéspedes adicionales registrados.</Typography>
            </Box>
        );
    }

    const handleDeleteClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedGuest && onDeleteGuest) {
            await onDeleteGuest(selectedGuest.id);
            setIsDeleteModalOpen(false);
        }
    };

    const handleEditClick = (guest: Guest) => {
        if (onEditGuest) {
            onEditGuest(guest);
        }
    };

    const handleResendClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setIsResendModalOpen(true);
    };

    const handleResendModalClose = () => {
        setIsResendModalOpen(false);
        setSelectedGuest(null);
    };

    const handleResendSuccess = () => {
        // Refrescar los datos después de un reenvío exitoso
        if (onRefreshData) {
            onRefreshData();
        }
    };

    return (
        <>
            <div className="flex justify-between mb-5 gap-2">
                <Typography variant="h6">Huéspedes</Typography>
            </div>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { px: 1 } }}>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight="bold">Nombre</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Teléfono</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">RUT/ID</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Cargo</Typography></TableCell>
                            {hasTTLock && (
                                <TableCell><Typography fontWeight="bold">PIN</Typography></TableCell>
                            )}
                            <TableCell align="center"><Typography fontWeight="bold">Acciones</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {guests.map((guest) => (
                            <TableRow key={guest.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                                <TableCell>{guest.firstName} {guest.lastName}</TableCell>
                                <TableCell>{guest.email}</TableCell>
                                <TableCell>{guest.mobileNumber}</TableCell>
                                <TableCell>{guest.rutVatId}</TableCell>
                                <TableCell>{guest.jobTitle}</TableCell>
                                {hasTTLock && (
                                    <TableCell>{guest.doorPassword}</TableCell>
                                )}
                                <TableCell align="center">
                                    <div className="flex gap-1 justify-center">
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => handleResendClick(guest)}
                                            title="Reenviar información"
                                        >
                                            <SendIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar huésped"
                message={`¿Estás seguro que deseas eliminar al huésped ${selectedGuest?.firstName} ${selectedGuest?.lastName}?`}
                type="delete"
            />
            
            <ResendModal
                open={isResendModalOpen}
                onClose={handleResendModalClose}
                onSuccess={handleResendSuccess}
                guest={selectedGuest}
                reserveInfo={reserveInfo}
            />
        </>
    );
}

export default GuestTable; 