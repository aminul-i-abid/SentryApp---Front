import React, {useState,useEffect} from 'react'
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';
import { getRoomDisabledStatesLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { RoomDisabledHistoryDto } from '../models/RoomDisabledHistoryDto';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryRoomDisabledHistoryTable = () => {
  const [data, setData] = useState<RoomDisabledHistoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Obtener filtros del store
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRoomDisabledStatesLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching room disabled history:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.roomId]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  return (
    <>
      <Card>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Habitacion</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Comentarios</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Deshabilitada</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Fecha</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Creado por</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                          <span style={{ color: '#888' }}>
                            {loading ? 'Cargando datos...' : 'No se encontraron registros'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row) => (
                      <TableRow key={row.id}>
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
                          {row.roomNumber || `Habitación ${row.roomId}`}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                          {row.comments || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                          {row.action}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                          {formatDate(row.date)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                          {row.nameCreatedBy || row.createdBy || '-'}
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
          </div>
        )}
      </Card>
      <RoomDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomId={selectedRoomId}
      />
    </>
  );
}

export default AuditoryRoomDisabledHistoryTable