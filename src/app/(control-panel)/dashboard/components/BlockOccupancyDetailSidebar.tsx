import React, { useEffect, useState } from 'react';
import { Drawer, Typography, Box, IconButton, Grid, Paper, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery20Icon from '@mui/icons-material/Battery20';
import { getBlockOccupancyDetail } from '../dashboardService';
import { BlockOccupancyDetail, BlockRoomDetail } from '../models/DashboardResponse';

interface BlockOccupancyDetailSidebarProps {
    selectedBlockId: number | null;
    open: boolean;
    onClose: () => void;
}

const BlockOccupancyDetailSidebar: React.FC<BlockOccupancyDetailSidebarProps> = ({ selectedBlockId, open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BlockOccupancyDetail | null>(null);

    const fetchBlockOccupancyDetail = async () => {
        if (!selectedBlockId) return;

        setLoading(true);
        try {
            const response = await getBlockOccupancyDetail(selectedBlockId);
            if (response.succeeded) {
                setData(response.data);
            } else {
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching block occupancy detail:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && selectedBlockId) {
            fetchBlockOccupancyDetail();
        }
    }, [open, selectedBlockId]);

    const getOccupancyColor = (percentage: number) => {
        if (percentage < 40) return '#EF4444'; // Rojo para menos del 40%
        if (percentage <= 85) return '#F59E0B'; // Amarillo para 41-85%
        return '#10B981'; // Verde para más del 86%
    };

    const getOccupancyStatus = (room: BlockRoomDetail) => {
        if (room.isOccupied) return { label: 'Ocupada', color: '#EF4444' as const };
        return { label: 'Disponible', color: '#10B981' as const };
    };

    const getBatteryColor = (batteryLevel: number | undefined | null) => {
        if (batteryLevel === undefined || batteryLevel === null) return '#94A3B8'; // Gris para desconocido
        if (batteryLevel < 35) return '#EF4444'; // Rojo para bajo
        if (batteryLevel <= 65) return '#F59E0B'; // Amarillo para medio
        return '#10B981'; // Verde para bueno
    };

    const getBatteryIcon = (batteryLevel: number | undefined | null) => {
        if (batteryLevel === undefined || batteryLevel === null) return Battery60Icon;
        if (batteryLevel < 35) return Battery20Icon;
        if (batteryLevel <= 65) return Battery60Icon;
        return BatteryFullIcon;
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '70vw', md: '40vw' }, maxWidth: '1000px', boxShadow: '-4px 0 8px rgba(0,0,0,0.1)', bgcolor: '#f5f5f5' } }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)', color: 'black', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            Detalle de Ocupación - {data?.blockName || 'Pabellón'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }}}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Typography>Cargando...</Typography>
                        </Box>
                    ) : data ? (
                        <Box>
                            {/* Resumen del pabellón */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 2,
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1E293B' }}>
                                    Resumen del Pabellón
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                                                {data.totalBeds}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                                Total de Camas
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                                                {data.occupiedBedsToday}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                                Camas Ocupadas
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{
                                                fontWeight: 700,
                                                color: getOccupancyColor(data.occupancyPercentageToday)
                                            }}>
                                                {data.occupancyPercentageToday.toFixed(2)}%
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                                Porcentaje de Ocupación
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Detalle de habitaciones */}
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1E293B' }}>
                                Habitaciones del Pabellón
                            </Typography>
                            <Grid container spacing={2}>
                                {data.roomDetails.map((room) => {
                                    const BatteryIcon = getBatteryIcon(room.doorLockBatteryLevel);
                                    const batteryColor = getBatteryColor(room.doorLockBatteryLevel);
                                    
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    backgroundColor: '#FFFFFF',
                                                    border: '1px solid #E2E8F0',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                        transform: 'translateY(-1px)',
                                                        transition: 'all 0.2s ease-in-out'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                                        {room.roomNumber}
                                                    </Typography>
                                                    <Chip
                                                        label={getOccupancyStatus(room).label}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${getOccupancyStatus(room).color}20`,
                                                            color: getOccupancyStatus(room).color,
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="h5" sx={{
                                                        fontWeight: 700,
                                                        color: getOccupancyColor(room.occupancyPercentageToday),
                                                        mb: 1
                                                    }}>
                                                        {room.occupancyPercentageToday.toFixed(1)}%
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748B', mb: 1.5 }}>
                                                        {room.occupiedBedsToday}/{room.totalBeds} camas
                                                    </Typography>
                                                    {room.doorLockBatteryLevel !== undefined && room.doorLockBatteryLevel !== null && (
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            gap: 0.5,
                                                            mt: 1
                                                        }}>
                                                            <BatteryIcon 
                                                                sx={{ 
                                                                    fontSize: 18, 
                                                                    color: batteryColor 
                                                                }} 
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: batteryColor,
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {room.doorLockBatteryLevel}%
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Typography color="text.secondary">No hay información disponible</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default BlockOccupancyDetailSidebar;