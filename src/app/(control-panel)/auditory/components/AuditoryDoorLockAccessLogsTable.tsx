import React, { useState, useEffect } from 'react'
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';
import { getDoorLockAccessLogs } from '../auditoryService';
import { DoorLockAccessLogDto } from '../models/DoorLockAccessLogDto';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryDoorLockAccessLogsTable = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [data, setData] = useState<DoorLockAccessLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Obtener filtros del store
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async (pageNumber: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await getDoorLockAccessLogs(pageNumber, pageSize);
      setData(response.data.items || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching door lock access logs:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page + 1, rowsPerPage);
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.roomId, filters.blockId, filters.success]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUserDisplayName = (row: DoorLockAccessLogDto) => {
    if (row.guestInfo) {
      return `${row.guestInfo.guestFirstName} ${row.guestInfo.guestLastName}`;
    }
    return row.username;
  };

  return (
    <>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Habitación</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Resultado</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha de la acción</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>PIN utilizado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box display="flex" flexDirection="column" alignItems="center" padding={4}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2, color: '#888' }}>
                        Cargando datos...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box display="flex" flexDirection="column" alignItems="center" padding={4}>
                      <Typography variant="body2" sx={{ color: '#888' }}>
                        No hay datos disponibles
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell
                      sx={{
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: '#0A74DA',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                        fontWeight: 600,
                        transition: 'color 0.2s',
                      }}
                      onClick={() => {
                        setSelectedRoomId(row.roomId);
                        setSidebarOpen(true);
                      }}
                    >
                      {row.roomName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.recordTypeStr}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          {row.recordTypeFromLockStr}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.accessStatus}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.serverDate}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{getUserDisplayName(row)}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.keyboardPwd}</TableCell>
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
      <RoomDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomId={selectedRoomId}
      />
    </>
  );
};

export default AuditoryDoorLockAccessLogsTable;