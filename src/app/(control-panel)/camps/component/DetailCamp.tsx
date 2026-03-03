import { ConfirmationModal } from "@/components/ConfirmationModal";
import { buildRoute, Routes } from "@/utils/routesEnum";
import authRoles from "@auth/authRoles";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCamp } from "../campsService";
import { CampResponse } from "../models/CampResponse";
import AddCampModal from "./AddCampModal";

interface DetailCampProps {
  camp: CampResponse;
  fetchData: () => void;
  sectorContractor?: boolean;
  contractorName?: string;
  tagSummaryOrdered?: { tag: string; count: number }[];
}

function DetailCamp({
  camp,
  fetchData,
  sectorContractor,
  contractorName,
  tagSummaryOrdered,
}: DetailCampProps) {
  const { authState } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteCamp(camp.id);

      if (response.succeeded) {
        enqueueSnackbar("Campamento eliminado exitosamente", {
          variant: "success",
        });
        navigate(buildRoute(Routes.CAMPS));
        setIsDeleteModalOpen(false);
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.message ||
          "Error al eliminar el campamento";
        enqueueSnackbar(errorMessage, { variant: "error" });
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      enqueueSnackbar("Error al eliminar el campamento", { variant: "error" });
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleEditSuccess = () => {
    fetchData();
  };

  return (
    <>
      {/* Back button */}
      <div className="flex justify-start mb-3">
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
      </div>

      {/* Camp info card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 2.5, gap: 2 }}>
          <CardMedia
            component="img"
            image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
            alt={camp.name}
            sx={{
              borderRadius: 2,
              width: 120,
              height: 140,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {camp.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <img src="./assets/icons/red-location.png" alt="" />
                <Typography variant="body2" color="text.secondary">
                  {camp.location || "Sin ubicación"}
                </Typography>
              </Box>
            </Box>
            {!sectorContractor &&
              authState?.user?.role &&
              authRoles.admin.includes(authState.user.role as string) && (
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <IconButton
                    onClick={handleEditClick}
                    sx={{
                      bgcolor: "#f7f7f7",
                      width: 36,
                      height: 36,
                      "&:hover": { bgcolor: "#e2e8f0" },
                      border: "1px solid #ECECEC",
                    }}
                  >
                    <img src="./assets/icons/edit.png" alt="" />
                  </IconButton>
                  <IconButton
                    onClick={handleDeleteClick}
                    sx={{
                      bgcolor: "#f7f7f7",
                      width: 36,
                      height: 36,
                      "&:hover": { bgcolor: "#fee2e2" },
                      border: "1px solid #ECECEC",
                    }}
                  >
                    <img src="./assets/icons/delete.png" alt="" />
                  </IconButton>
                </Box>
              )}
          </Box>
        </Box>
      </Card>

      {/* Date divider */}
      <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
        <Box sx={{ flex: 1, borderTop: "2px dashed #818cf8" }} />
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mx: 2, whiteSpace: "nowrap" }}
        >
          {contractorName
            ? `Contratista: ${contractorName}`
            : new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
        </Typography>
        <Box sx={{ flex: 1, borderTop: "2px dashed #818cf8" }} />
      </Box>

      {/* Stats grid */}
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
              {camp.totalRooms}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Habitaciones disponibles
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
              {camp.totalBeds}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Camas disponibles
            </Typography>
          </Box>
        </Grid>
        {!sectorContractor &&
          authState?.user?.role &&
          authRoles.admin.includes(authState.user.role as string) && (
            <>
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
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: "#22c55e" }}
                  >
                    {((camp.occupiedBeds * 100) / camp.totalBeds).toFixed(2) ===
                    "NaN"
                      ? "0.00"
                      : ((camp.occupiedBeds * 100) / camp.totalBeds).toFixed(
                          2,
                        )}{" "}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    % de camas en uso
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
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: "#4f46e5" }}
                  >
                    {camp.occupiedBeds}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Camas en uso
                  </Typography>
                </Box>
              </Grid>
            </>
          )}
      </Grid>

      {/* Rooms by Standard */}
      {tagSummaryOrdered && tagSummaryOrdered.length > 0 && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
            <Box sx={{ flex: 1, borderTop: "2px dashed #818cf8" }} />
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
          <Grid container spacing={2}>
            {tagSummaryOrdered.map(({ tag, count }) => (
              <Grid item xs={4} key={tag}>
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
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tag}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar campamento"
        message={`¿Estás seguro que deseas eliminar el campamento "${camp.name}"?`}
        type="delete"
      />

      <AddCampModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        campToEdit={camp}
      />
    </>
  );
}

export default DetailCamp;
