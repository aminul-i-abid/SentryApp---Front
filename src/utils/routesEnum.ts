/**
 * Enumeración de todas las rutas de la aplicación.
 * Utilizar estas constantes en lugar de hardcodear las rutas en el código.
 */
export enum Routes {
  
  // Panel de control
  DASHBOARD = '/dashboard',
  DASHBOARDTEST = '/dashboard-test',
  BADGE = '/badge',
  TAG = '/tag',
  ROOM = '/room',
  ROOM_BLOCK = '/room/:id',
  CAMPS = '/camps',
  CAMPS_DETAIL = '/camps/:id',
  CAMPS_BLOCK_ROOM = '/camps/block/:id',
  RESERVE = '/reserve',
  RESERVE_BULK = '/reserve/bulk/:id',
  RESERVE_DETAIL = '/reserve/:id',
  CALENDAR = '/calendar',
  REPORTS = '/reports',
  CONTRACTORS = '/contractors',
  CONTRACTORS_DETAIL = '/contractors/:id',
  CONTRACTORS_CAMP = '/contractors/camps/:campId/:idContractor',
  GUESTS = '/guests',
  AUDITORY = '/auditory',
  USER_MANUAL = '/user-manual',
  PROBLEMS = '/problems',
  NOTIFICATIONS = '/notifications',
  ITEM_UNIT_OF_MEASURE = '/item-unit-of-measure',
  ITEMS = '/items',
  LOTS = '/lots',
  SUPPLIER_LOTS = '/supplier-lots',
  SUPPLIERS = '/suppliers',
  WAREHOUSES = '/warehouses',
  LOCATIONS = '/locations',
  MOVEMENT_REASONS = '/movement-reasons',
  STOCKS = '/stocks',
  STOCKS_BY_ARTICLE = '/stocks/by-article',
  STOCKS_BY_WAREHOUSE = '/stocks/by-warehouse',
  MOVEMENTS = '/movements',
  RECEIVING = '/receiving',
  TRANSFERS = '/transfers',
  CONSUMPTION = '/consumption',
  SCRAP = '/scrap',
  POSITIVE_ADJUSTMENTS = '/positive-adjustments',
  NEGATIVE_ADJUSTMENTS = '/negative-adjustments',
  
  // Activities Module (Premium)
  ACTIVITIES = '/activities',
  ACTIVITIES_DETAIL = '/activities/:id',
  ACTIVITIES_BOOKING = '/activities/:id/book',
  ACTIVITIES_RESERVATIONS = '/activities/my-reservations',

  // Housekeeping Module
  HOUSEKEEPING = '/housekeeping',
  HOUSEKEEPING_ASSIGNMENT = '/housekeeping/assignment',
  HOUSEKEEPING_TASKS = '/housekeeping/tasks',
  HOUSEKEEPING_MY_TASKS = '/housekeeping/my-tasks',
  HOUSEKEEPING_TEMPLATES = '/housekeeping/templates',
  HOUSEKEEPING_RULES = '/housekeeping/rules',
  HOUSEKEEPING_CATEGORIES = '/housekeeping/categories',
  HOUSEKEEPING_TAREAS = '/housekeeping/tareas',
  HOUSEKEEPING_DASHBOARD = '/housekeeping/dashboard',
  HOUSEKEEPING_DASHBOARD_HOME = '/housekeeping/dashboard/home',
  HOUSEKEEPING_DASHBOARD_VARIANCE = '/housekeeping/dashboard/variance',
  HOUSEKEEPING_DASHBOARD_MAINTENANCE = '/housekeeping/dashboard/maintenance',
  HOUSEKEEPING_DASHBOARD_DISCREPANCIES = '/housekeeping/dashboard/discrepancies',
  HOUSEKEEPING_ASSIGNMENTS = '/housekeeping/assignments',

  // Maintenance Module
  MAINTENANCE = '/maintenance',
  MAINTENANCE_ALERTS = '/maintenance/alerts',
  MAINTENANCE_ALERT_DETAIL = '/maintenance/alerts/:id',
  MAINTENANCE_CATEGORIES = '/maintenance/categories'
}

/**
 * Función auxiliar para construir rutas con parámetros
 * @param route Ruta base
 * @param params Parámetros para reemplazar en la ruta
 * @returns Ruta con parámetros reemplazados
 * 
 * @example
 * // Retorna '/security/users/123'
 * buildRoute(Routes.SECURITY_USERS + '/:id', { id: '123' })
 */
export function buildRoute(route: string, params?: Record<string, string>): string {
  if (!params) {
    return route;
  }
  
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  
  return result;
}
