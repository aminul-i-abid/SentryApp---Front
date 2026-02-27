import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const Auditory = lazy(() => import('./Auditory'));

/**
 * The Auditory page route.
 */
const AuditoryRoute: FuseRouteItemType = {
	path: 'auditory',
	element: <Auditory />
};

export default AuditoryRoute;
