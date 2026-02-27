import React from 'react';
import { Grid, Card, Box, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { RoomResponse } from '@/app/(control-panel)/room/models/RoomResponse';

// Block card colors
const blockColors = {
  '01': '#FFF9E6',
  '02': '#EAF1FF',
  '03': '#FFEBF1',
  '04': '#E6F9FF',
  '05': '#E6FFF0',
};

interface Block {
  id: number;
  name: string;
  floors: number;
  rooms: RoomResponse[];
}

interface BlockCardsProps {
  blocks: Block[];
  onBlockClick: (blockId: number) => void;
}

function BlockCards({ blocks, onBlockClick }: BlockCardsProps) {
  return (
    <Grid container spacing={2}>
      {blocks.length > 0 ? (
        blocks.map((block) => (
          <Grid item xs={12} sm={6} key={block.id}>
            <Card 
              onClick={() => onBlockClick(block.id)}
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: '#fff'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {block.name}
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      Pisos: {block.floors} / Habitaciones: {block.rooms.length}
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIosIcon fontSize="small" color="action" />
              </Box>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #eaf1ff', borderRadius: 3, minHeight: 400 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" color="text.secondary">No se encontraron datos</Typography>
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default BlockCards;
