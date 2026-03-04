import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getSmsLogs } from "../auditoryService";
import { SmsLogDto } from "../models/SmsLogDto";

const AuditorySmsTable = () => {
  const [data, setData] = useState<SmsLogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);

  const filters = useSelector((state: RootState) => state.auditoryFilters);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getSmsLogs(page + 1, rowsPerPage);
      setData(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching SMS logs:", error);
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
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = useMemo<TableColumnDef<SmsLogDto>[]>(
    () => [
      {
        id: "reservationGuestId",
        label: "Reserva",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.reservationGuestId || "-"}
          </Typography>
        ),
      },
      {
        id: "userName",
        label: "Usuario",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.userName || row.userId || "-"}
          </Typography>
        ),
      },
      {
        id: "roomNumber",
        label: "Habitación",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.roomNumber || "-"}
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
        id: "message",
        label: "Mensaje",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.message || "-"}
          </Typography>
        ),
      },
      {
        id: "status",
        label: "Estado",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {row.status || "-"}
          </Typography>
        ),
      },
      {
        id: "actionDateTime",
        label: "Fecha Acción",
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
            {formatDate(row.actionDateTime)}
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
    <StyledTable<SmsLogDto>
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
      minWidth={1300}
    />
  );
};

export default AuditorySmsTable;
