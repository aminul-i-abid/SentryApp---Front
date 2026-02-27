import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';


const Reports = lazy(() => import('./Reports'));

/**
 * The Reports page route.
 */
const ReportsRoute: FuseRouteItemType = {
    path: Routes.REPORTS,
    element: <Reports />
};

export default ReportsRoute;