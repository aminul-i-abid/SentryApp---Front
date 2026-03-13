/**
 * RulesListScreen - Rules List View with Filters and Actions
 * FASE 5.3 - Housekeeping Configuration
 *
 * Displays paginated list of cleaning rules with filters and bulk actions
 * Features:
 * - Paginated list (10 per page)
 * - Filters: template, trigger type, active status, search by name
 * - Sorting: priority, name, createdAt
 * - Actions: Edit, Duplicate, Delete, Activate/Deactivate, Test
 * - Bulk actions: Activate/Deactivate multiple rules
 * - Test dialog for quick rule testing
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  PlayArrow as TestIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  PowerSettingsNew as ToggleIcon,
  DeleteSweep as BulkDeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRules, deleteRule, updateRule, createRule, fetchTemplates } from '@/store/housekeeping/housekeepingThunks';
import useUser from '@auth/useUser';
import { RuleTester } from './components';
import { useRuleTesting } from './hooks';
import type { CleaningRule, RuleTriggerType, JobTagValue } from '@/store/housekeeping/housekeepingTypes';
import type { RulesListState } from './types/ruleConfiguratorTypes';

/**
 * Helper to format trigger description
 */
const formatTriggerDescription = (rule: CleaningRule): string => {
  const parts: string[] = [];

  if (rule.triggerType === 'interval' && rule.daysInterval) {
    parts.push(`Cada ${rule.daysInterval} días`);
  } else if (rule.triggerType === 'checkout') {
    parts.push('Al checkout');
  } else if (rule.triggerType === 'checkin') {
    parts.push('Al checkin');
  } else if (rule.triggerType === 'manual') {
    parts.push('Manual');
  }

  if (rule.onCheckout) parts.push('checkout');
  if (rule.onCheckin) parts.push('checkin');

  return parts.join(' + ') || 'Sin trigger';
};

/**
 * Helper to format target description
 */
const formatTargetDescription = (rule: CleaningRule): string => {
  if (rule.appliesTo === 'camp') {
    return 'Todo el campamento';
  } else if (rule.appliesTo === 'block') {
    const count = rule.targetIds ? rule.targetIds.split(',').length : 0;
    return `${count} bloque${count !== 1 ? 's' : ''}`;
  } else if (rule.appliesTo === 'room') {
    const count = rule.targetIds ? rule.targetIds.split(',').length : 0;
    return `${count} habitación${count !== 1 ? 'es' : ''}`;
  }
  return 'Sin especificar';
};

/**
 * Helper to format JobTag label for display
 */
const formatJobTag = (targetJobTag: JobTagValue | null | undefined): string => {
  switch (targetJobTag) {
    case 'CategoriaA': return 'Gerente';
    case 'CategoriaB': return 'Supervisor';
    case 'CategoriaC': return 'Trabajador';
    default: return 'Todos';
  }
};

type JobTagChipColor = 'default' | 'primary' | 'secondary' | 'warning';

const getJobTagColor = (targetJobTag: JobTagValue | null | undefined): JobTagChipColor => {
  switch (targetJobTag) {
    case 'CategoriaA': return 'secondary';
    case 'CategoriaB': return 'primary';
    case 'CategoriaC': return 'warning';
    default: return 'default';
  }
};

/**
 * RulesListScreen Component
 */
const RulesListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';

  // Redux state
  const rules = useAppSelector((state) => state.housekeeping.rules);
  const templates = useAppSelector((state) => state.housekeeping.templates);
  const loading = useAppSelector((state) => state.housekeeping.loading);
  const error = useAppSelector((state) => state.housekeeping.error);

  // Local state
  const [listState, setListState] = useState<RulesListState>({
    filters: {
      searchTerm: '',
      templateId: undefined,
      triggerType: undefined,
      isActive: undefined,
      targetJobTag: undefined,
    },
    selectedRules: [],
    page: 0,
    pageSize: 10,
    sortBy: 'priority',
    sortOrder: 'asc',
  });

  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<CleaningRule | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [ruleToTest, setRuleToTest] = useState<CleaningRule | null>(null);

  // Rule testing hook
  const { testRule, isLoading: isTestingRule, result: testResult } = useRuleTesting(campId);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchRules({ campId }));
    dispatch(fetchTemplates({ campId }));
  }, [dispatch, campId]);

  // Filter and sort rules
  const filteredAndSortedRules = useMemo(() => {
    let filtered = [...rules];

    // Apply filters
    if (listState.filters.searchTerm) {
      const term = listState.filters.searchTerm.toLowerCase();
      filtered = filtered.filter((rule) =>
        rule.name.toLowerCase().includes(term)
      );
    }

    if (listState.filters.templateId) {
      filtered = filtered.filter((rule) => rule.templateId === listState.filters.templateId);
    }

    if (listState.filters.triggerType) {
      filtered = filtered.filter((rule) => rule.triggerType === listState.filters.triggerType);
    }

    if (listState.filters.isActive !== undefined) {
      filtered = filtered.filter((rule) => rule.isActive === listState.filters.isActive);
    }

    if (listState.filters.targetJobTag !== undefined && listState.filters.targetJobTag !== null) {
      filtered = filtered.filter((rule) => rule.targetJobTag === listState.filters.targetJobTag);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (listState.sortBy) {
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

      return listState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [rules, listState.filters, listState.sortBy, listState.sortOrder]);

  // Paginate results
  const paginatedRules = useMemo(() => {
    const startIndex = listState.page * listState.pageSize;
    return filteredAndSortedRules.slice(startIndex, startIndex + listState.pageSize);
  }, [filteredAndSortedRules, listState.page, listState.pageSize]);

  const totalPages = Math.ceil(filteredAndSortedRules.length / listState.pageSize);

  // Handlers
  const handleFilterChange = (
    key: keyof RulesListState['filters'],
    value: RulesListState['filters'][keyof RulesListState['filters']]
  ) => {
    setListState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 0, // Reset to first page
    }));
  };

  const handleSortChange = (sortBy: RulesListState['sortBy']) => {
    setListState((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setListState((prev) => ({ ...prev, page: page - 1 }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ruleId: string) => {
    setAnchorEl((prev) => ({ ...prev, [ruleId]: event.currentTarget }));
  };

  const handleMenuClose = (ruleId: string) => {
    setAnchorEl((prev) => ({ ...prev, [ruleId]: null }));
  };

  const handleEdit = (ruleId: string) => {
    navigate(`/housekeeping/rules/${ruleId}`);
  };

  const handleCreate = () => {
    navigate('/housekeeping/rules/new');
  };

  const handleDuplicate = async (rule: CleaningRule) => {
    try {
      const duplicatedRule = {
        ...rule,
        name: `${rule.name} (Copia)`,
        isActive: false,
      };

      // Remove id and timestamps
      const { id, createdAt, updatedAt, ...ruleData } = duplicatedRule;

      await dispatch(createRule(ruleData)).unwrap();
      enqueueSnackbar('Regla duplicada exitosamente', { variant: 'success' });
      handleMenuClose(rule.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      enqueueSnackbar(`Error al duplicar: ${message}`, { variant: 'error' });
    }
  };

  const handleDeleteClick = (rule: CleaningRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
    handleMenuClose(rule.id);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    try {
      await dispatch(deleteRule(ruleToDelete.id)).unwrap();
      enqueueSnackbar('Regla eliminada exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      enqueueSnackbar(`Error al eliminar: ${message}`, { variant: 'error' });
    }
  };

  const handleToggleActive = async (rule: CleaningRule) => {
    try {
      await dispatch(updateRule({
        ...rule,
        isActive: !rule.isActive,
      })).unwrap();
      enqueueSnackbar(
        `Regla ${rule.isActive ? 'desactivada' : 'activada'} exitosamente`,
        { variant: 'success' }
      );
      handleMenuClose(rule.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      enqueueSnackbar(`Error al cambiar estado: ${message}`, { variant: 'error' });
    }
  };

  const handleTestClick = (rule: CleaningRule) => {
    setRuleToTest(rule);
    setTestDialogOpen(true);
    handleMenuClose(rule.id);
  };

  const handleTestClose = () => {
    setTestDialogOpen(false);
    setRuleToTest(null);
  };

  const handleRuleSelection = (ruleId: string) => {
    setListState((prev) => ({
      ...prev,
      selectedRules: prev.selectedRules.includes(ruleId)
        ? prev.selectedRules.filter((id) => id !== ruleId)
        : [...prev.selectedRules, ruleId],
    }));
  };

  const handleBulkActivate = async (activate: boolean) => {
    try {
      const updates = listState.selectedRules.map((ruleId) => {
        const rule = rules.find((r) => r.id === ruleId);
        if (rule) {
          return dispatch(updateRule({ ...rule, isActive: activate })).unwrap();
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
      enqueueSnackbar(
        `${listState.selectedRules.length} regla${listState.selectedRules.length !== 1 ? 's' : ''} ${activate ? 'activadas' : 'desactivadas'}`,
        { variant: 'success' }
      );
      setListState((prev) => ({ ...prev, selectedRules: [] }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      enqueueSnackbar(`Error en acción masiva: ${message}`, { variant: 'error' });
    }
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Reglas de Limpieza
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredAndSortedRules.length} regla{filteredAndSortedRules.length !== 1 ? 's' : ''} encontrada{filteredAndSortedRules.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/housekeeping/rules/new')}
          size="large"
          sx={{
            bgcolor: '#415EDE',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Nueva Regla
        </Button>
      </Box>

      {/* Alert informativo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Las reglas de limpieza están en versión beta. La conexión con el backend se activará próximamente.
        </Typography>
      </Alert>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar por nombre"
              value={listState.filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': { backgroundColor: 'white' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={listState.filters.templateId || ''}
                onChange={(e) => handleFilterChange('templateId', e.target.value || undefined)}
                label="Template"
                sx={{ bgcolor: 'white' }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'white',
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Trigger</InputLabel>
              <Select
                value={listState.filters.triggerType || ''}
                onChange={(e) => handleFilterChange('triggerType', e.target.value || undefined)}
                label="Tipo de Trigger"
                sx={{ bgcolor: 'white' }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'white',
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="interval">Intervalo</MenuItem>
                <MenuItem value="checkout">Checkout</MenuItem>
                <MenuItem value="checkin">Checkin</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={listState.filters.isActive === undefined ? '' : String(listState.filters.isActive)}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                label="Estado"
                sx={{ bgcolor: 'white' }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'white',
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activa</MenuItem>
                <MenuItem value="false">Inactiva</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={listState.filters.targetJobTag ?? ''}
                onChange={(e) => handleFilterChange('targetJobTag', (e.target.value as JobTagValue) || undefined)}
                label="Categoría"
                sx={{ bgcolor: 'white' }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'white',
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="CategoriaA">Gerente</MenuItem>
                <MenuItem value="CategoriaB">Supervisor</MenuItem>
                <MenuItem value="CategoriaC">Trabajador</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Tooltip title="Limpiar filtros">
              <IconButton
                onClick={() => setListState((prev) => ({
                  ...prev,
                  filters: {
                    searchTerm: '',
                    templateId: undefined,
                    triggerType: undefined,
                    isActive: undefined,
                    targetJobTag: undefined,
                  },
                  page: 0,
                }))}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions */}
      {listState.selectedRules.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'white' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">
              {listState.selectedRules.length} seleccionada{listState.selectedRules.length !== 1 ? 's' : ''}
            </Typography>
            <Button
              size="small"
              startIcon={<ActiveIcon />}
              onClick={() => handleBulkActivate(true)}
            >
              Activar
            </Button>
            <Button
              size="small"
              startIcon={<InactiveIcon />}
              onClick={() => handleBulkActivate(false)}
            >
              Desactivar
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Rules Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : paginatedRules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron reglas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ mt: 2 }}
          >
            Crear Primera Regla
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedRules.map((rule) => (
              <Grid item xs={12} key={rule.id}>
                <Card sx={{ bgcolor: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Checkbox
                        checked={listState.selectedRules.includes(rule.id)}
                        onChange={() => handleRuleSelection(rule.id)}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h6" component="h3">
                            {rule.name}
                          </Typography>
                          <Chip
                            label={rule.isActive ? 'Activa' : 'Inactiva'}
                            color={rule.isActive ? 'success' : 'default'}
                            size="small"
                            icon={rule.isActive ? <ActiveIcon /> : <InactiveIcon />}
                          />
                          <Chip
                            label={`Prioridad: ${rule.priority}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Template
                            </Typography>
                            <Typography variant="body2">
                              {rule.templateName || 'Sin especificar'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <Typography variant="caption" color="text.secondary">
                              Trigger
                            </Typography>
                            <Typography variant="body2">
                              {formatTriggerDescription(rule)}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} md={2}>
                            <Typography variant="caption" color="text.secondary">
                              Aplica a
                            </Typography>
                            <Typography variant="body2">
                              {formatTargetDescription(rule)}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} md={2}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Categoría
                            </Typography>
                            <Chip
                              label={formatJobTag(rule.targetJobTag)}
                              color={getJobTagColor(rule.targetJobTag)}
                              size="small"
                            />
                          </Grid>

                          <Grid item xs={12} md={2}>
                            <Typography variant="caption" color="text.secondary">
                              Creada
                            </Typography>
                            <Typography variant="body2">
                              {new Date(rule.createdAt).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <IconButton
                        onClick={(e) => handleMenuOpen(e, rule.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl[rule.id]}
                        open={Boolean(anchorEl[rule.id])}
                        onClose={() => handleMenuClose(rule.id)}
                        PaperProps={{
                          sx: {
                            bgcolor: 'white',
                            border: '6px solid #f3f4f6',
                          },
                        }}
                      >
                        <MenuItem onClick={() => handleEdit(rule.id)}>
                          <ListItemIcon>
                            <img src="./assets/icons/edit-black.png" alt="" />
                          </ListItemIcon>
                          <ListItemText>Editar</ListItemText>
                        </MenuItem>

                        <MenuItem onClick={() => handleDuplicate(rule)}>
                          <ListItemIcon>
                            <DuplicateIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Duplicar</ListItemText>
                        </MenuItem>

                        <MenuItem onClick={() => handleToggleActive(rule)}>
                          <ListItemIcon>
                            <ToggleIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>
                            {rule.isActive ? 'Desactivar' : 'Activar'}
                          </ListItemText>
                        </MenuItem>

                        <MenuItem onClick={() => handleTestClick(rule)}>
                          <ListItemIcon>
                            <TestIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Probar</ListItemText>
                        </MenuItem>

                        <Divider />

                        <MenuItem onClick={() => handleDeleteClick(rule)}>
                          <ListItemIcon>
                            <img src="./assets/icons/delete.png" alt="" />
                          </ListItemIcon>
                          <ListItemText>Eliminar</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={listState.page + 1}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la regla "{ruleToDelete?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={handleTestClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Probar Regla: {ruleToTest?.name}
        </DialogTitle>
        <DialogContent>
          {ruleToTest && (
            <RuleTester
              rule={ruleToTest}
              onTest={testRule}
              isLoading={isTestingRule}
              testResult={testResult}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTestClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RulesListScreen;
