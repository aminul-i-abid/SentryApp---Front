import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box, Typography, Grid, InputAdornment, TextField, Button, Divider, Paper, Stack, Chip, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { getContractorById, updateContractor, deleteContractor, createCompanyUser, getCompanyUsers, deleteCompanyUser } from './contractorsService';
import { ContractorResponse } from './models/ContractorResponse';
import { getCamps, getCampsByCompanyId } from '../camps/campsService';
import { CampResponse } from '../camps/models/CampResponse';
import { Routes, buildRoute } from '@/utils/routesEnum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import EditIcon from '@mui/icons-material/Edit';
import EditContractorModal from './component/EditContractorModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import DeleteIcon from '@mui/icons-material/Delete';
import useUser from '@auth/useUser';
import AddContactPersonModal from './component/AddContactPersonModal';
import { useSnackbar } from 'notistack';
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

function ContractorsDetail() {
    const { data: user } = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const { id } = useParams();
    const navigate = useNavigate();
    const [contractor, setContractor] = useState<ContractorResponse | null>(null);
    const [camps, setCamps] = useState<CampResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [campsLoading, setCampsLoading] = useState(true);
    const { authState } = useAuth();
    const companyId = authState?.user?.companyId;
    const [companyUsers, setCompanyUsers] = useState<any[]>([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    useEffect(() => {
        // Si companyId existe, el usuario no tiene permisos para esta página
        if (companyId) {
            navigate('/', { replace: true });
            return;
        }
        const fetchContractor = async () => {
            try {
                if (!id) {
                    console.error('No contractor ID provided in route parameters');
                    setLoading(false);
                    return;
                }

                const response = await getContractorById(Number(id));
                if (response.succeeded) {
                    setContractor(response.data);
                    const usersResp = await getCompanyUsers(Number(id));
                    if (usersResp.succeeded) {
                        setCompanyUsers(usersResp.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching contractor:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContractor();
    }, [id]);

    const refreshContractor = async () => {
        if (!id) return;
        try {
            const response = await getContractorById(Number(id));
            if (response.succeeded) {
                setContractor(response.data);
            }
            const usersResp = await getCompanyUsers(Number(id));
            if (usersResp.succeeded) {
                setCompanyUsers(usersResp.data);
            }
        } catch (error) {
            console.error('Error refreshing contractor:', error);
        }
    };

    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const response = await getCampsByCompanyId(Number(id));
                if (response.succeeded) {
                    setCamps(response.data);
                }
            } catch (error) {
                console.error('Error fetching camps:', error);
            } finally {
                setCampsLoading(false);
            }
        };

        fetchCamps();
    }, []);

    const handleBackClick = () => {
        window.history.back();
    };

    const handleCampClick = (campId) => {
        navigate(buildRoute(Routes.CONTRACTORS_CAMP, { campId: campId, idContractor: id }));
    };

    const handleOpenEdit = () => setIsEditOpen(true);
    const handleCloseEdit = () => setIsEditOpen(false);

    const handleOpenDelete = () => setIsConfirmOpen(true);
    const handleCloseDelete = () => setIsConfirmOpen(false);

    const handleConfirmDelete = async () => {
        if (!id) return;
        try {
            const response = await deleteContractor(Number(id));
            if (response.succeeded) {
                navigate(buildRoute(Routes.CONTRACTORS));
            }
        } catch (error) {
            console.error('Error deleting contractor:', error);
        }
    };

    const handleOpenAddContact = () => setIsAddContactOpen(true);
    const handleCloseAddContact = () => setIsAddContactOpen(false);
    const handleSaveContact = async (data: { rut: string; firstName: string; lastName: string; phone: string; email: string; }) => {
        if (!id) return;
        try {
            const resp = await createCompanyUser(Number(id), {
                firstName: data.firstName,
                lastName: data.lastName,
                dni: data.rut,
                phoneNumber: data.phone,
                email: data.email
            });
            if (resp.succeeded) {
                enqueueSnackbar('Persona de contacto creada correctamente', { variant: 'success' });
                await refreshContractor();
            }
        } catch (error) {
            console.error('Error al crear el contacto:', error);
            enqueueSnackbar('Error al crear la persona de contacto', { variant: 'error' });
        } finally {
            handleCloseAddContact();
        }
    };

    const handleOpenDeleteUser = (userToDelete: any) => {
        setSelectedUser(userToDelete);
        setIsDeleteUserOpen(true);
    };

    const handleCloseDeleteUser = () => {
        setIsDeleteUserOpen(false);
        setSelectedUser(null);
    };

    const handleConfirmDeleteUser = async () => {
        if (!id || !selectedUser) return;
        try {
            const resp = await deleteCompanyUser(Number(id), selectedUser.id);
            if ((resp as any).succeeded !== false) {
                enqueueSnackbar('Persona de contacto eliminada correctamente', { variant: 'success' });
                await refreshContractor();
            } else {
                enqueueSnackbar('No se pudo eliminar la persona de contacto', { variant: 'error' });
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error eliminando contacto', e);
            enqueueSnackbar('Error al eliminar la persona de contacto', { variant: 'error' });
        } finally {
            handleCloseDeleteUser();
        }
    };

    const handleSaveEdit = async (data: {
        name: string;
        rut: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        contract?: string;
        state: boolean;
    }) => {
        if (!id) return;
        // Map contract field to expected API payload if needed
        const { contract, ...rest } = data;
        const payload: any = { ...rest };
        if (contract) {
            payload.Contract = contract;
        }
        const response = await updateContractor(Number(id), payload);
        if (response.succeeded) {
            await refreshContractor();
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!contractor) {
        return <div>No se encontró el contratista</div>;
    }

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Detalle del Contratista</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <Grid container spacing={3}>
                            {/* Left Column - Contractor Details */}

                            <Grid item xs={12} md={5}>
                                <div className="flex justify-between mb-4 gap-2">
                                    <IconButton
                                        sx={{
                                            bgcolor: '#e0e0e0',
                                            width: 40,
                                            height: 40,
                                            '&:hover': {
                                                bgcolor: '#bdbdbd',
                                            }
                                        }}
                                        onClick={handleBackClick}
                                    >
                                        <ArrowBackIcon sx={{ color: '#1976d2' }} />
                                    </IconButton>
                                    <div className="flex gap-2 flex-end">
                                        {user?.role === 'Sentry_Admin' && (
                                            <IconButton
                                                sx={{
                                                    bgcolor: '#e0e0e0',
                                                    width: 40,
                                                    height: 40,
                                                    '&:hover': { bgcolor: '#bdbdbd' }
                                                }}
                                                onClick={handleOpenEdit}
                                            >
                                                <EditIcon sx={{ color: '#1976d2' }} />
                                            </IconButton>
                                        )}
                                        {user?.role === 'Sentry_Admin' && (
                                            <IconButton
                                                sx={{
                                                    bgcolor: '#e0e0e0',
                                                    width: 40,
                                                    height: 40,
                                                    '&:hover': { bgcolor: '#bdbdbd' }
                                                }}
                                                onClick={handleOpenDelete}
                                            >
                                                <DeleteIcon sx={{ color: '#d32f2f' }} />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box sx={{
                                        p: 3,
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <BusinessIcon fontSize="large" />
                                        <div>
                                            <Typography variant="overline">Contratista</Typography>
                                            <Typography variant="h5" fontWeight="bold">{contractor.name}</Typography>
                                        </div>
                                    </Box>

                                    <Box sx={{ p: 3 }}>
                                        <Stack spacing={2.5}>
                                            <Box>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={contractor.contract ? 4 : 4}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <BadgeIcon color="action" fontSize="small" />
                                                            <Typography variant="subtitle2" color="text.secondary">RUT</Typography>
                                                        </Box>
                                                        <Typography variant="body1" fontWeight="500">{contractor.rut}</Typography>
                                                    </Grid>
                                                    {contractor.contract !== null && contractor.contract != '0' && (
                                                        <Grid item xs={4}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <BadgeIcon color="action" fontSize="small" />
                                                                <Typography variant="subtitle2" color="text.secondary">Contrato</Typography>
                                                            </Box>
                                                            <Typography variant="body1" fontWeight="500">{contractor.contract}</Typography>
                                                        </Grid>
                                                    )}
                                                    <Grid item xs={4}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip
                                                                label={contractor.state ? 'Activo' : 'Inactivo'}
                                                                size="small"
                                                                color={contractor.state ? 'success' : 'error'}
                                                                variant={contractor.state ? 'filled' : 'outlined'}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Divider />

                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <HomeIcon color="action" fontSize="small" />
                                                    <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
                                                </Box>
                                                <Typography variant="body1">{contractor.address}</Typography>
                                            </Box>

                                            <Grid container spacing={0} sx={{ pt: 1 }}>
                                                <Grid item xs={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <PhoneIcon color="action" fontSize="small" />
                                                        <Typography variant="subtitle2" color="text.secondary">Teléfono</Typography>
                                                    </Box>
                                                    <Typography variant="body1">{contractor.phone}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <EmailIcon color="action" fontSize="small" />
                                                        <Typography variant="subtitle2" color="text.secondary">Correo</Typography>
                                                    </Box>
                                                    <Typography variant="body1" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contractor.email}</Typography>
                                                </Grid>
                                            </Grid>

                                            <Divider />

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <PersonIcon color="primary" />
                                                <Typography variant="subtitle1" fontWeight="medium" color="primary.main">Personas de contacto</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                                                    <IconButton
                                                        sx={{
                                                            bgcolor: '#e0e0e0',
                                                            width: 30,
                                                            height: 30,
                                                            '&:hover': { bgcolor: '#bdbdbd' }
                                                        }}
                                                        onClick={handleOpenAddContact}
                                                    >
                                                        <PersonAddIcon sx={{ color: '#1976d2' }} fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            {companyUsers?.length ? (
                                                <Stack spacing={1.5}>
                                                    {companyUsers.map((user) => (
                                                        <Box key={user.id} sx={{
                                                            backgroundColor: 'action.hover',
                                                            borderRadius: 1.5,
                                                            p: 2
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <Typography variant="body1" fontWeight="500" mb={1.5}>{`${user.firstName} ${user.lastName}`}</Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1, flexDirection: 'row' }} onClick={() => handleOpenDeleteUser(user)}>
                                                                    <DeleteIcon sx={{ color: '#d32f2f', mt: -2, cursor: 'pointer' }} fontSize="small" />
                                                                </Box>
                                                            </Box>
                                                                <Grid item>
                                                                    <Typography variant="caption" color="text.secondary">Correo</Typography>
                                                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{user.email}</Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                                                                    <Typography variant="body2">{user.phoneNumber}</Typography>
                                                                </Grid>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">No hay personas de contacto cargadas</Typography>
                                            )}

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <MeetingRoomIcon color="action" fontSize="small" />
                                                    <Typography variant="subtitle2" color="text.secondary">Total habitaciones</Typography>
                                                </Box>
                                                <Chip
                                                    label={contractor.rooms ? contractor.rooms.length : 0}
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Right Column - Camps List */}
                            <Grid item xs={12} md={7}>
                                <div className="flex justify-between mb-4 gap-2">
                                    <Typography variant="h5" fontWeight="500">Campamentos</Typography>
                                </div>
                                {campsLoading ? (
                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                                        <Typography>Cargando campamentos...</Typography>
                                    </Box>
                                ) : (
                                    camps.length === 0 ? (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                minHeight: '400px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="h6" color="text.secondary">
                                                No se encontraron campamentos
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {camps.map((camp) => (
                                                <Grid item xs={12} sm={6} md={4} key={camp.id}>
                                                    <Card
                                                        onClick={() => handleCampClick(camp.id)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            boxShadow: 1,
                                                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                transform: 'translateY(-3px)',
                                                                boxShadow: 3
                                                            },
                                                            height: '100%'
                                                        }}
                                                    >
                                                        <CardMedia
                                                            component="img"
                                                            height="90"
                                                            image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                                                            alt="Campamento"
                                                            sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                                                        />
                                                        <CardContent sx={{ py: 1.5, px: 2 }}>
                                                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                                                                {camp.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                                {camp.location} / {camp.type}
                                                            </Typography>
                                                            <Box mt={1} display="flex" gap={1}>
                                                                <Box display="flex" alignItems="center" bgcolor="#f3f4f6" px={1} py={0.5} borderRadius={1} minWidth={0} flex={1}>
                                                                    <Box mr={0.5} color="primary.main" display="flex" alignItems="center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19c0 .34-.04.67-.09 1H23c.55 0 1-.45 1-1v-2.5c0-2.33-4.67-3.5-7-3.5Z" /></svg>
                                                                    </Box>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {camp.capacity}
                                                                    </Typography>
                                                                </Box>
                                                                <Box display="flex" alignItems="center" bgcolor="#f3f4f6" px={1} py={0.5} borderRadius={1} minWidth={0} flex={1}>
                                                                    <Box mr={0.5} color="primary.main" display="flex" alignItems="center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" /></svg>
                                                                    </Box>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {camp.blocks.length}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )
                                )}
                            </Grid>
                        </Grid>
                    </div>
                }
            />
            <EditContractorModal
                open={isEditOpen}
                onClose={handleCloseEdit}
                contractor={contractor}
                onSave={handleSaveEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                title="Confirmar inactivación"
                message="¿Estás seguro de que quieres volver inactivo este contratista?"
                type="delete"
            />
            <AddContactPersonModal
                open={isAddContactOpen}
                onClose={handleCloseAddContact}
                onSave={handleSaveContact}
            />
            <ConfirmationModal
                isOpen={isDeleteUserOpen}
                onClose={handleCloseDeleteUser}
                onConfirm={handleConfirmDeleteUser}
                title="Eliminar persona de contacto"
                message={`¿Estás seguro que deseas eliminar a ${selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'esta persona'}?`}
                type="delete"
            />
        </>
    );
}

export default ContractorsDetail;
