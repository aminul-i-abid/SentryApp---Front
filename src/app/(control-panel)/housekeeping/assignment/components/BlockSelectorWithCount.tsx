import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import apiService from '@/utils/apiService';
import { useAppDispatch } from '@/store/hooks';
import { getBlockRoomCount } from '@/store/housekeeping/assignmentGroupThunks';

// ─── Local block shape from /Blocks endpoint ──────────────────────────────────

interface BlockItem {
  id: string;
  name: string;
}

interface BlockApiItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockSelectorWithCountProps {
  campId: string;
  selectedBlockId: string | null;
  /**
   * Called when the user selects a block.
   * blockName is included so parent screens can display the human-readable
   * name in the confirmation step without an extra lookup.
   */
  onBlockSelect: (blockId: string, roomCount: number, blockName: string) => void;
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BlockSelectorWithCount: React.FC<BlockSelectorWithCountProps> = ({
  campId,
  selectedBlockId,
  onBlockSelect,
  disabled = false,
}) => {
  const dispatch = useAppDispatch();

  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [roomCounts, setRoomCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState<Record<string, boolean>>({});
  const [blocksLoading, setBlocksLoading] = useState<boolean>(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);

  // ─── Load blocks on mount / campId change ──────────────────────────────────

  const fetchBlocks = useCallback(async () => {
    if (!campId) return;

    setBlocksLoading(true);
    setBlocksError(null);

    try {
      const response = await apiService.get(`/Blocks?campId=${campId}`);
      const rawBlocks: BlockApiItem[] = response.data?.data ?? [];
      const mapped: BlockItem[] = rawBlocks.map((b) => ({ id: b.id, name: b.name }));
      setBlocks(mapped);
    } catch {
      setBlocksError('Error al cargar pabellones. Intente nuevamente.');
      setBlocks([]);
    } finally {
      setBlocksLoading(false);
    }
  }, [campId]);

  useEffect(() => {
    void fetchBlocks();
  }, [fetchBlocks]);

  // ─── Load room counts in batches after blocks are fetched ─────────────────
  // Uses Promise.allSettled in batches of 5 so a single failure does not
  // abort the remaining requests and we never overwhelm the server.

  useEffect(() => {
    if (blocks.length === 0) return;

    const fetchAllCounts = async () => {
      // Mark all as loading
      const initialLoading: Record<string, boolean> = {};
      blocks.forEach((b) => {
        initialLoading[b.id] = true;
      });
      setLoadingCounts(initialLoading);

      const batchSize = 5;
      const allResults: Array<{ blockId: string; count: number }> = [];

      for (let i = 0; i < blocks.length; i += batchSize) {
        const batch = blocks.slice(i, i + batchSize);

        const settled = await Promise.allSettled(
          batch.map((block) =>
            dispatch(getBlockRoomCount(block.id))
              .unwrap()
              .then((result) => ({ blockId: block.id, count: result.roomCount }))
              .catch(() => ({ blockId: block.id, count: 0 }))
          )
        );

        settled.forEach((outcome) => {
          if (outcome.status === 'fulfilled') {
            allResults.push(outcome.value);
          }
        });
      }

      setRoomCounts((prev) => {
        const updated = { ...prev };
        allResults.forEach(({ blockId, count }) => {
          updated[blockId] = count;
        });
        return updated;
      });

      setLoadingCounts((prev) => {
        const updated = { ...prev };
        allResults.forEach(({ blockId }) => {
          updated[blockId] = false;
        });
        return updated;
      });
    };

    void fetchAllCounts();
  }, [blocks, dispatch]);

  // ─── Handle block selection ────────────────────────────────────────────────

  const handleBlockSelect = (blockId: string) => {
    if (disabled) return;
    const count = roomCounts[blockId] ?? 0;
    const name = blocks.find((b) => b.id === blockId)?.name ?? '';
    onBlockSelect(blockId, count, name);
  };

  // ─── Render states ─────────────────────────────────────────────────────────

  if (blocksLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={32} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Cargando pabellones...
        </Typography>
      </Paper>
    );
  }

  if (blocksError) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{blocksError}</Alert>
      </Paper>
    );
  }

  if (blocks.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary" align="center">
          No hay pabellones disponibles para este campamento.
        </Typography>
      </Paper>
    );
  }

  return (
    <List disablePadding>
      {blocks.map((block) => {
        const isSelected = selectedBlockId === block.id;
        const countIsLoading = loadingCounts[block.id] ?? false;
        const count = roomCounts[block.id];

        return (
          <ListItemButton
            key={block.id}
            selected={isSelected}
            onClick={() => handleBlockSelect(block.id)}
            disabled={disabled}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              bgcolor: isSelected ? 'action.selected' : undefined,
              '&:hover': {
                bgcolor: isSelected ? 'action.selected' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {isSelected ? (
                <RadioButtonCheckedIcon color="primary" />
              ) : (
                <RadioButtonUncheckedIcon color="action" />
              )}
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                  {block.name}
                </Typography>
              }
              secondary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {countIsLoading ? (
                    <CircularProgress size={14} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {count !== undefined
                        ? `${count} habitaciones`
                        : 'Sin datos de habitaciones'}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default BlockSelectorWithCount;
