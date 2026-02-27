import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete, { AutocompleteInputChangeReason } from '@mui/material/Autocomplete';
import { getTags, getTagsCompany } from '@/app/(control-panel)/tag/tagService';
import { TagResponse } from '@/app/(control-panel)/tag/models/TagResponse';
import { getContractors } from '@/app/(control-panel)/contractors/contractorsService';
import { ContractorResponse } from '@/app/(control-panel)/contractors/models/ContractorResponse';
import { Button, Divider, Typography, Box, Switch, Tooltip } from '@mui/material';
import { searchByRut } from '../reserveService';
import { getAvailableRooms } from '@/app/(control-panel)/room/roomService';
import { getDurations } from '@/app/(control-panel)/Durations/durationsService';
import { DurationResponse } from '@/app/(control-panel)/Durations/models/DurationResponse';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import useUser from '@auth/useUser';
import CountryPhoneSelector, { Country, countries } from './CountryPhoneSelector';
import CompactCountryPhoneSelector from './CompactCountryPhoneSelector';


interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  rut: string;
  jobTitleId: number;
  genderId: number;
  shiftId: number;
}

interface IndividualReservationFormProps {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  rut: string;
  jobTitleId: number;
  genderId: number;
  shiftId: number;
  companyId: number;
  checkIn: string;
  checkOut: string;
  today: string;
  roomNumber: string;
  comments: string;
  guests: GuestData[];
  maxGuests?: number;
  currentGuestCount?: number;
  reservationType?: 'fecha' | 'turno';
  selectedDurationId?: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMobileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJobTitleChange: (value: number) => void;
  onGenderChange: (value: number) => void;
  onShiftChange: (value: number) => void;
  onCompanyChange: (value: number) => void;
  onCheckInChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckOutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoomNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCommentsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAddGuest: () => void;
  onUpdateGuest: (index: number, field: keyof GuestData, value: string | number) => void;
  onReservationTypeChange?: (type: 'fecha' | 'turno') => void;
  onDurationChange?: (durationId: string) => void;
  selectedGuest: any;
  setSelectedGuest: (guest: any) => void;
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
  sharedBooking?: boolean;
  setSharedBooking?: (value: boolean) => void;
}

