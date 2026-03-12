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
import { getStocksByArticle, getItemsAutocomplete } from '../stockService';
import { StockByArticle } from '../models/StockAggregated';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { useSnackbar } from 'notistack';
import StockByArticleDetailSidebar from './components/StockByArticleDetailSidebar';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
}));

function StocksByArticle() {
    const { t } = useTranslation('stocks');
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [stocks, setStocks] = useState<StockByArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Autocomplete for item filter
    const [selectedItem, setSelectedItem] = useState<{ id: number; description: string } | null>(null);
    const [itemOptions, setItemOptions] = useState<{ id: number; description: string }[]>([]);
    const [itemInputValue, setItemInputValue] = useState('');
    const [itemLoading, setItemLoading] = useState(false);

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    useEffect(() => {
        fetchStocks();
    }, [page, rowsPerPage, selectedItem]);

    useEffect(() => {
        if (itemInputValue) {
            fetchItemOptions(itemInputValue);
        } else {
            fetchItemOptions();
        }
    }, [itemInputValue]);

    const fetchItemOptions = async (search?: string) => {
        setItemLoading(true);
        try {
            const response = await getItemsAutocomplete(search);
            if (response.succeeded && response.data) {
                setItemOptions(response.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setItemLoading(false);
        }
    };

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await getStocksByArticle(
                page + 1,
                rowsPerPage,
                selectedItem?.id,
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
            console.error('Error fetching stocks by article:', error);
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

    const handleRowClick = (itemId: number) => {
        setSelectedItemId(itemId);
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        setSelectedItemId(null);
    };

    return (
        <>
            <Root
                scroll="content"
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">{t('byArticle.title')}</h2>
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
                                    {/* Item Filter */}
                                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                                    <Autocomplete
                                        sx={{ minWidth: 300 }}
                                        options={itemOptions}
                                        getOptionLabel={(option) => option.description}
                                        value={selectedItem}
                                        onChange={(event, newValue) => {
                                            setSelectedItem(newValue);
                                            setPage(0);
                                        }}
                                        inputValue={itemInputValue}
                                        onInputChange={(event, newInputValue) => {
                                            setItemInputValue(newInputValue);
                                        }}
                                        loading={itemLoading}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={t('byArticle.filterByArticle')}
                                                size="small"
                                            />
                                        )}
                                    />
                                </Box>

                                
                            </Box>

                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('byArticle.article')}</TableCell>
                                        <TableCell align="right">{t('byArticle.totalQuantity')}</TableCell>
                                        <TableCell align="center">{t('byArticle.actions')}</TableCell>
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
                                                <Typography>{t('byArticle.noData')}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stocks.map((stock) => (
                                            <TableRow
                                                key={stock.itemId}
                                                hover
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => handleRowClick(stock.itemId)}
                                            >
                                                <TableCell>{stock.itemDescription}</TableCell>
                                                <TableCell align="right">
                                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                                        {stock.totalQuantity <= 0 && (
                                                            <WarningAmberIcon color="warning" fontSize="small" />
                                                        )}
                                                        {stock.totalQuantity}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRowClick(stock.itemId);
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
            <StockByArticleDetailSidebar
                open={sidebarOpen}
                onClose={handleCloseSidebar}
                itemId={selectedItemId}
            />
        </>
    );
}

export default StocksByArticle;
