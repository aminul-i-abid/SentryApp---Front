import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Typography } from '@mui/material';

interface AddPinModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phoneNumber: string; roomId: number }) => void;
  roomNumber?: string;
  roomId?: number | null;
  loading?: boolean;
}

/**
 * Modal para agregar un nuevo PIN a la habitación.
 * Actualmente solo recolecta Nombre y Teléfono y retorna el payload al padre.
 * Integrar llamada a API dentro de onSave en el componente padre.
 */
const AddPinModal: React.FC<AddPinModalProps> = ({ open, onClose, onSave, roomNumber, roomId, loading = false }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setPhone('');
      setTouched(false);
    }
  }, [open]);

  const handleSave = () => {
    if (!roomId) return;
    setTouched(true);
    if (!isValid) return;
    onSave({ name: name.trim(), phoneNumber: phoneDigits, roomId });
  };

  const phoneDigits = phone.replace(/[^0-9]/g, '');
  const isValid = name.trim().length >= 2 && phoneDigits.length >= 7;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Generar PIN único para la habitación {roomNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={touched && name.trim().length < 2}
            helperText={touched && name.trim().length < 2 ? 'Ingresa al menos 2 caracteres' : ''}
            autoFocus
          />
          <TextField
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            error={touched && phoneDigits.length < 7}
            helperText={touched && phoneDigits.length < 7 ? 'Ingresa un teléfono válido (7+ dígitos)' : ''}
          />
          <Typography variant="caption" color="text.secondary">
            Al guardar se generará/registrará un nuevo PIN único para esta habitación.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">Cancelar</Button>
        <Button onClick={handleSave} disabled={!isValid || loading} variant="contained">
          {loading ? 'Generando...' : 'Generar PIN'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPinModal;
