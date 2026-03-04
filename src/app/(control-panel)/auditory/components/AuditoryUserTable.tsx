import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserLogs } from "../auditoryService";
import { UserLogDto } from "../models/UserLogDto";

const AuditoryUserTable = () => {
  const [data, setData] = useState<UserLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getUserLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching user logs:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = useMemo<TableColumnDef<UserLogDto>[]>(
    () => [
      {
        id: "userName",
        label: "Usuario",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.userName || row.userId}
          </Typography>
        ),
      },
      {
        id: "activityEnumDescription",
        label: "Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || row.activityEnum}
          </Typography>
        ),
      },
      {
        id: "statusDescription",
        label: "Estado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.statusDescription || row.status}
          </Typography>
        ),
      },
      {
        id: "message",
        label: "Mensaje",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {row.message || "-"}
          </Typography>
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
      {
        id: "nameCreatedBy",
        label: "Creado por",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.nameCreatedBy || row.createdBy || "-"}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <StyledTable<UserLogDto>
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

export default AuditoryUserTable;
