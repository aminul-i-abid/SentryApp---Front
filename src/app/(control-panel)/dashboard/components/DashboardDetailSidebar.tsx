import CloseIcon from "@mui/icons-material/Close";
import { Box, Drawer, IconButton, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getDisabledRooms } from "../dashboardService";
import { DisabledRoomContract } from "../models/DisabledRoomsContracts";
import DisabledRoomCard from "./DisabledRoomCard";

interface DashboardDetailSidebarProps {
  selectedContractor: string;
  open: boolean;
  onClose: () => void;
}

const DashboardDetailSidebar: React.FC<DashboardDetailSidebarProps> = ({
  selectedContractor,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [disabledRoomsData, setDisabledRoomsData] = useState<
    DisabledRoomContract[] | null
  >(null);

  const fetchDisabledRooms = async () => {
    setLoading(true);
    try {
      const response = await getDisabledRooms(selectedContractor);

      if (response.succeeded) {
        setDisabledRoomsData(response.data);
      } else {
        console.error("Error fetching disabled rooms:", response.message);
        setDisabledRoomsData(null);
      }
    } catch (error) {
      console.error("Error fetching disabled rooms:", error);
      setDisabledRoomsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDisabledRooms();
    }
  }, [open, selectedContractor]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0,0,0,0.25)",
          },
        },
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: "80vw", md: "50vw", lg: "40vw" },
          maxWidth: "720px",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.12)",
          bgcolor: "#ffffff",
          border: "none",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            px: { xs: 2.5, sm: 3.5 },
            py: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Habitaciones Deshabilitadas
          </h2>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#ef4444",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              width: 34,
              height: 34,
              "&:hover": { bgcolor: "#fef2f2" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 2.5 } }}>
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          ) : disabledRoomsData && disabledRoomsData.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              {disabledRoomsData.map((room, index) => (
                <DisabledRoomCard key={index} room={room} />
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                color: "#94a3b8",
                fontSize: "0.95rem",
              }}
            >
              No hay habitaciones deshabilitadas
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default DashboardDetailSidebar;
