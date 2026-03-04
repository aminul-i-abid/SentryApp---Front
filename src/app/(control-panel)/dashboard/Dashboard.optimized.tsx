import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import useUser from "@auth/useUser";
import FusePageSimple from "@fuse/core/FusePageSimple";
import BusinessIcon from "@mui/icons-material/Business";
import CampingIcon from "@mui/icons-material/Cabin";
import EventIcon from "@mui/icons-material/Event";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import {
  Box,
  Collapse,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Tooltip as ChartTooltip,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { getContractors } from "../contractors/contractorsService";
import tagRoleMap from "../tag/enum/RoleTag";
import BlockOccupancyDetailSidebar from "./components/BlockOccupancyDetailSidebar";
import DashboardDetailSidebar from "./components/DashboardDetailSidebar";
import LostBedsDetailSidebar from "./components/LostBedsDetailSidebar";
import { getDashboardTest } from "./dashboardService";
import { DashboardResponse } from "./models/DashboardResponse";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Filler,
  Legend,
);

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

// Componente mejorado para KPIs principales agrupados
const KPIGroupCard = ({ kpis }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      backgroundColor: "#FFFFFF",
      border: "1px solid #E2E8F0",
    }}
  >
    {/* <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1E293B' }}>
            Resumen General
        </Typography> */}
    <Grid container spacing={3}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                color: kpi.color,
                mb: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(kpi.icon, { fontSize: "medium" })}
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#1E293B", mb: 0.5 }}
            >
              {kpi.value}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748B", fontSize: "0.875rem" }}
            >
              {kpi.title}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

