import { lazy } from "react";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import { Routes } from "@/utils/routesEnum";

const Notifications = lazy(() => import("./Notifications"));

const NotificationsRoute: FuseRouteItemType = {
	path: Routes.NOTIFICATIONS,
	element: <Notifications />,
};

export default NotificationsRoute;
