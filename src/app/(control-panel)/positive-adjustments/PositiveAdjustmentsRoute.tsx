import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { positiveAdjustmentsI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'positiveAdjustments', positiveAdjustmentsI18n.es.positiveAdjustments);
i18next.addResourceBundle('en', 'positiveAdjustments', positiveAdjustmentsI18n.en.positiveAdjustments);

const PositiveAdjustments = lazy(() => import('./PositiveAdjustments'));

const PositiveAdjustmentsRoute = {
	path: 'positive-adjustments',
	element: (
		<StockModuleGuard>
			<PositiveAdjustments />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default PositiveAdjustmentsRoute;
