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
  Divider,
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
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
        Objetivos de Aplicación.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>

        {/* Left Side: Scope Options */}
        <Box sx={{ minWidth: { md: '320px' }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {[
            { value: 'camp', label: 'Todo el campamento.', desc: 'La regla se aplicará a todas las habitaciones.' },
            { value: 'block', label: 'Pabellones específicos.', desc: 'Selecciona uno o más pabellones.' },
            { value: 'room', label: 'Habitaciones específicas.', desc: 'Selecciona habitaciones individuales.' },
            { value: 'jobTag', label: 'Por categoría de habitación.', desc: 'La regla aplicará a la categoría seleccionada.' }
          ].map((option) => {
            const isSelected = appliesTo === option.value;
            return (
              <Box
                key={option.value}
                onClick={() => handleScopeChange({ target: { value: option.value } } as any)}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: isSelected ? '#415EDE' : '#E5E7EB',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0px 0px 0px 1px #415EDE' : 'none',
                  '&:hover': { borderColor: '#415EDE' }
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {option.desc}
                  </Typography>
                </Box>
                <Radio
                  checked={isSelected}
                  sx={{ p: 0, '&.Mui-checked': { color: '#415EDE' }, color: '#D1D5DB' }}
                />
              </Box>
            );
          })}
        </Box>


        <Divider orientation="vertical" flexItem />

        {/* Right Side: Selected Scope Content */}
        <Box sx={{ flex: 1, width: '100%' }}>
          {errors?.targetIds && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {errors.targetIds}
            </Alert>
          )}

          {appliesTo === 'camp' && (
            <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111827' }}>
                Alcance Completo.
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Al seleccionar todo el campamento, no es necesario configurar opciones adicionales.
                La regla se aplicará automáticamente a todas las habitaciones del sistema.
              </Typography>
            </Box>
          )}

          {appliesTo === 'block' && (
            <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                  Pabellones Disponibles.
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {selectedTargets.length} seleccionado(s)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button size="small" variant="outlined" onClick={handleSelectAllBlocks} sx={{ textTransform: 'none', borderRadius: '6px', color: '#374151', borderColor: '#E5E7EB' }}>
                  Seleccionar Todos
                </Button>
                <Button size="small" variant="outlined" onClick={handleDeselectAllBlocks} sx={{ textTransform: 'none', borderRadius: '6px', color: '#374151', borderColor: '#E5E7EB' }}>
                  Deseleccionar
                </Button>
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={30} /></Box>
              ) : availableBlocks.length === 0 ? (
                <Alert severity="info" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', '& .MuiAlert-icon': { color: '#2563EB' } }}>No hay pabellones disponibles.</Alert>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  <FormGroup>
                    {availableBlocks.map((block) => {
                      const roomCount = getBlockRoomCount(block.id);
                      const isSelected = selectedTargets.includes(block.id);
                      return (
                        <FormControlLabel
                          key={block.id}
                          control={
                            <Checkbox checked={isSelected} onChange={() => handleBlockToggle(block.id)} sx={{ '&.Mui-checked': { color: '#415EDE' } }} />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                              <Typography variant="body2" sx={{ color: '#374151' }}>{block.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#9CA3AF', ml: 'auto' }}>
                                {roomCount} habitaciones
                              </Typography>
                            </Box>
                          }
                          sx={{ mb: 0.5, p: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#F9FAFB' } }}
                        />
                      );
                    })}
                  </FormGroup>
                </Box>
              )}
            </Box>
          )}

          {appliesTo === 'room' && (
            <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
                  Habitaciones Disponibles.
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Mostrando {paginatedRooms.length} de {filteredRooms.length}
                </Typography>
              </Box>

              <Box
                component="input"
                type="text"
                placeholder="Buscar habitación o pabellón..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setRoomsPage(1);
                }}
                sx={{
                  width: '100%', height: 44, px: 4, mb: 2,
                  borderRadius: '8px', border: '1px solid #E5E7EB',
                  bgcolor: '#F9FAFB', fontSize: '0.9375rem', outline: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'left 12px center',
                  '&:focus': { borderColor: '#415EDE', bgcolor: 'white' }
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button size="small" variant="outlined" onClick={handleSelectAllRooms} sx={{ textTransform: 'none', borderRadius: '6px', color: '#374151', borderColor: '#E5E7EB' }}>
                  Seleccionar Visibles
                </Button>
                <Button size="small" variant="outlined" onClick={handleDeselectAllRooms} sx={{ textTransform: 'none', borderRadius: '6px', color: '#374151', borderColor: '#E5E7EB' }}>
                  Deseleccionar Todos
                </Button>
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={30} /></Box>
              ) : paginatedRooms.length === 0 ? (
                <Alert severity="info" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', '& .MuiAlert-icon': { color: '#2563EB' } }}>
                  {filteredRooms.length === 0 ? 'No hay habitaciones disponibles.' : 'No hay resultados que coincidan.'}
                </Alert>
              ) : (
                <Box>
                  <FormGroup>
                    {paginatedRooms.map((room) => {
                      const isSelected = selectedTargets.includes(room.id);
                      return (
                        <FormControlLabel
                          key={room.id}
                          control={
                            <Checkbox checked={isSelected} onChange={() => handleRoomToggle(room.id)} sx={{ '&.Mui-checked': { color: '#415EDE' } }} />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                              <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                                Hab. {room.number}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                - {room.blockName}
                              </Typography>
                            </Box>
                          }
                          sx={{ mb: 0.5, p: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#F9FAFB' } }}
                        />
                      );
                    })}
                  </FormGroup>
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination count={totalPages} page={roomsPage} onChange={(_, page) => setRoomsPage(page)} color="primary" />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {appliesTo === 'jobTag' && (
            <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'white', border: '1px solid #E5E7EB' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
                Categorías Disponibles.
              </Typography>
              {errors?.targetJobTag && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
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
                {[
                  { val: 'CategoriaA', label: 'General / Gerente (Categoría A)' },
                  { val: 'CategoriaB', label: 'Especializada / Supervisor (Categoría B)' },
                  { val: 'CategoriaC', label: 'Básica / Trabajador (Categoría C)' }
                ].map(opt => (
                  <FormControlLabel
                    key={opt.val}
                    value={opt.val}
                    control={<Radio sx={{ '&.Mui-checked': { color: '#415EDE' } }} />}
                    label={<Typography variant="body2" sx={{ color: '#374151' }}>{opt.label}</Typography>}
                    sx={{ mb: 1, p: 1, borderRadius: 1, '&:hover': { bgcolor: '#F9FAFB' } }}
                  />
                ))}
              </RadioGroup>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(TargetSelector);
