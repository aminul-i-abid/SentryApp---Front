import { lazy } from "react";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import { Routes } from "@/utils/routesEnum";

const Documents = lazy(() => import("./Documents"));

const DocumentsRoute: FuseRouteItemType = {
    path: Routes.USER_MANUAL,
    element: <Documents />,
};

export default DocumentsRoute;
