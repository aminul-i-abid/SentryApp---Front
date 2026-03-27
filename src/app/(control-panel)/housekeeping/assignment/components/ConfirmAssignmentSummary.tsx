/**
 * ConfirmAssignmentSummary
 *
 * Inline summary panel displayed as the 4th step of the assignment Stepper.
 * Shows a read-only overview of the operator selection, assignment level
 * and the total number of rooms that will be affected.
 *
 * For level === 'block', rooms are grouped by blockName + floor to show
 * a clear breakdown like "Pabellón A — Piso 1 (30 hab.), Piso 2 (30 hab.)".
 */

import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type {
  AssignmentLevel,
  OperatorOption,
  RoomOption,
} from '@/store/housekeeping/housekeepingTypes';

// ─── Helper: initials from full name ─────────────────────────────────────────

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Level label map ──────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<AssignmentLevel, string> = {
  camp: 'Campamento Completo',
  block: 'Por Pabellón',
  rooms: 'Habitaciones Específicas',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConfirmAssignmentSummaryProps {
  operators: OperatorOption[];
  level: AssignmentLevel;
  campName: string;
  blockId: string | null;
  blockName?: string;
  blockRoomCount: number;
  rooms: RoomOption[];
}

// ─── Block+floor group shape for the 'block' level detail ────────────────────

interface BlockFloorSummary {
  blockName: string;
  floors: { floorNumber: number; roomCount: number }[];
  totalRooms: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ConfirmAssignmentSummary: React.FC<ConfirmAssignmentSummaryProps> = ({
  operators,
  level,
  campName,
  blockId,
  blockName,
  blockRoomCount,
  rooms,
}) => {
  // ─── Compute block+floor breakdown for 'block' level ─────────────────────

  const blockFloorSummaries = useMemo<BlockFloorSummary[]>(() => {
    if (level !== 'block' || rooms.length === 0) return [];

    const blockMap: Record<string, Record<number, number>> = {};

    rooms.forEach((room) => {
      const bName = room.blockName;
      const floor = room.floor ?? 1;
      if (!blockMap[bName]) blockMap[bName] = {};
      blockMap[bName][floor] = (blockMap[bName][floor] ?? 0) + 1;
    });

    return Object.entries(blockMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bName, floorCounts]) => {
        const floors = Object.entries(floorCounts)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([floor, count]) => ({ floorNumber: Number(floor), roomCount: count }));
        const totalRooms = floors.reduce((sum, f) => sum + f.roomCount, 0);
        return { blockName: bName, floors, totalRooms };
      });
  }, [level, rooms]);

  // ─── Derived display values ───────────────────────────────────────────────

  const totalRoomsDisplay: React.ReactNode =
    level === 'camp' ? (
      <Typography variant="h4" color="primary" component="span">
        Todas
      </Typography>
    ) : (
      <Typography variant="h4" color="primary" component="span">
        {rooms.length}
      </Typography>
    );

  const targetDescription: string =
    level === 'camp'
      ? `Campamento completo: ${campName}`
      : level === 'block'
        ? rooms.length > 0
          ? `${blockFloorSummaries.length} pabellón${blockFloorSummaries.length !== 1 ? 'es' : ''} seleccionado${blockFloorSummaries.length !== 1 ? 's' : ''}`
          : `Pabellón: ${blockName ?? blockId ?? '—'}`
        : `${rooms.length} habitación${rooms.length !== 1 ? 'es' : ''} específica${rooms.length !== 1 ? 's' : ''}`;

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Resumen de Asignación</Typography>

      {/* Operators */}
      <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff", borderRadius: "10px", border: "6px solid #f7f7f7" }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Operarios seleccionados ({operators.length})
        </Typography>
        {operators.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Ningún operario seleccionado.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {operators.map((op) => (
              <Chip
                key={op.id}
                label={op.fullName}
                avatar={
                  <Avatar sx={{ fontSize: '0.7rem' }}>
                    {getInitials(op.fullName)}
                  </Avatar>
                }
                variant="outlined"
                size="medium"
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Level */}
      <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff", borderRadius: "10px", border: "6px solid #f7f7f7" }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Nivel de asignación
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {LEVEL_LABELS[level]}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {targetDescription}
        </Typography>
      </Paper>

      {/* Room count */}
      <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff", borderRadius: "10px", border: "6px solid #f7f7f7" }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Total habitaciones afectadas
        </Typography>
        <Box sx={{ mt: 1 }}>
          {totalRoomsDisplay}
        </Box>
        {level === 'camp' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Se incluirán todas las habitaciones activas del campamento.
          </Typography>
        )}
      </Paper>

      {/* Block + floor breakdown — only for 'block' level */}
      {level === 'block' && blockFloorSummaries.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff", borderRadius: "10px", border: "6px solid #f7f7f7" }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Detalle por pabellón y piso
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {blockFloorSummaries.map((summary, idx) => (
              <Box key={summary.blockName}>
                {idx > 0 && <Divider sx={{ mb: 1.5 }} />}
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  Pabellón {summary.blockName}
                  {' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({summary.totalRooms} hab. en total)
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {summary.floors.map((f) => (
                    <Chip
                      key={`${summary.blockName}-${f.floorNumber}`}
                      label={`Piso ${f.floorNumber} (${f.roomCount} hab.)`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Rooms detail — only shown for specific-room level */}
      {level === 'rooms' && rooms.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Habitaciones seleccionadas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {rooms.map((room) => (
              <Chip
                key={room.id}
                label={`${room.blockName} — ${room.number}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
    </Stack>
  );
};

export default ConfirmAssignmentSummary;
