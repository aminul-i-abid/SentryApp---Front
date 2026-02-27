import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Typography
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import tagRoleMap from '@/app/(control-panel)/tag/enum/RoleTag';
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';

interface Room {
  id: number;
  roomNumber: string;
  beds: number;
  tag: number;
  doorLockId?: string | number;
}

interface Block {
  id: number;
  name: string;
  totalRooms: number;
  rooms: Room[];
}

interface ListConstructorsCampsProps {
  blocks: Block[];
  showBackToBlocksButton?: boolean;
  onBackToBlocks?: () => void;
}

function ListConstructorsCamps({ blocks, showBackToBlocksButton = false, onBackToBlocks }: ListConstructorsCampsProps) {
  console.log('Blocks:', blocks);
  // Aplanar todas las habitaciones con referencia a su bloque
  const allRooms = blocks.flatMap(block =>
    block.rooms.map(room => ({ ...room, blockName: block.name }))
  );

  // Estado para paginación
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedRoomForSidebar, setSelectedRoomForSidebar] = React.useState<Room | null>(null);

  // Calcular habitaciones a mostrar en la página actual
  const paginatedRooms = allRooms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handle row click to open sidebar
  const handleRowClick = (room: Room) => {
    setSelectedRoomForSidebar(room);
    setIsSidebarOpen(true);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedRoomForSidebar(null);
  };

  // Handle sidebar refresh
  const handleSidebarRefresh = () => {
    // You can add refresh logic here if needed
    // For now, just close the sidebar
    handleSidebarClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <div className="flex justify-between mb-5 gap-2">
        <Typography variant="h5" fontWeight={600} color="black">Habitaciones</Typography>
        {showBackToBlocksButton && (
          <button onClick={onBackToBlocks} style={{ background: '#e0e0e0', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>
            Volver a Pabellones
          </button>
        )}
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Habitación</TableCell>
              <TableCell>Total de camas</TableCell>
              <TableCell>Pabellón</TableCell>
              <TableCell>Estándar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                    <span style={{ color: '#888' }}>No se encontraron datos</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRooms.map((room) => (
                <TableRow
                  key={room.id}
                  hover
                  onClick={() => handleRowClick(room)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{room.roomNumber}{room.doorLockId ? <MeetingRoomIcon sx={{ fontSize: 16, color: 'primary.main', verticalAlign: 'top', ml: 0.5 }} /> : null}</TableCell>
                  <TableCell>{room.beds}</TableCell>
                  <TableCell>{room.blockName}</TableCell>
                  <TableCell>{tagRoleMap[room.tag] || 'Sin Estándar'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={allRooms.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </div>
      </TableContainer>

      {/* Room Detail Sidebar */}
      <RoomDetailSidebar
        open={isSidebarOpen}
        onClose={handleSidebarClose}
        roomId={selectedRoomForSidebar?.id || null}
        onRefreshData={handleSidebarRefresh}
      />
    </>
  );
}

export default ListConstructorsCamps;
