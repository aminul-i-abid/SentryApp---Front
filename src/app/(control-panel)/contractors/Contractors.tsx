import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { getContractors, createContractor } from './contractorsService';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import AddContractorModal from './component/AddContractorModal';
import { Routes, buildRoute } from '@/utils/routesEnum';
import { useSnackbar } from 'notistack';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
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

function Contractors() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [contractors, setContractors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const { authState } = useAuth();
    const companyId = authState?.user?.companyId;

    useEffect(() => {
        // Si companyId existe, el usuario no tiene permisos para esta página
        if (companyId) {
            navigate('/', { replace: true });
            return;
        }
        fetchContractors();
    }, [companyId, navigate]);

    const fetchContractors = async () => {
        try {
            const response = await getContractors();
            if (response.succeeded) {
                setContractors(response.data);
            }
        } catch (error) {
            console.error('Error fetching contractors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (contractor) => {
        setSelectedContractor(contractor);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            // TODO: Implement the actual delete API call here
            console.log('Deleting contractor:', selectedContractor.id);
            // After successful deletion, refresh the contractors list
            await fetchContractors();
            enqueueSnackbar('Contratista eliminado exitosamente', { variant: 'success' });
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting contractor:', error);
            enqueueSnackbar('Error al eliminar el contratista', { variant: 'error' });
        }
    };

    const handleAddContractor = async (contractorData) => {
        try {
            const response = await createContractor(contractorData);
            if (response.succeeded) {
                enqueueSnackbar('Contratista creado exitosamente', { variant: 'success' });
                // After successful addition, refresh the contractors list
                await fetchContractors();
            } else {
                const errorMessage = response.errors?.[0] || response.message || 'Error al crear el contratista';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            }
        } catch (error) {
            console.error('Error adding contractor:', error);
            enqueueSnackbar('Error al crear el contratista', { variant: 'error' });
        }
    };

    const handleContractorClick = (contractorId) => {
        navigate(buildRoute(Routes.CONTRACTORS_DETAIL, { id: contractorId }));
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">Lista de Contratistas</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <div className="flex justify-end mb-4">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                Nuevo Contratista
                            </Button>
                        </div>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>RUT (VAT ID)</TableCell>
                                        <TableCell>Persona de contacto</TableCell>
                                        <TableCell>Email de contacto</TableCell>
                                        <TableCell>Teléfono de contacto</TableCell>
                                        <TableCell>Habitaciones</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell align="center">Acción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {contractors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                                                    <span style={{ color: '#888' }}>No se encontraron datos</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) :
                                        contractors
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((contractor) => (
                                                <TableRow key={contractor.id}>
                                                    <TableCell>{contractor.name}</TableCell>
                                                    <TableCell>{contractor.rut}</TableCell>
                                                    <TableCell>{contractor.contactPerson}</TableCell>
                                                    <TableCell>{contractor.contactEmail}</TableCell>
                                                    <TableCell>{contractor.contactPhone}</TableCell>
                                                    <TableCell>{contractor.rooms.length}</TableCell>
                                                    <TableCell>{contractor.state ? 'Activo' : 'Inactivo'}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            color="primary" 
                                                            size="small"
                                                            onClick={() => handleContractorClick(contractor.id)}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                            </Table>
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={contractors.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    labelRowsPerPage="Filas por página:"
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                                />
                            </div>
                        </TableContainer>
                    </div>
                }
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar contratista"
                message={`¿Estás seguro que deseas eliminar al contratista ${selectedContractor?.name}? Esta acción no se puede deshacer.`}
                type="delete"
            />
            <AddContractorModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddContractor}
            />
        </>
    );
}

export default Contractors;