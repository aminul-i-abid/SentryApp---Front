import React, { useEffect, useState } from 'react';
import { Drawer, Typography, Box, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getLostBeds } from '../dashboardService';
import { LostBedRoomContract } from '../models/LostBedRoomContract';
import LostBedRoomCard from './LostBedRoomCard';

interface LostBedsDetailSidebarProps {
    selectedContractor: string;
    open: boolean;
    onClose: () => void;
}

const LostBedsDetailSidebar: React.FC<LostBedsDetailSidebarProps> = ({ selectedContractor, open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LostBedRoomContract[] | null>(null);

    const fetchLostBeds = async () => {
        setLoading(true);
        try {
            const contractorId = selectedContractor;
            const response = await getLostBeds(contractorId);
            if (response.succeeded) {
                setData(response.data);
            } else {
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching lost beds:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchLostBeds();
        }
    }, [open, selectedContractor]);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '70vw', md: '40vw' }, maxWidth: '1000px', boxShadow: '-4px 0 8px rgba(0,0,0,0.1)', bgcolor: '#f5f5f5' } }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)', color: 'black', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            Camas Perdidas
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }}}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Typography>Cargando...</Typography>
                        </Box>
                    ) : data && data.length > 0 ? (
                        <Grid container spacing={2}>
                            {data.map((room, idx) => (
                                <LostBedRoomCard key={idx} room={room} />
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Typography color="text.secondary">No hay camas perdidas</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default LostBedsDetailSidebar;
