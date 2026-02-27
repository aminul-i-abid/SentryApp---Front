import FusePageSimple from "@fuse/core/FusePageSimple"
import { useTranslation } from "react-i18next"
import { styled } from "@mui/material/styles"
import { useEffect, useState, useCallback } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableSortLabel,
    Checkbox,
    Box,
    Toolbar,
    Tooltip,
    Badge,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import AddIcon from "@mui/icons-material/Add"
import DownloadIcon from "@mui/icons-material/Download"
import AddReservationModal from "./component/AddReservationModal"
import { OptionReservation } from "./enum/optionReservation"
import { getReserves, createBulkReservation, cancelReserve, cancelBulkReservations, downloadReservesExcel, resetMultiplePinsTtlock } from "./reserveService"
import { ReserveResponse } from "./models/ReserveResponse"
import React from "react"
import { ReservationData } from "./component/AddReservationModal"

const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
import { useSnackbar } from "notistack"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import DeleteIcon from "@mui/icons-material/Delete"
import { Routes, buildRoute } from "@/utils/routesEnum"
import { useNavigate, useParams } from "react-router-dom"
import { StatusReservation } from "./enum/statusReservation"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import EditIcon from "@mui/icons-material/Edit"
import CancelIcon from "@mui/icons-material/Cancel"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import { categoryToRoleMap } from "@/app/(control-panel)/tag/enum/RoleTag"
import ReserveDetailSidebar from "./component/ReserveDetailSidebar"
import RoomDetailSidebar from "../room/components/RoomDetailSidebar"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import useAuth from "@fuse/core/FuseAuthProvider/useAuth"
import useUser from "@auth/useUser"
import SelectedReservationsSidebar from "../guests/SelectedReservationsSidebar"
import ChangeRoomSidebar from "../guests/ChangeRoomSidebar"

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
    "& .FusePageSimple-content": {},
    "& .FusePageSimple-sidebarHeader": {},
    "& .FusePageSimple-sidebarContent": {},
}))

type Order = "asc" | "desc"
type OrderBy = "created" | "checkIn" | "checkOut" | "roomNumber"

