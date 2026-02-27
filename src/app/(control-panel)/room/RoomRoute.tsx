import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import { Routes } from 'src/utils/routesEnum';

i18next.addResourceBundle('en', 'roomPage', en);


const Room = lazy(() => import('./Room'));
const RoomBlock = lazy(() => import('./RoomBlock'));
/**
 * The Room page route.
 */
const RoomRoute: FuseRouteItemType[] = [{
    path: Routes.ROOM,
    element: <Room />
}, {
    path: Routes.ROOM_BLOCK,
    element: <RoomBlock />
}];

export default RoomRoute; 