import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
    TextField,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getRooms } from './roomService';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import BlockCards from '../camps/component/BlockCards';
import { RoomResponse } from './models/RoomResponse';
import RoomCards from './components/RoomCards';

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


function RoomBlock() {
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

    useEffect(() => {
        // Use hardcoded data instead of API call
        
        fetchRooms();
        setLoading(false);     

    }, []);

    const fetchRooms = async () => {
        const response = await getRooms();
        if (response.succeeded) {
            setRooms(response.data);
        }
        setLoading(false);
    };

    const handleDeleteClick = (room: RoomResponse) => {
        setSelectedRoom(room);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            // TODO: Implement the actual delete API call here
            console.log('Deleting room:', selectedRoom?.id);
            // After successful deletion, refresh the rooms list
            const response = await getRooms();
            if (response.succeeded) {
                setRooms(response.data);
            }
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const handleBlockClick = (blockId: number) => {
        setSelectedBlockId(blockId === selectedBlockId ? null : blockId);
    };

    const handleRoomClick = (roomId: number) => {
        console.log('Room clicked:', roomId);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Lista de Habitaciones</h2>
                        <TextField
                            placeholder="Buscar..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={handleSearchChange}
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
                        <div className="mt-8">
                            {/*<RoomCards 
                                rooms={rooms} 
                                //onRoomClick={handleRoomClick}
                                onDeleteClick={handleDeleteClick}
                            />*/}
                        </div>
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
        </>
    );
}

export default RoomBlock;
