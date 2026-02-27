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
import { People } from '@mui/icons-material';
import { RadioButtonUnchecked, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

interface ReservationsOptionsProps {
  options: {
    informacionHuesped: boolean;
    informacionContratistas: boolean;
    informacionTtlock: boolean;
  };
  onOptionChange: (option: string) => void;
}

const ReservationsOptions: React.FC<ReservationsOptionsProps> = ({
  options,
  onOptionChange
}) => {
  const selectedCount = Object.values(options).filter(Boolean).length;

  return (
    <StyledCard>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Reservas
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
            Información relacionada con las reservas y huéspedes
          </Typography>
        }
      />
      <Divider />
      <CardContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  checked={options.informacionHuesped}
                  onChange={() => onOptionChange('informacionHuesped')}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Información de Huésped
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Datos personales y de contacto
                  </Typography>
                </Box>
              }
              sx={{
                margin: 0,
                padding: '8px 12px',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  checked={options.informacionContratistas}
                  onChange={() => onOptionChange('informacionContratistas')}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Contratista
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Nombre de la empresa contratista
                  </Typography>
                </Box>
              }
              sx={{
                margin: 0,
                padding: '8px 12px',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <StyledCheckbox
                  checked={options.informacionTtlock}
                  onChange={() => onOptionChange('informacionTtlock')}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Información de TTLock
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Datos de acceso y seguridad
                  </Typography>
                </Box>
              }
              sx={{
                margin: 0,
                padding: '8px 12px',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default ReservationsOptions;