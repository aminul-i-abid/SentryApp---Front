import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";

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
  const labelSx = {
    fontWeight: 600,
    fontSize: "13px",
    mb: 0.5,
    color: "#344054",
  };
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#F5F7FA",
      borderRadius: "8px",
      "& fieldset": { border: "1px solid #E5E7EB" },
      "&:hover fieldset": { borderColor: "#d0d5dd" },
      "&.Mui-focused fieldset": {
        borderColor: "#415EDE",
        borderWidth: "1.5px",
      },
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography sx={labelSx}>Nombre del campamento</Typography>
          <TextField
            value={name}
            onChange={onNameChange}
            fullWidth
            size="small"
            placeholder="Ingrese nombre"
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography sx={labelSx}>Ubicación</Typography>
          <TextField
            value={location}
            onChange={onLocationChange}
            fullWidth
            size="small"
            placeholder="Ingrese ubicación"
            sx={inputSx}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography sx={labelSx}>Coordenadas</Typography>
          <TextField
            value={coordinates}
            onChange={onCoordinatesChange}
            fullWidth
            size="small"
            placeholder="latitud, longitud"
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography sx={labelSx}>Capacidad (habitaciones)</Typography>
          <TextField
            value={capacity}
            onChange={onCapacityChange}
            fullWidth
            size="small"
            type="number"
            placeholder="Ingrese capacidad"
            sx={inputSx}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCampForm;
