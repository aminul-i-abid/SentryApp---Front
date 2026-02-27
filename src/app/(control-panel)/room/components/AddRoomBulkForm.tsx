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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      <Grid container spacing={2}>
        {!isEdit && (
          <Grid item xs={6}>
            <TextField
              label="Cantidad de habitaciones"
              value={roomCount}
              onChange={onRoomCountChange}
              fullWidth
              size="small"
              type="number"
              required
            />
          </Grid>
        )}
        <Grid item xs={isEdit ? 12 : 6}>
          <TextField
            label="Camas por habitación"
            value={bedsPerRoom}
            onChange={onBedsPerRoomChange}
            fullWidth
            size="small"
            type="number"
            required
          />
        </Grid>
      </Grid>
      {!isEdit && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Número inicial"
                value={startNumber}
                onChange={onStartNumberChange}
                fullWidth
                size="small"
                type="number"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Dígitos del número"
                value={numberDigits}
                onChange={onNumberDigitsChange}
                fullWidth
                size="small"
                type="number"
                required
              />
            </Grid>
          </Grid>
        </>
      )}
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

export default AddRoomForm; 