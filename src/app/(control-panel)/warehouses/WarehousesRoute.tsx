import { lazy } from 'react';
import i18next from 'i18next';
import { warehousesI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'warehouses', warehousesI18n.es.warehouses);
i18next.addResourceBundle('en', 'warehouses', warehousesI18n.en.warehouses);

const Warehouses = lazy(() => import('./Warehouses'));

const WarehousesRoute = {
	path: 'warehouses',
	element: (
		<StockModuleGuard>
			<Warehouses />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default WarehousesRoute;
