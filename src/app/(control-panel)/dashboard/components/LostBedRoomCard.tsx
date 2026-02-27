import React from 'react';
import { Paper, Typography, Box, Grid, Chip } from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import tagRoleMap from '../../tag/enum/RoleTag';
import { LostBedRoomContract } from '../models/LostBedRoomContract';

interface LostBedRoomCardProps {
    room: LostBedRoomContract;
}

const tagColorMap: Record<number, { bg: string; text: string; accent: string }> = {
    0: { bg: '#10B98120', text: '#047857', accent: '#10B981' }, // Manager
    1: { bg: '#F59E0B20', text: '#B45309', accent: '#F59E0B' }, // Supervisor
    2: { bg: '#8B5CF620', text: '#5B21B6', accent: '#8B5CF6' }  // Trabajador
};

const LostBedRoomCard: React.FC<LostBedRoomCardProps> = ({ room }) => {
    const colors = tagColorMap[room.tag] || tagColorMap[2];
    return (
        <Grid item xs={12}>
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid #e0e0e0`,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MeetingRoomIcon sx={{  mr: 1.2, color: '#1976d2' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#1976d2' }}>
                            Habitación {room.roomNumber}
                        </Typography>
                    </Box>
                    <Chip 
                        label={tagRoleMap[room.tag] || `Tag ${room.tag}`} 
                        size="small" 
                        sx={{ 
                            backgroundColor: colors.accent, 
                            color: '#fff',
                            fontWeight: 600
                        }} 
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>Camas Estándar</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{room.expectedBeds}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>Camas Reales</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{room.actualBeds}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>Camas Perdidas</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>{room.lostBeds}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );
};

export default LostBedRoomCard;
