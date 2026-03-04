import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
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
    <Box sx={{ width: 340, maxHeight: "80vh", overflowY: "auto" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: "#1E293B" }}
        >
          Filtros
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 2 }}>
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
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "#F9FAFB",
              "&.Mui-focused": {
                backgroundColor: "#fff",
              },
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
            mb: 2,
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
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          disableCloseOnSelect
          limitTags={2}
        />

        {/* Battery filter */}
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ color: "#475569", mb: 1 }}
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

      <Divider />

      {/* Actions */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ px: 2.5, py: 1.5, justifyContent: "flex-end" }}
      >
        <Button
          onClick={onClearFilters}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: "8px",
            borderColor: "#E2E8F0",
            color: "#64748B",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" },
          }}
        >
          Limpiar filtros
        </Button>
      </Stack>
    </Box>
  );
};

export default RoomTableFilters;
