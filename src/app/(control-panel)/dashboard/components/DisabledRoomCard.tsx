import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box } from "@mui/material";
import React from "react";
import { DisabledRoomContract } from "../models/DisabledRoomsContracts";

interface DisabledRoomCardProps {
  room: DisabledRoomContract;
}

const DisabledRoomCard: React.FC<DisabledRoomCardProps> = ({ room }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "#f7f7f7",
        borderRadius: 2.5,
        p: 1,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        border: `1px solid #EEEEEE`,
      }}
    >
      {/* Room icon */}
      <Box
        sx={{
          width: 56,
          alignSelf: "stretch",
          borderRadius: 2,
          bgcolor: "#e8eaf6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MeetingRoomIcon sx={{ fontSize: 28, color: "#1976d2" }} />
      </Box>

      {/* Room info */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            mb: 0.3,
          }}
        >
          Room {room.roomNumber}
        </Box>
        <Box sx={{ fontSize: "0.8rem", color: "#686868", mb: 0.4 }}>
          Última fecha de deshabilitación:{" "}
          <Box component="span" sx={{ fontWeight: 500, color: "#475569" }}>
            {new Date(room.lastDisabledDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Box>
        </Box>
        <Box sx={{ fontSize: "0.8rem", color: "#686868" }}>
          Cama:{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#475569" }}>
            {String(room.beds).padStart(2, "0")}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DisabledRoomCard;
