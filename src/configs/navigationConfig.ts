import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import { Routes } from 'src/utils/routesEnum';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
import es from './navigation-i18n/es';
import authRoles from '@auth/authRoles';


i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('tr', 'navigation', tr);
i18n.addResourceBundle('ar', 'navigation', ar);
i18n.addResourceBundle('es', 'navigation', es);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'dashboard-component',
		title: 'Dashboard',
		translate: 'DASHBOARD',
		type: 'item',
		icon: 'heroicons-outline:home',
		url: Routes.DASHBOARD,
		auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	},
	// {
	// 	id: 'dashboardTest-component',
	// 	title: 'DashboardTest',
	// 	translate: 'DASHBOARDTEST',
	// 	type: 'item',
	// 	icon: 'heroicons-outline:home',
	// 	url: Routes.DASHBOARDTEST,
	// 	auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	// },
	/*{
		id: 'badge-component',
		title: 'Chapa',
		translate: 'CHAPA',
		type: 'item',
		icon: 'heroicons-outline:lock-closed',
		url: Routes.BADGE
	},*/
	{
		id: 'contractors-component',
		title: 'Contratistas',
		translate: 'CONTRATISTAS',
		type: 'item',
		icon: 'heroicons-outline:user',
		url: Routes.CONTRACTORS,
		auth: authRoles.admin // Solo visible para Sentry_Admin y Company_Admin
	},
	{
		id: 'camps-component',
		title: 'Campamentos',
		translate: 'CAMPAMENTOS',
		type: 'item',
		icon: 'heroicons-outline:building-office-2',
		url: Routes.CAMPS,
		auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	},
	{
		id: 'room-component',
		title: 'Habitaciones',
		translate: 'HABITACIONES',
		type: 'item',
		icon: 'heroicons-outline:home-modern',
		url: Routes.ROOM,
		auth: authRoles.admin // Solo visible para Sentry_Admin
	},
	{
		id: 'reserve-component',
		title: 'Reservas',
		translate: 'RESERVAS',
		type: 'item',
		icon: 'heroicons-outline:list-bullet',
		url: Routes.RESERVE,
		auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	},
	{
		id: 'guests-component',
		title: 'Huéspedes',
		translate: 'HUÉSPEDES',
		type: 'item',
		icon: 'heroicons-outline:user-group',
		url: Routes.GUESTS,
		auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	},
	{
		id: 'calendar-component',
		title: 'Calendario',
		translate: 'CALENDARIO',
		type: 'item',
		icon: 'heroicons-outline:calendar',
		url: Routes.CALENDAR,
		auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	},
	{
		id: 'reports-component',
		title: 'Reportes',
		translate: 'REPORTES',
		type: 'item',
		icon: 'heroicons-outline:document-chart-bar',
		url: Routes.REPORTS,
		auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	},
	{
		id: 'auditory-component',
		title: 'Auditoría',
		translate: 'AUDITORÍA',
		type: 'item',
		icon: 'heroicons-outline:computer-desktop',
		url: Routes.AUDITORY,
		auth: authRoles.admin // Solo visible para Sentry_Admin
	},
	{
		id: 'user-manual-component',
		title: 'Documentos',
		translate: 'DOCUMENTOS',
		type: 'item',
		icon: 'heroicons-outline:document-text',
		url: Routes.USER_MANUAL,
		auth: authRoles.company // Solo visible para Sentry_Admin
	},
	// {
	// 	id: 'problems-component',
	// 	title: 'Problemas',
	// 	translate: 'PROBLEMAS',
	// 	type: 'item',
	// 	icon: 'heroicons-outline:exclamation-circle',
	// 	url: Routes.PROBLEMS,
	// 	auth: authRoles.company // Solo visible para Sentry_Admin
	// },
	{
		id: 'notifications-component',
		title: 'Notificaciones',
		translate: 'NOTIFICACIONES',
		type: 'item',
		icon: 'heroicons-outline:bell-alert',
		url: Routes.NOTIFICATIONS,
		auth: authRoles.admin // Solo visible para Sentry_Admin
	},
	{
		id: 'activities-component',
		title: 'Actividades',
		translate: 'ACTIVIDADES',
		type: 'collapse',
		icon: 'heroicons-outline:calendar-days',
		auth: authRoles.user, // Visible para todos los usuarios autenticados
		// NOTA: La visibilidad final está controlada por ActivityModuleGuard
		// que valida user.modules.activities
		badge: {
			title: 'Plus',
			classes: 'px-2 bg-gradient-to-r from-purple-400 to-pink-400'
		},
		children: [
			{
				id: 'activities-list',
				title: 'Todas las Actividades',
				translate: 'ACTIVITIES_LIST',
				type: 'item',
				icon: 'heroicons-outline:list-bullet',
				url: Routes.ACTIVITIES,
				auth: authRoles.user,
				end: true
			},
			{
				id: 'activities-my-reservations',
				title: 'Mis Reservas',
				translate: 'MY_RESERVATIONS',
				type: 'item',
				icon: 'heroicons-outline:bookmark',
				url: Routes.ACTIVITIES_RESERVATIONS,
				auth: authRoles.user,
				end: true
			},
			{
				id: 'activities-management',
				title: 'Administrar Reservas',
				translate: 'MANAGE_RESERVATIONS',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-list',
				url: '/activities/management',
				auth: authRoles.admin,
				end: true
			}
		]
	}
	// {
	// 	id: 'cargo-component',
	// 	title: 'Cargos',
	// 	translate: 'CARGOS',
	// 	type: 'item',
	// 	icon: 'heroicons-outline:tag',
	// 	url: Routes.TAG,
	// 	auth: authRoles.company // Solo visible para Sentry_Admin y Company_Admin
	// }
];

export default navigationConfig;
