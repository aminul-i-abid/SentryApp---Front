import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';
import HousekeepingModuleGuard from './components/HousekeepingModuleGuard';
import housekeepingI18n from './i18n';

// Register i18n bundles
if (!i18next.hasResourceBundle('es', 'housekeeping')) {
  i18next.addResourceBundle('es', 'housekeeping', housekeepingI18n.es);
}
if (!i18next.hasResourceBundle('en', 'housekeeping')) {
  i18next.addResourceBundle('en', 'housekeeping', housekeepingI18n.en);
}

// Assignment
const TaskAssignmentScreen = lazy(
  () => import('./assignment/TaskAssignmentScreen')
);
const AssignmentListScreen = lazy(
  () => import('./assignment/AssignmentListScreen')
);

// Configuration - Templates
const TemplatesListScreen = lazy(
  () => import('./configuration/templates/TemplatesListScreen')
);
const TemplateEditorScreen = lazy(
  () => import('./configuration/templates/TemplateEditorScreen')
);

// Configuration - Rules
const RulesListScreen = lazy(
  () => import('./configuration/rules/RulesListScreen')
);
const RuleConfiguratorScreen = lazy(
  () => import('./configuration/rules/RuleConfiguratorScreen')
);

// Configuration - Tareas (TASK-FC1: reemplaza Tags en el menú)
const TareasListScreen = lazy(
  () => import('./configuration/tareas/TareasListScreen')
);

// Dashboard - EN PROCESO DE MIGRACIÓN A MUI + Chart.js
// Componentes base convertidos: KPICard, VarianceChart, DiscrepanciesWidget
// Pendiente: VarianceAnalysisScreen charts, MaintenanceKanbanScreen, DiscrepanciesAnalysisScreen
const DashboardHome = lazy(
  () => import('./dashboard/DashboardHome')
);
// TODO: Convertir charts de variance (OccupancyComparisonChart, VarianceTrendChart)
/*
const VarianceAnalysisScreen = lazy(
  () => import('./dashboard/variance/VarianceAnalysisScreen')
);
const MaintenanceKanbanScreen = lazy(
  () => import('./dashboard/maintenance/MaintenanceKanbanScreen')
);
const DiscrepanciesAnalysisScreen = lazy(
  () => import('./dashboard/discrepancies/DiscrepanciesAnalysisScreen')
);
*/

/**
 * The Housekeeping module routes.
 *
 * Includes:
 * - Task Assignment Screen
 * - Configuration: Templates, Rules, Categories
 * - Dashboard: Home, Variance Analysis, Maintenance Kanban, Discrepancies
 * - My Tasks (for operators) - TODO
 * - Task List (for supervisors) - TODO
 */
const HousekeepingRoute: FuseRouteItemType[] = [
  // Task Assignment — create new
  {
    path: Routes.HOUSEKEEPING_ASSIGNMENT,
    element: <HousekeepingModuleGuard><TaskAssignmentScreen /></HousekeepingModuleGuard>,
  },

  // Assignment List — view and manage existing groups
  {
    path: Routes.HOUSEKEEPING_ASSIGNMENTS,
    element: <HousekeepingModuleGuard><AssignmentListScreen /></HousekeepingModuleGuard>,
  },

  // Configuration - Templates
  {
    path: Routes.HOUSEKEEPING_TEMPLATES,
    element: <HousekeepingModuleGuard><TemplatesListScreen /></HousekeepingModuleGuard>,
  },
  {
    path: `${Routes.HOUSEKEEPING_TEMPLATES}/new`,
    element: <HousekeepingModuleGuard><TemplateEditorScreen /></HousekeepingModuleGuard>,
  },
  {
    path: `${Routes.HOUSEKEEPING_TEMPLATES}/:id`,
    element: <HousekeepingModuleGuard><TemplateEditorScreen /></HousekeepingModuleGuard>,
  },

  // Configuration - Rules
  {
    path: Routes.HOUSEKEEPING_RULES,
    element: <HousekeepingModuleGuard><RulesListScreen /></HousekeepingModuleGuard>,
  },
  {
    path: `${Routes.HOUSEKEEPING_RULES}/new`,
    element: <HousekeepingModuleGuard><RuleConfiguratorScreen /></HousekeepingModuleGuard>,
  },
  {
    path: `${Routes.HOUSEKEEPING_RULES}/:id`,
    element: <HousekeepingModuleGuard><RuleConfiguratorScreen /></HousekeepingModuleGuard>,
  },

  // Configuration - Tareas (TASK-FC1: reemplaza Tags en el menú)
  {
    path: Routes.HOUSEKEEPING_TAREAS,
    element: <HousekeepingModuleGuard><TareasListScreen /></HousekeepingModuleGuard>,
  },

  // Configuration - Categories (legacy — commented out)
  // {
  //   path: Routes.HOUSEKEEPING_CATEGORIES,
  //   element: <CategoriesListScreen />,
  // },

  // Dashboard - Home (MUI + Chart.js)
  {
    path: Routes.HOUSEKEEPING_DASHBOARD_HOME,
    element: <HousekeepingModuleGuard><DashboardHome /></HousekeepingModuleGuard>,
  },
  {
    path: Routes.HOUSEKEEPING_DASHBOARD,
    element: <HousekeepingModuleGuard><DashboardHome /></HousekeepingModuleGuard>,
  },
  // TODO: Descomentar cuando se conviertan los charts de estas pantallas
  /*
  {
    path: Routes.HOUSEKEEPING_DASHBOARD_VARIANCE,
    element: <VarianceAnalysisScreen />,
  },
  {
    path: Routes.HOUSEKEEPING_DASHBOARD_MAINTENANCE,
    element: <MaintenanceKanbanScreen />,
  },
  {
    path: Routes.HOUSEKEEPING_DASHBOARD_DISCREPANCIES,
    element: <DiscrepanciesAnalysisScreen />,
  },
  */

  // TODO: Add other housekeeping routes as they are implemented
  // {
  //   path: Routes.HOUSEKEEPING_TASKS,
  //   element: <TaskListScreen />,
  // },
  // {
  //   path: Routes.HOUSEKEEPING_MY_TASKS,
  //   element: <MyTasksScreen />,
  // },
];

export default HousekeepingRoute;
