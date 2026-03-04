import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Routes, buildRoute } from "@/utils/routesEnum";
import { Chip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCampsLogs } from "../auditoryService";
import { CampLogDto } from "../models/CampLogDto";

const AuditoryCampTable = () => {
  const [data, setData] = useState<CampLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCampsLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching camp logs:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    page,
    rowsPerPage,
    filters.fechaDesde,
    filters.fechaHasta,
    filters.campId,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (
    status: string,
  ): "success" | "error" | "warning" | "default" => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
        return "success";
      case "error":
      case "failed":
        return "error";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = useMemo<TableColumnDef<CampLogDto>[]>(
    () => [
      {
        id: "campName",
        label: "Campamento",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.campId ? "pointer" : "default",
              color: row.campId ? "#0A74DA" : "inherit",
              textDecoration: row.campId ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.campId ? 600 : 500,
            }}
            onClick={() => {
              if (row.campId) {
                const url = buildRoute(Routes.CAMPS_DETAIL, {
                  id: String(row.campId),
                });
                window.open(url, "_blank");
              }
            }}
          >
            {row.campName || "N/A"}
          </Typography>
        ),
      },
      {
        id: "message",
        label: "Mensaje",
        render: (row) => (
          <Typography
            variant="body2"
            noWrap
            title={row.message || ""}
            sx={{ fontSize: "0.8rem", maxWidth: 300 }}
          >
            {row.message || "N/A"}
          </Typography>
        ),
      },
      {
        id: "activityEnumDescription",
        label: "Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || row.activityEnum || "N/A"}
          </Typography>
        ),
      },
      {
        id: "status",
        label: "Estado",
        render: (row) => (
          <Chip
            label={row.statusDescription || row.status}
            color={getStatusColor(row.status)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        id: "created",
        label: "Fecha",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDate(row.created)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <StyledTable<CampLogDto>
      columns={columns}
      data={data}
      getRowId={(row) => String(row.id)}
      loading={loading}
      emptyMessage="No hay datos disponibles"
      pagination={{
        count: totalCount,
        page,
        rowsPerPage,
        onPageChange: (_e, newPage) => setPage(newPage),
      }}
    />
  );
};

export default AuditoryCampTable;
