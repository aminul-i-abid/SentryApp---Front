import React, { useState, useMemo } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box, 
  Typography,
  IconButton,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  Toolbar,
  Tooltip,
  Popover,
  alpha,
  Modal,
  Button,
  Stack,
  TextField,
  TablePagination,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import FilterListIcon from '@mui/icons-material/FilterList';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery20Icon from '@mui/icons-material/Battery20';
import { RoomResponse } from '../models/RoomResponse';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { deleteRoom, updateRoom, updateRoomDisabledStatus, createRoomPinUnique } from '../roomService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import DialpadIcon from '@mui/icons-material/Dialpad';
import AddPinModal from './AddPinModal';
import { ContractorResponse } from '../../contractors/models/ContractorResponse';
import tagRoleMap from '../../tag/enum/RoleTag';
import RoomDetailSidebar from './RoomDetailSidebar';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

interface RoomCardsProps {
  rooms: RoomResponse[];
  onRoomClick?: (room: RoomResponse) => void;
  onDeleteClick?: (room: RoomResponse) => void;
  contractors: ContractorResponse[];
  loading?: boolean;
  // Pagination props
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Filter props
  onCompanyFilter?: (companyIds: number[]) => void;
  onSearchFilter?: (search: string) => void;
}

type Order = 'asc' | 'desc';
type OrderBy = 'roomNumber' | 'companyName';

