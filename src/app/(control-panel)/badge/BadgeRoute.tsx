import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import { Routes } from 'src/utils/routesEnum';

i18next.addResourceBundle('en', 'badgePage', en);


const Badge = lazy(() => import('./Badge'));

/**
 * The Badge page route.
 */
const BadgeRoute: FuseRouteItemType = {
    path: Routes.BADGE,
    element: <Badge />
};

export default BadgeRoute; 