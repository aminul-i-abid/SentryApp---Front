/**
 * Template Editor Screen
 * FASE 5.3.7 - Housekeeping Configuration
 *
 * Main editor screen for creating/editing checklist templates
 * Features:
 * - Vertical tab navigation: Basic, Items, Preview, Export
 * - Auto-save every 2 seconds with debounce
 * - Unsaved changes warning on navigate away
 * - Validation before save
 * - Success/error notifications
 * - Back button to list
 *
 * Tabs:
 * - Basic: Template name, category, priority, active status
 * - Items: Checklist items with drag-and-drop reordering
 * - Preview: Visual preview of template with statistics
 * - Export: Import/Export functionality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTemplate, updateTemplate, fetchTemplates } from '@/store/housekeeping';
import type { CreateTemplateRequest, UpdateTemplateRequest, HousekeepingTarea } from '@/store/housekeeping/housekeepingTypes';
import { fetchTareas } from '@/store/housekeeping/housekeepingThunks';
import useUser from '@auth/useUser';
import { useTemplateEditor, useCategoriesData } from './hooks';
import {
  TemplateBasicInfo,
  ChecklistItemsEditor,
  TemplatePreview,
  TemplateImportExport,
  TemplateActions,
} from './components';
import type { TemplateEditorState, ChecklistItemEditor } from './types/templateEditorTypes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TemplateEditorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: templateId } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';
  const isEditMode = !!templateId && templateId !== 'new';

  // Tareas maestras from Redux store (for "Agregar desde Tareas" dialog)
  const tareas = useAppSelector((state) => state.housekeeping.tareas);

  // Active tab state
  const [activeTab, setActiveTab] = useState(0);

  // Unsaved changes dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Template editor hook
  const {
    state,
    setState,
    isLoading,
    error,
    saveTemplate,
    validateTemplate,
    hasUnsavedChanges,
    lastSaved,
  } = useTemplateEditor({ templateId, campId });

  // Categories hook
  const { categories, isLoading: loadingCategories } = useCategoriesData({ campId });

  // Auto-save ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  // Set campId on mount
  useEffect(() => {
    if (campId && !state.template.campId) {
      setState((prev) => ({
        ...prev,
        template: { ...prev.template, campId },
      }));
    }
  }, [campId, state.template.campId, setState]);

  // Load tareas maestras for the "Agregar desde Tareas" dialog
  useEffect(() => {
    if (campId) {
      dispatch(fetchTareas({ campId: String(campId) }));
    }
  }, [dispatch, campId]);

  // Auto-save with debounce (2 seconds)
  useEffect(() => {
    if (!hasUnsavedChanges || !isEditMode) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setAutoSaveError(null);
        await handleSave(true); // silent save
        console.log('[Auto-save] Template saved successfully');
      } catch (err: unknown) {
        console.error('[Auto-save] Error:', err);
        setAutoSaveError(err instanceof Error ? err.message : 'Error al guardar automáticamente');
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, state, isEditMode]);

  // Prevent navigation if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Save handler
  const handleSave = async (silent = false) => {
    try {
      // Validate
      const validation = validateTemplate(state);
      if (!validation.isValid) {
        if (!silent) {
          const firstError = Object.values(validation.errors)[0];
          enqueueSnackbar(firstError || 'Hay errores de validación', { variant: 'error' });
        }
        return;
      }

      // Prepare items payload
      const itemsPayload = state.items
        .filter((item) => !item.isDeleted)
        .map((item, index) => ({
          description: item.description,
          inputType: item.inputType,
          isMandatory: item.isMandatory,
          order: item.order ?? index,
          requiresPhoto: item.requiresPhoto || false,
          requiresComment: item.requiresComment || false,
          tareaId: item.tareaId ? Number(item.tareaId) : undefined,
        }));

      // Dispatch thunk
      let result;
      if (isEditMode) {
        const updateRequest: UpdateTemplateRequest = {
          id: templateId!,
          name: state.template.name,
          categoryId: state.template.categoryId,
          priority: state.template.priority,
          isActive: state.template.isActive,
          items: itemsPayload,
        };
        result = await dispatch(updateTemplate(updateRequest)).unwrap();
      } else {
        const createRequest: CreateTemplateRequest = {
          name: state.template.name,
          campId: state.template.campId,
          categoryId: state.template.categoryId,
          priority: state.template.priority,
          items: itemsPayload,
        };
        result = await dispatch(createTemplate(createRequest)).unwrap();
      }

      // Success feedback
      if (!silent) {
        enqueueSnackbar(
          isEditMode ? 'Template actualizado exitosamente' : 'Template creado exitosamente',
          { variant: 'success' }
        );

        // Navigate back to list
        window.history.back();
      }

      // Update local state to mark as saved
      setState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
      }));

      return result;
    } catch (err: unknown) {
      if (!silent) {
        const message = err instanceof Error ? err.message : 'Error al guardar';
        enqueueSnackbar(`Error: ${message}`, { variant: 'error' });
      }
      throw err;
    }
  };

  // Back handler with unsaved changes check
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/housekeeping/templates');
      setShowUnsavedDialog(true);
    } else {
      navigate('/housekeeping/templates');
    }
  };

  // Unsaved dialog handlers
  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      await handleSave();
      setShowUnsavedDialog(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
      }
    } catch (err) {
      // Error already handled in handleSave
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Update template basic info
  const handleUpdateBasicInfo = useCallback(
    (field: string, value: string | number | boolean | null) => {
      setState((prev) => ({
        ...prev,
        template: { ...prev.template, [field]: value },
        hasUnsavedChanges: true,
      }));
    },
    [setState]
  );

  // Update items
  const handleUpdateItems = useCallback(
    (updatedItems: TemplateEditorState['items']) => {
      setState((prev) => ({
        ...prev,
        items: updatedItems,
        hasUnsavedChanges: true,
      }));
    },
    [setState]
  );

  // Add new item
  const handleAddItem = useCallback(() => {
    const newTempId = `temp_${crypto.randomUUID()}`;
    const newItem: ChecklistItemEditor = {
      id: newTempId,
      tempId: newTempId,
      description: '',
      inputType: 'checkbox',
      isMandatory: false,
      order: state.items.length + 1,
      requiresPhoto: false,
      requiresComment: false,
      isNew: true,
      isModified: false,
      isDeleted: false,
      errors: {},
    };
    setState((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      hasUnsavedChanges: true,
    }));
  }, [setState, state.items.length]);

  // Add item pre-populated from a HousekeepingTarea maestra
  const handleAddItemFromTarea = useCallback(
    (tarea: HousekeepingTarea) => {
      const newTempId = `temp_${crypto.randomUUID()}`;
      const newItem: ChecklistItemEditor = {
        id: newTempId,
        tempId: newTempId,
        tareaId: tarea.id,
        description: tarea.nombre,
        inputType: 'checkbox',
        isMandatory: true,
        order: state.items.filter((i) => !i.isDeleted).length + 1,
        requiresPhoto: false,
        requiresComment: false,
        isNew: true,
        isModified: false,
        isDeleted: false,
        errors: {},
      };
      setState((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
        hasUnsavedChanges: true,
      }));
    },
    [setState, state.items]
  );

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  // Loading state
  if (isLoading || loadingCategories) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleBack}
            sx={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            Templates
          </Link>
          <Typography variant="body2" color="text.primary">
            {isEditMode ? 'Editar Template' : 'Nuevo Template'}
          </Typography>
        </Breadcrumbs>

        {/* Title and actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4">
                  {isEditMode ? 'Editar Template' : 'Nuevo Template'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {state.template.name || 'Sin nombre'}
                  {state.template.categoryId && ` • ${getCategoryName(state.template.categoryId)}`}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Save status indicator */}
          <Stack direction="row" spacing={2} alignItems="center">
            {isSaving && (
              <Chip
                icon={<CircularProgress size={16} />}
                label="Guardando..."
                size="small"
                color="default"
              />
            )}
            {!isSaving && hasUnsavedChanges && (
              <Chip
                icon={<WarningIcon />}
                label="Cambios sin guardar"
                size="small"
                color="warning"
              />
            )}
            {!isSaving && !hasUnsavedChanges && lastSaved && (
              <Chip
                icon={<CheckIcon />}
                label={`Guardado ${lastSaved.toLocaleTimeString()}`}
                size="small"
                color="success"
              />
            )}
            {autoSaveError && (
              <Chip
                icon={<WarningIcon />}
                label="Error al auto-guardar"
                size="small"
                color="error"
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ minHeight: 600, backgroundColor: "white" }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="template editor tabs"
          >
            <Tab label="Información Básica" id="template-tab-0" />
            <Tab label="Items del Checklist" id="template-tab-1" />
            <Tab label="Vista Previa" id="template-tab-2" />
            {/* <Tab label="Importar/Exportar" id="template-tab-3" /> */}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ px: 3 }}>
          {/* Basic Info Tab */}
          <TabPanel value={activeTab} index={0}>
            <TemplateBasicInfo
              template={state.template}
              categories={categories}
              onChange={handleUpdateBasicInfo}
              errors={state.errors}
            />
          </TabPanel>

          {/* Items Tab */}
          <TabPanel value={activeTab} index={1}>
            <ChecklistItemsEditor
              items={state.items}
              onItemsChange={handleUpdateItems}
              onAddItem={handleAddItem}
              onAddItemFromTarea={handleAddItemFromTarea}
            />
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={activeTab} index={2}>
            <TemplatePreview
              template={state.template}
              items={state.items}
              categoryName={getCategoryName(state.template.categoryId)}
            />
          </TabPanel>

          {/* Import/Export Tab */}
          {/* <TabPanel value={activeTab} index={3}>
            <TemplateImportExport
              template={state.template}
              items={state.items}
              onImport={async (importedTemplate) => {
                setState((prev) => ({
                  ...prev,
                  template: {
                    ...prev.template,
                    name: importedTemplate.template.name,
                    categoryId: importedTemplate.template.categoryId,
                    priority: importedTemplate.template.priority,
                  },
                  items: importedTemplate.template.items.map((item, index) => {
                    const tempId = `temp_${crypto.randomUUID()}`;
                    return {
                      id: tempId,
                      tempId,
                      description: item.description,
                      inputType: item.inputType,
                      isMandatory: item.isMandatory,
                      order: item.order ?? index,
                      requiresPhoto: false,
                      requiresComment: false,
                      isNew: true,
                      isModified: false,
                      isDeleted: false,
                      errors: {},
                    };
                  }),
                  hasUnsavedChanges: true,
                }));
                enqueueSnackbar('Template importado exitosamente', { variant: 'success' });
              }}
            />
          </TabPanel> */}
        </Box>

        {/* Actions Footer */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <TemplateActions
            onSave={async () => handleSave(false)}
            onSaveDraft={async () => handleSave(true)}
            onCancel={handleBack}
            onExport={() => setActiveTab(3)}
            onImport={() => setActiveTab(3)}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            isValid={validateTemplate(state).isValid}
          />
        </Box>
      </Paper>

      {/* Unsaved Changes Dialog */}
      <Dialog
        open={showUnsavedDialog}
        onClose={handleCancelNavigation}
      >
        <DialogTitle>Cambios sin guardar</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hay cambios sin guardar en este template. ¿Qué desea hacer?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation}>
            Cancelar
          </Button>
          <Button onClick={handleDiscardChanges} color="error">
            Descartar cambios
          </Button>
          <Button onClick={handleSaveAndContinue} variant="contained" startIcon={<SaveIcon />}>
            Guardar y continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TemplateEditorScreen;
