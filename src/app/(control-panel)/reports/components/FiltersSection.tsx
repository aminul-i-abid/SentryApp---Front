import React from "react"
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    Box,
    Button,
    Divider,
    Typography,
    FormControlLabel,
    Checkbox,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { FilterAlt, Clear, RadioButtonUnchecked, CheckCircle } from "@mui/icons-material"
import { ContractorResponse } from "../../contractors/models/ContractorResponse"

interface FiltersSectionProps {
    filters: {
        fechaDesde: string
        fechaHasta: string
        contratistas: number[]
        active: boolean
    }
    contractors: ContractorResponse[]
    isLoadingContractors: boolean
    isAdmin: boolean
    user?: any
    onFilterChange: (field: string, value: any) => void
    onResetFilters: () => void
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ 
  filters,
  contractors,
  isLoadingContractors,
  isAdmin,
  user,
  onFilterChange,
  onResetFilters
}) => {
    const theme = useTheme()

    return (
        <Card
            sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                "&:hover": {
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                },
            }}
        >
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" gap={1}>
                        <FilterAlt sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            Filtros
                        </Typography>
                    </Box>
                }
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Fecha Desde */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Fecha Desde"
                            type="date"
                            value={filters.fechaDesde}
                            onChange={(e) => onFilterChange("fechaDesde", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 1,
                                },
                            }}
                        />
                    </Grid>

                    {/* Fecha Hasta */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Fecha Hasta"
                            type="date"
                            value={filters.fechaHasta}
                            onChange={(e) => onFilterChange("fechaHasta", e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 1,
                                },
                            }}
                        />
                    </Grid>

                    {/* Select Múltiple de Contratistas */}
                    <Grid item xs={12} sm={6} md={3}>
                        {isAdmin && (
                            <FormControl fullWidth>
                                <InputLabel>Contratistas</InputLabel>
                                <Select
                                    multiple
                                    value={filters.contratistas}
                                    onChange={(e) => onFilterChange("contratistas", e.target.value)}
                                    input={<OutlinedInput label="Contratistas" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected.map((contractorId) => {
                                                const contractor = contractors.find((c) => c.id === contractorId)
                                                return <Chip key={contractorId} label={contractor?.name || `Contratista ${contractorId}`} size="small" />
                                            })}
                                        </Box>
                                    )}
                                    disabled={isLoadingContractors}
                                    sx={{
                                        borderRadius: 1,
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
                    </Grid>

                    {/* Checkbox Activos */}
                    <Grid item xs={12} sm={6} md={3}>
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
                                        "&:hover": {
                                            backgroundColor: "rgba(10, 116, 218, 0.04)",
                                        },
                                    }}
                                />
                            }
                            label="Reservas activas"
                            sx={{
                                margin: 0,
                                alignItems: "center",
                            }}
                        />
                    </Grid>

                    {/* Botón Resetear */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            startIcon={<Clear />}
                            onClick={onResetFilters}
                            sx={{
                                borderRadius: 1,
                                padding: "12px 16px",
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Resetear
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default FiltersSection
