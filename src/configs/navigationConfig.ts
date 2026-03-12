import authRoles from "@auth/authRoles";
import { FuseNavItemType } from "@fuse/core/FuseNavigation/types/FuseNavItemType";
import i18n from "@i18n";
import { Routes } from "src/utils/routesEnum";
import ar from "./navigation-i18n/ar";
import en from "./navigation-i18n/en";
import es from './navigation-i18n/es';
import tr from "./navigation-i18n/tr";

i18n.addResourceBundle("en", "navigation", en);
i18n.addResourceBundle("tr", "navigation", tr);
i18n.addResourceBundle("ar", "navigation", ar);
i18n.addResourceBundle('es', 'navigation', es);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
  {
    id: "dashboard-component",
    title: "DASHBOARD",
    translate: "DASHBOARD",
    type: "item",
    icon: "/assets/icons/nav/dash.png",
    url: Routes.DASHBOARD,
    auth: authRoles.company, // Solo visible para Sentry_Admin y Company_Admin
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
    id: "contractors-component",
    title: "CONTRATISTAS",
    translate: "CONTRATISTAS",
    type: "item",
    icon: "/assets/icons/nav/contractor.png",
    url: Routes.CONTRACTORS,
    auth: authRoles.admin, // Solo visible para Sentry_Admin y Company_Admin
  },
  {
    id: "camps-component",
    title: "CAMPAMENTOS",
    translate: "CAMPAMENTOS",
    type: "item",
    icon: "/assets/icons/nav/camp.png",
    url: Routes.CAMPS,
    auth: authRoles.company, // Solo visible para Sentry_Admin y Company_Admin
  },
  {
    id: "room-component",
    title: "HABITACIONES",
    translate: "HABITACIONES",
    type: "item",
    icon: "/assets/icons/nav/rooms.png",
    url: Routes.ROOM,
    auth: authRoles.admin, // Solo visible para Sentry_Admin
  },
  {
    id: "reserve-component",
    title: "RESERVAS",
    translate: "RESERVAS",
    type: "item",
    icon: "/assets/icons/nav/reservations.png",
    url: Routes.RESERVE,
    auth: authRoles.company, // Solo visible para Sentry_Admin y Company_Admin
  },
  {
    id: "guests-component",
    title: "HUÉSPEDES",
    translate: "HUÉSPEDES",
    type: "item",
    icon: "/assets/icons/nav/guests.png",
    url: Routes.GUESTS,
    auth: authRoles.company, // Solo visible para Sentry_Admin y Company_Admin
  },
  {
    id: "calendar-component",
    title: "CALENDARIO",
    translate: "CALENDARIO",
    type: "item",
    icon: "/assets/icons/nav/calendar.png",
    url: Routes.CALENDAR,
    auth: authRoles.company, // Solo visible para Sentry_Admin y Company_Admin
  },
  {
    id: "reports-component",
    title: "REPORTES",
    translate: "REPORTES",
    type: "item",
    icon: "/assets/icons/nav/reports.png",
    url: Routes.REPORTS,
    auth: authRoles.company, // Solo visible para Sentry_Admin y Company_Admin
  },
  {
    id: "auditory-component",
    title: "AUDITORÍA",
    translate: "AUDITORÍA",
    type: "item",
    icon: "/assets/icons/nav/audit.png",
    url: Routes.AUDITORY,
    auth: authRoles.admin, // Solo visible para Sentry_Admin
  },
  {
    id: "user-manual-component",
    title: "DOCUMENTOS",
    translate: "DOCUMENTOS",
    type: "item",
    icon: "/assets/icons/nav/documents.png",
    url: Routes.USER_MANUAL,
    auth: authRoles.company, // Solo visible para Sentry_Admin
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
    id: "notifications-component",
    title: "NOTIFICACIONES",
    translate: "NOTIFICACIONES",
    type: "item",
    icon: "/assets/icons/nav/notifications.png",
    url: Routes.NOTIFICATIONS,
    auth: authRoles.admin, // Solo visible para Sentry_Admin
  },
  {
    id: "activities-component",
    title: "ACTIVIDADES",
    translate: "ACTIVIDADES",
    type: "collapse",
    icon: "/assets/icons/nav/activities.png",
    auth: authRoles.user, // Visible para todos los usuarios autenticados
    // NOTA: La visibilidad final está controlada por ActivityModuleGuard
    // que valida user.modules.activities
    badge: {
      title: "Plus",
      classes: "px-2 bg-[#415EDE] text-white",
    },
    children: [
      {
        id: "activities-list",
        title: "Todas las Actividades",
        translate: "ACTIVITIES_LIST",
        type: "item",
        icon: "heroicons-outline:list-bullet",
        url: Routes.ACTIVITIES,
        auth: authRoles.user,
        end: true,
      },
      {
        id: "activities-my-reservations",
        title: "Mis Reservas",
        translate: "MY_RESERVATIONS",
        type: "item",
        icon: "heroicons-outline:bookmark",
        url: Routes.ACTIVITIES_RESERVATIONS,
        auth: authRoles.user,
        end: true,
      },
      {
        id: "activities-management",
        title: "Administrar Reservas",
        translate: "MANAGE_RESERVATIONS",
        type: "item",
        icon: "heroicons-outline:clipboard-document-list",
        url: "/activities/management",
        auth: authRoles.admin,
        end: true,
      },
    ],
  },
	{
		id: 'housekeeping-component',
		title: 'Housekeeping',
		translate: 'HOUSEKEEPING',
		type: 'collapse',
		icon: 'heroicons-outline:sparkles',
		auth: authRoles.company, // Visible para Sentry_Admin y Company_Admin
		badge: {
			title: 'Plus',
			classes: 'px-2 bg-gradient-to-r from-purple-400 to-pink-400'
		},
		children: [
			{
				id: 'housekeeping-dashboard-home',
				title: 'Dashboard',
				translate: 'HOUSEKEEPING_DASHBOARD',
				type: 'item',
				url: Routes.HOUSEKEEPING_DASHBOARD_HOME,
				icon: 'heroicons-outline:chart-bar',
				auth: authRoles.company,
				end: true
			},
			{
				id: 'housekeeping-assignment',
				title: 'Asignación de Tareas',
				translate: 'HOUSEKEEPING_ASSIGNMENT',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-check',
				url: Routes.HOUSEKEEPING_ASSIGNMENT,
				auth: authRoles.company,
				end: true
			},
			{
				id: 'housekeeping-assignments',
				title: 'Ver Asignaciones',
				translate: 'HOUSEKEEPING_ASSIGNMENTS',
				type: 'item',
				icon: 'heroicons-outline:list-bullet',
				url: Routes.HOUSEKEEPING_ASSIGNMENTS,
				auth: authRoles.company,
				end: true
			},
			// {
			// 	id: 'housekeeping-dashboard',
			// 	title: 'Dashboard',
			// 	translate: 'HOUSEKEEPING_DASHBOARD',
			// 	type: 'collapse',
			// 	icon: 'heroicons-outline:chart-bar',
			// 	auth: authRoles.company,
			// 	children: [
			// 		{
			// 			id: 'housekeeping-dashboard-home',
			// 			title: 'Inicio',
			// 			translate: 'HOUSEKEEPING_DASHBOARD_HOME',
			// 			type: 'item',
			// 			url: Routes.HOUSEKEEPING_DASHBOARD_HOME,
			// 			auth: authRoles.company,
			// 			end: true
			// 		},
			// 		{
			// 			id: 'housekeeping-dashboard-variance',
			// 			title: 'Análisis de Varianza',
			// 			translate: 'HOUSEKEEPING_DASHBOARD_VARIANCE',
			// 			type: 'item',
			// 			url: Routes.HOUSEKEEPING_DASHBOARD_VARIANCE,
			// 			auth: authRoles.company,
			// 			end: true
			// 		},
			// 		{
			// 			id: 'housekeeping-dashboard-maintenance',
			// 			title: 'Mantenimiento',
			// 			translate: 'HOUSEKEEPING_DASHBOARD_MAINTENANCE',
			// 			type: 'item',
			// 			url: Routes.HOUSEKEEPING_DASHBOARD_MAINTENANCE,
			// 			auth: authRoles.company,
			// 			end: true
			// 		},
			// 		{
			// 			id: 'housekeeping-dashboard-discrepancies',
			// 			title: 'Discrepancias',
			// 			translate: 'HOUSEKEEPING_DASHBOARD_DISCREPANCIES',
			// 			type: 'item',
			// 			url: Routes.HOUSEKEEPING_DASHBOARD_DISCREPANCIES,
			// 			auth: authRoles.company,
			// 			end: true
			// 		}
			// 	]
			// },
			{
				id: 'housekeeping-configuration',
				title: 'Configuración',
				translate: 'HOUSEKEEPING_CONFIGURATION',
				type: 'collapse',
				icon: 'heroicons-outline:cog-6-tooth',
				auth: authRoles.company,
				children: [
					{
						id: 'housekeeping-tareas',
						title: 'Tareas',
						translate: 'HOUSEKEEPING_TAREAS',
						type: 'item',
						url: Routes.HOUSEKEEPING_TAREAS,
						auth: authRoles.company,
						end: true
					},
					{
						id: 'housekeeping-templates',
						title: 'Plantillas',
						translate: 'HOUSEKEEPING_TEMPLATES',
						type: 'item',
						url: Routes.HOUSEKEEPING_TEMPLATES,
						auth: authRoles.company,
						end: true
					},
					{
						id: 'housekeeping-rules',
						title: 'Reglas',
						translate: 'HOUSEKEEPING_RULES',
						type: 'item',
						url: Routes.HOUSEKEEPING_RULES,
						auth: authRoles.company,
						end: true
					},
				]
			}
		]
	},
	{
		id: 'stock-component',
		title: 'STOCK',
		translate: 'STOCK',
		type: 'collapse',
		icon: 'heroicons-outline:cube',
		auth: authRoles.admin,
		// NOTA: La visibilidad final está controlada por StockModuleGuard
		// que valida user.modules.stock
		badge: {
			title: 'Plus',
			classes: 'px-2 bg-gradient-to-r from-blue-400 to-cyan-400'
		},
		children: [
			{
				id: 'stock-configuration',
				title: 'CONFIGURACIÓN',
				translate: 'CONFIGURATION',
				type: 'collapse',
				icon: 'heroicons-outline:cog-6-tooth',
				auth: authRoles.admin,
				children: [
					{
						id: 'item-unit-of-measure-component',
						title: 'UNIDADES DE MEDIDA',
						translate: 'ITEM_UNIT_OF_MEASURE',
						type: 'item',
						icon: 'heroicons-outline:scale',
						url: Routes.ITEM_UNIT_OF_MEASURE,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'items-component',
						title: 'ITEMS',
						translate: 'ITEMS',
						type: 'item',
						icon: 'heroicons-outline:cube',
						url: Routes.ITEMS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'lots-component',
						title: 'LOTES',
						translate: 'LOTS',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-list',
						url: Routes.LOTS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'suppliers-component',
						title: 'PROVEEDORES',
						translate: 'SUPPLIERS',
						type: 'item',
						icon: 'heroicons-outline:building-storefront',
						url: Routes.SUPPLIERS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'warehouses-component',
						title: 'ALMACENES',
						translate: 'WAREHOUSES',
						type: 'item',
						icon: 'heroicons-outline:building-office',
						url: Routes.WAREHOUSES,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'locations-component',
						title: 'UBICACIONES',
						translate: 'LOCATIONS',
						type: 'item',
						icon: 'heroicons-outline:map-pin',
						url: Routes.LOCATIONS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'movement-reasons-component',
						title: 'MOTIVOS DE MOVIMIENTO',
						translate: 'MOVEMENT_REASONS',
						type: 'item',
						icon: 'heroicons-outline:document-text',
						url: Routes.MOVEMENT_REASONS,
						auth: authRoles.admin,
						end: true
					}
				]
			},
			{
				id: 'movements-group',
				title: 'MOVIMIENTOS',
				translate: 'MOVEMENTS',
				type: 'collapse',
				icon: 'heroicons-outline:arrows-right-left',
				auth: authRoles.admin,
				children: [
					{
						id: 'all-movements-component',
						title: 'TODOS LOS MOVIMIENTOS',
						translate: 'ALL_MOVEMENTS',
						type: 'item',
						icon: 'heroicons-outline:list-bullet',
						url: Routes.MOVEMENTS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'receiving-component',
						title: 'RECEPCIÓN',
						translate: 'RECEIVING',
						type: 'item',
						icon: 'heroicons-outline:arrow-down-tray',
						url: Routes.RECEIVING,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'transfers-component',
						title: 'TRANSFERENCIAS',
						translate: 'TRANSFERS',
						type: 'item',
						icon: 'heroicons-outline:arrow-path',
						url: Routes.TRANSFERS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'consumption-component',
						title: 'CONSUMO',
						translate: 'CONSUMPTION',
						type: 'item',
						icon: 'heroicons-outline:minus-circle',
						url: Routes.CONSUMPTION,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'scrap-component',
						title: 'SCRAP',
						translate: 'SCRAP',
						type: 'item',
						icon: 'heroicons-outline:trash',
						url: Routes.SCRAP,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'positive-adjustments-component',
						title: 'AJUSTES POSITIVOS',
						translate: 'POSITIVE_ADJUSTMENTS',
						type: 'item',
						icon: 'heroicons-outline:plus-circle',
						url: Routes.POSITIVE_ADJUSTMENTS,
						auth: authRoles.admin,
						end: true
					},
					{
						id: 'negative-adjustments-component',
						title: 'AJUSTES NEGATIVOS',
						translate: 'NEGATIVE_ADJUSTMENTS',
						type: 'item',
						icon: 'heroicons-outline:minus-circle',
						url: Routes.NEGATIVE_ADJUSTMENTS,
						auth: authRoles.admin,
						end: true
					}
				]
			},
			// {
			// 	id: 'stocks-component',
			// 	title: 'STOCK',
			// 	translate: 'STOCKS',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:squares-2x2',
			// 	url: Routes.STOCKS,
			// 	auth: authRoles.user,
			// 	end: true
			// },
			{
				id: 'stocks-by-article-component',
				title: 'STOCKS POR ARTÍCULO',
				translate: 'STOCK_BY_ARTICLE',
				type: 'item',
				icon: 'heroicons-outline:cube',
				url: Routes.STOCKS_BY_ARTICLE,
				auth: authRoles.user,
				end: true
			},
			{
				id: 'stocks-by-warehouse-component',
				title: 'STOCKS POR ALMACÉN',
				translate: 'STOCK_BY_WAREHOUSE',
				type: 'item',
				icon: 'heroicons-outline:building-storefront',
				url: Routes.STOCKS_BY_WAREHOUSE,
				auth: authRoles.user,
				end: true
			},
			{
				id: 'supplier-lots-component',
				title: 'LOTES PROVEEDOR',
				translate: 'SUPPLIER_LOTS',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-list',
				url: Routes.SUPPLIER_LOTS,
				auth: authRoles.admin,
				end: true
			},
		]
	},
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
