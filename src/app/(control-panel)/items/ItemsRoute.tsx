import { lazy } from 'react';
import i18next from 'i18next';
import { itemsI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'items', itemsI18n.es.items);
i18next.addResourceBundle('en', 'items', itemsI18n.en.items);

const Items = lazy(() => import('./Items'));

const ItemsRoute = {
	path: 'items',
	element: (
		<StockModuleGuard>
			<Items />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default ItemsRoute;
