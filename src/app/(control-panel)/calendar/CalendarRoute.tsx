import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { Routes } from 'src/utils/routesEnum';


const Calendar = lazy(() => import('./Calendar'));

/**
 * The Tag page route.
 */
const CalendarRoute: FuseRouteItemType = {
    path: Routes.CALENDAR,
    element: <Calendar />
};

export default CalendarRoute; 