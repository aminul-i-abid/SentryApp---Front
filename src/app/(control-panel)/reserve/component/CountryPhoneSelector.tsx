import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';

export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'CL', name: 'Chile', phoneCode: '+56', flag: 'https://flagcdn.com/w20/cl.png' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: 'https://flagcdn.com/w20/ar.png' },
  { code: 'PE', name: 'Perú', phoneCode: '+51', flag: 'https://flagcdn.com/w20/pe.png' },
  { code: 'BO', name: 'Bolivia', phoneCode: '+591', flag: 'https://flagcdn.com/w20/bo.png' },
  { code: 'BR', name: 'Brasil', phoneCode: '+55', flag: 'https://flagcdn.com/w20/br.png' },
  { code: 'UY', name: 'Uruguay', phoneCode: '+598', flag: 'https://flagcdn.com/w20/uy.png' },
  { code: 'PY', name: 'Paraguay', phoneCode: '+595', flag: 'https://flagcdn.com/w20/py.png' },
  { code: 'EC', name: 'Ecuador', phoneCode: '+593', flag: 'https://flagcdn.com/w20/ec.png' },
  { code: 'CO', name: 'Colombia', phoneCode: '+57', flag: 'https://flagcdn.com/w20/co.png' },
  { code: 'VE', name: 'Venezuela', phoneCode: '+58', flag: 'https://flagcdn.com/w20/ve.png' },
  { code: 'GY', name: 'Guyana', phoneCode: '+592', flag: 'https://flagcdn.com/w20/gy.png' },
  { code: 'SR', name: 'Suriname', phoneCode: '+597', flag: 'https://flagcdn.com/w20/sr.png' },
  { code: 'GF', name: 'Guayana Francesa', phoneCode: '+594', flag: 'https://flagcdn.com/w20/gf.png' },
  { code: 'US', name: 'Estados Unidos', phoneCode: '+1', flag: 'https://flagcdn.com/w20/us.png' },
  { code: 'CA', name: 'Canadá', phoneCode: '+1', flag: 'https://flagcdn.com/w20/ca.png' },
  { code: 'MX', name: 'México', phoneCode: '+52', flag: 'https://flagcdn.com/w20/mx.png' },
  { code: 'GT', name: 'Guatemala', phoneCode: '+502', flag: 'https://flagcdn.com/w20/gt.png' },
  { code: 'BZ', name: 'Belice', phoneCode: '+501', flag: 'https://flagcdn.com/w20/bz.png' },
  { code: 'SV', name: 'El Salvador', phoneCode: '+503', flag: 'https://flagcdn.com/w20/sv.png' },
  { code: 'HN', name: 'Honduras', phoneCode: '+504', flag: 'https://flagcdn.com/w20/hn.png' },
  { code: 'NI', name: 'Nicaragua', phoneCode: '+505', flag: 'https://flagcdn.com/w20/ni.png' },
  { code: 'CR', name: 'Costa Rica', phoneCode: '+506', flag: 'https://flagcdn.com/w20/cr.png' },
  { code: 'PA', name: 'Panamá', phoneCode: '+507', flag: 'https://flagcdn.com/w20/pa.png' },
  { code: 'CU', name: 'Cuba', phoneCode: '+53', flag: 'https://flagcdn.com/w20/cu.png' },
  { code: 'JM', name: 'Jamaica', phoneCode: '+1876', flag: 'https://flagcdn.com/w20/jm.png' },
  { code: 'HT', name: 'Haití', phoneCode: '+509', flag: 'https://flagcdn.com/w20/ht.png' },
  { code: 'DO', name: 'República Dominicana', phoneCode: '+1809', flag: 'https://flagcdn.com/w20/do.png' },
  { code: 'PR', name: 'Puerto Rico', phoneCode: '+1787', flag: 'https://flagcdn.com/w20/pr.png' },
  { code: 'ES', name: 'España', phoneCode: '+34', flag: 'https://flagcdn.com/w20/es.png' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351', flag: 'https://flagcdn.com/w20/pt.png' },
  { code: 'FR', name: 'Francia', phoneCode: '+33', flag: 'https://flagcdn.com/w20/fr.png' },
  { code: 'IT', name: 'Italia', phoneCode: '+39', flag: 'https://flagcdn.com/w20/it.png' },
  { code: 'DE', name: 'Alemania', phoneCode: '+49', flag: 'https://flagcdn.com/w20/de.png' },
  { code: 'GB', name: 'Reino Unido', phoneCode: '+44', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'NL', name: 'Países Bajos', phoneCode: '+31', flag: 'https://flagcdn.com/w20/nl.png' },
  { code: 'BE', name: 'Bélgica', phoneCode: '+32', flag: 'https://flagcdn.com/w20/be.png' },
  { code: 'CH', name: 'Suiza', phoneCode: '+41', flag: 'https://flagcdn.com/w20/ch.png' },
  { code: 'AT', name: 'Austria', phoneCode: '+43', flag: 'https://flagcdn.com/w20/at.png' },
  { code: 'SE', name: 'Suecia', phoneCode: '+46', flag: 'https://flagcdn.com/w20/se.png' },
  { code: 'NO', name: 'Noruega', phoneCode: '+47', flag: 'https://flagcdn.com/w20/no.png' },
  { code: 'DK', name: 'Dinamarca', phoneCode: '+45', flag: 'https://flagcdn.com/w20/dk.png' },
  { code: 'FI', name: 'Finlandia', phoneCode: '+358', flag: 'https://flagcdn.com/w20/fi.png' },
  { code: 'IE', name: 'Irlanda', phoneCode: '+353', flag: 'https://flagcdn.com/w20/ie.png' },
  { code: 'PL', name: 'Polonia', phoneCode: '+48', flag: 'https://flagcdn.com/w20/pl.png' },
  { code: 'CZ', name: 'República Checa', phoneCode: '+420', flag: 'https://flagcdn.com/w20/cz.png' },
  { code: 'SK', name: 'Eslovaquia', phoneCode: '+421', flag: 'https://flagcdn.com/w20/sk.png' },
  { code: 'HU', name: 'Hungría', phoneCode: '+36', flag: 'https://flagcdn.com/w20/hu.png' },
  { code: 'RO', name: 'Rumania', phoneCode: '+40', flag: 'https://flagcdn.com/w20/ro.png' },
  { code: 'BG', name: 'Bulgaria', phoneCode: '+359', flag: 'https://flagcdn.com/w20/bg.png' },
  { code: 'HR', name: 'Croacia', phoneCode: '+385', flag: 'https://flagcdn.com/w20/hr.png' },
  { code: 'SI', name: 'Eslovenia', phoneCode: '+386', flag: 'https://flagcdn.com/w20/si.png' },
  { code: 'RS', name: 'Serbia', phoneCode: '+381', flag: 'https://flagcdn.com/w20/rs.png' },
  { code: 'RU', name: 'Rusia', phoneCode: '+7', flag: 'https://flagcdn.com/w20/ru.png' },
  { code: 'UA', name: 'Ucrania', phoneCode: '+380', flag: 'https://flagcdn.com/w20/ua.png' },
  { code: 'CN', name: 'China', phoneCode: '+86', flag: 'https://flagcdn.com/w20/cn.png' },
  { code: 'JP', name: 'Japón', phoneCode: '+81', flag: 'https://flagcdn.com/w20/jp.png' },
  { code: 'KR', name: 'Corea del Sur', phoneCode: '+82', flag: 'https://flagcdn.com/w20/kr.png' },
  { code: 'IN', name: 'India', phoneCode: '+91', flag: 'https://flagcdn.com/w20/in.png' },
  { code: 'TH', name: 'Tailandia', phoneCode: '+66', flag: 'https://flagcdn.com/w20/th.png' },
  { code: 'VN', name: 'Vietnam', phoneCode: '+84', flag: 'https://flagcdn.com/w20/vn.png' },
  { code: 'PH', name: 'Filipinas', phoneCode: '+63', flag: 'https://flagcdn.com/w20/ph.png' },
  { code: 'MY', name: 'Malasia', phoneCode: '+60', flag: 'https://flagcdn.com/w20/my.png' },
  { code: 'SG', name: 'Singapur', phoneCode: '+65', flag: 'https://flagcdn.com/w20/sg.png' },
  { code: 'ID', name: 'Indonesia', phoneCode: '+62', flag: 'https://flagcdn.com/w20/id.png' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', flag: 'https://flagcdn.com/w20/au.png' },
  { code: 'NZ', name: 'Nueva Zelanda', phoneCode: '+64', flag: 'https://flagcdn.com/w20/nz.png' },
  { code: 'ZA', name: 'Sudáfrica', phoneCode: '+27', flag: 'https://flagcdn.com/w20/za.png' },
  { code: 'EG', name: 'Egipto', phoneCode: '+20', flag: 'https://flagcdn.com/w20/eg.png' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: 'https://flagcdn.com/w20/ng.png' },
  { code: 'KE', name: 'Kenia', phoneCode: '+254', flag: 'https://flagcdn.com/w20/ke.png' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', flag: 'https://flagcdn.com/w20/gh.png' },
  { code: 'MA', name: 'Marruecos', phoneCode: '+212', flag: 'https://flagcdn.com/w20/ma.png' },
  { code: 'TN', name: 'Túnez', phoneCode: '+216', flag: 'https://flagcdn.com/w20/tn.png' },
  { code: 'DZ', name: 'Argelia', phoneCode: '+213', flag: 'https://flagcdn.com/w20/dz.png' },
  { code: 'IL', name: 'Israel', phoneCode: '+972', flag: 'https://flagcdn.com/w20/il.png' },
  { code: 'AE', name: 'Emiratos Árabes Unidos', phoneCode: '+971', flag: 'https://flagcdn.com/w20/ae.png' },
  { code: 'SA', name: 'Arabia Saudí', phoneCode: '+966', flag: 'https://flagcdn.com/w20/sa.png' },
  { code: 'TR', name: 'Turquía', phoneCode: '+90', flag: 'https://flagcdn.com/w20/tr.png' },
  { code: 'IR', name: 'Irán', phoneCode: '+98', flag: 'https://flagcdn.com/w20/ir.png' },
  { code: 'IQ', name: 'Irak', phoneCode: '+964', flag: 'https://flagcdn.com/w20/iq.png' },
];

interface CountryPhoneSelectorProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country | null) => void;
  size?: 'small' | 'medium';
  disabled?: boolean;
  label?: string;
  error?: boolean;
  helperText?: string;
}

