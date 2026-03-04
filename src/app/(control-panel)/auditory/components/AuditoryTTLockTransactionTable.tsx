import ReserveDetailSidebar from "@/app/(control-panel)/reserve/component/ReserveDetailSidebar";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Alert, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getTTLockTransactionsLogs } from "../auditoryService";
import { TtlockTransactionLogDto } from "../models/TtlockTransactionLogDto";

const AuditoryTTLockTransactionTable = () => {
  const [data, setData] = useState<TtlockTransactionLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReserveId, setSelectedReserveId] = useState<number | null>(
    null,
  );

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTTLockTransactionsLogs(page + 1, rowsPerPage);

      if (response.succeeded && response.data) {
        setData(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.message?.join(", ") || "Error al cargar los datos");
        setData([]);
        setTotalCount(0);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setData([]);
      setTotalCount(0);
      console.error("Error fetching TTLock transaction logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters.fechaDesde, filters.fechaHasta]);

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [filters.fechaDesde, filters.fechaHasta]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("es-ES");
    } catch {
      return dateString;
    }
  };

  const columns = useMemo<TableColumnDef<TtlockTransactionLogDto>[]>(
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
        id: "idReservation",
        label: "Reserva",
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
            }}
            onClick={() => {
              if (row.idReservation) {
                setSelectedReserveId(row.idReservation);
                setSidebarOpen(true);
              }
            }}
          >
            {row.idReservation && row.nameReservation
              ? `${row.idReservation} - ${row.nameReservation}`
              : "-"}
          </Typography>
        ),
      },
      {
        id: "status",
        label: "Estado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.statusDescription || row.status || "-"}
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
              maxWidth: 200,
            }}
            title={row.message || "-"}
          >
            {row.message || "-"}
          </Typography>
        ),
      },
      {
        id: "pin",
        label: "PIN",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.pin || "-"}
          </Typography>
        ),
      },
      {
        id: "activityEnum",
        label: "Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.activityEnumDescription || row.activityEnum || "-"}
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
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <StyledTable<TtlockTransactionLogDto>
        columns={columns}
        data={data}
        getRowId={(row) => String(row.id)}
        loading={loading}
        emptyMessage="No se encontraron datos"
        pagination={{
          count: totalCount,
          page,
          rowsPerPage,
          onPageChange: (_e, newPage) => setPage(newPage),
        }}
      />
      <ReserveDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        reserveId={selectedReserveId}
      />
    </>
  );
};

export default AuditoryTTLockTransactionTable;
