import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { consumptionI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'consumption', consumptionI18n.es.consumption);
i18next.addResourceBundle('en', 'consumption', consumptionI18n.en.consumption);

const Consumption = lazy(() => import('./Consumption'));

const ConsumptionRoute = {
	path: 'consumption',
	element: (
		<StockModuleGuard>
			<Consumption />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default ConsumptionRoute;
