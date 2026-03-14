import { useEffect, useState } from 'react';
import {
    Drawer,
    Box,
    IconButton,
    Typography,
    CircularProgress,
    Divider
} from '@mui/material';
import StyledTable from '@/components/ui/StyledTable';
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
                        <StyledTable<StockResponse>
                            columns={[
                                {
                                    id: 'warehouse',
                                    label: t('byArticle.warehouse'),
                                    render: (row) => row.warehouseDescription
                                },
                                {
                                    id: 'location',
                                    label: t('byArticle.location'),
                                    render: (row) => row.locationDescription
                                },
                                {
                                    id: 'lot',
                                    label: t('byArticle.lot'),
                                    render: (row) => row.lotDescription
                                },
                                {
                                    id: 'quantity',
                                    label: t('byArticle.quantity'),
                                    render: (row) => (
                                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                            {row.quantity <= 0 && (
                                                <WarningAmberIcon color="warning" fontSize="small" />
                                            )}
                                            <Typography sx={{ fontWeight: 500, color: '#334155' }}>
                                                {row.quantity}
                                            </Typography>
                                        </Box>
                                    )
                                }
                            ]}
                            data={stocks}
                            getRowId={(row) => String(row.id)}
                            loading={loading}
                            loadingMessage="Cargando detalles..."
                            emptyMessage={t('byArticle.noDetails')}
                            pagination={{
                                count: totalCount,
                                page: page,
                                rowsPerPage: rowsPerPage,
                                onPageChange: handleChangePage
                            }}
                            minWidth={600}
                        />
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}

export default StockByArticleDetailSidebar;
