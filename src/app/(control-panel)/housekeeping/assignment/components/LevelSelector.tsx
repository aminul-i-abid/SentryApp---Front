import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DomainIcon from '@mui/icons-material/Domain';
import RoomIcon from '@mui/icons-material/Room';
import type { AssignmentLevel } from '../types/assignmentTypes';

interface LevelSelectorProps {
  selectedLevel: AssignmentLevel;
  onLevelChange: (level: AssignmentLevel) => void;
  campName: string;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  onLevelChange,
  campName,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">
          <Typography variant="h6" gutterBottom>
            Nivel de Asignación
          </Typography>
        </FormLabel>
        <RadioGroup
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value as AssignmentLevel)}
        >
          <FormControlLabel
            value="camp"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <BusinessIcon />
                <Box>
                  <Typography variant="body1">
                    Campamento Completo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Asignar a todo {campName}
                  </Typography>
                </Box>
              </Box>
            }
          />
          <FormControlLabel
            value="block"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <DomainIcon />
                <Box>
                  <Typography variant="body1">Pabellón</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Seleccionar pabellones específicos
                  </Typography>
                </Box>
              </Box>
            }
          />
          <FormControlLabel
            value="room"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <RoomIcon />
                <Box>
                  <Typography variant="body1">
                    Habitaciones Específicas
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Seleccionar habitaciones individuales
                  </Typography>
                </Box>
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};

export default LevelSelector;
