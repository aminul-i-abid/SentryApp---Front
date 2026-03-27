/**
 * BlockFloorSelector
 *
 * Replaces BlockSelectorWithCount for the "Por Pabellón" step.
 * Makes a SINGLE API call to GET /api/Blocks?campId=X, which already
 * includes rooms[] per block. Derives floor groups entirely from that
 * payload — no N+1 room-count requests needed.
 *
 * Selection model: selecting a floor card adds ALL rooms on that floor
 * to the parent's selectedRooms array (RoomOption[]). Deselecting
 * removes them. The parent can mix floors from multiple blocks freely.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha, useTheme } from '@mui/material/styles';
import apiService from '@/utils/apiService';
import type { RoomOption } from '@/store/housekeeping/housekeepingTypes';

// ─── Local API shapes ─────────────────────────────────────────────────────────

interface BlockApiRoom {
  id: number;
  roomNumber: string;
  beds: number;
  isStorage: boolean;
  blockId: number;
  floorNumber: number | null;
  disabled: boolean;
}

interface BlockApiItem {
  id: number;
  name: string;
  campId: number;
  floors: number;
  prefix: string;
  suffix: string;
  campName: string;
  rooms: BlockApiRoom[];
}

// ─── Internal derived shapes ──────────────────────────────────────────────────

interface BlockRoom {
  id: string;
  roomNumber: string;
  beds: number;
  floorNumber: number;
  blockId: string;
  blockName: string;
}

interface FloorGroup {
  blockId: string;
  blockName: string;
  floorNumber: number;
  rooms: BlockRoom[];
  /** Unique key for selection tracking: `${blockId}-${floorNumber}` */
  key: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockFloorSelectorProps {
  campId: string;
  selectedRooms: RoomOption[];
  onRoomsChange: (rooms: RoomOption[]) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BlockFloorSelector: React.FC<BlockFloorSelectorProps> = ({
  campId,
  selectedRooms,
  onRoomsChange,
  disabled = false,
}) => {
  const theme = useTheme();

  const [blocks, setBlocks] = useState<BlockApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter: selected block name (null = show all)
  const [filterBlock, setFilterBlock] = useState<string | null>(null);

  // ─── Fetch blocks (single call) ──────────────────────────────────────────

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get(`/Blocks?campId=${campId}`);
      const rawBlocks: BlockApiItem[] = response.data?.data ?? [];
      setBlocks(rawBlocks);
    } catch {
      setError('Error al cargar pabellones. Intente nuevamente.');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    // Guard: do not fire if campId is empty or still defaulting.
    // campId arrives synchronously from user?.companyId — if user has not loaded
    // yet the parent passes the fallback '1', which is a valid non-empty string.
    // When the real companyId arrives, campId changes, fetchBlocks is recreated
    // (useCallback dep), and this effect re-runs automatically.
    if (!campId) return;
    void fetchBlocks();
  }, [campId, fetchBlocks]);

  // ─── Derive floor groups from blocks data ────────────────────────────────

  const floorGroups = useMemo<FloorGroup[]>(() => {
    const groups: FloorGroup[] = [];

    blocks.forEach((block) => {
      const floorMap: Record<number, BlockRoom[]> = {};

      block.rooms
        .filter((r) => !r.isStorage && !r.disabled)
        .forEach((room) => {
          const floor = room.floorNumber ?? 1;
          if (!floorMap[floor]) floorMap[floor] = [];
          floorMap[floor].push({
            id: String(room.id),
            roomNumber: room.roomNumber,
            beds: room.beds,
            floorNumber: floor,
            blockId: String(block.id),
            blockName: block.name,
          });
        });

      Object.entries(floorMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([floor, rooms]) => {
          groups.push({
            blockId: String(block.id),
            blockName: block.name,
            floorNumber: Number(floor),
            rooms,
            key: `${block.id}-${floor}`,
          });
        });
    });

    return groups;
  }, [blocks]);

  // ─── Block names for the filter Autocomplete ─────────────────────────────

  const blockNames = useMemo<string[]>(
    () => [...new Set(blocks.map((b) => b.name))].sort(),
    [blocks]
  );

  // ─── Groups visible after applying the filter ────────────────────────────

  const visibleGroups = useMemo<FloorGroup[]>(() => {
    if (!filterBlock) return floorGroups;
    return floorGroups.filter((fg) => fg.blockName === filterBlock);
  }, [floorGroups, filterBlock]);

  // ─── Group visible groups by block for rendering ─────────────────────────

  const groupsByBlock = useMemo<{ blockId: string; blockName: string; floors: FloorGroup[] }[]>(() => {
    const map: Record<string, { blockId: string; blockName: string; floors: FloorGroup[] }> = {};

    visibleGroups.forEach((fg) => {
      if (!map[fg.blockId]) {
        map[fg.blockId] = { blockId: fg.blockId, blockName: fg.blockName, floors: [] };
      }
      map[fg.blockId].floors.push(fg);
    });

    return Object.values(map);
  }, [visibleGroups]);

  // ─── Selection helpers ────────────────────────────────────────────────────

  const isFloorSelected = (fg: FloorGroup): boolean =>
    fg.rooms.every((r) => selectedRooms.some((sr) => sr.id === r.id));

  const toggleFloor = (fg: FloorGroup) => {
    if (disabled) return;

    if (isFloorSelected(fg)) {
      const roomIds = new Set(fg.rooms.map((r) => r.id));
      onRoomsChange(selectedRooms.filter((sr) => !roomIds.has(sr.id)));
    } else {
      const existingIds = new Set(selectedRooms.map((r) => r.id));
      const newRooms: RoomOption[] = fg.rooms
        .filter((r) => !existingIds.has(r.id))
        .map((r) => ({
          id: r.id,
          number: r.roomNumber,
          blockId: r.blockId,
          blockName: r.blockName,
          floor: r.floorNumber,
          bedCount: r.beds,
        }));
      onRoomsChange([...selectedRooms, ...newRooms]);
    }
  };

  // ─── Selected floor chips ─────────────────────────────────────────────────

  // Build a deduplicated list of selected floor groups based on current selectedRooms
  const selectedFloorGroups = useMemo<FloorGroup[]>(() => {
    const selectedIds = new Set(selectedRooms.map((r) => r.id));
    return floorGroups.filter((fg) => fg.rooms.some((r) => selectedIds.has(r.id)));
  }, [floorGroups, selectedRooms]);

  const removeFloor = (fg: FloorGroup) => {
    if (disabled) return;
    const roomIds = new Set(fg.rooms.map((r) => r.id));
    onRoomsChange(selectedRooms.filter((sr) => !roomIds.has(sr.id)));
  };

  // ─── Render states ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Cargando pabellones...
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (blocks.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary" align="center">
          No se encontraron pabellones para este campamento.
        </Typography>
      </Paper>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Filter + summary bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Autocomplete<string>
          options={blockNames}
          value={filterBlock}
          onChange={(_e, newValue) => setFilterBlock(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filtrar por pabellón"
              size="small"
              sx={{
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#415EDE',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#415EDE',
                    borderWidth: '2px',
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#415EDE',
                },
              }}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                bgcolor: 'white',
                border: '6px solid #f3f4f6',
              },
            },
          }}
          sx={{ minWidth: 220, bgcolor: 'white' }}
          disabled={disabled}
          clearOnEscape
        />

        <Typography variant="body2" color="text.secondary">
          {selectedRooms.length}{' '}
          {selectedRooms.length === 1 ? 'habitación seleccionada' : 'habitaciones seleccionadas'}
        </Typography>
      </Box>

      {/* Selected floor chips */}
      {selectedFloorGroups.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {selectedFloorGroups.map((fg) => (
            <Chip
              key={fg.key}
              label={`${fg.blockName} - Piso ${fg.floorNumber}`}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={disabled ? undefined : () => removeFloor(fg)}
            />
          ))}
        </Box>
      )}

      {/* Block sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, }}>
        {groupsByBlock.map(({ blockId, blockName, floors }) => (
          <Box key={blockId}>
            {/* Block header */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ textTransform: 'uppercase', mb: 0.5 }}
            >
              Pabellón {blockName}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            {/* Floor cards row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, }}>
              {floors.map((fg) => {
                const selected = isFloorSelected(fg);

                return (
                  <Card
                    key={fg.key}
                    variant="outlined"
                    sx={{
                      width: 150,
                      bgcolor: selected
                        ? alpha(theme.palette.primary.main, 0.08)
                        : 'background.paper',
                      position: 'relative',
                      transition: 'border-color 0.15s, background-color 0.15s',
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      border: "6px solid #f7f7f7",
                      "&:hover": {
                        backgroundColor: "#f7f7f7 !important"
                      }
                    }}
                  >
                    <CardActionArea
                      onClick={() => toggleFloor(fg)}
                      disabled={disabled}
                      sx={{ height: '100%' }}
                    >
                      {selected && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            fontSize: 18,
                          }}
                        />
                      )}
                      <CardContent sx={{ pt: 1.5, pb: '12px !important' }}>
                        <Typography variant="h6" gutterBottom sx={{ lineHeight: 1.2 }}>
                          Piso {fg.floorNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fg.rooms.length}{' '}
                          {fg.rooms.length === 1 ? 'habitación' : 'habitaciones'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BlockFloorSelector;
