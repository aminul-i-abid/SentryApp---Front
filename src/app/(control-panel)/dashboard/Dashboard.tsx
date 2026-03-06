import TopbarHeader from "@/components/TopbarHeader";
import {
  BlockCard,
  CardContainer,
  ChartLine,
  OccupancyBadge,
  ProgressBar,
  StatCard,
} from "@/components/ui";
import useUser from "@auth/useUser";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useRef, useState } from "react";
import { getContractors } from "../contractors/contractorsService";
import tagRoleMap from "../tag/enum/RoleTag";
import BlockOccupancyDetailSidebar from "./components/BlockOccupancyDetailSidebar";
import DashboardDetailSidebar from "./components/DashboardDetailSidebar";
import LostBedsDetailSidebar from "./components/LostBedsDetailSidebar";
import { getDashboardTest } from "./dashboardService";
import { DashboardResponse } from "./models/DashboardResponse";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 0,
    borderStyle: "none",
    borderColor: "transparent",
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.background.paper,
    }),
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-content > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-header > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
}));

/* ---------- SVG icon helpers ---------- */
const IconCamp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 22h20M12 2l8 20H4L12 2z"
    />
  </svg>
);
const IconContractor = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h1M4 21H3m4-11h2m4 0h2m-6 4h2m4 0h2"
    />
  </svg>
);
const IconRoom = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M3 6h18M3 14h18M3 18h18"
    />
  </svg>
);
const IconReservation = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const IconAccessible = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 104 0V7a2 2 0 00-2-2zm0 10a2 2 0 00-2 2v3a2 2 0 104 0v-3a2 2 0 00-2-2z"
    />
  </svg>
);
const IconLostBeds = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
    />
  </svg>
);
const IconSearch = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
    />
  </svg>
);

/* ---------- Skeleton ---------- */
const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-2xl bg-slate-100 dark:bg-white/[0.06]"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-64 rounded-2xl bg-slate-100 dark:bg-white/[0.06]" />
      <div className="h-64 rounded-2xl bg-slate-100 dark:bg-white/[0.06]" />
    </div>
    <div className="h-72 rounded-2xl bg-slate-100 dark:bg-white/[0.06]" />
  </div>
);

/* ====================================================================
   MAIN COMPONENT
   ==================================================================== */
