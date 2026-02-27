import React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import tagRoleMap from '../../tag/enum/RoleTag';
import { ContractorResponse } from '../../contractors/models/ContractorResponse';

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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Número de habitación"
            value={roomNumber}
            onChange={onRoomNumberChange}
            fullWidth
            size="small"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Camas"
            value={beds}
            onChange={onBedsChange}
            fullWidth
            size="small"
            type="number"
            required
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Estándar</InputLabel>
            <Select
              value={tag.toString()}
              label="Etiqueta"
              onChange={onTagChange}
              fullWidth
              required
            >
              {Object.entries(tagRoleMap).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Número de piso</InputLabel>
            <Select
              value={floorNumber.toString()}
              label="Número de piso"
              onChange={onFloorNumberChange}
              fullWidth
              required
            >
              {[...Array((maxFloors || 1))].map((_, index) => (
                <MenuItem key={index + 1} value={(index + 1).toString()}>
                  {index + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Contratista</InputLabel>
            <Select
              value={contractorId.toString()}
              label="Contratista"
              onChange={onContractorChange}
              fullWidth
              required
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
    </div>
  );
};

export default AddRoomSingleForm; 