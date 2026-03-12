/**
 * useRuleConfigurator Hook
 * FASE 5.3 - Housekeeping Configuration
 *
 * Main hook for rule configurator state management.
 * TASK-FR3 (Verificación): Migrated from apiService direct calls to Redux thunks.
 * - Manages RuleConfiguratorState
 * - Handles rule CRUD operations via Redux dispatch
 * - Auto-save with debounce (2 seconds)
 * - Unsaved changes tracking
 */

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { useAppDispatch } from '@/store/hooks';
import {
  createRule as createRuleThunk,
  updateRule as updateRuleThunk,
} from '@/store/housekeeping/housekeepingThunks';
import type {
  RuleConfiguratorState,
  CreateRuleRequest,
  UpdateRuleRequest,
  ValidationErrors,
} from '../types/ruleConfiguratorTypes';
import type { CleaningRule, JobTagValue } from '@/store/housekeeping/housekeepingTypes';

/**
 * Initial state for rule configurator
 */
const getInitialState = (ruleId?: string): RuleConfiguratorState => ({
  rule: {
    id: ruleId,
    name: '',
    campId: '',
    templateId: '',
    priority: 0,
    triggerType: 'manual',
    onCheckout: false,
    onCheckin: false,
    appliesTo: 'camp',
    targetIds: undefined,
    targetJobTag: undefined as JobTagValue | null | undefined,
    isActive: true,
  },
  availableTemplates: [],
  availableBlocks: [],
  availableRooms: [],
  selectedTargets: [],
  errors: {},
  hasUnsavedChanges: false,
  isSaving: false,
  lastSaved: undefined,
});

/**
 * Validates the rule configuration
 */
const validateRule = (rule: RuleConfiguratorState['rule']): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!rule.name || rule.name.trim() === '') {
    errors.name = 'Rule name is required';
  }

  if (!rule.campId) {
    errors.campId = 'Camp is required';
  }

  if (!rule.templateId) {
    errors.templateId = 'Template is required';
  }

  if (rule.priority < 0 || rule.priority > 100) {
    errors.priority = 'Priority must be between 0 and 100';
  }

  if (rule.triggerType === 'interval' && (!rule.daysInterval || rule.daysInterval <= 0)) {
    errors.daysInterval = 'Days interval is required and must be greater than 0 for interval trigger';
  }

  if (rule.appliesTo === 'jobTag') {
    if (!rule.targetJobTag) {
      errors.targetJobTag = 'Debe seleccionar una categoría';
    }
  } else if (rule.appliesTo !== 'camp' && (!rule.targetIds || rule.targetIds.trim() === '')) {
    errors.targetIds = `${rule.appliesTo === 'block' ? 'Block' : 'Room'} selection is required`;
  }

  return errors;
};

/**
 * useRuleConfigurator Hook
 * Manages rule configuration state with auto-save functionality via Redux thunks.
 */
