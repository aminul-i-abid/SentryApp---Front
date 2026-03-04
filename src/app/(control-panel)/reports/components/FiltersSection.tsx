import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, isValid, parseISO } from "date-fns";
import React from "react";
import { ContractorResponse } from "../../contractors/models/ContractorResponse";

interface FiltersSectionProps {
  filters: {
    fechaDesde: string;
    fechaHasta: string;
    contratistas: number[];
    active: boolean;
  };
  contractors: ContractorResponse[];
  isLoadingContractors: boolean;
  isAdmin: boolean;
  user?: any;
  onFilterChange: (field: string, value: any) => void;
  onResetFilters: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  contractors,
  isLoadingContractors,
  isAdmin,
  user,
  onFilterChange,
  onResetFilters,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 3,
        borderRadius: "12px",
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}
      >
        Filters
      </Typography>

      {/* Row: Start date, End date, Contractors, Active, Reset */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Start date */}
          <DatePicker
            label="Start date"
            value={filters.fechaDesde ? parseISO(filters.fechaDesde) : null}
            onChange={(date: Date | null) => {
              if (date && isValid(date)) {
                onFilterChange("fechaDesde", format(date, "yyyy-MM-dd"));
              } else {
                onFilterChange("fechaDesde", "");
              }
            }}
            slotProps={{
              desktopPaper: {
                sx: {
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                },
              },
              textField: {
                size: "small",
                sx: {
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  },
                },
              },
            }}
          />

          {/* End date */}
          <DatePicker
            label="End date"
            value={filters.fechaHasta ? parseISO(filters.fechaHasta) : null}
            onChange={(date: Date | null) => {
              if (date && isValid(date)) {
                onFilterChange("fechaHasta", format(date, "yyyy-MM-dd"));
              } else {
                onFilterChange("fechaHasta", "");
              }
            }}
            slotProps={{
              desktopPaper: {
                sx: {
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                },
              },
              textField: {
                size: "small",
                sx: {
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  },
                },
              },
            }}
          />

          {/* Contractors (admin only) */}
          {isAdmin && (
            <FormControl
              size="small"
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                },
              }}
            >
              <InputLabel>Contractors</InputLabel>
              <Select
                multiple
                value={filters.contratistas}
                onChange={(e) => onFilterChange("contratistas", e.target.value)}
                input={<OutlinedInput label="Contractors" />}
                renderValue={(selected) => {
                  if (selected.length === 0) return null;
                  if (selected.length === 1) {
                    const c = contractors.find((ct) => ct.id === selected[0]);
                    return c?.name || `Contractor ${selected[0]}`;
                  }
                  return `${selected.length} selected`;
                }}
                disabled={isLoadingContractors}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {contractors.map((contractor) => (
                  <MenuItem key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Active checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.active}
                onChange={(e) => onFilterChange("active", e.target.checked)}
                icon={<RadioButtonUnchecked />}
                checkedIcon={<CheckCircle />}
                sx={{
                  "&.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label="Active reservations"
            sx={{ margin: 0 }}
          />

          {/* Reset Filtering */}
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-red-500 font-medium border border-[#EAEAEA] rounded-full px-4 py-2 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap bg-[#F7F7F7]"
          >
            Reset Filtering
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default FiltersSection;
