import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    SelectChangeEvent,
    Stack,
    Button,
    Autocomplete,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Typography,
} from '@mui/material';
import { ContractorResponse } from '../../../contractors/models/ContractorResponse';

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

const RoomTableFilters: React.FC<RoomTableFiltersProps> = ({
    searchText,
    selectedCompanies,
    selectedBlocks,
    batteryFilter,
    companies,
    blocks,
    contractors,
    onSearchChange,
    onCompaniesChange,
    onBlocksChange,
    onBatteryFilterChange,
    onClearFilters,
}) => {
    const handleCompanyFilterChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const companies = typeof value === 'string' ? value.split(',') : value;
        onCompaniesChange(companies);
    };

    const handleBlockFilterChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const blocks = typeof value === 'string' ? value.split(',') : value;
        onBlocksChange(blocks);
    };

    return (
        <Box sx={{ p: 2, width: 400, maxHeight: '80vh', overflowY: 'auto' }}>
            <TextField
                fullWidth
                label="Buscar habitación"
                placeholder="Buscar por habitación, contratista o piso..."
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ mb: 2 }}
                variant="outlined"
                size="small"
            />

            <Autocomplete
                multiple
                id="company-filter-autocomplete"
                options={companies}
                value={selectedCompanies}
                onChange={(event, newValue) => onCompaniesChange(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Filtrar por Contratista"
                        placeholder="Selecciona contratistas..."
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
                        />
                    ))
                }
                sx={{ mb: 2 }}
                disableCloseOnSelect
                limitTags={2}
            />

            <Autocomplete
                multiple
                id="block-filter-autocomplete"
                options={blocks}
                value={selectedBlocks}
                onChange={(event, newValue) => onBlocksChange(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Filtrar por Pabellón"
                        placeholder="Selecciona pabellones..."
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
                        />
                    ))
                }
                sx={{ mb: 2 }}
                disableCloseOnSelect
                limitTags={2}
            />

            <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem' }}>
                    Filtro de Batería
                </FormLabel>
                <RadioGroup
                    value={batteryFilter}
                    onChange={(e) => onBatteryFilterChange(e.target.value)}
                >
                    <FormControlLabel
                        value="all"
                        control={<Radio size="small" />}
                        label="Todas las habitaciones"
                    />
                    <FormControlLabel
                        value="with-battery"
                        control={<Radio size="small" />}
                        label="Con nivel de batería"
                    />
                    <FormControlLabel
                        value="without-battery"
                        control={<Radio size="small" />}
                        label="Sin nivel de batería"
                    />
                    <FormControlLabel
                        value="low"
                        control={<Radio size="small" />}
                        label={
                            <Box>
                                <Typography variant="body2">Batería baja (&lt; 35%)</Typography>
                            </Box>
                        }
                    />
                    <FormControlLabel
                        value="medium"
                        control={<Radio size="small" />}
                        label={
                            <Box>
                                <Typography variant="body2">Batería media (35% - 65%)</Typography>
                            </Box>
                        }
                    />
                    <FormControlLabel
                        value="high"
                        control={<Radio size="small" />}
                        label={
                            <Box>
                                <Typography variant="body2">Batería alta (&gt; 65%)</Typography>
                            </Box>
                        }
                    />
                </RadioGroup>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button onClick={onClearFilters} variant="outlined">
                    Limpiar filtros
                </Button>
            </Stack>
        </Box>
    );
};

export default RoomTableFilters;