const IndividualReservationForm: React.FC<IndividualReservationFormProps> = ({
  firstName,
  lastName,
  email,
  mobile,
  rut,
  jobTitleId,
  genderId,
  shiftId,
  companyId,
  checkIn,
  checkOut,
  today,
  roomNumber,
  comments,
  guests,
  maxGuests = 3,
  currentGuestCount = 1,
  reservationType: externalReservationType,
  selectedDurationId: externalSelectedDurationId,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onMobileChange,
  onRutChange,
  onJobTitleChange,
  onGenderChange,
  onShiftChange,
  onCompanyChange,
  onCheckInChange,
  onCheckOutChange,
  onRoomNumberChange,
  onCommentsChange,
  onAddGuest,
  onUpdateGuest,
  onReservationTypeChange,
  onDurationChange,
  selectedGuest,
  setSelectedGuest,
  selectedCountry,
  setSelectedCountry,
  sharedBooking = false,
  setSharedBooking = () => {},
}) => {
  const { authState } = useAuth();
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingContractors, setIsLoadingContractors] = useState(false);
  const [genders, setGenders] = useState([
    { id: 1, name: 'Masculino' },
    { id: 2, name: 'Femenino' },
  ]);
  const [shifts, setShifts] = useState([
    { id: 1, name: 'Diurno' },
    { id: 2, name: 'Nocturno' },
  ]);
  const [durations, setDurations] = useState<DurationResponse[]>([]);
  const [isLoadingDurations, setIsLoadingDurations] = useState(false);
  // Verificar si el usuario es Sentry_Admin
  const isSentryAdmin = authState.user?.role === 'Sentry_Admin';
  const isCompanyAdmin = authState.user?.role === 'Company_Admin';
  // For non-admins, force reservationType to 'turno'.
  const [reservationType, setReservationType] = useState<'fecha' | 'turno'>(
    isSentryAdmin ? (externalReservationType || 'fecha') : 'turno'
  );
  const [selectedDurationId, setSelectedDurationId] = useState<string>(externalSelectedDurationId || '');
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [rutError, setRutError] = useState<string>('');
  const [guestEmailErrors, setGuestEmailErrors] = useState<string[]>([]);
  const [guestPhoneErrors, setGuestPhoneErrors] = useState<string[]>([]);
  const [rutSearchResults, setRutSearchResults] = useState<any[]>([]);
  const [isSearchingRut, setIsSearchingRut] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [rutInputValue, setRutInputValue] = useState('');
  const [visualEmail, setVisualEmail] = useState(email);
  const [visualFirstName, setVisualFirstName] = useState(firstName);
  const [visualLastName, setVisualLastName] = useState(lastName);
  const [visualMobile, setVisualMobile] = useState(mobile);
  
  // País por defecto (Chile)
  const defaultCountry = countries.find(country => country.code === 'CL') || countries[0];
  const currentCountry = selectedCountry || defaultCountry;

  // Función para obtener las duraciones
  const fetchDurations = async () => {
    // if (!isSentryAdmin) return;

    setIsLoadingDurations(true);
    try {
      const response = await getDurations();
      if (response.succeeded) {
        setDurations(response.data || []);
      } else {
        console.error("Error fetching durations:", response.message);
        setDurations([]);
      }
    } catch (error) {
      console.error("Error fetching durations:", error);
      setDurations([]);
    } finally {
      setIsLoadingDurations(false);
    }
  };

  // Efecto para cargar duraciones una sola vez al montar el componente
  useEffect(() => {
    fetchDurations();
  }, []); // Array vacío para que se ejecute solo una vez

  useEffect(() => {
    const fetchContractors = async () => {
      setIsLoadingContractors(true);
      try {
        const response = await getContractors();
        if (response.succeeded) {
          setContractors(response.data || []);
          if (authState?.user?.companyId) {
            onCompanyChange(authState.user.companyId as number);
            fetchTags(authState.user.companyId as number);
          }
        } else {
          console.error("Error fetching contractors:", response.message);
        }
      } catch (error) {
        console.error("Error fetching contractors:", error);
      } finally {
        setIsLoadingContractors(false);
      }
    };

    fetchContractors();
  }, [authState?.user?.companyId]);

  const fetchTags = async (companyId: number) => {
    setIsLoadingTags(true);
    try {
      const response = await getTagsCompany(companyId);
      if (response.succeeded) {
        setTags((response.data || []));
      } else {
        console.error("Error fetching tags:", response.message);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  useEffect(() => {
    // Initialize guest errors arrays when guests change
    setGuestEmailErrors(new Array(guests.length).fill(''));
    setGuestPhoneErrors(new Array(guests.length).fill(''));
  }, [guests.length]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === '') {
      // Opcional: no mostrar error si está vacío
      return '';
    } else if (!emailRegex.test(email)) {
      return 'Por favor ingrese un correo electrónico válido';
    }
    return '';
  };

  // Función para obtener el número de teléfono sin código de país
  const getPhoneWithoutCountryCode = (phone: string) => {
    if (!phone) return '';
    
    // Si el teléfono ya tiene código de país, eliminarlo
    if (phone.startsWith('+')) {
      // Buscar cualquier código de país y eliminarlo
      const phoneWithoutCode = phone.replace(/^\+\d+/, '');
      return phoneWithoutCode;
    }
    
    // Si no tiene código de país, devolverlo tal como está
    return phone;
  };

  // Función para obtener el número de teléfono completo con código de país
  const getFullPhoneNumber = (phoneWithoutCode: string) => {
    if (!phoneWithoutCode) return '';
    return currentCountry.phoneCode + phoneWithoutCode;
  };

  // Función para procesar el número de teléfono del autocomplete
  const processPhoneFromAutocomplete = (phoneNumber: string) => {
    if (!phoneNumber) return { phone: '', country: null };
    
    // Limpiar el número de espacios y caracteres no numéricos excepto el +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Caso 1: Si viene con +56 o 56 al inicio (Chile), extraer los dígitos después del código
    if (cleanPhone.startsWith('+56') || cleanPhone.startsWith('56')) {
      const chileCountry = countries.find(c => c.phoneCode === '+56');
      const phoneDigits = cleanPhone.replace(/^\+?56/, '');
      // Para Chile, siempre tomar los últimos 9 dígitos
      const last9Digits = phoneDigits.slice(-9);
      return { phone: last9Digits, country: chileCountry || null };
    }
    
    // Caso 2: Si el número tiene exactamente 9 dígitos, usar como está con Chile
    if (cleanPhone.length === 9 && !cleanPhone.startsWith('+')) {
      const chileCountry = countries.find(c => c.phoneCode === '+56');
      return { phone: cleanPhone, country: chileCountry || null };
    }
    
    // Caso 3: Si viene con otro código de país, intentar identificarlo
    if (cleanPhone.startsWith('+')) {
      // Buscar el país correspondiente por código
      for (const country of countries) {
        const countryCode = country.phoneCode.replace('+', '');
        if (cleanPhone.startsWith(`+${countryCode}`)) {
          const phoneDigits = cleanPhone.replace(`+${countryCode}`, '');
          return { phone: phoneDigits, country: country };
        }
      }
    }
    
    // Caso 4: Si no se identifica el país, usar los últimos 9 dígitos con Chile por defecto
    const chileCountry = countries.find(c => c.phoneCode === '+56');
    const allDigits = cleanPhone.replace(/^\+/, '');
    const last9Digits = allDigits.slice(-9);
    return { phone: last9Digits, country: chileCountry || null };
  };

  const validatePhone = (phone: string) => {
    if (!phone) {
      return 'El número de teléfono es requerido';
    }

    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Solo validar formato chileno (9 dígitos)
    if (currentCountry?.phoneCode === '+56') {
      if (digitsOnly.length !== 9) {
        return 'El número de teléfono chileno debe tener 9 dígitos';
      }
    }

    // Para otros países, solo verificar que no esté vacío (ya validado arriba)
    return '';
  };

  const validateRut = (rut: string) => {
    // Permitir pasaporte si comienza con P- o p-
    if (/^p\-/i.test(rut)) {
      if (rut.length < 5) {
        return 'El pasaporte debe tener al menos 3 caracteres después de P-';
      }
      return '';
    }
    const rutRegex = /^\d{7,8}-[0-9kK]$/;
    if (!rut) {
      return 'El RUT es requerido';
    } else if (!rutRegex.test(rut)) {
      return 'El RUT debe tener el formato: 12345678-9 o 12345678-K o Para pasaporte: P-12345678';
    }
    // Validación del dígito verificador
    const [num, dv] = rut.split('-');
    let suma = 0;
    let multiplicador = 2;
    for (let i = num.length - 1; i >= 0; i--) {
      suma += parseInt(num[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    let dvEsperado: string;
    if (11 - resto === 11) dvEsperado = '0';
    else if (11 - resto === 10) dvEsperado = 'K';
    else dvEsperado = String(11 - resto);
    if (dvEsperado !== dv.toUpperCase()) {
      return 'El RUT no es válido';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onEmailChange(e);
    setEmailError(validateEmail(value));
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any existing country code from the input
    const phoneWithoutCode = e.target.value.replace(/^\+\d+/, '');
    // Permitir solo números
    const digitsOnly = phoneWithoutCode.replace(/\D/g, '');
    // Create a new event with the phone number without country code
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: digitsOnly
      }
    };
    onMobileChange(newEvent);
    setPhoneError(validatePhone(digitsOnly));
  };

  const handleCountryChange = (country: Country | null) => {
    setSelectedCountry(country);
    // Limpiar errores de teléfono cuando se cambia el país
    if (country) {
      setPhoneError('');
    }
  };

  useEffect(() => {
    if (mobile) {
      setPhoneError(validatePhone(mobile));
    }
  }, [currentCountry?.phoneCode]);

  const handleRutSearch = async (inputValue: string) => {
    if (inputValue.length >= 3) {
      setIsSearchingRut(true);
      try {
        const response = await searchByRut(inputValue);
        if (response.succeeded && response.data) {
          setRutSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setRutSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching RUT:', error);
        setRutSearchResults([]);
      } finally {
        setIsSearchingRut(false);
      }
    } else {
      setRutSearchResults([]);
    }
  };

  const handleJobTitleChange = (event: SelectChangeEvent) => {
    onJobTitleChange(Number(event.target.value));
  };

  const handleGenderChange = (event: SelectChangeEvent) => {
    onGenderChange(Number(event.target.value));
  };

  const handleShiftChange = (event: SelectChangeEvent) => {
    onShiftChange(Number(event.target.value));
  };

  const handleReservationTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value as 'fecha' | 'turno';
    setReservationType(newType);
    if (onReservationTypeChange) {
      onReservationTypeChange(newType);
    }
    // Limpiar duración seleccionada si se cambia a fecha
    if (newType === 'fecha') {
      setSelectedDurationId('');
      if (onDurationChange) {
        onDurationChange('');
      }
    }
  };

  const handleDurationChange = (event: SelectChangeEvent) => {
    const durationId = event.target.value;
    setSelectedDurationId(durationId);
    
    if (onDurationChange) {
      onDurationChange(durationId);
    }
    
    // Si se selecciona un turno y hay un checkIn, calcular automáticamente el checkOut
    if (durationId && checkIn && reservationType === 'turno') {
      const selectedDuration = durations.find(d => d.id.toString() === durationId);
      if (selectedDuration) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkInDate.getTime() + (selectedDuration.days * 24 * 60 * 60 * 1000));
        const formattedCheckOut = checkOutDate.toISOString().split('T')[0];
        onCheckOutChange({ target: { value: formattedCheckOut } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const formatToInputDate = (date: string | Date | null) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const handleContractorChange = (event: SelectChangeEvent) => {
    const selectedContractor = contractors.find(c => c.id.toString() === event.target.value);
    if (selectedContractor) {
      onCompanyChange(selectedContractor.id);
      fetchTags(selectedContractor.id);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!companyId || !checkIn || !checkOut || !jobTitleId) return;

    setIsLoadingRooms(true);
    try {
      const response = await getAvailableRooms(
        companyId,
        checkIn,
        checkOut,
        jobTitleId.toString(),
        sharedBooking
      );
      if (response.succeeded) {
        setAvailableRooms(response.data || []);
      } else {
        console.error("Error fetching available rooms:", response.messages);
        setAvailableRooms([]);
      }
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setAvailableRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchAvailableRooms();
  }, [companyId, checkIn, checkOut, jobTitleId, sharedBooking]);

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value; // siempre será en formato YYYY-MM-DD
    onCheckInChange({ target: { value: dateStr } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value; // siempre será en formato YYYY-MM-DD
    onCheckOutChange({ target: { value: dateStr } } as React.ChangeEvent<HTMLInputElement>);
  };

  // Efecto para recalcular checkout cuando cambie checkIn en modo turno
  useEffect(() => {
    if (reservationType === 'turno' && selectedDurationId && checkIn) {
      const selectedDuration = durations.find(d => d.id.toString() === selectedDurationId);
      if (selectedDuration) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkInDate.getTime() + (selectedDuration.days * 24 * 60 * 60 * 1000));
        const formattedCheckOut = checkOutDate.toISOString().split('T')[0];
        onCheckOutChange({ target: { value: formattedCheckOut } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [checkIn, reservationType, selectedDurationId, durations]);

  // Efectos para sincronizar con props externas
  useEffect(() => {
    if (isSentryAdmin) {
      if (externalReservationType !== undefined) {
        setReservationType(externalReservationType);
      }
    } else {
      setReservationType('turno');
      if (onReservationTypeChange) {
        onReservationTypeChange('turno');
      }
    }
  }, [externalReservationType, isSentryAdmin, onReservationTypeChange]);

  useEffect(() => {
    if (externalSelectedDurationId !== undefined) {
      setSelectedDurationId(externalSelectedDurationId);
    }
  }, [externalSelectedDurationId]);

  // Efecto para asegurar que el país se establezca correctamente al montar el componente
  useEffect(() => {
    if (!selectedCountry) {
      const defaultCountry = countries.find(country => country.code === 'CL');
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
      }
    }
  }, [selectedCountry, setSelectedCountry]);

  // Efectos para sincronizar estados visuales con props
  useEffect(() => {
    setVisualFirstName(firstName);
  }, [firstName]);

  useEffect(() => {
    setVisualLastName(lastName);
  }, [lastName]);

  useEffect(() => {
    setVisualEmail(email);
  }, [email]);

  useEffect(() => {
    setVisualMobile(mobile);
  }, [mobile]);

  // Lógica para la habilitación progresiva
  const isContractorSelected = companyId > 0;
  const isBasicInfoComplete = isContractorSelected && firstName && lastName && rut && jobTitleId > 0;
  const isDateTimeComplete = isBasicInfoComplete && checkIn && (
    (reservationType === 'fecha' && checkOut) || 
    (reservationType === 'turno' && selectedDurationId)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      {/* Paso 1: Solo Contratista */}
      <div style={{ display: 'flex', gap: 16 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="contractor-label">Contratista</InputLabel>
          <Select
            labelId="contractor-label"
            value={companyId.toString()}
            onChange={handleContractorChange}
            label="Contratista"
            disabled={isLoadingContractors || !!authState?.user?.companyId}
          >
            {contractors.map((contractor) => (
              <MenuItem key={contractor.id} value={contractor.id.toString()}>
                {contractor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      
      {/* Paso 2: Información básica del huésped (cuando se selecciona contratista) */}
      {isContractorSelected && (
        <>
          <Autocomplete
            freeSolo
            options={rutSearchResults}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.dni + ' / ' + option.firstName + ' ' + option.lastName || '';
            }}
            value={selectedGuest}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === 'input') {
                setRutInputValue(newInputValue);
                handleRutSearch(newInputValue);
                if (!selectedGuest && newInputValue) {
                  onRutChange({ target: { value: newInputValue } } as React.ChangeEvent<HTMLInputElement>);
                  setRutError(validateRut(newInputValue));
                } else if (!newInputValue) {
                  // If input is empty, clear all related fields
                  setSelectedGuest(null);
                  onRutChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualFirstName('');
                  onFirstNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualLastName('');
                  onLastNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualEmail('');
                  onEmailChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualMobile('');
                  onMobileChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  onJobTitleChange(0);
                  setRutError('');
                  setEmailError('');
                  setPhoneError('');
                }
              }
            }}
            onChange={(event, newValue) => {
              if (typeof newValue === 'object' && newValue !== null) {
                setSelectedGuest(newValue);
                setRutInputValue(newValue.dni);
                onRutChange({ target: { value: newValue.dni || '' } } as React.ChangeEvent<HTMLInputElement>);
                setVisualFirstName(newValue.firstName?.toString() || '');
                onFirstNameChange({ target: { value: newValue.firstName?.toString() || '' } } as React.ChangeEvent<HTMLInputElement>);
                setVisualLastName(newValue.lastName?.toString() || '');
                onLastNameChange({ target: { value: newValue.lastName?.toString() || '' } } as React.ChangeEvent<HTMLInputElement>);
                // Email handling
                if (newValue.email) {
                  setVisualEmail(newValue.email);
                  onEmailChange({ target: { value: newValue.email } } as React.ChangeEvent<HTMLInputElement>);
                } else {
                  setVisualEmail('');
                  onEmailChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                }
                // Handle phone number with country code
                const phoneNumber = newValue.phoneNumber || newValue.emergencyPhone || '';
                if (phoneNumber) {
                  const { phone, country } = processPhoneFromAutocomplete(phoneNumber);
                  if (country) {
                    setSelectedCountry(country);
                  }
                  setVisualMobile(phone);
                  onMobileChange({ target: { value: phone } } as React.ChangeEvent<HTMLInputElement>);
                  
                  const updatedGuest = {
                    ...newValue,
                    phoneNumber: phone,
                    emergencyPhone: phone
                  };
                  setSelectedGuest(updatedGuest);
                } else {
                  setVisualMobile('');
                  onMobileChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                }
                onJobTitleChange(newValue.jobTitleId || 0);
                setRutError('');
                setEmailError('');
                setPhoneError('');
              } else {
                setSelectedGuest(null);
                setRutInputValue(newValue || '');
                const value = newValue || '';
                onRutChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
                
                // If the RUT field is empty, clear all related fields
                if (!value) {
                  setVisualFirstName('');
                  onFirstNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualLastName('');
                  onLastNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualEmail('');
                  onEmailChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  setVisualMobile('');
                  onMobileChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                  onJobTitleChange(0);
                  setRutError('');
                  setEmailError('');
                  setPhoneError('');
                } else {
                  setRutError(validateRut(value));
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="RUT (VAT ID)"
                error={!!rutError}
                helperText={rutError || 'Si el documento es pasaporte, comenzar con P-: ejemplo P-1234. Sino, respetar el formato RUT.'}
                size="small"
                fullWidth
                required
              />
            )}
            loading={isSearchingRut}
            loadingText="Buscando..."
            noOptionsText="No se encontraron resultados"
          />
          <div style={{ display: 'flex', gap: 16 }}>
            <TextField
              label="Nombre"
              value={visualFirstName}
              onChange={e => {
                setVisualFirstName(e.target.value);
                onFirstNameChange(e as React.ChangeEvent<HTMLInputElement>);
              }}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Apellido"
              value={visualLastName}
              onChange={e => {
                setVisualLastName(e.target.value);
                onLastNameChange(e as React.ChangeEvent<HTMLInputElement>);
              }}
              fullWidth
              size="small"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <TextField
              label="Correo electrónico"
              value={visualEmail}
              onChange={e => {
                setVisualEmail(e.target.value);
                onEmailChange(e as React.ChangeEvent<HTMLInputElement>); // Mantiene el valor real para el envío
              }}
              fullWidth
              size="small"
              type="email"
              error={!!emailError}
              helperText={emailError}
              onBlur={() => setEmailError(validateEmail(visualEmail))}
            />
            <CompactCountryPhoneSelector
              selectedCountry={currentCountry}
              onCountryChange={handleCountryChange}
              phoneValue={getPhoneWithoutCountryCode(visualMobile)}
              onPhoneChange={(value) => {
                // Actualizar el estado visual y el del padre
                setVisualMobile(value);
                onMobileChange({ target: { value: value } } as React.ChangeEvent<HTMLInputElement>);
                setPhoneError(validatePhone(value));
              }}
              size="small"
              error={!!phoneError}
              helperText={phoneError}
              label="Número de teléfono"
            />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="gender-label">Género</InputLabel>
              <Select
                labelId="gender-label"
                value={genderId.toString()}
                onChange={handleGenderChange}
                label="Género"
              >
                {genders.map((gender) => (
                  <MenuItem key={gender.id} value={gender.id.toString()}>
                    {gender.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="shift-label">Jornada</InputLabel>
              <Select
                labelId="shift-label"
                value={shiftId.toString()}
                onChange={handleShiftChange}
                label="Jornada"
              >
                {shifts.map((shift) => (
                  <MenuItem key={shift.id} value={shift.id.toString()}>
                    {shift.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="job-title-label">Cargo *</InputLabel>
              <Select
                labelId="job-title-label"
                value={jobTitleId.toString()}
                onChange={handleJobTitleChange}
                label="Cargo"
                disabled={isLoadingTags}
              >
                {tags.length === 0 ? (
                  <MenuItem value="" disabled>
                    No hay cargos generados
                  </MenuItem>
                ) : (
                  tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {isSentryAdmin ? (
              <FormControl fullWidth size="small">
                <InputLabel id="reservation-type-label">¿Turno o Fecha?</InputLabel>
                <Select
                  labelId="reservation-type-label"
                  value={reservationType}
                  onChange={handleReservationTypeChange}
                  label="¿Turno o Fecha?"
                >
                  <MenuItem value="fecha">Fecha</MenuItem>
                  <MenuItem value="turno">Turno</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth size="small" disabled>
                <InputLabel id="reservation-type-label">Tipo de reserva</InputLabel>
                <Select
                  labelId="reservation-type-label"
                  value="turno"
                  label="Tipo de reserva"
                  // No onChange, always fixed
                >
                  <MenuItem value="turno">Turno</MenuItem>
                </Select>
              </FormControl>
            )}
          </div>
        </>
      )}

      {/* Paso 3: Fechas y horarios (cuando la información básica está completa) */}
      {isBasicInfoComplete && (
        <div style={{ display: 'flex', gap: 16 }}>
          <TextField
            label="Check in"
            type="date"
            value={formatToInputDate(checkIn)}
            onChange={handleCheckInChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            inputProps={{ min: formatToInputDate(new Date(new Date(today).getTime() - 8 * 24 * 60 * 60 * 1000)) }}
            required
          />
          {(isSentryAdmin && reservationType === 'fecha') && (
            <TextField
              label="Check out *"
              type="date"
              value={formatToInputDate(checkOut)}
              onChange={handleCheckOutChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              inputProps={{
          min: formatToInputDate(checkIn ? new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000) : new Date())
              }}
            />
          )}
          {reservationType === 'turno' && (
            <FormControl fullWidth size="small">
              <InputLabel id="duration-label">Duración *</InputLabel>
              <Select
          labelId="duration-label"
          value={selectedDurationId}
          onChange={handleDurationChange}
          label="Duración"
          disabled={isLoadingDurations}
              >
          {durations.length === 0 ? (
            <MenuItem value="" disabled>
              {isLoadingDurations ? 'Cargando...' : 'No hay duraciones disponibles'}
            </MenuItem>
          ) : (
            [
              <MenuItem key="empty" value="">Seleccione una duración</MenuItem>,
              ...durations.map((duration) => (
                <MenuItem key={duration.id} value={duration.id.toString()}>
            {duration.description}
                </MenuItem>
              ))
            ]
          )}
              </Select>
            </FormControl>
          )}
        </div>
      )}

      {/* Paso 4: Comentarios y habitaciones (cuando todo lo anterior está completo) */}
      {isDateTimeComplete && (
        <>
          <div style={{ display: 'flex', gap: 16 }}>
            <TextField
              label="Comentarios"
              value={comments}
              onChange={onCommentsChange}
              fullWidth
              size="small"
            />
            {isSentryAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                <span style={{ marginRight: 8 }}>Reserva Compartida</span>
                <Tooltip title="Activa reservas compartidas en habitaciones ocupadas, según disponibilidad de camas o turnos.">
                  <Switch
                    checked={sharedBooking}
                    onChange={(_, checked) => setSharedBooking(checked)}
                    color="primary"
                    inputProps={{ 'aria-label': 'Reserva Compartida' }}
                  />
                </Tooltip>
              </div>
            )}
          </div>
          <TextField
            label="Número de habitación"
            value={roomNumber}
            onChange={onRoomNumberChange}
            fullWidth
            size="small"
            select
            disabled={isLoadingRooms || availableRooms.length === 0}
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              native: true
            }}
            error={availableRooms.length === 0}
            helperText={availableRooms.length === 0 ? "No hay habitaciones disponibles" : ""}
            required
          >
            {availableRooms.length === 0 ? (
              <option value="" disabled>
                No hay habitaciones disponibles
              </option>
            ) : (
              <>
                <option value="">Seleccione una habitación</option>
                {availableRooms.map((room) => (
                  <option key={room.roomNumber} value={room.roomNumber}>
                    {room.roomNumber}
                  </option>
                ))}
              </>
            )}
          </TextField>
        </>
      )}

      {/*{canAddMoreGuests && (
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onAddGuest}
          sx={{ mt: 1 }}
        >
          Agregar nuevo huésped
        </Button>
      )}*/}
    </div>
  );
};

export default IndividualReservationForm;