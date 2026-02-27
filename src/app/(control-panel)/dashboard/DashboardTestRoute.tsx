import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';

const Dashboard = lazy(() => import('./Dashboard.optimized'));

const DashboardRoute: FuseRouteItemType[] = [
    {
        path: Routes.DASHBOARD,
        element: <Dashboard />
    },
];

export default DashboardRoute; 