// Componente para métricas operativas con mejor distribución vertical
const OperationalMetricCard = ({
  icon,
  title,
  value,
  subtitle,
  color,
  onClick = undefined,
}) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 3,
      borderRadius: 2,
      height: "100%",
      border: "1px solid #E2E8F0",
      backgroundColor: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      cursor: onClick ? "pointer" : "default",
      "&:hover": {
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        transform: "translateY(-1px)",
        transition: "all 0.2s ease-in-out",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Box
        sx={{
          color,
          backgroundColor: `${color}15`,
          p: 1.5,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        {React.cloneElement(icon, { fontSize: "medium" })}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: "#64748B", fontWeight: 500, mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B" }}>
          {value}
        </Typography>
      </Box>
    </Box>
    {subtitle && (
      <Typography
        variant="body2"
        sx={{ color: "#94A3B8", textAlign: "center", mt: 1 }}
      >
        {subtitle}
      </Typography>
    )}
  </Paper>
);

// Componente para la ocupación por pabellones
const BlockOccupancyCard = ({
  blockData,
  onBlockClick,
  expanded,
  onToggle,
}) => {
  const getOccupancyColor = (percentage: number) => {
    if (percentage < 40) return "#EF4444"; // Rojo para menos del 40%
    if (percentage <= 85) return "#F59E0B"; // Amarillo para 41-85%
    return "#10B981"; // Verde para más del 86%
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1E293B" }}>
          Ocupación por Pabellones
        </Typography>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>
      <Collapse in={expanded}>
        {/* Grid de pabellones */}
        <Grid container spacing={2}>
          {blockData.map((block, index) => {
            const occupancyColor = getOccupancyColor(
              block.occupancyPercentageToday,
            );
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={block.blockId}>
                <Paper
                  elevation={0}
                  onClick={() => onBlockClick && onBlockClick(block.blockId)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#F8FAFC",
                    border: `2px solid ${occupancyColor}40`,
                    textAlign: "center",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#F1F5F9",
                      borderColor: occupancyColor,
                      transform: "translateY(-1px)",
                      transition: "all 0.2s ease-in-out",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#2563EB",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                    }}
                  >
                    {block.blockName}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: occupancyColor, my: 1 }}
                  >
                    {block.occupancyPercentageToday.toFixed(2)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B" }}>
                    {block.occupiedBedsToday}/{block.totalBeds}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Collapse>
    </Paper>
  );
};

// Componente para la ocupación principal con dos filas
const OccupancyMainCard = ({ occupancyData, standardData }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      height: "100%",
      border: "1px solid #E2E8F0",
      backgroundColor: "#FFFFFF",
    }}
  >
    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#1E293B" }}>
      Ocupación de Camas
    </Typography>

    {/* Primera fila: Ocupación total con barra de progreso */}
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1E293B" }}>
          {occupancyData.display}
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748B" }}>
          {occupancyData.occupied} / {occupancyData.total} camas
        </Typography>
      </Box>

      {/* Barra de progreso personalizada */}
      <Box sx={{ position: "relative" }}>
        <LinearProgress
          variant="determinate"
          value={occupancyData.percentage}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: "#E2E8F0",
            "& .MuiLinearProgress-bar": {
              borderRadius: 6,
              backgroundColor:
                occupancyData.percentage >= 80
                  ? "#10B981"
                  : occupancyData.percentage >= 60
                    ? "#F59E0B"
                    : "#EF4444",
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: `${Math.min(occupancyData.percentage, 95)}%`,
            transform: "translateY(-50%)",
            ml: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#1E293B",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            {occupancyData.display}
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Segunda fila: Cards de estándares horizontales */}
    <Box>
      {/* <Typography variant="subtitle2" sx={{ mb: 2, color: '#64748B', fontWeight: 600 }}>
                Ocupación por Estándar
            </Typography> */}
      <Grid container spacing={2}>
        {standardData.slice(0, 3).map((item, index) => (
          <Grid item xs={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                textAlign: "center",
                "&:hover": {
                  backgroundColor: "#F1F5F9",
                  borderColor: item.color,
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: item.color,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1E293B",
                  my: 1,
                }}
              >
                {item.percentage}%
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748B" }}>
                {item.occupied}/{item.available}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Paper>
);

const StatCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "100%",
    }}
  >
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
    </Box>
    <Box sx={{ color }}>{icon}</Box>
  </Paper>
);

const SmallStatCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    <Box sx={{ color, mb: 1 }}>{icon}</Box>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h6" fontWeight="bold">
      {value}
    </Typography>
  </Paper>
);

function DashboardTest() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [contractors, setContractors] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState("");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("7");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // disabled rooms
  const [isLostBedsSidebarOpen, setIsLostBedsSidebarOpen] = useState(false);
  const [isBlockOccupancySidebarOpen, setIsBlockOccupancySidebarOpen] =
    useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  // Nuevos estados para colapsar las secciones
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isBlockOccupancyExpanded, setIsBlockOccupancyExpanded] =
    useState(false);

  // Verificar si el usuario es admin
  const isAdmin =
    user?.role === "Sentry_Admin" ||
    (Array.isArray(user?.role) && user?.role.includes("Sentry_Admin"));

  useEffect(() => {
    const fetchDashboardData = async (companyId = null) => {
      try {
        setLoading(true);
        const response = await getDashboardTest(companyId);
        if (response.succeeded) {
          setDashboardData(response.data);
        } else {
          setError(
            response.message[0] || "Error al obtener datos del dashboard",
          );
        }
      } catch (err) {
        setError("Error al conectar con el servidor");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch dashboard data with selected contractor
    const contractorId = selectedContractor || null;
    fetchDashboardData(contractorId);
  }, [selectedContractor]);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const response = await getContractors();
      if (response.succeeded) {
        setContractors(response.data);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  const handleContractorChange = (event) => {
    setSelectedContractor(event.target.value);
  };

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };
  const handleOpenLostBedsSidebar = () => {
    setIsLostBedsSidebarOpen(true);
  };
  const handleCloseLostBedsSidebar = () => {
    setIsLostBedsSidebarOpen(false);
  };
  const handleOpenBlockOccupancySidebar = (blockId: number) => {
    setSelectedBlockId(blockId);
    setIsBlockOccupancySidebarOpen(true);
  };
  const handleCloseBlockOccupancySidebar = () => {
    setIsBlockOccupancySidebarOpen(false);
    setSelectedBlockId(null);
  };

  // Componente de skeleton para loading
  const DashboardSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* KPIs skeleton */}
        <Grid item xs={12}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        </Grid>

        {/* Métricas operativas skeleton */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Chart skeleton */}
        <Grid item xs={12}>
          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `${context.parsed.y} Desbloqueados`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
        },
        min: 0,
        max: 60,
        stepSize: 10,
      },
    },
  };

  if (loading) {
    return (
      <Root
        header={
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
              <h2 className="text-2xl font-bold">Panel de Control</h2>
            </div>
            <Skeleton
              variant="rectangular"
              width={300}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          </div>
        }
        content={<DashboardSkeleton />}
      />
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // KPIs principales refactorizados
  const mainKPIs = [
    {
      icon: <CampingIcon />,
      title: "Campamentos",
      value: dashboardData?.totalCamps.toString() || "0",
      color: "#2563EB",
    },
    isAdmin && {
      icon: <BusinessIcon />,
      title: "Contratistas",
      value: dashboardData?.totalCompanies.toString() || "0",
      color: "#10B981",
    },
    {
      icon: <MeetingRoomIcon />,
      title: "Habitaciones",
      value: dashboardData?.totalRooms.toString() || "0",
      color: "#F59E0B",
    },
    {
      icon: <EventIcon />,
      title: "Reservas",
      value: dashboardData?.totalReservations.toString() || "0",
      color: "#EF4444",
    },
  ].filter(Boolean);

  // Cálculos para ocupación principal usando tagDetails y occupancySummary
  const occupancyMainData = (() => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Buscar datos de ocupación para hoy desde occupancySummary
    const todayOccupancy =
      dashboardData?.occupancySummary?.dailyOccupancy?.find(
        (day) => new Date(day.date).toISOString().split("T")[0] === dateStr,
      );

    if (!todayOccupancy || !dashboardData?.tagDetails) {
      return {
        percentage: 0,
        occupied: 0,
        total: 0,
        display: "0%",
      };
    }

    // Calcular total de camas habilitadas desde tagDetails (totalBeds - lostBeds)
    const totalEnabledBeds = dashboardData.tagDetails.reduce(
      (sum, tagDetail) => sum + (tagDetail.enabledBeds - tagDetail.lostBeds),
      0,
    );

    // Usar camas ocupadas desde occupancySummary
    const occupiedBeds = todayOccupancy.occupiedBeds || 0;

    // Calcular porcentaje sobre camas habilitadas
    const percentage =
      totalEnabledBeds > 0 ? (occupiedBeds * 100) / totalEnabledBeds : 0;

    return {
      percentage: Math.round(percentage * 10) / 10,
      occupied: occupiedBeds,
      total: totalEnabledBeds,
      display: `${Math.round(percentage * 10) / 10}%`,
    };
  })();

  // Métricas operativas refactorizadas usando tagDetails
  const operationalMetrics = [
    {
      icon: <MeetingRoomIcon />,
      title: "Habitaciones Deshabilitadas",
      value: (() => {
        const totalDisabledRooms =
          dashboardData?.tagDetails?.reduce(
            (sum, tagDetail) => sum + (tagDetail.disabledRooms || 0),
            0,
          ) || 0;
        return totalDisabledRooms.toString();
      })(),
      subtitle: (() => {
        const totalDisabledBeds =
          dashboardData?.tagDetails?.reduce(
            (sum, tagDetail) => sum + (tagDetail.disabledBeds || 0),
            0,
          ) || 0;
        return `${totalDisabledBeds} camas`;
      })(),
      color: "#64748B",
      onClick: handleOpenSidebar,
    },
    isAdmin && {
      icon: <LockIcon />,
      title: "Camas Perdidas por Estándar",
      value: (() => {
        const totalLostBeds =
          dashboardData?.tagDetails?.reduce(
            (sum, tagDetail) => sum + (tagDetail.lostBeds || 0),
            0,
          ) || 0;
        return totalLostBeds.toString();
      })(),
      subtitle: "Por cambio de categoría",
      color: "#F59E0B",
      onClick: handleOpenLostBedsSidebar,
    },
  ].filter(Boolean);

  // Datos formateados para el chart y lista de ocupación por estándar usando tagDetails y occupancySummary
  const standardOccupancyData = (() => {
    if (
      !dashboardData?.tagDetails ||
      !dashboardData?.occupancySummary?.capacityByTag
    ) {
      return [];
    }

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    return dashboardData.tagDetails
      .map((tagDetail) => {
        // Obtener datos de ocupación de hoy desde occupancySummary
        const todayTagOccupancy = dashboardData.occupancySummary.occupancyByTag[
          tagDetail.tag.toString()
        ]?.find(
          (day) => new Date(day.date).toISOString().split("T")[0] === dateStr,
        );

        // Calcular camas habilitadas (enabledBeds - lostBeds)
        const enabledBeds = tagDetail.enabledBeds - tagDetail.lostBeds;
        const occupiedBeds = todayTagOccupancy?.occupiedBeds || 0;

        // Calcular porcentaje sobre camas habilitadas
        const occupancyPercentage =
          enabledBeds > 0 ? (occupiedBeds * 100) / enabledBeds : 0;

        return {
          label: tagRoleMap[tagDetail.tag] || `Tag ${tagDetail.tag}`,
          percentage: Math.round(occupancyPercentage * 10) / 10,
          occupied: occupiedBeds,
          available: enabledBeds,
          tag: tagDetail.tag,
          color:
            tagDetail.tag === 0
              ? "#10B981"
              : tagDetail.tag === 1
                ? "#F59E0B"
                : "#8B5CF6",
        };
      })
      .sort((a, b) => b.tag - a.tag); // Ordenar por tag descendente (2, 1, 0)
  })();

  return (
    <>
      <Root
        header={
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
              <h2 className="text-2xl font-bold text-slate-800">
                Panel de Control
              </h2>
            </div>
            {isAdmin && contractors.length > 0 && (
              <FormControl variant="outlined" sx={{ minWidth: 300 }}>
                <InputLabel id="contractor-select-label">
                  Contratista
                </InputLabel>
                <Select
                  labelId="contractor-select-label"
                  id="contractor-select"
                  value={selectedContractor}
                  onChange={handleContractorChange}
                  label="Contratista"
                  size="medium"
                >
                  <MenuItem value="">
                    <em>Todos los contratistas</em>
                  </MenuItem>
                  {contractors.map((contractor) => (
                    <MenuItem key={contractor.id} value={contractor.id}>
                      {contractor.name ||
                        contractor.companyName ||
                        contractor.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        }
        content={
          <Box sx={{ p: 4, minHeight: "100vh" }}>
            <Grid container spacing={4}>
              {/* Fila 1: KPIs principales agrupados */}
              <Grid item xs={12}>
                <KPIGroupCard kpis={mainKPIs} />
              </Grid>

              {/* Fila 2: Ocupación principal - Ancho completo */}
              <Grid item xs={12}>
                <OccupancyMainCard
                  occupancyData={occupancyMainData}
                  standardData={standardOccupancyData}
                />
              </Grid>

              {/* Fila 3: Métricas operativas - Fila horizontal */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {operationalMetrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <OperationalMetricCard {...metric} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Fila 3: Chart temporal con filtros */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      cursor: "pointer",
                    }}
                    onClick={() => setIsChartExpanded(!isChartExpanded)}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#1E293B" }}
                    >
                      Ocupación de Camas - Próximos días
                    </Typography>
                    {isChartExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                  <Collapse in={isChartExpanded}>
                    <Box sx={{ position: "relative", height: 280 }}>
                      <Bar
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "top",
                              labels: {
                                usePointStyle: true,
                                color: "#64748B",
                              },
                            },
                            tooltip: {
                              mode: "index",
                              intersect: false,
                              backgroundColor: "#1E293B",
                              titleColor: "#F1F5F9",
                              bodyColor: "#F1F5F9",
                            },
                          },
                          scales: {
                            x: {
                              stacked: false,
                              grid: { display: false },
                              ticks: { color: "#64748B" },
                            },
                            y: {
                              stacked: false,
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Camas",
                                color: "#64748B",
                              },
                              grid: { color: "#F1F5F9" },
                              ticks: { color: "#64748B" },
                            },
                          },
                        }}
                        data={{
                          labels:
                            dashboardData?.occupancySummary?.dailyOccupancy
                              ?.slice(0, parseInt(selectedTimeFilter))
                              ?.map((day) =>
                                new Date(day.date).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "2-digit",
                                }),
                              ) || [],
                          datasets: [
                            {
                              label: "Total Camas",
                              data:
                                dashboardData?.occupancySummary?.dailyOccupancy
                                  ?.slice(0, parseInt(selectedTimeFilter))
                                  ?.map((day) => day.totalBeds) || [],
                              backgroundColor: "#2563EB20",
                              borderColor: "#2563EB",
                              borderWidth: 2,
                              borderRadius: 4,
                            },
                            {
                              label: "Camas Ocupadas",
                              data:
                                dashboardData?.occupancySummary?.dailyOccupancy
                                  ?.slice(0, parseInt(selectedTimeFilter))
                                  ?.map((day) => day.occupiedBeds) || [],
                              backgroundColor: "#10B98120",
                              borderColor: "#10B981",
                              borderWidth: 2,
                              borderRadius: 4,
                            },
                          ],
                        }}
                      />
                    </Box>
                  </Collapse>
                </Paper>
              </Grid>

              {/* Fila 4: Ocupación por Pabellones */}
              <Grid item xs={12}>
                <BlockOccupancyCard
                  blockData={
                    dashboardData?.occupancySummary?.blockOccupancy || []
                  }
                  onBlockClick={handleOpenBlockOccupancySidebar}
                  expanded={isBlockOccupancyExpanded}
                  onToggle={() =>
                    setIsBlockOccupancyExpanded(!isBlockOccupancyExpanded)
                  }
                />
              </Grid>
            </Grid>
          </Box>
        }
      />
      <DashboardDetailSidebar
        open={isSidebarOpen}
        onClose={handleCloseSidebar}
        selectedContractor={selectedContractor}
      />
      <LostBedsDetailSidebar
        open={isLostBedsSidebarOpen}
        onClose={handleCloseLostBedsSidebar}
        selectedContractor={selectedContractor}
      />
      <BlockOccupancyDetailSidebar
        open={isBlockOccupancySidebarOpen}
        onClose={handleCloseBlockOccupancySidebar}
        selectedBlockId={selectedBlockId}
      />
    </>
  );
}

export default DashboardTest;
