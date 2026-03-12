import { lazy } from 'react';
import i18next from 'i18next';
import { supplierI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'supplier', supplierI18n.es.supplier);
i18next.addResourceBundle('en', 'supplier', supplierI18n.en.supplier);

const Supplier = lazy(() => import('./Supplier'));

const SupplierRoute = {
	path: 'suppliers',
	element: (
		<StockModuleGuard>
			<Supplier />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default SupplierRoute;
