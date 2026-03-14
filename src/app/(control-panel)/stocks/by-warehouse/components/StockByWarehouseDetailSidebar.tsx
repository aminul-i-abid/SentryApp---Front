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
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useTranslation } from 'react-i18next';
import { getStockDetailsByWarehouse } from '../../stockService';
import { StockResponse } from '../../models/Stock';
import { useSnackbar } from 'notistack';

interface StockByWarehouseDetailSidebarProps {
    open: boolean;
    onClose: () => void;
    warehouseId: number | null;
}

function StockByWarehouseDetailSidebar({ open, onClose, warehouseId }: StockByWarehouseDetailSidebarProps) {
    const { t } = useTranslation('stocks');
    const { enqueueSnackbar } = useSnackbar();

    const [stocks, setStocks] = useState<StockResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [warehouseName, setWarehouseName] = useState('');

    useEffect(() => {
        if (open && warehouseId) {
            fetchStockDetails();
        }
    }, [open, warehouseId, page, rowsPerPage]);

    const fetchStockDetails = async () => {
        if (!warehouseId) return;

        setLoading(true);
        try {
            const response = await getStockDetailsByWarehouse(
                warehouseId,
                page + 1,
                rowsPerPage
            );

            if (response.succeeded && response.data) {
                setStocks(response.data.items);
                setTotalCount(response.data.totalCount);
                
                // Get warehouse name from first item
                if (response.data.items.length > 0) {
                    setWarehouseName(response.data.items[0].warehouseDescription || '');
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
        setWarehouseName('');
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
                        <WarehouseIcon sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {t('byWarehouse.detailsTitle')}
                            </Typography>
                            {warehouseName && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    {warehouseName}
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
                                    id: 'article',
                                    label: t('byWarehouse.article'),
                                    render: (row) => row.itemDescription
                                },
                                {
                                    id: 'location',
                                    label: t('byWarehouse.location'),
                                    render: (row) => row.locationDescription
                                },
                                {
                                    id: 'lot',
                                    label: t('byWarehouse.lot'),
                                    render: (row) => row.lotDescription
                                },
                                {
                                    id: 'quantity',
                                    label: t('byWarehouse.quantity'),
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
                            emptyMessage={t('byWarehouse.noDetails')}
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

export default StockByWarehouseDetailSidebar;
