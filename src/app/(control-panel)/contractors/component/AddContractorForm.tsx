import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import { searchByRut } from '@/app/(control-panel)/reserve/reserveService';
import { Box, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface AddContractorFormProps {
  name: string;
  rut: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contract: string;
  contactFirstName: string;
  contactLastName: string;
  contactRut: string;
  contactPhone: string;
  contactEmail: string;
  resetForm?: boolean;
  showContactFields?: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWebsiteChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContractChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactRutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddContractorForm: React.FC<AddContractorFormProps> = ({
  name,
  rut,
  address,
  phone,
  email,
  website,
  contract,
  contactFirstName,
  contactLastName,
  contactRut,
  contactPhone,
  contactEmail,
  resetForm,
  showContactFields,
  onNameChange,
  onRutChange,
  onAddressChange,
  onPhoneChange,
  onEmailChange,
  onWebsiteChange,
  onContractChange,
  onContactFirstNameChange,
  onContactLastNameChange,
  onContactRutChange,
  onContactPhoneChange,
  onContactEmailChange,
}) => {
  const shouldShowContact = showContactFields !== false;
  const [rutSearchResults, setRutSearchResults] = useState<any[]>([]);
  const [isSearchingRut, setIsSearchingRut] = useState(false);
  const [rutError, setRutError] = useState<string>('');
  const [companyRutError, setCompanyRutError] = useState<string>('');
  const [selectedRut, setSelectedRut] = useState<any>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [contactEmailError, setContactEmailError] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+56');
  const [contactPhoneError, setContactPhoneError] = useState<string>('');

  const validateRut = (rut: string) => {
    const rutRegex = /^\d{8}-[0-9kK]$/;
    if (!rut) {
      return 'El RUT es requerido';
    } else if (!rutRegex.test(rut)) {
      return 'El RUT debe tener el formato: 12345678-9 o 12345678-K';
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return '';
    }
    if (!emailRegex.test(email)) {
      return 'Ingrese un correo electrónico válido';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) {
      return 'El número de teléfono es requerido';
    }

    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (selectedCountryCode === '+56') {
      // Chile: must be exactly 9 digits
      if (digitsOnly.length !== 9) {
        return 'El número de teléfono chileno debe tener 9 dígitos';
      }
    } else if (selectedCountryCode === '+549') {
      // Argentina: must be exactly 10 digits
      if (digitsOnly.length !== 10) {
        return 'El número de teléfono argentino debe tener 10 dígitos';
      }
    }

    // Basic phone number format validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return 'Por favor ingrese un número de teléfono válido';
    }
    return '';
  };

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

  const handleRutChange = (event: React.SyntheticEvent, newValue: string | any) => {
    if (typeof newValue === 'object' && newValue !== null) {
      setSelectedRut(newValue);
      const value = newValue.dni || '';
      onContactRutChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
      onContactFirstNameChange({ target: { value: newValue.firstName?.toString() || '' } } as React.ChangeEvent<HTMLInputElement>);
      onContactLastNameChange({ target: { value: newValue.lastName?.toString() || '' } } as React.ChangeEvent<HTMLInputElement>);
      onContactPhoneChange({ target: { value: newValue.phoneNumber || '' } } as React.ChangeEvent<HTMLInputElement>);
      onContactEmailChange({ target: { value: newValue.email?.toString() || '' } } as React.ChangeEvent<HTMLInputElement>);
      // Clear the RUT error when a valid RUT is selected from the list
      setRutError('');
    } else {
      setSelectedRut(null);
      const value = newValue || '';
      onContactRutChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
      
      // If the RUT field is empty, clear all related contact fields
      if (!value) {
        onContactFirstNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        onContactLastNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        onContactPhoneChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        onContactEmailChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        setRutError('');
        setContactEmailError('');
        setContactPhoneError('');
      } else {
        setRutError(validateRut(value));
      }
    }
  };

  const handleCountryCodeChange = (event: SelectChangeEvent) => {
    setSelectedCountryCode(event.target.value);
  };

  const handleContactPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any existing country code from the input
    const phoneWithoutCode = e.target.value.replace(/^\+56|^\+54/, '');
    // Create a new event with the phone number with country code for storage
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: selectedCountryCode + phoneWithoutCode
      }
    };
    onContactPhoneChange(newEvent);
    setContactPhoneError(validatePhone(phoneWithoutCode));
  };

  useEffect(() => {
    if (contactPhone) {
      setContactPhoneError(validatePhone(contactPhone));
    }
  }, [selectedCountryCode]);

  useEffect(() => {
    if (resetForm) {
      setRutSearchResults([]);
      setIsSearchingRut(false);
      setRutError('');
      setCompanyRutError('');
      setSelectedRut(null);
      setEmailError('');
      setContactEmailError('');
      setSelectedCountryCode('+56');
      setContactPhoneError('');
    }
  }, [resetForm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      <TextField
        label="Nombre de la empresa"
        value={name}
        onChange={onNameChange}
        fullWidth
        size="small"
      />
      <TextField
        label="RUT de la empresa"
        value={rut}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onRutChange(e);
          setCompanyRutError(validateRut(e.target.value));
        }}
        error={!!companyRutError}
        helperText={companyRutError}
        fullWidth
        size="small"
      />
      <TextField
        label="Dirección"
        value={address}
        onChange={onAddressChange}
        fullWidth
        size="small"
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Teléfono"
            value={phone}
            onChange={onPhoneChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Correo electrónico"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onEmailChange(e);
              setEmailError(validateEmail(e.target.value));
            }}
            error={!!emailError}
            helperText={emailError}
            fullWidth
            size="small"
            type="email"
          />
        </Grid>
      </Grid>
      <TextField
        label="Sitio web"
        value={website}
        onChange={onWebsiteChange}
        fullWidth
        size="small"
      />
      {/* <TextField
        label="Contrato"
        value={contract}
        onChange={onContractChange}
        fullWidth
        size="small"
      /> */}
      {shouldShowContact && (
        <>
          <Autocomplete
            freeSolo
            options={rutSearchResults}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.dni + ' / ' + option.firstName + ' ' + option.lastName || '';
            }}
            value={selectedRut}
            onChange={handleRutChange}
            onInputChange={(event, newInputValue) => {
              handleRutSearch(newInputValue);
              if (!selectedRut && newInputValue) {
                onContactRutChange({ target: { value: newInputValue } } as React.ChangeEvent<HTMLInputElement>);
                setRutError(validateRut(newInputValue));
              } else if (!newInputValue) {
                // If input is empty, clear all contact fields
                setSelectedRut(null);
                onContactRutChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                onContactFirstNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                onContactLastNameChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                onContactPhoneChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                onContactEmailChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                setRutError('');
                setContactEmailError('');
                setContactPhoneError('');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="RUT de la persona de contacto"
                error={!!rutError}
                helperText={rutError}
                size="small"
                fullWidth
              />
            )}
            loading={isSearchingRut}
            loadingText="Buscando..."
            noOptionsText="No se encontraron resultados"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Nombre de la persona de contacto"
                value={contactFirstName}
                onChange={onContactFirstNameChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Apellido de la persona de contacto"
                value={contactLastName}
                onChange={onContactLastNameChange}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Correo de contacto"
                value={contactEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onContactEmailChange(e);
                  setContactEmailError(validateEmail(e.target.value));
                }}
                error={!!contactEmailError}
                helperText={contactEmailError}
                fullWidth
                size="small"
                type="email"
              />
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <FormControl size="small" sx={{ width: '160px' }}>
                  <Select
                    value={selectedCountryCode}
                    onChange={handleCountryCodeChange}
                    size="small"
                  >
                    <MenuItem value="+56">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img 
                          src="https://flagcdn.com/w20/cl.png" 
                          alt="Chile" 
                          style={{ width: '20px', height: '15px' }}
                        />
                        +56
                      </Box>
                    </MenuItem>
                    <MenuItem value="+549">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img 
                          src="https://flagcdn.com/w20/ar.png" 
                          alt="Argentina" 
                          style={{ width: '20px', height: '15px' }}
                        />
                        +54
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Teléfono de contacto"
                  value={contactPhone.replace(/^\+56|^\+549/, '')}
                  onChange={handleContactPhoneChange}
                  error={!!contactPhoneError}
                  helperText={contactPhoneError}
                  fullWidth
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
};

export default AddContractorForm; 