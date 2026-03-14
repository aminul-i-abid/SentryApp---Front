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
    SelectChangeEvent,
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getStocks } from './stockService';
import { StockResponse } from './models/Stock';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { useSnackbar } from 'notistack';
import StyledTable from '@/components/ui/StyledTable';
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
                            <Box sx={{ maxWidth: 400, mb: 3 }}>
                                <Box display="flex" gap={1} alignItems="center">
                                    <Box
                                        component="input"
                                        type="text"
                                        placeholder={t('search')}
                                        value={searchTerm}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        sx={{
                                            width: '100%',
                                            height: 40,
                                            px: 2,
                                            borderRadius: 2,
                                            border: '1px solid #E2E8F0',
                                            bgcolor: 'white',
                                            fontSize: '0.9375rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            '&:focus': {
                                                borderColor: '#415EDE',
                                                boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
                                            }
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleSearchClick}
                                        sx={{
                                            bgcolor: 'white',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 2,
                                            height: 40,
                                            width: 40,
                                            '&:hover': {
                                                borderColor: '#415EDE',
                                                bgcolor: 'rgba(65, 94, 222, 0.04)'
                                            }
                                        }}
                                    >
                                        <SearchIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                            {t('filters.warehouse')}
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={warehouseId}
                                                displayEmpty
                                                onChange={handleWarehouseChange}
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
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                            {t('filters.location')}
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={locationId}
                                                displayEmpty
                                                onChange={handleLocationChange}
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
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                            {t('filters.item')}
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={itemId}
                                                displayEmpty
                                                onChange={handleItemChange}
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
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', ml: 1, mb: 0.5, display: 'block' }}>
                                            {t('filters.lot')}
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={lotId}
                                                displayEmpty
                                                onChange={handleLotChange}
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
                                </Grid>
                            </Grid>
                        </Box>

                        <StyledTable<StockResponse>
                            columns={[
                                {
                                    id: 'itemDescription',
                                    label: t('table.item'),
                                    render: (row) => (
                                        <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                            {row.itemDescription || '-'}
                                        </Typography>
                                    )
                                },
                                {
                                    id: 'warehouseDescription',
                                    label: t('table.warehouse'),
                                    render: (row) => row.warehouseDescription || '-'
                                },
                                {
                                    id: 'locationDescription',
                                    label: t('table.location'),
                                    render: (row) => row.locationDescription || '-'
                                },
                                {
                                    id: 'lotDescription',
                                    label: t('table.lot'),
                                    render: (row) => row.lotDescription || '-'
                                },
                                {
                                    id: 'quantity',
                                    label: t('table.quantity'),
                                    align: 'center',
                                    render: (row) => (
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                            {row.quantity < 0 && (
                                                <WarningAmberIcon sx={{ color: '#EF4444', fontSize: '1.1rem' }} />
                                            )}
                                            {row.quantity === 0 && (
                                                <WarningAmberIcon sx={{ color: '#F59E0B', fontSize: '1.1rem' }} />
                                            )}
                                            <Typography fontWeight={600} color={row.quantity < 0 ? '#EF4444' : 'inherit'}>
                                                {row.quantity}
                                            </Typography>
                                        </Box>
                                    )
                                }
                            ]}
                            data={stocks}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage="Cargando existencias..."
                            emptyMessage={t('noData')}
                            pagination={{
                                count: totalCount,
                                page: page,
                                rowsPerPage: rowsPerPage,
                                onPageChange: handleChangePage
                            }}
                            minWidth={1000}
                        />
                    </div>
            }
        />
    );
}

export default Stocks;
