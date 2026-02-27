 import React, { useEffect, useMemo, useState } from 'react';
 import {
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Button,
   Grid,
   TextField,
   CircularProgress,
   Autocomplete,
   Box,
   FormControl,
   Select,
   MenuItem,
 } from '@mui/material';
 import { SelectChangeEvent } from '@mui/material/Select';
import { searchByRut } from '@/app/(control-panel)/reserve/reserveService';

interface AddContactPersonModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    rut: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) => Promise<void> | void;
}

const rutRegex = /^\d{8}-[0-9kK]$/;

const AddContactPersonModal: React.FC<AddContactPersonModalProps> = ({ open, onClose, onSave }) => {
  const [rut, setRut] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);

  const [rutError, setRutError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+56');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (open) {
      setRut('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setIsLoading(false);
      setIsSearching(false);
      setOptions([]);
      setSelectedOption(null);
      setRutError('');
      setEmailError('');
      setSelectedCountryCode('+56');
      setPhoneError('');
    }
  }, [open]);

  const validateRut = (value: string) => {
    if (!value) return 'El RUT es requerido';
    if (!rutRegex.test(value)) return 'Formato inválido (12345678-9 o 12345678-K)';
    const [num, dv] = value.split('-');
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
    if (dvEsperado !== dv.toUpperCase()) return 'El RUT no es válido';
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return '';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? '' : 'Ingrese un correo electrónico válido';
  };

  const validatePhone = (value: string) => {
    if (!value) {
      return 'El número de teléfono es requerido';
    }
    const digitsOnly = value.replace(/\D/g, '');
    if (selectedCountryCode === '+56') {
      if (digitsOnly.length !== 9) {
        return 'El número de teléfono chileno debe tener 9 dígitos';
      }
    } else if (selectedCountryCode === '+549') {
      if (digitsOnly.length !== 10) {
        return 'El número de teléfono argentino debe tener 10 dígitos';
      }
    }
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value)) {
      return 'Por favor ingrese un número de teléfono válido';
    }
    return '';
  };

  const canSubmit = useMemo(() => {
    return (
      !!rut && !rutError &&
      !!firstName &&
      !!lastName &&
      !!phone && !phoneError &&
      !!email && !emailError
    );
  }, [rut, rutError, firstName, lastName, phone, phoneError, email, emailError]);

  const handleSearch = async (input: string) => {
    if (!input || input.length < 3) {
      setOptions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await searchByRut(input);
      if (response.succeeded && response.data) {
        setOptions(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setOptions([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleRutChange = (_: any, newValue: string | any) => {
    if (typeof newValue === 'object' && newValue) {
      setSelectedOption(newValue);
      const value = newValue.dni || '';
      setRut(value);
      setFirstName(newValue.firstName?.toString() || '');
      setLastName(newValue.lastName?.toString() || '');
      setPhone(newValue.phoneNumber || '');
      setEmail(newValue.email?.toString() || '');
      setRutError('');
    } else {
      setSelectedOption(null);
      const value = (newValue as string) || '';
      setRut(value);
      setRutError(validateRut(value));
    }
  };

  const handleCountryCodeChange = (event: SelectChangeEvent) => {
    setSelectedCountryCode(event.target.value as string);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneWithoutCode = e.target.value.replace(/^\+56|^\+54/, '');
    const newValue = selectedCountryCode + phoneWithoutCode;
    setPhone(newValue);
    setPhoneError(validatePhone(phoneWithoutCode));
  };

  useEffect(() => {
    if (phone) {
      setPhoneError(validatePhone(phone.replace(/^\+56|^\+549/, '')));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryCode]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setIsLoading(true);
      await onSave({ rut, firstName, lastName, phone, email });
      onClose();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error saving contact person', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>Agregar persona de contacto</DialogTitle>
       <DialogContent sx={{ mt: 2 }}>
        <Autocomplete
          freeSolo
          options={options}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return `${option.dni || ''} / ${option.firstName || ''} ${option.lastName || ''}`.trim();
          }}
          value={selectedOption}
          onChange={handleRutChange}
          onInputChange={(_, value) => {
            setRut(value);
            setRutError(validateRut(value));
            handleSearch(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="RUT"
              error={!!rutError}
              helperText={rutError || ' '} 
              size="small"
              fullWidth
            />
          )}
          loading={isSearching}
          loadingText="Buscando..."
          noOptionsText="No se encontraron resultados"
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

         <Grid container spacing={2} sx={{ mt: 0 }}>
           <Grid item xs={6}>
             <TextField
               label="Correo"
               value={email}
               onChange={(e) => {
                 setEmail(e.target.value);
                 setEmailError(validateEmail(e.target.value));
               }}
               error={!!emailError}
               helperText={emailError}
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
                 label="Teléfono"
                 value={phone.replace(/^\+56|^\+549/, '')}
                 onChange={handlePhoneChange}
                 error={!!phoneError}
                 helperText={phoneError}
                 fullWidth
                 size="small"
               />
             </Box>
           </Grid>
         </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ flex: 1, mr: 2, bgcolor: '#F5F7FA' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
          disabled={isLoading || !canSubmit}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContactPersonModal;


