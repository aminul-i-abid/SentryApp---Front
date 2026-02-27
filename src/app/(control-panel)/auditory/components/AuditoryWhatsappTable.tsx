import React, { useState, useEffect } from 'react'
import ReserveDetailSidebar from '@/app/(control-panel)/reserve/component/ReserveDetailSidebar';
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';
import { getWhatsappLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { PaginatedWhatsappLogsDto } from '../models/PaginatedWhatsappLogsDto';
import { WhatsappLogDto } from '../models/WhatsappLogDto';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryWhatsappTable = () => {
  const [data, setData] = useState<WhatsappLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getWhatsappLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching WhatsApp logs:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.roomId]);

  const [reserveSidebarOpen, setReserveSidebarOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(null);
  const [roomSidebarOpen, setRoomSidebarOpen] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);
  return (
    <>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.8rem' }}>Reserva</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>Teléfono</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>Habitación</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>Estado</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>Mensaje</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>Fecha Acción</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>Creado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <span style={{ color: '#888' }}>Cargando datos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <span style={{ color: '#888' }}>No hay datos disponibles</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((log, index) => (
                  <TableRow key={log.id || index}>
                    <TableCell
                      sx={{
                        fontSize: '0.8rem',
                        cursor: log.reservationId ? 'pointer' : 'default',
                        color: log.reservationId ? '#0A74DA' : 'inherit',
                        textDecoration: log.reservationId ? 'underline' : 'none',
                        textUnderlineOffset: '2px',
                        fontWeight: log.reservationId ? 600 : 'inherit',
                        transition: 'color 0.2s',
                      }}
                      onClick={() => {
                        if (log.reservationId) {
                          setSelectedReserveId(log.reservationId);
                          setReserveSidebarOpen(true);
                        }
                      }}
                    >
                      {log.reservationId + " - " + log.nameReservation || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {log.phoneNumber || '-'}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.8rem',
                        cursor: log.roomId ? 'pointer' : 'default',
                        color: log.roomId ? '#0A74DA' : 'inherit',
                        textDecoration: log.roomId ? 'underline' : 'none',
                        textUnderlineOffset: '2px',
                        fontWeight: log.roomId ? 600 : 'inherit',
                        transition: 'color 0.2s',
                      }}
                      onClick={() => {
                        if (log.roomId) {
                          setSelectedRoomNumber(log.roomId.toString());
                          setRoomSidebarOpen(true);
                        }
                      }}
                    >
                      {log.roomNumber || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {log.status}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200 }}>
                      {log.message ? (
                        <span title={log.message}>
                          {log.message.length > 50 ? `${log.message.substring(0, 50)}...` : log.message}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {new Date(log.actionDateTime).toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {log.nameCreatedBy || log.createdBy || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" alignItems="center" width="100%" mt={1}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            />
          </Box>
        </TableContainer>
      </Card>
      <ReserveDetailSidebar
        open={reserveSidebarOpen}
        onClose={() => setReserveSidebarOpen(false)}
        reserveId={selectedReserveId}
      />
      <RoomDetailSidebar
        open={roomSidebarOpen}
        onClose={() => setRoomSidebarOpen(false)}
        roomId={selectedRoomNumber ? Number(selectedRoomNumber) : null}
      />
    </>
  );
}

export default AuditoryWhatsappTable