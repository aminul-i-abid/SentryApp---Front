import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { transfersI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'transfers', transfersI18n.es.transfers);
i18next.addResourceBundle('en', 'transfers', transfersI18n.en.transfers);

const Transfers = lazy(() => import('./Transfers'));

/**
 * Configuración de rutas del módulo de Transfers
 * 
 * IMPORTANTE: Este módulo es parte del módulo Premium de Stock
 * y está protegido por StockModuleGuard que valida el flag user.modules.stock
 */
const TransfersRoute = {
	path: 'transfers',
	element: (
		<StockModuleGuard>
			<Transfers />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default TransfersRoute;
