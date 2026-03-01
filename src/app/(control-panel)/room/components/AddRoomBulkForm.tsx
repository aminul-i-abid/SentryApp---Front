import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";
import { ContractorResponse } from "../../contractors/models/ContractorResponse";
import tagRoleMap from "../../tag/enum/RoleTag";

interface AddRoomFormProps {
  roomCount: number;
  bedsPerRoom: number;
  startNumber: number;
  numberDigits: number;
  tag: number;
  floorNumber: number;
  contractorId: number;
  contractors: ContractorResponse[];
  isEdit?: boolean;
  maxFloors?: number;
  onRoomCountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBedsPerRoomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNumberDigitsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagChange: (e: SelectChangeEvent) => void;
  onFloorNumberChange: (e: SelectChangeEvent) => void;
  onContractorChange: (e: SelectChangeEvent) => void;
}

const AddRoomForm: React.FC<AddRoomFormProps> = ({
  roomCount,
  bedsPerRoom,
  startNumber,
  numberDigits,
  tag,
  floorNumber,
  contractorId,
  contractors,
  isEdit = false,
  maxFloors,
  onRoomCountChange,
  onBedsPerRoomChange,
  onStartNumberChange,
  onNumberDigitsChange,
  onTagChange,
  onFloorNumberChange,
  onContractorChange,
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
  const selectSx = {
    backgroundColor: "#F5F7FA",
    borderRadius: "8px",
    "& fieldset": { border: "1px solid #E5E7EB" },
    "&:hover fieldset": { borderColor: "#d0d5dd" },
    "&.Mui-focused fieldset": { borderColor: "#415EDE", borderWidth: "1.5px" },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
      <Grid container spacing={2}>
        {!isEdit && (
          <Grid item xs={6}>
            <Typography sx={labelSx}>Cantidad de habitaciones</Typography>
            <TextField
              value={roomCount}
              onChange={onRoomCountChange}
              fullWidth
              size="small"
              type="number"
              placeholder="Ingrese la cantidad"
              sx={inputSx}
            />
          </Grid>
        )}
        <Grid item xs={isEdit ? 12 : 6}>
          <Typography sx={labelSx}>Camas por habitación</Typography>
          <TextField
            value={bedsPerRoom}
            onChange={onBedsPerRoomChange}
            fullWidth
            size="small"
            type="number"
            placeholder="Seleccione total de camas"
            sx={inputSx}
          />
        </Grid>
      </Grid>

      {!isEdit && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Número inicial</Typography>
            <TextField
              value={startNumber}
              onChange={onStartNumberChange}
              fullWidth
              size="small"
              type="number"
              placeholder="Ingrese número"
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography sx={labelSx}>Dígitos del número</Typography>
            <TextField
              value={numberDigits}
              onChange={onNumberDigitsChange}
              fullWidth
              size="small"
              type="number"
              placeholder="Seleccione"
              sx={inputSx}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Typography sx={labelSx}>Estándar</Typography>
          <FormControl fullWidth size="small">
            <Select value={tag.toString()} onChange={onTagChange} sx={selectSx}>
              {Object.entries(tagRoleMap).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={labelSx}>Número de piso</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={floorNumber.toString()}
              onChange={onFloorNumberChange}
              sx={selectSx}
            >
              {[...Array(maxFloors || 1)].map((_, index) => (
                <MenuItem key={index + 1} value={(index + 1).toString()}>
                  {index + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={labelSx}>Contratista</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={contractorId.toString()}
              onChange={onContractorChange}
              sx={selectSx}
            >
              {contractors.map((contractor) => (
                <MenuItem key={contractor.id} value={contractor.id.toString()}>
                  {contractor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRoomForm;
