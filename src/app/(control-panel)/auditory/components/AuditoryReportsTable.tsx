import React, { useState, useEffect } from 'react';
import { getReportsLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ReportLogDto, PaginatedReportLogsDto } from '../models/ReportLogDto';

const AuditoryReportsTable = () => {
  const [data, setData] = useState<ReportLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Obtener filtros del Redux store
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getReportsLogs(page + 1, rowsPerPage);
      if (response.succeeded && response.data) {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching reports logs:', error);
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
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Actividad</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Descripción</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mensaje</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Creado por</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
                      Cargando datos...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                    <Typography variant="body2" color="textSecondary">
                      No se encontraron registros
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.activityEnumDescription || row.activityEnum}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.activityEnumDescription || '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}
                      title={row.message || ''}
                    >
                      {row.message || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {row.statusDescription || row.status}
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
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </Box>
      </TableContainer>
    </Card>
  );
};

export default AuditoryReportsTable;