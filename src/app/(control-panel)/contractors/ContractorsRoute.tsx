import i18next from 'i18next';
import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import en from './i18n/en';
import { Routes } from 'src/utils/routesEnum';
i18next.addResourceBundle('en', 'contractorsPage', en);

const Contractors = lazy(() => import('./Contractors'));
const ContractorsDetails = lazy(() => import('./ContractorsDetail'));
const ContractorCamp = lazy(() => import('./ContractorCamp'));
/**
 * The Contractors page route.
 */
const ContractorsRoute: FuseRouteItemType[] = [
    {
        path: Routes.CONTRACTORS,
        element: <Contractors />
    },
    {
        path: Routes.CONTRACTORS_DETAIL,
        element: <ContractorsDetails />
    },
    {
        path: Routes.CONTRACTORS_CAMP,
        element: <ContractorCamp />
    }
];

export default ContractorsRoute; 