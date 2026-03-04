import authRoles from "@auth/authRoles";
import { FuseNavItemType } from "@fuse/core/FuseNavigation/types/FuseNavItemType";
import i18n from "@i18n";
import { Routes } from "src/utils/routesEnum";
import ar from "./navigation-i18n/ar";
import en from "./navigation-i18n/en";
import es from "./navigation-i18n/es";
import tr from "./navigation-i18n/tr";

i18n.addResourceBundle("en", "navigation", en);
i18n.addResourceBundle("tr", "navigation", tr);
i18n.addResourceBundle("ar", "navigation", ar);
i18n.addResourceBundle("es", "navigation", es);

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
      title: "Más",
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
