import { lazy } from 'react';
import authRoles from '@auth/authRoles';
import i18next from 'i18next';
import { scrapI18n } from './i18n';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

i18next.addResourceBundle('es', 'scrap', scrapI18n.es.scrap);
i18next.addResourceBundle('en', 'scrap', scrapI18n.en.scrap);

const Scrap = lazy(() => import('./Scrap'));

const ScrapRoute = {
	path: 'scrap',
	element: (
		<StockModuleGuard>
			<Scrap />
		</StockModuleGuard>
	),
	auth: authRoles.user
};

export default ScrapRoute;
