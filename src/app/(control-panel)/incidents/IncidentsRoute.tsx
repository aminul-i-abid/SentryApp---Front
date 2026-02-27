import { lazy } from "react";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import { Routes } from "@/utils/routesEnum";

const Incidents = lazy(() => import("./Incidents"));

const IncidentsRoute: FuseRouteItemType = {
    path: Routes.PROBLEMS,
    element: <Incidents />,
};

export default IncidentsRoute;
