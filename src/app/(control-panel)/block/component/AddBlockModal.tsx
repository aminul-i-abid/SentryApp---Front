import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import AddBlockForm from './AddBlockForm';
import { createBlock, updateBlock } from '../blockService';
import { useSnackbar } from 'notistack';
import { BlockResponse } from '../models/BlockResponse';
import { formatTime } from 'src/utils/dateHelpers';


interface AddBlockModalProps {
    campId: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    blockToEdit?: BlockResponse;
}

const AddBlockModal: React.FC<AddBlockModalProps> = ({ campId, open, onClose, onSuccess, blockToEdit }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        floors: '',
        campId: campId,
        checkInTime: null as Date | null,
        checkOutTime: null as Date | null,
        prefix: '',
        suffix: '',
    });

    // Load block data when editing
    useEffect(() => {
        if (blockToEdit) {
            setFormData({
                name: blockToEdit.name || '',
                floors: blockToEdit.floors?.toString() || '',
                campId: blockToEdit.campId || campId,
                checkInTime: blockToEdit.checkInTime ? new Date(`2000-01-01T${blockToEdit.checkInTime}`) : null,
                checkOutTime: blockToEdit.checkOutTime ? new Date(`2000-01-01T${blockToEdit.checkOutTime}`) : null,
                prefix: blockToEdit.prefix || '',
                suffix: blockToEdit.suffix || '',
            });
        } else {
            // Reset form when adding new block
            setFormData({
                name: '',
                floors: '',
                campId: campId,
                checkInTime: null,
                checkOutTime: null,
                prefix: '',
                suffix: '',
            });
        }
    }, [blockToEdit, campId, open]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            const blockData = {
                ...formData,
                floors: parseInt(formData.floors, 10),
                checkInTime: formData.checkInTime ? formatTime(formData.checkInTime) : null,
                checkOutTime: formData.checkOutTime ? formatTime(formData.checkOutTime) : null,
            };
            
            let response;
            if (blockToEdit) {
                response = await updateBlock(blockToEdit.id, blockData);
            } else {
                response = await createBlock(blockData);
            }

            if (response.succeeded) {
                enqueueSnackbar(
                    blockToEdit 
                        ? 'Pabellón actualizado exitosamente' 
                        : 'Pabellón creado exitosamente', 
                    { variant: 'success' }
                );
                onSuccess();
                handleClose();
            } else {
                const errorMessage = response.errors?.[0] || response.messages?.[0] || 
                    (blockToEdit ? 'Error al actualizar el pabellón' : 'Error al crear el pabellón');
                enqueueSnackbar(errorMessage, { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(
                blockToEdit ? 'Error al actualizar el pabellón' : 'Error al crear el pabellón', 
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | Date | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClose = () => {
        // Reset form data when closing the modal
        setFormData({
            name: '',
            floors: '',
            campId: campId,
            checkInTime: null,
            checkOutTime: null,
            prefix: '',
            suffix: '',
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>
                {blockToEdit ? 'Editar pabellón' : 'Agregar Nuevo pabellón'}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <AddBlockForm
                    formData={formData}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
                <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ flex: 1, mr: 2, bgcolor: '#F5F7FA' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1 }}
                    disabled={loading || !formData.name || !formData.floors}
                >
                    {loading ? (blockToEdit ? 'Actualizando...' : 'Agregando...') : (blockToEdit ? 'Actualizar' : 'Agregar')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBlockModal;
