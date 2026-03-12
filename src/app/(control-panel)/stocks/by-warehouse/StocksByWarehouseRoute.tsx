import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import StockModuleGuard from '../components/StockModuleGuard';

const StocksByWarehouse = lazy(() => import('./StocksByWarehouse'));

/**
 * Configuración de rutas para Stock por Almacén
 * 
 * IMPORTANTE: Este módulo es Premium y está protegido por StockModuleGuard
 * que valida el flag user.modules.stock
 */
const StocksByWarehouseRoute = {
	path: 'stocks/by-warehouse',
	element: (
		<StockModuleGuard>
			<StocksByWarehouse />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default StocksByWarehouseRoute;
