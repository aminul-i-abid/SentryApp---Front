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

/**
 * Tab panel component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`rule-tabpanel-${index}`}
    aria-labelledby={`rule-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

/**
 * RuleConfiguratorScreen Component
 */
const RuleConfiguratorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: ruleId } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { data: user } = useUser();

  const campId = user?.companyId || '1';
  const isEditMode = ruleId && ruleId !== 'new';

  // Redux state
  const templates = useAppSelector((state) => state.housekeeping.templates);
  const rules = useAppSelector((state) => state.housekeeping.rules);
  const storeLoading = useAppSelector((state) => state.housekeeping.loading);

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [testPanelOpen, setTestPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Custom hooks
  const {
    state,
    setState,
    isLoading: loadingRule,
    error: ruleError,
    saveRule,
  } = useRuleConfigurator(isEditMode ? ruleId : undefined);

  const { blocks, rooms, isLoading: loadingTargets } = useTargetsData(campId);

  const { testRule, isLoading: isTestingRule, result: testResult } = useRuleTesting(campId);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(state.rule));

  // Validate rule function
  const validateRule = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!state.rule.name || state.rule.name.trim() === '') {
      errors.name = 'Rule name is required';
    }

    if (!state.rule.campId) {
      errors.campId = 'Camp is required';
    }

    if (!state.rule.templateId) {
      errors.templateId = 'Template is required';
    }

    if (state.rule.priority < 0 || state.rule.priority > 100) {
      errors.priority = 'Priority must be between 0 and 100';
    }

    if (state.rule.triggerType === 'interval' && (!state.rule.daysInterval || state.rule.daysInterval <= 0)) {
      errors.daysInterval = 'Days interval is required and must be greater than 0 for interval trigger';
    }

    if (state.rule.appliesTo !== 'camp' && (!state.rule.targetIds || state.rule.targetIds.trim() === '')) {
      errors.targetIds = `${state.rule.appliesTo === 'block' ? 'Block' : 'Room'} selection is required`;
    }

    return errors;
  }, [state.rule]);

  // Load templates and rules on mount
  useEffect(() => {
    dispatch(fetchTemplates({ campId }));
    dispatch(fetchRules({ campId }));
  }, [dispatch, campId]);

  // Set campId in rule state
  useEffect(() => {
    if (campId && !state.rule.campId) {
      setState((prev) => ({
        ...prev,
        rule: { ...prev.rule, campId },
      }));
    }
  }, [campId, state.rule.campId, setState]);

  // Load existing rule in edit mode
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

  // Update available data in state
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      availableTemplates: templates,
      availableBlocks: blocks,
      availableRooms: rooms,
    }));
  }, [templates, blocks, rooms, setState]);

  // Auto-save with debounce
  useEffect(() => {
    const currentState = JSON.stringify(state.rule);

    if (currentState !== lastSavedRef.current && state.rule.name && state.rule.templateId) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for 2 seconds
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

  // Warn before leaving with unsaved changes
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

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    if (!isEditMode) return; // Only auto-save in edit mode

    const validationErrors = validateRule();
    if (Object.keys(validationErrors).length > 0) {
      return; // Don't auto-save if invalid
    }

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
      // Silent fail for auto-save
      console.error('Auto-save failed:', error);
    }
  }, [isEditMode, state.rule, dispatch, validateRule, setState]);

  // Manual save handler
  const handleSave = async () => {
    const validationErrors = validateRule();

    if (Object.keys(validationErrors).length > 0) {
      enqueueSnackbar('Por favor corrija los errores antes de guardar', { variant: 'error' });
      setState((prev) => ({
        ...prev,
        errors: validationErrors,
      }));
      return;
    }

    setIsSaving(true);

    try {
      let result: CleaningRule;

      if (isEditMode) {
        result = await dispatch(updateRule({
          id: state.rule.id!,
          ...state.rule,
        })).unwrap();
      } else {
        result = await dispatch(createRule(state.rule)).unwrap();
      }

      enqueueSnackbar(
        `Regla ${isEditMode ? 'actualizada' : 'creada'} exitosamente`,
        { variant: 'success' }
      );

      lastSavedRef.current = JSON.stringify(result);
      setState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        errors: {},
      }));

      // Navigate back to list after creation
      if (!isEditMode) {
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

  // Navigate back with unsaved changes check
  const handleBack = useCallback(() => {
    if (state.hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Tiene cambios sin guardar. ¿Está seguro que desea salir?'
      );
      if (!confirmed) return;
    }

    setHasNavigated(true);
    navigate('/housekeeping/rules');
  }, [state.hasUnsavedChanges, navigate]);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Update rule field
  const updateRuleField = useCallback((field: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      rule: { ...prev.rule, [field]: value },
      hasUnsavedChanges: true,
    }));
  }, [setState]);

  // Update selected targets
  const handleTargetsChange = useCallback((targets: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedTargets: targets,
      rule: {
        ...prev.rule,
        targetIds: targets.join(','),
      },
      hasUnsavedChanges: true,
    }));
  }, [setState]);

  // Test rule handler
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            color="inherit"
            href="/housekeeping"
            onClick={(e) => {
              e.preventDefault();
              navigate('/housekeeping');
            }}
          >
            Housekeeping
          </Link>
          <Link
            color="inherit"
            href="/housekeeping/rules"
            onClick={(e) => {
              e.preventDefault();
              handleBack();
            }}
          >
            Reglas
          </Link>
          <Typography color="text.primary">
            {isEditMode ? 'Editar Regla' : 'Nueva Regla'}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1">
                {isEditMode ? 'Editar Regla' : 'Nueva Regla'}
              </Typography>
              {state.rule.name && (
                <Typography variant="body2" color="text.secondary">
                  {state.rule.name}
                </Typography>
              )}
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {state.lastSaved && (
              <Typography variant="caption" color="text.secondary">
                Guardado: {state.lastSaved.toLocaleTimeString()}
              </Typography>
            )}

            {state.hasUnsavedChanges && (
              <Chip
                label="Cambios sin guardar"
                color="warning"
                size="small"
                icon={<InfoIcon />}
              />
            )}

            <Button
              variant="outlined"
              startIcon={<TestIcon />}
              onClick={() => setTestPanelOpen(true)}
            >
              Probar
            </Button>

            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              {isEditMode ? 'Guardar' : 'Crear'}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Sidebar - Tabs */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ position: 'sticky', top: 80 }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                minHeight: 400,
              }}
            >
              <Tab
                label="Información Básica"
                id="rule-tab-0"
                aria-controls="rule-tabpanel-0"
              />
              <Tab
                label="Condiciones de Trigger"
                id="rule-tab-1"
                aria-controls="rule-tabpanel-1"
              />
              <Tab
                label="Destinos"
                id="rule-tab-2"
                aria-controls="rule-tabpanel-2"
              />
              <Tab
                label="Vista Previa"
                id="rule-tab-3"
                aria-controls="rule-tabpanel-3"
              />
            </Tabs>
          </Paper>
        </Grid>

        {/* Main Content Area - Tab Panels */}
        <Grid item xs={12} md={9}>
          <Paper>
            {/* Basic Info Tab */}
            <TabPanel value={activeTab} index={0}>
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
            </TabPanel>

            {/* Trigger Tab */}
            <TabPanel value={activeTab} index={1}>
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
            </TabPanel>

            {/* Target Tab */}
            <TabPanel value={activeTab} index={2}>
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
            </TabPanel>

            {/* Preview Tab */}
            <TabPanel value={activeTab} index={3}>
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
            </TabPanel>
          </Paper>

          {/* Rule Actions Footer */}
          <Box sx={{ mt: 3 }}>
            <RuleActions
              onSave={handleSave}
              onSaveDraft={handleSave}
              onCancel={handleBack}
              onTest={() => setTestPanelOpen(true)}
              isSaving={isSaving}
              isValid={Object.keys(state.errors).length === 0}
              hasUnsavedChanges={state.hasUnsavedChanges}
              isTesting={isTestingRule}
              isEditMode={isEditMode}
            />
          </Box>
        </Grid>
      </Grid>

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
    </Container>
  );
};

export default RuleConfiguratorScreen;
