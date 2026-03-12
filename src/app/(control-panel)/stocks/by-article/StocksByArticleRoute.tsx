import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../components/StockModuleGuard';

const StocksByArticle = lazy(() => import('./StocksByArticle'));

/**
 * Configuración de rutas para Stock por Artículo
 * 
 * IMPORTANTE: Este módulo es Premium y está protegido por StockModuleGuard
 * que valida el flag user.modules.stock
 */
const StocksByArticleRoute = {
	path: 'stocks/by-article',
	element: (
		<StockModuleGuard>
			<StocksByArticle />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default StocksByArticleRoute;
