import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from '@/utils/routesEnum';

const UserManagement = lazy(() => import('./UserManagement'));

/**
 * The User Management page route.
 */
const UserManagementRoute: FuseRouteItemType[] = [
    {
        path: Routes.USER_MANAGEMENT,
        element: <UserManagement />
    }
];

export default UserManagementRoute;
