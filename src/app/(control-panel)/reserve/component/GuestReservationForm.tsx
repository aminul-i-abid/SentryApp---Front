import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/material/Autocomplete';
import { Box } from '@mui/material';

import { getTagsCompany } from '@/app/(control-panel)/tag/tagService';
import { TagResponse } from '@/app/(control-panel)/tag/models/TagResponse';
import { Grid } from '@mui/material';
import { GuestRequest } from '../models/ReservationRequest';
import { searchByRut } from '../reserveService';

export type GuestFormData = GuestRequest;

interface GuestReservationFormProps {
  guestData: GuestFormData;
  onGuestDataChange: (field: keyof GuestFormData, value: string | number) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const GuestReservationForm: React.FC<GuestReservationFormProps & { companyId: number }> = ({
  guestData,
  onGuestDataChange,
  isLoading = false,
  isEdit = false,
  companyId
}) => {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [genders] = useState([
    { id: 1, name: 'Masculino' },
    { id: 2, name: 'Femenino' },
  ]);
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [rutError, setRutError] = useState<string>('');
  const [isSearchingRut, setIsSearchingRut] = useState(false);
  const [rutSearchResults, setRutSearchResults] = useState<any[]>([]);
  const [rutInputValue, setRutInputValue] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [countryCode, setCountryCode] = useState<string>(guestData.mobileNumber.startsWith('+549') ? '+549' : '+56');

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const response = await getTagsCompany(companyId);
        if (response.succeeded) {
          setTags(response.data || []);
        } else {
          setTags([]);
        }
      } catch (error) {
        setTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };
    if (companyId) fetchTags();
  }, [companyId]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('El correo electrónico es requerido');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Por favor ingrese un correo electrónico válido');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phone) {
      setPhoneError('El número de teléfono es requerido');
      return false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('Por favor ingrese un número de teléfono válido');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const validateRut = (rut: string) => {
    const rutRegex = /^\d{7,8}-[0-9kK]$/;
    if (!rut) {
      setRutError('El RUT es requerido');
      return false;
    } else if (!rutRegex.test(rut)) {
      setRutError('El RUT debe tener el formato: 12345678-9 o 12345678-K');
      return false;
    }
    // Validación del dígito verificador chileno
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
      setRutError('El RUT no es válido');
      return false;
    }
    setRutError('');
    return true;
  };

  const handleRutSearch = async (inputValue: string) => {
    if (inputValue.length >= 2) {
      setIsSearchingRut(true);
      try {
        const response = await searchByRut(inputValue);
        if (response.succeeded && response.data) {
          setRutSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setRutSearchResults([]);
        }
      } catch (error) {
        setRutSearchResults([]);
      } finally {
        setIsSearchingRut(false);
      }
    } else {
      setRutSearchResults([]);
    }
  };

  const getPhoneWithoutCode = (phone: string) => phone.replace(/^\+56|^\+549/, '');

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          options={rutSearchResults}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.rutVatId || option.dni || '';
          }}
          renderOption={(props, option) => {
            // Muestra RUT + nombre + apellido si están disponibles
            const rut = option.rutVatId || option.dni || '';
            const nombre = option.firstName || '';
            const apellido = option.lastName || '';
            return (
              <li {...props}>
                {rut}
                {(nombre || apellido) && ` / ${nombre} ${apellido}`}
              </li>
            );
          }}
          value={selectedGuest}
          onInputChange={(_, newInputValue) => {
            onGuestDataChange('rutVatId', newInputValue);
            handleRutSearch(newInputValue);
            if (!selectedGuest && newInputValue) {
              validateRut(newInputValue);
            } else if (!newInputValue) {
              // If input is empty, clear all related fields
              setSelectedGuest(null);
              onGuestDataChange('firstName', '');
              onGuestDataChange('lastName', '');
              onGuestDataChange('email', '');
              onGuestDataChange('mobileNumber', countryCode);
              onGuestDataChange('jobTitleId', 0);
              onGuestDataChange('genderId', 1);
              setRutError('');
              setEmailError('');
              setPhoneError('');
            }
          }}
          onChange={(_, newValue) => {
            if (typeof newValue === 'object' && newValue !== null) {
              setSelectedGuest(newValue);
              onGuestDataChange('rutVatId', newValue.rutVatId || newValue.dni || '');
              onGuestDataChange('firstName', newValue.firstName || '');
              onGuestDataChange('lastName', newValue.lastName || '');
              onGuestDataChange('email', newValue.email || '');
              onGuestDataChange('mobileNumber', newValue.mobileNumber || newValue.phoneNumber || '');
              onGuestDataChange('jobTitleId', newValue.jobTitleId || 0);
              onGuestDataChange('genderId', newValue.genderId || 1);
              setRutError('');
              setEmailError('');
              setPhoneError('');
            } else {
              setSelectedGuest(null);
              const value = newValue || '';
              onGuestDataChange('rutVatId', value);
              
              // If the RUT field is empty, clear all related fields
              if (!value) {
                onGuestDataChange('firstName', '');
                onGuestDataChange('lastName', '');
                onGuestDataChange('email', '');
                onGuestDataChange('mobileNumber', countryCode);
                onGuestDataChange('jobTitleId', 0);
                onGuestDataChange('genderId', 1);
                setRutError('');
                setEmailError('');
                setPhoneError('');
              } else {
                validateRut(value);
              }
            }
          }}
          loading={isSearchingRut}
          loadingText="Buscando..."
          noOptionsText="No se encontraron resultados"
          renderInput={(params) => (
            <TextField
              {...params}
              label="RUT (VAT ID)"
              fullWidth
              size="small"
              disabled={isLoading}
              required
              error={!!rutError}
              helperText={rutError}
              // onBlur={() => validateRut(guestData.rutVatId)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nombre"
          value={guestData.firstName}
          onChange={e => onGuestDataChange('firstName', e.target.value)}
          fullWidth
          size="small"
          disabled={isLoading}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Apellido"
          value={guestData.lastName}
          onChange={e => onGuestDataChange('lastName', e.target.value)}
          fullWidth
          size="small"
          disabled={isLoading}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Correo electrónico"
          value={guestData.email}
          onChange={e => { onGuestDataChange('email', e.target.value); validateEmail(e.target.value); }}
          fullWidth
          size="small"
          type="email"
          disabled={isLoading}
          required
          error={!!emailError}
          helperText={emailError}
          onBlur={() => validateEmail(guestData.email)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <FormControl size="small" sx={{ width: '130px' }}>
            <Select
              value={countryCode}
              onChange={e => {
                const newCode = e.target.value;
                setCountryCode(newCode);
                // Actualiza el valor en guestData.mobileNumber
                onGuestDataChange('mobileNumber', newCode + getPhoneWithoutCode(guestData.mobileNumber));
              }}
              size="small"
            >
              <MenuItem value="+56">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <img src="https://flagcdn.com/w20/cl.png" alt="Chile" style={{ width: '16px', height: '12px' }} />
                  <span>+56</span>
                </Box>
              </MenuItem>
              <MenuItem value="+549">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <img src="https://flagcdn.com/w20/ar.png" alt="Argentina" style={{ width: '16px', height: '12px' }} />
                  <span>+54</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Número de teléfono"
            value={getPhoneWithoutCode(guestData.mobileNumber)}
            onChange={e => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              onGuestDataChange('mobileNumber', countryCode + value);
              validatePhone(countryCode + value);
            }}
            fullWidth
            size="small"
            disabled={isLoading}
            required
            error={!!phoneError}
            helperText={phoneError}
            onBlur={() => validatePhone(guestData.mobileNumber)}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel id="job-title-label">Cargo</InputLabel>
          <Select
            labelId="job-title-label"
            value={guestData.jobTitleId ? guestData.jobTitleId.toString() : ''}
            onChange={e => onGuestDataChange('jobTitleId', Number(e.target.value))}
            label="Cargo"
            disabled={isLoadingTags || isLoading}
            required
          >
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id.toString()}>
                {tag.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small">
          <InputLabel id="gender-label">Género</InputLabel>
          <Select
            labelId="gender-label"
            value={guestData.genderId ? guestData.genderId.toString() : ''}
            onChange={e => onGuestDataChange('genderId', Number(e.target.value))}
            label="Género"
            disabled={isLoading}
            required
          >
            {genders.map((gender) => (
              <MenuItem key={gender.id} value={gender.id.toString()}>
                {gender.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default GuestReservationForm;