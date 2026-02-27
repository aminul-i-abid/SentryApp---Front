import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
    TextField,
    InputAdornment,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    CircularProgress,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { getActivities } from './activitiesService';
import { ActivityResponse, ConcurrencyType } from './models/Activity';
import { Routes, buildRoute } from 'src/utils/routesEnum';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import authRoles from '@auth/authRoles';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider
    }
}));

function Activities() {
    const { t } = useTranslation('activities');
    const { authState } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const [activities, setActivities] = useState<ActivityResponse[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const isAdmin = authState?.user?.role && authRoles.admin.includes(authState.user.role as string);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await getActivities();
            if (response.succeeded && response.data) {
                setActivities(response.data);
                setFilteredActivities(response.data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        let filtered = activities;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(activity => 
                statusFilter === 'active' ? activity.isActive : !activity.isActive
            );
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(activity =>
                activity.name.toLowerCase().includes(query) ||
                activity.description.toLowerCase().includes(query) ||
                activity.location?.toLowerCase().includes(query)
            );
        }

        setFilteredActivities(filtered);
    }, [activities, statusFilter, searchQuery]);

    const handleStatusFilterChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value as 'all' | 'active' | 'inactive');
    };

    const handleCreateNew = () => {
        navigate(buildRoute(Routes.ACTIVITIES_DETAIL, { id: 'new' }));
    };

    const handleEdit = (id: number) => {
        navigate(buildRoute(Routes.ACTIVITIES_DETAIL, { id: id.toString() }));
    };

    const handleBook = (id: number) => {
        navigate(buildRoute(Routes.ACTIVITIES_BOOKING, { id: id.toString() }));
    };

    const getConcurrencyIcon = (type: ConcurrencyType) => {
        return type === ConcurrencyType.ExclusiveTime ? (
            <SportsTennisIcon fontSize="small" />
        ) : (
            <FitnessCenterIcon fontSize="small" />
        );
    };

    const getConcurrencyLabel = (type: ConcurrencyType) => {
        return type === ConcurrencyType.ExclusiveTime
            ? t('types.exclusive')
            : t('types.shared');
    };

    return (
        <Root
            header={
                <div className="p-6 flex items-center justify-between">
                    {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                    <div>
                        <Typography variant="h5" className="font-bold">
                            {t('title')}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                            {t('subtitle')}
                        </Typography>
                    </div>
                </div>
            }
            content={
                <div className="p-6">
                    {/* Filters and Search */}
                    <Box className="mb-4 flex flex-col md:flex-row gap-4">
                        <TextField
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            className="flex-1"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        <FormControl size="small" className="w-full md:w-48">
                            <InputLabel>{t('filter.all')}</InputLabel>
                            <Select
                                value={statusFilter}
                                label={t('filter.all')}
                                onChange={handleStatusFilterChange}
                            >
                                <MenuItem value="all">{t('filter.all')}</MenuItem>
                                <MenuItem value="active">{t('filter.active')}</MenuItem>
                                <MenuItem value="inactive">{t('filter.inactive')}</MenuItem>
                            </Select>
                        </FormControl>

                        {isAdmin && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateNew}
                                className="whitespace-nowrap"
                            >
                                {t('addNew')}
                            </Button>
                        )}
                    </Box>

                    {/* Activities Table */}
                    {loading ? (
                        <Box className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </Box>
                    ) : filteredActivities.length === 0 ? (
                        <Box className="flex flex-col items-center justify-center h-64">
                            <Typography variant="h6" color="textSecondary">
                                {t('errors.notFoundActivities')}
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('table.name')}</TableCell>
                                        <TableCell>{t('table.type')}</TableCell>
                                        <TableCell>{t('table.capacity')}</TableCell>
                                        {/* <TableCell>{t('table.camp')}</TableCell> */}
                                        <TableCell>{t('table.schedule')}</TableCell>
                                        <TableCell>{t('table.status')}</TableCell>
                                        <TableCell align="right">{t('table.actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredActivities.map((activity) => (
                                        <TableRow key={activity.id} hover>
                                            <TableCell>
                                                <Box className="flex items-center gap-2">
                                                    {getConcurrencyIcon(activity.concurrencyType)}
                                                    <div>
                                                        <Typography variant="body2" className="font-semibold">
                                                            {activity.name}
                                                        </Typography>
                                                        {activity.location && (
                                                            <Typography variant="caption" color="textSecondary">
                                                                {activity.location}
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getConcurrencyLabel(activity.concurrencyType)}
                                                    size="small"
                                                    color={activity.concurrencyType === ConcurrencyType.ExclusiveTime ? 'primary' : 'secondary'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{activity.maxCapacityTotal}</TableCell>
                                            {/* <TableCell>
                                                <Typography variant="caption">
                                                    {activity.campName || `Camp #${activity.campId}`}
                                                </Typography>
                                            </TableCell> */}
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {activity.startTime} - {activity.endTime}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={activity.isActive ? t('status.active') : t('status.inactive')}
                                                    size="small"
                                                    color={activity.isActive ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {activity.isActive && (
                                                    <Tooltip title="Book Activity">
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            onClick={() => handleBook(activity.id)}
                                                        >
                                                            <BookmarkAddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="View Details">
                                                    <IconButton size="small" onClick={() => handleEdit(activity.id)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {isAdmin && (
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleEdit(activity.id)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            }
        />
    );
}

export default Activities;
