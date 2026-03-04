import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box, Chip } from "@mui/material";
import React from "react";
import tagRoleMap from "../../tag/enum/RoleTag";
import { LostBedRoomContract } from "../models/LostBedRoomContract";

const tagColorMap: Record<
  number,
  { bg: string; text: string; accent: string }
> = {
  0: { bg: "#10B98120", text: "#047857", accent: "#10B981" }, // Manager
  1: { bg: "#F59E0B20", text: "#B45309", accent: "#F59E0B" }, // Supervisor
  2: { bg: "#8B5CF620", text: "#5B21B6", accent: "#8B5CF6" }, // Trabajador
};

interface LostBedRoomCardProps {
  room: LostBedRoomContract;
}

const LostBedRoomCard: React.FC<LostBedRoomCardProps> = ({ room }) => {
  const colors = tagColorMap[room.tag] || tagColorMap[2];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        bgcolor: "#f7f7f7",
        borderRadius: 2.5,
        p: 1.5,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        border: `1px solid #EEEEEE`,
      }}
    >
      {/* Top row: icon + room name + tag badge */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "#e8eaf6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MeetingRoomIcon sx={{ fontSize: 24, color: "#1976d2" }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>
            Room {room.roomNumber}
          </Box>
        </Box>
        <Chip
          label={tagRoleMap[room.tag] || `Tag ${room.tag}`}
          size="small"
          sx={{
            backgroundColor: colors.accent,
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.65rem",
            height: 22,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>

      {/* Details */}
      <Box
        sx={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.8, pl: 0.5 }}
      >
        <Box>
          • Camas Estándar:{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
            {String(room.expectedBeds).padStart(2, "0")}
          </Box>
        </Box>
        <Box>
          • Camas Reales:{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
            {String(room.actualBeds).padStart(2, "0")}
          </Box>
        </Box>
        <Box>
          • Camas Perdidas:{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
            {String(room.lostBeds).padStart(2, "0")}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LostBedRoomCard;
