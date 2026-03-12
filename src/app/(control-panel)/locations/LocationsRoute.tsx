import { lazy } from 'react';
import StockModuleGuard from '../stocks/components/StockModuleGuard';

const Locations = lazy(() => import('./Locations'));

/**
 * The Locations Route Configuration
 */
const LocationsRoute = {
    path: 'locations',
    children: [
        {
            path: '',
            element: (
                <StockModuleGuard>
                    <Locations />
                </StockModuleGuard>
            )
        }
    ]
};

export default LocationsRoute;
