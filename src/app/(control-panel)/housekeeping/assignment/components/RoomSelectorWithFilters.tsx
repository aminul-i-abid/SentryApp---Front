import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRoomsPaged } from '@/store/housekeeping/assignmentGroupThunks';
import type { RoomOption } from '@/store/housekeeping/housekeepingTypes';
import apiService from '@/utils/apiService';

// ─── Local block shape from /Blocks endpoint ──────────────────────────────────

interface BlockFilterItem {
  id: string;
  name: string;
}

interface BlockApiItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoomSelectorWithFiltersProps {
  campId: string;
  selectedRooms: RoomOption[];
  onRoomsChange: (rooms: RoomOption[]) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;
const SELECT_ALL_PAGE_SIZE = 1000;

const RoomSelectorWithFilters: React.FC<RoomSelectorWithFiltersProps> = ({
  campId,
  selectedRooms,
  onRoomsChange,
  disabled = false,
}) => {
  const dispatch = useAppDispatch();

  const roomsPage = useAppSelector((state) => state.housekeeping.roomsPage);
  const roomsLoading = useAppSelector((state) => state.housekeeping.roomsLoading);

  // ─── Filter state ──────────────────────────────────────────────────────────

  const [filterBlockId, setFilterBlockId] = useState<string>('');
  const [filterFloor, setFilterFloor] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed for MUI

  // ─── Blocks for filter dropdown ───────────────────────────────────────────

  const [blocks, setBlocks] = useState<BlockFilterItem[]>([]);
  const [blocksLoading, setBlocksLoading] = useState<boolean>(false);

  const fetchBlocks = useCallback(async () => {
    if (!campId) return;
    setBlocksLoading(true);
    try {
      const response = await apiService.get(`/Blocks?campId=${campId}`);
      const raw: BlockApiItem[] = response.data?.data ?? [];
      setBlocks(raw.map((b) => ({ id: b.id, name: b.name })));
    } catch {
      setBlocks([]);
    } finally {
      setBlocksLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    void fetchBlocks();
  }, [fetchBlocks]);

  // ─── Fetch rooms ───────────────────────────────────────────────────────────

  const fetchRooms = useCallback(
    (page: number) => {
      void dispatch(
        getRoomsPaged({
          // RoomsPagedRequest.campId is number (long on backend)
          campId: parseInt(campId, 10),
          // blockId is also number (long? on backend)
          blockId: filterBlockId ? parseInt(filterBlockId, 10) : undefined,
          floor: filterFloor ? parseInt(filterFloor, 10) : undefined,
          search: filterSearch || undefined,
          page: page + 1, // API is 1-indexed
          pageSize: PAGE_SIZE,
        })
      );
    },
    [dispatch, campId, filterBlockId, filterFloor, filterSearch]
  );

  // Fetch on mount
  useEffect(() => {
    fetchRooms(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campId]);

  // ─── Search button handler ─────────────────────────────────────────────────

  const handleSearch = () => {
    setCurrentPage(0);
    fetchRooms(0);
  };

  // ─── Pagination handler ────────────────────────────────────────────────────

  const handlePageChange = (_event: unknown, newPage: number) => {
    setCurrentPage(newPage);
    fetchRooms(newPage);
  };

  // ─── Checkbox handlers ─────────────────────────────────────────────────────

  const isRoomSelected = (roomId: string): boolean =>
    selectedRooms.some((r) => r.id === roomId);

  const handleToggleRoom = (room: RoomOption) => {
    if (isRoomSelected(room.id)) {
      onRoomsChange(selectedRooms.filter((r) => r.id !== room.id));
    } else {
      onRoomsChange([...selectedRooms, room]);
    }
  };

  // ─── Select all in current filter ─────────────────────────────────────────

  const handleSelectAllFiltered = async () => {
    try {
      const result = await dispatch(
        getRoomsPaged({
          campId: parseInt(campId, 10),
          blockId: filterBlockId ? parseInt(filterBlockId, 10) : undefined,
          floor: filterFloor ? parseInt(filterFloor, 10) : undefined,
          search: filterSearch || undefined,
          page: 1,
          pageSize: SELECT_ALL_PAGE_SIZE,
        })
      ).unwrap();

      const newRooms = result.items;

      // Merge with existing selection, deduplicate by id
      const mergedMap = new Map<string, RoomOption>();
      selectedRooms.forEach((r) => mergedMap.set(r.id, r));
      newRooms.forEach((r) => mergedMap.set(r.id, r));

      onRoomsChange(Array.from(mergedMap.values()));
    } catch {
      // silently handle — dispatch errors are already captured in Redux state
    }
  };

  // ─── Derived values ────────────────────────────────────────────────────────

  const currentRows: RoomOption[] = roomsPage?.items ?? [];
  const totalItems: number = roomsPage?.totalItems ?? 0;

  return (
    <Box>
      {/* Filter bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          alignItems: 'flex-end',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled || blocksLoading}>
          <InputLabel id="room-filter-block-label">Pabellón</InputLabel>
          <Select
            labelId="room-filter-block-label"
            value={filterBlockId}
            label="Pabellón"
            onChange={(e: SelectChangeEvent<string>) => setFilterBlockId(e.target.value)}
          >
            <MenuItem value="">
              <em>Todos los pabellones</em>
            </MenuItem>
            {blocks.map((block) => (
              <MenuItem key={block.id} value={block.id}>
                {block.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Piso"
          type="number"
          size="small"
          value={filterFloor}
          onChange={(e) => setFilterFloor(e.target.value)}
          disabled={disabled}
          sx={{ width: 100 }}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="N° Habitación"
          size="small"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          disabled={disabled}
          sx={{ width: 160 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <Button
          variant="contained"
          size="medium"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={disabled || roomsLoading}
        >
          Buscar
        </Button>
      </Box>

      {/* Counter header and "Select all" button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {selectedRooms.length > 0
            ? `${selectedRooms.length} habitaciones seleccionadas`
            : 'Ninguna habitación seleccionada'}
        </Typography>

        <Button
          size="small"
          variant="outlined"
          onClick={() => void handleSelectAllFiltered()}
          disabled={disabled || roomsLoading || totalItems === 0}
        >
          Seleccionar todo en filtro actual
        </Button>
      </Box>

      {/* Loading bar */}
      {roomsLoading && <LinearProgress sx={{ mb: 1 }} />}

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>N° Hab.</TableCell>
              <TableCell>Pabellón</TableCell>
              <TableCell>Piso</TableCell>
              <TableCell>Camas</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!roomsLoading && currentRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No se encontraron habitaciones con los filtros aplicados.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {roomsLoading && currentRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={28} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {currentRows.map((room) => {
              const checked = isRoomSelected(room.id);
              return (
                <TableRow
                  key={room.id}
                  hover
                  selected={checked}
                  onClick={() => {
                    if (!disabled) handleToggleRoom(room);
                  }}
                  sx={{ cursor: disabled ? 'default' : 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onChange={() => handleToggleRoom(room)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {room.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{room.blockName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {room.floor !== undefined && room.floor !== null
                        ? room.floor
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{room.bedCount}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalItems}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        labelRowsPerPage="Filas por página:"
      />
    </Box>
  );
};

export default RoomSelectorWithFilters;
