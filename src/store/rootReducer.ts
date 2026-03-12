import { combineSlices } from '@reduxjs/toolkit';
import apiService from './apiService';
import { navigationSlice } from '@/components/theme-layouts/components/navigation/store/navigationSlice';
import auditoryFiltersReducer from './auditoryFiltersSlice';
import { housekeepingReducer } from './housekeeping';
import { maintenanceReducer } from './maintenance';

// @ts-ignore-next-line
export interface LazyLoadedSlices {}

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
export const rootReducer = combineSlices(
	/**
	 * Static slices
	 */
	navigationSlice,
	/**
	 * Lazy loaded slices
	 */
	{
		[apiService.reducerPath]: apiService.reducer,
		auditoryFilters: auditoryFiltersReducer,
		housekeeping: housekeepingReducer,
		maintenance: maintenanceReducer,
	}
).withLazyLoadedSlices<LazyLoadedSlices>();

export default rootReducer;
