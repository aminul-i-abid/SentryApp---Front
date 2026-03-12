import { lazy } from 'react';
import i18next from 'i18next';
import { stocksI18n } from './i18n';
import authRoles from '@auth/authRoles';
import StockModuleGuard from './components/StockModuleGuard';

i18next.addResourceBundle('es', 'stocks', stocksI18n.es.stocks);
i18next.addResourceBundle('en', 'stocks', stocksI18n.en.stocks);

const Stocks = lazy(() => import('./Stocks'));

/**
 * Configuración de rutas del módulo de Stock
 * 
 * IMPORTANTE: Este módulo es Premium y está protegido por StockModuleGuard
 * que valida el flag user.modules.stock
 */
const StocksRoute = {
	path: 'stocks',
	element: (
		<StockModuleGuard>
			<Stocks />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default StocksRoute;
