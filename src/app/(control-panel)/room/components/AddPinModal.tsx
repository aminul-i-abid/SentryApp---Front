import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import {
  Box,
  Button,
  Dialog,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

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
const AddPinModal: React.FC<AddPinModalProps> = ({
  open,
  onClose,
  onSave,
  roomNumber,
  roomId,
  loading = false,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setPhone("");
      setTouched(false);
    }
  }, [open]);

  const handleSave = () => {
    if (!roomId) return;
    setTouched(true);
    if (!isValid) return;
    onSave({ name: name.trim(), phoneNumber: phoneDigits, roomId });
  };

  const phoneDigits = phone.replace(/[^0-9]/g, "");
  const isValid = name.trim().length >= 2 && phoneDigits.length >= 7;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#F3F4F6",
      fontSize: "0.9rem",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#415EDE" },
      "&.Mui-focused fieldset": { borderColor: "#415EDE", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
      "&.Mui-focused": { color: "#415EDE" },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
          p: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          borderBottom: "1px solid #eaeaea",
          bgcolor: "#FAFBFC",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <VpnKeyOutlinedIcon sx={{ fontSize: 20, color: "#415EDE" }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1F2937" }}
          >
            Generar PIN único
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.825rem" }}
          >
            Habitación {roomNumber}
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={touched && name.trim().length < 2}
            helperText={
              touched && name.trim().length < 2
                ? "Ingresa al menos 2 caracteres"
                : ""
            }
            autoFocus
            fullWidth
            variant="outlined"
            sx={inputSx}
          />
          <TextField
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            error={touched && phoneDigits.length < 7}
            helperText={
              touched && phoneDigits.length < 7
                ? "Ingresa un teléfono válido (7+ dígitos)"
                : ""
            }
            fullWidth
            variant="outlined"
            sx={inputSx}
          />
          <Typography
            variant="caption"
            sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}
          >
            Al guardar se generará/registrará un nuevo PIN único para esta
            habitación.
          </Typography>
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          pb: 3,
          pt: 0.5,
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          fullWidth
          variant="outlined"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            py: 1.2,
            borderColor: "#E5E7EB",
            color: "text.secondary",
            "&:hover": {
              borderColor: "#D1D5DB",
              bgcolor: "#F9FAFB",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid || loading}
          fullWidth
          variant="contained"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            py: 1.2,
            boxShadow: "none",
            bgcolor: "#415EDE",
            color: "#FFFFFF",
            "&:hover": {
              bgcolor: "#3449B5",
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              bgcolor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          {loading ? "Generando..." : "Generar PIN"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AddPinModal;
