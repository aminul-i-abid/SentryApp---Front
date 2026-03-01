import { searchByRut } from "@/app/(control-panel)/reserve/reserveService";
import {
  countryCodes,
  extractCountryAndPhone,
  fieldSx,
  selectFieldSx,
} from "@/components/contractorFormHelpers";
import FormDialog from "@/components/ui/FormDialog";
import {
  Autocomplete,
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import React, { useEffect, useMemo, useState } from "react";

interface AddContactPersonModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    rut: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) => Promise<void> | void;
}

const rutRegex = /^\d{8}-[0-9kK]$/;

const AddContactPersonModal: React.FC<AddContactPersonModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [rut, setRut] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);

  const [rutError, setRutError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+56");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (open) {
      setRut("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setLocalPhone("");
      setEmail("");
      setIsLoading(false);
      setIsSearching(false);
      setOptions([]);
      setSelectedOption(null);
      setRutError("");
      setEmailError("");
      setSelectedCountryCode("+56");
      setPhoneError("");
    }
  }, [open]);

  const validateRut = (value: string) => {
    if (!value) return "El RUT es requerido";

    if (!rutRegex.test(value))
      return "Formato inválido (12345678-9 o 12345678-K)";

    const [num, dv] = value.split("-");
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

  const validateEmail = (value: string) => {
    if (!value) return "";

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? "" : "Ingrese un correo electrónico válido";
  };

  const validatePhone = (value: string) => {
    if (!value) {
      return "El número de teléfono es requerido";
    }

    const digitsOnly = value.replace(/\D/g, "");

    if (selectedCountryCode === "+56") {
      if (digitsOnly.length !== 9) {
        return "El número de teléfono chileno debe tener 9 dígitos";
      }
    } else if (selectedCountryCode === "+549") {
      if (digitsOnly.length !== 10) {
        return "El número de teléfono argentino debe tener 10 dígitos";
      }
    }

    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    if (!phoneRegex.test(value)) {
      return "Por favor ingrese un número de teléfono válido";
    }

    return "";
  };

  const canSubmit = useMemo(() => {
    return (
      !!rut &&
      !rutError &&
      !!firstName &&
      !!lastName &&
      !!phone &&
      !phoneError &&
      !!email &&
      !emailError
    );
  }, [
    rut,
    rutError,
    firstName,
    lastName,
    phone,
    phoneError,
    email,
    emailError,
  ]);

  const handleSearch = async (input: string) => {
    if (!input || input.length < 3) {
      setOptions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchByRut(input);

      if (response.succeeded && response.data) {
        setOptions(
          Array.isArray(response.data) ? response.data : [response.data],
        );
      } else {
        setOptions([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleRutChange = (_: any, newValue: string | any) => {
    if (typeof newValue === "object" && newValue) {
      setSelectedOption(newValue);
      const value = newValue.dni || "";
      setRut(value);
      setFirstName(newValue.firstName?.toString() || "");
      setLastName(newValue.lastName?.toString() || "");
      const rawPhone = newValue.phoneNumber || "";
      setPhone(rawPhone);
      const { countryCode: cc, localPhone: lp } =
        extractCountryAndPhone(rawPhone);
      setSelectedCountryCode(cc);
      setLocalPhone(lp);
      setEmail(newValue.email?.toString() || "");
      setRutError("");
    } else {
      setSelectedOption(null);
      const value = (newValue as string) || "";
      setRut(value);
      setRutError(validateRut(value));
    }
  };

  const handleCountryCodeChange = (event: SelectChangeEvent) => {
    const cc = event.target.value;
    setSelectedCountryCode(cc);
    setPhone(cc + localPhone);
  };

  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lp = e.target.value;
    setLocalPhone(lp);
    const fullPhone = selectedCountryCode + lp;
    setPhone(fullPhone);
    setPhoneError(validatePhone(lp));
  };

  useEffect(() => {
    if (localPhone) {
      setPhoneError(validatePhone(localPhone));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryCode]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setIsLoading(true);
      await onSave({ rut, firstName, lastName, phone, email });
      onClose();
    } catch (e) {
      console.error("Error saving contact person", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Agregar persona de contacto"
      submitLabel="Guardar"
      cancelLabel="Cancelar"
      loading={isLoading}
      submitDisabled={!canSubmit}
      onSubmit={handleSubmit}
      variant="drawer"
    >
      {/* RUT */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
          RUT
        </Typography>
        <Autocomplete
          freeSolo
          options={options}
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;

            return `${option.dni || ""} / ${option.firstName || ""} ${option.lastName || ""}`.trim();
          }}
          value={selectedOption}
          onChange={handleRutChange}
          onInputChange={(_, value) => {
            setRut(value);
            setRutError(validateRut(value));
            handleSearch(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Ingrese su RUT"
              error={!!rutError}
              helperText={rutError || " "}
              size="small"
              fullWidth
              sx={fieldSx}
            />
          )}
          loading={isSearching}
          loadingText="Buscando..."
          noOptionsText="No se encontraron resultados"
        />
      </Box>

      {/* First Name / Last Name */}
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <Grid item xs={6}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Nombre
          </Typography>
          <TextField
            placeholder="Ingrese el nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Apellido
          </Typography>
          <TextField
            placeholder="Ingrese el apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      {/* Email ID / Phone Number */}
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <Grid item xs={6}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Correo
          </Typography>
          <TextField
            placeholder="Ingrese su correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(validateEmail(e.target.value));
            }}
            error={!!emailError}
            helperText={emailError}
            fullWidth
            size="small"
            type="email"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
            Número de teléfono
          </Typography>
          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <FormControl size="small" sx={{ width: 110, flexShrink: 0 }}>
              <Select
                value={selectedCountryCode}
                onChange={handleCountryCodeChange}
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
              onChange={handleLocalPhoneChange}
              error={!!phoneError}
              helperText={phoneError}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default AddContactPersonModal;
