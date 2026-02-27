import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';

const DashboardTest = lazy(() => import('./Dashboard'));

const DashboardRoute: FuseRouteItemType[] = [
    {
        path: Routes.DASHBOARDTEST,
        element: <DashboardTest />
    },
];

export default DashboardRoute; 