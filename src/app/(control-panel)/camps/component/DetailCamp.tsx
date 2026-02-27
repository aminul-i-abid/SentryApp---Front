import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CampResponse } from '../models/CampResponse';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { deleteCamp } from '../campsService';
import { useNavigate } from 'react-router-dom';
import { buildRoute, Routes } from '@/utils/routesEnum';
import AddCampModal from './AddCampModal';
import { useSnackbar } from 'notistack';
import authRoles from '@auth/authRoles';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

interface DetailCampProps {
  camp: CampResponse;
  fetchData: () => void;
  sectorContractor?: boolean;
  contractorName?: string;
  tagSummaryOrdered?: Array<{ tag: string; count: number }>;
}

function DetailCamp({ camp, fetchData, sectorContractor, contractorName, tagSummaryOrdered }: DetailCampProps) {
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
        enqueueSnackbar('Campamento eliminado exitosamente', { variant: 'success' });
        navigate(buildRoute(Routes.CAMPS));
        setIsDeleteModalOpen(false);
      } else {
        const errorMessage = response.errors?.[0] || response.message || 'Error al eliminar el campamento';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      enqueueSnackbar('Error al eliminar el campamento', { variant: 'error' });
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
      <div className="flex justify-between mb-4 gap-2">
      <IconButton
          sx={{
            bgcolor: '#e0e0e0',
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: '#bdbdbd',
            }
          }}
          onClick={handleBackClick}
        >
          <ArrowBackIcon sx={{ color: '#1976d2' }} />
        </IconButton>
        {(!sectorContractor && authState?.user?.role && authRoles.admin.includes(authState.user.role as string)) && (
        <div className="flex gap-2">
        <IconButton
          sx={{
            bgcolor: '#e0e0e0',
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: '#bdbdbd',
            }
          }}
          onClick={handleEditClick}
        >
          <EditIcon sx={{ color: '#1976d2' }} />
        </IconButton>
        {/* <IconButton
          sx={{
            bgcolor: '#e0e0e0',
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: '#bdbdbd',
            }
          }}
          onClick={handleDeleteClick}
        >
          <DeleteIcon sx={{ color: '#f44336' }} />
        </IconButton> */}
        </div>
        )}
      </div>
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CardMedia
              component="img"
              height="120"
              image={"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"}
              alt={camp.name}
              sx={{ borderRadius: 3, height: 120, objectFit: 'cover', maxWidth: 150 }}
            />
          </Box>
          <Box sx={{ flex: 1, pl: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Nombre del campamento</Typography>
            <Typography variant="h6" fontWeight={700}>{camp.name}</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Ubicación</Typography>
            <Typography variant="body1" fontWeight={600}>{camp.location || 'Sin ubicación'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight={600}>
              {/* fecha de hoy */}
              {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            {contractorName && (
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Contratista: {contractorName}
              </Typography>
            )}
          </Box>
        </Box>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{camp.totalRooms}</Typography>
                <Typography variant="body2">Habitaciones disponibles</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{camp.totalBeds}</Typography>
                <Typography variant="body2">Camas disponibles</Typography>
              </Box>
            </Grid>
          </Grid>
          {!sectorContractor && authState?.user?.role && authRoles.admin.includes(authState.user.role as string) && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{((camp.occupiedBeds*100)/camp.totalBeds).toFixed(2) == "NaN" ? "0.00" : ((camp.occupiedBeds*100)/camp.totalBeds).toFixed(2)}%</Typography>
                <Typography variant="body2">% de camas en uso</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{camp.occupiedBeds}</Typography>
                <Typography variant="body2">Camas en uso</Typography>
              </Box>
            </Grid>
          </Grid>
          )}
          {tagSummaryOrdered && tagSummaryOrdered.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary.main">Habitaciones por Estándar:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {tagSummaryOrdered.map(({ tag, count }) => (
                  <Box key={tag} sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, minWidth: 120, textAlign: 'center', boxShadow: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="primary.main">{count}</Typography>
                    <Typography variant="body2" fontWeight={500}>{tag}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

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
