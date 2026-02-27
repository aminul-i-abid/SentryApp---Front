import React, {useState,useEffect} from 'react'
import { getTTLogs } from '../auditoryService';
import { Card, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const AuditoryTTLogsTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getTTLogs();
      setData(response.data);
      setLoading(false);
    };

    fetchData();
  }, []);
  
  return (
    <Card>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Habitación</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Nombre</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Telefono</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>PIN</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Fecha</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Creado por</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                  <TableCell colSpan={11} align="center">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                          <span style={{ color: '#888' }}>Cargando datos...</span>
                      </div>
                  </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}

export default AuditoryTTLogsTable