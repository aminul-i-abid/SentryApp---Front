import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { 
    TextField, 
    InputAdornment, 
    Grid, 
    Paper, 
    Typography, 
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Stack,
    Chip,
    Skeleton,
    Tooltip,
    ButtonGroup,
    LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CampingIcon from '@mui/icons-material/Cabin';
import BusinessIcon from '@mui/icons-material/Business';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Filler,
    Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import React from 'react';
import { getDashboard } from './dashboardService';
import { DashboardResponse } from './models/DashboardResponse';  
import useUser from '@auth/useUser';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import { getContractors } from '../contractors/contractorsService';
import tagRoleMap from '../tag/enum/RoleTag';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    Filler,
    Legend
);

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    },
    '& .FusePageSimple-content': {},
    '& .FusePageSimple-sidebarHeader': {},
    '& .FusePageSimple-sidebarContent': {}
}));

// Componente mejorado para KPIs principales agrupados
const KPIGroupCard = ({ kpis }) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, 
            borderRadius: 3, 
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0'
        }}
    >
        {/* <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1E293B' }}>
            Resumen General
        </Typography> */}
        <Grid container spacing={3}>
            {kpis.map((kpi, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ 
                            color: kpi.color, 
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            {React.cloneElement(kpi.icon, { fontSize: 'medium' })}
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                            {kpi.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.875rem' }}>
                            {kpi.title}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    </Paper>
);

// Componente para métricas operativas con mejor distribución vertical
const OperationalMetricCard = ({ icon, title, value, subtitle, color }) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, 
            borderRadius: 2, 
            height: '100%',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '&:hover': {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
            }
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
                color, 
                backgroundColor: `${color}15`,
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center'
            }}>
                {React.cloneElement(icon, { fontSize: 'medium' })}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {value}
                </Typography>
            </Box>
        </Box>
        {subtitle && (
            <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', mt: 1 }}>
                {subtitle}
            </Typography>
        )}
    </Paper>
);

// Componente para la ocupación principal con dos filas
const OccupancyMainCard = ({ occupancyData, standardData }) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, 
            borderRadius: 2,
            height: '100%',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF'
        }}
    >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1E293B' }}>
            Ocupación de Camas
        </Typography>
        
        {/* Primera fila: Ocupación total con barra de progreso */}
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {occupancyData.display}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B' }}>
                    {occupancyData.occupied} / {occupancyData.total} camas
                </Typography>
            </Box>
            
            {/* Barra de progreso personalizada */}
            <Box sx={{ position: 'relative' }}>
                <LinearProgress
                    variant="determinate"
                    value={occupancyData.percentage}
                    sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            backgroundColor: occupancyData.percentage >= 80 ? '#EF4444' : 
                                           occupancyData.percentage >= 60 ? '#F59E0B' : '#10B981'
                        }
                    }}
                />
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: `${Math.min(occupancyData.percentage, 95)}%`,
                    transform: 'translateY(-50%)',
                    ml: 1
                }}>
                    <Typography variant="caption" sx={{ 
                        color: '#1E293B',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                    }}>
                        {occupancyData.display}
                    </Typography>
                </Box>
            </Box>
        </Box>

        {/* Segunda fila: Cards de estándares horizontales */}
        <Box>
            {/* <Typography variant="subtitle2" sx={{ mb: 2, color: '#64748B', fontWeight: 600 }}>
                Ocupación por Estándar
            </Typography> */}
            <Grid container spacing={2}>
                {standardData.slice(0, 3).map((item, index) => (
                    <Grid item xs={4} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                textAlign: 'center',
                                '&:hover': {
                                    backgroundColor: '#F1F5F9',
                                    borderColor: item.color,
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            <Typography variant="caption" sx={{ 
                                color: item.color, 
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem'
                            }}>
                                {item.label}
                            </Typography>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 700, 
                                color: '#1E293B',
                                my: 1
                            }}>
                                {item.percentage}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                {item.occupied}/{item.available}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    </Paper>
);

const StatCard = ({ icon, title, value, color }) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, 
            borderRadius: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%'
        }}
    >
        <Box>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
        </Box>
        <Box sx={{ color }}>
            {icon}
        </Box>
    </Paper>
);

