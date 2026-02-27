import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, Box, Divider, Grid, TextField, Button, Typography, Autocomplete, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { getRooms } from '@/app/(control-panel)/room/roomService';
import { getCamps } from '@/app/(control-panel)/camps/campsService';
import { getBlocks, getBlockByCampId } from '@/app/(control-panel)/block/blockService';
import { getContractors } from '@/app/(control-panel)/contractors/contractorsService';
import { getDoorLockAccessLogsExcel } from '../auditoryService';
import { styled, useTheme } from '@mui/material/styles';
import { Clear, FilterAlt, Download } from '@mui/icons-material';
import { AuditoryTables, AUDITORY_TABLE_OPTIONS } from '../models/AuditoryTables';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setAuditoryFilters, resetAuditoryFilters } from '@/store/auditoryFiltersSlice';
import { useLoading } from '@/contexts/LoadingContext';
import useUser from '@auth/useUser';

interface AuditoryFiltersProps {
    selectedTable: AuditoryTables | '';
    onTableChange: (event: SelectChangeEvent<AuditoryTables | ''>) => void;
}

const AuditoryFilters = ({ selectedTable, onTableChange }: AuditoryFiltersProps) => {

    const theme = useTheme();
    const dispatch = useDispatch();
    const filters = useSelector((state: RootState) => state.auditoryFilters);
    const { showLoading, hideLoading } = useLoading();
    const { data: user } = useUser();
    const hasTTLock = user?.modules?.ttlock === true;

    const [camps, setCamps] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [contractors, setContractors] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    // Fetch rooms (now from blocks)
    const updateRoomsFromBlocks = (blocks: any[]) => {
        // Extract all rooms from all blocks
        const allRoomsFromBlocks = blocks.flatMap((block: any) => block.rooms || []);
        setAllRooms(allRoomsFromBlocks);
        setFilteredRooms(allRoomsFromBlocks);
    };
    const [loadingCamps, setLoadingCamps] = useState(false);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [loadingContractors, setLoadingContractors] = useState(false);
    // Fetch contractors
    const fetchContractors = async () => {
        setLoadingContractors(true);
        try {
            const res = await getContractors();
            setContractors(res.data || []);
        } finally {
            setLoadingContractors(false);
        }
    };

    // Fetch camps
    const fetchCamps = async () => {
        setLoadingCamps(true);
        try {
            const res = await getCamps();
            setCamps(res.data || []);
        } finally {
            setLoadingCamps(false);
        }
    };

    // Fetch blocks (by camp if selected)
    const fetchBlocks = async (campId?: number) => {
        setLoadingBlocks(true);
        try {
            let res;
            if (campId) {
                res = await getBlockByCampId(campId);
            } else {
                res = await getBlocks();
            }
            const blocksData = res.data || [];
            setBlocks(blocksData);
            updateRoomsFromBlocks(blocksData);
        } finally {
            setLoadingBlocks(false);
        }
    };

    useEffect(() => {
        fetchCamps();
        fetchContractors();
        updateRoomsFromBlocks([]);
    }, []);

    useEffect(() => {
        if (filters.campId) {
            fetchBlocks(filters.campId);
        } else {
            fetchBlocks();
        }
    }, [filters.campId, selectedTable]);

    // Filter rooms when block selection changes
    useEffect(() => {
        filterRoomsByBlocks(filters.blockId || []);
    }, [filters.blockId, allRooms]);

    const handleResetFilters = () => {
        dispatch(resetAuditoryFilters());
    };

    const handleDownloadExcel = async () => {
        try {
            showLoading('Se está generando el reporte Excel, aguarde un instante...');
            await getDoorLockAccessLogsExcel();
        } catch (error) {
            console.error('Error downloading Excel:', error);
            // Aquí podrías mostrar un toast o notificación de error
        } finally {
            hideLoading();
        }
    };

    // Función para manejar cambios en los filtros (Autocomplete)
    const handleFilterChange = (field: keyof typeof filters, value: any) => {
        dispatch(setAuditoryFilters({ [field]: value && value.length > 0 ? value : null }));
    };

    // Función para manejar cambios en los filtros de Select
    const handleSelectChange = (field: keyof typeof filters, value: any) => {
        dispatch(setAuditoryFilters({ [field]: value }));
    };

    // Filter rooms based on selected blocks
    const filterRoomsByBlocks = (selectedBlockIds: number[]) => {
        if (!selectedBlockIds || selectedBlockIds.length === 0) {
            setFilteredRooms(allRooms);
        } else {
            const filtered = allRooms.filter((room: any) =>
                selectedBlockIds.includes(room.blockId)
            );
            setFilteredRooms(filtered);
        }
    };

    useEffect(() => {
        // Si cambia la tabla seleccionada, podrías resetear filtros o actualizar el filtro de tabla
        dispatch(setAuditoryFilters({ table: selectedTable }));
    }, [selectedTable, dispatch]);


    return (
        <Card>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center" gap={1}>
                            <FilterAlt sx={{ color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                Filtros
                            </Typography>
                        </Box>
                        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
                            <InputLabel id="table-select-label">Tabla de Auditoría</InputLabel>
                            <Select
                                labelId="table-select-label"
                                id="table-select"
                                value={selectedTable}
                                onChange={onTableChange}
                                label="Tabla de Auditoría"
                                size="small"
                            >
                                <MenuItem value="">
                                    <em>Selecciona una tabla</em>
                                </MenuItem>
                                {AUDITORY_TABLE_OPTIONS.filter(option => !option.requiresTTLock || hasTTLock).map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.display}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                }
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Autocomplete Pabellón para Historial de Accesos */}
                    {selectedTable === AuditoryTables.DOORLOCKACCESSLOGS && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            multiple
                            options={blocks}
                            getOptionLabel={(option: any) => option.name}
                            value={blocks.filter((b: any) => (filters.blockId ?? []).includes(b.id))}
                            onChange={(_, value) => {
                                const selectedIds = value.map((v: any) => v.id);
                                handleFilterChange('blockId', selectedIds);
                                filterRoomsByBlocks(selectedIds);
                            }}
                            loading={loadingBlocks}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size="small"
                            renderInput={(params) => <TextField {...params} label="Pabellón" placeholder="Buscar..." size="small" sx={{ minHeight: 40 }} />}
                            renderTags={(selected) => selected.length > 0 ? [`${selected.length} seleccionados`] : []}
                            sx={{ minHeight: 40 }}
                        />
                    </Grid>
                    )}
                    {/* Autocomplete Rooms */}
                    {(selectedTable === AuditoryTables.RESERVATIONS || selectedTable === AuditoryTables.DOORLOCK || selectedTable === AuditoryTables.ROOMDISABLEDSTATES || selectedTable === AuditoryTables.WHATSAPP || selectedTable === AuditoryTables.ROOM || selectedTable === AuditoryTables.DOORLOCKACCESSLOGS) && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            multiple
                            options={filteredRooms}
                            getOptionLabel={(option: any) => option.roomNumber ? `${option.roomNumber}` : option.id}
                            value={filteredRooms.filter((r: any) => (filters.roomId ?? []).includes(r.id))}
                            onChange={(_, value) => handleFilterChange('roomId', value.map((v: any) => v.id))}
                            loading={loadingRooms}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size="small"
                            renderInput={(params) => <TextField {...params} label="Habitación" placeholder="Buscar..." size="small" sx={{ minHeight: 40 }} />}
                            renderTags={(selected) => selected.length > 0 ? [`${selected.length} seleccionadas`] : []}
                            sx={{ minHeight: 40 }}
                        />
                    </Grid>
                    )}
                    {/* Autocomplete Contractor */}
                    {selectedTable === AuditoryTables.COMPANY && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            multiple
                            options={contractors}
                            getOptionLabel={(option: any) => option.name}
                            value={contractors.filter((c: any) => (filters.companyId ?? []).includes(c.id))}
                            onChange={(_, value) => handleFilterChange('companyId', value.map((v: any) => v.id))}
                            loading={loadingContractors}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size="small"
                            renderInput={(params) => <TextField {...params} label="Contratista" placeholder="Buscar..." size="small" sx={{ minHeight: 40 }} />}
                            renderTags={(selected) => selected.length > 0 ? [`${selected.length} seleccionados`] : []}
                            sx={{ minHeight: 40 }}
                        />
                    </Grid>
                    )}
                    {/* Autocomplete Campamento */}
                    {(selectedTable === AuditoryTables.BLOCK || selectedTable === AuditoryTables.CAMP) && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            multiple
                            options={camps}
                            getOptionLabel={(option: any) => option.name}
                            value={camps.filter((c: any) => (filters.campId ?? []).includes(c.id))}
                            onChange={(_, value) => handleFilterChange('campId', value.map((v: any) => v.id))}
                            loading={loadingCamps}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size="small"
                            renderInput={(params) => <TextField {...params} label="Campamento" placeholder="Buscar..." size="small" sx={{ minHeight: 40 }} />}
                            renderTags={(selected) => selected.length > 0 ? [`${selected.length} seleccionados`] : []}
                            sx={{ minHeight: 40 }}
                        />
                    </Grid>
                    )}
                    {/* Autocomplete Bloque/Pabellón */}
                    {(selectedTable === AuditoryTables.BLOCK || selectedTable === AuditoryTables.ROOM) && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            multiple
                            options={blocks}
                            getOptionLabel={(option: any) => option.name}
                            value={blocks.filter((b: any) => (filters.blockId ?? []).includes(b.id))}
                            onChange={(_, value) => handleFilterChange('blockId', value.map((v: any) => v.id))}
                            loading={loadingBlocks}
                            disableCloseOnSelect
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size="small"
                            renderInput={(params) => <TextField {...params} label="Bloque" placeholder="Buscar..." size="small" sx={{ minHeight: 40 }} />}
                            renderTags={(selected) => selected.length > 0 ? [`${selected.length} seleccionados`] : []}
                            sx={{ minHeight: 40 }}
                        />
                    </Grid>
                    )}
                    {/* Filtro de Éxito para Historial de Accesos */}
                    {selectedTable === AuditoryTables.DOORLOCKACCESSLOGS && (
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small" sx={{ minHeight: 40 }}>
                            <InputLabel>Estado del Acceso</InputLabel>
                            <Select
                                name="success"
                                value={filters.success !== null && filters.success !== undefined ? String(filters.success) : ''}
                                onChange={(e: SelectChangeEvent<string>) => {
                                    const value = e.target.value;
                                    handleSelectChange('success', value === '' ? null : Number(value));
                                }}
                                label="Estado del Acceso"
                            >
                                <MenuItem value="">
                                    <em>Todos</em>
                                </MenuItem>
                                <MenuItem value="1">Exitoso</MenuItem>
                                <MenuItem value="0">Fallido</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    )}
                    {/* Fecha Desde */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Fecha Desde"
                            type="date"
                            value={filters.fechaDesde || ''}
                            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            size="small"
                            sx={{
                                minHeight: 40,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                }
                            }}
                        />
                    </Grid>

                    {/* Fecha Hasta */}
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Fecha Hasta"
                            type="date"
                            value={filters.fechaHasta || ''}
                            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            size="small"
                            sx={{
                                minHeight: 40,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                }
                            }}
                        />
                    </Grid>

                    {/* Botón Descargar Auditoría - Solo para Historial de Accesos */}
                    {selectedTable === AuditoryTables.DOORLOCKACCESSLOGS && (
                        <Grid item xs={12} sm={6} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                startIcon={<Download />}
                                onClick={handleDownloadExcel}
                                sx={{
                                    borderRadius: 1,
                                    padding: '12px 16px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Descargar Auditoría
                            </Button>
                        </Grid>
                    )}

                    {/* Botón Resetear */}
                    <Grid item xs={12} sm={6} md={selectedTable === AuditoryTables.DOORLOCKACCESSLOGS ? 3 : 4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            startIcon={<Clear />}
                            onClick={handleResetFilters}
                            sx={{
                                borderRadius: 1,
                                padding: '12px 16px',
                                textTransform: 'none',
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

export default AuditoryFilters