import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import AddCampForm from './AddCampForm';
import { createCamp, updateCamp } from '../campsService';
import { useSnackbar } from 'notistack';
import { CampResponse } from '../models/CampResponse';

interface AddCampModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    campToEdit?: CampResponse;
}

const AddCampModal: React.FC<AddCampModalProps> = ({ open, onClose, onSuccess, campToEdit }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        coordinates: '',
        capacity: 0,
    });

    // Load camp data when editing
    useEffect(() => {
        if (campToEdit) {
            setFormData({
                name: campToEdit.name || '',
                location: campToEdit.location || '',
                coordinates: campToEdit.coordinates || '',
                capacity: campToEdit.capacity || 0,
            });
        } else {
            // Reset form when adding new camp
            setFormData({
                name: '',
                location: '',
                coordinates: '',
                capacity: 0,
            });
        }
    }, [campToEdit, open]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            let response;
            if (campToEdit) {
                response = await updateCamp(campToEdit.id, formData);
            } else {
                response = await createCamp(formData);
            }

            if (response.succeeded) {
                enqueueSnackbar(
                    campToEdit 
                        ? 'Campamento actualizado exitosamente' 
                        : 'Campamento creado exitosamente', 
                    { variant: 'success' }
                );
                onSuccess();
                onClose();
            } else {
                const errorMessage = response.errors?.[0] || response.messages?.[0] || 
                    (campToEdit ? 'Error al actualizar el campamento' : 'Error al crear el campamento');
                enqueueSnackbar(errorMessage, { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(
                campToEdit ? 'Error al actualizar el campamento' : 'Error al crear el campamento', 
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'capacity' ? Number(e.target.value) : e.target.value
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>
                {campToEdit ? 'Editar Campamento' : 'Agregar Nuevo Campamento'}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <AddCampForm
                    name={formData.name}
                    location={formData.location}
                    coordinates={formData.coordinates}
                    capacity={formData.capacity}
                    onNameChange={handleChange('name')}
                    onLocationChange={handleChange('location')}
                    onCoordinatesChange={handleChange('coordinates')}
                    onCapacityChange={handleChange('capacity')}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ flex: 1, mr: 2, bgcolor: '#F5F7FA' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1 }}
                    disabled={
                        loading ||
                        !formData.name ||
                        !formData.location ||
                        formData.capacity <= 0
                    }
                >
                    {loading ? (campToEdit ? 'Actualizando...' : 'Agregando...') : (campToEdit ? 'Actualizar' : 'Agregar')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddCampModal; 