export const useRuleConfigurator = (ruleId?: string) => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<RuleConfiguratorState>(getInitialState(ruleId));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Auto-save debounced function — only fires in edit mode (rule has an id)
   */
  const debouncedSave = useCallback(
    debounce(async (ruleData: RuleConfiguratorState['rule']) => {
      if (!ruleData.id) return; // Only auto-save existing rules

      const validationErrors = validateRule(ruleData);
      if (Object.keys(validationErrors).length > 0) {
        setState((prevState) => ({
          ...prevState,
          errors: validationErrors,
          isSaving: false,
        }));
        return;
      }

      try {
        setState((prevState) => ({
          ...prevState,
          isSaving: true,
          errors: {},
        }));

        const updateRequest: UpdateRuleRequest = {
          id: ruleData.id!,
          name: ruleData.name,
          campId: ruleData.campId,
          templateId: ruleData.templateId,
          priority: ruleData.priority,
          triggerType: ruleData.triggerType,
          daysInterval: ruleData.daysInterval,
          onCheckout: ruleData.onCheckout,
          onCheckin: ruleData.onCheckin,
          appliesTo: ruleData.appliesTo,
          targetIds: ruleData.targetIds,
          targetJobTag: ruleData.targetJobTag,
          isActive: ruleData.isActive,
        };

        await dispatch(updateRuleThunk(updateRequest)).unwrap();

        setState((prevState) => ({
          ...prevState,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
          isSaving: false,
        }));
      } catch (err) {
        setState((prevState) => ({
          ...prevState,
          isSaving: false,
        }));
        const errorMessage = err instanceof Error ? err.message : 'Failed to auto-save rule';
        console.error('Auto-save error:', errorMessage);
      }
    }, 2000),
    [dispatch]
  );

  /**
   * Update rule configuration
   */
  const updateRule = useCallback((updates: Partial<RuleConfiguratorState['rule']>) => {
    setState((prevState) => {
      const updatedRule = {
        ...prevState.rule,
        ...updates,
      };

      // Trigger debounced auto-save
      debouncedSave(updatedRule);

      return {
        ...prevState,
        rule: updatedRule,
        hasUnsavedChanges: true,
        errors: {},
      };
    });
  }, [debouncedSave]);

  /**
   * Update selected targets
   */
  const updateSelectedTargets = useCallback((targetIds: string[]) => {
    const targetIdsStr = targetIds.join(',');
    updateRule({ targetIds: targetIdsStr });
    setState((prevState) => ({
      ...prevState,
      selectedTargets: targetIds,
    }));
  }, [updateRule]);

  /**
   * Save rule manually via Redux thunk
   */
  const saveRule = useCallback(async () => {
    const validationErrors = validateRule(state.rule);

    if (Object.keys(validationErrors).length > 0) {
      setState((prevState) => ({
        ...prevState,
        errors: validationErrors,
      }));
      return false;
    }

    try {
      setState((prevState) => ({
        ...prevState,
        isSaving: true,
        errors: {},
      }));

      let savedRule: CleaningRule;

      if (state.rule.id) {
        const updateRequest: UpdateRuleRequest = {
          id: state.rule.id,
          name: state.rule.name,
          campId: state.rule.campId,
          templateId: state.rule.templateId,
          priority: state.rule.priority,
          triggerType: state.rule.triggerType,
          daysInterval: state.rule.daysInterval,
          onCheckout: state.rule.onCheckout,
          onCheckin: state.rule.onCheckin,
          appliesTo: state.rule.appliesTo,
          targetIds: state.rule.targetIds,
          targetJobTag: state.rule.targetJobTag,
          isActive: state.rule.isActive,
        };
        savedRule = await dispatch(updateRuleThunk(updateRequest)).unwrap();
      } else {
        const createRequest: CreateRuleRequest = {
          name: state.rule.name,
          campId: state.rule.campId,
          templateId: state.rule.templateId,
          priority: state.rule.priority,
          triggerType: state.rule.triggerType,
          daysInterval: state.rule.daysInterval,
          onCheckout: state.rule.onCheckout,
          onCheckin: state.rule.onCheckin,
          appliesTo: state.rule.appliesTo,
          targetIds: state.rule.targetIds,
          targetJobTag: state.rule.targetJobTag,
          isActive: state.rule.isActive,
        };
        savedRule = await dispatch(createRuleThunk(createRequest)).unwrap();
      }

      setState((prevState) => ({
        ...prevState,
        rule: {
          ...prevState.rule,
          id: savedRule.id,
        },
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        isSaving: false,
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save rule';
      setState((prevState) => ({
        ...prevState,
        isSaving: false,
      }));
      setError(errorMessage);
      console.error('Error saving rule:', err);
      return false;
    }
  }, [state.rule, dispatch]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setState(getInitialState(ruleId));
    setError(null);
  }, [ruleId]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel?.();
    };
  }, [debouncedSave]);

  /**
   * Set targetJobTag — convenience setter that wraps updateRule
   */
  const setTargetJobTag = useCallback((value: JobTagValue | null) => {
    updateRule({ targetJobTag: value });
  }, [updateRule]);

  return {
    state,
    setState,
    isLoading,
    error,
    setError,
    updateRule,
    updateSelectedTargets,
    saveRule,
    loadRule: async (_id: string) => {
      // Loading is handled by the screen via Redux store — rules are fetched via fetchRules
      // This stub maintains backward compat with the hook's public API
    },
    reset,
    debouncedSave,
    targetJobTag: state.rule.targetJobTag,
    setTargetJobTag,
  };
};
