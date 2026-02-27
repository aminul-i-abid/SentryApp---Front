import FuseLayout from '@fuse/core/FuseLayout';
import { SnackbarProvider } from 'notistack';
import themeLayouts from 'src/components/theme-layouts/themeLayouts';
import { Provider } from 'react-redux';
import FuseSettingsProvider from '@fuse/core/FuseSettings/FuseSettingsProvider';
import { I18nProvider } from '@i18n/I18nProvider';
import ErrorBoundary from '@fuse/utils/ErrorBoundary';
import Authentication from '@auth/Authentication';
import MainThemeProvider from '../contexts/MainThemeProvider';
import { LoadingProvider } from '../contexts/LoadingContext';
import store from '@/store/store';
import routes from '@/configs/routesConfig';
import AppContext from '@/contexts/AppContext';
import TitleManager from '@/components/TitleManager';
import ZendeskController from '@/components/ZendeskController';

/**
 * The main App component.
 */
function App() {
	const AppContextValue = {
		routes
	};

	return (
		<ErrorBoundary>
			<AppContext.Provider value={AppContextValue}>
				{/* Redux Store Provider */}
				<Provider store={store}>
					<Authentication>
						<FuseSettingsProvider>
							<I18nProvider>
								{/* Theme Provider */}
								<MainThemeProvider>
									{/* Loading Provider */}
									<LoadingProvider>
										{/* Notistack Notification Provider */}
										<SnackbarProvider
											maxSnack={5}
											anchorOrigin={{
												vertical: 'bottom',
												horizontal: 'right'
											}}
											style={{ zIndex: 13001 }}
											classes={{
												containerRoot: 'bottom-0 right-0 mb-13 md:mb-17 mr-2 lg:mr-20'
											}}
										>
											<TitleManager />
											<ZendeskController />
											<FuseLayout layouts={themeLayouts} />
										</SnackbarProvider>
									</LoadingProvider>
								</MainThemeProvider>
							</I18nProvider>
						</FuseSettingsProvider>
					</Authentication>
				</Provider>
			</AppContext.Provider>
		</ErrorBoundary>
	);
}

export default App;
