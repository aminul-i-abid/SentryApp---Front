import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  TextField, 
  Menu, 
  MenuItem, 
  Typography, 
  Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Country, countries } from './CountryPhoneSelector';

interface CompactCountryPhoneSelectorProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country | null) => void;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  size?: 'small' | 'medium';
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
}

const CompactCountryPhoneSelector: React.FC<CompactCountryPhoneSelectorProps> = ({
  selectedCountry,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  size = 'small',
  disabled = false,
  error = false,
  helperText,
  label = 'Número de teléfono',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Chile como país por defecto
  const defaultCountry = countries.find(country => country.code === 'CL') || countries[0];
  const currentCountry = selectedCountry || defaultCountry;

  // Ordenar países alfabéticamente con Chile siempre en primera posición
  const sortedCountries = useMemo(() => {
    const chileCountry = countries.find(country => country.code === 'CL');
    const otherCountries = countries
      .filter(country => country.code !== 'CL')
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return chileCountry ? [chileCountry, ...otherCountries] : otherCountries;
  }, []);

  // Filtrar países en tiempo real cuando cambia el término de búsqueda
  const filteredCountries = useMemo(() => {
    if (searchTerm.trim() === '') {
      return sortedCountries;
    }
    
    const filtered = sortedCountries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered;
  }, [searchTerm, sortedCountries]);

  // Asegurar que el país se seleccione automáticamente al inicializar
  useEffect(() => {
    if (!selectedCountry && onCountryChange) {
      onCountryChange(defaultCountry);
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchTerm('');
  };

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    handleClose();
  };

  const handlePhoneInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    onPhoneChange(numericValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Permitir letras, espacios y caracteres especiales para búsqueda de países
    setSearchTerm(value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'flex-start' }}>
      {/* Selector de País - Campo separado */}
      <Box sx={{ minWidth: '100px', maxWidth: '110px', flexShrink: 0 }}>
        <Button
          onClick={handleClick}
          disabled={disabled}
          variant="outlined"
          size={size}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: size === 'small' ? '40px' : '56px',
            px: 1,
            textTransform: 'none',
            color: 'text.primary',
            borderColor: error ? 'error.main' : 'divider',
            '&:hover': {
              borderColor: error ? 'error.dark' : 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <img
              src={currentCountry.flag}
              alt={currentCountry.name}
              style={{ width: '16px', height: '12px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {currentCountry.phoneCode}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: '14px' }} />
        </Button>
        {error && helperText && (
          <Typography variant="caption" color="error" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
            País requerido
          </Typography>
        )}
      </Box>

      {/* Campo de Teléfono - Campo separado */}
      <TextField
        label={label}
        value={phoneValue}
        onChange={handlePhoneInputChange}
        placeholder="Ej: 987654321"
        fullWidth
        size={size}
        disabled={disabled}
        error={error}
        helperText={helperText}
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*'
        }}
      />
      
      {/* Menú de selección de países */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 300,
            width: 280,
          },
        }}
        MenuListProps={{
          'aria-labelledby': 'country-selector-button',
          sx: { py: 0 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            placeholder="Buscar país..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            autoFocus
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.875rem'
              }
            }}
            onKeyDown={(e) => {
              // Evitar que el menú se cierre al presionar teclas
              e.stopPropagation();
            }}
            onClick={(e) => {
              // Evitar que el menú se cierre al hacer clic
              e.stopPropagation();
            }}
          />
        </Box>
        
        {filteredCountries.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No se encontraron países</Typography>
          </MenuItem>
        ) : (
          filteredCountries.map((country) => (
            <MenuItem
              key={country.code}
              onClick={() => handleCountrySelect(country)}
              selected={country.code === currentCountry.code}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <img
                  src={country.flag}
                  alt={country.name}
                  style={{ width: '20px', height: '15px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {country.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {country.phoneCode}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default CompactCountryPhoneSelector;
