import React, { useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  TextField,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Button,
  ButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useUsersData } from '../hooks/useUsersData';

interface UserMultiSelectorProps {
  campId: string;
  role: string;
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  showWorkload?: boolean;
}

type SortOption = 'name' | 'workload';

const UserMultiSelector: React.FC<UserMultiSelectorProps> = ({
  campId,
  role,
  selectedUsers,
  onUsersChange,
  showWorkload = true,
}) => {
  const { users, isLoading, error } = useUsersData({ campId, role });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('workload');

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'workload') {
      filtered = filtered.sort(
        (a, b) => (a.currentTaskCount || 0) - (b.currentTaskCount || 0)
      );
    } else {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [users, searchTerm, sortBy]);

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onUsersChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onUsersChange([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      onUsersChange([]);
    } else {
      onUsersChange(filteredAndSortedUsers.map((u) => u.id));
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando operarios...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar operarios</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Asignar a Operarios</Typography>
        <Button size="small" onClick={handleSelectAll}>
          {selectedUsers.length === filteredAndSortedUsers.length
            ? 'Deseleccionar Todos'
            : 'Seleccionar Todos'}
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar operario..."
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

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        {selectedUsers.length > 0 && (
          <Chip
            label={`${selectedUsers.length} operarios seleccionados`}
            color="primary"
            size="small"
          />
        )}
        {showWorkload && (
          <ButtonGroup size="small">
            <Button
              variant={sortBy === 'workload' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('workload')}
            >
              Por carga
            </Button>
            <Button
              variant={sortBy === 'name' ? 'contained' : 'outlined'}
              onClick={() => setSortBy('name')}
            >
              Por nombre
            </Button>
          </ButtonGroup>
        )}
      </Box>

      <Grid container spacing={2}>
        {filteredAndSortedUsers.map((user) => (
          <Grid item xs={12} sm={6} key={user.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleToggleUser(user.id)}
                  disabled={!user.isActive}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                    {showWorkload && user.currentTaskCount !== undefined && (
                      <Box mt={0.5}>
                        <Chip
                          label={`${user.currentTaskCount} tareas hoy`}
                          size="small"
                          color={
                            user.currentTaskCount === 0
                              ? 'success'
                              : user.currentTaskCount < 10
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              }
            />
          </Grid>
        ))}
      </Grid>

      {filteredAndSortedUsers.length === 0 && (
        <Typography color="text.secondary" align="center">
          {searchTerm
            ? 'No se encontraron operarios'
            : 'No hay operarios disponibles'}
        </Typography>
      )}
    </Paper>
  );
};

export default UserMultiSelector;
