import tagRoleMap from "@/app/(control-panel)/tag/enum/RoleTag";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { deleteBlock } from "../blockService";
import { BlockResponse } from "../models/BlockResponse";
import AddBlockModal from "./AddBlockModal";

interface DetailBlockProps {
  block: BlockResponse | null;
  fetchData: () => void;
}

function DetailBlock({ block, fetchData }: DetailBlockProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!block) return;

    try {
      const response = await deleteBlock(block.id);

      if (response.succeeded) {
        enqueueSnackbar("Pabellón eliminado exitosamente", {
          variant: "success",
        });
        fetchData();
        setIsDeleteModalOpen(false);
        window.history.back();
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.message ||
          "Error al eliminar el Pabellón";
        enqueueSnackbar(errorMessage, { variant: "error" });
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      enqueueSnackbar("Error al eliminar el Pabellón", { variant: "error" });
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchData();
  };

  const handleBackClick = () => {
    window.history.back();
  };

  if (!block) {
    return null; // Or return a loading state or placeholder
  }

  return (
    <>
      {/* Back and Edit buttons */}
      <div className="flex justify-between mb-3 gap-2">
        <IconButton
          sx={{
            bgcolor: "#f1f5f9",
            width: 36,
            height: 36,
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
          onClick={handleBackClick}
        >
          <ArrowBackIcon sx={{ color: "#4f46e5", fontSize: 20 }} />
        </IconButton>
        <IconButton
          sx={{
            bgcolor: "#f1f5f9",
            width: 36,
            height: 36,
            "&:hover": { bgcolor: "#e2e8f0" },
          }}
          onClick={handleEditClick}
        >
          <EditIcon sx={{ color: "#4f46e5", fontSize: 18 }} />
        </IconButton>
      </div>

      {/* Large hero image */}
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
        alt={block.name}
        sx={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: 3,
          display: "block",
        }}
      />

      {/* Pavilion name divider */}
      <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
        <Box sx={{ flex: 1, borderTop: "2px dashed #818cf8" }} />
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mx: 2, whiteSpace: "nowrap" }}
        >
          Pavilion name: {block.name}
        </Typography>
        <Box sx={{ flex: 1, borderTop: "2px dashed #818cf8" }} />
      </Box>

      {/* Floors and Rooms stats */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ color: "#4f46e5" }}>
              {String(block.floors).padStart(2, "0")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pisos
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ color: "#4f46e5" }}>
              {block.rooms?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Habitaciones
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Rooms by Standard divider */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          my: 3,
        }}
      >
        <Box
          sx={{
            flex: 1,
            borderTop: "2px dashed #818cf8",
          }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mx: 2, whiteSpace: "nowrap" }}
        >
          Habitaciones por estándar
        </Typography>
        <Box sx={{ flex: 1, borderTop: "2px dashed #818cf8" }} />
      </Box>

      {/* Tag standard cards */}
      <Grid container spacing={2}>
        {Object.entries(tagRoleMap).map(([tagId, tagName]) => {
          const count =
            block.rooms?.filter((room) => room.tag === Number(tagId)).length ||
            0;
          return (
            <Grid item xs={4} key={tagId}>
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 3,
                  p: 2,
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color: "#4f46e5" }}
                >
                  {String(count).padStart(2, "0")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tagName}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar pabellón"
        message={`¿Estás seguro que deseas eliminar el pabellón "${block.name}"?`}
        type="delete"
      />

      <AddBlockModal
        campId={block.campId}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        blockToEdit={block}
      />
    </>
  );
}

export default DetailBlock;
