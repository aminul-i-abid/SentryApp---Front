import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Routes, buildRoute } from "@/utils/routesEnum";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCompaniesLogs } from "../auditoryService";
import { CompanyLogDto } from "../models/CompanyLogDto";

const AuditoryCompanyTable = () => {
  const [data, setData] = useState<CompanyLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async (p0: number, rowsPerPage: number) => {
    setLoading(true);
    try {
      const response = await getCompaniesLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching company logs:", error);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page + 1, rowsPerPage);
  }, [
    page,
    rowsPerPage,
    filters.fechaDesde,
    filters.fechaHasta,
    filters.companyId,
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

  const columns = useMemo<TableColumnDef<CompanyLogDto>[]>(
    () => [
      {
        id: "companyName",
        label: "Compañía",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.companyId ? "pointer" : "default",
              color: row.companyId ? "#0A74DA" : "inherit",
              textDecoration: row.companyId ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.companyId ? 600 : "inherit",
            }}
            onClick={() => {
              if (row.companyId) {
                const url = buildRoute(Routes.CONTRACTORS_DETAIL, {
                  id: String(row.companyId),
                });
                window.open(url, "_blank");
              }
            }}
          >
            {row.companyName || "-"}
          </Typography>
        ),
      },
      {
        id: "message",
        label: "Mensaje",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.message || "-"}
          </Typography>
        ),
      },
      {
        id: "activityEnumDescription",
        label: "Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || row.activityEnum || "-"}
          </Typography>
        ),
      },
      {
        id: "statusDescription",
        label: "Estado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.statusDescription || row.status || "-"}
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
    <StyledTable<CompanyLogDto>
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

export default AuditoryCompanyTable;
