import React, { useState, useEffect } from 'react'
import { getEmailLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { EmailLogDto } from '../models/EmailLogDto';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryEmailTable = () => {
  const [data, setData] = useState<EmailLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Obtener filtros de Redux
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getEmailLogs(page + 1, rowsPerPage); // API usa 1-based indexing
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching email logs:', error);
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mail</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mensaje</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Creado por</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                    <Typography variant="body2" color="textSecondary">
                      Cargando datos...
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                    <Typography variant="body2" color="textSecondary">
                      No se encontraron registros
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.mail || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.status || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.message || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatDate(row.created)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.nameCreatedBy || row.createdBy || '-'}
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
    </Card>
  )
}

export default AuditoryEmailTable