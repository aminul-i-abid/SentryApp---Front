import React, { useState, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import AddRoomForm from './AddRoomBulkForm';
import { createRoom } from '../roomService';
import { useSnackbar } from 'notistack';
import { ContractorResponse } from '../../contractors/models/ContractorResponse';
import { SelectChangeEvent } from '@mui/material/Select';

interface AddRoomModalProps {
    idBlock: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contractors: ContractorResponse[];
    blockFloors?: number;
    suffix?: string;
    prefix?: string;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ 
    idBlock, 
    open, 
    onClose, 
    onSuccess, 
    contractors,
    blockFloors,
    suffix,
    prefix
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        blockId: idBlock,
        roomCount: 1,
        bedsPerRoom: 1,
        isStorage: false,
        prefix: prefix || "",
        suffix: suffix || "",
        startNumber: 1,
        numberDigits: 1,
        tag: 0,
        floorNumber: 1,
        companyId: contractors.length > 0 ? contractors[0].id : 0
    });

    // Validate if all required fields have valid values
    const isFormValid = useMemo(() => {
        return (
            formData.blockId > 0 &&
            formData.roomCount > 0 &&
            formData.bedsPerRoom > 0 &&
            formData.startNumber > 0 &&
            formData.numberDigits > 0 &&
            formData.floorNumber > 0 &&
            formData.companyId > 0
        );
    }, [formData]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await createRoom(formData);

            if (response.succeeded) {
                enqueueSnackbar('Habitación creada exitosamente', { variant: 'success' });
                onSuccess();
                onClose();
            } else {
                const errorMessage = response.errors?.[0] || response.messages?.[0] || 'Error al crear la habitación';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Error al crear la habitación', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' 
            ? e.target.checked 
            : e.target.type === 'number' 
                ? parseInt(e.target.value, 10) || 0
                : e.target.value;
                
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectChange = (field: string) => (e: SelectChangeEvent) => {
        setFormData(prev => ({
            ...prev,
            [field]: parseInt(e.target.value as string, 10) || 0
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>
                Agregar Nueva Habitación
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <AddRoomForm
                    roomCount={formData.roomCount}
                    bedsPerRoom={formData.bedsPerRoom}
                    startNumber={formData.startNumber}
                    numberDigits={formData.numberDigits}
                    tag={formData.tag}
                    floorNumber={formData.floorNumber}
                    contractorId={formData.companyId}
                    contractors={contractors}
                    isEdit={false}
                    maxFloors={blockFloors}
                    onRoomCountChange={handleInputChange('roomCount')}
                    onBedsPerRoomChange={handleInputChange('bedsPerRoom')}
                    onStartNumberChange={handleInputChange('startNumber')}
                    onNumberDigitsChange={handleInputChange('numberDigits')}
                    onTagChange={handleSelectChange('tag')}
                    onFloorNumberChange={handleInputChange('floorNumber')}
                    onContractorChange={handleSelectChange('companyId')}
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
                    disabled={loading || !isFormValid}
                >
                    {loading ? 'Agregando...' : 'Agregar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddRoomModal; 