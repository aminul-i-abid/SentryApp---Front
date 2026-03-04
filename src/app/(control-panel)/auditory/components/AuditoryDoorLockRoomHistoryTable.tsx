import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getDoorLockRoomHistoryLogs } from "../auditoryService";
import { DoorLockRoomHistoryDto } from "../models/DoorLockRoomHistoryDto";

const AuditoryDoorLockRoomHistoryTable = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [data, setData] = useState<DoorLockRoomHistoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDoorLockRoomHistoryLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching door lock room history logs:", error);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES");
  };

  const columns = useMemo<TableColumnDef<DoorLockRoomHistoryDto>[]>(
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
            {row.roomNumber || "N/A"}
          </Typography>
        ),
      },
      {
        id: "doorLockId",
        label: "Chapa",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.doorLockId}
          </Typography>
        ),
      },
      {
        id: "comments",
        label: "Comentarios",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.comments || "N/A"}
          </Typography>
        ),
      },
      {
        id: "action",
        label: "Acción",
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
            {formatDateTime(row.date)}
          </Typography>
        ),
      },
      {
        id: "userName",
        label: "Usuario",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.userName || row.user || "N/A"}
          </Typography>
        ),
      },
      {
        id: "nameCreatedBy",
        label: "Creado por",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.nameCreatedBy || row.createdBy || "N/A"}
          </Typography>
        ),
      },
      {
        id: "created",
        label: "Fecha creación",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDateTime(row.created)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <StyledTable<DoorLockRoomHistoryDto>
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
        minWidth={1400}
      />
      <RoomDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        roomId={selectedRoomId}
      />
    </>
  );
};

export default AuditoryDoorLockRoomHistoryTable;
