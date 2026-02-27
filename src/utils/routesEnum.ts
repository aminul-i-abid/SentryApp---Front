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
  
  // Activities Module (Premium)
  ACTIVITIES = '/activities',
  ACTIVITIES_DETAIL = '/activities/:id',
  ACTIVITIES_BOOKING = '/activities/:id/book',
  ACTIVITIES_RESERVATIONS = '/activities/my-reservations'
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
