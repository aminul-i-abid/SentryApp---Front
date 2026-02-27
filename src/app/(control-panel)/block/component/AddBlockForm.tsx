import React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface AddBlockFormProps {
  formData: {
    name: string;
    floors: string;
    checkInTime: Date | null;
    checkOutTime: Date | null;
    prefix: string;
    suffix: string;
  };
  onChange: (field: string, value: string | Date | null) => void;
}

const AddBlockForm: React.FC<AddBlockFormProps> = ({
  formData,
  onChange
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('name', e.target.value);
  };

  const handleFloorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('floors', e.target.value);
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('prefix', e.target.value);
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('suffix', e.target.value);
  };

  const handleCheckInTimeChange = (value: Date | null) => {
    onChange('checkInTime', value);
  };

  const handleCheckOutTimeChange = (value: Date | null) => {
    onChange('checkOutTime', value);
  };

  return (
    <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={handleNameChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Pisos"
              value={formData.floors}
              onChange={handleFloorsChange}
              fullWidth
              size="small"
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Prefijo"
              value={formData.prefix}
              onChange={handlePrefixChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sufijo"
              value={formData.suffix}
              onChange={handleSuffixChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Hora de entrada"
              value={formData.checkInTime}
              onChange={handleCheckInTimeChange}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Hora de salida"
              value={formData.checkOutTime}
              onChange={handleCheckOutTimeChange}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>
        </Grid>
    </Box>
  );
};

export default AddBlockForm;
