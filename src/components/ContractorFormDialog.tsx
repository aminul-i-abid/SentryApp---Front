import FormDialog from "@/components/ui/FormDialog";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  countryCodes,
  extractCountryAndPhone,
  fieldSx,
  selectFieldSx,
} from "./contractorFormHelpers";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface ContractorFormData {
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  state: boolean;
}

export interface ContractorFormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog requests to close */
  onClose: () => void;
  /** Title shown at the top of the dialog */
  title: string;
  /** Label for the submit button (default "Submit Info") */
  submitLabel?: string;
  /** Initial / pre-filled values (for edit mode) */
  initialData?: Partial<ContractorFormData>;
  /** Whether to show the State field (default true) */
  showState?: boolean;
  /** Called with the form data when user clicks submit */
  onSubmit: (data: ContractorFormData) => Promise<void> | void;
  /** Extra validation – return true if submit should be disabled */
  isSubmitDisabled?: (data: ContractorFormData) => boolean;
  /** Additional form content rendered below the main fields (e.g. contact person section) */
  children?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const ContractorFormDialog: React.FC<ContractorFormDialogProps> = ({
  open,
  onClose,
  title,
  submitLabel = "Guardar",
  initialData,
  showState = true,
  onSubmit,
  isSubmitDisabled,
  children,
}) => {
  const [formData, setFormData] = useState<ContractorFormData>({
    name: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    state: true,
  });
  const [countryCode, setCountryCode] = useState("+56");
  const [localPhone, setLocalPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* Reset / fill when opened */
  useEffect(() => {
    if (open) {
      const d: ContractorFormData = {
        name: initialData?.name ?? "",
        rut: initialData?.rut ?? "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        address: initialData?.address ?? "",
        website: initialData?.website ?? "",
        state: initialData?.state ?? true,
      };
      setFormData(d);
      const { countryCode: cc, localPhone: lp } = extractCountryAndPhone(
        d.phone,
      );
      setCountryCode(cc);
      setLocalPhone(lp);
    }
  }, [open, initialData]);

  /* Field helpers */
  const set =
    (field: keyof ContractorFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCountryCode = (e: SelectChangeEvent) => {
    const cc = e.target.value;
    setCountryCode(cc);
    setFormData((prev) => ({ ...prev, phone: cc + localPhone }));
  };

  const handleLocalPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lp = e.target.value;
    setLocalPhone(lp);
    setFormData((prev) => ({ ...prev, phone: countryCode + lp }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onSubmit(formData);
    } catch (err) {
      console.error("ContractorFormDialog submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const disabled =
    isLoading ||
    !formData.name ||
    !formData.rut ||
    (isSubmitDisabled ? isSubmitDisabled(formData) : false);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={title}
      submitLabel={submitLabel}
      cancelLabel="Cancelar"
      loading={isLoading}
      submitDisabled={disabled}
      onSubmit={handleSubmit}
      variant="drawer"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Row 1: Company Name | Company Tax ID */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Nombre de la empresa
            </Typography>
            <TextField
              placeholder="Ingrese el nombre de la empresa"
              value={formData.name}
              onChange={set("name")}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              RUT de la empresa
            </Typography>
            <TextField
              placeholder="Ingrese su RUT"
              value={formData.rut}
              onChange={set("rut")}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
        </Box>

        {/* Row 2: Email ID | Phone Number */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Correo
            </Typography>
            <TextField
              placeholder="Ingrese su correo"
              value={formData.email}
              onChange={set("email")}
              fullWidth
              size="small"
              type="email"
              sx={fieldSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Número de teléfono
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl size="small" sx={{ width: 110, flexShrink: 0 }}>
                <Select
                  value={countryCode}
                  onChange={handleCountryCode}
                  size="small"
                  sx={selectFieldSx}
                >
                  {countryCodes.map((cc) => (
                    <MenuItem key={cc.code} value={cc.code}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <img
                          src={cc.flag}
                          alt={cc.label}
                          style={{ width: 20, height: 15 }}
                        />
                        {cc.code}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                placeholder="Ingrese su teléfono"
                value={localPhone}
                onChange={handleLocalPhone}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Box>
          </Box>
        </Box>

        {/* Row 3: Address | Website | State */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Dirección
            </Typography>
            <TextField
              placeholder="Ingrese su dirección"
              value={formData.address}
              onChange={set("address")}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Sitio web
            </Typography>
            <TextField
              placeholder="Ingrese la URL del sitio web"
              value={formData.website}
              onChange={set("website")}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
          {showState && (
            <Box sx={{ flex: 0.7 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
                State
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={formData.state ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value === "true",
                    }))
                  }
                  size="small"
                  displayEmpty
                  sx={selectFieldSx}
                >
                  <MenuItem value="" disabled>
                    Seleccione estado
                  </MenuItem>
                  <MenuItem value="true">Activo</MenuItem>
                  <MenuItem value="false">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>

        {/* ---- Additional content (children) ---- */}
        {children}
      </Box>
    </FormDialog>
  );
};

export default ContractorFormDialog;
