import { useEffect, useState } from 'react';
import {
    Drawer,
    Box,
    IconButton,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TablePagination,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useTranslation } from 'react-i18next';
import { getStockDetailsByArticle } from '../../stockService';
import { StockResponse } from '../../models/Stock';
import { useSnackbar } from 'notistack';

interface StockByArticleDetailSidebarProps {
    open: boolean;
    onClose: () => void;
    itemId: number | null;
}

function StockByArticleDetailSidebar({ open, onClose, itemId }: StockByArticleDetailSidebarProps) {
    const { t } = useTranslation('stocks');
    const { enqueueSnackbar } = useSnackbar();

    const [stocks, setStocks] = useState<StockResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [articleName, setArticleName] = useState('');

    useEffect(() => {
        if (open && itemId) {
            fetchStockDetails();
        }
    }, [open, itemId, page, rowsPerPage]);

    const fetchStockDetails = async () => {
        if (!itemId) return;

        setLoading(true);
        try {
            const response = await getStockDetailsByArticle(
                itemId,
                page + 1,
                rowsPerPage
            );

            if (response.succeeded && response.data) {
                setStocks(response.data.items);
                setTotalCount(response.data.totalCount);
                
                // Get article name from first item
                if (response.data.items.length > 0) {
                    setArticleName(response.data.items[0].itemDescription || '');
                }
            } else {
                enqueueSnackbar(response.message || t('errorLoadingDetails'), { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(t('errorLoadingDetails'), { variant: 'error' });
            console.error('Error fetching stock details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClose = () => {
        setPage(0);
        setStocks([]);
        setArticleName('');
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: '70vw', md: '70vw' },
                    maxWidth: '1000px',
                    boxShadow: '-4px 0 8px rgba(0,0,0,0.1)',
                    bgcolor: '#f5f5f5',
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(244, 244, 244) 100%)',
                    color: 'black',
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CategoryIcon sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {t('byArticle.detailsTitle')}
                            </Typography>
                            {articleName && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    {articleName}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleClose}
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

                {/* Content */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Card sx={{ 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ 
                                p: 2.5, 
                                bgcolor: 'background.paper',
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <InventoryIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {t('byArticle.stockBreakdown')}
                                    </Typography>
                                </Box>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {t('byArticle.warehouse')}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {t('byArticle.location')}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {t('byArticle.lot')}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {t('byArticle.quantity')}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stocks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                    <Typography color="text.secondary">
                                                        {t('byArticle.noDetails')}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            stocks.map((stock, index) => (
                                                <TableRow 
                                                    key={stock.id}
                                                    hover
                                                    sx={{ 
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                        bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50'
                                                    }}
                                                >
                                                    <TableCell>{stock.warehouseDescription}</TableCell>
                                                    <TableCell>{stock.locationDescription}</TableCell>
                                                    <TableCell>{stock.lotDescription}</TableCell>
                                                    <TableCell align="right">
                                                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                                            {stock.quantity <= 0 && (
                                                                <WarningAmberIcon color="warning" fontSize="small" />
                                                            )}
                                                            <Typography sx={{ fontWeight: 500 }}>
                                                                {stock.quantity}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Divider />
                            <Box sx={{ bgcolor: 'background.paper' }}>
                                <TablePagination
                                    component="div"
                                    count={totalCount}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                            </Box>
                        </Card>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}

export default StockByArticleDetailSidebar;
