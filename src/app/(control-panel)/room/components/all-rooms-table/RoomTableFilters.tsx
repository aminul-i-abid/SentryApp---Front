import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { ContractorResponse } from "../../../contractors/models/ContractorResponse";

interface RoomTableFiltersProps {
  searchText: string;
  selectedCompanies: string[];
  selectedBlocks: string[];
  batteryFilter: string;
  companies: string[];
  blocks: string[];
  contractors: ContractorResponse[];
  onSearchChange: (value: string) => void;
  onCompaniesChange: (companies: string[]) => void;
  onBlocksChange: (blocks: string[]) => void;
  onBatteryFilterChange: (filter: string) => void;
  onClearFilters: () => void;
}

const accentColor = "#415EDE";

const RoomTableFilters: React.FC<RoomTableFiltersProps> = ({
  searchText,
  selectedCompanies,
  selectedBlocks,
  batteryFilter,
  companies,
  blocks,
  onSearchChange,
  onCompaniesChange,
  onBlocksChange,
  onBatteryFilterChange,
  onClearFilters,
}) => {
  return (
    <Box sx={{ width: 320, maxHeight: "80vh", overflowY: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid #F0F0F0",
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            bgcolor: "#EEF2FF",
            border: "1px solid #C7D2FE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: "#415EDE" }} />
        </Box>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ color: "#1E293B" }}
        >
          Filtros
        </Typography>
      </Box>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Buscar habitación"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "#F3F4F6",
              "&.Mui-focused": { backgroundColor: "#fff" },
              "& fieldset": { borderColor: "#E5E7EB" },
              "&:hover fieldset": { borderColor: "#C7D2FE" },
              "&.Mui-focused fieldset": { borderColor: "#415EDE" },
            },
          }}
        />

        {/* Contractor filter */}
        <Autocomplete
          multiple
          id="company-filter-autocomplete"
          options={companies}
          value={selectedCompanies}
          onChange={(_event, newValue) => onCompaniesChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Filtrar por Contratista"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F3F4F6",
                  "& fieldset": { borderColor: "#E5E7EB" },
                  "&:hover fieldset": { borderColor: "#C7D2FE" },
                  "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                },
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                sx={{
                  borderRadius: "6px",
                  backgroundColor: "#EEF2FF",
                  color: accentColor,
                  fontWeight: 500,
                  "& .MuiChip-deleteIcon": { color: accentColor, opacity: 0.6 },
                }}
              />
            ))
          }
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          disableCloseOnSelect
          limitTags={2}
        />

        {/* Block filter */}
        <Autocomplete
          multiple
          id="block-filter-autocomplete"
          options={blocks}
          value={selectedBlocks}
          onChange={(_event, newValue) => onBlocksChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Filtrar por Pabellón"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F3F4F6",
                  "& fieldset": { borderColor: "#E5E7EB" },
                  "&:hover fieldset": { borderColor: "#C7D2FE" },
                  "&.Mui-focused fieldset": { borderColor: "#415EDE" },
                },
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                sx={{
                  borderRadius: "6px",
                  backgroundColor: "#EEF2FF",
                  color: accentColor,
                  fontWeight: 500,
                  "& .MuiChip-deleteIcon": { color: accentColor, opacity: 0.6 },
                }}
              />
            ))
          }
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          disableCloseOnSelect
          limitTags={2}
        />

        {/* Battery filter */}
        <Box
          sx={{
            bgcolor: "#F8FAFF",
            border: "1px solid #E6EEF9",
            borderRadius: "12px",
            px: 1.5,
            py: 1.25,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: "#415EDE",
              mb: 0.75,
              fontSize: "0.8rem",
              letterSpacing: "0.02em",
            }}
          >
            Filtro de Batería
          </Typography>

          <RadioGroup
            value={batteryFilter}
            onChange={(e) => onBatteryFilterChange(e.target.value)}
            sx={{ gap: 0.25, ml: 0.5 }}
          >
            {[
              { value: "all", label: "Todas las habitaciones" },
              { value: "with-battery", label: "Con nivel de batería" },
              { value: "without-battery", label: "Sin nivel de batería" },
              { value: "low", label: "Batería baja (< 35%)" },
              { value: "medium", label: "Batería media (35% - 65%)" },
              { value: "high", label: "Batería alta (> 65%)" },
            ].map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: "#CBD5E1",
                      "&.Mui-checked": { color: accentColor },
                      p: "4px",
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", fontSize: "0.8125rem" }}
                  >
                    {opt.label}
                  </Typography>
                }
                sx={{ mx: 0, "& .MuiFormControlLabel-label": { ml: 0.5 } }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid #F0F0F0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onClearFilters}
          size="small"
          sx={{
            borderRadius: "8px",
            color: "#415EDE",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            px: 1.5,
            "&:hover": { bgcolor: "#EEF2FF" },
          }}
        >
          Limpiar filtros
        </Button>
      </Box>
    </Box>
  );
};

export default RoomTableFilters;
