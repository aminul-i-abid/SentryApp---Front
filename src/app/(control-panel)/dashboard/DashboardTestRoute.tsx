import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import { lazy } from "react";
import { Routes } from "src/utils/routesEnum";

const Dashboard = lazy(() => import("./Dashboard"));

const DashboardRoute: FuseRouteItemType[] = [
  {
    path: Routes.DASHBOARD,
    element: <Dashboard />,
  },
];

export default DashboardRoute;
