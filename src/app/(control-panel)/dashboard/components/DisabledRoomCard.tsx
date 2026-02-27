import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BedIcon from '@mui/icons-material/Bed';
import { DisabledRoomContract } from '../models/DisabledRoomsContracts';

interface DisabledRoomCardProps {
    room: DisabledRoomContract;
}

const DisabledRoomCard: React.FC<DisabledRoomCardProps> = ({ room }) => {
    return (
        <Grid item xs={12}>
            <Paper
                elevation={2}
                sx={{
                    p: 1.85,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                }}
            >
                {/* Room Header and Details */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Room Header */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center'
                    }}>
                        <MeetingRoomIcon 
                            sx={{ 
                                color: '#1976d2', 
                                mr: 1, 
                                fontSize: '1.5rem' 
                            }} 
                        />
                        {/* Date Info */}
                        <Box sx={{ 
                            display: 'grid', 
                            alignItems: 'center'
                        }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: '#1976d2',
                                    fontSize: '1.1rem'
                                }}
                            >
                                Habitación {room.roomNumber}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: '#666', 
                                    fontSize: '0.75rem'
                                }}
                            >
                                Última fecha de deshabilitación: <strong>
                                    {new Date(room.lastDisabledDate).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </strong>
                            </Typography>
                        </Box>
                    </Box>


                    {/* Room Details */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center'
                    }}>
                        <BedIcon 
                            sx={{ 
                                color: '#666', 
                                mr: 1, 
                                fontSize: '1.2rem' 
                            }} 
                        />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            <strong>{room.beds}</strong>
                        </Typography>
                    </Box>
                </Box>

               
            </Paper>
        </Grid>
    );
};

export default DisabledRoomCard;
