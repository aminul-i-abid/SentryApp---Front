/**
 * RuleConfiguratorScreen - Main Rule Configuration Screen
 * FASE 5.3 - Housekeeping Configuration
 *
 * Main configurator screen with vertical tab navigation
 * Features:
 * - Vertical tab navigation: Basic, Trigger, Target, Test
 * - Auto-save every 2 seconds with debounce
 * - Unsaved changes warning on navigate away
 * - Validation before save
 * - Success/error notifications
 * - Test panel (side drawer)
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
  Grid,
  Drawer,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Stack,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  BugReport as TestIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createRule, updateRule, fetchTemplates, fetchRules } from '@/store/housekeeping/housekeepingThunks';
import useUser from '@auth/useUser';
import { useRuleConfigurator, useTargetsData, useRuleTesting } from './hooks';
import {
  RuleBasicInfo,
  TriggerConditionEditor,
  TargetSelector,
  RulePreview,
  RuleTester,
  RuleActions,
} from './components';
import type { RuleConfiguratorState } from './types/ruleConfiguratorTypes';
import type { CleaningRule } from '@/store/housekeeping/housekeepingTypes';
import TopbarHeader from '@/components/TopbarHeader';
import TabButtonComp from './components/TabButtonComp';

/**
 * Tab panel component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ─── LOCAL COMPONENTS: Horizontal Tabs UI ─────────────────────────────
const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void; }> = ({ active, label, onClick }) => (
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

const RuleConfiguratorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: ruleId } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';
  const isEditMode = ruleId && ruleId !== 'new';

  const templates = useAppSelector((state) => state.housekeeping.templates);
  const rules = useAppSelector((state) => state.housekeeping.rules);
  const storeLoading = useAppSelector((state) => state.housekeeping.loading);

  const [activeTab, setActiveTab] = useState(0);
  const [testPanelOpen, setTestPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  const {
    state,
    setState,
    isLoading: loadingRule,
    error: ruleError,
    saveRule,
  } = useRuleConfigurator(isEditMode ? ruleId : undefined);

  const { blocks, rooms, isLoading: loadingTargets } = useTargetsData(campId);
  const { testRule, isLoading: isTestingRule, result: testResult } = useRuleTesting(campId);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(state.rule));

  const validateRule = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!state.rule.name || state.rule.name.trim() === '') {
      errors.name = 'El nombre de la regla es requerido';
    }

    if (!state.rule.campId) {
      errors.campId = 'Campamento es requerido';
    }

    if (!state.rule.templateId) {
      errors.templateId = 'Template es requerido';
    }

    if (state.rule.priority < 0 || state.rule.priority > 100) {
      errors.priority = 'Prioridad debe estar entre 0 y 100';
    }

    if (state.rule.triggerType === 'interval' && (!state.rule.daysInterval || state.rule.daysInterval <= 0)) {
      errors.daysInterval = 'Intervalo de días es requerido para este trigger';
    }

    if (state.rule.appliesTo !== 'camp' && (!state.rule.targetIds || state.rule.targetIds.trim() === '')) {
      errors.targetIds = `La selección de ${state.rule.appliesTo === 'block' ? 'Pabellones' : 'Habitaciones'} es requerida`;
    }

    return errors;
  }, [state.rule]);

  useEffect(() => {
    dispatch(fetchTemplates({ campId }));
    dispatch(fetchRules({ campId }));
  }, [dispatch, campId]);

  useEffect(() => {
    if (campId && !state.rule.campId) {
      setState((prev) => ({
        ...prev,
        rule: { ...prev.rule, campId },
      }));
    }
  }, [campId, state.rule.campId, setState]);

  useEffect(() => {
    if (isEditMode && rules.length > 0) {
      const existingRule = rules.find((r) => r.id === ruleId);
      if (existingRule) {
        setState((prev) => ({
          ...prev,
          rule: {
            id: existingRule.id,
            name: existingRule.name,
            campId: existingRule.campId,
            templateId: existingRule.templateId,
            priority: existingRule.priority,
            triggerType: existingRule.triggerType,
            daysInterval: existingRule.daysInterval,
            onCheckout: existingRule.onCheckout,
            onCheckin: existingRule.onCheckin,
            appliesTo: existingRule.appliesTo,
            targetIds: existingRule.targetIds,
            targetJobTag: existingRule.targetJobTag,
            isActive: existingRule.isActive,
          },
          selectedTargets: existingRule.targetIds ? existingRule.targetIds.split(',') : [],
          availableTemplates: templates,
          availableBlocks: blocks,
          availableRooms: rooms,
        }));
        lastSavedRef.current = JSON.stringify(existingRule);
      }
    }
  }, [isEditMode, ruleId, rules, templates, blocks, rooms, setState]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      availableTemplates: templates,
      availableBlocks: blocks,
      availableRooms: rooms,
    }));
  }, [templates, blocks, rooms, setState]);

  useEffect(() => {
    const currentState = JSON.stringify(state.rule);
    if (currentState !== lastSavedRef.current && state.rule.name && state.rule.templateId) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [state.rule]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges && !hasNavigated) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges, hasNavigated]);

  const handleAutoSave = useCallback(async () => {
    if (!isEditMode) return;
    const validationErrors = validateRule();
    if (Object.keys(validationErrors).length > 0) return;
    try {
      await dispatch(updateRule({
        id: state.rule.id!,
        ...state.rule,
      })).unwrap();
      lastSavedRef.current = JSON.stringify(state.rule);
      setState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [isEditMode, state.rule, dispatch, validateRule, setState]);

  const handleSave = async (draft: boolean = false) => {
    const validationErrors = validateRule();

    if (Object.keys(validationErrors).length > 0 && !draft) {
      enqueueSnackbar('Por favor corrija los errores antes de guardar', { variant: 'error' });
      setState((prev) => ({ ...prev, errors: validationErrors }));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...state.rule,
        isActive: draft ? false : state.rule.isActive, // If explicitly saving as draft, turn off isActive
      };

      let result: CleaningRule;
      if (isEditMode) {
        result = await dispatch(updateRule({ id: state.rule.id!, ...payload })).unwrap();
      } else {
        result = await dispatch(createRule(payload)).unwrap();
      }

      enqueueSnackbar(
        `Regla ${isEditMode ? 'actualizada' : 'creada'} exitosamente`,
        { variant: 'success' }
      );

      lastSavedRef.current = JSON.stringify(result);
      setState((prev) => ({
        ...prev,
        rule: { ...prev.rule, isActive: payload.isActive },
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        errors: {},
      }));

      // Navigate back to list after creation (only if not an autosave or draft keep-working)
      if (!isEditMode && !draft) {
        setHasNavigated(true);
        window.history.back();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = useCallback(() => {
    if (state.hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Tiene cambios sin guardar. ¿Está seguro que desea salir?'
      );
      if (!confirmed) return;
    }
    setHasNavigated(true);
    navigate('/housekeeping/configuration/reglas');
  }, [state.hasUnsavedChanges, navigate]);

  const updateRuleField = useCallback((field: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      rule: { ...prev.rule, [field]: value },
      hasUnsavedChanges: true,
    }));
  }, [setState]);

  const handleTargetsChange = useCallback((targets: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedTargets: targets,
      rule: { ...prev.rule, targetIds: targets.join(',') },
      hasUnsavedChanges: true,
    }));
  }, [setState]);

  const handleTestRule = async (params: any) => {
    return await testRule(params);
  };

  const isLoading = loadingRule || storeLoading || loadingTargets;

  if (isLoading && !state.rule.name) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (ruleError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{ruleError}</Alert>
        <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'white' }}>
      {/* ─── Top Bar (Welcome / User Info) ─── */}
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
            href="/housekeeping/configuration/reglas"
            onClick={(e) => { e.preventDefault(); handleBack(); }}
            sx={{ color: '#A1A1A1!important', fontWeight: 500, '&:hover': { color: '#415EDE' } }}
          >
            Reglas
          </Link>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#415EDE' }}>
            {isEditMode ? 'Editar Regla' : 'Nueva Regla'}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* ─── Main Content Zone (bg #f7f7f7) ─── */}
      <Box sx={{ bgcolor: '#f7f7f7', minHeight: 'calc(100vh - 160px)' }}>
        {/* ─── Page Header ─── */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={handleBack} sx={{ border: '1px solid #E5E7EB', borderRadius: '50%', padding: '6px', bgcolor: '#F7F7F7' }}>
              <img src="./assets/icons/arrow-left-01.png" alt="" />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
              {isEditMode ? 'Editar Regla' : 'Nueva Regla'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {state.hasUnsavedChanges && (
              <Chip label="Sin guardar" color="warning" size="small" variant="outlined" />
            )}

            <Button
              variant="outlined"
              onClick={() => setTestPanelOpen(true)}
              startIcon={<img src="./assets/icons/projector-01.png" alt="" />}
              sx={{
                borderColor: '#E5E7EB',
                color: '#374151',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '8px',
                bgcolor: 'white',
                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
              }}
            >
              Probar
            </Button>

            <Button
              variant="contained"
              onClick={() => handleSave(false)}
              disabled={isSaving || isLoading}
              endIcon={isSaving ? <CircularProgress size={16} /> : <img src="./assets/icons/save.png" alt="" />}
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
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
          {/* ─── Horizontal Tabs Navigation ─── */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 4, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 4 } }}>
            <TabButtonComp active={activeTab === 0} label="Información Básica" onClick={() => setActiveTab(0)} />
            <TabButtonComp active={activeTab === 1} label="Condiciones de Trigger" onClick={() => setActiveTab(1)} />
            <TabButtonComp active={activeTab === 2} label="Destinos" onClick={() => setActiveTab(2)} />
            <TabButtonComp active={activeTab === 3} label="Vista Previa" onClick={() => setActiveTab(3)} />
          </Box>

          {/* ─── Main Content Tabs ─── */}
          <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <RuleBasicInfo
              ruleName={state.rule.name}
              templateId={state.rule.templateId}
              priority={state.rule.priority}
              isActive={state.rule.isActive}
              targetJobTag={state.rule.targetJobTag}
              availableTemplates={templates}
              onChange={updateRuleField}
              errors={state.errors}
            />
          </Box>

          <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <TriggerConditionEditor
              triggerType={state.rule.triggerType}
              daysInterval={state.rule.daysInterval}
              onCheckout={state.rule.onCheckout}
              onCheckin={state.rule.onCheckin}
              onTriggerChange={(trigger) => {
                updateRuleField('triggerType', trigger.type);
                if (trigger.daysInterval) updateRuleField('daysInterval', trigger.daysInterval);
                updateRuleField('onCheckout', trigger.onCheckout);
                updateRuleField('onCheckin', trigger.onCheckin);
              }}
              errors={state.errors}
            />
          </Box>

          <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <TargetSelector
              appliesTo={state.rule.appliesTo}
              selectedTargets={state.selectedTargets}
              availableBlocks={blocks}
              availableRooms={rooms}
              onTargetsChange={handleTargetsChange}
              onScopeChange={(scope) => updateRuleField('appliesTo', scope)}
              errors={state.errors}
              isLoading={loadingTargets}
              selectedJobTag={state.rule.targetJobTag}
              onJobTagChange={(v) => updateRuleField('targetJobTag', v)}
            />
          </Box>

          <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
            <RulePreview
              rule={{
                name: state.rule.name,
                templateName: templates.find((t) => t.id === state.rule.templateId)?.name || 'Sin especificar',
                triggerType: state.rule.triggerType,
                triggerDescription: `${state.rule.triggerType}${state.rule.daysInterval ? ` (${state.rule.daysInterval} días)` : ''}`,
                appliesTo: state.rule.appliesTo,
                targetDescription: state.rule.appliesTo === 'camp' ? 'Todo el campamento' : `${state.selectedTargets.length} seleccionados`,
                priority: state.rule.priority,
                isActive: state.rule.isActive,
              }}
            />
          </Box>

          {/* ─── Footer Action Bar ─── */}
          <Box
            sx={{
              mt: 4,
              pt: 2,
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleBack}
                endIcon={<img src="./assets/icons/cancel-circle-red.png" alt="" />}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 500, border: "1px solid #D6454514", backgroundColor: "white", "&:hover": { bgcolor: "#F9FAFB" } }}
              >
                Cancelar
              </Button>
              <Button
                variant="outlined"
                onClick={() => setTestPanelOpen(true)}
                startIcon={<img src="./assets/icons/pencil-ruler.png" alt="" />}
                sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 500, color: '#000000ff', borderColor: '#1414141F', backgroundColor: "white", "&:hover": { bgcolor: "#F9FAFB" } }}
              >
                Probar Regla
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
                Guardar y Activar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Test Panel Drawer */}
      <Drawer
        anchor="right"
        open={testPanelOpen}
        onClose={() => setTestPanelOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Probar Regla
            </Typography>
            <IconButton onClick={() => setTestPanelOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {state.rule.templateId ? (
            <RuleTester
              rule={state.rule as any}
              onTest={handleTestRule}
              isLoading={isTestingRule}
              testResult={testResult}
            />
          ) : (
            <Alert severity="info">
              Seleccione un template para poder probar la regla
            </Alert>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default RuleConfiguratorScreen;
