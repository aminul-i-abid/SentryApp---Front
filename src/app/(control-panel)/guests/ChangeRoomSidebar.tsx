import React, { useMemo, useRef, useState } from 'react'
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
    Paper,
    TableContainer,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { getRoomsByCompanyAndJobTitle } from '../room/roomService'
import { validateRoomChanges } from '../reserve/reserveService'
import { useSnackbar } from 'notistack'

type GuestRow = {
	id: number
	guid?: string
	guest: { firstName?: string; lastName?: string }
	roomNumber: string
	checkIn?: string
	checkOut?: string
	jobTitleId: number
	companyId: number
}

type ValidationErrorItem = { 
    firstName?: string; 
    lastName?: string; 
    checkIn?: string; 
    checkOut?: string; 
    message?: string 
}

interface ChangeRoomSidebarProps {
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

function formatDateForDisplay(value?: string): string {
	if (!value) return ''
	try {
		const d = new Date(value)
		if (Number.isNaN(d.getTime())) return ''
		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')
		return `${day}/${month}/${year}`
	} catch {
		return ''
	}
}

const ChangeRoomSidebar: React.FC<ChangeRoomSidebarProps> = ({ open, onClose, rows }) => {
    const drawerPaperRef = useRef<HTMLDivElement | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedRooms, setSelectedRooms] = useState<Record<number, { roomId: number; roomNumber: string }>>({})
    const [availableRooms, setAvailableRooms] = useState<Record<number, any[]>>({})
    const [loadingRooms, setLoadingRooms] = useState<Record<number, boolean>>({})
    const [validationErrors, setValidationErrors] = useState<ValidationErrorItem[]>([])
    const [openValidationModal, setOpenValidationModal] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

	const uniqueTitle = useMemo(() => `Cambiar habitaciones de reservas seleccionadas (${rows.length})`, [rows.length])

    // Función para limpiar todas las variables de estado
    const clearState = () => {
        setSelectedRooms({})
        setAvailableRooms({})
        setLoadingRooms({})
        setValidationErrors([])
        setOpenValidationModal(false)
        setIsSaving(false)
    }

    // Cargar habitaciones disponibles para todas las filas cuando se abre el sidebar
    React.useEffect(() => {
        if (open && rows.length > 0) {
            rows.forEach(row => {
                fetchRoomsByCompanyAndJobTitle(row)
            })
        }
    }, [open, rows])

    // Limpiar estado cuando se cierre el sidebar
    React.useEffect(() => {
        if (!open) {
            clearState()
        }
    }, [open])

    const fetchRoomsByCompanyAndJobTitle = async (row: GuestRow) => {
        if (availableRooms[row.id]) return // Ya se cargaron
        
        setLoadingRooms(prev => ({ ...prev, [row.id]: true }))
        try {
            const response = await getRoomsByCompanyAndJobTitle(
                row.companyId,
                row.jobTitleId.toString()
            )
            if (response.succeeded && response.data) {
                setAvailableRooms(prev => ({ ...prev, [row.id]: response.data }))
            } else {
                setAvailableRooms(prev => ({ ...prev, [row.id]: [] }))
            }
        } catch (error) {
            console.error('Error fetching available rooms:', error)
            setAvailableRooms(prev => ({ ...prev, [row.id]: [] }))
        } finally {
            setLoadingRooms(prev => ({ ...prev, [row.id]: false }))
        }
    }

    const handleRoomChange = (reservationId: number, roomId: number, roomNumber: string) => {
        setSelectedRooms(prev => ({ ...prev, [reservationId]: { roomId, roomNumber } }))
    }

    // Verificar si todas las reservas tienen habitación seleccionada
    const allReservationsHaveRoom = useMemo(() => {
        return rows.length > 0 && rows.every(row => selectedRooms[row.id])
    }, [rows, selectedRooms])

