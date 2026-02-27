import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import { Routes } from 'src/utils/routesEnum';
i18next.addResourceBundle('en', 'reservePage', en);

const Reserve = lazy(() => import('./Reserve'));
const ReservesBulk = lazy(() => import('./ReservesBulk'));
const ReserveDetail = lazy(() => import('./ReserveDetail'));
/**
 * The Reserve page route.
 */
const ReserveRoute: FuseRouteItemType[] = [{
    path: Routes.RESERVE,
    element: <Reserve />
},
{
    path: Routes.RESERVE_BULK,
    element: <ReservesBulk />
},
{
    path: Routes.RESERVE_DETAIL,
    element: <ReserveDetail />
}];

export default ReserveRoute; 