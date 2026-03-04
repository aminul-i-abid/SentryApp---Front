import ReserveDetailSidebar from "@/app/(control-panel)/reserve/component/ReserveDetailSidebar";
import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getWhatsappLogs } from "../auditoryService";
import { WhatsappLogDto } from "../models/WhatsappLogDto";

const AuditoryWhatsappTable = () => {
  const [data, setData] = useState<WhatsappLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [reserveSidebarOpen, setReserveSidebarOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(
    null,
  );
  const [roomSidebarOpen, setRoomSidebarOpen] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(
    null,
  );

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getWhatsappLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching WhatsApp logs:", error);
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

  const columns = useMemo<TableColumnDef<WhatsappLogDto>[]>(
    () => [
      {
        id: "reservationId",
        label: "Reserva",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.reservationId ? "pointer" : "default",
              color: row.reservationId ? "#0A74DA" : "inherit",
              textDecoration: row.reservationId ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.reservationId ? 600 : "inherit",
            }}
            onClick={() => {
              if (row.reservationId) {
                setSelectedReserveId(row.reservationId);
                setReserveSidebarOpen(true);
              }
            }}
          >
            {row.reservationId
              ? row.reservationId + " - " + row.nameReservation
              : "-"}
          </Typography>
        ),
      },
      {
        id: "phoneNumber",
        label: "Teléfono",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.phoneNumber || "-"}
          </Typography>
        ),
      },
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
                setSelectedRoomNumber(row.roomId.toString());
                setRoomSidebarOpen(true);
              }
            }}
          >
            {row.roomNumber || "-"}
          </Typography>
        ),
      },
      {
        id: "status",
        label: "Estado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.status}
          </Typography>
        ),
      },
      {
        id: "message",
        label: "Mensaje",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem" }}
            title={row.message || ""}
          >
            {row.message
              ? row.message.length > 50
                ? `${row.message.substring(0, 50)}...`
                : row.message
              : "-"}
          </Typography>
        ),
      },
      {
        id: "actionDateTime",
        label: "Fecha Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {new Date(row.actionDateTime).toLocaleString("es-ES")}
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
      <StyledTable<WhatsappLogDto>
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
      <ReserveDetailSidebar
        open={reserveSidebarOpen}
        onClose={() => setReserveSidebarOpen(false)}
        reserveId={selectedReserveId}
      />
      <RoomDetailSidebar
        open={roomSidebarOpen}
        onClose={() => setRoomSidebarOpen(false)}
        roomId={selectedRoomNumber ? Number(selectedRoomNumber) : null}
      />
    </>
  );
};

export default AuditoryWhatsappTable;
