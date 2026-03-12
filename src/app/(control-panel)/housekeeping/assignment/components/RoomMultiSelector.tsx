import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  TextField,
  TablePagination,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRoomsData } from '../hooks/useRoomsData';

interface RoomMultiSelectorProps {
  campId: string;
  selectedRooms: string[];
  onRoomsChange: (roomIds: string[]) => void;
  filterByBlock?: string;
  disabled?: boolean;
}

const RoomMultiSelector: React.FC<RoomMultiSelectorProps> = ({
  campId,
  selectedRooms,
  onRoomsChange,
  filterByBlock,
  disabled = false,
}) => {
  const {
    rooms,
    totalCount,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
  } = useRoomsData({ campId, blockId: filterByBlock });

  const handleToggleRoom = (roomId: string) => {
    if (selectedRooms.includes(roomId)) {
      onRoomsChange(selectedRooms.filter((id) => id !== roomId));
    } else {
      onRoomsChange([...selectedRooms, roomId]);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const getStatusColor = (room: any) => {
    if (room.status === 'Maintenance') return 'error';
    if (room.hasActiveReservation) return 'warning';
    return 'success';
  };

  if (isLoading && rooms.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando habitaciones...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar habitaciones</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Seleccionar Habitaciones
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por número de habitación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {selectedRooms.length > 0 && (
        <Box mb={2}>
          <Chip
            label={`${selectedRooms.length} habitaciones seleccionadas`}
            color="primary"
            size="small"
          />
        </Box>
      )}

      <Grid container spacing={2}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedRooms.includes(room.id)}
                  onChange={() => handleToggleRoom(room.id)}
                  disabled={disabled || room.status === 'Maintenance'}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    Habitación {room.number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {room.blockName} - {room.bedCount} camas
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={
                        room.status === 'Maintenance'
                          ? 'Mantenimiento'
                          : room.hasActiveReservation
                          ? 'Ocupada'
                          : 'Disponible'
                      }
                      size="small"
                      color={getStatusColor(room)}
                    />
                  </Box>
                </Box>
              }
            />
          </Grid>
        ))}
      </Grid>

      {rooms.length === 0 && !isLoading && (
        <Typography color="text.secondary" align="center">
          {searchTerm
            ? 'No se encontraron habitaciones'
            : 'No hay habitaciones disponibles'}
        </Typography>
      )}

      {totalCount > 20 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
        />
      )}
    </Paper>
  );
};

export default RoomMultiSelector;
