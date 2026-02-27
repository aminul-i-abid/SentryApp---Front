import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import { Routes } from 'src/utils/routesEnum';
i18next.addResourceBundle('en', 'campsPage', en);

const Camps = lazy(() => import('./Camps'));
const CampsDetail = lazy(() => import('./CampsDetails'));
const CampsBlockRoom = lazy(() => import('./CampsBlockRoom'));
/**
 * The Camps page route.
 */
const CampsRoute: FuseRouteItemType[] = [
    {
        path: Routes.CAMPS,
        element: <Camps />
    },
    {
        path: Routes.CAMPS_DETAIL,
        element: <CampsDetail />
    },
    {
        path: Routes.CAMPS_BLOCK_ROOM,
        element: <CampsBlockRoom />
    }
];

export default CampsRoute; 