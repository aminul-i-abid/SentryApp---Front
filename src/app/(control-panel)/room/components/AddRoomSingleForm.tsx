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

interface AddRoomSingleFormProps {
  roomNumber: string;
  beds: number;
  tag: number;
  floorNumber: number;
  contractorId: number;
  contractors: ContractorResponse[];
  isStorage: boolean;
  isEdit?: boolean;
  maxFloors?: number;
  onRoomNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBedsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagChange: (e: SelectChangeEvent) => void;
  onFloorNumberChange: (e: SelectChangeEvent) => void;
  onContractorChange: (e: SelectChangeEvent) => void;
  onIsStorageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddRoomSingleForm: React.FC<AddRoomSingleFormProps> = ({
  roomNumber,
  beds,
  tag,
  floorNumber,
  contractorId,
  contractors,
  isStorage,
  isEdit = false,
  maxFloors,
  onRoomNumberChange,
  onBedsChange,
  onTagChange,
  onFloorNumberChange,
  onContractorChange,
  onIsStorageChange,
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
        <Grid item xs={6}>
          <Typography sx={labelSx}>Número de habitación</Typography>
          <TextField
            value={roomNumber}
            onChange={onRoomNumberChange}
            fullWidth
            size="small"
            placeholder="Ingrese número de habitación"
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography sx={labelSx}>Camas</Typography>
          <TextField
            value={beds}
            onChange={onBedsChange}
            fullWidth
            size="small"
            type="number"
            placeholder="Seleccione total de camas"
            sx={inputSx}
          />
        </Grid>
      </Grid>

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

export default AddRoomSingleForm;
