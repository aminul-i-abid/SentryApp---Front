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
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getRoomsPaged } from '@/store/housekeeping/assignmentGroupThunks';
import type { RoomOption } from '@/store/housekeeping/housekeepingTypes';
import apiService from '@/utils/apiService';
import StyledTable, { TableColumnDef } from '@/components/ui/StyledTable';

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

const PAGE_SIZE = 15;
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
        <FormControl size="small" sx={{ 
          minWidth: 180,
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#415EDE',
          },
        }} disabled={disabled || blocksLoading}>
          <InputLabel id="room-filter-block-label">Pabellón</InputLabel>
          <Select
            labelId="room-filter-block-label"
            value={filterBlockId}
            label="Pabellón"
            onChange={(e: SelectChangeEvent<string>) => setFilterBlockId(e.target.value)}
            sx={{ 
              bgcolor: 'white',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#415EDE',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#415EDE',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: 'white',
                  border: '6px solid #f3f4f6',
                },
              },
            }}
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
          sx={{
            width: 100,
            "& .MuiOutlinedInput-root": {
              bgcolor: 'white',
              '&:hover fieldset': {
                borderColor: '#415EDE',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#415EDE',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#415EDE',
            },
          }}
          inputProps={{ min: 0 }}
        />

        <TextField
          label="N° Habitación"
          size="small"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          disabled={disabled}
          sx={{
            width: 160,
            "& .MuiOutlinedInput-root": {
              bgcolor: 'white',
              '&:hover fieldset': {
                borderColor: '#415EDE',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#415EDE',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#415EDE',
            },
          }}
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
          sx={{
            backgroundColor: "white",
            border: "1px solid gray"
          }}
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

        {/* <Button
          size="small"
          variant="outlined"
          onClick={() => void handleSelectAllFiltered()}
          disabled={disabled || roomsLoading || totalItems === 0}
        >
          Seleccionar todo en filtro actual
        </Button> */}
      </Box>

      {/* Loading bar */}
      {roomsLoading && <LinearProgress sx={{ mb: 1 }} />}

      {/* Styled Table */}
      <StyledTable<RoomOption>
        loading={roomsLoading}
        data={currentRows}
        getRowId={(room) => room.id}
        selectable
        selected={selectedRooms.map((r) => r.id)}
        onSelectRow={(_, id) => {
          if (disabled) return;
          const room = currentRows.find((r) => r.id === id);
          if (room) handleToggleRoom(room);
        }}
        onSelectAll={(e) => {
          if (disabled) return;
          if (e.target.checked) {
            // Select all visible items
            const newRooms = [...selectedRooms];
            currentRows.forEach((r) => {
              if (!newRooms.some((nr) => nr.id === r.id)) {
                newRooms.push(r);
              }
            });
            onRoomsChange(newRooms);
          } else {
            // Unselect visible items
            const visibleIds = currentRows.map((r) => r.id);
            onRoomsChange(selectedRooms.filter((r) => !visibleIds.includes(r.id)));
          }
        }}
        isRowSelectable={() => !disabled}
        columns={[
          {
            id: 'number',
            label: 'N° Hab.',
            render: (room) => (
              <Typography variant="body2" fontWeight={500}>
                {room.number}
              </Typography>
            ),
          },
          {
            id: 'blockName',
            label: 'Pabellón',
            render: (room) => (
              <Typography variant="body2">{room.blockName}</Typography>
            ),
          },
          {
            id: 'floor',
            label: 'Piso',
            render: (room) => (
              <Typography variant="body2">
                {room.floor !== undefined && room.floor !== null
                  ? room.floor
                  : '—'}
              </Typography>
            ),
          },
          {
            id: 'bedCount',
            label: 'Camas',
            render: (room) => (
              <Typography variant="body2">{room.bedCount}</Typography>
            ),
          },
        ]}
        pagination={{
          count: totalItems,
          page: currentPage,
          rowsPerPage: PAGE_SIZE,
          onPageChange: handlePageChange,
        }}
        minWidth={600}
        emptyMessage="No rooms found with applied filters."
      />
    </Box>
  );
};

export default RoomSelectorWithFilters;
