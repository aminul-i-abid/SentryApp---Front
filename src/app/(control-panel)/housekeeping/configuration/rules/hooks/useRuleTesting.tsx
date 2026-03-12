/**
 * useRuleTesting Hook
 * FASE 5.3 - Housekeeping Configuration
 *
 * Hook for testing rules against specific room/date scenarios
 * Simulates rule application and returns detailed test results
 */

import { useState, useCallback } from 'react';
import apiService from '@/utils/apiService';
import type {
  RuleTestParams,
  RuleTestResult,
  RuleSimulationResult,
} from '../types/ruleConfiguratorTypes';
import type { CleaningRule } from '@/store/housekeeping/housekeepingTypes';

/**
 * Test result state
 */
interface TestState {
  isLoading: boolean;
  error: string | null;
  result: RuleTestResult | null;
  simulationResult: RuleSimulationResult | null;
}

/**
 * Initial test state
 */
const getInitialTestState = (): TestState => ({
  isLoading: false,
  error: null,
  result: null,
  simulationResult: null,
});

/**
 * Formats test result details for display
 */
const formatTestResult = (result: any): RuleTestResult => {
  return {
    ruleApplies: result.ruleApplies || false,
    reason: result.reason || 'Unknown reason',
    templateSelected: result.templateSelected,
    affectedRooms: result.affectedRooms || 0,
    estimatedTasks: result.estimatedTasks || 0,
    details: {
      triggerMatched: result.details?.triggerMatched || false,
      targetMatched: result.details?.targetMatched || false,
      conditionsMet: result.details?.conditionsMet || [],
      conditionsNotMet: result.details?.conditionsNotMet || [],
    },
  };
};

/**
 * useRuleTesting Hook
 * Manages rule testing functionality
 */
export const useRuleTesting = (ruleId?: string) => {
  const [testState, setTestState] = useState<TestState>(getInitialTestState());

  /**
   * Test rule against specific room and date
   */
  const testRule = useCallback(async (params: RuleTestParams) => {
    if (!ruleId) {
      setTestState((prevState) => ({
        ...prevState,
        error: 'Rule ID is required to test a rule',
      }));
      return;
    }

    try {
      setTestState((prevState) => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));

      const response = await apiService.post<RuleTestResult>(
        `/api/HousekeepingConfig/TestRule/${ruleId}`,
        params
      );

      if (response.data) {
        const formattedResult = formatTestResult(response.data);

        setTestState((prevState) => ({
          ...prevState,
          result: formattedResult,
          isLoading: false,
        }));

        return formattedResult;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test rule';
      setTestState((prevState) => ({
        ...prevState,
        error: errorMessage,
        isLoading: false,
      }));
      console.error('Error testing rule:', err);
    }
  }, [ruleId]);

  /**
   * Simulate rule application across multiple rooms and dates
   */
  const simulateRuleApplication = useCallback(
    async (
      ruleData: CleaningRule,
      startDate: string,
      endDate: string,
      blockId?: string
    ) => {
      try {
        setTestState((prevState) => ({
          ...prevState,
          isLoading: true,
          error: null,
        }));

        const payload = {
          rule: ruleData,
          startDate,
          endDate,
          blockId,
        };

        const response = await apiService.post<RuleSimulationResult[]>(
          '/api/HousekeepingConfig/SimulateRule',
          payload
        );

        if (response.data && Array.isArray(response.data)) {
          const simulationResults = response.data;

          setTestState((prevState) => ({
            ...prevState,
            simulationResult: {
              date: startDate,
              roomsAffected: simulationResults.flatMap((r) =>
                r.roomsAffected || []
              ),
              totalTasks: simulationResults.reduce((sum, r) => sum + (r.totalTasks || 0), 0),
              totalRooms: simulationResults.reduce(
                (sum, r) => sum + (r.totalRooms || 0),
                0
              ),
            },
            isLoading: false,
          }));

          return simulationResults;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to simulate rule';
        setTestState((prevState) => ({
          ...prevState,
          error: errorMessage,
          isLoading: false,
        }));
        console.error('Error simulating rule:', err);
      }
    },
    []
  );

  /**
   * Test rule with multiple scenarios
   */
  const testRuleScenarios = useCallback(
    async (scenarios: RuleTestParams[]) => {
      if (!ruleId) {
        setTestState((prevState) => ({
          ...prevState,
          error: 'Rule ID is required to test a rule',
        }));
        return;
      }

      try {
        setTestState((prevState) => ({
          ...prevState,
          isLoading: true,
          error: null,
        }));

        const results = await Promise.all(
          scenarios.map((scenario) =>
            apiService.post<RuleTestResult>(
              `/api/HousekeepingConfig/TestRule/${ruleId}`,
              scenario
            )
          )
        );

        const successfulResults = results
          .filter((r) => r.data)
          .map((r) => formatTestResult(r.data!));

        if (successfulResults.length === 0) {
          setTestState((prevState) => ({
            ...prevState,
            error: 'No scenarios executed successfully',
            isLoading: false,
          }));
          return;
        }

        // Return the first result as the main result
        setTestState((prevState) => ({
          ...prevState,
          result: successfulResults[0],
          isLoading: false,
        }));

        return successfulResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to test rule scenarios';
        setTestState((prevState) => ({
          ...prevState,
          error: errorMessage,
          isLoading: false,
        }));
        console.error('Error testing rule scenarios:', err);
      }
    },
    [ruleId]
  );

  /**
   * Clear test results
   */
  const clearTestResults = useCallback(() => {
    setTestState(getInitialTestState());
  }, []);

  /**
   * Get affected rooms count
   */
  const getAffectedRoomsCount = useCallback(() => {
    return testState.result?.affectedRooms || 0;
  }, [testState.result]);

  /**
   * Get estimated tasks count
   */
  const getEstimatedTasksCount = useCallback(() => {
    return testState.result?.estimatedTasks || 0;
  }, [testState.result]);

  /**
   * Check if rule applies based on test result
   */
  const getRuleAppliesStatus = useCallback(() => {
    return testState.result?.ruleApplies || false;
  }, [testState.result]);

  return {
    testState,
    testRule,
    simulateRuleApplication,
    testRuleScenarios,
    clearTestResults,
    getAffectedRoomsCount,
    getEstimatedTasksCount,
    getRuleAppliesStatus,
    isLoading: testState.isLoading,
    error: testState.error,
    result: testState.result,
    simulationResult: testState.simulationResult,
  };
};
