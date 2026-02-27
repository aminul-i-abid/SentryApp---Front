// import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
// import en from './i18n/en';
import { Routes } from 'src/utils/routesEnum';
// i18next.addResourceBundle('en', 'Guests', en);

const Guest = lazy(() => import('./Guests'));
/**
 * The guest page route.
 */
const GuestRoute: FuseRouteItemType[] = [
    {
    path: Routes.GUESTS,
    element: <Guest />
}
];

export default GuestRoute;