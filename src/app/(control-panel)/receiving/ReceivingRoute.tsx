import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { receivingI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'receiving', receivingI18n.es.receiving);
i18next.addResourceBundle('en', 'receiving', receivingI18n.en.receiving);

const Receiving = lazy(() => import('./Receiving'));

const ReceivingRoute = {
	path: 'receiving',
	element: (
		<StockModuleGuard>
			<Receiving />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default ReceivingRoute;
