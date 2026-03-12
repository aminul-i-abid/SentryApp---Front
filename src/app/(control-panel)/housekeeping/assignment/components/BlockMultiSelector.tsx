import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useBlocksData } from '../hooks/useBlocksData';

interface BlockMultiSelectorProps {
  campId: string;
  selectedBlocks: string[];
  onBlocksChange: (blockIds: string[]) => void;
  disabled?: boolean;
}

const BlockMultiSelector: React.FC<BlockMultiSelectorProps> = ({
  campId,
  selectedBlocks,
  onBlocksChange,
  disabled = false,
}) => {
  const { blocks, isLoading, error } = useBlocksData(campId);

  const allSelected = useMemo(
    () => blocks.length > 0 && selectedBlocks.length === blocks.length,
    [blocks, selectedBlocks]
  );

  const handleSelectAll = () => {
    if (allSelected) {
      onBlocksChange([]);
    } else {
      onBlocksChange(blocks.map((b) => b.id));
    }
  };

  const handleToggleBlock = (blockId: string) => {
    if (selectedBlocks.includes(blockId)) {
      onBlocksChange(selectedBlocks.filter((id) => id !== blockId));
    } else {
      onBlocksChange([...selectedBlocks, blockId]);
    }
  };

  const totalRooms = useMemo(
    () =>
      blocks
        .filter((b) => selectedBlocks.includes(b.id))
        .reduce((sum, b) => sum + b.roomCount, 0),
    [blocks, selectedBlocks]
  );

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando pabellones...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar pabellones</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Seleccionar Pabellones</Typography>
        <Button
          size="small"
          onClick={handleSelectAll}
          disabled={disabled || blocks.length === 0}
        >
          {allSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
        </Button>
      </Box>

      {selectedBlocks.length > 0 && (
        <Box mb={2}>
          <Chip
            label={`${selectedBlocks.length} pabellones - ${totalRooms} habitaciones`}
            color="primary"
            size="small"
          />
        </Box>
      )}

      <Grid container spacing={2}>
        {blocks.map((block) => (
          <Grid item xs={12} sm={6} md={4} key={block.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedBlocks.includes(block.id)}
                  onChange={() => handleToggleBlock(block.id)}
                  disabled={disabled}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">{block.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {block.roomCount} habitaciones
                  </Typography>
                  {block.hasActiveReservations && (
                    <Chip label="Con reservas" size="small" sx={{ ml: 1 }} />
                  )}
                </Box>
              }
            />
          </Grid>
        ))}
      </Grid>

      {blocks.length === 0 && (
        <Typography color="text.secondary" align="center">
          No hay pabellones disponibles
        </Typography>
      )}
    </Paper>
  );
};

export default BlockMultiSelector;