const CountryPhoneSelector: React.FC<CountryPhoneSelectorProps> = ({
  selectedCountry,
  onCountryChange,
  size = 'small',
  disabled = false,
  label = 'País',
  error = false,
  helperText,
}) => {
  // Chile como país por defecto
  const defaultCountry = countries.find(country => country.code === 'CL') || countries[0];

  // Si no hay país seleccionado, usar Chile por defecto
  const currentCountry = selectedCountry || defaultCountry;

  return (
    <Autocomplete
      value={currentCountry}
      onChange={(event, newValue) => {
        onCountryChange(newValue);
      }}
      options={countries}
      getOptionLabel={(option) => `${option.phoneCode}`}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={option.flag}
            alt={option.name}
            style={{ width: '20px', height: '15px' }}
            onError={(e) => {
              // Fallback en caso de que la imagen no cargue
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {option.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {option.phoneCode}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size={size}
          disabled={disabled}
          error={error}
          helperText={helperText}
          sx={{
            minWidth: '120px',
            maxWidth: '140px',
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: currentCountry && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                <img
                  src={currentCountry.flag}
                  alt={currentCountry.name}
                  style={{ width: '20px', height: '15px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Box>
            ),
          }}
        />
      )}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      disabled={disabled}
      filterOptions={(options, { inputValue }) => {
        return options.filter(option =>
          option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.phoneCode.includes(inputValue)
        );
      }}
      noOptionsText="No se encontraron países"
      loadingText="Cargando..."
    />
  );
};

export default CountryPhoneSelector;
export { countries };
