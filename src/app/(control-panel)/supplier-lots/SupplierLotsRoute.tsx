import { lazy } from 'react';
import i18next from 'i18next';
import { supplierLotsI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'supplierLots', supplierLotsI18n.es.supplierLots);
i18next.addResourceBundle('en', 'supplierLots', supplierLotsI18n.en.supplierLots);

const SupplierLotsPage = lazy(() => import('./SupplierLots'));

const SupplierLotsRoute = {
	path: 'supplier-lots',
	element: (
		<StockModuleGuard>
			<SupplierLotsPage />
		</StockModuleGuard>
	),
	auth: authRoles.admin
};

export default SupplierLotsRoute;

