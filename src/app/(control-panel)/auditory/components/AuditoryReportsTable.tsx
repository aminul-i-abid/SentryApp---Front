import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getReportsLogs } from "../auditoryService";
import { ReportLogDto } from "../models/ReportLogDto";

const AuditoryReportsTable = () => {
  const [data, setData] = useState<ReportLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getReportsLogs(page + 1, rowsPerPage);
      if (response.succeeded && response.data) {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching reports logs:", error);
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
    return new Date(dateString).toLocaleString("es-ES");
  };

  const columns = useMemo<TableColumnDef<ReportLogDto>[]>(
    () => [
      {
        id: "id",
        label: "ID",
        width: "80px",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.id}
          </Typography>
        ),
      },
      {
        id: "activityEnum",
        label: "Actividad",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || row.activityEnum}
          </Typography>
        ),
      },
      {
        id: "activityEnumDescription",
        label: "Descripción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || "-"}
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
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.message || ""}
          >
            {row.message || "-"}
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
    <StyledTable<ReportLogDto>
      columns={columns}
      data={data}
      getRowId={(row) => String(row.id)}
      loading={loading}
      emptyMessage="No se encontraron registros"
      pagination={{
        count: totalCount,
        page,
        rowsPerPage,
        onPageChange: (_e, newPage) => setPage(newPage),
      }}
    />
  );
};

export default AuditoryReportsTable;
