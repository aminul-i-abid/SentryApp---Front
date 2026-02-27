import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

interface RoomNumberSelectorProps {
  blockNumber: string;
  totalRooms: string;
  selectedRooms: Record<string, boolean>;
  showRooms: boolean;
  roomNumbers: string[];
  onToggleRooms: () => void;
  onRoomSelection: (room: string) => void;
  onAddMoreRooms: () => void;
}

const RoomNumberSelector: React.FC<RoomNumberSelectorProps> = ({
  blockNumber,
  totalRooms,
  selectedRooms,
  showRooms,
  roomNumbers,
  onToggleRooms,
  onRoomSelection,
  onAddMoreRooms,
}) => {
  if (!blockNumber || !totalRooms) {
    return null;
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}
      >
        <Typography variant="subtitle2">Room number</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onToggleRooms}
          sx={{ textTransform: 'none', fontSize: '0.8rem' }}
        >
          {showRooms ? 'Hide Rooms' : 'Add Block'}
        </Button>
      </Box>
      
      {showRooms && (
        <>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {roomNumbers.map((room) => (
              <Grid item xs={2} key={room}>
                <Box 
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Typography variant="body2" align="center">
                    {room}
                  </Typography>
                  <Checkbox
                    checked={selectedRooms[room] || false}
                    onChange={() => onRoomSelection(room)}
                    size="small"
                    sx={{ 
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      p: 0
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddMoreRooms}
              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
            >
              + Add Block
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default RoomNumberSelector; 