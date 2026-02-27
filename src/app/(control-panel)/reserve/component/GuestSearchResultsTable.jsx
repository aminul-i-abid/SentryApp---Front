import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, CircularProgress
} from '@mui/material';

const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function GuestSearchResultsTable({ results, page, rowsPerPage, totalCount, onPageChange, onRowsPerPageChange, onRowClick, loading }) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Reserva</TableCell>
                        <TableCell>Huésped</TableCell>
                        <TableCell>Habitación</TableCell>
                        <TableCell>Fecha Creación</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Estado</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <CircularProgress size={32} />
                            </TableCell>
                        </TableRow>
                    ) : results.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">No se encontraron resultados</TableCell>
                        </TableRow>
                    ) : (
                        results.map((row) => (
                            <TableRow
                                key={row.id}
                                hover
                                style={{ cursor: 'pointer' }}
                                onClick={() => onRowClick(row.id)}
                            >
                                <TableCell>{row.guid}</TableCell>
                                <TableCell>
                                    {row.guests && row.guests.length > 0
                                        ? `${row.guests[0].firstName} ${row.guests[0].lastName}`
                                        : '-'}
                                </TableCell>
                                <TableCell>{row.roomNumber}</TableCell>
                                <TableCell>
                                    {row.created ? formatDate(new Date(row.created)) : '-'}
                                </TableCell>
                                <TableCell>
                                    {row.checkIn ? formatDate(new Date(row.checkIn)) : '-'}
                                </TableCell>
                                <TableCell>
                                    {row.checkOut ? formatDate(new Date(row.checkOut)) : '-'}
                                </TableCell>
                                <TableCell>
                                    {row.status === 0 ? 'Activa' : row.status === 1 ? 'Cancelada' : '-'}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
        </TableContainer>
    );
}

export default GuestSearchResultsTable;
