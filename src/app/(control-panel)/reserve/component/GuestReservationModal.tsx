import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import GuestReservationForm, { GuestFormData } from './GuestReservationForm';
import { Guest } from '../models/ReserveDetailResponse';
import { createReservationGuest, updateReservationGuest } from '../reserveService';

export interface GuestReservationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
  reservationData?: {
    id: number;
    checkIn: string;
    checkOut: string;
    status: number;
    comments: string;
    companyId: number;
    companyName: string;
    roomId: number;
    roomNumber: string;
    beds: number;
    floorNumber: number;
    blockName: string;
    campName: string;
    guid: string;
  };
  guest?: any;
  isEdit?: boolean;
}

const GuestReservationModal: React.FC<GuestReservationModalProps> = ({
  open,
  onClose,
  onSuccess,
  guest,
  reservationData,
  isEdit = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestData, setGuestData] = useState<GuestFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    rutVatId: '',
    jobTitleId: 0,
    genderId: 1,
    shiftId: 0,
    durationId: null
  });

  useEffect(() => {
    if (guest && isEdit) {
      // For editing, populate form with existing guest data
      setGuestData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        mobileNumber: guest.mobileNumber,
        rutVatId: guest.rutVatId,
        // These fields need to be converted to numbers since they're stored as strings in the Guest model
        jobTitleId: typeof guest.jobTitle === 'number' ? guest.jobTitle : 0,
        genderId: typeof guest.gender === 'number' ? guest.gender : 1,
        shiftId: guest.shiftId || 0,
        durationId: guest.durationId || null
      });
    } else {
      // For creating, reset form
      setGuestData({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        rutVatId: '',
        jobTitleId: 0,
        genderId: 1,
        shiftId: 0,
        durationId: null
      });
    }
  }, [guest, isEdit, open]);

  const handleGuestDataChange = (field: keyof GuestFormData, value: string | number) => {
    setGuestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (isEdit && guest) {
        // Update existing guest
        const response = await updateReservationGuest(guest.id, guestData);
        if (response.succeeded) {
          enqueueSnackbar('Huésped actualizado exitosamente', { variant: 'success' });
          onSuccess(guestData);
          onClose();
        } else {
          enqueueSnackbar(`Error al actualizar huésped: ${response.message}`, { variant: 'error' });
        }
      } else if (reservationData) {
        // Create new guest
        const response = await createReservationGuest(reservationData.id, guestData);
        if (response.succeeded) {
          enqueueSnackbar('Huésped agregado exitosamente', { variant: 'success' });
          onSuccess();
          onClose();
        } else {
          const errorMessage = response.message?.length > 0 
            ? response.message 
            : 'Error desconocido al agregar huésped';
          enqueueSnackbar(`Error al agregar huésped: ${errorMessage}`, { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Error submitting guest data:', error);
      enqueueSnackbar('Error al procesar la solicitud', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      guestData.firstName &&
      guestData.lastName &&
      guestData.email &&
      guestData.mobileNumber &&
      guestData.rutVatId
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          bgcolor: 'white'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          fontWeight: 700, 
          fontSize: '1.2rem', 
          pb: 2,
          borderRadius: '12px 12px 0 0'
        }}
      >
        {isEdit ? 'Editar Huésped' : 'Agregar Huésped'}
      </DialogTitle>
      <DialogContent sx={{ pt: 4, bgcolor: 'white' }}>
        <GuestReservationForm
          guestData={guestData}
          onGuestDataChange={handleGuestDataChange}
          isLoading={isSubmitting}
          isEdit={isEdit}
          companyId={reservationData?.companyId ?? 0}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2, bgcolor: 'white' }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ 
            mr: 2, 
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              bgcolor: '#f8faff'
            }
          }}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0'
            },
            '&:disabled': {
              bgcolor: '#ccc'
            }
          }}
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : isEdit ? 'Actualizar' : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestReservationModal;