import React, { useState, useMemo } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Button,
  Typography,
  Grid,
  TextField,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { ApplicationScope } from '../types/ruleConfiguratorTypes';
import type { Block, Room } from '../../../assignment/types/assignmentTypes';
import type { JobTagValue } from '@/store/housekeeping/housekeepingTypes';

/**
 * Props for TargetSelector component
 */
interface TargetSelectorProps {
  appliesTo: ApplicationScope;
  selectedTargets: string[];
  availableBlocks: Block[];
  availableRooms: Room[];
  onTargetsChange: (targets: string[]) => void;
  onScopeChange: (scope: ApplicationScope) => void;
  errors?: Record<string, string>;
  isLoading?: boolean;
  selectedJobTag?: JobTagValue | null;
  onJobTagChange?: (v: JobTagValue | null) => void;
}

/**
 * TargetSelector - Component for selecting rule application targets
 * Provides scope selection (camp, blocks, rooms) with conditional multi-selectors
 *
 * @component
 * @example
 * const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
 * const [scope, setScope] = useState<ApplicationScope>('camp');
 * return (
 *   <TargetSelector
 *     appliesTo={scope}
 *     selectedTargets={selectedTargets}
 *     availableBlocks={blocks}
 *     availableRooms={rooms}
 *     onScopeChange={setScope}
 *     onTargetsChange={setSelectedTargets}
 *   />
 * );
 */
const TargetSelector: React.FC<TargetSelectorProps> = ({
  appliesTo,
  selectedTargets,
  availableBlocks,
  availableRooms,
  onTargetsChange,
  onScopeChange,
  errors = {},
  isLoading = false,
  selectedJobTag = null,
  onJobTagChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomsPage, setRoomsPage] = useState(1);
  const ROOMS_PER_PAGE = 10;

  /**
   * Handle scope change - clear selections when switching scope
   */
  const handleScopeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScope = event.target.value as ApplicationScope;
    onScopeChange(newScope);
    onTargetsChange([]);
    setSearchTerm('');
    setRoomsPage(1);
  };

  /**
   * Handle select all blocks
   */
  const handleSelectAllBlocks = () => {
    onTargetsChange(availableBlocks.map((b) => b.id));
  };

  /**
   * Handle deselect all blocks
   */
  const handleDeselectAllBlocks = () => {
    onTargetsChange([]);
  };

  /**
   * Handle select all rooms
   */
  const handleSelectAllRooms = () => {
    const filteredRooms = appliesTo === 'room'
      ? availableRooms.filter((r) =>
          r.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.blockName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableRooms;
    onTargetsChange(filteredRooms.map((r) => r.id));
  };

  /**
   * Handle deselect all rooms
   */
  const handleDeselectAllRooms = () => {
    onTargetsChange([]);
  };

  /**
   * Handle individual block toggle
   */
  const handleBlockToggle = (blockId: string) => {
    if (selectedTargets.includes(blockId)) {
      onTargetsChange(selectedTargets.filter((id) => id !== blockId));
    } else {
      onTargetsChange([...selectedTargets, blockId]);
    }
  };

  /**
   * Handle individual room toggle
   */
  const handleRoomToggle = (roomId: string) => {
    if (selectedTargets.includes(roomId)) {
      onTargetsChange(selectedTargets.filter((id) => id !== roomId));
    } else {
      onTargetsChange([...selectedTargets, roomId]);
    }
  };

  /**
   * Filter rooms based on search term
   */
  const filteredRooms = useMemo(() => {
    if (!searchTerm) {
      return availableRooms;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return availableRooms.filter(
      (room) =>
        room.number.toLowerCase().includes(lowerSearchTerm) ||
        room.blockName.toLowerCase().includes(lowerSearchTerm)
    );
  }, [availableRooms, searchTerm]);

  /**
   * Calculate room count for blocks
   */
  const getBlockRoomCount = (blockId: string): number => {
    return availableRooms.filter((r) => r.blockId === blockId).length;
  };

  /**
   * Get selected block names
   */
  const getSelectedBlockNames = (): string => {
    const names = selectedTargets
      .map((id) => availableBlocks.find((b) => b.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : 'Ninguno seleccionado';
  };

  /**
   * Get selected room count
   */
  const getSelectedRoomCount = (): number => {
    return selectedTargets.length;
  };

  /**
   * Paginated rooms
   */
  const paginatedRooms = useMemo(() => {
    const startIndex = (roomsPage - 1) * ROOMS_PER_PAGE;
    const endIndex = startIndex + ROOMS_PER_PAGE;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, roomsPage]);

  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>Objetivos de Aplicación</span>
        {appliesTo !== 'camp' && selectedTargets.length > 0 && (
          <Chip
            size="small"
            icon={<CheckCircleIcon />}
            label={`${selectedTargets.length} seleccionado${selectedTargets.length !== 1 ? 's' : ''}`}
            color="success"
            variant="outlined"
          />
        )}
      </Typography>

      {/* Scope Selection */}
      <RadioGroup value={appliesTo} onChange={handleScopeChange}>
        <FormControlLabel
          value="camp"
          control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Todo el campamento
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                La regla se aplicará a todas las habitaciones
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          value="block"
          control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Pabellones específicos
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Selecciona uno o más pabellones
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          value="room"
          control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Habitaciones específicas
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Selecciona habitaciones individuales
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          value="jobTag"
          control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Por categoría de habitación
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                La regla se aplicará a todas las habitaciones de la categoría seleccionada
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
      </RadioGroup>

      {/* Error message for target selection */}
      {errors?.targetIds && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.targetIds}
        </Alert>
      )}

      {/* Block Selection */}
      {appliesTo === 'block' && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Pabellones Disponibles
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={handleSelectAllBlocks}>
                Seleccionar Todos
              </Button>
              <Button size="small" variant="outlined" onClick={handleDeselectAllBlocks}>
                Deseleccionar Todos
              </Button>
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : availableBlocks.length === 0 ? (
            <Alert severity="info">No hay pabellones disponibles</Alert>
          ) : (
            <FormGroup>
              {availableBlocks.map((block) => {
                const roomCount = getBlockRoomCount(block.id);
                const isSelected = selectedTargets.includes(block.id);

                return (
                  <FormControlLabel
                    key={block.id}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleBlockToggle(block.id)}
                        sx={{ '&.Mui-checked': { color: '#415EDE' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography variant="body2">{block.name}</Typography>
                        <Chip
                          label={`${roomCount} habitaciones`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      p: 1.5,
                      backgroundColor: isSelected ? 'success.lighter' : 'transparent',
                      borderRadius: 1,
                      border: isSelected ? '1px solid' : 'none',
                      borderColor: 'success.light',
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </FormGroup>
          )}

          {/* Summary for blocks */}
          {selectedTargets.length > 0 && (
            <Paper sx={{ mt: 2, p: 2, backgroundColor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                PABELLONES SELECCIONADOS
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {getSelectedBlockNames()}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Room Selection */}
      {appliesTo === 'room' && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Habitaciones Disponibles
          </Typography>

          {/* Search Field */}
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por número de habitación o pabellón..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setRoomsPage(1);
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '&:hover fieldset': {
                  borderColor: '#415EDE',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#415EDE',
                  borderWidth: '2px',
                }
              }
            }}
          />

          {/* Select All / Deselect All Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button size="small" variant="outlined" onClick={handleSelectAllRooms}>
              Seleccionar Visibles
            </Button>
            <Button size="small" variant="outlined" onClick={handleDeselectAllRooms}>
              Deseleccionar Todos
            </Button>
          </Box>

          {/* Room Count Info */}
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Mostrando {paginatedRooms.length} de {filteredRooms.length} habitaciones
          </Typography>

          {/* Room Selection */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : paginatedRooms.length === 0 ? (
            <Alert severity="info">
              {filteredRooms.length === 0
                ? 'No hay habitaciones disponibles'
                : 'No hay habitaciones que coincidan con la búsqueda'}
            </Alert>
          ) : (
            <FormGroup>
              {paginatedRooms.map((room) => {
                const isSelected = selectedTargets.includes(room.id);

                return (
                  <FormControlLabel
                    key={room.id}
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleRoomToggle(room.id)}
                        sx={{ '&.Mui-checked': { color: '#415EDE' } }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography variant="body2">
                          Habitación {room.number} - {room.blockName}
                        </Typography>
                        <Chip
                          label={`${room.bedCount} camas`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      p: 1.5,
                      backgroundColor: isSelected ? 'success.lighter' : 'transparent',
                      borderRadius: 1,
                      border: isSelected ? '1px solid' : 'none',
                      borderColor: 'success.light',
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </FormGroup>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={roomsPage}
                onChange={(_, page) => setRoomsPage(page)}
                color="primary"
              />
            </Box>
          )}

          {/* Summary for rooms */}
          {selectedTargets.length > 0 && (
            <Paper sx={{ mt: 2, p: 2, backgroundColor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main' }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                    HABITACIONES SELECCIONADAS
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {getSelectedRoomCount()} habitación{getSelectedRoomCount() !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* JobTag Selection */}
      {appliesTo === 'jobTag' && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Seleccionar categoría:
          </Typography>
          {errors?.targetJobTag && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.targetJobTag}
            </Alert>
          )}
          <RadioGroup
            value={selectedJobTag || ''}
            onChange={(e) => {
              if (onJobTagChange) {
                const rawValue = e.target.value;
                onJobTagChange(rawValue ? (rawValue as JobTagValue) : null);
              }
            }}
          >
            <FormControlLabel
              value="CategoriaA"
              control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Gerente
                  </Typography>
                </Box>
              }
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              value="CategoriaB"
              control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Supervisor
                  </Typography>
                </Box>
              }
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              value="CategoriaC"
              control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Trabajador
                  </Typography>
                </Box>
              }
              sx={{ mb: 1 }}
            />
          </RadioGroup>
          {selectedJobTag && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main' }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                    CATEGORÍA SELECCIONADA
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedJobTag === 'CategoriaA' && 'Gerente'}
                    {selectedJobTag === 'CategoriaB' && 'Supervisor'}
                    {selectedJobTag === 'CategoriaC' && 'Trabajador'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Camp scope info */}
      {appliesTo === 'camp' && (
        <Paper
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <CancelIcon sx={{ color: 'warning.main', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Alcance Completo
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Esta regla se aplicará a todas las habitaciones del campamento. Usa esta opción con cuidado ya que
                impactará en todas las operaciones de aseo.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default React.memo(TargetSelector);
