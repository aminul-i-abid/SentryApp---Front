import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BlockResponse } from '../models/BlockResponse';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { deleteBlock } from '../blockService';
import AddBlockModal from './AddBlockModal';
import { useSnackbar } from 'notistack';
import tagRoleMap from '@/app/(control-panel)/tag/enum/RoleTag';

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
        enqueueSnackbar('Pabellón eliminado exitosamente', { variant: 'success' });
        fetchData();
        setIsDeleteModalOpen(false);
        window.history.back();
      } else {
        const errorMessage = response.errors?.[0] || response.message || 'Error al eliminar el Pabellón';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      enqueueSnackbar('Error al eliminar el Pabellón', { variant: 'error' });
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
      </div>
      <Card sx={{ display: 'flex', borderRadius: 3, boxShadow: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CardMedia
              component="img"
              image={"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"}
              alt={block.name}
              sx={{ borderRadius: 3, objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </Box>
          <Box sx={{ flex: 1, pl: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">Nombre del pabellón</Typography>
            <Typography variant="h5" fontWeight={700}>{block.name}</Typography>
          </Box>
        </Box>
        <CardContent sx={{ flex: 1.2, p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{block.floors}</Typography>
                <Typography variant="body2">Pisos</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{block.rooms?.length || 0}</Typography>
                <Typography variant="body2">Habitaciones</Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={3} mt={2}>
            {Object.entries(tagRoleMap).map(([tagId, tagName]) => {
              const count = block.rooms?.filter(room => room.tag === Number(tagId)).length || 0;
              return (
                <Grid item xs={4} key={tagId}>
                  <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">{count}</Typography>
                    <Typography variant="body2">{tagName}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>

        {/*<CardContent>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{block.checkInTime?.slice(0, -3)}</Typography>
                <Typography variant="body2">Hora de check in</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#eaf1ff', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">{block.checkOutTime?.slice(0, -3)}</Typography>
                <Typography variant="body2">Hora de check out</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>*/}
      </Card>

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
