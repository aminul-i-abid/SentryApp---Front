import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Routes, buildRoute } from "@/utils/routesEnum";
import { Chip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getRoomLogs } from "../auditoryService";
import { RoomLogDto } from "../models/RoomLogDto";

const AuditoryRoomTable = () => {
  const [data, setData] = useState<RoomLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRoomLogs(page + 1, rowsPerPage);
      if (response.succeeded && response.data) {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching room logs:", error);
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
    filters.roomId,
    filters.blockId,
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
    status: number,
  ): "error" | "success" | "warning" | "default" => {
    switch (status) {
      case 0:
        return "error";
      case 1:
        return "success";
      case 2:
        return "warning";
      default:
        return "default";
    }
  };

  const columns = useMemo<TableColumnDef<RoomLogDto>[]>(
    () => [
      {
        id: "roomNumber",
        label: "Habitación",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.roomId ? "pointer" : "default",
              color: row.roomId ? "#0A74DA" : "inherit",
              textDecoration: row.roomId ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.roomId ? 600 : "inherit",
            }}
            onClick={() => {
              if (row.roomId) {
                setSelectedRoomId(row.roomId);
                setSidebarOpen(true);
              }
            }}
          >
            {row.roomNumber || "-"}
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
            sx={{ fontSize: "0.8rem" }}
          >
            {row.message || "-"}
          </Typography>
        ),
      },
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
              fontWeight: row.blockId ? 600 : "inherit",
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
        id: "statusDescription",
        label: "Estado",
        render: (row) => (
          <Chip
            label={row.statusDescription || "Sin estado"}
            color={getStatusColor(row.status)}
            size="small"
          />
        ),
      },
      {
        id: "activityEnumDescription",
        label: "Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || "-"}
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
    <>
      <StyledTable<RoomLogDto>
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
      <RoomDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomId={selectedRoomId}
      />
    </>
  );
};

export default AuditoryRoomTable;
