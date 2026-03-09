import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React from "react";

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

const AddBlockForm: React.FC<AddBlockFormProps> = ({ formData, onChange }) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("name", e.target.value);
  };

  const handleFloorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("floors", e.target.value);
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("prefix", e.target.value);
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("suffix", e.target.value);
  };

  const handleCheckInTimeChange = (value: Date | null) => {
    onChange("checkInTime", value);
  };

  const handleCheckOutTimeChange = (value: Date | null) => {
    onChange("checkOutTime", value);
  };

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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          mt: 1,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Nombre</Typography>
            <TextField
              value={formData.name}
              onChange={handleNameChange}
              fullWidth
              size="small"
              placeholder="Ingrese nombre"
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Pisos</Typography>
            <TextField
              value={formData.floors}
              onChange={handleFloorsChange}
              fullWidth
              size="small"
              type="number"
              placeholder="Ingrese pisos"
              sx={inputSx}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Prefijo</Typography>
            <TextField
              value={formData.prefix}
              onChange={handlePrefixChange}
              fullWidth
              size="small"
              placeholder="Ingrese prefijo"
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Sufijo</Typography>
            <TextField
              value={formData.suffix}
              onChange={handleSuffixChange}
              fullWidth
              size="small"
              placeholder="Ingrese sufijo"
              sx={inputSx}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Hora de entrada</Typography>
            <TimePicker
              value={formData.checkInTime}
              onChange={handleCheckInTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "Seleccionar hora",
                  sx: inputSx,
                },
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Hora de salida</Typography>
            <TimePicker
              value={formData.checkOutTime}
              onChange={handleCheckOutTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "Seleccionar hora",
                  sx: inputSx,
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AddBlockForm;
