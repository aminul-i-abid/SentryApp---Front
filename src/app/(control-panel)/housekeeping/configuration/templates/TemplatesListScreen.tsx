/**
 * Templates List Screen
 * FASE 5.3.7 - Housekeeping Configuration
 *
 * Main screen for managing checklist templates
 * Features:
 * - Paginated list (10 per page)
 * - Filters: category, active status, search
 * - Sorting: priority, name, createdAt
 * - Actions: Edit, Duplicate, Delete, Activate/Deactivate
 * - Bulk actions: Activate, Deactivate multiple
 * - Expandable preview of first 5 items
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  ToggleOn as ActivateIcon,
  ToggleOff as DeactivateIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import StyledTable, { type TableColumnDef } from '@/components/ui/StyledTable';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTemplates, deleteTemplate, createTemplate, updateTemplate } from '@/store/housekeeping';
import useUser from '@auth/useUser';
import { useCategoriesData } from './hooks';
import type { ChecklistTemplate } from '@/store/housekeeping/housekeepingTypes';
import type { TemplatesListState } from './types/templateEditorTypes';
import TopbarHeader from '@/components/TopbarHeader';

const TemplatesListScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';

  // Redux state
  const { templates, loading, error } = useAppSelector((state) => state.housekeeping);

  // Local state
  const [state, setState] = useState<TemplatesListState>({
    filters: {
      categoryId: undefined,
      isActive: undefined,
      searchTerm: '',
    },
    selectedTemplates: [],
    page: 0,
    pageSize: 10,
    sortBy: 'priority',
    sortOrder: 'asc',
  });

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | null>(null);

  // Load categories
  const { categories, isLoading: loadingCategories } = useCategoriesData({ campId });

  // Load templates on mount
  useEffect(() => {
    dispatch(fetchTemplates({ campId }));
  }, [dispatch, campId]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Apply search filter
    if (state.filters.searchTerm) {
      const searchLower = state.filters.searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (state.filters.categoryId) {
      result = result.filter((t) => t.categoryId === state.filters.categoryId);
    }

    // Apply active status filter
    if (state.filters.isActive !== undefined) {
      result = result.filter((t) => t.isActive === state.filters.isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (state.sortBy) {
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [templates, state.filters, state.sortBy, state.sortOrder]);

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, searchTerm: event.target.value },
      page: 0,
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, categoryId: event.target.value || undefined },
      page: 0,
    }));
  };

  const handleActiveStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        isActive: value === '' ? undefined : value === 'true'
      },
      page: 0,
    }));
  };

  const handleCreate = () => {
    navigate('/housekeeping/templates/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/housekeeping/templates/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await dispatch(deleteTemplate({ id: templateToDelete })).unwrap();
      enqueueSnackbar('Template eliminado exitosamente', { variant: 'success' });
      dispatch(fetchTemplates({ campId }));
    } catch (err: any) {
      enqueueSnackbar(`Error al eliminar: ${err.message}`, { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleDuplicate = async (template: ChecklistTemplate) => {
    try {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = template;
      const duplicated = {
        ...rest,
        name: `${template.name} (Copia)`,
        isActive: false,
        items: (template.items ?? []).map(({ id: _itemId, tareaId, ...item }) => ({
          ...item,
          tareaId: tareaId ? Number(tareaId) : undefined,
        })),
      };
      await dispatch(createTemplate(duplicated)).unwrap();
      enqueueSnackbar('Template duplicado exitosamente', { variant: 'success' });
      dispatch(fetchTemplates({ campId }));
    } catch (err: any) {
      enqueueSnackbar(`Error al duplicar: ${err.message}`, { variant: 'error' });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const template = templates.find((t) => t.id === id);
      if (!template) return;
      await dispatch(updateTemplate({
        ...template,
        isActive: !currentStatus,
        items: (template.items ?? []).map(({ tareaId, ...item }) => ({
          ...item,
          tareaId: tareaId ? Number(tareaId) : undefined,
        })),
      })).unwrap();
      enqueueSnackbar(
        currentStatus ? 'Template desactivado' : 'Template activado',
        { variant: 'success' }
      );
      dispatch(fetchTemplates({ campId }));
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    if (state.selectedTemplates.length === 0) {
      enqueueSnackbar('Seleccione al menos un template', { variant: 'warning' });
      return;
    }
    setBulkAction(action);
    setBulkActionDialogOpen(true);
  };

  const handleBulkActionConfirm = async () => {
    if (!bulkAction) return;

    try {
      const isActive = bulkAction === 'activate';
      await Promise.all(
        state.selectedTemplates.map((id) => {
          const template = templates.find((t) => t.id === id);
          if (!template) return Promise.resolve();
          return dispatch(updateTemplate({
            ...template,
            isActive,
            items: (template.items ?? []).map(({ tareaId, ...item }) => ({
              ...item,
              tareaId: tareaId ? Number(tareaId) : undefined,
            })),
          })).unwrap();
        })
      );
      const action = isActive ? 'activados' : 'desactivados';
      enqueueSnackbar(`${state.selectedTemplates.length} templates ${action}`, { variant: 'success' });
      setState((prev) => ({ ...prev, selectedTemplates: [] }));
      dispatch(fetchTemplates({ campId }));
    } catch (err: any) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
    } finally {
      setBulkActionDialogOpen(false);
      setBulkAction(null);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRowSelectionChange = (id: string) => {
    setState((prev) => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.includes(id)
        ? prev.selectedTemplates.filter((tid) => tid !== id)
        : [...prev.selectedTemplates, id],
    }));
  };

  // Table columns
  const columns = useMemo<TableColumnDef<ChecklistTemplate>[]>(
    () => [
      {
        id: 'name',
        label: 'Nombre',
        sortable: true,
        width: '250px',
        render: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(row.items ?? []).length} items
            </Typography>
          </Box>
        ),
      },
      {
        id: 'categoryName',
        label: 'Categoría',
        sortable: true,
        width: '150px',
        render: (row) => <>{row.categoryName}</>,
      },
      {
        id: 'priority',
        label: 'Prioridad',
        sortable: true,
        width: '100px',
        render: (row) => (
          <Chip
            label={row.priority}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        id: 'isActive',
        label: 'Estado',
        sortable: true,
        width: '100px',
        render: (row) => (
          <Chip
            label={row.isActive ? 'Activo' : 'Inactivo'}
            size="small"
            color={row.isActive ? 'success' : 'default'}
          />
        ),
      },
      {
        id: 'createdAt',
        label: 'Creado',
        sortable: true,
        width: '150px',
        render: (row) => new Date(row.createdAt).toLocaleDateString(),
      },
    ],
    []
  );

  const paginatedData = useMemo(() => {
    const start = state.page * state.pageSize;
    return filteredTemplates.slice(start, start + state.pageSize);
  }, [filteredTemplates, state.page, state.pageSize]);

  const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
      backgroundColor: theme.palette.background.paper,
      borderBottomWidth: 1,
      borderStyle: "solid",
      borderColor: theme.palette.divider,
    },
    "& .FusePageSimple-content": {},
    "& .FusePageSimple-content > .container": {
      maxWidth: "100% !important",
      padding: "0 !important",
      width: "100%",
    },
    "& .FusePageSimple-header > .container": {
      maxWidth: "100% !important",
      padding: "0 !important",
      width: "100%",
    },
    "& .FusePageSimple-sidebarHeader": {},
    "& .FusePageSimple-sidebarContent": {},
  }));

  return (
    <Root header={
      <TopbarHeader title="Templates de Checklist" description="Gestiona las plantillas de checklist para tareas de housekeeping" />
    } content={
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Templates de Checklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona las plantillas de checklist para tareas de housekeeping
        </Typography>
      </Box> */}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters and Actions */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: "white" }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {/* Search */}
            <TextField
              placeholder="Buscar por nombre..."
              value={state.filters.searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#415EDE',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#415EDE',
                    borderWidth: '2px',
                  }
                },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            {/* Category Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: 200,
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#415EDE',
                },
              }}
            >
              <InputLabel>Categoría</InputLabel>
              <Select
                value={state.filters.categoryId || ''}
                onChange={handleCategoryChange}
                label="Categoría"
                sx={{
                  backgroundColor: "white",
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#415EDE',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#415EDE',
                    borderWidth: '2px',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: 'white !important' }
                  }
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Active Status Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#415EDE',
                },
              }}
            >
              <InputLabel>Estado</InputLabel>
              <Select
                value={state.filters.isActive === undefined ? '' : String(state.filters.isActive)}
                onChange={handleActiveStatusChange}
                label="Estado"
                sx={{
                  backgroundColor: "white",
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#415EDE',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#415EDE',
                    borderWidth: '2px',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: 'white !important' }
                  }
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            {/* Bulk Actions */}
            {state.selectedTemplates.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<img src="/assets/icons/on.png" alt="Activate" />}
                  onClick={() => handleBulkAction('activate')}
                  size="small"
                >
                  Activar ({state.selectedTemplates.length})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<img src="/assets/icons/off.png" alt="Deactivate" />}
                  onClick={() => handleBulkAction('deactivate')}
                  size="small"
                >
                  Desactivar ({state.selectedTemplates.length})
                </Button>
              </>
            )}

            {/* Create Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{ backgroundColor: '#415EDE', color: 'white' }}
            >
              Nuevo Template
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <StyledTable
          columns={columns}
          data={paginatedData}
          getRowId={(row) => row.id}
          loading={loading || loadingCategories}
          selectable
          selected={state.selectedTemplates}
          onSelectAll={(e) => {
            if (e.target.checked) {
              setState((prev) => ({ ...prev, selectedTemplates: filteredTemplates.map(t => t.id) }));
            } else {
              setState((prev) => ({ ...prev, selectedTemplates: [] }));
            }
          }}
          onSelectRow={(_, id) => {
            handleRowSelectionChange(id);
          }}
          order={state.sortOrder}
          orderBy={state.sortBy}
          onSort={(columnId) => {
            setState((prev) => ({
              ...prev,
              sortBy: columnId as "name" | "priority" | "createdAt",
              sortOrder: prev.sortBy === columnId && prev.sortOrder === 'asc' ? 'desc' : 'asc',
            }));
          }}
          renderActions={(row) => (
            <Stack direction="row" spacing={0.5} justifyContent="center">
              <Tooltip title="Editar template">
                <IconButton size="small" onClick={() => handleEdit(row.id)}>
                  <img src="./assets/icons/edit-black.png" alt="" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicar template">
                <IconButton size="small" onClick={() => handleDuplicate(row)}>
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={row.isActive ? 'Desactivar' : 'Activar'}>
                <IconButton size="small" onClick={() => handleToggleActive(row.id, row.isActive)}>
                  {row.isActive ? (
                    <img src="./assets/icons/off.png" alt="" />
                  ) : (
                    <img src="./assets/icons/on.png" alt="" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar template">
                <IconButton size="small" onClick={() => handleDeleteClick(row.id)} color="error">
                  <img src="./assets/icons/delete.png" alt="" />
                </IconButton>
              </Tooltip>
              <Tooltip title={expandedRows.has(row.id) ? 'Ocultar items' : 'Ver items'}>
                <IconButton size="small" onClick={() => handleToggleExpand(row.id)}>
                  {expandedRows.has(row.id) ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          isRowExpanded={(row) => expandedRows.has(row.id)}
          renderDetailPanel={(row) => (
            <Box sx={{ p: 2, backgroundColor: 'background.default', mx: 2, my: 1, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Items del Template (mostrando primeros 5)
              </Typography>
              <List dense>
                {(row.items ?? []).slice(0, 5).map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={item.description}
                      secondary={
                        <>
                          {item.isMandatory && (
                            <Chip label="Obligatorio" size="small" color="error" sx={{ mr: 1 }} />
                          )}
                          Orden: {item.order}
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {(row.items ?? []).length > 5 && (
                  <ListItem>
                    <ListItemText
                      secondary={`... y ${(row.items ?? []).length - 5} items más`}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
          pagination={{
            count: filteredTemplates.length,
            page: state.page,
            rowsPerPage: state.pageSize,
            onPageChange: (_, newPage) => setState((prev) => ({ ...prev, page: newPage })),
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro de que desea eliminar este template? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Action Confirmation Dialog */}
        <Dialog
          open={bulkActionDialogOpen}
          onClose={() => setBulkActionDialogOpen(false)}
        >
          <DialogTitle>Confirmar Acción Masiva</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro de que desea {bulkAction === 'activate' ? 'activar' : 'desactivar'}{' '}
              {state.selectedTemplates.length} template(s)?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkActionConfirm} color="primary" variant="contained">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    } />
  );
};

export default TemplatesListScreen;
