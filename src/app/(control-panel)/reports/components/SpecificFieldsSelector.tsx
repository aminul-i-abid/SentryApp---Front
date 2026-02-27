import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { ListAlt } from '@mui/icons-material';
import { RadioButtonUnchecked, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  border: '1px solid #e2e8f0',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderColor: theme.palette.primary.main
  }
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: 'rgba(10, 116, 218, 0.04)',
  }
}));

export interface SpecificFields {
  rutHuesped: boolean;
  emailHuesped: boolean;
  telefonoHuesped: boolean;
  estandarHuesped: boolean;
  jornada: boolean;
  duracionReserva: boolean;
  habitacion: boolean;
  bloque: boolean;
  estado: boolean;
  checkin: boolean;
  checkout: boolean;
  contratista: boolean;
  pin: boolean;
}

interface SpecificFieldsSelectorProps {
  fields: SpecificFields;
  onFieldChange: (field: string) => void;
}

const SpecificFieldsSelector: React.FC<SpecificFieldsSelectorProps> = ({
  fields,
  onFieldChange
}) => {
  const { data: user } = useUser();
  const hasTTLock = user?.modules?.ttlock === true;
  const selectedCount = Object.values(fields).filter(Boolean).length;

  const fieldLabels = {
    rutHuesped: 'RUT Huésped',
    emailHuesped: 'Email Huésped',
    telefonoHuesped: 'Teléfono Huésped',
    estandarHuesped: 'Estándar Huésped',
    jornada: 'Jornada',
    duracionReserva: 'Duración reserva',
    habitacion: 'Habitación',
    bloque: 'Bloque',
    estado: 'Estado',
    checkin: 'Check-in',
    checkout: 'Check-out',
    contratista: 'Contratista',
    pin: 'PIN'
  };

  return (
    <StyledCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Reporte de Huéspedes
            </Typography>
            {selectedCount > 0 && (
              <Chip
                label={`${selectedCount} seleccionado${selectedCount > 1 ? 's' : ''}`}
                size="small"
                color="primary"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        }
        subheader={
        <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
            Selecciona los campos específicos que deseas incluir en el reporte.
            <br />Los campos por defecto del Excel generado son: Nombre y Apellido del Huésped, Check-in, Check-out, Habitación, Bloque y Estado de la Reserva.
        </Typography>
        }
      />
      <Divider />
      <CardContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          {Object.entries(fields)
            .filter(([key]) => !['habitacion', 'bloque', 'estado', 'checkin', 'checkout', 'contratista'].includes(key))
            .filter(([key]) => key !== 'pin' || hasTTLock)
            .map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={value}
                    onChange={() => onFieldChange(key)}
                    icon={<RadioButtonUnchecked />}
                    checkedIcon={<CheckCircle />}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    {fieldLabels[key as keyof typeof fieldLabels]}
                  </Typography>
                }
                sx={{
                  margin: 0,
                  padding: '8px 12px',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#f8fafc'
                  },
                  width: '100%'
                }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default SpecificFieldsSelector;