function ReservesBulk() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [openModal, setOpenModal] = React.useState(false)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = React.useState<number | null>(null)
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(10)
    const [reserves, setReserves] = useState<ReserveResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const { enqueueSnackbar } = useSnackbar()
    const [unassignedGuests, setUnassignedGuests] = useState<any[]>([])
    const [openUnassignedModal, setOpenUnassignedModal] = useState(false)
    const [guid, setGuid] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [order, setOrder] = useState<Order>("asc")
    const [orderBy, setOrderBy] = useState<OrderBy>("roomNumber")
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)
    const [selectedReserveId, setSelectedReserveId] = useState<number | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [reserveToDelete, setReserveToDelete] = useState<ReserveResponse | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<ReserveResponse[]>([])
    const [searchTotalCount, setSearchTotalCount] = useState(0)
    const [roomSidebarOpen, setRoomSidebarOpen] = useState(false)
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
    const { authState } = useAuth()
    const { data: user } = useUser()
    const hasTTLock = user?.modules?.ttlock === true

    // Estados para selección múltiple
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const [selectAll, setSelectAll] = useState(false)
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [isSelectedSidebarOpen, setIsSelectedSidebarOpen] = useState(false)
    const [isResettingPins, setIsResettingPins] = useState(false)
    const [isChangeRoomSidebarOpen, setIsChangeRoomSidebarOpen] = useState(false)

    const isSentryAdmin = authState.user?.role === "Sentry_Admin"
    const isCompanyAdmin = authState.user?.role === "Company_Admin"

    // Cantidad de filas seleccionables (solo Activas)
    const selectableCount = React.useMemo(() => (searchTerm.length >= 5 ? searchResults : reserves).filter((r) => r.status === StatusReservation.ACTIVE).length, [reserves, searchResults, searchTerm])

    const performSearch = useCallback(
        async (searchValue: string) => {
            if (!searchValue || searchValue.length < 5) return

            try {
                setIsSearching(true)
                const response = await getReserves(page + 1, rowsPerPage, parseInt(id), searchValue)

                if (response.succeeded) {
                    setSearchResults(response.data.items)
                    setSearchTotalCount(response.data.totalCount)
                } else {
                    setSearchResults([])
                    setSearchTotalCount(0)
                    enqueueSnackbar("Error en la búsqueda", { variant: "error" })
                }
            } catch (error) {
                console.error("Error searching reserves:", error)
                setSearchResults([])
                setSearchTotalCount(0)
                enqueueSnackbar("Error en la búsqueda", { variant: "error" })
            } finally {
                setIsSearching(false)
            }
        },
        [id, page, rowsPerPage, enqueueSnackbar]
    )

    useEffect(() => {
        fetchReserves()
    }, [page, rowsPerPage])

    // Effect para manejar el debounce de la búsqueda
    useEffect(() => {
        if (searchTerm.length >= 5) {
            const timeoutId = setTimeout(() => {
                performSearch(searchTerm)
            }, 500)

            return () => clearTimeout(timeoutId)
        }
    }, [searchTerm, performSearch])

    const fetchReserves = async () => {
        try {
            setLoading(true)
            const response = await getReserves(page + 1, rowsPerPage, parseInt(id))
            if (response.succeeded) {
                setReserves(response.data.items)
                setTotalCount(response.data.totalCount)
                setGuid(response.data.guid)
                setCompanyName(response.data.companyName)
            }
        } catch (error) {
            console.error("Error fetching reserves:", error)
        } finally {
            setLoading(false)
        }
    };

    // Actualizar título con GUID del bulk
    useEffect(() => {
        if (guid) {
            document.title = `Reservas ${guid} - SentryApp`;
        } else {
            document.title = 'Reservas - SentryApp';
        }
    }, [guid]);
    
    const handleAddReservation = async (type: OptionReservation, data?: ReservationData, file?: File) => {
        if (type === OptionReservation.BULK && file) {
            try {
                // Obtener los valores del formulario de reserva masiva
                const companyId = data?.companyId || 0
                const comments = data?.comments || ""

                // Llamar a la API para crear reservas masivas
                const response = await createBulkReservation(file, companyId, comments)

                if (response.succeeded) {
                    enqueueSnackbar("Reservas creadas exitosamente", { variant: "success" })
                    // Recargar la lista de reservas
                    fetchReserves()

                    // Verificar si hay huéspedes sin asignar
                    if (response.data?.unassignedGuests && response.data.unassignedGuests.length > 0) {
                        setUnassignedGuests(response.data.unassignedGuests)
                        setOpenUnassignedModal(true)
                    }
                } else {
                    enqueueSnackbar(`Error al crear las reservas: ${response.message}`, { variant: "error" })
                }
            } catch (error) {
                console.error("Error creating bulk reservations:", error)
                enqueueSnackbar("Error al crear las reservas", { variant: "error" })
            }
        }
        // Cerrar el modal después de procesar
        setOpenModal(false)
    }

    const handleInfoClick = (id) => {
        setSelectedReserveId(id)
        setIsReserveModalOpen(true)
    }

    const handleCloseReserveModal = () => {
        setIsReserveModalOpen(false)
        setSelectedReserveId(null)
    }

    const handleOpenRoomSidebar = (roomId: number) => {
        setSelectedRoomId(roomId)
        setRoomSidebarOpen(true)
    }

    const handleCloseRoomSidebar = () => {
        setRoomSidebarOpen(false)
        setSelectedRoomId(null)
    }

    const handleDeleteClick = (reserve: ReserveResponse, event: React.MouseEvent) => {
        event.stopPropagation()
        setReserveToDelete(reserve)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!reserveToDelete) return
        try {
            await cancelReserve(reserveToDelete.id, { comments: "Reserva cancelada" })
            enqueueSnackbar("La reserva se canceló correctamente", { variant: "success" })
            fetchReserves()
            setIsDeleteModalOpen(false)
            setReserveToDelete(null)
        } catch (error) {
            enqueueSnackbar("Algo salió mal al cancelar la reserva", { variant: "error" })
            console.error("Error canceling reservation:", error)
        }
    }

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false)
        setReserveToDelete(null)
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchTerm(value)
        setPage(0) // Resetear a la primera página al buscar

        // Si el término de búsqueda tiene menos de 5 caracteres, volver a la vista normal
        if (value.length < 5) {
            setIsSearching(false)
            setSearchResults([])
            setSearchTotalCount(0)
        }
    }

    const clearSearch = () => {
        setSearchTerm("")
        setIsSearching(false)
        setSearchResults([])
        setSearchTotalCount(0)
        setPage(0) // Resetear a la primera página
    }

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
        setAnchorEl(event.currentTarget)
        setSelectedRow(rowId)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedRow(null)
    }

    const handleBackClick = () => {
        window.history.back()
    }

    const handleAction = (action: string) => {
        if (selectedRow) {
            console.log(`Action ${action} for row ${selectedRow}`)
            // TODO: Implement the actual actions
        }
        handleMenuClose()
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleCloseUnassignedModal = () => {
        setOpenUnassignedModal(false)
    }

    const handleRequestSort = (property: OrderBy) => {
        const isAsc = orderBy === property && order === "asc"
        setOrder(isAsc ? "desc" : "asc")
        setOrderBy(property)
    }

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const allSelectable = new Set(sortedReserves.map((reserve, index) => (reserve.status === StatusReservation.ACTIVE ? index : null)).filter((i) => i !== null) as number[])
            setSelectedRows(allSelectable)
            setSelectAll(true)
        } else {
            setSelectedRows(new Set())
            setSelectAll(false)
        }
    }

    const handleSelectRow = (index: number) => {
        const newSelected = new Set(selectedRows)
        if (newSelected.has(index)) {
            newSelected.delete(index)
        } else {
            newSelected.add(index)
        }
        setSelectedRows(newSelected)
        setSelectAll(selectableCount > 0 && newSelected.size === selectableCount)
    }

    const handleCancelBulkReservations = () => {
        if (selectedRows.size === 0) return
        setIsCancelModalOpen(true)
    }

    const handleConfirmCancelBulkReservations = async () => {
        const selectedReserves = Array.from(selectedRows).map((index) => sortedReserves[index])
        const reserveIds = selectedReserves.map((reserve) => reserve.id)

        try {
            const response = await cancelBulkReservations(reserveIds)

            if (response.succeeded) {
                // Después de cancelar exitosamente, limpiar selección y recargar datos
                setSelectedRows(new Set())
                setSelectAll(false)
                await fetchReserves()
                enqueueSnackbar("Se están procesando las cancelaciones de reservas", { variant: "success" })
            } else {
                console.error("Error al cancelar reservas:", response.errors)
                const errorMessage = response.errors?.[0] || response.message?.[0] || "Error al cancelar las reservas"
                enqueueSnackbar(errorMessage, { variant: "error" })
            }
        } catch (error) {
            console.error("Error al cancelar reservas:", error)
            enqueueSnackbar("Error al cancelar las reservas", { variant: "error" })
        }
    }

    const handleResetPinsBulk = async () => {
        if (selectedRows.size === 0 || isResettingPins) return
        setIsResettingPins(true)
        try {
            const selected = Array.from(selectedRows).map((index) => sortedReserves[index]) as any[]
            // Intentar detectar el campo correcto para reservationGuestId en cada fila
            const reservationGuestIds = Array.from(
                new Set(selected.map((r) => r?.reservationGuestId ?? r?.guestId ?? r?.idReservationGuest ?? r?.reservationGuest?.id ?? r?.guest?.id).filter((id: any) => typeof id === "number"))
            )

            if (reservationGuestIds.length === 0) {
                enqueueSnackbar("No hay huéspedes válidos para resetear PIN", { variant: "info" })
                return
            }

            const response = await resetMultiplePinsTtlock(reservationGuestIds)
            if (response.succeeded) {
                enqueueSnackbar("Se están procesando los reseteos de PIN", { variant: "success" })
            } else {
                const errorMessage = response.errors?.[0] || response.message?.[0] || "Error al resetear PINs"
                enqueueSnackbar(errorMessage, { variant: "error" })
            }
        } catch (error) {
            enqueueSnackbar("Error al resetear PINs", { variant: "error" })
        } finally {
            setIsResettingPins(false)
        }
    }

    const handleDownloadExcel = async () => {
        try {
            await downloadReservesExcel(parseInt(id), companyName)
            enqueueSnackbar("Archivo Excel descargado exitosamente", { variant: "success" })
        } catch (error) {
            console.error("Error al descargar Excel:", error)
            enqueueSnackbar("Error al descargar el archivo Excel", { variant: "error" })
        }
    }

    // Sort the reserves array or search results
    const sortedReserves = React.useMemo(() => {
        const dataToSort = searchTerm.length >= 5 ? searchResults : reserves
        return [...dataToSort].sort((a, b) => {
            if (orderBy === "roomNumber") {
                // Para números de habitación, convertir a número para ordenamiento correcto
                const roomA = parseInt(a.roomNumber) || 0
                const roomB = parseInt(b.roomNumber) || 0

                return order === "asc" ? roomA - roomB : roomB - roomA
            } else {
                // Para fechas
                let valueA: Date
                let valueB: Date

                switch (orderBy) {
                    case "created":
                        valueA = new Date(a.created)
                        valueB = new Date(b.created)
                        break
                    case "checkIn":
                        valueA = new Date(a.checkIn)
                        valueB = new Date(b.checkIn)
                        break
                    case "checkOut":
                        valueA = new Date(a.checkOut)
                        valueB = new Date(b.checkOut)
                        break
                    default:
                        valueA = new Date(a.created)
                        valueB = new Date(b.created)
                }

                return order === "asc" ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime()
            }
        })
    }, [reserves, searchResults, searchTerm, order, orderBy])

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            Detalle: {guid} - {companyName}
                        </h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <div className="flex justify-between mb-4 gap-2">
                            <IconButton
                                sx={{
                                    bgcolor: "#e0e0e0",
                                    width: 40,
                                    height: 40,
                                    "&:hover": {
                                        bgcolor: "#bdbdbd",
                                    },
                                }}
                                onClick={handleBackClick}
                            >
                                <ArrowBackIcon sx={{ color: "#1976d2" }} />
                            </IconButton>
                            <div className="flex gap-2">
                                {/* Campo de búsqueda */}
                                <div className="flex-1 max-w-md">
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar huésped (mínimo 5 caracteres)..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        size="medium"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchTerm && (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={clearSearch}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {isSearching && <div className="text-sm text-gray-600 mt-1">Buscando...</div>}
                                    {searchTerm.length >= 5 && !isSearching && <div className="text-sm text-gray-600 mt-1">{searchTotalCount} resultado(s) encontrado(s)</div>}
                                </div>

                                {/* Botón Descargar Excel (icono) */}
                                <Tooltip title="Descargar Excel">
                                    <IconButton color="primary" onClick={handleDownloadExcel} sx={{ border: "1px solid #1976d2" }}>
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>

                                {/* Botón Editar Selección */}
                                <Tooltip title={`Editar reservas seleccionadas${selectedRows.size ? ` (${selectedRows.size})` : ""}`}>
                                    <span>
                                        <IconButton
                                            color="primary"
                                            disabled={selectedRows.size === 0}
                                            onClick={() => setIsSelectedSidebarOpen(true)}
                                            sx={{
                                                border: "1px solid",
                                                borderColor: selectedRows.size === 0 ? "#bdbdbd" : "#1976d2",
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                {/* Botón Cambiar Habitaciones */}
                                <Tooltip title={`Cambiar habitaciones de las reservas seleccionadas${selectedRows.size ? ` (${selectedRows.size})` : ""}`}>
                                    <span>
                                        <IconButton
                                            color="primary"
                                            disabled={selectedRows.size === 0}
                                            onClick={() => setIsChangeRoomSidebarOpen(true)}
                                            sx={{
                                                border: "1px solid",
                                                borderColor: selectedRows.size === 0 ? "#bdbdbd" : "#1976d2",
                                            }}
                                        >
                                            <SwapHorizIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                {/* Botón Resetear PINs TTLock Selección */}
                                {hasTTLock && (
                                    <Tooltip title={`Resetear PIN TTLock de huéspedes seleccionados${selectedRows.size ? ` (${selectedRows.size})` : ''}`}>
                                        <span>
                                            <IconButton
                                                color="warning"
                                                disabled={selectedRows.size === 0 || isResettingPins}
                                                onClick={handleResetPinsBulk}
                                                sx={{
                                                    border: "1px solid",
                                                    borderColor: selectedRows.size === 0 || isResettingPins ? "#bdbdbd" : "#ed6c02",
                                                }}
                                            >
                                                <AutorenewIcon sx={isResettingPins ? {
                                                    animation: 'spin 1s linear infinite',
                                                    '@keyframes spin': {
                                                        '0%': { transform: 'rotate(0deg)' },
                                                        '100%': { transform: 'rotate(360deg)' }
                                                    }
                                                } : undefined} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                )}

                                {/* Botón Cancelar Reservas (icono) */}
                                <Tooltip title={`Cancelar reservas seleccionadas${selectedRows.size ? ` (${selectedRows.size})` : ""}`}>
                                    <span>
                                        <IconButton
                                            color="error"
                                            disabled={selectedRows.size === 0}
                                            onClick={handleCancelBulkReservations}
                                            sx={{
                                                border: "1px solid",
                                                borderColor: selectedRows.size === 0 ? "#bdbdbd" : "#d32f2f",
                                            }}
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </div>
                        </div>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedRows.size > 0 && selectedRows.size < selectableCount}
                                                checked={selectAll && selectableCount > 0}
                                                onChange={handleSelectAll}
                                                disabled={selectableCount === 0}
                                                sx={{
                                                    "&.Mui-checked": {
                                                        color: "#053ae2",
                                                    },
                                                    "&.MuiCheckbox-indeterminate": {
                                                        color: "#053ae2",
                                                    },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                            Huésped
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                            <TableSortLabel active={orderBy === "roomNumber"} direction={orderBy === "roomNumber" ? order : "asc"} onClick={() => handleRequestSort("roomNumber")}>
                                                Habitación - Estándar
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                            <TableSortLabel active={orderBy === "checkIn"} direction={orderBy === "checkIn" ? order : "asc"} onClick={() => handleRequestSort("checkIn")}>
                                                Check In
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                            <TableSortLabel active={orderBy === "checkOut"} direction={orderBy === "checkOut" ? order : "asc"} onClick={() => handleRequestSort("checkOut")}>
                                                Check Out
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                            Estado
                                        </TableCell>
                                        {(isSentryAdmin || isCompanyAdmin) && hasTTLock && (
                                            <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                                PIN
                                            </TableCell>
                                        )}
                                        <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                            Acción
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={(isSentryAdmin || isCompanyAdmin) && hasTTLock ? 8 : 7} align="center">
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                                                    <span style={{ color: "#888" }}>Cargando datos...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : sortedReserves.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={(isSentryAdmin || isCompanyAdmin) && hasTTLock ? 8 : 7} align="center">
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                                                    <span style={{ color: "#888" }}>No se encontraron datos</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sortedReserves.map((reserve, index) => (
                                            <TableRow
                                                key={reserve.id}
                                                sx={{
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                                                    },
                                                }}
                                            >
                                                <TableCell padding="checkbox">
                                                    {reserve.status !== StatusReservation.ACTIVE ? null : (
                                                        <Checkbox
                                                            checked={selectedRows.has(index)}
                                                            onChange={(e) => {
                                                                e.stopPropagation()
                                                                handleSelectRow(index)
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            sx={{
                                                                "&.Mui-checked": {
                                                                    color: "#053ae2",
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "0.8rem" }} onClick={() => handleInfoClick(reserve.id)}>
                                                    {reserve.firstName} {reserve.lastName}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "0.8rem" }} onClick={() => handleInfoClick(reserve.id)}>
                                                    {reserve.roomNumber} ({categoryToRoleMap[reserve.tag] || reserve.tag || "Sin Estándar"})
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "0.8rem" }} onClick={() => handleInfoClick(reserve.id)}>
                                                    {formatDate(new Date(reserve.checkIn))}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "0.8rem" }} onClick={() => handleInfoClick(reserve.id)}>
                                                    {formatDate(new Date(reserve.checkOut))}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: "0.8rem" }} onClick={() => handleInfoClick(reserve.id)}>
                                                    {reserve.status === StatusReservation.ACTIVE ? "Activa" : "Cancelada"}
                                                </TableCell>
                                                {(isSentryAdmin || isCompanyAdmin) && hasTTLock && (
                                                    <TableCell align="center" sx={{ fontSize: "0.8rem" }} onClick={() => handleInfoClick(reserve.id)}>
                                                        {reserve.doorPassword ? (
                                                            reserve.doorPassword
                                                        ) : (() => {
                                                            if (!reserve.created) {
                                                                return (
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        Procesando
                                                                        <AutorenewIcon
                                                                            sx={{
                                                                                color: '#1976d2',
                                                                                animation: 'spin 1s linear infinite',
                                                                                '@keyframes spin': {
                                                                                    '0%': { transform: 'rotate(0deg)' },
                                                                                    '100%': { transform: 'rotate(360deg)' }
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                );
                                                            }

                                                            const createdDate = new Date(reserve.created);
                                                            const now = new Date();
                                                            const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

                                                            if (diffInHours < 1) {
                                                                return (
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        Procesando
                                                                        <AutorenewIcon
                                                                            sx={{
                                                                                color: '#1976d2',
                                                                                animation: 'spin 1s linear infinite',
                                                                                '@keyframes spin': {
                                                                                    '0%': { transform: 'rotate(0deg)' },
                                                                                    '100%': { transform: 'rotate(360deg)' }
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <span>Utilizar App</span>
                                                                    <Tooltip title="La chapa actualmente presenta problemas">
                                                                        <Box display="flex" alignItems="center">
                                                                            <Badge
                                                                                badgeContent="!"
                                                                                sx={{
                                                                                    '& .MuiBadge-badge': {
                                                                                        backgroundColor: '#ffa726',
                                                                                        color: 'white',
                                                                                        fontSize: '12px',
                                                                                        fontWeight: 'bold',
                                                                                        minWidth: '16px',
                                                                                        height: '16px',
                                                                                        borderRadius: '50%'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <span></span>
                                                                            </Badge>
                                                                        </Box>
                                                                    </Tooltip>
                                                                </Box>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                )}
                                                <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                                    <div className="flex gap-2">
                                                        <IconButton
                                                            color="info"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleInfoClick(reserve.id)
                                                            }}
                                                        >
                                                            <InfoOutlinedIcon />
                                                        </IconButton>
                                                        {(isSentryAdmin || isCompanyAdmin) && reserve.status === StatusReservation.ACTIVE && (
                                                            <IconButton color="error" size="small" onClick={(e) => handleDeleteClick(reserve, e)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 8 }}>
                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={searchTerm.length >= 5 ? searchTotalCount : totalCount}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    labelRowsPerPage="Filas por página:"
                                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                                />
                            </div>
                        </TableContainer>
                        {/* <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => handleAction('cancel')}>Cancelar reserva</MenuItem>
                        <MenuItem onClick={() => handleAction('checkIn')}>Check In</MenuItem>
                        <MenuItem onClick={() => handleAction('checkOut')}>Check Out</MenuItem>
                    </Menu> */}
                    </div>
                }
            />

            {/* Sidebar de Detalle de Reserva */}
            <ReserveDetailSidebar open={isReserveModalOpen} onClose={handleCloseReserveModal} reserveId={selectedReserveId} onOpenRoomSidebar={handleOpenRoomSidebar} />

            {/* Room Detail Sidebar */}
            <RoomDetailSidebar open={roomSidebarOpen} onClose={handleCloseRoomSidebar} roomId={selectedRoomId} />

            {/* Modal de Confirmación para Eliminar Reserva */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Cancelar reserva"
                message={
                    reserveToDelete ? `¿Estás seguro que deseas cancelar la reserva de "${reserveToDelete.firstName} ${reserveToDelete.lastName}" en la habitación ${reserveToDelete.roomNumber}?` : ""
                }
                type="delete"
            />

            {/* Modal de Confirmación para Cancelación Masiva */}
            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancelBulkReservations}
                title="Cancelar reservas"
                message={`¿Estás seguro que deseas cancelar ${selectedRows.size} reserva${selectedRows.size > 1 ? "s" : ""}? Esta acción no se puede deshacer.`}
                type="delete"
            />

            {/* Sidebar de reservas seleccionadas */}
            <SelectedReservationsSidebar
                open={isSelectedSidebarOpen}
                onClose={() => {
                    setIsSelectedSidebarOpen(false)
                    fetchReserves()
                }}
                rows={Array.from(selectedRows).map((index) => ({
                    id: sortedReserves[index].id,
                    guid: (sortedReserves[index] as any).guid,
                    guest: { firstName: sortedReserves[index].firstName, lastName: sortedReserves[index].lastName },
                    roomNumber: sortedReserves[index].roomNumber,
                    checkIn: sortedReserves[index].checkIn,
                    checkOut: sortedReserves[index].checkOut,
                }))}
            />

            {/* Sidebar de cambio de habitaciones */}
            <ChangeRoomSidebar
                open={isChangeRoomSidebarOpen}
                onClose={() => {
                    setIsChangeRoomSidebarOpen(false)
                    fetchReserves()
                }}
                rows={Array.from(selectedRows).map((index) => ({
                    id: sortedReserves[index].id,
                    guid: (sortedReserves[index] as any).guid,
                    guest: { firstName: sortedReserves[index].firstName, lastName: sortedReserves[index].lastName },
                    roomNumber: sortedReserves[index].roomNumber,
                    checkIn: sortedReserves[index].checkIn,
                    checkOut: sortedReserves[index].checkOut,
                    jobTitleId: (sortedReserves[index] as any).jobTitleId || 0,
                    companyId: (sortedReserves[index] as any).companyId || 0,
                }))}
            />
        </>
    )
}

export default ReservesBulk
