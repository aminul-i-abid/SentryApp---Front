import React, { useEffect, useState } from 'react';
import {
    Drawer,
    Typography,
    Box,
    IconButton,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getDisabledRooms } from '../dashboardService';
import { DisabledRoomContract } from '../models/DisabledRoomsContracts';
import DisabledRoomCard from './DisabledRoomCard';

interface DashboardDetailSidebarProps {
    selectedContractor: string;
    open: boolean;
    onClose: () => void;
}

const DashboardDetailSidebar: React.FC<DashboardDetailSidebarProps> = ({ 
    selectedContractor,
    open, 
    onClose 
}) => {
    const [loading, setLoading] = useState(false);
    const [disabledRoomsData, setDisabledRoomsData] = useState<DisabledRoomContract[] | null>(null);

    const fetchDisabledRooms = async () => {
        setLoading(true);
        console.log('Fetching disabled rooms for contractor:', selectedContractor);
        try {
            const contractorId = selectedContractor;
            
            const response = await getDisabledRooms(contractorId);
            console.log('API Response:', response);
            if (response.succeeded) {
                setDisabledRoomsData(response.data);
                console.log('Disabled Rooms Data:', response.data);
            } else {
                console.error('Error fetching disabled rooms:', response.message);
                setDisabledRoomsData(null);
            }
        } catch (error) {
            console.error('Error fetching disabled rooms:', error);
            setDisabledRoomsData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchDisabledRooms();
        }
    }, [open, selectedContractor]);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: '70vw', md: '40vw' },
                    maxWidth: '1000px',
                    boxShadow: '-4px 0 8px rgba(0,0,0,0.1)',
                    bgcolor: '#f5f5f5',
                },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)',
                    color: 'black',
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                Habitaciones Deshabilitadas
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'black',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{

                    flex: 1,
                    overflow: 'auto',
                    p: 2
                }}>

                    {loading ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '200px' 
                        }}>
                            <Typography>Cargando...</Typography>
                        </Box>
                    ) : disabledRoomsData && disabledRoomsData.length > 0 ? (
                        <Grid container spacing={2}>
                            {disabledRoomsData.map((room, index) => (
                                <DisabledRoomCard 
                                    key={index}
                                    room={room} 
                               />
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '200px' 
                        }}>
                            <Typography color="text.secondary">
                                No hay habitaciones deshabilitadas
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default DashboardDetailSidebar;