    const handleSave = async () => {
        if (isSaving || !allReservationsHaveRoom) return
        
        setIsSaving(true)
        try {
            // Preparar datos para la API
            const roomChangeItems = rows.map(row => ({
                reservationId: row.id,
                newRoomId: selectedRooms[row.id].roomId
            }))

            // Llamar al endpoint de validación
            const response = await validateRoomChanges(roomChangeItems)
            
            if (response.succeeded) {
                console.log('Cambios de habitación validados exitosamente:', response.data)
                enqueueSnackbar('Se están realizando los cambios de habitación con éxito', { variant: 'success' })
                clearState()
                onClose()
            } else {
                console.error('Error al validar cambios de habitación:', response.message)
                // Verificar si hay errores de validación en la respuesta
                const apiValidationErrorsRaw = (response as any)?.data?.ValidationErrors || (response as any)?.data?.validationErrors || (response as any)?.data;
                if (Array.isArray(apiValidationErrorsRaw) && apiValidationErrorsRaw.length > 0) {
                    const normalized: ValidationErrorItem[] = apiValidationErrorsRaw.map((e: any) => ({
                        firstName: e?.firstName ?? e?.FirstName ?? '',
                        lastName: e?.lastName ?? e?.LastName ?? '',
                        checkIn: e?.checkIn ?? e?.CheckIn ?? '',
                        checkOut: e?.checkOut ?? e?.CheckOut ?? '',
                        message: e?.message ?? e?.Message ?? e?.ErrorReason ?? e?.errorReason ?? ''
                    }));
                    setValidationErrors(normalized);
                    setOpenValidationModal(true);
                    return;
                }
                // Si no hay errores específicos, mostrar mensaje general
                console.error('Error general:', response.message);
            }
        } catch (e) {
            console.error('Error al cambiar habitaciones:', e)
            // Aquí podrías mostrar un mensaje de error
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
							onClick={handleSave}
							disabled={isSaving || !allReservationsHaveRoom}
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
					<TableContainer component={Paper} sx={{ bgcolor: 'white' }} elevation={0}>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID Reserva</TableCell>
									<TableCell>Huésped</TableCell>
									<TableCell>Habitación Actual</TableCell>
									<TableCell>Nueva Habitación</TableCell>
									<TableCell>Check In</TableCell>
									<TableCell>Check Out</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} align="center">No hay reservas seleccionadas</TableCell>
									</TableRow>
								) : (
									rows.map((row, idx) => (
										<TableRow key={`${row.id}-${idx}`}>
											<TableCell>{row.id}</TableCell>
											<TableCell>{`${row.guest?.firstName || ''} ${row.guest?.lastName || ''}`.trim()}</TableCell>
											<TableCell>{row.roomNumber}</TableCell>
											<TableCell>
												<FormControl size="small" fullWidth>
													<InputLabel>Seleccionar</InputLabel>
													<Select
														value={selectedRooms[row.id]?.roomNumber || ''}
														onChange={(e) => {
															const selectedRoom = availableRooms[row.id]?.find(room => room.roomNumber === e.target.value)
															if (selectedRoom) {
																handleRoomChange(row.id, selectedRoom.id, selectedRoom.roomNumber)
															}
														}}
														onOpen={() => fetchRoomsByCompanyAndJobTitle(row)}
														label="Seleccionar"
														disabled={loadingRooms[row.id]}
													>
														<MenuItem value="">
															<em>Seleccionar habitación</em>
														</MenuItem>
														{availableRooms[row.id]?.map((room) => (
															<MenuItem key={room.id} value={room.roomNumber}>
																{room.roomNumber}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											</TableCell>
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
		
		<Dialog open={openValidationModal} onClose={() => setOpenValidationModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Errores de validación en cambios de habitación</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper} sx={{ backgroundColor: 'white' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Apellido</TableCell>
                                <TableCell>Check In</TableCell>
                                <TableCell>Check Out</TableCell>
                                <TableCell>Motivo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {validationErrors.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{item.firstName || ''}</TableCell>
                                    <TableCell>{item.lastName || ''}</TableCell>
                                    <TableCell>{formatDateForDisplay(item.checkIn)}</TableCell>
                                    <TableCell>{formatDateForDisplay(item.checkOut)}</TableCell>
                                    <TableCell>{item.message || ''}</TableCell>
                                </TableRow>
                            ))}
                            {validationErrors.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">Sin datos</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenValidationModal(false)} variant="contained" color="primary">Cerrar</Button>
            </DialogActions>
        </Dialog>
		</>
	)
}

export default ChangeRoomSidebar
