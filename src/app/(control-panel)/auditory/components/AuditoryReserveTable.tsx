import ReserveDetailSidebar from "@/app/(control-panel)/reserve/component/ReserveDetailSidebar";
import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Routes, buildRoute } from "@/utils/routesEnum";
import { Chip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getReservationsLogs } from "../auditoryService";
import { ReserveLogDto } from "../models/ReserveLogDto";

const AuditoryReserveTable = () => {
  const [roomSidebarOpen, setRoomSidebarOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [reserveSidebarOpen, setReserveSidebarOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(
    null,
  );
  const [data, setData] = useState<ReserveLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async (pageNumber: number = 1, pageSize: number = 15) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReservationsLogs(pageNumber, pageSize);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (err: any) {
      setError("Error loading reservation audit data");
      console.error("Error fetching reserve logs:", err);
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

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getActivityColor = (
    activity: string | null,
  ): "success" | "warning" | "error" | "default" => {
    switch (activity?.toLowerCase()) {
      case "create":
      case "created":
        return "success";
      case "update":
      case "updated":
        return "warning";
      case "delete":
      case "deleted":
        return "error";
      default:
        return "default";
    }
  };

  const columns = useMemo<TableColumnDef<ReserveLogDto>[]>(
    () => [
      {
        id: "guid",
        label: "Bulk ID",
        width: "120px",
        render: (row) => {
          const isClickable = row.guid && row.idBulkReservation;
          return (
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.8rem",
                cursor: isClickable ? "pointer" : "default",
                color: isClickable ? "#0A74DA" : "inherit",
                textDecoration: isClickable ? "underline" : "none",
                textUnderlineOffset: "2px",
                fontWeight: isClickable ? 600 : "inherit",
                "&:hover": isClickable ? { opacity: 0.8 } : {},
              }}
              onClick={() => {
                if (isClickable) {
                  const url = buildRoute(Routes.RESERVE_BULK, {
                    id: String(row.idBulkReservation),
                  });
                  window.open(url, "_blank");
                }
              }}
            >
              {row.guid || "-"}
            </Typography>
          );
        },
      },
      {
        id: "nameGuest",
        label: "Reserva",
        width: "200px",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.idReservation ? "pointer" : "default",
              color: row.idReservation ? "#0A74DA" : "inherit",
              textDecoration: row.idReservation ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.idReservation ? 600 : "inherit",
              "&:hover": row.idReservation ? { opacity: 0.8 } : {},
            }}
            onClick={() => {
              if (row.idReservation) {
                setSelectedReserveId(row.idReservation);
                setReserveSidebarOpen(true);
              }
            }}
          >
            {row.idReservation
              ? `${row.idReservation} - ${row.nameGuest}`
              : row.nameGuest || "-"}
          </Typography>
        ),
      },
      {
        id: "roomAssigned",
        label: "Habitación Asignada",
        width: "140px",
        align: "center",
        render: (row) => (
          <Chip
            label={row.roomAssigned ? "Sí" : "No"}
            color={row.roomAssigned ? "success" : "error"}
            size="small"
          />
        ),
      },
      {
        id: "roomNumber",
        label: "Habitación",
        width: "110px",
        render: (row) => (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.8rem",
              cursor: row.idRoom ? "pointer" : "default",
              color: row.idRoom ? "#0A74DA" : "inherit",
              textDecoration: row.idRoom ? "underline" : "none",
              textUnderlineOffset: "2px",
              fontWeight: row.idRoom ? 600 : "inherit",
              "&:hover": row.idRoom ? { opacity: 0.8 } : {},
            }}
            onClick={() => {
              if (row.idRoom) {
                setSelectedRoomId(row.idRoom);
                setRoomSidebarOpen(true);
              }
            }}
          >
            {row.roomNumber || "-"}
          </Typography>
        ),
      },
      {
        id: "checkIn",
        label: "Check In",
        width: "110px",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDateOnly(row.checkIn)}
          </Typography>
        ),
      },
      {
        id: "checkOut",
        label: "Check Out",
        width: "110px",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDateOnly(row.checkOut)}
          </Typography>
        ),
      },
      {
        id: "activityEnumDescription",
        label: "Acción",
        width: "100px",
        align: "center",
        render: (row) => (
          <Chip
            label={row.activityEnumDescription || "N/A"}
            color={getActivityColor(row.activityEnumDescription)}
            size="small"
          />
        ),
      },
      {
        id: "created",
        label: "Fecha",
        width: "150px",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDate(row.created)}
          </Typography>
        ),
      },
      {
        id: "nameCreatedBy",
        label: "Creado por",
        width: "180px",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.nameCreatedBy || row.createdBy || "-"}
          </Typography>
        ),
      },
    ],
    [],
  );

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <StyledTable<ReserveLogDto>
        columns={columns}
        data={data}
        getRowId={(row) => String(row.id)}
        loading={loading}
        loadingMessage="Cargando datos..."
        emptyMessage={error || "No se encontraron datos de auditoría"}
        pagination={{
          count: totalCount,
          page,
          rowsPerPage,
          onPageChange: handlePageChange,
        }}
        minWidth={1300}
      />
      <RoomDetailSidebar
        open={roomSidebarOpen}
        onClose={() => setRoomSidebarOpen(false)}
        roomId={selectedRoomId}
      />
      <ReserveDetailSidebar
        open={reserveSidebarOpen}
        onClose={() => setReserveSidebarOpen(false)}
        reserveId={selectedReserveId}
      />
    </>
  );
};

export default AuditoryReserveTable;