function RoomCards({ 
  rooms, 
  onRoomClick, 
  onDeleteClick, 
  contractors, 
  loading = false,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onCompanyFilter,
  onSearchFilter
}: RoomCardsProps) {
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | ''>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [disableComments, setDisableComments] = useState<string>('');
  const [pendingDisabledState, setPendingDisabledState] = useState<boolean>(false);
  // Add PIN modal state
  const [isAddPinOpen, setIsAddPinOpen] = useState(false);
  const [roomForPin, setRoomForPin] = useState<RoomResponse | null>(null);
  const [addingPin, setAddingPin] = useState(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('roomNumber');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRoomForSidebar, setSelectedRoomForSidebar] = useState<RoomResponse | null>(null);
  
  // Bulk edit form state
  const [bulkEditTag, setBulkEditTag] = useState<string>("");
  const [bulkEditBeds, setBulkEditBeds] = useState<string>("");
  const [bulkEditContractor, setBulkEditContractor] = useState<string>("");
  
  const { enqueueSnackbar } = useSnackbar();
  const { authState } = useAuth();
  const isSentryAdmin = authState.user?.role === 'Sentry_Admin';

  // Battery level functions
  const getBatteryColor = (batteryLevel: number | undefined | null) => {
    if (batteryLevel === undefined || batteryLevel === null) return '#94A3B8'; // Gris para desconocido
    if (batteryLevel < 35) return '#EF4444'; // Rojo para bajo
    if (batteryLevel <= 65) return '#F59E0B'; // Amarillo para medio
    return '#10B981'; // Verde para bueno
  };

  const getBatteryIcon = (batteryLevel: number | undefined | null) => {
    if (batteryLevel === undefined || batteryLevel === null) return Battery60Icon;
    if (batteryLevel < 35) return Battery20Icon;
    if (batteryLevel <= 65) return Battery60Icon;
    return BatteryFullIcon;
  };

  // Handle row click to open sidebar
  const handleRowClick = (room: RoomResponse) => {
    setSelectedRoomForSidebar(room);
    setIsSidebarOpen(true);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedRoomForSidebar(null);
  };

  // Handle sidebar refresh
  const handleSidebarRefresh = () => {
    // Trigger refresh from parent if callback exists
    if (onDeleteClick && selectedRoomForSidebar) {
      onDeleteClick(selectedRoomForSidebar);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const filterOpen = Boolean(filterAnchorEl);
  const filterId = filterOpen ? 'filter-popover' : undefined;

  const handleRoomClick = (room: RoomResponse) => {
    if (onRoomClick) {
      onRoomClick(room);
    } else {
      setSelectedRoom(room);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedRoom) {
      try {
        await deleteRoom(selectedRoom.id);
        enqueueSnackbar('Habitación eliminada exitosamente', { variant: 'success' });
        if (onDeleteClick) {
          onDeleteClick(selectedRoom);
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        enqueueSnackbar('Error al eliminar la habitación', { variant: 'error' });
      }
    }
    setIsDeleteModalOpen(false);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Get all unique companies from rooms
  const companies = useMemo(() => {
    const uniqueCompanies = new Set<string>();
    rooms.forEach(room => {
      if (room.companyName) {
        uniqueCompanies.add(room.companyName);
      }
    });
    return Array.from(uniqueCompanies).sort();
  }, [rooms]);

  // Handle company filter change
  const handleCompanyFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const companies = typeof value === 'string' ? value.split(',') : value;
    setSelectedCompanies(companies);
  };

  // Handle search text change
  const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
  };

  // Handle apply filters button click
  const handleApplyFilters = () => {
    // If parent component provides filter callbacks, use them
    if (onCompanyFilter) {
      // Convert company names to company IDs
      const companyIds = selectedCompanies.map(companyName => {
        const contractor = contractors.find(c => c.name === companyName);
        return contractor ? contractor.id : null;
      }).filter(id => id !== null) as number[];
      
      onCompanyFilter(companyIds);
    }
    
    if (onSearchFilter) {
      onSearchFilter(searchText);
    }
    
    // Close the filter popover
    handleFilterClose();
  };

  // Handle clear filters button click
  const handleClearFilters = () => {
    setSelectedCompanies([]);
    setSearchText('');
    
    // If parent component provides filter callbacks, clear them
    if (onCompanyFilter) {
      onCompanyFilter([]);
    }
    
    if (onSearchFilter) {
      onSearchFilter('');
    }
    
    // Close the filter popover
    handleFilterClose();
  };

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    // If parent component handles filtering, don't filter locally - just sort
    if (onCompanyFilter && onSearchFilter) {
      // Only apply sorting to the rooms received from parent
      return [...rooms].sort((a, b) => {
        let valueA: string | number;
        let valueB: string | number;
        
        switch (orderBy) {
          case 'roomNumber':
            valueA = a.id;
            valueB = b.id;
            break;
          case 'companyName':
            valueA = a.companyName || '';
            valueB = b.companyName || '';
            break;
          default:
            valueA = a.id;
            valueB = b.id;
        }
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return order === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          // Handle numeric comparison by converting to numbers first
          const numA = Number(valueA);
          const numB = Number(valueB);
          return order === 'asc'
            ? numA - numB
            : numB - numA;
        }
      });
    }

    // Local filtering (when no parent callbacks) - apply both filtering and sorting
    // First filter by selected companies
    let filtered = selectedCompanies.length > 0
      ? rooms.filter(room => room.companyName && selectedCompanies.includes(room.companyName))
      : rooms;

    // Then filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(searchLower) ||
        (room.companyName && room.companyName.toLowerCase().includes(searchLower)) ||
        room.floorNumber.toString().includes(searchLower)
      );
    }

    // Then apply sorting
    return [...filtered].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;
      
      switch (orderBy) {
        case 'roomNumber':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'companyName':
          valueA = a.companyName || '';
          valueB = b.companyName || '';
          break;
        default:
          valueA = a.id;
          valueB = b.id;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return order === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        // Handle numeric comparison by converting to numbers first
        const numA = Number(valueA);
        const numB = Number(valueB);
        return order === 'asc'
          ? numA - numB
          : numB - numA;
      }
    });
  }, [rooms, selectedCompanies, searchText, order, orderBy, onCompanyFilter, onSearchFilter]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredAndSortedRooms.map((n) => n.id.toString());
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleBulkEditOpen = () => {
    setIsBulkEditModalOpen(true);
  };

  const handleBulkEditClose = () => {
    setIsBulkEditModalOpen(false);
  };

  const handleBulkEditSave = async () => {
    try {
      // Update each selected room
      for (const room of selectedRooms) {
        const updatedRoom = {
          roomNumber: room.roomNumber,
          beds: bulkEditBeds ? parseInt(bulkEditBeds) : room.beds,
          isStorage: room.isStorage,
          blockId: room.blockId,
          companyId: bulkEditContractor ? parseInt(bulkEditContractor) : room.companyId,
          tag: bulkEditTag ? parseInt(bulkEditTag) : room.tag,
          floorNumber: room.floorNumber,
          disabled: room.disabled
        };
        
        await updateRoom(room.id.toString(), updatedRoom);
      }
      
      // Show success message
      enqueueSnackbar(`Se actualizaron ${selectedRooms.length} habitaciones correctamente`, { variant: 'success' });
      
      // Close modal and refresh
      setIsBulkEditModalOpen(false);
      setSelected([]);
      setBulkEditTag("");
      setBulkEditBeds("");
      setBulkEditContractor("");
      
      // If onDeleteClick exists, use it as a way to trigger refresh from parent
      if (onDeleteClick && selectedRooms.length > 0) {
        onDeleteClick(selectedRooms[0]);
      }
    } catch (error) {
      console.error('Error updating rooms:', error);
      enqueueSnackbar("Error al actualizar las habitaciones", { variant: 'error' });
    }
  };

  const handleDisabledChange = (room: RoomResponse, newDisabledState: boolean) => {
    setSelectedRoom(room);
    setPendingDisabledState(newDisabledState);
    setIsDisableModalOpen(true);
  };

  const handleDisableConfirm = async () => {
    if (!selectedRoom) return;

    try {
      // action: 1 para deshabilitar, 0 para habilitar
      const action = pendingDisabledState ? 1 : 0;
      
      // Si se está habilitando y no hay comentario, usar uno por defecto
      const comments = disableComments.trim() || (pendingDisabledState ? '' : 'Se habilitó la habitación');
      
      const result = await updateRoomDisabledStatus(
        selectedRoom.id,
        action,
        comments
      );

      if (result.succeeded) {
        enqueueSnackbar(
          `Habitación ${pendingDisabledState ? 'deshabilitada' : 'habilitada'} correctamente`,
          { variant: 'success' }
        );
        
        // Trigger refresh from parent
        if (onDeleteClick) {
          onDeleteClick(selectedRoom);
        }
      } else {
        enqueueSnackbar(
          result.errors?.[0] || 'Error al actualizar el estado de la habitación',
          { variant: 'error' }
        );
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      enqueueSnackbar('Error al actualizar el estado de la habitación', { variant: 'error' });
    }

    // Reset modal state
    setIsDisableModalOpen(false);
    setDisableComments('');
    setSelectedRoom(null);
  };

  const handleDisableCancel = () => {
    setIsDisableModalOpen(false);
    setDisableComments('');
    setSelectedRoom(null);
  };

  const handleHistoryClick = (room: RoomResponse) => {
    setSelectedRoom(room);
    setIsHistoryModalOpen(true);
  };

  const handleHistoryClose = () => {
    setIsHistoryModalOpen(false);
    setSelectedRoom(null);
  };

  // Add PIN handlers
  const handleOpenAddPin = (room: RoomResponse) => {
    setRoomForPin(room);
    setIsAddPinOpen(true);
  };

  const handleCloseAddPin = () => {
    setIsAddPinOpen(false);
    setRoomForPin(null);
  };

  const handleSaveAddPin = async (data: { name: string; phoneNumber: string; roomId: number }) => {
    setAddingPin(true);
    try {
      const result = await createRoomPinUnique({
        name: data.name,
        phoneNumber: data.phoneNumber,
        roomId: data.roomId
      });

      if (result.succeeded) {
        enqueueSnackbar('PIN creado correctamente', { variant: 'success' });
        handleCloseAddPin();
      } else {
        enqueueSnackbar(result.errors?.[0] || 'Error al crear el PIN', { variant: 'error' });
      }
    } catch (e) {
      enqueueSnackbar('Error al crear el PIN', { variant: 'error' });
    } finally {
      setAddingPin(false);
    }
  };

  // Get the selected room objects based on their IDs
  const selectedRooms = useMemo(() => {
    return rooms.filter(room => selected.includes(room.id.toString()));
  }, [rooms, selected]);

  // Check if any filters are active
  const hasActiveFilters = selectedCompanies.length > 0 || searchText.trim() !== '';

  return (
    <>
      <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }),
          }}
        >
          {selected.length > 0 ? (
            <>
              <Typography
                sx={{ flex: '1 1 100%' }}
                color="inherit"
                variant="subtitle1"
                component="div"
              >
                {selected.length} seleccionado(s)
              </Typography>
              <Tooltip title="Editar seleccionados">
                <IconButton onClick={handleBulkEditOpen}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Habitaciones
            </Typography>
          )}

          <Tooltip title="Filtrar por contratista">
            <IconButton 
              onClick={handleFilterClick}
              sx={{
                ...(hasActiveFilters && {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                })
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Popover
            id={filterId}
            open={filterOpen}
            anchorEl={filterAnchorEl}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ p: 2, width: 300 }}>
              <TextField
                fullWidth
                label="Buscar habitación"
                placeholder="Buscar por habitación, contratista o piso..."
                value={searchText}
                onChange={handleSearchTextChange}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              
              <FormControl sx={{ width: '100%' }}>
                <InputLabel id="company-filter-label">Filtrar por Contratista</InputLabel>
                <Select
                  labelId="company-filter-label"
                  id="company-filter"
                  multiple
                  value={selectedCompanies}
                  onChange={handleCompanyFilterChange}
                  input={<OutlinedInput id="select-multiple-companies" label="Filtrar por Contratista" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {companies.map((company) => (
                    <MenuItem key={company} value={company}>
                      {company}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button onClick={handleClearFilters} variant="outlined">
                  Limpiar
                </Button>
                <Button onClick={handleApplyFilters} variant="contained" color="primary">
                  Buscar
                </Button>
              </Stack>
            </Box>
          </Popover>
        </Toolbar>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < filteredAndSortedRooms.length}
                    checked={filteredAndSortedRooms.length > 0 && selected.length === filteredAndSortedRooms.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'seleccionar todas las habitaciones',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'roomNumber'}
                    direction={orderBy === 'roomNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('roomNumber')}
                  >
                    Habitación
                  </TableSortLabel>
                </TableCell>
                <TableCell>Piso</TableCell>
                <TableCell>Camas</TableCell>
                <TableCell>Estándar</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'companyName'}
                    direction={orderBy === 'companyName' ? order : 'asc'}
                    onClick={() => handleRequestSort('companyName')}
                  >
                    Contratista
                  </TableSortLabel>
                </TableCell>
                <TableCell>Habilitada</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="subtitle1" color="text.secondary">Cargando habitaciones...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedRooms.length > 0 ? (
                filteredAndSortedRooms.map((room) => {
                  const isItemSelected = isSelected(room.id.toString());
                  
                  return (
                    <TableRow 
                      key={room.id}
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                      onClick={() => handleRowClick(room)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#f8f9fa'
                        }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClick(event, room.id.toString());
                          }}
                          inputProps={{
                            'aria-labelledby': `enhanced-table-checkbox-${room.id}`,
                          }}
                        />
                      </TableCell>
                      <TableCell 
                        id={`enhanced-table-checkbox-${room.id}`}
                      >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {room.roomNumber}
                            </Typography>
                            {room.hasDoorLock && (
                              <MeetingRoomIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            )}
                          </Box>
                      </TableCell>
                      <TableCell>{room.floorNumber}</TableCell>
                      <TableCell>{room.beds}</TableCell>
                      <TableCell>{tagRoleMap[room.tag] || room.tag}</TableCell>
                      <TableCell>{room.companyName || 'Sin contratista'}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDisabledChange(room, !room.disabled);
                          }}
                          size="small"
                          sx={{
                            color: room.disabled ? 'error.main' : 'success.main',
                            '&:hover': {
                              bgcolor: room.disabled ? 'error' : 'success',
                              opacity: 0.4
                            }
                          }}
                        >
                          {room.disabled ? <CloseIcon sx={{ color: 'error.main' }} /> : <CheckIcon sx={{ color: 'success.main' }} />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleRoomClick(room);
                        }}>
                          <EditIcon />
                        </IconButton>
                        {isSentryAdmin && (
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddPin(room);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <DialpadIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHistoryClick(room);
                          }}
                          sx={{ color: 'info.main' }}
                        >
                          <InfoIcon />
                        </IconButton>
                        {/* <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoom(room);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton> */}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="subtitle1" color="text.secondary">No se encontraron habitaciones</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
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
        </div>
      </Paper>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Habitación"
        message={`¿Estás seguro que deseas eliminar la habitación ${selectedRoom?.roomNumber}?`}
        type="delete"
      />

      {/* Bulk Edit Modal */}
      <Modal
        open={isBulkEditModalOpen}
        onClose={handleBulkEditClose}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}>
          <Typography variant="h6" component="h2" mb={2}>
            Editar habitaciones seleccionadas
          </Typography>
          
          <Typography variant="body2" mb={3}>
            Estás editando {selected.length} habitación(es):
            {selectedRooms.map(room => (
              <Chip 
                key={room.id} 
                label={room.roomNumber} 
                size="small" 
                sx={{ ml: 0.5, mb: 0.5 }} 
              />
            ))}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="company-edit-label">Contratista</InputLabel>
            <Select
              labelId="company-edit-label"
              id="company-edit"
              label="Contratista"
              value={bulkEditContractor}
              onChange={(e) => setBulkEditContractor(e.target.value)}
            >
              <MenuItem value="">
                <em>No cambiar</em>
              </MenuItem>
              {contractors.map((contractor) => (
                <MenuItem key={contractor.id} value={contractor.id.toString()}>
                  {contractor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="beds-edit-label">Camas</InputLabel>
            <Select
              labelId="beds-edit-label"
              id="beds-edit"
              label="Camas"
              value={bulkEditBeds}
              onChange={(e) => setBulkEditBeds(e.target.value)}
            >
              <MenuItem value="">
                <em>No cambiar</em>
              </MenuItem>
              {[1, 2, 3].map((bed) => (
                <MenuItem key={bed} value={bed.toString()}>
                  {bed}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tag-edit-label">Estándar</InputLabel>
            <Select
              labelId="tag-edit-label"
              id="tag-edit"
              label="Etiqueta"
              value={bulkEditTag}
              onChange={(e) => setBulkEditTag(e.target.value)}
            >
              <MenuItem value="">
                <em>No cambiar</em>
              </MenuItem>
              {Object.entries(tagRoleMap).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2} sx={{ '& > *': { flex: 1 } }}>
            <Button onClick={handleBulkEditClose} variant="outlined" fullWidth>
              Cancelar
            </Button>
            <Button 
              onClick={handleBulkEditSave} 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={!bulkEditContractor && !bulkEditBeds && !bulkEditTag}
            >
              Guardar cambios
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Disable/Enable Room Modal */}
      <Modal
        open={isDisableModalOpen}
        onClose={handleDisableCancel}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4
        }}>
          <Typography variant="h6" component="h2" mb={2}>
            {pendingDisabledState ? 'Deshabilitar' : 'Habilitar'} Habitación
          </Typography>
          
          <Typography variant="body2" mb={3}>
            ¿Estás seguro que deseas {pendingDisabledState ? 'deshabilitar' : 'habilitar'} la habitación{' '}
            <strong>{selectedRoom?.roomNumber}</strong>?
          </Typography>
          
          <TextField
            fullWidth
            label={pendingDisabledState ? "Motivo (requerido)" : "Motivo (opcional)"}
            placeholder={`Ingresa el motivo para ${pendingDisabledState ? 'deshabilitar' : 'habilitar'} la habitación...`}
            value={disableComments}
            onChange={(e) => setDisableComments(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 3 }}
            required={pendingDisabledState}
          />

          <Stack direction="row" spacing={2} sx={{ '& > *': { flex: 1 } }}>
            <Button onClick={handleDisableCancel} variant="outlined" fullWidth>
              Cancelar
            </Button>
            <Button 
              onClick={handleDisableConfirm} 
              variant="contained" 
              color={pendingDisabledState ? 'error' : 'success'}
              fullWidth
              disabled={pendingDisabledState && !disableComments.trim()}
            >
              {pendingDisabledState ? 'Deshabilitar' : 'Habilitar'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Room History Modal */}
      <Modal
        open={isHistoryModalOpen}
        onClose={handleHistoryClose}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          <Typography variant="h6" component="h2" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Historial de la Habitación {selectedRoom?.roomNumber}
          </Typography>
          
          {selectedRoom?.disabledHistory && selectedRoom.disabledHistory.length > 0 ? (
            <Box>
              {selectedRoom.disabledHistory
                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                .map((history, index) => (
                <Box 
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: history.action ? 'error.50' : 'success.50',
                    borderLeftWidth: 4,
                    borderLeftColor: history.action ? 'error.main' : 'success.main'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {history.action ? (
                      <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    ) : (
                      <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    )}
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ color: history.action ? 'error.main' : 'success.main' }}
                    >
                      {history.action ? 'Habitación Deshabilitada' : 'Habitación Habilitada'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(history.created).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  
                  {history.comments && (
                    <Typography variant="body1" sx={{ 
                      bgcolor: 'background.paper',
                      p: 1.5,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontStyle: history.comments.trim() === '' ? 'italic' : 'normal'
                    }}>
                      {history.comments.trim() || 'Sin comentarios'}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: 'text.secondary'
            }}>
              <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Sin historial disponible
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Esta habitación no tiene registros de habilitación/deshabilitación
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={handleHistoryClose} variant="contained" color="primary">
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Room Detail Sidebar */}
      <RoomDetailSidebar
        open={isSidebarOpen}
        onClose={handleSidebarClose}
        roomId={selectedRoomForSidebar?.id || null}
        onRefreshData={handleSidebarRefresh}
      />

      {/* Add PIN Modal */}
      <AddPinModal
        open={isAddPinOpen}
        onClose={handleCloseAddPin}
        onSave={handleSaveAddPin}
        roomNumber={roomForPin?.roomNumber}
        roomId={roomForPin?.id || null}
  loading={addingPin}
      />
    </>
  );
}

export default RoomCards;