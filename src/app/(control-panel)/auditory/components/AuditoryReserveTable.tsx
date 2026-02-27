import React, { useState, useEffect } from 'react'
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';
import ReserveDetailSidebar from '@/app/(control-panel)/reserve/component/ReserveDetailSidebar';
import { getReservationsLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, CircularProgress, Alert, Chip, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ReserveLogDto, PaginatedReserveLogsDto } from '../models/ReserveLogDto';
import { Routes, buildRoute } from '@/utils/routesEnum';

const AuditoryReserveTable = () => {
  const [roomSidebarOpen, setRoomSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [reserveSidebarOpen, setReserveSidebarOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(null);
  const [data, setData] = useState<ReserveLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Obtener filtros del estado global
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async (pageNumber: number = 1, pageSize: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReservationsLogs(pageNumber, pageSize);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (err: any) {
      setError('Error al cargar los datos de auditoría de reservas');
      console.error('Error fetching reserve logs:', err);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getActivityColor = (activity: string | null) => {
    switch (activity?.toLowerCase()) {
      case 'create':
      case 'created':
        return 'success';
      case 'update':
      case 'updated':
        return 'warning';
      case 'delete':
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

    return (
      <>
        <Card>
          {error && (
            <Alert severity="error" sx={{ margin: 2 }}>
              {error}
            </Alert>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Bulk ID</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Reserva</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Habitación Asignada</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Habitación</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Check In</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Check Out</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Creado por</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box display="flex" flexDirection="column" alignItems="center" padding="40px 0">
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                          Cargando datos...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box display="flex" flexDirection="column" alignItems="center" padding="40px 0">
                        <Typography variant="body2" color="textSecondary">
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
                          fontSize: '0.75rem',
                          cursor: row.guid && row.idBulkReservation ? 'pointer' : 'default',
                          color: row.guid && row.idBulkReservation ? '#0A74DA' : 'inherit',
                          textDecoration: row.guid && row.idBulkReservation ? 'underline' : 'none',
                          textUnderlineOffset: '2px',
                          fontWeight: row.guid && row.idBulkReservation ? 600 : 'inherit',
                          transition: 'color 0.2s',
                        }}
                        onClick={() => {
                          if (row.guid && row.idBulkReservation) {
                            const url = buildRoute(Routes.RESERVE_BULK, { id: String(row.idBulkReservation) });
                            window.open(url, '_blank');
                          }
                        }}
                      >
                        {row.guid || '-'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.75rem',
                          cursor: row.idReservation ? 'pointer' : 'default',
                          color: row.idReservation ? '#0A74DA' : 'inherit',
                          textDecoration: row.idReservation ? 'underline' : 'none',
                          textUnderlineOffset: '2px',
                          fontWeight: row.idReservation ? 600 : 'inherit',
                          transition: 'color 0.2s',
                        }}
                        onClick={() => {
                          if (row.idReservation) {
                            setSelectedReserveId(row.idReservation);
                            setReserveSidebarOpen(true);
                          }
                        }}
                      >
                         {row.idReservation} - {row.nameGuest}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
                        <Chip 
                          label={row.roomAssigned ? 'Sí' : 'No'} 
                          color={row.roomAssigned ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.75rem',
                          cursor: row.idRoom ? 'pointer' : 'default',
                          color: row.idRoom ? '#0A74DA' : 'inherit',
                          textDecoration: row.idRoom ? 'underline' : 'none',
                          textUnderlineOffset: '2px',
                          fontWeight: row.idRoom ? 600 : 'inherit',
                          transition: 'color 0.2s',
                        }}
                        onClick={() => {
                          if (row.idRoom) {
                            setSelectedRoomId(row.idRoom);
                            setRoomSidebarOpen(true);
                          }
                        }}
                      >
                        {row.roomNumber || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDateOnly(row.checkIn)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDateOnly(row.checkOut)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        <Chip 
                          label={row.activityEnumDescription || 'N/A'} 
                          color={getActivityColor(row.activityEnumDescription)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(row.created)}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{row.nameCreatedBy || row.createdBy || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
        </Card>
        <RoomDetailSidebar
          open={roomSidebarOpen}
          onClose={() => setRoomSidebarOpen(false)}
          roomId={selectedRoomId}
        />
        <ReserveDetailSidebar
          open={reserveSidebarOpen}
          onClose={() => setReserveSidebarOpen(false)}
          reserveId={selectedReserveId}
        />
      </>
    );
}

export default AuditoryReserveTable