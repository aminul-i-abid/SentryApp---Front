import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';


const Tag = lazy(() => import('./Tag'));

/**
 * The Tag page route.
 */
const TagRoute: FuseRouteItemType = {
    path: Routes.TAG,
    element: <Tag />
};

export default TagRoute; 