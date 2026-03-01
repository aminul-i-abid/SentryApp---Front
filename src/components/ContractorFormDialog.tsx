import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormControl,
  IconButton,
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
  submitLabel = "Submit Info",
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          },
        },
      }}
      PaperProps={{
        sx: (t) => ({
          width: { xs: "100%", sm: 520, md: 560 },
          maxWidth: "100%",
          borderRadius: 0,
          p: 0,
          backgroundColor: t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }),
      }}
    >
      {/* ---- Header ---- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          pt: 3.5,
          pb: 1,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={(t) => ({
            border: `1px solid ${t.palette.mode === "dark" ? "#444" : "#E5E7EB"}`,
            width: 36,
            height: 36,
          })}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ---- Form body ---- */}
      <Box
        sx={{
          px: 4,
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Row 1: Company Name | Company Tax ID */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Company Name
            </Typography>
            <TextField
              placeholder="Enter your company name"
              value={formData.name}
              onChange={set("name")}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Company Tax ID
            </Typography>
            <TextField
              placeholder="Enter your tax id"
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
              Email ID
            </Typography>
            <TextField
              placeholder="Enter your mail address"
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
              Phone Number
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
                placeholder="Enter your phone"
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
              Address
            </Typography>
            <TextField
              placeholder="Enter your address"
              value={formData.address}
              onChange={set("address")}
              fullWidth
              size="small"
              sx={fieldSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Website
            </Typography>
            <TextField
              placeholder="Enter your website URL"
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
                    Select State
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

        {/* ---- Footer (moved up so buttons sit right under inputs) ---- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            mt: 1,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.primary",
              px: 3,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={disabled}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "12px",
              backgroundColor: "#415EDE",
              px: 3,
              py: 1,
              color: "#fff",
              "&:hover": { backgroundColor: "#3347b8" },
              "&.Mui-disabled": {
                backgroundColor: "#a0b0f0",
                color: "#fff",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              submitLabel
            )}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ContractorFormDialog;
