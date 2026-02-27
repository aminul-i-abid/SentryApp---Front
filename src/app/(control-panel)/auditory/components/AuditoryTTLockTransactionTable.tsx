import React, { useState, useEffect } from 'react';
import ReserveDetailSidebar from '@/app/(control-panel)/reserve/component/ReserveDetailSidebar';
import { useSelector } from 'react-redux';
import { getTTLockTransactionsLogs } from '../auditoryService';
import { TtlockTransactionLogDto } from '../models/TtlockTransactionLogDto';
import { RootState } from '@/store/store';
import { 
  Box, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow,
  Typography,
  Alert
} from '@mui/material';

const AuditoryTTLockTransactionTable = () => {
  const [data, setData] = useState<TtlockTransactionLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  // Obtener filtros del store
  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTTLockTransactionsLogs(page + 1, rowsPerPage);
      
      if (response.succeeded && response.data) {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.message?.join(', ') || 'Error al cargar los datos');
        setData([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setData([]);
      setTotalCount(0);
      console.error('Error fetching TTLock transaction logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambia la página, tamaño de página o filtros
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta]);

  // Reiniciar a la primera página cuando cambian los filtros
  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [filters.fechaDesde, filters.fechaHasta]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES');
    } catch {
      return dateString;
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(null);
  return (
    <>
      <Card>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Reserva</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Mensaje</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>PIN</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Acción</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <Typography variant="body2" color="textSecondary">
                        Cargando datos...
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <Typography variant="body2" color="textSecondary">
                        No se encontraron datos
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.id}</TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.8rem',
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
                          setSidebarOpen(true);
                        }
                      }}
                    >
                      {row.idReservation && row.nameReservation
                        ? `${row.idReservation} - ${row.nameReservation}`
                        : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {row.statusDescription || row.status || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={row.message || '-'}
                      >
                        {row.message || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {row.pin || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {row.activityEnumDescription || row.activityEnum || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {formatDate(row.created)}
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
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        reserveId={selectedReserveId}
      />
    </>
  );
};

export default AuditoryTTLockTransactionTable;