function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [contractors, setContractors] = useState<any[]>([]);
  const [selectedContractor, setSelectedContractor] = useState("");
  const [contractorDropdownOpen, setContractorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedTimeFilter = 0; // 0 = show all available days

  // Block expansion
  const [isBlockExpanded, setIsBlockExpanded] = useState(false);

  // Sidebars
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLostBedsSidebarOpen, setIsLostBedsSidebarOpen] = useState(false);
  const [isBlockOccupancySidebarOpen, setIsBlockOccupancySidebarOpen] =
    useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  const isAdmin =
    user?.role === "Sentry_Admin" ||
    (Array.isArray(user?.role) && user?.role.includes("Sentry_Admin"));

  /* -- Fetch dashboard -- */
  useEffect(() => {
    const fetch = async (companyId: string | null = null) => {
      try {
        setLoading(true);
        const response = await getDashboardTest(companyId);

        if (response.succeeded) {
          setDashboardData(response.data);
        } else {
          setError(
            response.message?.[0] || "Error al obtener datos del dashboard",
          );
        }
      } catch {
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };
    fetch(selectedContractor || null);
  }, [selectedContractor]);

  /* -- Fetch contractors -- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getContractors();

        if (res.succeeded) setContractors(res.data);
      } catch (e) {
        console.error("Error fetching contractors:", e);
      }
    })();
  }, []);

  /* -- Close contractor dropdown on outside click -- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setContractorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedContractorName = useMemo(() => {
    if (!selectedContractor) return "Seleccionar tipo contratista";

    const found = contractors.find((c) => String(c.id) === selectedContractor);
    return found ? found.name : "Seleccionar tipo contratista";
  }, [selectedContractor, contractors]);

  /* ======== Computed data (matches optimized logic) ======== */

  // Accessible rooms
  const accessibleRooms = useMemo(() => {
    if (!dashboardData?.tagDetails) return dashboardData?.totalRooms || 0;

    const disabledRooms = dashboardData.tagDetails.reduce(
      (s, t) => s + (t.disabledRooms || 0),
      0,
    );
    return (dashboardData.totalRooms || 0) - disabledRooms;
  }, [dashboardData]);

  // Lost beds
  const lostBeds = useMemo(() => {
    if (!dashboardData?.tagDetails) return 0;

    return dashboardData.tagDetails.reduce((s, t) => s + (t.lostBeds || 0), 0);
  }, [dashboardData]);

  // Disabled rooms count
  const disabledRoomsCount = useMemo(() => {
    if (!dashboardData?.tagDetails) return 0;
    return dashboardData.tagDetails.reduce(
      (s, t) => s + (t.disabledRooms || 0),
      0,
    );
  }, [dashboardData]);

  // Disabled beds count
  const disabledBedsCount = useMemo(() => {
    if (!dashboardData?.tagDetails) return 0;
    return dashboardData.tagDetails.reduce(
      (s, t) => s + (t.disabledBeds || 0),
      0,
    );
  }, [dashboardData]);

  // Overall occupancy (today) using tagDetails + occupancySummary
  const occupancyMain = useMemo(() => {
    if (
      !dashboardData?.tagDetails ||
      !dashboardData?.occupancySummary?.dailyOccupancy
    ) {
      return { percentage: 0, occupied: 0, total: 0 };
    }

    const today = new Date().toISOString().split("T")[0];
    const todayOcc = dashboardData.occupancySummary.dailyOccupancy.find(
      (day) => new Date(day.date).toISOString().split("T")[0] === today,
    );

    if (!todayOcc) return { percentage: 0, occupied: 0, total: 0 };

    const totalEnabledBeds = dashboardData.tagDetails.reduce(
      (sum, td) => sum + (td.enabledBeds - td.lostBeds),
      0,
    );
    const occupiedBeds = todayOcc.occupiedBeds || 0;
    const pct =
      totalEnabledBeds > 0
        ? Math.round((occupiedBeds * 1000) / totalEnabledBeds) / 10
        : 0;
    return { percentage: pct, occupied: occupiedBeds, total: totalEnabledBeds };
  }, [dashboardData]);

  // Tag / standard occupancy using tagDetails + occupancySummary.occupancyByTag
  const standardOccupancy = useMemo(() => {
    if (
      !dashboardData?.tagDetails ||
      !dashboardData?.occupancySummary?.occupancyByTag
    )
      return [];

    const today = new Date().toISOString().split("T")[0];

    return dashboardData.tagDetails
      .map((td) => {
        const todayTagOcc = dashboardData.occupancySummary!.occupancyByTag[
          td.tag.toString()
        ]?.find(
          (day) => new Date(day.date).toISOString().split("T")[0] === today,
        );
        const enabledBeds = td.enabledBeds - td.lostBeds;
        const occupiedBeds = todayTagOcc?.occupiedBeds || 0;
        const pct =
          enabledBeds > 0
            ? Math.round((occupiedBeds * 1000) / enabledBeds) / 10
            : 0;
        return {
          label: tagRoleMap[td.tag] || "Tag " + td.tag,
          tag: td.tag,
          percentage: pct,
          occupied: occupiedBeds,
          total: enabledBeds,
        };
      })
      .sort((a, b) => b.tag - a.tag); // 2 Trabajador, 1 Supervisor, 0 Gerente
  }, [dashboardData]);

  // Chart data from occupancySummary.dailyOccupancy
  const chartData = useMemo(() => {
    const daily = dashboardData?.occupancySummary?.dailyOccupancy;

    if (!daily || daily.length === 0)
      return {
        labels: [] as string[],
        totalSeries: [] as number[],
        occupiedSeries: [] as number[],
      };

    const sliced =
      selectedTimeFilter > 0 ? daily.slice(0, selectedTimeFilter) : daily;
    return {
      labels: sliced.map((d) => {
        const dt = new Date(d.date);
        return `${dt.getDate()}/${dt.getMonth() + 1}`;
      }),
      totalSeries: sliced.map((d) => d.totalBeds),
      occupiedSeries: sliced.map((d) => d.occupiedBeds),
    };
  }, [dashboardData, selectedTimeFilter]);

  // Block occupancy
  const blockOccupancy = dashboardData?.occupancySummary?.blockOccupancy || [];

  /* -- Badge color helpers -- */
  const badgeStyles: Record<number, { colorClass: string; bgClass: string }> = {
    2: { colorClass: "text-green-600", bgClass: "bg-green-50" },
    1: { colorClass: "text-amber-500", bgClass: "bg-amber-50" },
    0: { colorClass: "text-red-500", bgClass: "bg-red-50" },
  };

  /* ======== Render ======== */

  if (loading) {
    return (
      <Root
        containerClassName="!max-w-full"
        header={<TopbarHeader />}
        content={<DashboardSkeleton />}
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] || "";

  return (
    <>
      <Root
        containerClassName="!max-w-full"
        header={<TopbarHeader />}
        content={
          <div className="px-6 py-4 space-y-6">
            {/* === Title + Contractor filter row === */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                Panel de Control
              </h2>
              {isAdmin && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setContractorDropdownOpen(!contractorDropdownOpen)
                    }
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer"
                  >
                    {selectedContractorName}
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        contractorDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {contractorDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-1 w-64 max-h-80 overflow-y-auto overflow-x-hidden rounded-xl bg-white dark:bg-slate-800 border-4 border-[#F6F6F6] dark:border-white/10 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContractor("");
                          setContractorDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 m-2 text-sm rounded-[8px] transition cursor-pointer ${
                          selectedContractor === ""
                            ? "bg-gray-100 text-black font-medium"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        Todos los contratistas
                      </button>
                      {contractors.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedContractor(String(c.id));
                            setContractorDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 m-2 text-sm rounded-[8px] transition cursor-pointer hover:bg-gray-100 hover:text-black hover:font-medium ${
                            selectedContractor === String(c.id)
                              ? "bg-gray-100 text-black font-medium"
                              : "bg-white text-gray-600"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* === Single-column layout === */}
            <div className="space-y-6">
              {/* Stat cards row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                  icon="/assets/icons/Frame.png"
                  value={String(dashboardData?.totalCamps || 0).padStart(
                    2,
                    "0",
                  )}
                  label="Campamentos"
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-600"
                />
                {isAdmin && (
                  <StatCard
                    icon="/assets/icons/Frame (1).png"
                    value={dashboardData?.totalCompanies || 0}
                    label="Contratistas"
                    iconBgColor="bg-orange-50"
                    iconColor="text-orange-500"
                  />
                )}
                <StatCard
                  icon="/assets/icons/Frame (2).png"
                  value={dashboardData?.totalRooms || 0}
                  label="Habitaciones"
                  iconBgColor="bg-red-100"
                  iconColor="text-emerald-500"
                />
                <StatCard
                  icon="/assets/icons/Frame (3).png"
                  value={dashboardData?.totalReservations || 0}
                  label="Reservas"
                  iconBgColor="bg-red-50"
                  iconColor="text-red-500"
                />
                <StatCard
                  icon="/assets/icons/Frame (4).png"
                  value={accessibleRooms}
                  label="Hab. accesibles"
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                />
                <StatCard
                  icon="/assets/icons/Frame (5).png"
                  value={lostBeds}
                  label="Pérdida / Est."
                  iconBgColor="bg-slate-100"
                  iconColor="text-slate-500"
                />
              </div>

              {/* Bed occupancy by standard */}
              <div className="bg-[#F7F7F7] dark:bg-white/[0.06] p-1.5 rounded-xl space-y-3">
                {/* Title + progress bar */}
                <div className="rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/10 shadow-sm px-6 py-5">
                  <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
                    Ocupación de camas
                  </h3>
                  <ProgressBar
                    value={occupancyMain.occupied}
                    max={occupancyMain.total}
                    label={
                      occupancyMain.occupied +
                      " / " +
                      occupancyMain.total +
                      " camas"
                    }
                  />
                </div>
                {/* Tag badges */}
                <div className="grid grid-cols-3 gap-3">
                  {standardOccupancy.map((item) => (
                    <OccupancyBadge
                      key={item.tag}
                      label={item.label}
                      percentage={item.percentage}
                      occupied={item.occupied}
                      total={item.total}
                      colorClass="text-[#415EDE]"
                      bgClass="bg-white"
                    />
                  ))}
                </div>
              </div>

              {/* Disabled Rooms + Beds Lost per Standard row */}
              <div className="bg-[#f7f7f7] rounded-xl p-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Disabled Rooms */}
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/10 shadow-sm px-5 py-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 104 0V7a2 2 0 00-2-2zm0 10a2 2 0 00-2 2v3a2 2 0 104 0v-3a2 2 0 00-2-2z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Habitaciones Deshabilitadas
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {disabledRoomsCount}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {disabledBedsCount} camas
                    </p>
                  </button>

                  {/* Beds Lost per Standard */}
                  <button
                    type="button"
                    onClick={() => setIsLostBedsSidebarOpen(true)}
                    className="rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/10 shadow-sm px-5 py-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Camas Perdidas por Estándar
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {lostBeds}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Por cambio de categoría
                    </p>
                  </button>
                </div>
              </div>

              {/* Bed occupancy chart */}
              <div className="bg-[#F7F7F7] dark:bg-white/[0.06] p-1.5 rounded-2xl">
                <CardContainer title="Ocupación de camas – Próximos días">
                  <ChartLine
                    labels={chartData.labels}
                    series={[
                      {
                        label: "Campamentos totales",
                        data: chartData.totalSeries,
                        color: "#2563EB",
                      },
                      {
                        label: "Camas Ocupadas",
                        data: chartData.occupiedSeries,
                        color: "#10B981",
                      },
                    ]}
                    height={340}
                    yLabel="Camas"
                  />
                </CardContainer>
              </div>

              {/* Block occupancy distribution */}
              {blockOccupancy.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">
                    Ocupación del bloque
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 bg-[#F7F7F7] dark:bg-white/[0.06] p-2 rounded-xl">
                    {blockOccupancy
                      .slice(0, isBlockExpanded ? blockOccupancy.length : 48)
                      .map((block) => (
                        <BlockCard
                          key={block.blockId}
                          name={block.blockName}
                          percentage={block.occupancyPercentageToday}
                          occupied={block.occupiedBedsToday}
                          total={block.totalBeds}
                          onClick={() => {
                            setSelectedBlockId(block.blockId);
                            setIsBlockOccupancySidebarOpen(true);
                          }}
                        />
                      ))}
                  </div>
                  {blockOccupancy.length > 48 && (
                    <button
                      type="button"
                      onClick={() => setIsBlockExpanded(!isBlockExpanded)}
                      className="w-full text-center text-sm text-slate-400 hover:text-blue-500 transition py-2 cursor-pointer"
                    >
                      {isBlockExpanded ? "MENOS ↑" : "MÁS... ↓"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Sidebars */}
      <DashboardDetailSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedContractor={selectedContractor}
      />
      <LostBedsDetailSidebar
        open={isLostBedsSidebarOpen}
        onClose={() => setIsLostBedsSidebarOpen(false)}
        selectedContractor={selectedContractor}
      />
      <BlockOccupancyDetailSidebar
        open={isBlockOccupancySidebarOpen}
        onClose={() => {
          setIsBlockOccupancySidebarOpen(false);
          setSelectedBlockId(null);
        }}
        selectedBlockId={selectedBlockId}
      />
    </>
  );
}

export default Dashboard;
