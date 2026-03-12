import { lazy } from 'react';
import i18next from 'i18next';
import { itemUnitOfMeasureI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'itemUnitOfMeasure', itemUnitOfMeasureI18n.es.itemUnitOfMeasure);
i18next.addResourceBundle('en', 'itemUnitOfMeasure', itemUnitOfMeasureI18n.en.itemUnitOfMeasure);

const ItemUnitOfMeasure = lazy(() => import('./ItemUnitOfMeasure'));

const ItemUnitOfMeasureRoute = {
	path: 'item-unit-of-measure',
	element: (
		<StockModuleGuard>
			<ItemUnitOfMeasure />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default ItemUnitOfMeasureRoute;
