import React, { useState, useEffect } from 'react'
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';
import { getDoorLockRoomHistoryLogs } from '../auditoryService';
import { DoorLockRoomHistoryDto } from '../models/DoorLockRoomHistoryDto';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryDoorLockRoomHistoryTable = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [data, setData] = useState<DoorLockRoomHistoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Obtener filtros de fecha del store
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async (pageNumber: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await getDoorLockRoomHistoryLogs(pageNumber, pageSize);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching door lock room history logs:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page + 1, rowsPerPage);
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.roomId]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

    return (
      <>
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Habitación</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Chapa</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Comentarios</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Usuario</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Creado por</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha creación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
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
                    <TableCell colSpan={8} align="center">
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
                          cursor: row.roomId ? 'pointer' : 'default',
                          color: row.roomId ? '#0A74DA' : 'inherit',
                          textDecoration: row.roomId ? 'underline' : 'none',
                          textUnderlineOffset: '2px',
                          fontWeight: row.roomId ? 600 : 'inherit',
                          transition: 'color 0.2s',
                        }}
                        onClick={() => {
                          if (row.roomId) {
                            setSelectedRoomId(row.roomId);
                            setSidebarOpen(true);
                          }
                        }}
                      >
                        {row.roomNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.doorLockId}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.comments || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.action}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{formatDateTime(row.date)}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.userName || row.user || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{row.nameCreatedBy || row.createdBy || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{formatDateTime(row.created)}</TableCell>
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
    }

export default AuditoryDoorLockRoomHistoryTable