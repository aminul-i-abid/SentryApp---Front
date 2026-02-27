import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
    TextField,
    InputAdornment,
    Button,
    Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import DetailBlock from '../block/component/DetailBlock';
import { RoomResponse } from '../room/models/RoomResponse';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RoomCards from '../room/components/RoomCards';
import { getBlockById } from '../block/blockService';
import { BlockResponse } from '../block/models/BlockResponse';
import AddRoomModal from '../room/components/AddRoomBulkModal';
import AddRoomSingleModal from '../room/components/AddRoomSingleModal';
import { getContractors } from '../contractors/contractorsService';
import { ContractorResponse } from '../contractors/models/ContractorResponse';
import { getRoomsByBlock } from '../room/roomService';

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

function CampsBlockRoom() {
    const { id } = useParams();
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
    const [block, setBlock] = useState<BlockResponse | null>(null);
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [isAddSingleRoomModalOpen, setIsAddSingleRoomModalOpen] = useState(false);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
    const [contractors, setContractors] = useState<ContractorResponse[]>([]);
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    
    // Filter states
    const [filterCompanyIds, setFilterCompanyIds] = useState<number[] | null>(null);
    const [filterSearch, setFilterSearch] = useState<string | null>(null);
    
    useEffect(() => {        
        fetchData();
        fetchContractors();
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchRooms();
        }
    }, [id, page, rowsPerPage, filterCompanyIds, filterSearch]);

    const fetchData = async () => {
        try {
            if (id) {
                const blockId = parseInt(id);
                const blockResponse = await getBlockById(blockId);
                if (blockResponse.succeeded) {
                    setBlock(blockResponse.data);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            if (id) {
                const blockId = parseInt(id);
                const roomsResponse = await getRoomsByBlock(
                    blockId, 
                    page + 1, 
                    rowsPerPage,
                    filterCompanyIds,
                    filterSearch
                );
                if (roomsResponse.succeeded) {
                    setRooms(roomsResponse.data.items || roomsResponse.data);
                    setTotalCount(roomsResponse.data.totalCount || roomsResponse.data.length);
                }
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const fetchContractors = async () => {
        try {
            const contractorsResponse = await getContractors();
            if (contractorsResponse.succeeded) {
                setContractors(contractorsResponse.data);
            }
        } catch (error) {
            console.error('Error fetching contractors:', error);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const handleRoomClick = (room: RoomResponse) => {
        setSelectedRoom(room);
        setIsEditRoomModalOpen(true);
    };

    const handleOpenAddRoomModal = () => {
        setSelectedRoom(null);
        setIsAddRoomModalOpen(true);
    };

    const handleOpenAddSingleRoomModal = () => {
        setSelectedRoom(null);
        setIsAddSingleRoomModalOpen(true);
    };

    const handleCloseAddRoomModal = () => {
        setIsAddRoomModalOpen(false);
    };

    const handleCloseAddSingleRoomModal = () => {
        setIsAddSingleRoomModalOpen(false);
    };

    const handleCloseEditRoomModal = () => {
        setIsEditRoomModalOpen(false);
        setSelectedRoom(null);
    };

    const handleRoomAdded = async () => {
        try {
            fetchRooms();
        } catch (error) {
            console.error('Error refreshing rooms:', error);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // New filter handlers
    const handleCompanyFilter = (companyIds: number[]) => {
        setFilterCompanyIds(companyIds.length > 0 ? companyIds : null);
        setPage(0); // Reset to first page when filtering
    };

    const handleSearchFilter = (search: string) => {
        setFilterSearch(search.trim() ? search.trim() : null);
        setPage(0); // Reset to first page when filtering
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Lista de Habitaciones</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <Grid container>
                            {/* Columna Izquierda */}
                            <Grid item xs={12}>
                                <DetailBlock block={block} fetchData={fetchData} />
                            </Grid>
                            {/* Columna Derecha */}
                            <Grid item xs={12}>
                                <div className="flex justify-end mb-4 gap-2 mt-4">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenAddSingleRoomModal}
                                    >
                                        Agregar habitación
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenAddRoomModal}
                                    >
                                        Agregar habitaciónes masivas
                                    </Button>
                                </div>
                                <RoomCards
                                    rooms={rooms}
                                    onRoomClick={handleRoomClick}
                                    onDeleteClick={() => fetchRooms()}
                                    contractors={contractors}
                                    loading={loading}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    totalCount={totalCount}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    onCompanyFilter={handleCompanyFilter}
                                    onSearchFilter={handleSearchFilter}
                                />
                            </Grid>
                        </Grid>
                    </div>
                }
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Habitación"
                message={`¿Estás seguro que deseas eliminar la habitación ${selectedRoom?.roomNumber}?`}
                type="delete"
            />
            {block && (
                <AddRoomModal
                    idBlock={block.id}
                    open={isAddRoomModalOpen}
                    onClose={handleCloseAddRoomModal}
                    onSuccess={handleRoomAdded}
                    contractors={contractors}
                    blockFloors={block.floors}
                    prefix={block.prefix}
                    suffix={block.suffix}
                />
            )}
            {block && (
                <AddRoomSingleModal
                    idBlock={block.id}
                    open={isAddSingleRoomModalOpen}
                    onClose={handleCloseAddSingleRoomModal}
                    onSuccess={handleRoomAdded}
                    contractors={contractors}
                    blockFloors={block.floors}
                    prefix={block.prefix}
                    suffix={block.suffix}
                />
            )}
            {block && selectedRoom && (
                <AddRoomSingleModal
                    idBlock={block.id}
                    open={isEditRoomModalOpen}
                    onClose={handleCloseEditRoomModal}
                    onSuccess={handleRoomAdded}
                    contractors={contractors}
                    room={selectedRoom}
                    isEdit={true}
                    blockFloors={block.floors}
                    prefix={block.prefix}
                    suffix={block.suffix}
                />
            )}
        </>
    );
}

export default CampsBlockRoom;