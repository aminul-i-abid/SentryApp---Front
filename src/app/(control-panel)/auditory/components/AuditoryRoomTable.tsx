import React, { useState, useEffect } from 'react'
import RoomDetailSidebar from '@/app/(control-panel)/room/components/RoomDetailSidebar';
import { Routes, buildRoute } from '@/utils/routesEnum';
import { getRoomLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, Chip } from '@mui/material';
import { RoomLogDto, PaginatedRoomLogsDto } from '../models/RoomLogDto';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryRoomTable = () => {
  const [data, setData] = useState<RoomLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Obtenemos los filtros del estado global
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRoomLogs(page + 1, rowsPerPage);
      if (response.succeeded && response.data) {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching room logs:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.roomId, filters.blockId]);

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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'error';     // Fallido
      case 1: return 'success';   // Exitoso
      case 2: return 'warning';   // Pendiente
      default: return 'default';
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  return (
    <>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Habitación</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mensaje</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Bloque</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Creado por</TableCell>
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
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell
                      sx={{
                        fontSize: '0.85rem',
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
                      {row.roomNumber || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={row.message || ''}>
                        {row.message || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.85rem',
                        cursor: row.blockId ? 'pointer' : 'default',
                        color: row.blockId ? '#0A74DA' : 'inherit',
                        textDecoration: row.blockId ? 'underline' : 'none',
                        textUnderlineOffset: '2px',
                        fontWeight: row.blockId ? 600 : 'inherit',
                        transition: 'color 0.2s',
                      }}
                      onClick={() => {
                        if (row.blockId) {
                          const url = buildRoute(Routes.CAMPS_BLOCK_ROOM, { id: String(row.blockId) });
                          window.open(url, '_blank');
                        }
                      }}
                    >
                      {row.blockName || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      <Chip 
                        label={row.statusDescription || 'Sin estado'} 
                        color={getStatusColor(row.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {row.activityEnumDescription || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {formatDate(row.created)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
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
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
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

export default AuditoryRoomTable