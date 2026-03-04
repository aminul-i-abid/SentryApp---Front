import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Routes, buildRoute } from "@/utils/routesEnum";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getBlocksLogs } from "../auditoryService";
import { BlockLogDto } from "../models/BlockLogDto";

const AuditoryBlockTable = () => {
  const [data, setData] = useState<BlockLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBlocksLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching block logs:", error);
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
    filters.blockId,
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

  const columns = useMemo<TableColumnDef<BlockLogDto>[]>(
    () => [
      {
        id: "blockName",
        label: "Bloque",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.blockId ? "pointer" : "default",
              color: row.blockId ? "#0A74DA" : "inherit",
              textDecoration: row.blockId ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.blockId ? 500 : "inherit",
            }}
            onClick={() => {
              if (row.blockId) {
                const url = buildRoute(Routes.CAMPS_BLOCK_ROOM, {
                  id: String(row.blockId),
                });
                window.open(url, "_blank");
              }
            }}
          >
            {row.blockName || "-"}
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
              fontWeight: row.campId ? 500 : "inherit",
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
            {row.campName || "-"}
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
    <StyledTable<BlockLogDto>
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

export default AuditoryBlockTable;
