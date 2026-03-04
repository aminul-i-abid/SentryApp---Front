import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getRoomDisabledStatesLogs } from "../auditoryService";
import { RoomDisabledHistoryDto } from "../models/RoomDisabledHistoryDto";

const AuditoryRoomDisabledHistoryTable = () => {
  const [data, setData] = useState<RoomDisabledHistoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRoomDisabledStatesLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching room disabled history:", error);
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

  const columns = useMemo<TableColumnDef<RoomDisabledHistoryDto>[]>(
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
            {row.roomNumber || `Habitación ${row.roomId}`}
          </Typography>
        ),
      },
      {
        id: "comments",
        label: "Comentarios",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.comments || "-"}
          </Typography>
        ),
      },
      {
        id: "action",
        label: "Deshabilitada",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.action}
          </Typography>
        ),
      },
      {
        id: "date",
        label: "Fecha",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDate(row.date)}
          </Typography>
        ),
      },
      {
        id: "createdBy",
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
      <StyledTable<RoomDisabledHistoryDto>
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
      <RoomDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomId={selectedRoomId}
      />
    </>
  );
};

export default AuditoryRoomDisabledHistoryTable;
