import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    TextField,
    InputAdornment,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { getCamps, createCamp } from './campsService';
import AddCampModal from './component/AddCampModal';
import { Routes, buildRoute } from '../../../utils/routesEnum';
import authRoles from '@auth/authRoles';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';

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

function Camps() {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchCamps = async () => {
        try {
            const response = await getCamps();
            if (response.succeeded) {
                setCamps(response.data);
            }
        } catch (error) {
            console.error('Error fetching camps:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCamps();
    }, []);

    const handleAddCamp = async (campData) => {
        try {
            const response = await createCamp(campData);
            if (response.succeeded) {
                // After successful addition, refresh the camps list
                const updatedCamps = await getCamps();
                if (updatedCamps.succeeded) {
                    setCamps(updatedCamps.data);
                }
            }
        } catch (error) {
            console.error('Error adding camp:', error);
        }
    };

    const handleCampClick = (campId) => {
        navigate(buildRoute(Routes.CAMPS_DETAIL, { id: campId }));
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">Lista de Campamentos</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        {authState?.user?.role && authRoles.admin.includes(authState.user.role as string) && (
                        <div className="flex justify-end mb-4">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                Nuevo Campamento
                            </Button>
                        </div>
                        )}
                        <Grid container spacing={3}>
                            {camps.length === 0 ? (
                                <Grid item xs={12}>
                                    <Box display="flex" flexDirection="column" alignItems="center" py={8}>
                                        <span style={{ color: '#888' }}>No se encontraron datos</span>
                                    </Box>
                                </Grid>
                            ) : (
                                camps.map((camp) => (
                                    <Grid item xs={12} sm={6} md={6} lg={4} key={camp.id}>
                                        <Card 
                                            onClick={() => handleCampClick(camp.id)}
                                            sx={{
                                                borderRadius: 4,
                                                boxShadow: 3,
                                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 6
                                                }
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="160"
                                                image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                                                alt="Campamento"
                                                sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                                    {camp.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {camp.location}
                                                </Typography>
                                                <Box mt={2} display="flex" gap={2}>
                                                    <Box display="flex" alignItems="center" bgcolor="#f3f4f6" px={2} py={1} borderRadius={3} minWidth={0} flex={1}>
                                                        <Box mr={1} color="primary.main" display="flex" alignItems="center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19c0 .34-.04.67-.09 1H23c.55 0 1-.45 1-1v-2.5c0-2.33-4.67-3.5-7-3.5Z"/></svg>
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <b>Habitaciones</b> {camp.roomsCount}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" bgcolor="#f3f4f6" px={2} py={1} borderRadius={3} minWidth={0} flex={1}>
                                                        <Box mr={1} color="primary.main" display="flex" alignItems="center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/></svg>
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <b>Bloques</b><br></br> {camp.blockCount}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </div>
                }
            />

            <AddCampModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchCamps();
                }}
            />
        </>
    );
}

export default Camps; 