const SmallStatCard = ({ icon, title, value, color }) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 2, 
            borderRadius: 2, 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%'
        }}
    >
        <Box sx={{ color, mb: 1 }}>
            {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
            {title}
        </Typography>
        <Typography variant="h6" fontWeight="bold">
            {value}
        </Typography>
    </Paper>
);

function DashboardLegacy() {
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: user } = useUser();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [contractors, setContractors] = useState([]);
    const [selectedContractor, setSelectedContractor] = useState('');
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('7');

    // Verificar si el usuario es admin
    const isAdmin = user?.role === 'Sentry_Admin' || (Array.isArray(user?.role) && user?.role.includes('Sentry_Admin'));

    useEffect(() => {
        const fetchDashboardData = async (companyId = null) => {
            try {
                setLoading(true);
                const response = await getDashboard(companyId);
                if (response.succeeded) {
                    setDashboardData(response.data);
                } else {
                    setError(response.message[0] || 'Error al obtener datos del dashboard');
                }
            } catch (err) {
                setError('Error al conectar con el servidor');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Fetch dashboard data with selected contractor
        const contractorId = selectedContractor || null;
        fetchDashboardData(contractorId);
    }, [selectedContractor]);

    useEffect(() => {
        fetchContractors();
    }, []);

    const fetchContractors = async () => {
        try {
            const response = await getContractors();
            if (response.succeeded) {
                setContractors(response.data);
            }
        } catch (error) {
            console.error('Error fetching contractors:', error);
        }
    };

    const handleContractorChange = (event) => {
        setSelectedContractor(event.target.value);
    };

    // Componente de skeleton para loading
    const DashboardSkeleton = () => (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* KPIs skeleton */}
                <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
                
                {/* Métricas operativas skeleton */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                    </Grid>
                </Grid>
                
                {/* Chart skeleton */}
                <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                </Grid>
            </Grid>
        </Box>
    );


    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#333',
                titleColor: '#fff',
                bodyColor: '#fff',
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `${context.parsed.y} Desbloqueados`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    display: true,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    display: true,
                },
                min: 0,
                max: 60,
                stepSize: 10,
            },
        },
    };

    if (loading) {
        return (
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                            <h2 className="text-2xl font-bold">Panel de Control (Legacy)</h2>
                        </div>
                        <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: 1 }} />
                    </div>
                }
                content={<DashboardSkeleton />}
            />
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    
    // KPIs principales refactorizados
    const mainKPIs = [
        {
            icon: <CampingIcon />,
            title: "Campamentos",
            value: dashboardData?.totalCamps.toString() || "0",
            color: "#2563EB"
        },
        isAdmin && {
            icon: <BusinessIcon />,
            title: "Contratistas",
            value: dashboardData?.totalCompanies.toString() || "0",
            color: "#10B981"
        },
        {
            icon: <MeetingRoomIcon />,
            title: "Habitaciones",
            value: dashboardData?.totalRooms.toString() || "0",
            color: "#F59E0B"
        },
        {
            icon: <EventIcon />,
            title: "Reservas",
            value: dashboardData?.totalReservations.toString() || "0",
            color: "#EF4444"
        }
    ].filter(Boolean);

    // Cálculos para ocupación principal
    const occupancyMainData = (() => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const totalBedsRaw = dashboardData?.blocksOccupancy?.reduce((total, block) => 
            total + (block.totalBeds || 0), 0) || 0;
        
        const disabledBeds = dashboardData?.totalDisabledRoomsBeds?.reduce((sum, tagObj) => 
            sum + (tagObj.count || 0), 0) || 0;
            
        const lostBeds = dashboardData?.lostTags?.reduce((sum, tagObj) => sum + tagObj.count, 0) || 0;
        const totalBeds = totalBedsRaw - disabledBeds - lostBeds;

        const occupiedBeds = dashboardData?.blocksOccupancy?.reduce((total, block) => {
            const occupancyData = block.dailyOccupancy?.find(
                day => new Date(day.date).toISOString().split('T')[0] === dateStr
            );
            return total + (occupancyData?.occupiedBeds || 0);
        }, 0) || 0;

        const percentage = totalBeds > 0 
            ? Math.ceil((occupiedBeds * 1000) / totalBeds) / 10 
            : 0;
            
        return {
            percentage,
            occupied: occupiedBeds,
            total: totalBeds,
            display: `${percentage}%`
        };
    })();

    // Métricas operativas refactorizadas
    const operationalMetrics = [
        {
            icon: <MeetingRoomIcon />,
            title: "Habitaciones Deshabilitadas",
            value: (() => {
                const totalDisabledRooms = dashboardData?.totalDisabledRooms?.reduce((sum, tagObj) => 
                    sum + (tagObj.count || 0), 0) || 0;
                const totalDisabledRoomsBeds = dashboardData?.totalDisabledRoomsBeds?.reduce((sum, tagObj) => 
                    sum + (tagObj.count || 0), 0) || 0;
                return totalDisabledRooms.toString();
            })(),
            subtitle: (() => {
                const totalDisabledRoomsBeds = dashboardData?.totalDisabledRoomsBeds?.reduce((sum, tagObj) => 
                    sum + (tagObj.count || 0), 0) || 0;
                return `${totalDisabledRoomsBeds} camas`;
            })(),
            color: "#64748B"
        },
        isAdmin && {
            icon: <LockIcon />,
            title: "Camas Perdidas por Estándar",
            value: (dashboardData?.lostTags?.reduce((sum, tagObj) => sum + tagObj.count, 0) || 0).toString(),
            subtitle: "Por cambio de categoría",
            color: "#F59E0B"
        }
    ].filter(Boolean);

    // Agregación de datos por estándar para charts y lista
    const tagOccupancyData = (() => {
        const tagSummary = {};
        
        dashboardData?.blocksOccupancy?.forEach(block => {
            if (block.tags) {
                Object.keys(block.tags).forEach(tagKey => {
                    const tag = parseInt(tagKey);
                    if (!tagSummary[tag]) {
                        tagSummary[tag] = {
                            totalBeds: 0,
                            totalBedsOccupied: 0,
                            totalRooms: 0
                        };
                    }
                    tagSummary[tag].totalBeds += block.tags[tagKey].totalBeds || 0;
                    tagSummary[tag].totalBedsOccupied += block.tags[tagKey].totalBedsOccupied || 0;
                    tagSummary[tag].totalRooms += block.tags[tagKey].totalRooms || 0;
                });
            }
        });

        return tagSummary;
    })();

    // Datos formateados para el chart y lista de ocupación por estándar
    const standardOccupancyData = Object.keys(tagOccupancyData).map(tagKey => {
        const tag = parseInt(tagKey);
        const tagData = tagOccupancyData[tag];
        const lostBedsForTag = dashboardData?.lostTags?.find(lostTag => lostTag.tag === tag)?.count || 0;
        const disabledBedsForTag = dashboardData?.totalDisabledRoomsBeds?.find(disabledTag => disabledTag.tag === tag)?.count || 0;
        
        const availableBeds = tagData.totalBeds - lostBedsForTag - disabledBedsForTag;
        const occupancyPercentage = availableBeds > 0 
            ? Math.ceil((tagData.totalBedsOccupied * 1000) / availableBeds) / 10 
            : 0;

        return {
            label: tagRoleMap[tag] || `Tag ${tag}`,
            percentage: occupancyPercentage,
            occupied: tagData.totalBedsOccupied,
            available: availableBeds,
            color: tag === 0 ? "#10B981" : tag === 1 ? "#F59E0B" : "#8B5CF6"
        };
    }).sort((a, b) => b.percentage - a.percentage); // Ordenar por porcentaje descendente

    return (
        <Root
            scroll="content"
            header={
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold text-slate-800">Panel de Control (Legacy)</h2>
                    </div>
                    {isAdmin && contractors.length > 0 && (
                        <FormControl variant="outlined" sx={{ minWidth: 300 }}>
                            <InputLabel id="contractor-select-label">Contratista</InputLabel>
                            <Select
                                labelId="contractor-select-label"
                                id="contractor-select"
                                value={selectedContractor}
                                onChange={handleContractorChange}
                                label="Contratista"
                                size="medium"
                            >
                                <MenuItem value="">
                                    <em>Todos los contratistas</em>
                                </MenuItem>
                                {contractors.map((contractor) => (
                                    <MenuItem key={contractor.id} value={contractor.id}>
                                        {contractor.name || contractor.companyName || contractor.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </div>
            }
            content={
                <Box sx={{ p: 4, minHeight: '100vh' }}>
                    <Grid container spacing={4}>
                        {/* Fila 1: KPIs principales agrupados */}
                        <Grid item xs={12}>
                            <KPIGroupCard kpis={mainKPIs} />
                        </Grid>

                        {/* Fila 2: Estado operativo */}
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                {/* Ocupación principal - Card más grande */}
                                <Grid item xs={12} md={6}>
                                    <OccupancyMainCard 
                                        occupancyData={occupancyMainData}
                                        standardData={standardOccupancyData}
                                    />
                                </Grid>
                                
                                {/* Métricas operativas - Cards más pequeñas */}
                                <Grid item xs={12} md={6}>
                                    <Grid container spacing={3} sx={{ height: '100%' }}>
                                        {operationalMetrics.map((metric, index) => (
                                            <Grid item xs={12} key={index}>
                                                <OperationalMetricCard {...metric} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Fila 3: Chart temporal con filtros */}
                        <Grid item xs={12}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 2,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                        Ocupación de Camas - Próximos días
                                    </Typography>
                                    {/* <ButtonGroup variant="outlined" size="small">
                                        <Button 
                                            variant={selectedTimeFilter === '7' ? 'contained' : 'outlined'}
                                            onClick={() => setSelectedTimeFilter('7')}
                                        >
                                            7 días
                                        </Button>
                                        <Button 
                                            variant={selectedTimeFilter === '14' ? 'contained' : 'outlined'}
                                            onClick={() => setSelectedTimeFilter('14')}
                                        >
                                            14 días
                                        </Button>
                                        <Button 
                                            variant={selectedTimeFilter === '30' ? 'contained' : 'outlined'}
                                            onClick={() => setSelectedTimeFilter('30')}
                                        >
                                            30 días
                                        </Button>
                                    </ButtonGroup> */}
                                </Box>
                                
                                <Box sx={{ position: 'relative', height: 280 }}>
                                    <Bar 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: 'top',
                                                    labels: {
                                                        usePointStyle: true,
                                                        color: '#64748B'
                                                    }
                                                },
                                                tooltip: {
                                                    mode: 'index',
                                                    intersect: false,
                                                    backgroundColor: '#1E293B',
                                                    titleColor: '#F1F5F9',
                                                    bodyColor: '#F1F5F9'
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    stacked: false,
                                                    grid: { display: false },
                                                    ticks: { color: '#64748B' }
                                                },
                                                y: {
                                                    stacked: false,
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Camas',
                                                        color: '#64748B'
                                                    },
                                                    grid: { color: '#F1F5F9' },
                                                    ticks: { color: '#64748B' }
                                                }
                                            }
                                        }} 
                                        data={{
                                            labels: Array.from({ length: parseInt(selectedTimeFilter) }, (_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() + i);
                                                return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                            }),
                                            datasets: [
                                                {
                                                    label: 'Total Camas',
                                                    data: Array(parseInt(selectedTimeFilter)).fill(
                                                        dashboardData?.blocksOccupancy?.reduce((total, block) => total + (block.totalBeds || 0), 0) || 0
                                                    ),
                                                    backgroundColor: '#2563EB20',
                                                    borderColor: '#2563EB',
                                                    borderWidth: 2,
                                                    borderRadius: 4
                                                },
                                                {
                                                    label: 'Camas Ocupadas',
                                                    data: Array.from({ length: parseInt(selectedTimeFilter) }, (_, i) => {
                                                        const date = new Date();
                                                        date.setDate(date.getDate() + i);
                                                        const dateStr = date.toISOString().split('T')[0];
                                                        return dashboardData?.blocksOccupancy?.reduce((total, block) => {
                                                            const occupancyData = block.dailyOccupancy?.find(
                                                                day => new Date(day.date).toISOString().split('T')[0] === dateStr
                                                            );
                                                            return total + (occupancyData?.occupiedBeds || 0);
                                                        }, 0) || 0;
                                                    }),
                                                    backgroundColor: '#10B98120',
                                                    borderColor: '#10B981',
                                                    borderWidth: 2,
                                                    borderRadius: 4
                                                }
                                            ],
                                        }} 
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            }
        />
    );
}

export default DashboardLegacy;
