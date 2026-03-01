import { searchByRut } from "@/app/(control-panel)/reserve/reserveService";
import ContractorFormDialog, {
  ContractorFormData,
} from "@/components/ContractorFormDialog";
import {
  countryCodes,
  fieldSx,
  selectFieldSx,
} from "@/components/contractorFormHelpers";
import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

interface AddContractorModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (contractorData: {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    contract?: string;
    contactFirstName: string;
    contactLastName: string;
    contactRut: string;
    contactPhone: string;
    contactEmail: string;
  }) => void;
}

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */
const validateRut = (rut: string) => {
  const rutRegex = /^\d{8}-[0-9kK]$/;
  if (!rut) return "El RUT es requerido";
  if (!rutRegex.test(rut))
    return "El RUT debe tener el formato: 12345678-9 o 12345678-K";
  const [num, dv] = rut.split("-");
  let suma = 0;
  let multiplicador = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    suma += parseInt(num[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = suma % 11;
  let dvEsperado: string;
  if (11 - resto === 11) dvEsperado = "0";
  else if (11 - resto === 10) dvEsperado = "K";
  else dvEsperado = String(11 - resto);
  if (dvEsperado !== dv.toUpperCase()) return "El RUT no es válido";
  return "";
};

const validateEmail = (email: string) => {
  if (!email) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? "" : "Ingrese un correo electrónico válido";
};

const validatePhone = (phone: string, countryCode: string) => {
  if (!phone) return "El número de teléfono es requerido";
  const digitsOnly = phone.replace(/\D/g, "");
  if (countryCode === "+56" && digitsOnly.length !== 9)
    return "Debe tener 9 dígitos";
  if (countryCode === "+549" && digitsOnly.length !== 10)
    return "Debe tener 10 dígitos";
  return "";
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const AddContractorModal: React.FC<AddContractorModalProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  /* Contact person local state */
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactRut, setContactRut] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCountryCode, setContactCountryCode] = useState("+56");
  const [localContactPhone, setLocalContactPhone] = useState("");

  /* RUT autocomplete */
  const [rutSearchResults, setRutSearchResults] = useState<any[]>([]);
  const [isSearchingRut, setIsSearchingRut] = useState(false);
  const [selectedRut, setSelectedRut] = useState<any>(null);

  /* Validation */
  const [rutError, setRutError] = useState("");
  const [contactEmailError, setContactEmailError] = useState("");
  const [contactPhoneError, setContactPhoneError] = useState("");

  /* Reset everything when modal opens */
  useEffect(() => {
    if (open) {
      setContactFirstName("");
      setContactLastName("");
      setContactRut("");
      setContactPhone("");
      setContactEmail("");
      setContactCountryCode("+56");
      setLocalContactPhone("");
      setRutSearchResults([]);
      setSelectedRut(null);
      setRutError("");
      setContactEmailError("");
      setContactPhoneError("");
    }
  }, [open]);

  /* ---- RUT search ---- */
  const handleRutSearch = async (input: string) => {
    if (input.length >= 3) {
      setIsSearchingRut(true);
      try {
        const res = await searchByRut(input);
        if (res.succeeded && res.data) {
          setRutSearchResults(Array.isArray(res.data) ? res.data : [res.data]);
        } else {
          setRutSearchResults([]);
        }
      } catch {
        setRutSearchResults([]);
      } finally {
        setIsSearchingRut(false);
      }
    } else {
      setRutSearchResults([]);
    }
  };

  const handleRutChange = (_: React.SyntheticEvent, newValue: string | any) => {
    if (typeof newValue === "object" && newValue !== null) {
      setSelectedRut(newValue);
      setContactRut(newValue.dni || "");
      setContactFirstName(newValue.firstName?.toString() || "");
      setContactLastName(newValue.lastName?.toString() || "");
      const phone = newValue.phoneNumber || "";
      setContactPhone(phone);
      // Try to extract country code
      for (const cc of countryCodes) {
        if (phone.startsWith(cc.code)) {
          setContactCountryCode(cc.code);
          setLocalContactPhone(phone.slice(cc.code.length));
          break;
        }
      }
      setContactEmail(newValue.email?.toString() || "");
      setRutError("");
      setContactEmailError("");
      setContactPhoneError("");
    } else {
      setSelectedRut(null);
      const val = newValue || "";
      setContactRut(val);
      if (!val) {
        setContactFirstName("");
        setContactLastName("");
        setContactPhone("");
        setLocalContactPhone("");
        setContactEmail("");
        setRutError("");
        setContactEmailError("");
        setContactPhoneError("");
      } else {
        setRutError(validateRut(val));
      }
    }
  };

  const handleContactPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lp = e.target.value;
    setLocalContactPhone(lp);
    const full = contactCountryCode + lp;
    setContactPhone(full);
    setContactPhoneError(validatePhone(lp, contactCountryCode));
  };

  const handleContactCountryCode = (e: SelectChangeEvent) => {
    const cc = e.target.value;
    setContactCountryCode(cc);
    const full = cc + localContactPhone;
    setContactPhone(full);
    if (localContactPhone)
      setContactPhoneError(validatePhone(localContactPhone, cc));
  };

  /* ---- Submit handler ---- */
  const handleSubmit = async (companyData: ContractorFormData) => {
    await onAdd({
      name: companyData.name,
      rut: companyData.rut,
      address: companyData.address,
      phone: companyData.phone,
      email: companyData.email,
      website: companyData.website,
      contract: "0",
      contactFirstName,
      contactLastName,
      contactRut,
      contactPhone,
      contactEmail,
    });
    onClose();
  };

  const contactFieldsValid =
    !!contactFirstName &&
    !!contactLastName &&
    !!contactRut &&
    !!contactPhone &&
    !!contactEmail;

  return (
    <ContractorFormDialog
      open={open}
      onClose={onClose}
      title="Agregar nuevo contratista"
      submitLabel="Agregar contratista"
      showState={false}
      onSubmit={handleSubmit}
      isSubmitDisabled={() => !contactFieldsValid}
    >
      {/* ---- Contact Person Section ---- */}
      <Divider
        sx={(t) => ({
          borderColor: t.palette.mode === "dark" ? "#333" : "#E5E7EB",
          my: 0.5,
        })}
      />
      <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
        Persona de contacto
      </Typography>

      {/* Row: Contact RUT (autocomplete) */}
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
          RUT de la persona de contacto
        </Typography>
        <Autocomplete
          freeSolo
          options={rutSearchResults}
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;
            return `${option.dni} / ${option.firstName} ${option.lastName}`;
          }}
          value={selectedRut}
          onChange={handleRutChange}
          onInputChange={(_, newInput) => {
            handleRutSearch(newInput);
            if (!selectedRut && newInput) {
              setContactRut(newInput);
              setRutError(validateRut(newInput));
            } else if (!newInput) {
              setSelectedRut(null);
              setContactRut("");
              setContactFirstName("");
              setContactLastName("");
              setContactPhone("");
              setLocalContactPhone("");
              setContactEmail("");
              setRutError("");
              setContactEmailError("");
              setContactPhoneError("");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar por RUT"
              error={!!rutError}
              helperText={rutError}
              size="small"
              fullWidth
              sx={fieldSx}
            />
          )}
          loading={isSearchingRut}
          loadingText="Buscando..."
          noOptionsText="No se encontraron resultados"
        />
      </Box>

      {/* Row: First Name | Last Name */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Nombre
          </Typography>
          <TextField
            placeholder="Ingrese el nombre"
            value={contactFirstName}
            onChange={(e) => setContactFirstName(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Apellido
          </Typography>
          <TextField
            placeholder="Ingrese el apellido"
            value={contactLastName}
            onChange={(e) => setContactLastName(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Box>
      </Box>

      {/* Row: Email | Phone */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Correo de contacto
          </Typography>
          <TextField
            placeholder="Ingrese el correo de contacto"
            value={contactEmail}
            onChange={(e) => {
              setContactEmail(e.target.value);
              setContactEmailError(validateEmail(e.target.value));
            }}
            error={!!contactEmailError}
            helperText={contactEmailError}
            fullWidth
            size="small"
            type="email"
            sx={fieldSx}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Teléfono de contacto
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FormControl size="small" sx={{ width: 110, flexShrink: 0 }}>
              <Select
                value={contactCountryCode}
                onChange={handleContactCountryCode}
                size="small"
                sx={selectFieldSx}
              >
                {countryCodes.map((cc) => (
                  <MenuItem key={cc.code} value={cc.code}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
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
              placeholder="Ingrese teléfono"
              value={localContactPhone}
              onChange={handleContactPhoneChange}
              error={!!contactPhoneError}
              helperText={contactPhoneError}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
        </Box>
      </Box>
    </ContractorFormDialog>
  );
};

export default AddContractorModal;
