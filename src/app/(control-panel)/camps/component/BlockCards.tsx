import { RoomResponse } from "@/app/(control-panel)/room/models/RoomResponse";
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
                  width: "100%",
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
                      <img src="./assets/icons/floors.png" alt="" />
                      <Typography variant="body2" color="text.secondary">
                        Pisos:{" "}
                        <span className="text-black">
                          {String(block.floors).padStart(2, "0")}
                        </span>
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <img src="./assets/icons/roomspavi.png" alt="" />

                      <Typography variant="body2" color="text.secondary">
                        Habitaciones:{" "}
                        <span className="text-black">{block.rooms.length}</span>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onBlockClick(block.id);
                  }}
                  sx={{
                    bgcolor: "#F7F7F7",
                    "&:hover": { bgcolor: "#eef2ff" },
                    width: 35,
                    height: 64,
                    p: 0,
                    minWidth: 0,
                    boxSizing: "border-box",
                    borderRadius: "50%",
                    border: "1px solid #E5E7EB",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="./assets/icons/arrow-right-double.png"
                    className="rotate-180"
                    alt=""
                    style={{
                      width: 20,
                      height: 20,
                      objectFit: "fill",
                      display: "block",
                    }}
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
