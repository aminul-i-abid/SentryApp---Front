import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Modal,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Chip,
    IconButton,
    Tooltip,
    Popover,
    alpha,
    Toolbar,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Battery20Icon from '@mui/icons-material/Battery20';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import { useSnackbar } from 'notistack';
import StyledTable from '@/components/ui/StyledTable';
import type { TableColumnDef } from '@/components/ui/StyledTable';
import RowActionMenu from '@/components/ui/RowActionMenu';
import type { ActionMenuItem } from '@/components/ui/RowActionMenu';
import { RoomResponse } from '../models/RoomResponse';
import { ContractorResponse } from '../../contractors/models/ContractorResponse';
import { getRooms, deleteRoom, updateRoom, updateRoomDisabledStatus, createRoomPinUnique } from '../roomService';
import RoomTableFilters from './all-rooms-table/RoomTableFilters';
import RoomDetailSidebar from './RoomDetailSidebar';
import AddPinModal from './AddPinModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import tagRoleMap from '../../tag/enum/RoleTag';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import useUser from '@auth/useUser';

interface AllRoomsTableProps {
    contractors: ContractorResponse[];
}

type Order = 'asc' | 'desc';
type OrderBy = 'roomNumber' | 'blockName' | 'floorNumber' | 'beds' | 'tag' | 'companyName' | 'doorLockBatteryLevel';

