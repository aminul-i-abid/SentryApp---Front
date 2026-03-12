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
    Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getStocksByWarehouse, getWarehousesAutocomplete } from '../stockService';
import { StockByWarehouse } from '../models/StockAggregated';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { useSnackbar } from 'notistack';
import StockByWarehouseDetailSidebar from './components/StockByWarehouseDetailSidebar';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
}));

function StocksByWarehouse() {
    const { t } = useTranslation('stocks');
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [stocks, setStocks] = useState<StockByWarehouse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Autocomplete for warehouse filter
    const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: number; description: string } | null>(null);
    const [warehouseOptions, setWarehouseOptions] = useState<{ id: number; description: string }[]>([]);
    const [warehouseInputValue, setWarehouseInputValue] = useState('');
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);

    useEffect(() => {
        fetchStocks();
    }, [page, rowsPerPage, selectedWarehouse]);

    useEffect(() => {
        if (warehouseInputValue) {
            fetchWarehouseOptions(warehouseInputValue);
        } else {
            fetchWarehouseOptions();
        }
    }, [warehouseInputValue]);

    const fetchWarehouseOptions = async (search?: string) => {
        setWarehouseLoading(true);
        try {
            const response = await getWarehousesAutocomplete(search);
            if (response.succeeded && response.data) {
                setWarehouseOptions(response.data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setWarehouseLoading(false);
        }
    };

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await getStocksByWarehouse(
                page + 1,
                rowsPerPage,
                selectedWarehouse?.id,
                searchTerm || undefined
            );

            if (response.succeeded && response.data) {
                setStocks(response.data.items);
                setTotalCount(response.data.totalCount);
            } else {
                enqueueSnackbar(response.message || t('errorLoadingStocks'), { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(t('errorLoadingStocks'), { variant: 'error' });
            console.error('Error fetching stocks by warehouse:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchClick = () => {
        setPage(0);
        fetchStocks();
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRowClick = (warehouseId: number) => {
        setSelectedWarehouseId(warehouseId);
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        setSelectedWarehouseId(null);
    };

    return (
        <>
            <Root
                scroll="content"
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">{t('byWarehouse.title')}</h2>
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
                                    {/* Warehouse Filter */}
                                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                                    <Autocomplete
                                        sx={{ minWidth: 300 }}
                                        options={warehouseOptions}
                                        getOptionLabel={(option) => option.description}
                                        value={selectedWarehouse}
                                        onChange={(event, newValue) => {
                                            setSelectedWarehouse(newValue);
                                            setPage(0);
                                        }}
                                        inputValue={warehouseInputValue}
                                        onInputChange={(event, newInputValue) => {
                                            setWarehouseInputValue(newInputValue);
                                        }}
                                        loading={warehouseLoading}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('byWarehouse.filterByWarehouse')}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Box>

                                
                            </Box>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('byWarehouse.warehouse')}</TableCell>
                                        <TableCell align="right">{t('byWarehouse.totalQuantity')}</TableCell>
                                        <TableCell align="center">{t('byWarehouse.actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : stocks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                <Typography>{t('byWarehouse.noData')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stocks.map((stock) => (
                                            <TableRow
                                                key={stock.warehouseId}
                                                hover
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => handleRowClick(stock.warehouseId)}
                                            >
                                                <TableCell>{stock.warehouseDescription}</TableCell>
                                                <TableCell align="right">
                                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                                        {stock.totalQuantity}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRowClick(stock.warehouseId);
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </TableCell>
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
                                rowsPerPageOptions={[5, 10, 25, 50]}
                            />
                        </TableContainer>
                    </div>
                }
            />
            <StockByWarehouseDetailSidebar
                open={sidebarOpen}
                onClose={handleCloseSidebar}
                warehouseId={selectedWarehouseId}
            />
        </>
    );
}

export default StocksByWarehouse;
