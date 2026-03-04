import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getDoorLockAccessLogs } from "../auditoryService";
import { DoorLockAccessLogDto } from "../models/DoorLockAccessLogDto";

const AuditoryDoorLockAccessLogsTable = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [data, setData] = useState<DoorLockAccessLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDoorLockAccessLogs(page + 1, rowsPerPage);
      setData(response.data.items || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching door lock access logs:", error);
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
    filters.success,
  ]);

  const getUserDisplayName = (row: DoorLockAccessLogDto) => {
    if (row.guestInfo) {
      return `${row.guestInfo.guestFirstName} ${row.guestInfo.guestLastName}`;
    }
    return row.username;
  };

  const columns = useMemo<TableColumnDef<DoorLockAccessLogDto>[]>(
    () => [
      {
        id: "roomName",
        label: "Habitación",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: "pointer",
              color: "#0A74DA",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              fontWeight: 600,
            }}
            onClick={() => {
              setSelectedRoomId(row.roomId);
              setSidebarOpen(true);
            }}
          >
            {row.roomName}
          </Typography>
        ),
      },
      {
        id: "recordTypeStr",
        label: "Acción",
        render: (row) => (
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, fontSize: "0.8rem" }}
            >
              {row.recordTypeStr}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.7rem" }}
            >
              {row.recordTypeFromLockStr}
            </Typography>
          </Box>
        ),
      },
      {
        id: "accessStatus",
        label: "Resultado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.accessStatus}
          </Typography>
        ),
      },
      {
        id: "serverDate",
        label: "Fecha de la acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.serverDate}
          </Typography>
        ),
      },
      {
        id: "username",
        label: "Usuario",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {getUserDisplayName(row)}
          </Typography>
        ),
      },
      {
        id: "keyboardPwd",
        label: "PIN utilizado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.keyboardPwd}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <StyledTable<DoorLockAccessLogDto>
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

export default AuditoryDoorLockAccessLogsTable;
