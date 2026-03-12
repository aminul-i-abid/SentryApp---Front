import { lazy } from 'react';
import i18next from 'i18next';
import { lotsI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'lots', lotsI18n.es.lots);
i18next.addResourceBundle('en', 'lots', lotsI18n.en.lots);

const Lots = lazy(() => import('./Lots'));

const LotsRoute = {
	path: 'lots',
	element: (
		<StockModuleGuard>
			<Lots />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default LotsRoute;
