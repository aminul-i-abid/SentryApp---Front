import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { OptionReservation } from '../enum/optionReservation';
import BulkReservationForm from './BulkReservationForm';
import IndividualReservationForm from './IndividualReservationForm';
import { Country, countries } from './CountryPhoneSelector';
import { createReserve } from '../reserveService';
import { useSnackbar } from 'notistack';
import { GuestRequest, ReservationRequest } from '../models/ReservationRequest';
import Typography from '@mui/material/Typography';
import LoadingScreen from '../../../../components/LoadingScreen';

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  rut: string;
  jobTitleId: number;
  genderId: number;
  shiftId: number;
}

export interface ReservationData {
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  comments: string;
  companyId: number;
  guests: GuestData[];
}

interface AddReservationModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: OptionReservation, data?: ReservationData, file?: File) => void;
  fetchReserves: () => void;
}

const AddReservationModal: React.FC<AddReservationModalProps> = ({ open, onClose, onAdd, fetchReserves }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<OptionReservation>(OptionReservation.BULK);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  
  // Room and reservation details
  const [companyId, setCompanyId] = useState<number>(0);
  const [roomNumber, setRoomNumber] = useState('');
  const [comments, setComments] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [sharedBooking, setSharedBooking] = useState(false);
  const [reservationType, setReservationType] = useState<'fecha' | 'turno'>('fecha');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('');

  // Guest management
  const [guests, setGuests] = useState<GuestData[]>([{
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    rut: '',
    jobTitleId: 0,
    genderId: 1,
    shiftId: 1
  }]);
  
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    countries.find(country => country.code === 'CL') || null
  );
  
  const resetForm = () => {
    setStep(1);
    setType(OptionReservation.BULK);
    setFile(null);
    setCompanyId(0);
    setRoomNumber('');
    setComments('');
    setCheckIn('');
    setCheckOut('');
    setReservationType('fecha');
    setSelectedDurationId('');
    setGuests([{
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      rut: '',
      jobTitleId: 0,
      genderId: 1,
      shiftId: 1
    }]);
    setSelectedGuest(null);
    setSelectedCountry(countries.find(country => country.code === 'CL') || null);
    setErrorMessage('');
    setShowLoadingScreen(false);
    setLoadingMessage('');
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  useEffect(() => {
    if (selectedGuest) {
      setGuests(guests => {
        const updated = [...guests];
        updated[0] = {
          ...updated[0],
          firstName: selectedGuest.firstName?.toString() || '',
          lastName: selectedGuest.lastName?.toString() || '',
          email: selectedGuest.email?.toString() || '',
          mobile: selectedGuest.phoneNumber || '',
          rut: selectedGuest.dni || '',
        };
        return updated;
      });
    }
  }, [selectedGuest]);

  const handleNext = () => {
    setStep(2);
  };

  const handleAddBulk = async () => {
    try {
      setIsBulkSubmitting(true);
      setShowLoadingScreen(true);
      setLoadingMessage('Se están generando las reservas, aguarde un instante...');
      setErrorMessage('');
      
      // Crear un objeto con los datos necesarios para la reserva masiva
      const reservationData: ReservationData = {
        roomNumber: '',
        checkIn: '',
        checkOut: '',
        comments,
        companyId,
        guests: []
      };
      
      await onAdd(type, reservationData, file || undefined);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating bulk reservation:', error);
      setErrorMessage('Error al crear la reserva masiva');
    } finally {
      setIsBulkSubmitting(false);
      setShowLoadingScreen(false);
    }
  };

  const handleAddIndividual = async () => {
    try {
      setIsSubmitting(true);
      setShowLoadingScreen(true);
      setLoadingMessage('Se está generando la reserva, aguarde un instante...');
      setErrorMessage('');
      
      const formattedGuests: GuestRequest[] = guests.map(guest => ({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        mobileNumber: (selectedCountry?.phoneCode || '+56') + guest.mobile,
        rutVatId: guest.rut,
        jobTitleId: guest.jobTitleId,
        genderId: guest.genderId,
        shiftId: guest.shiftId,
        durationId: reservationType === 'turno' && selectedDurationId ? Number(selectedDurationId) : null
      }));
      
      const reservationRequest: ReservationRequest = {
        roomNumber,
        checkIn: `${checkIn}T12:00:00.000Z`,
        checkOut: `${checkOut}T12:00:00.000Z`,
        comments,
        companyId,
        guests: formattedGuests,
        reservationType,
        sharedBooking
      };
      // Solo agregar sharedBooking si es true
      if (sharedBooking) {
        (reservationRequest as any).sharedBooking = true;
      }
      
      const response = await createReserve(reservationRequest);
      
      if (response.succeeded) {
        enqueueSnackbar('Reserva creada exitosamente', { variant: 'success' });
        
        // Convertir de vuelta para mantener compatibilidad con onAdd
        const reservationData: ReservationData = {
          roomNumber,
          checkIn: `${checkIn}T12:00:00.000Z`,
          checkOut: `${checkOut}T12:00:00.000Z`,
          comments,
          companyId,
          guests
        };
        
        onAdd(type, reservationData);
        fetchReserves();
        resetForm();
        onClose();
      } else {
        setErrorMessage(`Error al crear la reserva: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      setErrorMessage('Error al crear la reserva');
    } finally {
      setIsSubmitting(false);
      setShowLoadingScreen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBack = () => {
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddGuest = () => {
    if (guests.length < 3) {
      setGuests([
        ...guests,
        {
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          rut: '',
          jobTitleId: 0,
          genderId: 1,
          shiftId: 1
        }
      ]);
    }
  };

  const handleUpdateGuest = (index: number, field: keyof GuestData, value: string | number) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value
    };
    setGuests(updatedGuests);
  };

  const isFormValid = () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const tenDaysAgoString = tenDaysAgo.toISOString().split('T')[0];

    const isReservationDetailsValid = companyId && roomNumber && checkIn && checkOut && 
      checkIn >= tenDaysAgoString && checkOut >= checkIn && checkOut >= today;
    if (!isReservationDetailsValid) return false;

    // Check if country is selected (Chile should be selected by default)
    const currentCountry = selectedCountry || countries.find(country => country.code === 'CL');
    if (!currentCountry) return false;

    // Check if all guests have required fields
    return guests.every(guest => {
      if (!guest.firstName || !guest.lastName || !guest.rut || 
          !guest.jobTitleId || !guest.genderId || !guest.shiftId) {
        return false;
      }

      // Email: optional, but if present, must be valid
      if (guest.email && guest.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guest.email)) return false;
      }

      // Phone: optional, but if present, must be valid
      if (!guest.mobile) return false;
      if (guest.mobile && guest.mobile.trim() !== '') {
        if (currentCountry?.phoneCode === '+56') {
          const digitsOnly = guest.mobile.replace(/\D/g, '');
          if (digitsOnly.length !== 9) return false;
        }
      }

      return true;
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>Agregar Reserva</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {step === 1 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Tipo de reserva</div>
            <TextField
              select
              fullWidth
              value={type}
              onChange={e => setType(e.target.value as OptionReservation)}
              variant="outlined"
              size="small"
            >
              <MenuItem value={OptionReservation.BULK}>{OptionReservation.BULK}</MenuItem>
              <MenuItem value={OptionReservation.INDIVIDUAL}>{OptionReservation.INDIVIDUAL}</MenuItem>
            </TextField>
          </div>
        )}
        {step === 2 && type === OptionReservation.BULK && (
          <BulkReservationForm
            file={file}
            companyId={companyId}
            comments={comments}
            onFileChange={handleFileChange}
            onCompanyChange={value => setCompanyId(value)}
            onCommentsChange={e => setComments(e.target.value)}
            isSubmitting={isBulkSubmitting}
          />
        )}
        {step === 2 && type === OptionReservation.INDIVIDUAL && (
          <IndividualReservationForm
            firstName={guests[0].firstName}
            lastName={guests[0].lastName}
            email={guests[0].email}
            mobile={guests[0].mobile}
            rut={guests[0].rut}
            jobTitleId={guests[0].jobTitleId}
            genderId={guests[0].genderId}
            shiftId={guests[0].shiftId}
            companyId={companyId}
            checkIn={checkIn}
            checkOut={checkOut}
            roomNumber={roomNumber}
            comments={comments}
            today={today}
            guests={guests.slice(1)}
            reservationType={reservationType}
            selectedDurationId={selectedDurationId}
            onFirstNameChange={e => handleUpdateGuest(0, 'firstName', e.target.value)}
            onLastNameChange={e => handleUpdateGuest(0, 'lastName', e.target.value)}
            onEmailChange={e => handleUpdateGuest(0, 'email', e.target.value)}
            onMobileChange={e => handleUpdateGuest(0, 'mobile', e.target.value)}
            onRutChange={e => handleUpdateGuest(0, 'rut', e.target.value)}
            onJobTitleChange={value => handleUpdateGuest(0, 'jobTitleId', value)}
            onGenderChange={value => handleUpdateGuest(0, 'genderId', value)}
            onShiftChange={value => handleUpdateGuest(0, 'shiftId', value)}
            onCompanyChange={value => setCompanyId(value)}
            onCheckInChange={e => setCheckIn(e.target.value)}
            onCheckOutChange={e => setCheckOut(e.target.value)}
            onRoomNumberChange={e => setRoomNumber(e.target.value)}
            onCommentsChange={e => setComments(e.target.value)}
            onReservationTypeChange={setReservationType}
            onDurationChange={setSelectedDurationId}
            onAddGuest={handleAddGuest}
            onUpdateGuest={handleUpdateGuest}
            maxGuests={3}
            currentGuestCount={guests.length}
            selectedGuest={selectedGuest}
            setSelectedGuest={setSelectedGuest}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            sharedBooking={sharedBooking}
            setSharedBooking={setSharedBooking}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0, flexDirection: 'column' }}>
        {errorMessage && (
          <Typography color="error" sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <div style={{ display: 'flex', width: '100%', gap: '16px' }}>
          {step === 2 ? (
            <>
              <Button onClick={handleBack} variant="outlined" color="inherit" sx={{ flex: 1, bgcolor: '#F5F7FA' }}>Atrás</Button>
              {type === OptionReservation.BULK ? (
                <Button 
                  onClick={handleAddBulk} 
                  variant="contained" 
                  color="primary" 
                  sx={{ flex: 1 }} 
                  disabled={!file || !companyId || isBulkSubmitting}
                >
                  {isBulkSubmitting ? 'Agregando...' : 'Agregar'}
                </Button>
              ) : (
                <Button
                  onClick={handleAddIndividual}
                  variant="contained"
                  color="primary"
                  sx={{ flex: 1 }}
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting ? 'Agregando...' : 'Agregar'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ flex: 1, bgcolor: '#F5F7FA' }}>Cancelar</Button>
              <Button onClick={handleNext} variant="contained" color="primary" sx={{ flex: 1 }}>Siguiente</Button>
            </>
          )}
        </div>
      </DialogActions>
      <LoadingScreen 
        open={showLoadingScreen} 
        message={loadingMessage}
        showBackdrop={true}
      />
    </Dialog>
  );
};

export default AddReservationModal;