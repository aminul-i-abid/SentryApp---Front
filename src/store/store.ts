import { Action, Middleware, ThunkAction, configureStore, createSelector } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import apiService from 'src/store/apiService';
import rootReducer from './rootReducer';
import { dynamicMiddleware } from './middleware';

// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

const middlewares: Middleware[] = [apiService.middleware, dynamicMiddleware];

export const makeStore = (preloadedState?: Partial<RootState>) => {
	const store = configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware({
			// Optimizaciones para reducir carga en desarrollo
			serializableCheck: process.env.NODE_ENV === 'production' ? false : {
				// Ignorar acciones específicas que pueden contener datos no serializables
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
				ignoredPaths: ['apiService'],
			},
			immutableCheck: process.env.NODE_ENV === 'production' ? false : {
				// Solo verificar en desarrollo, reduce carga en producción
				warnAfter: 128,
			},
		}).concat(middlewares),
		preloadedState,
		devTools: process.env.NODE_ENV !== 'production'
	});
	// configure listeners using the provided defaults
	// optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
	setupListeners(store.dispatch);
	return store;
};

export const store = makeStore();

// Infer the type of `store`
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>;
export type AppAction<R = Promise<void>> = Action<string> | ThunkAction<R, RootState, unknown, Action<string>>;

export const createAppSelector = createSelector.withTypes<RootState>();

export default store;
