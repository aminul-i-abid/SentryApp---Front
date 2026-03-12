import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    CircularProgress,
    Typography,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getStocks } from './stockService';
import { StockResponse } from './models/Stock';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { useSnackbar } from 'notistack';
import { getWarehouses } from '../warehouses/warehousesService';
import { getLocations } from '../locations/locationsService';
import { getItems } from '../items/itemsService';
import { getLots } from '../lots/lotsService';
import { WarehouseResponse } from '../warehouses/models/Warehouse';
import { LocationResponse } from '../locations/models/Location';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
}));

interface ItemResponse {
    id: number;
    description: string;
}

interface LotResponse {
    id: number;
    description: string;
    itemId: number;
}

function Stocks() {
    const { t } = useTranslation('stocks');
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [stocks, setStocks] = useState<StockResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filter states
    const [warehouseId, setWarehouseId] = useState<number | ''>('');
    const [locationId, setLocationId] = useState<number | ''>('');
    const [itemId, setItemId] = useState<number | ''>('');
    const [lotId, setLotId] = useState<number | ''>('');

    // Dropdown data
    const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [items, setItems] = useState<ItemResponse[]>([]);
    const [lots, setLots] = useState<LotResponse[]>([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchStocks();
    }, [page, rowsPerPage, warehouseId, locationId, itemId, lotId]);

    const fetchDropdownData = async () => {
        try {
            const [warehousesRes, locationsRes, itemsRes, lotsRes] = await Promise.all([
                getWarehouses(1, 1000),
                getLocations(1, 1000),
                getItems(1, 1000),
                getLots(1, 1000)
            ]);

            if (warehousesRes.succeeded && warehousesRes.data) {
                const warehouseItems = Array.isArray(warehousesRes.data) ? warehousesRes.data : [];
                setWarehouses(warehouseItems);
            }

            if (locationsRes.succeeded && locationsRes.data) {
                const locationItems = Array.isArray(locationsRes.data) ? locationsRes.data : [];
                setLocations(locationItems);
            }

            if (itemsRes.succeeded && itemsRes.data) {
                const itemItems = itemsRes.data.items || [];
                setItems(itemItems);
            }

            if (lotsRes.succeeded && lotsRes.data) {
                const lotItems = lotsRes.data.items || [];
                setLots(lotItems);
            }
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await getStocks(
                page + 1,
                rowsPerPage,
                warehouseId || undefined,
                locationId || undefined,
                itemId || undefined,
                lotId || undefined,
                searchTerm || undefined
            );

            if (response.succeeded && response.data) {
                setStocks(response.data.items || []);
                setTotalCount(response.data.totalCount || 0);
            } else {
                setStocks([]);
                setTotalCount(0);
                enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching stocks:', error);
            setStocks([]);
            setTotalCount(0);
            enqueueSnackbar(t('errors.load'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setPage(0);
            fetchStocks();
        }
    };

    const handleSearchClick = () => {
        setPage(0);
        fetchStocks();
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleWarehouseChange = (event: SelectChangeEvent<number | ''>) => {
        const value = event.target.value;
        setWarehouseId(value === '' ? '' : Number(value));
        setPage(0);
    };

    const handleLocationChange = (event: SelectChangeEvent<number | ''>) => {
        const value = event.target.value;
        setLocationId(value === '' ? '' : Number(value));
        setPage(0);
    };

    const handleItemChange = (event: SelectChangeEvent<number | ''>) => {
        const value = event.target.value;
        setItemId(value === '' ? '' : Number(value));
        setPage(0);
    };

    const handleLotChange = (event: SelectChangeEvent<number | ''>) => {
        const value = event.target.value;
        setLotId(value === '' ? '' : Number(value));
        setPage(0);
    };

    return (
        <Root
            scroll="content"
            header={
                <div className="p-6 flex items-center justify-between">
                    {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                    <h2 className="text-2xl font-bold">{t('title')}</h2>
                </div>
            }
            content={
                <div className="p-6">
                    <TableContainer component={Paper}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            p={2}
                        >
                            {/* Search Bar */}
                            <Box display="flex" gap={1} alignItems="center">
                                <TextField
                                    fullWidth
                                    placeholder={t('search')}
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    size="small"
                                />
                                <IconButton
                                    onClick={handleSearchClick}
                                    color='primary'
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'primary',
                                        borderRadius: 1,
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Box>

                            {/* Filters */}
                            <Box
                                display="flex"
                                flexDirection={{ xs: 'column', md: 'row' }}
                                gap={2}
                            >
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>{t('filters.warehouse')}</InputLabel>
                                    <Select
                                        value={warehouseId}
                                        onChange={handleWarehouseChange}
                                        label={t('filters.warehouse')}
                                    >
                                        <MenuItem value="">
                                            <em>{t('filters.all')}</em>
                                        </MenuItem>
                                        {warehouses.map((warehouse) => (
                                            <MenuItem key={warehouse.id} value={warehouse.id}>
                                                {warehouse.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>{t('filters.location')}</InputLabel>
                                    <Select
                                        value={locationId}
                                        onChange={handleLocationChange}
                                        label={t('filters.location')}
                                    >
                                        <MenuItem value="">
                                            <em>{t('filters.all')}</em>
                                        </MenuItem>
                                        {locations.map((location) => (
                                            <MenuItem key={location.id} value={location.id}>
                                                {location.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>{t('filters.item')}</InputLabel>
                                    <Select
                                        value={itemId}
                                        onChange={handleItemChange}
                                        label={t('filters.item')}
                                    >
                                        <MenuItem value="">
                                            <em>{t('filters.all')}</em>
                                        </MenuItem>
                                        {items.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>{t('filters.lot')}</InputLabel>
                                    <Select
                                        value={lotId}
                                        onChange={handleLotChange}
                                        label={t('filters.lot')}
                                    >
                                        <MenuItem value="">
                                            <em>{t('filters.all')}</em>
                                        </MenuItem>
                                        {lots.map((lot) => (
                                            <MenuItem key={lot.id} value={lot.id}>
                                                {lot.description}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('table.item')}</TableCell>
                                    <TableCell>{t('table.warehouse')}</TableCell>
                                    <TableCell>{t('table.location')}</TableCell>
                                    <TableCell>{t('table.lot')}</TableCell>
                                    <TableCell align="right">{t('table.quantity')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : stocks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                {t('noData')}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stocks.map((stock) => (
                                        <TableRow key={stock.id} hover>
                                            <TableCell>{stock.itemDescription || '-'}</TableCell>
                                            <TableCell>{stock.warehouseDescription || '-'}</TableCell>
                                            <TableCell>{stock.locationDescription || '-'}</TableCell>
                                            <TableCell>{stock.lotDescription || '-'}</TableCell>
                                            <TableCell align="right">
                                                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                                                    {stock.quantity < 0 && (
                                                        <WarningAmberIcon sx={{ color: '#c62828', fontSize: '1.2rem' }} />
                                                    )}
                                                    {stock.quantity === 0 && (
                                                        <WarningAmberIcon sx={{ color: '#e65100', fontSize: '1.2rem' }} />
                                                    )}
                                                    {stock.quantity}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage={t('rowsPerPage')}
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} ${t('of')} ${count !== -1 ? count : `${t('moreThan')} ${to}`}`
                            }
                        />
                    </TableContainer>
                </div>
            }
        />
    );
}

export default Stocks;