const AllRoomsTable: React.FC<AllRoomsTableProps> = ({ contractors }) => {
    const { data: user } = useUser();
    const hasTTLock = user?.modules?.ttlock === true;
    const [allRooms, setAllRooms] = useState<RoomResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<OrderBy>('roomNumber');

    const [searchText, setSearchText] = useState<string>('');
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
    const [batteryFilter, setBatteryFilter] = useState<string>('all');
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

    const [selected, setSelected] = useState<string[]>([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedRoomForSidebar, setSelectedRoomForSidebar] = useState<RoomResponse | null>(null);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddPinOpen, setIsAddPinOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
    const [roomForPin, setRoomForPin] = useState<RoomResponse | null>(null);
    const [disableComments, setDisableComments] = useState<string>('');
    const [pendingDisabledState, setPendingDisabledState] = useState<boolean>(false);
    const [addingPin, setAddingPin] = useState(false);

    const [bulkEditTag, setBulkEditTag] = useState<string>('');
    const [bulkEditBeds, setBulkEditBeds] = useState<string>('');
    const [bulkEditContractor, setBulkEditContractor] = useState<string>('');

    const { enqueueSnackbar } = useSnackbar();
    const { authState } = useAuth();
    const isSentryAdmin = authState.user?.role === 'Sentry_Admin';

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await getRooms();
            if (response.succeeded) {
                setAllRooms(response.data || []);
            } else {
                enqueueSnackbar(response.errors?.[0] || 'Error al cargar habitaciones', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            enqueueSnackbar('Error al conectar con el servidor', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const companies = useMemo(() => contractors.map(c => c.name).sort(), [contractors]);

    const blocks = useMemo(() => {
        const uniqueBlocks = Array.from(new Set(allRooms.map(r => r.blockName).filter(Boolean))) as string[];
        return uniqueBlocks.sort();
    }, [allRooms]);

    const filteredAndSortedRooms = useMemo(() => {
        let filtered = [...allRooms];

        if (selectedCompanies.length > 0) {
            filtered = filtered.filter(room => room.companyName && selectedCompanies.includes(room.companyName));
        }
        if (selectedBlocks.length > 0) {
            filtered = filtered.filter(room => room.blockName && selectedBlocks.includes(room.blockName));
        }
        if (batteryFilter !== 'all') {
            filtered = filtered.filter(room => {
                const battery = room.doorLockBatteryLevel;
                switch (batteryFilter) {
                    case 'with-battery': return battery !== null && battery !== undefined;
                    case 'without-battery': return battery === null || battery === undefined;
                    case 'low': return battery !== null && battery !== undefined && battery < 35;
                    case 'medium': return battery !== null && battery !== undefined && battery >= 35 && battery <= 65;
                    case 'high': return battery !== null && battery !== undefined && battery > 65;
                    default: return true;
                }
            });
        }
        if (searchText.trim()) {
            const s = searchText.toLowerCase().trim();
            filtered = filtered.filter(room =>
                room.roomNumber.toLowerCase().includes(s) ||
                (room.companyName && room.companyName.toLowerCase().includes(s)) ||
                (room.blockName && room.blockName.toLowerCase().includes(s)) ||
                room.floorNumber.toString().includes(s)
            );
        }

        filtered.sort((a, b) => {
            let vA: any, vB: any;
            switch (orderBy) {
                case 'roomNumber': vA = a.roomNumber; vB = b.roomNumber; break;
                case 'blockName': vA = a.blockName || ''; vB = b.blockName || ''; break;
                case 'floorNumber': vA = a.floorNumber; vB = b.floorNumber; break;
                case 'beds': vA = a.beds; vB = b.beds; break;
                case 'tag': vA = a.tag; vB = b.tag; break;
                case 'companyName': vA = a.companyName || ''; vB = b.companyName || ''; break;
                case 'doorLockBatteryLevel': vA = a.doorLockBatteryLevel ?? -1; vB = b.doorLockBatteryLevel ?? -1; break;
                default: vA = a.id; vB = b.id;
            }
            if (typeof vA === 'string' && typeof vB === 'string') {
                return order === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
            }
            return order === 'asc' ? vA - vB : vB - vA;
        });

        return filtered;
    }, [allRooms, selectedCompanies, selectedBlocks, batteryFilter, searchText, order, orderBy]);

    const paginatedRooms = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredAndSortedRooms.slice(start, start + rowsPerPage);
    }, [filteredAndSortedRooms, page, rowsPerPage]);

    /* ---- Column definitions ---- */
    const columns: TableColumnDef<RoomResponse>[] = useMemo(() => {
        const cols: TableColumnDef<RoomResponse>[] = [
            {
                id: 'roomNumber',
                label: 'Habitación',
                sortable: true,
                render: (room) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{room.roomNumber}</Typography>
                        {room.hasDoorLock && <MeetingRoomIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                    </Box>
                ),
            },
            { id: 'blockName', label: 'Pabellón', sortable: true, render: (room) => room.blockName || '-' },
            { id: 'floorNumber', label: 'Piso', sortable: true, render: (room) => room.floorNumber },
            { id: 'beds', label: 'Camas', sortable: true, render: (room) => room.beds },
            { id: 'tag', label: 'Estándar', sortable: true, render: (room) => tagRoleMap[room.tag] || room.tag },
            { id: 'companyName', label: 'Contratista', sortable: true, render: (room) => room.companyName || 'Sin contratista' },
        ];

        if (hasTTLock) {
            cols.push({
                id: 'doorLockBatteryLevel',
                label: 'Nivel Batería',
                sortable: true,
                render: (room) => {
                    const b = room.doorLockBatteryLevel;
                    if (b === undefined || b === null) return <Typography variant="body2" color="text.disabled">-</Typography>;
                    const color = b < 35 ? '#EF4444' : b <= 65 ? '#F59E0B' : '#10B981';
                    const Icon = b < 35 ? Battery20Icon : b <= 65 ? Battery60Icon : BatteryFullIcon;
                    return (
                        <Tooltip title={`Batería: ${b}%`} arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Icon sx={{ fontSize: 18, color }} />
                                <Typography variant="body2" sx={{ color, fontWeight: 600, fontSize: '0.875rem' }}>{b}%</Typography>
                            </Box>
                        </Tooltip>
                    );
                },
            });
        }

        cols.push({
            id: 'enabled',
            label: 'Habilitada',
            render: (room) => (
                <Box
                    onClick={(e) => { e.stopPropagation(); handleDisabledChange(room, !room.disabled); }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                >
                    <Typography variant="body2" fontWeight={600} sx={{ color: room.disabled ? '#ef4444' : '#22c55e' }}>
                        {room.disabled ? 'Off' : 'On'}
                    </Typography>
                    <FiberManualRecordIcon sx={{ fontSize: 14, color: room.disabled ? '#ef4444' : '#22c55e' }} />
                </Box>
            ),
        });

        return cols;
    }, [hasTTLock]);

    /* ---- Row action menu ---- */
    const renderActions = (room: RoomResponse) => (
        <RowActionMenu
            onView={() => handleRowClick(room)}
            menuItems={[
                {
                    key: 'active',
                    label: 'Información activa',
                    icon: <InfoOutlinedIcon fontSize="small" />,
                    toggle: true,
                    checked: !room.disabled,
                    onClick: () => handleDisabledChange(room, !room.disabled),
                },
                {
                    key: 'edit',
                    label: 'Editar información',
                    icon: <EditIcon fontSize="small" />,
                    onClick: () => handleRowClick(room),
                },
                {
                    key: 'pin',
                    label: 'Generar pin de habitación',
                    icon: <AddCircleOutlineIcon fontSize="small" sx={{ color: '#22c55e' }} />,
                    onClick: () => handleOpenAddPin(room),
                    hidden: !isSentryAdmin,
                },
                {
                    key: 'delete',
                    label: 'Eliminar',
                    icon: <DeleteOutlineIcon fontSize="small" />,
                    color: 'error.main',
                    dividerAbove: true,
                    onClick: () => { setSelectedRoom(room); setIsDeleteModalOpen(true); },
                },
            ] as ActionMenuItem[]}
        />
    );

    /* ---- Handlers ---- */
    const handleRequestSort = (property: string) => {
        const prop = property as OrderBy;
        const isAsc = orderBy === prop && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(prop);
    };

    const handleChangePage = (_event: unknown, newPage: number) => { setPage(newPage); };

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => { setFilterAnchorEl(event.currentTarget); };
    const handleFilterClose = () => { setFilterAnchorEl(null); };

    const handleClearFilters = () => {
        setSelectedCompanies([]);
        setSelectedBlocks([]);
        setBatteryFilter('all');
        setSearchText('');
        setPage(0);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(paginatedRooms.map((n) => n.id.toString()));
            return;
        }
        setSelected([]);
    };

    const handleClick = (_event: React.MouseEvent<unknown>, id: string) => {
        const idx = selected.indexOf(id);
        let next: string[] = [];
        if (idx === -1) next = [...selected, id];
        else if (idx === 0) next = selected.slice(1);
        else if (idx === selected.length - 1) next = selected.slice(0, -1);
        else next = [...selected.slice(0, idx), ...selected.slice(idx + 1)];
        setSelected(next);
    };

    const handleRowClick = (room: RoomResponse) => { setSelectedRoomForSidebar(room); setIsSidebarOpen(true); };
    const handleSidebarClose = () => { setIsSidebarOpen(false); setSelectedRoomForSidebar(null); };
    const handleSidebarRefresh = () => { fetchRooms(); };

    const handleBulkEditOpen = () => { setIsBulkEditModalOpen(true); };
    const handleBulkEditClose = () => { setIsBulkEditModalOpen(false); };

    const handleBulkEditSave = async () => {
        try {
            const rooms = allRooms.filter(r => selected.includes(r.id.toString()));
            for (const room of rooms) {
                await updateRoom(room.id.toString(), {
                    roomNumber: room.roomNumber,
                    beds: bulkEditBeds ? parseInt(bulkEditBeds) : room.beds,
                    isStorage: room.isStorage,
                    blockId: room.blockId,
                    companyId: bulkEditContractor ? parseInt(bulkEditContractor) : room.companyId,
                    tag: bulkEditTag ? parseInt(bulkEditTag) : room.tag,
                    floorNumber: room.floorNumber,
                    disabled: room.disabled,
                });
            }
            enqueueSnackbar(`Se actualizaron ${rooms.length} habitaciones correctamente`, { variant: 'success' });
            setIsBulkEditModalOpen(false);
            setSelected([]);
            setBulkEditTag('');
            setBulkEditBeds('');
            setBulkEditContractor('');
            fetchRooms();
        } catch (error) {
            console.error('Error updating rooms:', error);
            enqueueSnackbar('Error al actualizar las habitaciones', { variant: 'error' });
        }
    };

    const handleDisabledChange = (room: RoomResponse, newState: boolean) => {
        setSelectedRoom(room);
        setPendingDisabledState(newState);
        setIsDisableModalOpen(true);
    };

    const handleDisableConfirm = async () => {
        if (!selectedRoom) return;
        try {
            const action = pendingDisabledState ? 1 : 0;
            const comments = disableComments.trim() || (pendingDisabledState ? '' : 'Se habilitó la habitación');
            const result = await updateRoomDisabledStatus(selectedRoom.id, action, comments);
            if (result.succeeded) {
                enqueueSnackbar(`Habitación ${pendingDisabledState ? 'deshabilitada' : 'habilitada'} correctamente`, { variant: 'success' });
                fetchRooms();
            } else {
                enqueueSnackbar(result.errors?.[0] || 'Error al actualizar el estado de la habitación', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error updating room status:', error);
            enqueueSnackbar('Error al actualizar el estado de la habitación', { variant: 'error' });
        }
        setIsDisableModalOpen(false);
        setDisableComments('');
        setSelectedRoom(null);
    };

    const handleDisableCancel = () => { setIsDisableModalOpen(false); setDisableComments(''); setSelectedRoom(null); };

    const handleDeleteConfirm = async () => {
        if (!selectedRoom) return;
        try {
            const result = await deleteRoom(selectedRoom.id);
            if (result.succeeded) {
                enqueueSnackbar('Habitación eliminada correctamente', { variant: 'success' });
                fetchRooms();
            } else {
                enqueueSnackbar(result.errors?.[0] || 'Error al eliminar la habitación', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Error al eliminar la habitación', { variant: 'error' });
        }
        setIsDeleteModalOpen(false);
        setSelectedRoom(null);
    };

    const handleOpenAddPin = (room: RoomResponse) => { setRoomForPin(room); setIsAddPinOpen(true); };
    const handleCloseAddPin = () => { setIsAddPinOpen(false); setRoomForPin(null); };

    const handleSaveAddPin = async (data: { name: string; phoneNumber: string; roomId: number }) => {
        setAddingPin(true);
        try {
            const result = await createRoomPinUnique({ name: data.name, phoneNumber: data.phoneNumber, roomId: data.roomId });
            if (result.succeeded) {
                enqueueSnackbar('PIN creado correctamente', { variant: 'success' });
                handleCloseAddPin();
            } else {
                enqueueSnackbar(result.errors?.[0] || 'Error al crear el PIN', { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar('Error al crear el PIN', { variant: 'error' });
        } finally {
            setAddingPin(false);
        }
    };

    const hasActiveFilters = selectedCompanies.length > 0 || selectedBlocks.length > 0 || batteryFilter !== 'all' || searchText.trim() !== '';

    const selectedRooms = useMemo(() => allRooms.filter(r => selected.includes(r.id.toString())), [allRooms, selected]);

    const filterOpen = Boolean(filterAnchorEl);
    const filterId = filterOpen ? 'filter-popover' : undefined;

    const bulkToolbarContent = selected.length > 0 ? (
        <Toolbar
            sx={{
                pl: { sm: 2 }, pr: { xs: 1, sm: 1 },
                minHeight: '48px !important', mb: 1, borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }}
        >
            <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
                {selected.length} seleccionado(s)
            </Typography>
            <Tooltip title="Editar seleccionados">
                <IconButton onClick={handleBulkEditOpen}><EditIcon /></IconButton>
            </Tooltip>
        </Toolbar>
    ) : null;

    return (
        <>
            {/* Header bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#1E293B' }}>
                    Habitaciones
                </Typography>
                <Tooltip title="Filtrar">
                    <IconButton
                        onClick={handleFilterClick}
                        sx={{
                            ...(hasActiveFilters && {
                                bgcolor: 'primary.main', color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                            }),
                        }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Filter popover */}
            <Popover
                id={filterId}
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <RoomTableFilters
                    searchText={searchText}
                    selectedCompanies={selectedCompanies}
                    selectedBlocks={selectedBlocks}
                    batteryFilter={batteryFilter}
                    companies={companies}
                    blocks={blocks}
                    contractors={contractors}
                    onSearchChange={setSearchText}
                    onCompaniesChange={setSelectedCompanies}
                    onBlocksChange={setSelectedBlocks}
                    onBatteryFilterChange={setBatteryFilter}
                    onClearFilters={handleClearFilters}
                />
            </Popover>

            {/* StyledTable */}
            <StyledTable<RoomResponse>
                columns={columns}
                data={paginatedRooms}
                getRowId={(room) => room.id.toString()}
                loading={loading}
                loadingMessage="Cargando habitaciones..."
                emptyMessage="No se encontraron habitaciones"
                selectable
                selected={selected}
                onSelectAll={handleSelectAllClick}
                onSelectRow={handleClick}
                order={order}
                orderBy={orderBy}
                onSort={handleRequestSort}
                onRowClick={handleRowClick}
                renderActions={renderActions}
                actionsLabel="Acciones"
                pagination={{
                    count: filteredAndSortedRooms.length,
                    page,
                    rowsPerPage,
                    onPageChange: handleChangePage,
                }}
                bulkToolbar={bulkToolbarContent}
            />

            {/* Delete confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedRoom(null); }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Habitación"
                message={`¿Estás seguro que deseas eliminar la habitación ${selectedRoom?.roomNumber}?`}
                type="delete"
            />

            {/* Bulk Edit Modal */}
            <Modal open={isBulkEditModalOpen} onClose={handleBulkEditClose}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
                    <Typography variant="h6" component="h2" mb={2}>Editar habitaciones seleccionadas</Typography>
                    <Typography variant="body2" mb={3}>
                        Estás editando {selected.length} habitación(es):
                        {selectedRooms.map(room => (<Chip key={room.id} label={room.roomNumber} size="small" sx={{ ml: 0.5, mb: 0.5 }} />))}
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="company-edit-label">Contratista</InputLabel>
                        <Select labelId="company-edit-label" label="Contratista" value={bulkEditContractor} onChange={(e) => setBulkEditContractor(e.target.value)}>
                            <MenuItem value=""><em>No cambiar</em></MenuItem>
                            {contractors.map((c) => (<MenuItem key={c.id} value={c.id.toString()}>{c.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="beds-edit-label">Camas</InputLabel>
                        <Select labelId="beds-edit-label" label="Camas" value={bulkEditBeds} onChange={(e) => setBulkEditBeds(e.target.value)}>
                            <MenuItem value=""><em>No cambiar</em></MenuItem>
                            {[1, 2, 3].map((bed) => (<MenuItem key={bed} value={bed.toString()}>{bed}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="tag-edit-label">Estándar</InputLabel>
                        <Select labelId="tag-edit-label" label="Estándar" value={bulkEditTag} onChange={(e) => setBulkEditTag(e.target.value)}>
                            <MenuItem value=""><em>No cambiar</em></MenuItem>
                            {Object.entries(tagRoleMap).map(([key, value]) => (<MenuItem key={key} value={key}>{value}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Stack direction="row" spacing={2} sx={{ '& > *': { flex: 1 } }}>
                        <Button onClick={handleBulkEditClose} variant="outlined" fullWidth>Cancelar</Button>
                        <Button onClick={handleBulkEditSave} variant="contained" color="primary" fullWidth disabled={!bulkEditContractor && !bulkEditBeds && !bulkEditTag}>Guardar cambios</Button>
                    </Stack>
                </Box>
            </Modal>

            {/* Disable/Enable Modal */}
            <Modal open={isDisableModalOpen} onClose={handleDisableCancel}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
                    <Typography variant="h6" component="h2" mb={2}>
                        {pendingDisabledState ? 'Deshabilitar' : 'Habilitar'} Habitación
                    </Typography>
                    <Typography variant="body2" mb={3}>
                        ¿Estás seguro que deseas {pendingDisabledState ? 'deshabilitar' : 'habilitar'} la habitación{' '}
                        <strong>{selectedRoom?.roomNumber}</strong>?
                    </Typography>
                    <TextField
                        fullWidth
                        label={pendingDisabledState ? 'Motivo (requerido)' : 'Motivo (opcional)'}
                        placeholder={`Ingresa el motivo para ${pendingDisabledState ? 'deshabilitar' : 'habilitar'} la habitación...`}
                        value={disableComments}
                        onChange={(e) => setDisableComments(e.target.value)}
                        multiline rows={3} sx={{ mb: 3 }}
                        required={pendingDisabledState}
                    />
                    <Stack direction="row" spacing={2} sx={{ '& > *': { flex: 1 } }}>
                        <Button onClick={handleDisableCancel} variant="outlined" fullWidth>Cancelar</Button>
                        <Button onClick={handleDisableConfirm} variant="contained" color={pendingDisabledState ? 'error' : 'success'} fullWidth disabled={pendingDisabledState && !disableComments.trim()}>
                            {pendingDisabledState ? 'Deshabilitar' : 'Habilitar'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            {/* Room Detail Sidebar */}
            <RoomDetailSidebar open={isSidebarOpen} onClose={handleSidebarClose} roomId={selectedRoomForSidebar?.id || null} onRefreshData={handleSidebarRefresh} />

            {/* Add PIN Modal */}
            <AddPinModal open={isAddPinOpen} onClose={handleCloseAddPin} onSave={handleSaveAddPin} roomNumber={roomForPin?.roomNumber} roomId={roomForPin?.id || null} loading={addingPin} />
        </>
    );
};

export default AllRoomsTable;
