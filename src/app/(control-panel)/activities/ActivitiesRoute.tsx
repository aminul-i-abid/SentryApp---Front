import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';
import activities from './i18n';
import ActivityModuleGuard from './components/ActivityModuleGuard';
import authRoles from '@auth/authRoles';

// Registrar el bundle de i18n para el módulo de actividades
i18next.addResourceBundle('es', 'activities', activities.es);
i18next.addResourceBundle('en', 'activities', activities.en);

/**
 * Lazy load de los componentes del módulo de actividades
 */
const Activities = lazy(() => import('./Activities'));
const ActivitiesDetail = lazy(() => import('./ActivitiesDetail'));
const ActivityBooking = lazy(() => import('./ActivityBooking'));
const MyReservations = lazy(() => import('./MyReservations'));
const ReservationManagement = lazy(() => import('./ReservationManagement'));

/**
 * Configuración de rutas del módulo de Actividades
 * 
 * IMPORTANTE: Este módulo es Plus y está protegido por ActivityModuleGuard
 * que valida el flag user.modules.activities
 */
const ActivitiesRoute: FuseRouteItemType[] = [
    {
        path: Routes.ACTIVITIES,
        element: (
            <ActivityModuleGuard>
                <Activities />
            </ActivityModuleGuard>
        ),
        auth: authRoles.user // Requires authentication
    },
    {
        path: Routes.ACTIVITIES_DETAIL,
        element: (
            <ActivityModuleGuard>
                <ActivitiesDetail />
            </ActivityModuleGuard>
        ),
        auth: authRoles.admin // Admin only for create/edit
    },
    {
        path: Routes.ACTIVITIES_BOOKING,
        element: (
            <ActivityModuleGuard>
                <ActivityBooking />
            </ActivityModuleGuard>
        ),
        auth: authRoles.user // All authenticated users can book
    },
    {
        path: Routes.ACTIVITIES_RESERVATIONS,
        element: (
            <ActivityModuleGuard>
                <MyReservations />
            </ActivityModuleGuard>
        ),
        auth: authRoles.user // Users can view their own reservations
    },
    {
        path: '/activities/management',
        element: (
            <ActivityModuleGuard>
                <ReservationManagement />
            </ActivityModuleGuard>
        ),
        auth: authRoles.admin // Staff and admin can manage all reservations
    }
];

export default ActivitiesRoute;
