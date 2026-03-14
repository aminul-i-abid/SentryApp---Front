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
import StyledTable from '@/components/ui/StyledTable';
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
    "& .FusePageSimple-content > .container": {
        maxWidth: "100% !important",
        padding: "0 !important",
        width: "100%",
    },
    "& .FusePageSimple-header > .container": {
        maxWidth: "100% !important",
        padding: "0 !important",
        width: "100%",
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
                    <Box
                        sx={{
                            bgcolor: 'white',
                            borderRadius: '16px',
                            p: 3,
                            mb: 3,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3} lg={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                        Artículo
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={itemFilter}
                                            displayEmpty
                                            onChange={(e) => {
                                                setItemFilter(e.target.value as number | "");
                                                setPage(0);
                                            }}
                                            sx={{
                                                height: 40,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                }
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
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3} lg={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                        Almacén
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={warehouseFilter}
                                            displayEmpty
                                            onChange={(e) => {
                                                setWarehouseFilter(e.target.value as number | "");
                                                setPage(0);
                                            }}
                                            sx={{
                                                height: 40,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                }
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
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3} lg={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                        Transacción
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={transactionTypeFilter}
                                            displayEmpty
                                            onChange={(e) => {
                                                setTransactionTypeFilter(e.target.value as number | "");
                                                setPage(0);
                                            }}
                                            sx={{
                                                height: 40,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                }
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
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3} lg={2}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                        Desde
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={(e) => {
                                            setDateFromFilter(e.target.value);
                                            setPage(0);
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 40,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3} lg={2}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                        Hasta
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="date"
                                        value={dateToFilter}
                                        onChange={(e) => {
                                            setDateToFilter(e.target.value);
                                            setPage(0);
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 40,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md="auto">
                                <Box sx={{ mt: 2.5 }}>
                                    <IconButton
                                        onClick={handleSetAllFilters}
                                        sx={{
                                            bgcolor: 'white',
                                            border: '1px solid #E2E8F0',
                                            '&:hover': {
                                                bgcolor: '#F8FAFC',
                                                borderColor: '#415EDE'
                                            }
                                        }}
                                        size="small"
                                        title="Limpiar Filtros"
                                    >
                                        <CleaningServicesIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <StyledTable<MovementDto>
                        columns={[
                            {
                                id: 'movementDate',
                                label: 'Fecha',
                                render: (row) => new Date(row.movementDate).toLocaleDateString()
                            },
                            {
                                id: 'itemName',
                                label: 'Artículo',
                                render: (row) => (
                                    <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                        {row.itemName}
                                    </Typography>
                                )
                            },
                            {
                                id: 'lotNumber',
                                label: 'Lote',
                                render: (row) => row.lotNumber || '-'
                            },
                            {
                                id: 'warehouseName',
                                label: 'Almacén',
                                render: (row) => row.warehouseName
                            },
                            {
                                id: 'locationName',
                                label: 'Ubicación',
                                render: (row) => row.locationName
                            },
                            {
                                id: 'quantity',
                                label: 'Cantidad',
                                render: (row) => row.quantity
                            },
                            {
                                id: 'type',
                                label: 'Tipo',
                                render: (row) => (
                                    <Chip
                                        label={getTypeLabel(row.type)}
                                        color={getTypeColor(row.type)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                )
                            },
                            {
                                id: 'transactionType',
                                label: 'Transacción',
                                render: (row) => (
                                    <Chip
                                        label={getTransactionTypeLabel(row.transactionType)}
                                        color={getTransactionTypeColor(row.transactionType)}
                                        size="small"
                                        sx={{ color: 'white', fontWeight: 600 }}
                                    />
                                )
                            },
                            {
                                id: 'operatorName',
                                label: 'Operador',
                                render: (row) => row.operatorName
                            },
                            {
                                id: 'notes',
                                label: 'Notas',
                                render: (row) => row.notes || '-'
                            }
                        ]}
                        data={movements}
                        getRowId={(row) => String(row.id)}
                        loading={loading}
                        loadingMessage="Cargando movimientos..."
                        emptyMessage="No hay registros"
                        pagination={{
                            count: totalCount,
                            page: page,
                            rowsPerPage: rowsPerPage,
                            onPageChange: handleChangePage
                        }}
                        minWidth={1200}
                    />
                </div>
            }
        />
    );
}

export default Movements;
