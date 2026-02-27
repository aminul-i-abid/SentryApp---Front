import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, List, ListItem, ListItemText, TextField, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { searchByRut, validateRutsFromExcel, cancelByRut } from '@/app/(control-panel)/reserve/reserveService';
import { useSnackbar } from 'notistack';

type PersonOption = {
    dni: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
};

type CancelByRutSidebarProps = {
    open: boolean;
    onClose: () => void;
};

const CancelByRutSidebar: React.FC<CancelByRutSidebarProps> = ({ open, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<PersonOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedOption, setSelectedOption] = useState<PersonOption | null>(null);
    const [rutError, setRutError] = useState<string>('');
    const [selectedList, setSelectedList] = useState<PersonOption[]>([]);
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    type ValidationErrorItem = { Rut: string; firstName?: string; lastName?: string; ErrorReason?: string };
    const [validationErrors, setValidationErrors] = useState<ValidationErrorItem[]>([]);
    const [openValidationModal, setOpenValidationModal] = useState(false);

    const validateRut = (rut: string) => {
        const rutRegex = /^\d{8}-[0-9kK]$/;
        if (!rut) {
            return 'El RUT es requerido';
        } else if (!rutRegex.test(rut)) {
            return 'El RUT debe tener el formato: 12345678-9 o 12345678-K';
        }
        const [num, dv] = rut.split('-');
        let suma = 0;
        let multiplicador = 2;
        for (let i = num.length - 1; i >= 0; i--) {
            suma += parseInt(num[i], 10) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = suma % 11;
        let dvEsperado: string;
        if (11 - resto === 11) dvEsperado = '0';
        else if (11 - resto === 10) dvEsperado = 'K';
        else dvEsperado = String(11 - resto);
        if (dvEsperado !== dv.toUpperCase()) {
            return 'El RUT no es válido';
        }
        return '';
    };

    const handleRutSearch = async (query: string) => {
        if (!query || query.length < 3) {
            setOptions([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await searchByRut(query);
            if (response?.succeeded && response.data) {
                const list = Array.isArray(response.data) ? response.data : [response.data];
                setOptions(list);
            } else {
                setOptions([]);
            }
        } catch (e) {
            setOptions([]);
        } finally {
            setIsSearching(false);
        }
    };

    const addUniqueByPerson = (person: PersonOption) => {
        if (!person?.dni) return;
        setSelectedList((prev) => {
            const exists = prev.some((p) => p.dni.toLowerCase() === person.dni.toLowerCase());
            if (exists) return prev;
            return [...prev, person];
        });
    };

    const addByRut = async (rut: string) => {
        const err = validateRut(rut);
        setRutError(err);
        if (err) return;
        try {
            setIsSearching(true);
            const response = await searchByRut(rut);
            if (response?.succeeded && response.data) {
                const list: PersonOption[] = Array.isArray(response.data) ? response.data : [response.data];
                const match = list.find((p) => p.dni?.toLowerCase() === rut.toLowerCase()) || list[0];
                if (match) {
                    addUniqueByPerson(match);
                    setInputValue('');
                    setSelectedOption(null);
                    setRutError('');
                } else {
                    setRutError('No se encontraron resultados para el RUT ingresado');
                }
            } else {
                setRutError('No se encontraron resultados para el RUT ingresado');
            }
        } catch (e) {
            setRutError('Error al buscar el RUT');
        } finally {
            setIsSearching(false);
        }
    };

    const handleDelete = (dni: string) => {
        setSelectedList((prev) => prev.filter((p) => p.dni !== dni));
    };

    const handleCancelReservations = async () => {
        const ruts = selectedList.map((p) => p.dni).filter(Boolean);
        if (ruts.length === 0) return;
        try {
            setIsSearching(true);
            const response = await cancelByRut(ruts);
            const apiValidationErrorsRaw = (response as any)?.data?.ValidationErrors || (response as any)?.data?.validationErrors;
            if (Array.isArray(apiValidationErrorsRaw) && apiValidationErrorsRaw.length > 0) {
                const normalized: ValidationErrorItem[] = apiValidationErrorsRaw.map((e: any) => ({
                    Rut: e?.Rut ?? e?.rut ?? e?.DNI ?? e?.dni ?? '',
                    firstName: e?.firstName ?? e?.FirstName ?? '',
                    lastName: e?.lastName ?? e?.LastName ?? '',
                    ErrorReason: e?.ErrorReason ?? e?.errorReason ?? e?.reason ?? e?.Reason ?? ''
                }));
                setValidationErrors(normalized);
                setOpenValidationModal(true);
                return;
            }
            if (response?.succeeded) {
                enqueueSnackbar('Se estan procesando las cancelaciones de reservas', { variant: 'success' });
                setSelectedList([]);
                onClose();
            } else {
                const message = Array.isArray(response?.message) ? response.message[0] : (response?.message || 'Error al cancelar reservas');
                enqueueSnackbar(message as string, { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Error al cancelar reservas', { variant: 'error' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleExcelClick = () => {
        fileInputRef.current?.click();
    };

    const handleExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsSearching(true);
            try {
                const response = await validateRutsFromExcel(file);
                if (response?.succeeded && Array.isArray(response.data?.validRuts) && response.data.validRuts.length > 0) {
                    const ruts: string[] = response.data.validRuts;
                    setSelectedList((prev) => {
                        const existing = new Set(prev.map((p) => (p.dni || '').toLowerCase()));
                        const newItems = ruts
                            .filter((rut) => rut && !existing.has(rut.toLowerCase()))
                            .map((rut) => ({ dni: rut } as PersonOption));
                        return [...prev, ...newItems];
                    });
                    setRutError('');
                } else {
                    setRutError('No se encontraron RUTs válidos en el archivo');
                }
            } catch (error) {
                setRutError('Error al procesar el archivo');
            } finally {
                setIsSearching(false);
            }
        }
        // Reset input para permitir recargar el mismo archivo si es necesario
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (!open) {
            setInputValue('');
            setOptions([]);
            setSelectedOption(null);
            setRutError('');
        }
    }, [open]);

    return (
        <>
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', width: { xs: '100%', sm: '70vw', md: '70vw' }, maxWidth: '600px', bgcolor: '#eeeeee' }}>
            <Box sx={{
                background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)',
                color: 'black',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
            }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    Cancelación por RUT
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={handleCancelReservations}
                        disabled={selectedList.length === 0}
                    >
                        Cancelar reservas
                    </Button>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'black',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Card elevation={0} sx={{ mb: 2, boxShadow: 'none', border: 'none', bgcolor: '#f5f5f5' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                                <Autocomplete
                freeSolo
                options={options}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option?.dni || '';
                }}
                value={selectedOption}
                inputValue={inputValue}
                onChange={(event, newValue) => {
                    if (typeof newValue === 'object' && newValue !== null) {
                        addUniqueByPerson(newValue as PersonOption);
                        setSelectedOption(null);
                        setInputValue('');
                        setRutError('');
                    } else if (typeof newValue === 'string') {
                        setSelectedOption(null);
                        setInputValue(newValue);
                        setRutError(validateRut(newValue));
                    } else {
                        setSelectedOption(null);
                    }
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                    if (!selectedOption) {
                        setRutError(validateRut(newInputValue));
                    }
                    handleRutSearch(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="RUT"
                        placeholder="Ingrese RUT y presione Enter"
                        variant="outlined"
                        fullWidth
                        size="small"
                        error={!!rutError}
                        helperText={rutError}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addByRut(inputValue.trim());
                            }
                        }}
                    />
                )}
                loading={isSearching}
                loadingText="Buscando..."
                noOptionsText={inputValue.length < 3 ? 'Ingrese al menos 3 caracteres' : 'No se encontraron resultados'}
            />
                            </Box>
                            <Box>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleExcelChange}
                                    style={{ display: 'none' }}
                                />
                                <IconButton aria-label="Cargar excel" color="primary" size="small" onClick={handleExcelClick}>
                                    <UploadFileIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card elevation={0} sx={{ boxShadow: 'none', border: 'none', bgcolor: '#f5f5f5' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Lista
                        </Typography>
                        <List dense>
                            {selectedList.map((person) => (
                                <ListItem
                                    key={person.dni}
                                    disableGutters
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(person.dni)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={person.dni} />
                                </ListItem>
                            ))}
                            {selectedList.length === 0 && (
                                <Box sx={{ px: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay RUT agregados.
                                    </Typography>
                                </Box>
                            )}
                        </List>
                    </CardContent>
                </Card>
            </Box>
        </Box>
        <Dialog open={openValidationModal} onClose={() => setOpenValidationModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Reservas no canceladas</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper} sx={{ backgroundColor: 'white' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>RUT</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Apellido</TableCell>
                                <TableCell>Motivo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {validationErrors.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{item.Rut}</TableCell>
                                    <TableCell>{item.firstName || ''}</TableCell>
                                    <TableCell>{item.lastName || ''}</TableCell>
                                    <TableCell>{item.ErrorReason || ''}</TableCell>
                                </TableRow>
                            ))}
                            {validationErrors.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">Sin datos</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenValidationModal(false)} variant="contained" color="primary">Cerrar</Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default CancelByRutSidebar;


