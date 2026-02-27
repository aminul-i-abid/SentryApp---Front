import React, {useState,useEffect} from 'react'
import { Routes, buildRoute } from '@/utils/routesEnum';
import { getCompaniesLogs } from '../auditoryService';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import { CompanyLogDto } from '../models/CompanyLogDto';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const AuditoryCompanyTable = () => {
    const [data, setData] = useState<CompanyLogDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    
    // Obtener filtros del store Redux
    const filters = useSelector((state: RootState) => state.auditoryFilters);
  
    const fetchData = async (pageNumber: number = 1, pageSize: number = 10) => {
        setLoading(true);
        try {
            const response = await getCompaniesLogs(pageNumber, pageSize);
            setData(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching company logs:', error);
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page + 1, rowsPerPage);
    }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta, filters.companyId]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

  return (
    <Card>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <TableContainer>
          <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Compañía</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Mensaje</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Acción</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Estado</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Fecha</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Creado por</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <span style={{ color: '#888' }}>Cargando datos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <span style={{ color: '#888' }}>No hay datos disponibles</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell
                      sx={{
                        fontSize: '0.8rem',
                        cursor: row.companyId ? 'pointer' : 'default',
                        color: row.companyId ? '#0A74DA' : 'inherit',
                        textDecoration: row.companyId ? 'underline' : 'none',
                        textUnderlineOffset: '2px',
                        fontWeight: row.companyId ? 600 : 'inherit',
                        transition: 'color 0.2s',
                      }}
                      onClick={() => {
                        if (row.companyId) {
                          const url = buildRoute(Routes.CONTRACTORS_DETAIL, { id: String(row.companyId) });
                          window.open(url, '_blank');
                        }
                      }}
                    >
                      {row.companyName || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.message || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.activityEnumDescription || row.activityEnum || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.statusDescription || row.status || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {new Date(row.created).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{row.nameCreatedBy || row.createdBy || '-'}</TableCell>
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

export default AuditoryCompanyTable