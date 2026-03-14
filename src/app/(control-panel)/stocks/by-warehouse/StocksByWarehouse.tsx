import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextField,
    IconButton,
    Box,
    Typography,
    Autocomplete
} from '@mui/material';
import StyledTable from '@/components/ui/StyledTable';
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
                                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
                                    <Autocomplete
                                        sx={{ 
                                            minWidth: 300,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: 'white',
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                    borderWidth: '2px',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#415EDE',
                                                }
                                            }
                                        }}
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

                                    <Box display="flex" gap={1} alignItems="center" sx={{ flex: 1, maxWidth: 400 }}>
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
                                            color="primary"
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
                            </Box>

                            <StyledTable<StockByWarehouse>
                                columns={[
                                    {
                                        id: 'warehouse',
                                        label: t('byWarehouse.warehouse'),
                                        render: (row) => (
                                            <Typography fontWeight={600} sx={{ color: '#334155' }}>
                                                {row.warehouseDescription}
                                            </Typography>
                                        )
                                    },
                                    {
                                        id: 'totalQuantity',
                                        label: t('byWarehouse.totalQuantity'),
                                        align: 'center',
                                        render: (row) => (
                                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                <Typography sx={{ color: '#334155' }}>
                                                    {row.totalQuantity}
                                                </Typography>
                                            </Box>
                                        )
                                    }
                                ]}
                                data={stocks}
                                getRowId={(row) => String(row.warehouseId)}
                                loading={loading}
                                loadingMessage="Cargando stock..."
                                emptyMessage={t('byWarehouse.noData')}
                                onRowClick={(row) => handleRowClick(row.warehouseId)}
                                renderActions={(row) => (
                                    <IconButton
                                        size="small"
                                        sx={{ color: '#415EDE' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(row.warehouseId);
                                        }}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                )}
                                pagination={{
                                    count: totalCount,
                                    page: page,
                                    rowsPerPage: rowsPerPage,
                                    onPageChange: handleChangePage
                                }}
                                minWidth={800}
                            />
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
