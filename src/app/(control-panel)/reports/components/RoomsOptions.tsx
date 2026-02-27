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
import { Hotel } from '@mui/icons-material';
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

interface RoomsOptionsProps {
  options: {
    piso: boolean;
    camas: boolean;
    cantReservas: boolean;
  };
  onOptionChange: (option: string) => void;
}

const RoomsOptions: React.FC<RoomsOptionsProps> = ({
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
              Habitaciones
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
            Información relacionada con las habitaciones y su configuración
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
                  checked={options.piso}
                  onChange={() => onOptionChange('piso')}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Piso
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Piso de la habitación
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
                  checked={options.camas}
                  onChange={() => onOptionChange('camas')}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Camas
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Cantidad de camas
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
                  checked={options.cantReservas}
                  onChange={() => onOptionChange('cantReservas')}
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle />}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                    Cantidad de reservas
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Cantidad de reservas en este día
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

export default RoomsOptions;