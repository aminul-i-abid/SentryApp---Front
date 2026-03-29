/**
 * Template Editor Screen
 * Redesigned to match modern UI (Images 2, 3, 4)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
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
  Close as CloseIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Description as DescriptionIcon,
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
import TabButtonComp from './components/TabButtonComp';
import TopbarHeader from '@/components/TopbarHeader';

// ─── Pill Tab Button ─────────────────────────────
const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <Button
    onClick={onClick}
    sx={{
      borderRadius: '24px',
      px: 3,
      py: 1,
      minWidth: 'auto',
      bgcolor: active ? '#415EDE' : 'transparent',
      color: active ? 'white' : '#4B5563',
      border: '1px solid',
      borderColor: active ? '#415EDE' : '#E5E7EB',
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      boxShadow: 'none',
      whiteSpace: 'nowrap',
      '&:hover': {
        bgcolor: active ? '#354BB1' : '#F9FAFB',
        borderColor: active ? '#354BB1' : '#D1D5DB',
        boxShadow: 'none',
      }
    }}
  >
    {label}
  </Button>
);

const TemplateEditorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: templateId } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';
  const isEditMode = !!templateId && templateId !== 'new';

  const tareas = useAppSelector((state) => state.housekeeping.tareas);

  const [activeTab, setActiveTab] = useState(0);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

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

  const { categories, isLoading: loadingCategories } = useCategoriesData({ campId });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (campId && !state.template.campId) {
      setState((prev) => ({
        ...prev,
        template: { ...prev.template, campId },
      }));
    }
  }, [campId, state.template.campId, setState]);

  useEffect(() => {
    if (campId) {
      dispatch(fetchTareas({ campId: String(campId) }));
    }
  }, [dispatch, campId]);

  useEffect(() => {
    if (!hasUnsavedChanges || !isEditMode) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setAutoSaveError(null);
        await handleSave(true);
      } catch (err: unknown) {
        setAutoSaveError(err instanceof Error ? err.message : 'Error al guardar automáticamente');
      } finally {
        setIsSaving(false);
      }
    }, 2000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [hasUnsavedChanges, state, isEditMode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async (silent = false) => {
    try {
      const validation = validateTemplate(state);
      if (!validation.isValid) {
        if (!silent) {
          const firstError = Object.values(validation.errors)[0];
          enqueueSnackbar(firstError || 'Hay errores de validación', { variant: 'error' });
        }
        return;
      }
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

      let result;
      if (isEditMode) {
        result = await dispatch(updateTemplate({
          id: templateId!,
          name: state.template.name,
          categoryId: state.template.categoryId,
          priority: state.template.priority,
          isActive: state.template.isActive,
          items: itemsPayload,
        })).unwrap();
      } else {
        result = await dispatch(createTemplate({
          name: state.template.name,
          campId: state.template.campId,
          categoryId: state.template.categoryId,
          priority: state.template.priority,
          items: itemsPayload,
        })).unwrap();
      }

      if (!silent) {
        enqueueSnackbar(
          isEditMode ? 'Template actualizado exitosamente' : 'Template creado exitosamente',
          { variant: 'success' }
        );
        window.history.back();
      }

      setState((prev) => ({ ...prev, hasUnsavedChanges: false, lastSaved: new Date() }));
      return result;
    } catch (err: unknown) {
      if (!silent) {
        const message = err instanceof Error ? err.message : 'Error al guardar';
        enqueueSnackbar(`Error: ${message}`, { variant: 'error' });
      }
      throw err;
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/housekeeping/templates');
      setShowUnsavedDialog(true);
    } else {
      navigate('/housekeeping/templates');
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) navigate(pendingNavigation);
  };

  const handleSaveAndContinue = async () => {
    try {
      await handleSave();
      setShowUnsavedDialog(false);
      if (pendingNavigation) navigate(pendingNavigation);
    } catch (err) { /* handled */ }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

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

  const handleUpdateItems = useCallback(
    (updatedItems: TemplateEditorState['items']) => {
      setState((prev) => ({ ...prev, items: updatedItems, hasUnsavedChanges: true }));
    },
    [setState]
  );

  const handleAddItem = useCallback(() => {
    const newTempId = `temp_${crypto.randomUUID()}`;
    const newItem: ChecklistItemEditor = {
      id: newTempId, tempId: newTempId, description: '', inputType: 'checkbox',
      isMandatory: false, order: state.items.length + 1,
      requiresPhoto: false, requiresComment: false,
      isNew: true, isModified: false, isDeleted: false, errors: {},
    };
    setState((prev) => ({ ...prev, items: [...prev.items, newItem], hasUnsavedChanges: true }));
  }, [setState, state.items.length]);

  const handleAddItemFromTarea = useCallback(
    (tarea: HousekeepingTarea) => {
      const newTempId = `temp_${crypto.randomUUID()}`;
      const newItem: ChecklistItemEditor = {
        id: newTempId, tempId: newTempId, tareaId: tarea.id,
        description: tarea.nombre, inputType: 'checkbox', isMandatory: true,
        order: state.items.filter((i) => !i.isDeleted).length + 1,
        requiresPhoto: false, requiresComment: false,
        isNew: true, isModified: false, isDeleted: false, errors: {},
      };
      setState((prev) => ({ ...prev, items: [...prev.items, newItem], hasUnsavedChanges: true }));
    },
    [setState, state.items]
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  if (isLoading || loadingCategories) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'white' }}>
      {/* ─── Top Bar ─── */}
      <TopbarHeader />

      {/* ─── Breadcrumbs ─── */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 2, pb: 1.5, bgcolor: 'white' }}>
        <Breadcrumbs separator="›" sx={{ fontSize: '0.85rem' }}>
          <Link
            underline="hover"
            href="/housekeeping"
            onClick={(e) => { e.preventDefault(); navigate('/housekeeping'); }}
            sx={{ color: '#A1A1A1!important', fontWeight: 500, '&:hover': { color: '#415EDE' } }}
          >
            Housekeeping
          </Link>
          <Link
            underline="hover"
            href="/housekeeping/templates"
            onClick={(e) => { e.preventDefault(); handleBack(); }}
            sx={{ color: '#A1A1A1!important', fontWeight: 500, '&:hover': { color: '#415EDE' } }}
          >
            Plantillas
          </Link>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#415EDE' }}>
            {isEditMode ? 'Editar Template' : 'Nuevo Template'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* ─── Main Content Zone (#f7f7f7) ─── */}
      <Box sx={{ bgcolor: '#f7f7f7', minHeight: 'calc(100vh - 160px)' }}>
        {/* ─── Page Header ─── */}
        <Box
          sx={{
            px: { xs: 2, md: 4 }, py: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={handleBack} sx={{ border: '1px solid #E5E7EB', borderRadius: '50%', padding: '6px', bgcolor: '#F7F7F7' }}>
              <img src="./assets/icons/arrow-left-01.png" alt="" />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
                {isEditMode ? 'Editar Template' : 'Nuevo Template'}{' '}
                <Typography component="span" sx={{ fontWeight: 400, color: '#6B7280', fontSize: '0.9rem' }}>
                  ({state.template.name || 'Sin nombre'})
                </Typography>
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {isSaving && <Chip icon={<CircularProgress size={14} />} label="Guardando..." size="small" />}
            {!isSaving && hasUnsavedChanges && <Chip icon={<WarningIcon />} label="Sin guardar" size="small" color="warning" variant="outlined" />}
            {!isSaving && !hasUnsavedChanges && lastSaved && <Chip icon={<CheckIcon />} label="Guardado" size="small" color="success" variant="outlined" />}

            <Button
              variant="outlined"
              startIcon={<img src="./assets/icons/projector-01.png" alt="" />}

              sx={{
                borderColor: '#E5E7EB', color: '#374151', textTransform: 'none',
                fontWeight: 500, borderRadius: '8px', bgcolor: 'white',
                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
              }}
            >
              Probar
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              endIcon={isSaving ? <CircularProgress size={16} /> : <img src="./assets/icons/save.png" alt="" />}
              sx={{
                bgcolor: '#415EDE', color: 'white', textTransform: 'none',
                fontWeight: 500, borderRadius: '8px', boxShadow: 'none',
                '&:hover': { bgcolor: '#354BB1', boxShadow: 'none' }
              }}
            >
              Guardar
            </Button>
          </Stack>
        </Box>

        {error && (
          <Box sx={{ px: { xs: 2, md: 4 } }}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>
          </Box>
        )}

        <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
          {/* ─── Horizontal Tabs ─── */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 4, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 4 } }}>
            <TabButtonComp active={activeTab === 0} label="Información Básica" onClick={() => setActiveTab(0)} />
            <TabButtonComp active={activeTab === 1} label="Items del Checklist" onClick={() => setActiveTab(1)} />
            <TabButtonComp active={activeTab === 2} label="Vista Previa" onClick={() => setActiveTab(2)} />
          </Box>

          {/* ─── Tab Content ─── */}
          <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <TemplateBasicInfo
              template={state.template}
              categories={categories}
              onChange={handleUpdateBasicInfo}
              errors={state.errors}
            />
          </Box>

          <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <ChecklistItemsEditor
              items={state.items}
              onItemsChange={handleUpdateItems}
              onAddItem={handleAddItem}
              onAddItemFromTarea={handleAddItemFromTarea}
            />
          </Box>

          <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <TemplatePreview
              template={state.template}
              items={state.items}
              categoryName={getCategoryName(state.template.categoryId)}
            />
          </Box>

          {/* ─── Footer Action Bar ─── */}
          <Box
            sx={{
              mt: 4, pt: 2, borderTop: '1px solid #E5E7EB',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined" color="error" onClick={handleBack}
                endIcon={<img src="./assets/icons/cancel-circle-red.png" alt="" />}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 500, border: "1px solid #D6454514", backgroundColor: "white", "&:hover": { bgcolor: "#F9FAFB" } }}
              >
                Cancelar
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                startIcon={<img src="./assets/icons/projector-01.png" alt="" />}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 500, color: '#6B7280', borderColor: '#E5E7EB', bgcolor: "white", "&:hover": { bgcolor: "#F9FAFB" } }}
              >
                Borrador
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                endIcon={<img src="./assets/icons/save.png" alt="" />}
                sx={{
                  bgcolor: '#415EDE',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '8px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#354BB1', boxShadow: 'none' }
                }}
              >
                Guardar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Unsaved Changes Dialog ─── */}
      <Dialog open={showUnsavedDialog} onClose={handleCancelNavigation}>
        <DialogTitle>Cambios sin guardar</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hay cambios sin guardar en este template. ¿Qué desea hacer?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation}>Cancelar</Button>
          <Button onClick={handleDiscardChanges} color="error">Descartar cambios</Button>
          <Button onClick={handleSaveAndContinue} variant="contained" startIcon={<SaveIcon />}
            sx={{ bgcolor: '#415EDE', '&:hover': { bgcolor: '#354BB1' } }}
          >
            Guardar y continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditorScreen;
