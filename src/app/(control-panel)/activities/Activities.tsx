import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import RowActionMenu from "@/components/ui/RowActionMenu";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import authRoles from "@auth/authRoles";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SearchIcon from "@mui/icons-material/Search";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Routes, buildRoute } from "src/utils/routesEnum";
import { getActivities } from "./activitiesService";
import { ActivityResponse, ConcurrencyType } from "./models/Activity";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
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
  },
}));

function Activities() {
  const { t } = useTranslation("activities");
  const { authState } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<
    ActivityResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const isAdmin =
    authState?.user?.role &&
    authRoles.admin.includes(authState.user.role as string);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getActivities();
      if (response.succeeded && response.data) {
        setActivities(response.data);
        setFilteredActivities(response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((activity) =>
        statusFilter === "active" ? activity.isActive : !activity.isActive,
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.name.toLowerCase().includes(query) ||
          activity.description.toLowerCase().includes(query) ||
          activity.location?.toLowerCase().includes(query),
      );
    }

    setFilteredActivities(filtered);
  }, [activities, statusFilter, searchQuery]);

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as "all" | "active" | "inactive");
  };

  const handleCreateNew = () => {
    navigate(buildRoute(Routes.ACTIVITIES_DETAIL, { id: "new" }));
  };

  const handleEdit = (id: number) => {
    navigate(buildRoute(Routes.ACTIVITIES_DETAIL, { id: id.toString() }));
  };

  const handleBook = (id: number) => {
    navigate(buildRoute(Routes.ACTIVITIES_BOOKING, { id: id.toString() }));
  };

  const getConcurrencyIcon = (type: ConcurrencyType) => {
    return type === ConcurrencyType.ExclusiveTime ? (
      <SportsTennisIcon fontSize="small" />
    ) : (
      <FitnessCenterIcon fontSize="small" />
    );
  };

  const getConcurrencyLabel = (type: ConcurrencyType) => {
    return type === ConcurrencyType.ExclusiveTime
      ? t("types.exclusive")
      : t("types.shared");
  };

  const columns: TableColumnDef<ActivityResponse>[] = [
    {
      id: "name",
      label: t("table.name"),
      render: (row) => (
        <Box className="flex items-center gap-2">
          {getConcurrencyIcon(row.concurrencyType)}
          <div>
            <Typography variant="body2" className="font-semibold">
              {row.name}
            </Typography>
            {row.location && (
              <Typography variant="caption" color="textSecondary">
                {row.location}
              </Typography>
            )}
          </div>
        </Box>
      ),
    },
    {
      id: "type",
      label: t("table.type"),
      render: (row) => (
        <Chip
          label={getConcurrencyLabel(row.concurrencyType)}
          size="small"
          color={
            row.concurrencyType === ConcurrencyType.ExclusiveTime
              ? "primary"
              : "secondary"
          }
          variant="outlined"
        />
      ),
    },
    {
      id: "capacity",
      label: t("table.capacity"),
      render: (row) => <>{row.maxCapacityTotal}</>,
    },
    {
      id: "schedule",
      label: t("table.schedule"),
      render: (row) => (
        <Typography variant="caption">
          {row.startTime} - {row.endTime}
        </Typography>
      ),
    },
    {
      id: "status",
      label: t("table.status"),
      render: (row) => (
        <Chip
          label={row.isActive ? t("status.active") : t("status.inactive")}
          size="small"
          color={row.isActive ? "success" : "default"}
        />
      ),
    },
  ];

  return (
    <Root
      header={
        <div className="p-6 flex items-center justify-between">
          {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
          <div>
            <Typography variant="h5" className="font-bold">
              {t("title")}
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              {t("subtitle")}
            </Typography>
          </div>
        </div>
      }
      content={
        <div className="p-6">
          {/* Filters and Search */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              p: 2,
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <TextField
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F5F7FA",
                  borderRadius: "10px",
                  "& fieldset": { border: "1px solid #E5E7EB" },
                  "&:hover fieldset": { borderColor: "#d0d5dd" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#415EDE",
                    borderWidth: "1.5px",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF" }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", md: 200 },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F5F7FA",
                  borderRadius: "10px",
                  "& fieldset": { border: "1px solid #E5E7EB" },
                  "&:hover fieldset": { borderColor: "#d0d5dd" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#415EDE",
                    borderWidth: "1.5px",
                  },
                },
              }}
            >
              <InputLabel>{t("filter.all")}</InputLabel>
              <Select
                value={statusFilter}
                label={t("filter.all")}
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">{t("filter.all")}</MenuItem>
                <MenuItem value="active">{t("filter.active")}</MenuItem>
                <MenuItem value="inactive">{t("filter.inactive")}</MenuItem>
              </Select>
            </FormControl>

            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  "&:hover": { boxShadow: "0 2px 8px rgba(65,94,222,0.3)" },
                }}
              >
                {t("addNew")}
              </Button>
            )}
          </Box>

          {/* Activities Table */}
          <StyledTable<ActivityResponse>
            columns={columns}
            data={filteredActivities}
            getRowId={(row) => row.id.toString()}
            loading={loading}
            loadingMessage="Cargando actividades..."
            emptyMessage={t("errors.notFoundActivities")}
            onRowClick={(row) => handleEdit(row.id)}
            renderActions={(row) => (
              <RowActionMenu
                onView={() => handleEdit(row.id)}
                menuItems={[
                  {
                    key: "book",
                    label: t("table.book") || "Reservar",
                    icon: <BookmarkAddIcon fontSize="small" />,
                    onClick: () => handleBook(row.id),
                    hidden: !row.isActive,
                  },
                ]}
              />
            )}
            actionsLabel={t("table.actions")}
          />
        </div>
      }
    />
  );
}

export default Activities;
