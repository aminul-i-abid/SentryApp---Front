import React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

interface AddCampFormProps {
  name: string;
  location: string;
  coordinates: string;
  capacity: number;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoordinatesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCapacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddCampForm: React.FC<AddCampFormProps> = ({
  name,
  location,
  coordinates,
  capacity,
  onNameChange,
  onLocationChange,
  onCoordinatesChange,
  onCapacityChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      <TextField
        label="Nombre del campamento"
        value={name}
        onChange={onNameChange}
        fullWidth
        size="small"
      />
      <TextField
        label="Ubicación"
        value={location}
        onChange={onLocationChange}
        fullWidth
        size="small"
      />
      <TextField
        label="Coordenadas"
        value={coordinates}
        onChange={onCoordinatesChange}
        fullWidth
        size="small"
        placeholder="latitud,longitud"
      />
      <TextField
        label="Capacidad (habitaciones)"
        value={capacity}
        onChange={onCapacityChange}
        fullWidth
        size="small"
      />
      {/* <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Servicios"
            value={services}
            onChange={onServicesChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tipo"
            value={type}
            onChange={onTypeChange}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid> */}
    </div>
  );
};

export default AddCampForm; 