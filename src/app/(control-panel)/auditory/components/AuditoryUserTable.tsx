import React, { useState, useEffect } from 'react'
import { getUserLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { UserLogDto } from '../models/UserLogDto';
import { PaginatedUserLogsDto } from '../models/PaginatedUserLogsDto';

const AuditoryUserTable = () => {
  const [data, setData] = useState<UserLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Obtener filtros del store
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getUserLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching user logs:', error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta]);

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
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Usuario</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mensaje</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Creado por</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                        <span style={{ color: '#888' }}>No hay datos disponibles</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {row.userName || row.userId}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {row.activityEnumDescription || row.activityEnum}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {row.statusDescription || row.status}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {row.message || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {formatDate(row.created)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
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
  )
}

export default AuditoryUserTable