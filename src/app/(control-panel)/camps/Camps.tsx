import TopbarHeader from "@/components/TopbarHeader";
import authRoles from "@auth/authRoles";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Routes, buildRoute } from "../../../utils/routesEnum";
import { createCamp, getCamps } from "./campsService";
import AddCampModal from "./component/AddCampModal";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-content > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-header > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

const CAMP_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

/**
 * Extracts an array of image URLs from camp data,
 * checking multiple possible field names the API might return.
 */
function getCampImages(camp: any): string[] {
  // Check array fields first
  if (Array.isArray(camp.images) && camp.images.length > 0) return camp.images;
  if (Array.isArray(camp.photos) && camp.photos.length > 0) return camp.photos;
  // Check single-string fields
  if (typeof camp.image === "string" && camp.image) return [camp.image];
  if (typeof camp.imageUrl === "string" && camp.imageUrl)
    return [camp.imageUrl];
  if (typeof camp.thumbnail === "string" && camp.thumbnail)
    return [camp.thumbnail];
  // Fallback
  return [CAMP_FALLBACK_IMAGE];
}

function CampCard({
  camp,
  onCardClick,
  onEditClick,
}: {
  camp: any;
  onCardClick: (id: string) => void;
  onEditClick: (e: React.MouseEvent, camp: any) => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const images = useMemo(() => getCampImages(camp), [camp]);
  const hasMultiple = images.length > 1;
  const [activeIdx, setActiveIdx] = useState(0);

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setActiveIdx(idx);
  };

  return (
    <Box
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": { transform: "translateY(-4px)" },
      }}
      onClick={() => onCardClick(camp.id)}
    >
      {/* Image container */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          aspectRatio: "4 / 3",
        }}
      >
        <Box
          component="img"
          src={images[activeIdx] || CAMP_FALLBACK_IMAGE}
          alt={camp.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Slider dots — only rendered when multiple images */}
        {hasMultiple && (
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              zIndex: 2,
            }}
          >
            {images.map((_, idx) => (
              <Box
                key={idx}
                onClick={(e) => handleDotClick(e, idx)}
                sx={{
                  width: idx === activeIdx ? 20 : 8,
                  height: 8,
                  borderRadius: "4px",
                  backgroundColor:
                    idx === activeIdx ? "#fff" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    backgroundColor: "#fff",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Edit icon */}
        <IconButton
          size="small"
          onClick={(e) => onEditClick(e, camp)}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: isDark
              ? "rgba(30,30,30,0.7)"
              : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            color: isDark ? "#e0e0e0" : "#374151",
            width: 32,
            height: 32,
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(50,50,50,0.85)"
                : "rgba(255,255,255,1)",
            },
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Card info */}
      <Box sx={{ pt: 1.5, px: 0.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            lineHeight: 1.3,
            color: isDark ? "#fff" : "#111827",
          }}
        >
          {camp.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? "#9ca3af" : "#6b7280",
            mb: 0.5,
          }}
        >
          {camp.location}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? "#9ca3af" : "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography
            component="span"
            variant="body2"
            sx={{ fontWeight: 700, color: isDark ? "#e0e0e0" : "#111827" }}
          >
            Habitaciones
          </Typography>
          ({camp.totalRooms ?? camp.roomsCount ?? 0})
          <Typography
            component="span"
            sx={{ mx: 0.5, color: isDark ? "#555" : "#d1d5db" }}
          >
            |
          </Typography>
          <Typography
            component="span"
            variant="body2"
            sx={{ fontWeight: 700, color: isDark ? "#e0e0e0" : "#111827" }}
          >
            Bloques
          </Typography>
          ({camp.blocks?.length ?? camp.blockCount ?? 0})
        </Typography>
      </Box>
    </Box>
  );
}

function Camps() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCamps = useCallback(async () => {
    try {
      const response = await getCamps();
      if (response.succeeded) {
        // DEBUG: log camp data to verify image field names from API
        console.log("[Camps] API response data:", response.data);
        setCamps(response.data);
      }
    } catch (error) {
      console.error("Error fetching camps:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  const handleAddCamp = async (campData) => {
    try {
      const response = await createCamp(campData);
      if (response.succeeded) {
        await fetchCamps();
      }
    } catch (error) {
      console.error("Error adding camp:", error);
    }
  };

  const handleCampClick = (campId) => {
    navigate(buildRoute(Routes.CAMPS_DETAIL, { id: campId }));
  };

  const handleEditClick = (e: React.MouseEvent, camp: any) => {
    e.stopPropagation();
    // Navigate to camp detail for editing
    navigate(buildRoute(Routes.CAMPS_DETAIL, { id: camp.id }));
  };

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <div className="p-6 w-full">
            {/* Title + button row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                ¡Lista de campamentos aquí!
              </h2>
              {authState?.user?.role &&
                authRoles.admin.includes(authState.user.role as string) && (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#415EDE",
                      color: "#fff",
                      borderRadius: "24px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      px: 3,
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "#4338ca",
                      },
                    }}
                    endIcon={<AddIcon />}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Nuevos Campamentos
                  </Button>
                )}
            </div>

            {/* Camp cards grid */}
            {camps.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={8}
              >
                <span style={{ color: "#888" }}>No se encontraron datos</span>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                    xl: "repeat(5, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {camps.map((camp) => (
                  <CampCard
                    key={camp.id}
                    camp={camp}
                    onCardClick={handleCampClick}
                    onEditClick={handleEditClick}
                  />
                ))}
              </Box>
            )}
          </div>
        }
      />

      <AddCampModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchCamps();
        }}
      />
    </>
  );
}

export default Camps;
