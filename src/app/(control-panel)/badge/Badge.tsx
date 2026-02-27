import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
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
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { getBadges } from './badgeService';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { formatDateTime } from 'src/utils/dateHelpers';

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

function Badge() {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const response = await getBadges();
                if (response.succeeded) {
                    setBadges(response.data);
                }
            } catch (error) {
                console.error('Error fetching badges:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDeleteClick = (badge) => {
        setSelectedBadge(badge);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            // TODO: Implement the actual delete API call here
            // After successful deletion, refresh the badges list
            const response = await getBadges();
            if (response.succeeded) {
                setBadges(response.data);
            }
        } catch (error) {
            console.error('Error deleting badge:', error);
        }
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Lista de Chapas</h2>
                        <TextField
                            placeholder="Buscar..."
                            variant="outlined"
                            size="small"
                            sx={{
                                width: '300px',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '20px',
                                    backgroundColor: '#FFFFFF',
                                    '& fieldset': {
                                        borderColor: 'divider',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                }
                content={
                    <div className="p-6">
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>KeyID</TableCell>
                                        <TableCell>BluetoothMac</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Version</TableCell>
                                        <TableCell align="center">Accion</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {badges.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                                                    <span style={{ color: '#888' }}>No se encontraron datos</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        badges
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((badge) => (
                                                <TableRow key={badge.id}>
                                                    <TableCell>{badge.keyId}</TableCell>
                                                    <TableCell>{badge.bluetoothMac}</TableCell>
                                                    <TableCell>
                                                        {formatDateTime(new Date(badge.created))}
                                                    </TableCell>
                                                    <TableCell>{badge.version}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton 
                                                            color="error" 
                                                            size="small"
                                                            onClick={() => handleDeleteClick(badge)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={badges.length}
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
                title="Eliminar chapa"
                message={`¿Estás seguro que deseas eliminar la chapa con Bluetooth MAC: ${selectedBadge?.bluetoothMac}? Esta acción no se puede deshacer.`}
                type="delete"
            />
        </>
    );
}

export default Badge; 