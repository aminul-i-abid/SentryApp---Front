import React, { useState, useEffect } from 'react'
import { Routes, buildRoute } from '@/utils/routesEnum';
import { getCampsLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { CampLogDto, PaginatedCampLogsDto } from '../models/CampLogDto';

const AuditoryCampTable = () => {
  const [data, setData] = useState<CampLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Obtener filtros del store Redux
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCampsLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching camp logs:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambian los filtros o la paginación
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.campId]);

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
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <Typography>Cargando datos...</Typography>
        </Box>
      ) : (
        <div>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Campamento</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mensaje</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
                          fontSize: '0.8rem',
                          cursor: row.campId ? 'pointer' : 'default',
                          color: row.campId ? '#0A74DA' : 'inherit',
                          textDecoration: row.campId ? 'underline' : 'none',
                          textUnderlineOffset: '2px',
                          fontWeight: row.campId ? 600 : 500,
                          transition: 'color 0.2s',
                        }}
                        onClick={() => {
                          if (row.campId) {
                            const url = buildRoute(Routes.CAMPS_DETAIL, { id: String(row.campId) });
                            window.open(url, '_blank');
                          }
                        }}
                      >
                        {row.campName || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 300 }}>
                        <Typography variant="body2" noWrap title={row.message || ''}>
                          {row.message || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>
                        <Typography variant="body2">
                          {row.activityEnumDescription || row.activityEnum || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>
                        <Chip
                          label={row.statusDescription || row.status}
                          color={getStatusColor(row.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>
                        <Typography variant="body2">
                          {formatDate(row.created)}
                        </Typography>
                      </TableCell>
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
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            />
          </Box>
        </div>
      )}
    </Card>
  )
}

export default AuditoryCampTable