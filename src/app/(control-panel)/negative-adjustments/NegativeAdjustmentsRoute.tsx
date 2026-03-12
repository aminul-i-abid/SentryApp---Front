import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { negativeAdjustmentsI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'negativeAdjustments', negativeAdjustmentsI18n.es.negativeAdjustments);
i18next.addResourceBundle('en', 'negativeAdjustments', negativeAdjustmentsI18n.en.negativeAdjustments);

const NegativeAdjustments = lazy(() => import('./NegativeAdjustments'));

const NegativeAdjustmentsRoute = {
	path: 'negative-adjustments',
	element: (
		<StockModuleGuard>
			<NegativeAdjustments />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default NegativeAdjustmentsRoute;
