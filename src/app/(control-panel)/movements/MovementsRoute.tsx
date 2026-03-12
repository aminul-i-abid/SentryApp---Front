import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { movementsI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'movements', movementsI18n.es.movements);
i18next.addResourceBundle('en', 'movements', movementsI18n.en.movements);

const Movements = lazy(() => import('./Movements'));

const MovementsRoute = {
	path: 'movements',
	element: (
		<StockModuleGuard>
			<Movements />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default MovementsRoute;
