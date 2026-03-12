import FusePageSimple from "@fuse/core/FusePageSimple";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    InputAdornment,
    IconButton,
    Card,
    CardContent,
    CardHeader,
    Divider,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import './i18n';
import { getAllMovements } from "./movementsService";
import { MovementDto } from "./models/Movements";
import { getItems } from "../items/itemsService";
import { getWarehouses } from "../warehouses/warehousesService";
import { getLocations } from "../locations/locationsService";

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
}));

function Movements() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();

    // State
    const [movements, setMovements] = useState<MovementDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [warehouseFilter, setWarehouseFilter] = useState<number | "">("");
    const [itemFilter, setItemFilter] = useState<number | "">("");
    const [locationFilter, setLocationFilter] = useState<number | "">("");
    const [typeFilter, setTypeFilter] = useState<number | "">("");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<number | "">("");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");

    // Dropdown data
    const [items, setItems] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<any[]>([]);

    useEffect(() => {
        fetchMovements();
    }, [page, rowsPerPage, warehouseFilter, itemFilter, locationFilter, typeFilter, transactionTypeFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (warehouseFilter) {
            fetchLocations(warehouseFilter as number);
        } else {
            setFilteredLocations([]);
            setLocationFilter("");
        }
    }, [warehouseFilter]);

    const fetchDropdownData = async () => {
        try {
            const [itemsRes, warehousesRes] = await Promise.all([
                getItems(1, 1000),
                getWarehouses(1, 1000)
            ]);

            if (itemsRes.succeeded && itemsRes.data?.items) {
                setItems(itemsRes.data.items);
            }
            if (warehousesRes.succeeded && warehousesRes.data?.items) {
                setWarehouses(warehousesRes.data.items);
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    };

    const fetchLocations = async (warehouseId: number) => {
        try {
            const response = await getLocations(1, 1000, warehouseId);
            if (response.succeeded && response.data?.items) {
                setFilteredLocations(response.data.items);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const response = await getAllMovements(
                page + 1,
                rowsPerPage,
                itemFilter || undefined,
                undefined, // lotId - not used in this screen
                warehouseFilter || undefined,
                locationFilter || undefined,
                typeFilter || undefined,
                transactionTypeFilter || undefined,
                dateFromFilter || undefined,
                dateToFilter || undefined
            );

            if (response.succeeded && response.data) {
                setMovements(response.data.items);
                setTotalCount(response.data.totalCount);
            } else {
                setMovements([]);
                setTotalCount(0);
                enqueueSnackbar(response.message || 'Error al cargar los movimientos', { variant: "error" });
            }
        } catch (error: any) {
            console.error("Error fetching movements:", error);
            setMovements([]);
            setTotalCount(0);
            const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || 'Error al cargar los movimientos';
            enqueueSnackbar(errorMessage, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSetAllFilters = () => {
        setWarehouseFilter("");
        setItemFilter("");
        setLocationFilter("");
        setTypeFilter("");
        setTransactionTypeFilter("");
        setDateFromFilter("");
        setDateToFilter("");
        setPage(0);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getTransactionTypeLabel = (transactionType: number): string => {
        switch (transactionType) {
            case 1: return 'Recepción';
            case 2: return 'Transferencia';
            case 3: return 'Consumo';
            case 4: return 'Scrap';
            case 5: return 'Ajuste Positivo';
            case 6: return 'Ajuste Negativo';
            default: return '-';
        }
    };

    const getTransactionTypeColor = (transactionType: number): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
        switch (transactionType) {
            case 1: return 'success'; // Receiving
            case 2: return 'info'; // Transfers
            case 3: return 'warning'; // Consumption
            case 4: return 'error'; // Scrap
            case 5: return 'primary'; // Positive Adjustment
            case 6: return 'secondary'; // Negative Adjustment
            default: return 'default';
        }
    };

    const getTypeLabel = (type: number): string => {
        return type === 1 ? 'Incremento' : 'Disminución';
    };

    const getTypeColor = (type: number): "success" | "error" => {
        return type === 1 ? 'success' : 'error';
    };

    return (
        <Root
            scroll="content"
            header={
                <div className="p-6 flex items-center justify-between">
                    {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                    <h2 className="text-2xl font-bold">Todos Los Movimientos</h2>
                </div>
            }
            content={
                <div className="p-6">
                    {/* Filters Section */}
                    {/* Main Content Paper */}
                    <Paper elevation={1} variant="outlined" className="w-full overflow-hidden">
                        {/* Filters Section */}
                        <Box p={2} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Grid container spacing={2} alignItems="center">

                                {/* Filters */}
                                <Grid item xs={12} sm={6} md={3} lg={2.5}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Artículo</InputLabel>
                                        <Select
                                            value={itemFilter}
                                            label="Artículo"
                                            onChange={(e) => {
                                                setItemFilter(e.target.value as number | "");
                                                setPage(0);
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {items.map((item) => (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={2} lg={2.5}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Almacén</InputLabel>
                                        <Select
                                            value={warehouseFilter}
                                            label="Almacén"
                                            onChange={(e) => {
                                                setWarehouseFilter(e.target.value as number | "");
                                                setPage(0);
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            {warehouses.map((warehouse) => (
                                                <MenuItem key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={2} lg={2.5}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Transacción</InputLabel>
                                        <Select
                                            value={transactionTypeFilter}
                                            label="Transacción"
                                            onChange={(e) => {
                                                setTransactionTypeFilter(e.target.value as number | "");
                                                setPage(0);
                                            }}
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            <MenuItem value={1}>Recepción</MenuItem>
                                            <MenuItem value={2}>Transferencia</MenuItem>
                                            <MenuItem value={3}>Consumo</MenuItem>
                                            <MenuItem value={4}>Scrap</MenuItem>
                                            <MenuItem value={5}>Ajuste Pos.</MenuItem>
                                            <MenuItem value={6}>Ajuste Neg.</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={2} lg={1.8}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        label="Desde"
                                        value={dateFromFilter}
                                        onChange={(e) => {
                                            setDateFromFilter(e.target.value);
                                            setPage(0);
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={2} lg={1.8}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        label="Hasta"
                                        value={dateToFilter}
                                        onChange={(e) => {
                                            setDateToFilter(e.target.value);
                                            setPage(0);
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                <Grid item xs={12} md="auto" sx={{ ml: 'auto' }}>
                                    <IconButton 
                                        onClick={handleSetAllFilters} 
                                        color="inherit" 
                                        size="small"
                                        title="Limpiar Filtros"
                                    >
                                        <CleaningServicesIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>

                        <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Artículo</TableCell>
                                    <TableCell>Lote</TableCell>
                                    <TableCell>Almacén</TableCell>
                                    <TableCell>Ubicación</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Transacción</TableCell>
                                    <TableCell>Operador</TableCell>
                                    <TableCell>Notas</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                <CircularProgress size={24} />
                                                <Typography>Cargando...</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : movements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography color="text.secondary">No hay registros</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    movements.map((movement) => (
                                        <TableRow key={movement.id} hover>
                                            <TableCell>
                                                {new Date(movement.movementDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600}>{movement.itemName}</Typography>
                                            </TableCell>
                                            <TableCell>{movement.lotNumber}</TableCell>
                                            <TableCell>{movement.warehouseName}</TableCell>
                                            <TableCell>{movement.locationName}</TableCell>
                                            <TableCell>
                                                    {movement.quantity}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getTypeLabel(movement.type)}
                                                    color={getTypeColor(movement.type)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {getTransactionTypeLabel(movement.transactionType)}
                                            </TableCell>
                                            <TableCell>{movement.operatorName}</TableCell>
                                            <TableCell>{movement.notes || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={totalCount}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </TableContainer>
                    </Paper>
                </div>
            }
        />
    );
}

export default Movements;
