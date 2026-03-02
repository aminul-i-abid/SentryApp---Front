import { RoomResponse } from "@/app/(control-panel)/room/models/RoomResponse";
import ApartmentIcon from "@mui/icons-material/Apartment";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box, Card, Grid, IconButton, Typography } from "@mui/material";

interface Block {
  id: number;
  name: string;
  floors: number;
  rooms: RoomResponse[];
}

interface BlockCardsProps {
  blocks: Block[];
  onBlockClick: (blockId: number) => void;
}

function BlockCards({ blocks, onBlockClick }: BlockCardsProps) {
  return (
    <Grid container spacing={2}>
      {blocks.length > 0 ? (
        blocks.map((block) => (
          <Grid item xs={12} sm={6} md={6} key={block.id}>
            <Card
              onClick={() => onBlockClick(block.id)}
              sx={{
                bgcolor: "#ffffff",
                borderRadius: 3,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                cursor: "pointer",
                border: "1px solid #f1f5f9",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
                minWidth: 220,
                display: "flex",
                alignItems: "stretch",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                  >
                    {block.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ApartmentIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                      <Typography variant="body2" color="text.secondary">
                        Pisos: {String(block.floors).padStart(2, "0")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <MeetingRoomIcon
                        sx={{ fontSize: 16, color: "#94a3b8" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Habitaciones: {block.rooms.length}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: "#f8fafc",
                    "&:hover": { bgcolor: "#eef2ff" },
                    width: 36,
                    height: 36,
                  }}
                >
                  <KeyboardDoubleArrowRightIcon
                    sx={{ fontSize: 20, color: "#4f46e5" }}
                  />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #eaf1ff",
              borderRadius: 3,
              minHeight: 400,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" color="text.secondary">
                No se encontraron datos
              </Typography>
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default BlockCards;
