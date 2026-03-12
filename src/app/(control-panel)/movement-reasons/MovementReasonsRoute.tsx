import { lazy } from 'react';
import i18next from 'i18next';
import { movementReasonI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'movementReasons', movementReasonI18n.es.movementReasons);
i18next.addResourceBundle('en', 'movementReasons', movementReasonI18n.en.movementReasons);

const MovementReasons = lazy(() => import('./MovementReasons'));

const MovementReasonsRoute = {
	path: 'movement-reasons',
	element: (
		<StockModuleGuard>
			<MovementReasons />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default MovementReasonsRoute;
