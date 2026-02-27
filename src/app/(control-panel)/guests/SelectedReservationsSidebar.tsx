import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Drawer,
    Box,
    IconButton,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Paper,
    TableContainer,
    Button,
    Alert,
    Portal
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useSnackbar } from 'notistack'
import { validateDateChanges } from '../reserve/reserveService'
import { ConfirmationModal } from '@/components/ConfirmationModal';

type GuestRow = {
	id: number
	guid?: string
	guest: { firstName?: string; lastName?: string }
	roomNumber: string
	checkIn?: string
	checkOut?: string
}

interface SelectedReservationsSidebarProps {
	open: boolean
	onClose: () => void
	rows: GuestRow[]
}

function formatDateForInput(value?: string): string {
	if (!value) return ''
	try {
		const d = new Date(value)
		if (Number.isNaN(d.getTime())) return ''
		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	} catch {
		return ''
	}
}

function toUtcNoonIso(dateStr: string, field: 'checkIn' | 'checkOut'): string {
	try {
		const [yearStr, monthStr, dayStr] = dateStr.split('-')
		const year = Number(yearStr)
		const month = Number(monthStr)
		const day = Number(dayStr)
		// Set hour depending on field: 5 AM for checkIn, 23 PM for checkOut
		const hour = field === 'checkIn' ? 5 : 23
		const iso = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0)).toISOString()
		return iso
	} catch {
		// Fallback: use provided date string with appropriate hour
		const hour = field === 'checkIn' ? '05' : '23'
		return `${dateStr}T${hour}:00:00.000Z`
	}
}

const SelectedReservationsSidebar: React.FC<SelectedReservationsSidebarProps> = ({ open, onClose, rows }) => {
    const { enqueueSnackbar } = useSnackbar()
    const [editedRows, setEditedRows] = useState<GuestRow[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [globalCheckIn, setGlobalCheckIn] = useState<string>('')
    const [globalCheckOut, setGlobalCheckOut] = useState<string>('')
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const drawerPaperRef = useRef<HTMLDivElement | null>(null)
  	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	useEffect(() => {
		if (open) {
			setEditedRows(rows.map(r => ({ ...r })))

		// Convertir check-ins y check-outs a timestamps
		const checkIns = rows.map((r) => new Date(r.checkIn).getTime());
		const checkOuts = rows.map((r) => new Date(r.checkOut).getTime());

		// Selecciona primer check-in y último check-out
		const earliest = new Date(Math.min(...checkIns));
		const latest = new Date(Math.max(...checkOuts));

		setGlobalCheckIn(formatDateForInput(earliest.toISOString()));
		setGlobalCheckOut(formatDateForInput(latest.toISOString()));
		}
	}, [open, rows])

	const uniqueTitle = useMemo(() => `Editar reservas seleccionadas (${rows.length})`, [rows.length])


    const handleSave = async () => {
        if (isSaving) return
        if (!globalCheckIn || !globalCheckOut) {
            enqueueSnackbar('Seleccione Check In y Check Out generales', { variant: 'info', anchorOrigin: { vertical: 'top', horizontal: 'center' } })
            return
        }
		const items = editedRows.map(r => ({
			reservationId: r.id,
			newCheckIn: toUtcNoonIso(globalCheckIn, 'checkIn'),
			newCheckOut: toUtcNoonIso(globalCheckOut, 'checkOut')
		}))
        setIsSaving(true)
        try {
            const resp = await validateDateChanges(items)
            if (resp.succeeded) {
                enqueueSnackbar('Cambios validados correctamente', { variant: 'success' })
                onClose()
            } else {
                const msg = resp.errors?.[0] || resp.message?.[0] || 'Error al validar cambios'
                setErrorMessage(msg || 'No se pudo implementar los cambios')
                setErrorOpen(true)
            }
        } catch (e) {
            setErrorMessage('No se pudo implementar los cambios')
            setErrorOpen(true)
        } finally {
            setIsSaving(false)
        }
    }

	return (
		<>
			<Drawer
				anchor="right"
				open={open}
				onClose={onClose}
				sx={{
					'& .MuiDrawer-paper': {
						width: { xs: '100%', sm: '70vw', md: '70vw' },
						maxWidth: '1000px',
						boxShadow: '-4px 0 8px rgba(0,0,0,0.1)',
						bgcolor: '#f5f5f5'
					}
				}}
				PaperProps={{ ref: drawerPaperRef }}
			>
				<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					{/* Header */}
					<Box sx={{
						background: 'linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(244, 244, 244) 100%)',
						color: 'black',
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
					}}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
							{uniqueTitle}
						</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Button
									variant="contained"
									size="small"
									onClick={() => setIsConfirmModalOpen(true)} // open modal
									disabled={isSaving}
									sx={{
										bgcolor: '#1976d2',
										color: 'white',
										'&:hover': {
											bgcolor: '#1565c0'
										},
										'&.Mui-disabled': {
											bgcolor: '#90caf9'
										}
									}}
								>
									Guardar
								</Button>
                            <IconButton onClick={onClose} size="small" sx={{ color: 'black' }}>
                                <CloseIcon />
                            </IconButton>
						</Box>
					</Box>

					{/* Content */}
					<Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                        {/* Fechas globales */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: 6 }}>
                            <TextField
                                label="Check In"
                                type="date"
                                size="small"
                                value={globalCheckIn}
                                onChange={(e) => setGlobalCheckIn(e.target.value)}
                                InputLabelProps={{ shrink: true }}
								sx={{ paddingRight: 4 }}
                                inputProps={{
                                    min: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    max: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                }}
                            />
                            <TextField
                                label="Check Out"
                                type="date"
                                size="small"
                                value={globalCheckOut}
                                onChange={(e) => setGlobalCheckOut(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    max: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                }}
                            />
                        </Box>
						<TableContainer component={Paper} sx={{ bgcolor: 'white' }} elevation={0}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>ID Reserva</TableCell>
										<TableCell>Huésped</TableCell>
										<TableCell>Habitación</TableCell>
										<TableCell>Check In</TableCell>
										<TableCell>Check Out</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{editedRows.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} align="center">No hay reservas seleccionadas</TableCell>
										</TableRow>
									) : (
										editedRows.map((row, idx) => (
											<TableRow key={`${row.id}-${idx}`}>
												<TableCell>{row.id}</TableCell>
												<TableCell>{`${row.guest?.firstName || ''} ${row.guest?.lastName || ''}`.trim()}</TableCell>
												<TableCell>{row.roomNumber}</TableCell>
												<TableCell>{row.checkIn ? formatDateForInput(row.checkIn) : '-'}</TableCell>
												<TableCell>{row.checkOut ? formatDateForInput(row.checkOut) : '-'}</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</Box>
			</Drawer>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={handleSave}
				title="Confirmar cambios"
				message="¿Estás seguro que quieres cambiar las fechas de estas reservas?"
				type="add"
			/>

            <Portal>
                {errorOpen && (
                    <Box
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            left: 24,
                            zIndex: 200000,
                            maxWidth: 360
                        }}
                    >
                        <Alert
                            severity="error"
                            variant="filled"
                            onClose={() => setErrorOpen(false)}
                            sx={{ width: '100%' }}
                        >
                            {'No se pudo implementar los cambios'}
                        </Alert>
                    </Box>
                )}
            </Portal>
        </>
    )
}

export default SelectedReservationsSidebar


