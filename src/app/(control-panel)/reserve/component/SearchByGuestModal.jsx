import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GuestSearchResultsTable from './GuestSearchResultsTable';
import { searchByGuest } from '../reserveService';
import ReserveDetailModal from './ReserveDetailModal';

function SearchByGuestModal({ open, onClose }) {
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedReserveId, setSelectedReserveId] = useState(null);

    const handleSearch = async () => {
        if (!searchValue.trim()) return;
        setLoading(true);
        setSearched(true);
        const response = await searchByGuest(searchValue, page + 1, rowsPerPage);
        if (response.succeeded) {
            setResults(response.data);
            setTotalCount(response.totalCount || response.data.length);
        } else {
            setResults([]);
            setTotalCount(0);
        }
        setLoading(false);
    };

    const handlePageChange = async (event, newPage) => {
        setPage(newPage);
        setLoading(true);
        const response = await searchByGuest(searchValue, newPage + 1, rowsPerPage);
        if (response.succeeded) {
            setResults(response.data);
            setTotalCount(response.totalCount || response.data.length);
        } else {
            setResults([]);
            setTotalCount(0);
        }
        setLoading(false);
    };

    const handleRowsPerPageChange = async (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
        setLoading(true);
        const response = await searchByGuest(searchValue, 1, newRowsPerPage);
        if (response.succeeded) {
            setResults(response.data);
            setTotalCount(response.totalCount || response.data.length);
        } else {
            setResults([]);
            setTotalCount(0);
        }
        setLoading(false);
    };

    const handleRowClick = (id) => {
        setSelectedReserveId(id);
    };

    const handleClose = () => {
        setSearchValue('');
        setResults([]);
        setPage(0);
        setRowsPerPage(10);
        setTotalCount(0);
        setLoading(false);
        setSearched(false);
        setSelectedReserveId(null);
        onClose();
    };

    return (
        <>
            <Dialog open={open && !selectedReserveId} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar por Nombre, Apellido o RUT..."
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            disabled={loading || !searchValue.trim()}
                            sx={{ minWidth: 120 }}
                        >
                            Buscar
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <GuestSearchResultsTable
                        results={results}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalCount={totalCount}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        onRowClick={handleRowClick}
                        loading={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" variant="outlined">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Modal de detalle de reserva */}
            <ReserveDetailModal
                open={!!selectedReserveId}
                onClose={() => setSelectedReserveId(null)}
                reserveId={selectedReserveId}
            />
        </>
    );
}

export default SearchByGuestModal;
